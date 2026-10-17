const KEY = "bijulia-atelier-v1";

function emptyState() {
  return { cart: [] };
}

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "");
    const cart = Array.isArray(raw.cart)
      ? raw.cart.filter((item) => item && typeof item.slug === "string" && item.qty > 0)
      : [];
    return { cart };
  } catch {
    return emptyState();
  }
}

let state = load();
const listeners = new Set();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* Private browsing can block storage. The bag still works for this visit. */
  }
}

function emit() {
  persist();
  listeners.forEach((fn) => fn(state));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getCart() {
  return state.cart.map((item) => ({ ...item }));
}

export function cartCount() {
  return state.cart.reduce((sum, item) => sum + item.qty, 0);
}

function cleanQty(qty) {
  const value = Math.round(Number(qty));
  return Number.isFinite(value) ? value : 0;
}

export function addToCart(slug, qty = 1, max = 5, color = "") {
  const amount = Math.max(1, cleanQty(qty) || 1);
  const tone = color || "";
  const item = state.cart.find((entry) => entry.slug === slug && (entry.color || "") === tone);
  if (item) item.qty = Math.min(max, item.qty + amount);
  else state.cart.push(tone ? { slug, qty: Math.min(max, amount), color: tone } : { slug, qty: Math.min(max, amount) });
  emit();
}

export function setQty(slug, qty, max = 5, color = "") {
  const amount = cleanQty(qty);
  const tone = color || "";
  if (amount <= 0) {
    state.cart = state.cart.filter((item) => !(item.slug === slug && (item.color || "") === tone));
  } else {
    const item = state.cart.find((entry) => entry.slug === slug && (entry.color || "") === tone);
    if (item) item.qty = Math.min(max, amount);
  }
  emit();
}

export function removeFromCart(slug, color = "") {
  const tone = color || "";
  state.cart = state.cart.filter((item) => !(item.slug === slug && (item.color || "") === tone));
  emit();
}
