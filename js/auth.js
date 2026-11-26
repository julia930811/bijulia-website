import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./supabase.env.js?v=2";
import { t } from "./lang.js?v=1";

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
    return t("電子郵件或密碼不對。");
  }
  if (/email not confirmed/i.test(message) || code === "email_not_confirmed") {
    return t("請先到信箱完成驗證，再登入。");
  }
  if (/already registered|already been registered|user already exists/i.test(message) || code === "user_already_exists") {
    return t("這個電子郵件已經有密碼。請用原來的密碼登入。");
  }
  if (/password/i.test(message) && /short|at least|least|weak|6/i.test(message)) {
    return t("密碼至少要六個字。");
  }
  if (/rate limit|over_email_send_rate_limit/i.test(message) || code === "over_email_send_rate_limit") {
    return t("寄信太頻繁，請稍後再試。");
  }
  if (/failed to fetch|network|load failed/i.test(message)) {
    return t("連不上 Supabase。");
  }
  if (/relation|schema cache|column|profiles|orders/i.test(message)) {
    return t("讀不到訂單或帳戶資料表。請先在 BiJulia 的 Supabase 執行資料表設定。");
  }
  return t("沒有完成。請再試一次。");
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
      return { ok: false, code: "exists", message: t("這個電子郵件已經有密碼。請用原來的密碼登入。") };
    }
    session = data.session || null;
    profile = null;
    if (session) await loadProfile();
    if (session) emit();
    return { ok: true, needsVerification: !data.session };
  } catch {
    return { ok: false, code: "auth", message: t("連不上 Supabase，帳號沒有建立。") };
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
    return { ok: false, code: "auth", message: t("連不上 Supabase，沒有登入。") };
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
    return { ok: false, code: "forbidden", message: t("這個帳號不能讀取其他人的資料。"), rows: [] };
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
    return { ok: false, code: "auth", message: t("連不上 Supabase，沒有讀取名單。"), rows: [] };
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
    return { ok: false, code: "auth", message: t("連不上 Supabase，訂單沒有送出。") };
  }
}

export async function listOrders() {
  if (!isConfigured()) return { ok: false, code: "unconfigured", rows: [] };
  if (!profile || profile.role !== "super_admin") {
    return { ok: false, code: "forbidden", message: t("只有管理者可以讀取訂單。"), rows: [] };
  }
  try {
    const supabase = await sdk();
    const result = await supabase.from("orders").select("id, created_at, name, phone, gmail, store, items, shipping, total, status").order("created_at", { ascending: false });
    if (result.error) return { ok: false, code: "auth", message: chineseAuthError(result.error), rows: [] };
    return { ok: true, rows: result.data || [] };
  } catch {
    return { ok: false, code: "auth", message: t("連不上 Supabase，沒有讀取訂單。"), rows: [] };
  }
}

export async function approveOrder(id) {
  if (!isConfigured()) return { ok: false, code: "unconfigured" };
  if (!profile || profile.role !== "super_admin") {
    return { ok: false, code: "forbidden", message: t("只有管理者可以核准訂單。") };
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
      return { ok: false, code: "missing", message: t("沒有核准。這筆訂單可能已經不是待核准。") };
    }
    if (data.customer_id) {
      const existing = await supabase.from("profiles").select("purchase_history, tier").eq("id", data.customer_id).maybeSingle();
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
        const currentTier = existing.data?.tier === "高級" || existing.data?.tier === "一般會員"
          ? existing.data.tier
          : "一般顧客";
        const tier = next.length >= 3 ? "高級" : (currentTier === "一般會員" ? "一般顧客" : currentTier);
        await supabase.from("profiles").update({ purchase_history: next, tier }).eq("id", data.customer_id);
      }
    }
    return { ok: true, order: data };
  } catch {
    return { ok: false, code: "auth", message: t("連不上 Supabase，訂單沒有核准。") };
  }
}

export async function setMemberTier(id, tier) {
  if (!isConfigured()) return { ok: false, code: "unconfigured", message: t("沒有接上 Supabase，會員等級沒有改成。") };
  if (!profile || profile.role !== "super_admin") {
    return { ok: false, code: "forbidden", message: t("只有管理者可以調整會員等級。") };
  }
  const next = tier === "高級" || tier === "一般會員" || tier === "一般顧客" ? tier : "一般顧客";
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
        ? t("會員等級還沒寫進資料庫。請先在 Supabase 執行 profiles.sql。")
        : chineseAuthError(error);
      return { ok: false, code: "auth", message };
    }
    if (!data || data.tier !== next) {
      return { ok: false, code: "missing", message: t("會員等級沒有改成。") };
    }
    return { ok: true, tier: next };
  } catch {
    return { ok: false, code: "auth", message: t("連不上 Supabase，會員等級沒有改成。") };
  }
}

export async function approveCustomer(id) {
  if (!isConfigured()) return { ok: false, code: "unconfigured" };
  if (!profile || profile.role !== "super_admin") {
    return { ok: false, code: "forbidden", message: t("只有管理者可以核准。") };
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
      return { ok: false, code: "missing", message: t("沒有核准。這筆帳號可能已經不是待核准。") };
    }
    return { ok: true };
  } catch {
    return { ok: false, code: "auth", message: t("連不上 Supabase，角色沒有變更。") };
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

function catalogError(error) {
  const raw = `${error?.message || ""} ${error?.details || ""}`;
  if (/listed/i.test(raw)) return t("下架欄位還沒建立。請先在 Supabase 執行 profiles.sql。");
  if (/schema cache|relation .*catalog|Bucket not found|bucket/i.test(raw)) {
    return t("存貨資料表還沒建立。請先在 Supabase 執行 profiles.sql。");
  }
  if (/row-level security|permission|not allowed/i.test(raw)) return t("只有管理者可以改存貨。");
  return t("存貨沒有存起來。");
}

async function upsertCatalog(row, { listedRequired = false } = {}) {
  const supabase = await sdk();
  let result = await supabase.from("catalog").upsert(row, { onConflict: "slug" });
  const raw = `${result.error?.message || ""} ${result.error?.details || ""}`;
  if (result.error && /listed/i.test(raw)) {
    if (listedRequired || row.listed === false) {
      return { ok: false, message: t("下架欄位還沒建立。請先在 Supabase 執行 profiles.sql。") };
    }
    const copy = { ...row };
    delete copy.listed;
    result = await supabase.from("catalog").upsert(copy, { onConflict: "slug" });
  }
  const again = `${result.error?.message || ""} ${result.error?.details || ""}`;
  if (result.error && row.stock === null && /null value|stock/i.test(again)) {
    return { ok: false, message: t("下架欄位還沒建立。請先在 Supabase 執行 profiles.sql。") };
  }
  if (result.error) return { ok: false, message: catalogError(result.error) };
  return { ok: true };
}

function catalogRow(product, extra = {}) {
  const row = {
    slug: product.slug,
    name: extra.name != null ? extra.name : product.name,
    price: extra.price != null ? extra.price : Math.max(0, Math.round(Number(product.price) || 0)),
    currency: product.currency || "TWD",
    category: extra.category || (product.category === "sticker" ? "sticker" : "necklace"),
    image: extra.image != null ? extra.image : (product.image || ""),
    description: extra.description != null ? extra.description : (product.description || ""),
    listed: extra.listed != null ? Boolean(extra.listed) : !product.unlisted,
  };
  if (extra.colorStock) row.color_stock = extra.colorStock;
  else if (extra.stock == null && product.colorStock && typeof product.colorStock === "object") row.color_stock = product.colorStock;
  if (extra.stock != null) row.stock = extra.stock;
  else if (row.color_stock) row.stock = Object.values(row.color_stock).reduce((sum, count) => sum + Number(count || 0), 0);
  else if (Number.isInteger(product.stock)) row.stock = product.stock;
  else if (product.soldOut) row.stock = 0;
  else row.stock = null;
  return row;
}

export async function listCatalog() {
  if (!isConfigured()) return { ok: false, code: "unconfigured", rows: [] };
  try {
    const supabase = await sdk();
    const columns = "slug, name, price, currency, category, stock, color_stock, image, description, listed";
    let result = await supabase.from("catalog").select(columns).order("created_at", { ascending: true });
    const first = `${result.error?.message || ""} ${result.error?.details || ""}`;
    if (result.error && /listed/i.test(first)) {
      result = await supabase.from("catalog").select("slug, name, price, currency, category, stock, color_stock, image, description").order("created_at", { ascending: true });
    }
    const second = `${result.error?.message || ""} ${result.error?.details || ""}`;
    if (result.error && /color_stock/i.test(second)) {
      result = await supabase.from("catalog").select("slug, name, price, currency, category, stock, image, description").order("created_at", { ascending: true });
    }
    if (result.error) return { ok: false, code: "auth", message: catalogError(result.error), rows: [] };
    return { ok: true, rows: result.data || [] };
  } catch {
    return { ok: false, code: "auth", rows: [] };
  }
}

function wholeCount(value) {
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) return value;
  if (typeof value === "string" && /^\d+$/.test(value.trim())) return Number(value.trim());
  return null;
}

export async function saveStock(product, stock) {
  if (!isConfigured()) return { ok: false, message: t("沒有接上 Supabase。") };
  if (profile?.role !== "super_admin") return { ok: false, message: t("只有管理者可以改存貨。") };
  const perColor = Boolean(product.colors && product.colors.length && stock && typeof stock === "object");
  let next = null;
  let colorStock = null;
  if (perColor) {
    colorStock = {};
    for (const color of product.colors) {
      const count = wholeCount(stock[color.id]);
      if (count === null) return { ok: false, message: t("存貨要是 0 或更大的整數。") };
      colorStock[color.id] = count;
    }
    next = product.colors.reduce((sum, color) => sum + colorStock[color.id], 0);
  } else {
    next = wholeCount(stock);
    if (next === null) return { ok: false, message: t("存貨要是 0 或更大的整數。") };
  }
  const row = {
    slug: product.slug,
    name: product.name,
    price: Number(product.price) || 0,
    currency: product.currency || "TWD",
    category: product.category === "sticker" ? "sticker" : "necklace",
    stock: next,
    image: product.image || "",
    description: product.description || "",
    listed: !product.unlisted,
  };
  if (colorStock) row.color_stock = colorStock;
  try {
    const saved = await upsertCatalog(row);
    if (!saved.ok) return saved;
    return { ok: true };
  } catch {
    return { ok: false, message: t("存貨沒有存起來。") };
  }
}

function productSlug(name, taken) {
  const base = String(name || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
  let slug = base || `piece-${Date.now().toString(36)}`;
  let n = 2;
  const used = Array.isArray(taken) ? taken : [];
  while (used.includes(slug)) {
    slug = `${base || "piece"}-${n}`;
    n += 1;
  }
  return slug;
}

export async function createProduct({ name, price, stock, category, description, file, taken }) {
  if (!isConfigured()) return { ok: false, message: t("沒有接上 Supabase。") };
  if (profile?.role !== "super_admin") return { ok: false, message: t("只有管理者可以上傳商品。") };
  const slug = productSlug(name, taken);
  const ext = String(file?.name || "photo.jpg").split(".").pop().toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${slug}-${Date.now()}.${ext}`;
  try {
    const supabase = await sdk();
    const uploaded = await supabase.storage.from("catalog").upload(path, file, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });
    if (uploaded.error) return { ok: false, message: catalogError(uploaded.error) };
    const image = supabase.storage.from("catalog").getPublicUrl(path).data.publicUrl;
    const row = {
      slug,
      name: String(name || "").trim(),
      price: Math.max(0, Math.round(Number(price) || 0)),
      currency: "TWD",
      category: category === "sticker" ? "sticker" : "necklace",
      stock: Math.max(0, Math.round(Number(stock) || 0)),
      image,
      description: String(description || "").trim(),
    };
    const inserted = await supabase.from("catalog").insert(row).select("slug, name, price, currency, category, stock, image, description").maybeSingle();
    if (inserted.error) return { ok: false, message: catalogError(inserted.error) };
    return { ok: true, row: inserted.data || row };
  } catch {
    return { ok: false, message: t("商品沒有上傳。") };
  }
}

export async function updateProduct({ product, name, price, stock, category, description, file }) {
  if (!isConfigured()) return { ok: false, message: t("沒有接上 Supabase。") };
  if (profile?.role !== "super_admin") return { ok: false, message: t("只有管理者可以改商品。") };
  let image = product.image || "";
  try {
    const supabase = await sdk();
    if (file && file.size) {
      const ext = String(file.name || "photo.jpg").split(".").pop().toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path = `${product.slug}-${Date.now()}.${ext}`;
      const uploaded = await supabase.storage.from("catalog").upload(path, file, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });
      if (uploaded.error) return { ok: false, message: catalogError(uploaded.error) };
      image = supabase.storage.from("catalog").getPublicUrl(path).data.publicUrl;
    }
    const keepColors = Boolean(product.colors && product.colors.some((color) => Number.isInteger(color.stock)));
    const extra = {
      name: String(name || "").trim(),
      price: Math.max(0, Math.round(Number(price) || 0)),
      category: category === "sticker" ? "sticker" : "necklace",
      description: String(description || "").trim(),
      image,
      listed: !product.unlisted,
    };
    if (keepColors) extra.colorStock = product.colorStock || Object.fromEntries(product.colors.map((color) => [color.id, color.stock]));
    else extra.stock = Math.max(0, Math.round(Number(stock) || 0));
    const row = catalogRow(product, extra);
    const saved = await upsertCatalog(row);
    if (!saved.ok) return saved;
    return { ok: true, row };
  } catch {
    return { ok: false, message: t("商品沒有存起來。") };
  }
}

export async function setProductListed(product, listed) {
  if (!isConfigured()) return { ok: false, message: t("沒有接上 Supabase。") };
  if (profile?.role !== "super_admin") return { ok: false, message: t("只有管理者可以改商品。") };
  const row = catalogRow(product, { listed: Boolean(listed) });
  try {
    const saved = await upsertCatalog(row, { listedRequired: true });
    if (!saved.ok) return saved;
    return { ok: true, row };
  } catch {
    return { ok: false, message: t("沒有改成。") };
  }
}

function outfitError(error) {
  const raw = `${error?.message || ""} ${error?.details || ""}`;
  if (/schema cache|relation .*outfits|Bucket not found|bucket/i.test(raw)) {
    return t("穿搭資料表還沒建立。請先在 Supabase 執行 profiles.sql。");
  }
  if (/row-level security|permission|not allowed/i.test(raw)) return t("只有管理者可以上架穿搭。");
  return t("穿搭沒有上架。");
}

export async function listOutfits() {
  if (!isConfigured()) return { ok: false, code: "unconfigured", rows: [] };
  try {
    const supabase = await sdk();
    const result = await supabase.from("outfits").select("id, name, slug, image, listed, created_at").order("created_at", { ascending: true });
    if (result.error) return { ok: false, message: outfitError(result.error), rows: [] };
    return { ok: true, rows: result.data || [] };
  } catch {
    return { ok: false, rows: [] };
  }
}

export async function createOutfit({ name, slug, file }) {
  if (!isConfigured()) return { ok: false, message: t("沒有接上 Supabase。") };
  if (profile?.role !== "super_admin") return { ok: false, message: t("只有管理者可以上架穿搭。") };
  const ext = String(file?.name || "photo.jpg").split(".").pop().toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `outfits/${Date.now()}.${ext}`;
  try {
    const supabase = await sdk();
    const uploaded = await supabase.storage.from("catalog").upload(path, file, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });
    if (uploaded.error) return { ok: false, message: outfitError(uploaded.error) };
    const image = supabase.storage.from("catalog").getPublicUrl(path).data.publicUrl;
    const row = {
      name: String(name || "").trim(),
      slug: String(slug || "").trim(),
      image,
      listed: true,
    };
    const inserted = await supabase.from("outfits").insert(row).select("id, name, slug, image, listed, created_at").maybeSingle();
    if (inserted.error) return { ok: false, message: outfitError(inserted.error) };
    return { ok: true, row: inserted.data || row };
  } catch {
    return { ok: false, message: t("穿搭沒有上架。") };
  }
}

export async function setOutfitListed(id, listed) {
  if (!isConfigured()) return { ok: false, message: t("沒有接上 Supabase。") };
  if (profile?.role !== "super_admin") return { ok: false, message: t("只有管理者可以上架穿搭。") };
  try {
    const supabase = await sdk();
    const result = await supabase.from("outfits").update({ listed: Boolean(listed) }).eq("id", id).select("id, name, slug, image, listed, created_at").maybeSingle();
    if (result.error) return { ok: false, message: outfitError(result.error) };
    if (!result.data) return { ok: false, message: t("沒有改成。") };
    return { ok: true, row: result.data };
  } catch {
    return { ok: false, message: t("沒有改成。") };
  }
}
