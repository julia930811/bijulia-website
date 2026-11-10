import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./supabase.env.js?v=2";

const FULL_COLUMNS = "id, email, role, created_at, name, phone, address, tier, purchase_history";
const CORE_COLUMNS = "id, email, role, created_at";

let clientPromise = null;
let session = null;
let profile = null;
const listeners = new Set();

function clean(value) {
  return String(value || "").trim();
}

export function isConfigured() {
  const url = clean(SUPABASE_URL);
  const key = clean(SUPABASE_ANON_KEY);
  if (!url || !key) return false;
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}

export function getSession() {
  return session;
}

export function getProfile() {
  if (!profile) return null;
  return {
    ...profile,
    purchase_history: asHistory(profile.purchase_history),
  };
}

export function onChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit() {
  listeners.forEach((fn) => fn());
}

function asHistory(value) {
  if (Array.isArray(value)) return value.slice();
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function chineseAuthError(error) {
  const message = String(error?.message || "");
  const code = String(error?.code || "");
  if (/invalid login credentials/i.test(message) || code === "invalid_credentials") {
    return "電子郵件或密碼不對。";
  }
  if (/email not confirmed/i.test(message) || code === "email_not_confirmed") {
    return "請先到信箱完成驗證，再登入。";
  }
  if (/already registered|already been registered|user already exists/i.test(message) || code === "user_already_exists") {
    return "這個電子郵件已經有密碼。請用原來的密碼登入。";
  }
  if (/password/i.test(message) && /short|at least|least|weak|6/i.test(message)) {
    return "密碼至少要六個字。";
  }
  if (/rate limit|over_email_send_rate_limit/i.test(message) || code === "over_email_send_rate_limit") {
    return "寄信太頻繁，請稍後再試。";
  }
  if (/failed to fetch|network|load failed/i.test(message)) {
    return "連不上 Supabase。";
  }
  if (/relation|schema cache|column|profiles|orders/i.test(message)) {
    return "讀不到訂單或帳戶資料表。請先在 BiJulia 的 Supabase 執行資料表設定。";
  }
  return "沒有完成。請再試一次。";
}

async function sdk() {
  if (!isConfigured()) return null;
  if (!clientPromise) {
    clientPromise = import("https://esm.sh/@supabase/supabase-js@2.49.4")
      .then(({ createClient }) => createClient(clean(SUPABASE_URL), clean(SUPABASE_ANON_KEY), {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }))
      .catch((error) => {
        clientPromise = null;
        throw error;
      });
  }
  return clientPromise;
}

async function selectOwn(supabase, columns) {
  return supabase.from("profiles").select(columns).eq("id", session.user.id).maybeSingle();
}

async function loadProfile() {
  profile = null;
  if (!session?.user?.id) return;
  const supabase = await sdk();
  if (!supabase) return;
  let result = await selectOwn(supabase, FULL_COLUMNS);
  if (result.error) result = await selectOwn(supabase, CORE_COLUMNS);
  if (result.error || !result.data) return;
  profile = result.data;
}

export async function init() {
  session = null;
  profile = null;
  if (!isConfigured()) {
    emit();
    return;
  }
  try {
    const supabase = await sdk();
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    session = data.session || null;
    if (session) await loadProfile();
  } catch {
    session = null;
    profile = null;
  }
  emit();
}

export async function registerAccount({ name, phone, email, address, password }) {
  if (!isConfigured()) return { ok: false, code: "unconfigured" };
  try {
    const supabase = await sdk();
    const { data, error } = await supabase.auth.signUp({
      email: clean(email),
      password,
      options: {
        emailRedirectTo: `${location.origin}/account/`,
        data: {
          name: clean(name),
          phone: clean(phone),
          address: clean(address),
        },
      },
    });
    if (error) return { ok: false, code: "auth", message: chineseAuthError(error) };
    const identities = data.user?.identities;
    if (data.user && Array.isArray(identities) && identities.length === 0) {
      return { ok: false, code: "exists", message: "這個電子郵件已經有密碼。請用原來的密碼登入。" };
    }
    session = data.session || null;
    profile = null;
    if (session) await loadProfile();
    if (session) emit();
    return { ok: true, needsVerification: !data.session };
  } catch {
    return { ok: false, code: "auth", message: "連不上 Supabase，帳號沒有建立。" };
  }
}

export async function loginAccount(email, password) {
  if (!isConfigured()) return { ok: false, code: "unconfigured" };
  try {
    const supabase = await sdk();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: clean(email),
      password,
    });
    if (error) return { ok: false, code: "auth", message: chineseAuthError(error) };
    session = data.session || null;
    profile = null;
    if (session) await loadProfile();
    emit();
    return { ok: true, profile: getProfile() };
  } catch {
    return { ok: false, code: "auth", message: "連不上 Supabase，沒有登入。" };
  }
}

export async function logoutAccount() {
  try {
    if (isConfigured()) {
      const supabase = await sdk();
      if (supabase) await supabase.auth.signOut();
    }
  } catch {
    /* 登出仍清掉這個頁面上的登入狀態。 */
  }
  session = null;
  profile = null;
  emit();
}

export async function listProfiles() {
  if (!isConfigured()) return { ok: false, code: "unconfigured", rows: [] };
  if (!profile || profile.role !== "super_admin") {
    return { ok: false, code: "forbidden", message: "這個帳號不能讀取其他人的資料。", rows: [] };
  }
  try {
    const supabase = await sdk();
    let result = await supabase.from("profiles").select(FULL_COLUMNS).order("created_at", { ascending: true });
    if (result.error) {
      result = await supabase.from("profiles").select(CORE_COLUMNS).order("created_at", { ascending: true });
    }
    if (result.error) return { ok: false, code: "auth", message: chineseAuthError(result.error), rows: [] };
    return { ok: true, rows: result.data || [] };
  } catch {
    return { ok: false, code: "auth", message: "連不上 Supabase，沒有讀取名單。", rows: [] };
  }
}

export async function placeOrder(order) {
  if (!isConfigured()) return { ok: false, code: "unconfigured" };
  try {
    const supabase = await sdk();
    const { error } = await supabase.from("orders").insert({
      name: clean(order.name),
      phone: clean(order.phone),
      gmail: clean(order.gmail),
      store: clean(order.store),
      items: Array.isArray(order.items) ? order.items : [],
      shipping: Number(order.shipping) || 0,
      total: Number(order.total) || 0,
      status: "pending",
    });
    if (error) return { ok: false, code: "auth", message: chineseAuthError(error) };
    return { ok: true };
  } catch {
    return { ok: false, code: "auth", message: "連不上 Supabase，訂單沒有送出。" };
  }
}

export async function listOrders() {
  if (!isConfigured()) return { ok: false, code: "unconfigured", rows: [] };
  if (!profile || profile.role !== "super_admin") {
    return { ok: false, code: "forbidden", message: "只有管理者可以讀取訂單。", rows: [] };
  }
  try {
    const supabase = await sdk();
    const result = await supabase.from("orders").select("id, created_at, name, phone, gmail, store, items, shipping, total, status").order("created_at", { ascending: false });
    if (result.error) return { ok: false, code: "auth", message: chineseAuthError(result.error), rows: [] };
    return { ok: true, rows: result.data || [] };
  } catch {
    return { ok: false, code: "auth", message: "連不上 Supabase，沒有讀取訂單。", rows: [] };
  }
}

export async function approveOrder(id) {
  if (!isConfigured()) return { ok: false, code: "unconfigured" };
  if (!profile || profile.role !== "super_admin") {
    return { ok: false, code: "forbidden", message: "只有管理者可以核准訂單。" };
  }
  try {
    const supabase = await sdk();
    const { data, error } = await supabase
      .from("orders")
      .update({ status: "approved" })
      .eq("id", id)
      .eq("status", "pending")
      .select("id, status, customer_id, name, phone, gmail, store, items, shipping, total, created_at")
      .maybeSingle();
    if (error) return { ok: false, code: "auth", message: chineseAuthError(error) };
    if (!data || data.status !== "approved") {
      return { ok: false, code: "missing", message: "沒有核准。這筆訂單可能已經不是待核准。" };
    }
    if (data.customer_id) {
      const existing = await supabase.from("profiles").select("purchase_history").eq("id", data.customer_id).maybeSingle();
      if (!existing.error) {
        const next = asHistory(existing.data?.purchase_history).concat({
          at: data.created_at,
          name: data.name,
          phone: data.phone,
          gmail: data.gmail,
          store: data.store,
          items: data.items,
          shipping: data.shipping,
          total: data.total,
        });
        await supabase.from("profiles").update({ purchase_history: next }).eq("id", data.customer_id);
      }
    }
    return { ok: true, order: data };
  } catch {
    return { ok: false, code: "auth", message: "連不上 Supabase，訂單沒有核准。" };
  }
}

export async function setMemberTier(id, tier) {
  if (!isConfigured()) return { ok: false, code: "unconfigured", message: "沒有接上 Supabase，會員等級沒有改成。" };
  if (!profile || profile.role !== "super_admin") {
    return { ok: false, code: "forbidden", message: "只有管理者可以調整會員等級。" };
  }
  const next = tier === "高級" ? "高級" : "一般";
  try {
    const supabase = await sdk();
    const { data, error } = await supabase
      .from("profiles")
      .update({ tier: next })
      .eq("id", id)
      .select("id, tier")
      .maybeSingle();
    if (error) {
      const raw = String(error.message || "");
      const message = /tier|column|schema cache/i.test(raw)
        ? "會員等級還沒寫進資料庫。請先在 Supabase 執行 profiles.sql。"
        : chineseAuthError(error);
      return { ok: false, code: "auth", message };
    }
    if (!data || data.tier !== next) {
      return { ok: false, code: "missing", message: "會員等級沒有改成。" };
    }
    return { ok: true, tier: next };
  } catch {
    return { ok: false, code: "auth", message: "連不上 Supabase，會員等級沒有改成。" };
  }
}

export async function approveCustomer(id) {
  if (!isConfigured()) return { ok: false, code: "unconfigured" };
  if (!profile || profile.role !== "super_admin") {
    return { ok: false, code: "forbidden", message: "只有管理者可以核准。" };
  }
  try {
    const supabase = await sdk();
    const { data, error } = await supabase
      .from("profiles")
      .update({ role: "customer" })
      .eq("id", id)
      .eq("role", "pending")
      .select("id, role")
      .maybeSingle();
    if (error) return { ok: false, code: "auth", message: chineseAuthError(error) };
    if (!data || data.role !== "customer") {
      return { ok: false, code: "missing", message: "沒有核准。這筆帳號可能已經不是待核准。" };
    }
    return { ok: true };
  } catch {
    return { ok: false, code: "auth", message: "連不上 Supabase，角色沒有變更。" };
  }
}

export async function appendPurchase(order) {
  try {
    if (!isConfigured() || !session || !profile?.id) return { ok: false, code: "skip" };
    const next = asHistory(profile.purchase_history).concat(order);
    const supabase = await sdk();
    const { error } = await supabase.from("profiles").update({ purchase_history: next }).eq("id", profile.id);
    if (error) return { ok: false, code: "auth" };
    profile = { ...profile, purchase_history: next };
    return { ok: true };
  } catch {
    return { ok: false, code: "auth" };
  }
}
