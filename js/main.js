import {
  site,
  products,
  collections,
  productBySlug,
  collectionBySlug,
  productsIn,
} from "./data.js?v=25";
import * as store from "./store.js?v=2";
import * as auth from "./auth.js?v=12";

const page = document.body.dataset.page || "home";
const slug = document.body.dataset.slug || new URLSearchParams(location.search).get("slug") || "";
const ui = { drawer: false, search: false, menu: false };
const loginUi = { open: false, opener: null, returnMenu: false, dismissedOnAccount: false };
let authReady = false;

function esc(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}

function money(amount) {
  return `$${Number(amount).toLocaleString("en-US")}`;
}

function ntd(amount) {
  return `NT$${Number(amount).toLocaleString("en-US")}`;
}

function priceText(product, qty = 1) {
  const amount = product.price * qty;
  if (product.currency === "TWD") return `NT$${amount.toLocaleString("en-US")}`;
  return money(amount);
}

function iconSearch() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"></circle><path d="M16 16.5 20 20.5"></path></svg>';
}
function iconBag() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 8.5h11l-.8 11h-9.4l-.8-11z"></path><path d="M9 8.5V7.2a3 3 0 0 1 6 0v1.3"></path></svg>';
}
function iconMenu() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16M4 16h16"></path></svg>';
}
function iconClose() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"></path></svg>';
}

function productHref(product, suffix = "") {
  if (!product) return "/shop/";
  if (product.uploaded) {
    const query = new URLSearchParams({ slug: product.slug });
    if (suffix.startsWith("?color=")) query.set("color", suffix.slice("?color=".length).split("#")[0]);
    const hash = suffix.includes("#") ? suffix.slice(suffix.indexOf("#")) : "";
    return `/product/?${query.toString()}${hash}`;
  }
  return `/product/${product.slug}/${suffix}`;
}

function fitClass(item) {
  const mode = item && (item.imageFit || item.fit);
  const fit = mode === "contain" ? "fit-contain" : mode === "full" ? "fit-full" : mode === "stack" ? "fit-stack" : "";
  const src = item && (item.image || item.src) ? item.image || item.src : "";
  const photo = /\.(jpe?g|png|gif|webp)$/i.test(src) ? "photo" : "";
  return [fit, photo].filter(Boolean).join(" ");
}

function currentPath() {
  let path = location.pathname;
  if (path.endsWith("/index.html")) path = path.slice(0, -10);
  if (path !== "/" && !path.endsWith("/")) path += "/";
  return path;
}

function params() {
  return new URLSearchParams(location.search);
}

function wordImg(kind, extra = "") {
  const map = {
    shop: ["/images/shop-word.png", "Shop"],
    sticker: ["/images/sticker-word.png", "Sticker"],
    necklace: ["/images/necklace-word.png", "Necklace"],
    outfit: ["/images/outfits-word.png", "Outfits"],
    all: ["/images/all-word.png?v=2", "All"],
    care: ["/images/customer-care-word.png", "Customer Care"],
    pieces: ["/images/all-pieces-word.png", "All pieces"],
    best: ["/images/best-sellers-word.png", "Best Sellers"],
    about: ["/images/about-word.png", "About"],
    consignment: ["/images/consignment-word.png?v=3", "Consignment"],
    shipping: ["/images/shipping-word.png?v=3", "Shipping"],
    returns: ["/images/return-word.png?v=1", "Return"],
    jewelry: ["/images/jewelry-care-word.png?v=1", "Jewelry Care"],
    contact: ["/images/contact-word.png?v=1", "Contact"],
    instagram: ["/images/instagram-word.png", "Instagram"],
  };
  const [src, alt] = map[kind];
  return `<img class="word-mark is-${kind}${extra ? ` ${extra}` : ""}" src="${src}" alt="${alt}">`;
}

function shell() {
  const path = currentPath();
  const filter = params().get("filter");
  const mark = (key) => {
    const on =
      (key === "shop" && ((path.startsWith("/shop") && !filter) || path.startsWith("/product"))) ||
      (key === "new" && path.startsWith("/shop") && filter === "new") ||
      (key === "pieces" && path.startsWith("/shop") && !filter) ||
      (key === "necklace" && path.startsWith("/shop") && filter === "necklace") ||
      (key === "sticker" && path.startsWith("/shop") && filter === "sticker") ||
      (key === "looks" && path.startsWith("/outfit")) ||
      (key === "about" && path.startsWith("/about")) ||
      (key === "care" && path.startsWith("/customer-care"));
    return on ? ' aria-current="page"' : "";
  };
  return `
    <a class="skip" href="#app">跳至內文</a>
    <div class="announce"><span>Free shipping over ${ntd(site.freeShipping)}</span></div>
    <header class="site-header">
      <div class="header-inner">
        <div class="header-left">
          <button class="menu-toggle" type="button" data-open-menu aria-label="開啟選單">${iconMenu()}</button>
          <a class="logo" href="/" aria-label="BiJulia"><img src="/images/logo.png" alt="BiJulia"></a>
        </div>
        <nav class="nav" aria-label="Primary">
          <a href="/shop/"${mark("shop")}>${wordImg("shop")}</a>
          <a href="/shop/?filter=new"${mark("new")}><img class="new-in-mark" src="/images/new-in.png" alt="New In"></a>
          <a class="menu-small" href="/shop/"${mark("pieces")}>${wordImg("pieces")}</a>
          <a class="menu-small" href="/shop/?filter=necklace"${mark("necklace")}>${wordImg("necklace")}</a>
          <a class="menu-small" href="/shop/?filter=sticker"${mark("sticker")}>${wordImg("sticker")}</a>
          <a class="menu-small" href="/outfit/"${mark("looks")}>${wordImg("outfit")}</a>
          <a href="/about/"${mark("about")}>${wordImg("about")}</a>
          <a href="/customer-care/"${mark("care")}>${wordImg("care")}</a>
        </nav>
        <div class="tools">
          <button class="icon-btn" type="button" data-open-search aria-label="搜尋">${iconSearch()}</button>
          <a class="login-btn" href="/account/" data-header-login>Login</a>
          <button class="icon-btn" type="button" data-open-drawer aria-label="購物袋">${iconBag()}<span class="count" data-cart-count hidden>0</span></button>
        </div>
      </div>
    </header>
    <main id="app"></main>
    <footer class="site-footer">
      <div class="footer-grid">
        <div class="footer-shop">
          <h2><a href="/shop/">${wordImg("shop")}</a></h2>
          <a href="/shop/?filter=new"><img class="new-in-mark" src="/images/new-in.png" alt="New In"></a>
          <a href="/shop/?filter=best">${wordImg("best")}</a>
          <a href="/shop/">${wordImg("pieces")}</a>
          <a href="/shop/?filter=necklace">${wordImg("necklace")}</a>
          <a href="/shop/?filter=sticker">${wordImg("sticker")}</a>
        </div>
        <div class="footer-care">
          <h2><a href="/customer-care/">${wordImg("care")}</a></h2>
          <a href="/customer-care/#shipping">${wordImg("shipping")}</a>
          <a href="/customer-care/#returns">${wordImg("returns")}</a>
          <a href="/customer-care/#care">${wordImg("jewelry")}</a>
          <a href="/customer-care/#contact">${wordImg("contact")}</a>
        </div>
        <div class="footer-bottom">
          <div>
            <h2><a href="/about/">${wordImg("about")}</a></h2>
          </div>
          <div>
            <h2><a href="/outfit/">${wordImg("outfit")}</a></h2>
          </div>
        </div>
      </div>
      <div class="footer-base">
        <a class="logo" href="/" aria-label="BiJulia"><img src="/images/logo.png" alt=""></a>
        <span>© ${new Date().getFullYear()} BiJulia.</span>
      </div>
    </footer>
    <div class="scrim" data-close-overlay hidden></div>
    <aside id="drawer" class="drawer" aria-hidden="true" aria-label="購物袋">
      <div class="drawer-head">
        <h2><img class="your-bag-mark" src="/images/your-bag.png" alt="Your bag"></h2>
        <button class="icon-btn" type="button" data-close-overlay aria-label="關閉購物袋">${iconClose()}</button>
      </div>
      <div id="drawer-body"></div>
      <div class="drawer-foot" id="drawer-foot"></div>
    </aside>
    <div id="search" class="search-screen" aria-hidden="true">
      <form id="search-form" class="search-top" role="search">
        <label class="sr-only" for="q">搜尋作品</label>
        <input id="q" type="search" placeholder="搜尋作品" autocomplete="off">
        <button class="icon-btn" type="button" data-close-overlay aria-label="關閉搜尋">${iconClose()}</button>
      </form>
      <div id="search-results" class="search-results"></div>
    </div>
    <div id="mobile-nav" class="mobile-nav" aria-hidden="true">
      <div class="mobile-head">
        <a class="logo" href="/" aria-label="BiJulia"><img src="/images/logo.png" alt=""></a>
        <button class="icon-btn" type="button" data-close-overlay aria-label="關閉選單">${iconClose()}</button>
      </div>
      <a class="menu-near" href="/shop/">${wordImg("shop")}</a>
      <a class="menu-near" href="/shop/?filter=new"><img class="new-in-mark" src="/images/new-in.png" alt="New In"></a>
      <a class="menu-near" href="/shop/?filter=best">${wordImg("best")}</a>
      <a class="menu-small" href="/shop/">${wordImg("pieces")}</a>
      <a class="menu-small" href="/shop/?filter=necklace">${wordImg("necklace")}</a>
      <a class="menu-small" href="/shop/?filter=sticker">${wordImg("sticker")}</a>
      <a class="menu-near" href="/outfit/">${wordImg("outfit")}</a>
      <a class="menu-near" href="/about/">${wordImg("about")}</a>
      <a href="/customer-care/">${wordImg("care")}</a>
      <img class="menu-under photo" src="/images/menu-garden.jpg" alt="">
      <button class="menu-logout" type="button" data-logout>登出</button>
    </div>
    <div id="login-dialog" class="login-dialog" hidden>
      <div class="login-scrim" data-close-login></div>
      <div class="login-panel" role="dialog" aria-modal="true" aria-labelledby="login-dialog-title">
        <div class="login-head">
          <h2 id="login-dialog-title">Login</h2>
          <button class="icon-btn" type="button" data-close-login aria-label="關閉登入">${iconClose()}</button>
        </div>
        <form id="login-form" class="account-form">
          <label class="field"><span>電子郵件</span><input name="email" type="email" required autocomplete="email"></label>
          <label class="field"><span>密碼</span><input name="password" type="password" required autocomplete="current-password"></label>
          <button class="btn btn-fill" type="submit">Login</button>
          <a class="btn" href="/account/?view=register" data-open-register>註冊</a>
          <p class="form-note fine" id="login-note" role="status"></p>
        </form>
        <form id="register-form" class="account-form" hidden>
          <label class="field"><span>姓名</span><input name="name" required autocomplete="name"></label>
          <label class="field"><span>電話</span><input name="phone" type="tel" required inputmode="numeric" autocomplete="tel" placeholder="0912345678"></label>
          <label class="field"><span>電子郵件</span><input name="email" type="email" required autocomplete="email"></label>
          <label class="field"><span>密碼</span><input name="password" type="password" required autocomplete="new-password" minlength="6"></label>
          <label class="field"><span>再輸入一次密碼</span><input name="confirm" type="password" required autocomplete="new-password" minlength="6"></label>
          <button class="btn btn-fill" type="submit">註冊</button>
          <a class="btn" href="/account/" data-show-login>Login</a>
          <p class="form-note fine" id="register-note" role="status"></p>
        </form>
      </div>
    </div>
  `;
}

function card(product) {
  const media = product.colors && product.colors.length > 1
    ? `<div class="color-swipe">
        ${product.colors.map((color) => `
          <a href="${productHref(product, `?color=${esc(color.id)}`)}">
            <img src="${color.image}" alt="${esc(product.name)}，${esc(color.name)}" class="${fitClass({ ...product, image: color.image })}">
          </a>
        `).join("")}
      </div>`
    : `<a href="${productHref(product)}"><img src="${product.image}" alt="${esc(product.name)}" class="${fitClass(product)}"></a>`;
  return `
    <article class="card">
      <div class="card-media">
        ${media}
        ${product.soldOut
          ? `<span class="quick-add is-sold"><img class="sold-out-mark" src="/images/sold-out.png" alt="Sold out"></span>`
          : product.colors
            ? `<a class="quick-add" href="${productHref(product)}">Choose color</a>`
            : `<button class="quick-add" type="button" data-add="${product.slug}">Add to bag</button>`}
      </div>
      <div class="card-info">
        <a class="card-name${product.category === "necklace" ? " is-taipei" : ""}" href="${productHref(product)}">${esc(product.name)}</a>
        <p class="card-price">${priceText(product)}</p>
        ${product.soldOut ? `<a class="card-restock" href="${productHref(product, "#restock")}">補貨後通知</a>` : ""}
        ${product.colors ? `<p class="fine">${product.colors.map((color) => esc(color.soldOut ? `${color.name} 售完` : color.name)).join(" · ")}</p>` : ""}
        ${product.unit ? `<p class="fine">${esc(product.unit)}</p>` : ""}
      </div>
    </article>
  `;
}

function grid(list) {
  if (!list.length) {
    return `<div class="empty"><h2>Nothing in this edit yet.</h2><p class="fine">桌上暫時空著。</p></div>`;
  }
  return `<div class="product-grid">${list.map(card).join("")}</div>`;
}

function crumbs(items) {
  const parts = items.map((item, index) => {
    if (index === items.length - 1 || !item.href) return `<span>${esc(item.label)}</span>`;
    return `<a href="${item.href}">${esc(item.label)}</a><span aria-hidden="true">/</span>`;
  });
  return `<nav class="crumbs" aria-label="Breadcrumb">${parts.join("")}</nav>`;
}

function totals() {
  let sub = 0;
  let twd = 0;
  for (const item of store.getCart()) {
    const product = productBySlug(item.slug);
    if (!product) continue;
    const amount = product.price * item.qty;
    if (product.currency === "TWD") twd += amount;
    else sub += amount;
  }
  const goods = twd > 0 ? twd : sub;
  const discount = isPremiumMember() && goods ? Math.round(goods * 0.1) : 0;
  const basis = goods;
  const ship = basis === 0 ? 0 : freeShippingQualified(basis) ? 0 : site.shippingFee;
  const due = Math.max(0, goods - discount) + ship;
  return { sub, ship, total: due, twd, basis, discount, due };
}

function isPremiumMember() {
  return memberTier() === "高級";
}

function isShareMember() {
  return memberTier() === "一般會員";
}

function memberTier() {
  const profile = auth.getProfile();
  const member = profile?.role === "customer" || profile?.role === "pending";
  if (!member) return "";
  if (profile.tier === "高級" || profile.tier === "一般會員") return profile.tier;
  return "一般顧客";
}

function freeShippingQualified(basis) {
  return isPremiumMember() || isShareMember() || basis >= site.freeShipping;
}

function summaryMoney(sums, twdLabel = "NT$") {
  const rows = [];
  if (sums.sub) rows.push(`<div class="summary-row"><span>小計</span><span>${money(sums.sub)}</span></div>`);
  if (sums.twd) rows.push(`<div class="summary-row"><span>${esc(twdLabel)}</span><span>NT$${sums.twd.toLocaleString("en-US")}</span></div>`);
  return rows.join("");
}

function shippingNote(amount) {
  if (!amount) return "";
  if (isPremiumMember()) return "高級會員，9 折、免運";
  if (isShareMember()) return "一般會員，這次免運";
  if (amount >= site.freeShipping) return "免運";
  const rest = site.freeShipping - amount;
  return `再加 ${ntd(rest)} 即可免運`;
}

function dueText(sums) {
  return sums.twd ? ntd(sums.due) : money(sums.due);
}

function discountRow(sums) {
  if (!sums.discount) return "";
  const amount = sums.twd ? ntd(sums.discount) : money(sums.discount);
  return `<div class="summary-row"><span>高級會員 9 折</span><span>−${amount}</span></div>`;
}

function chargeSummary(sums) {
  if (!sums.basis) return "";
  return `${discountRow(sums)}
    <div class="summary-row"><span>運費</span><span>${sums.ship === 0 ? "免運" : ntd(sums.ship)}</span></div>
    <div class="summary-row"><strong>合計</strong><strong>${dueText(sums)}</strong></div>
    <p class="fine">${esc(shippingNote(sums.basis))}</p>`;
}

function colorById(product, id) {
  return (product && product.colors ? product.colors : []).find((color) => color.id === id) || null;
}

function buyLimit(product, colorId) {
  const tone = colorById(product, colorId);
  if (tone && tone.soldOut) return Number.isInteger(tone.stock) ? tone.stock : 0;
  if (tone && Number.isInteger(tone.stock)) return tone.stock;
  return product ? product.maxQty : 5;
}

function colorPicker(product) {
  if (!product.colors || !product.colors.length) return "";
  const picked = Math.max(0, product.colors.findIndex((color) => color.id === params().get("color")));
  return `
    <div class="color-pick">
      <p class="fine" id="color-label">顏色</p>
      <div class="color-options" role="radiogroup" aria-labelledby="color-label">
        ${product.colors.map((color, index) => `
          <button type="button" class="color-option${index === picked ? " is-on" : ""}${color.soldOut ? " is-out" : ""}" role="radio" aria-checked="${index === picked}" data-color="${esc(color.id)}" data-image="${color.image}">
            <img src="${color.image}" alt="">
            <span>${esc(color.name)}</span>
            ${color.soldOut ? `<span class="color-sold">售完</span>` : ""}
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function line(item, compact) {
  const product = productBySlug(item.slug);
  if (!product) return "";
  const tone = colorById(product, item.color);
  const image = tone ? tone.image : product.image;
  const colorAttr = item.color ? ` data-color="${esc(item.color)}"` : "";
  const max = buyLimit(product, item.color);
  const limit = max > 0 && item.qty >= max ? '<p class="fine">這件已到少量上限。</p>' : "";
  return `
    <article class="line">
      <a href="${productHref(product)}"><img src="${image}" alt="" class="${fitClass({ ...product, image })}"></a>
      <div>
        <h3 class="${product.category === "necklace" ? "is-taipei" : ""}"><a href="${productHref(product)}">${esc(product.name)}</a></h3>
        ${tone ? `<p class="fine">${esc(tone.name)}</p>` : ""}
        <div class="qty" data-max="${Math.max(max, 1)}">
          <button type="button" data-line-step="-1" data-slug="${product.slug}"${colorAttr} aria-label="減少數量">−</button>
          <span aria-live="polite">${item.qty}</span>
          <button type="button" data-line-step="1" data-slug="${product.slug}"${colorAttr} aria-label="增加數量">+</button>
        </div>
        ${compact ? "" : limit}
        <button class="remove" type="button" data-remove="${product.slug}"${colorAttr}>Remove</button>
      </div>
      <p class="line-price">${priceText(product, item.qty)}</p>
    </article>
  `;
}

const looks = [
  ["lace-butterfly-choker", "/images/products/lace-butterfly-choker-worn.jpg", "Lace Butterfly Choker"],
  ["ivory-lace-cross", "/images/products/ivory-lace-cross-worn.jpg", "Ivory Lace Cross"],
  ["ivory-lace-cross", "/images/products/ivory-lace-cross.jpg", "Ivory Lace Cross"],
  ["lock-and-key-chain", "/images/products/lock-and-key-chain-worn.jpg", "Lock and Key Chain"],
  ["comb-and-chair-chain", "/images/products/comb-and-chair-chain-worn.jpg", "Comb and Chair Chain"],
  ["button-drop-necklace", "/images/products/button-drop-necklace-worn.jpg", "Button Drop Necklace"],
];

function renderHome() {
  const newest = products.filter((item) => item.isNew && item.category === "necklace" && !item.unlisted).slice(0, 4);
  const sellers = products.filter((item) => item.isBestSeller && item.category === "necklace" && !item.unlisted).slice(0, 4);
  const stickers = products.filter((item) => item.category === "sticker" && !item.unlisted);
  return `
    <section class="hero">
      <div class="hero-copy">
        <h1><img class="wordmark" src="/images/bijulia-wordmark.png" alt="BiJulia"></h1>
      </div>
    </section>
    <section class="scene-band" aria-label="仙女與噴水池">
      <img src="/images/fairy-fountain.gif?v=4" alt="仙女在花噴水池旁">
      <a class="btn scene-shop" href="/shop/"><img class="shop-rest" src="/images/shop-now.png" alt="Shop now"><img class="shop-hover" src="/images/shop-now-hover.png" alt=""></a>
    </section>
    <section class="section" id="new-in">
      <div class="wrap">
        <div class="section-head"><h2><a href="/shop/?filter=new"><img class="title-mark" src="/images/new-in.png" alt="New In"></a></h2></div>
        ${grid(newest)}
        <p class="more-link"><a class="linkish" href="/shop/?filter=new">查看全部</a></p>
      </div>
    </section>
    <section class="section" id="best-sellers">
      <div class="wrap">
        <div class="section-head"><h2>${wordImg("best", "is-title")}</h2></div>
        ${grid(sellers)}
        <p class="more-link"><a class="linkish" href="/shop/?filter=best">查看全部</a></p>
      </div>
    </section>
    <section class="section sticker-feature" id="stickers">
      <div class="wrap">
        <div class="section-head">
          <h2>Shell Stickers</h2>
          <p class="lede">三張一組 不可單賣</p>
        </div>
        <div class="sticker-stage">${stickers.map(card).join("")}</div>
        <p class="more-link"><a class="linkish" href="/collections/shell-stickers/">看貝殼</a></p>
      </div>
    </section>
    <section class="section looks-section" id="looks">
      <div class="wrap">
        <div class="section-head"><h2><a href="/outfit/">${wordImg("outfit", "is-title")}</a></h2></div>
      </div>
      <div class="look-marquee">
        <button class="look-nav look-prev" type="button" aria-label="上一張"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 6.5 9 12l5.5 5.5"/></svg></button>
        <div class="look-track">
          ${[false, true].map((hidden) => `
            <div class="look-set"${hidden ? ' aria-hidden="true"' : ""}>
              ${looks.map(([slug, src, name]) => `
                <article class="look">
                  <a class="look-frame" href="/product/${slug}/"${hidden ? ' tabindex="-1"' : ""}>
                    <img src="${src}" alt="${esc(name)}，穿搭" class="photo">
                  </a>
                </article>
              `).join("")}
            </div>
          `).join("")}
        </div>
        <button class="look-nav look-next" type="button" aria-label="下一張"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 6.5 15 12l-5.5 5.5"/></svg></button>
      </div>
    </section>
    <a class="about-band" id="about-bijulia" href="/about/">
      <img src="/images/about-gate.jpg" alt="黑色鐵花門的捲草花紋">
      <div class="about-copy">
        <h2>${wordImg("about", "is-title")}</h2>
      </div>
    </a>
    <section class="newsletter" id="newsletter">
      <p class="kicker">信件</p>
      <p class="lede">新的項鍊上架、消息，或新活動。</p>
      <form id="letter-form">
        <input type="email" name="email" required placeholder="電子郵件" aria-label="電子郵件">
        <button class="btn" type="submit">Subscribe</button>
      </form>
      <p class="form-note fine" id="letter-note"></p>
    </section>
  `;
}

const filterOptions = [
  ["new", `<img class="new-in-mark" src="/images/new-in.png" alt="New In">`],
  ["best", wordImg("best")],
  ["all", wordImg("pieces")],
  ["necklace", wordImg("necklace")],
  ["sticker", wordImg("sticker")],
];

function applyFilter(list, filter) {
  if (!filter || filter === "all") return list;
  if (filter === "new") return list.filter((item) => item.isNew);
  if (filter === "best") return list.filter((item) => item.isBestSeller);
  if (filter === "necklace" || filter === "sticker") return list.filter((item) => item.category === filter);
  return list.filter((item) => item.collection === filter);
}

function applySort(list, sort) {
  const copy = [...list];
  if (sort === "price-asc") copy.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") copy.sort((a, b) => b.price - a.price);
  else if (sort === "name") copy.sort((a, b) => a.name.localeCompare(b.name));
  return copy;
}

function shopHeading(filter) {
  const collection = collectionBySlug(filter);
  if (collection) return [collection.name, collection.blurb];
  const map = {
    all: ["All pieces", ""],
    new: ["New In", ""],
    best: ["Best Sellers", ""],
    necklace: ["Necklaces", ""],
    sticker: ["Stickers", ""],
  };
  return map[filter] || map.all;
}

function shopTitle(title) {
  if (title === "New In") return `<img class="title-mark" src="/images/new-in.png" alt="New In">`;
  if (title === "All pieces") return wordImg("pieces", "is-title");
  if (title === "Necklaces") return wordImg("necklace", "is-title");
  if (title === "Stickers") return wordImg("sticker", "is-title");
  if (title === "Best Sellers") return wordImg("best", "is-title");
  return esc(title);
}

function renderShop() {
  const filter = params().get("filter") || "all";
  const sort = params().get("sort") || "featured";
  const [title, lede] = shopHeading(filter);
  const list = applySort(applyFilter(products.filter((item) => !item.unlisted), filter), sort);
  const word = "件";
  return `
    <div class="page">
      ${crumbs([{ href: "/", label: "Home" }, { label: "Shop" }])}
      <div class="shop-top">
        <div>
          <h1 class="page-title">${shopTitle(title)}</h1>
          ${lede ? `<p class="fine">${esc(lede)}</p>` : ""}
        </div>
        <label class="sort">排序
          <select data-sort aria-label="排序作品">
            <option value="featured"${sort === "featured" ? " selected" : ""}>精選</option>
            <option value="price-asc"${sort === "price-asc" ? " selected" : ""}>價格由低到高</option>
            <option value="price-desc"${sort === "price-desc" ? " selected" : ""}>價格由高到低</option>
            <option value="name"${sort === "name" ? " selected" : ""}>名稱</option>
          </select>
        </label>
      </div>
      <div class="filters" role="tablist" aria-label="Filter shop">
        ${filterOptions.map(([value, label]) => `
          <button class="filter-btn${filter === value ? " is-on" : ""}" type="button" data-filter="${value}" role="tab" aria-selected="${filter === value}">${label}</button>
        `).join("")}
      </div>
      <p class="count-line">${list.length} ${word}</p>
      ${grid(list)}
    </div>
  `;
}

function renderCollections() {
  return `
    <div class="page">
      ${crumbs([{ href: "/", label: "Home" }, { label: "Collections" }])}
      <div class="section-head" style="text-align:left">
        <h1 class="page-title">Collections</h1>
        <p class="lede" style="margin-left:0">四組飾品，以及從同一批圖印成的貝殼貼紙。</p>
      </div>
      <div class="collection-grid">
        ${collections.map((item) => `
          <a class="tile" href="/collections/${item.slug}/">
            <img src="${item.image}" alt="" class="${fitClass(item)}">
            <span>${esc(item.name)}</span>
          </a>
        `).join("")}
      </div>
    </div>
  `;
}

function renderCollection() {
  const collection = collectionBySlug(slug);
  if (!collection) return renderNotFound();
  document.title = `${collection.name} — BiJulia`;
  return `
    <div class="page">
      ${crumbs([{ href: "/", label: "Home" }, { href: "/collections/", label: "Collections" }, { label: collection.name }])}
      <header class="collection-hero">
        <div>
          <p class="kicker">系列</p>
          <h1>${esc(collection.name)}</h1>
          <p>${esc(collection.blurb)}</p>
        </div>
        <img src="${collection.image}" alt="" class="${fitClass(collection)}">
      </header>
      ${grid(productsIn(collection.slug).filter((item) => !item.unlisted))}
    </div>
  `;
}

function related(product) {
  const same = products.filter((item) => !item.unlisted && item.collection === product.collection && item.slug !== product.slug);
  const rest = products.filter((item) => !item.unlisted && item.slug !== product.slug && !same.includes(item));
  return [...same, ...rest].slice(0, 4);
}

function renderProduct() {
  const product = productBySlug(slug);
  if (!product) return renderNotFound();
  document.title = `${product.name} — BiJulia`;
  const collection = collectionBySlug(product.collection);
  const specs = product.category === "sticker"
    ? [["組數", "三張貼紙"], ["價格", "NT$50"], ["製作", "少量製作"]]
    : [["長度", product.length], ["材質", product.materials], ["製作", "手工，少量製作"]];
  const care = product.category === "sticker" ? "" : "沒有戴的時候，把項鍊放回鏈袋裡。";
  const shipping = `滿 ${ntd(site.freeShipping)} 免運。未滿則運費 ${ntd(site.shippingFee)}。一般顧客沒有會員優惠。一般會員在社群分享商品後，下次免運。高級會員是買過三次的客人，作品 9 折，而且免運。項鍊於 5–8 天內從工作室寄出。貼紙多半 3 天內寄出。`;
  const pictures = product.images && product.images.length ? product.images : [product.image];
  const wornShots = pictures.filter((src) => /worn/i.test(src));
  const galleryShots = pictures.filter((src) => !/worn/i.test(src));
  const tone = product.colors && product.colors.length
    ? (colorById(product, params().get("color")) || product.colors[0])
    : null;
  const toneSold = Boolean(!product.soldOut && tone && tone.soldOut);
  const buyMax = tone && Number.isInteger(tone.stock) ? tone.stock : product.maxQty;
  return `
    <div class="page">
      ${crumbs([
        { href: "/", label: "Home" },
        { href: "/shop/", label: "Shop" },
        { label: product.name },
      ])}
      <article class="pdp">
        <div class="pdp-gallery">
          ${product.colors && product.colors.length
            ? `<img data-color-preview src="${(colorById(product, params().get("color")) || product.colors[0]).image}" alt="${esc(product.name)}，${esc((colorById(product, params().get("color")) || product.colors[0]).name)}" class="${fitClass(product)}">`
            : (galleryShots.length ? galleryShots : [product.image]).map((src, index) => `<img src="${src}" alt="${esc(product.name)}${index ? "，穿搭" : ""}" class="${src === product.image ? fitClass(product) : "photo"}">`).join("")}
          ${product.video ? `<video src="${product.video}" poster="${product.poster || product.image}" autoplay muted playsinline preload="auto" controls></video>` : ""}
        </div>
        <div class="pdp-info">
          <p class="kicker">${esc(collection ? collection.name : "")}</p>
          <h1 class="${product.category === "necklace" ? "is-taipei" : ""}">${esc(product.name)}</h1>
          <p class="price">${priceText(product)}</p>
          ${product.unit ? `<p class="fine">${esc(product.unit)}</p>` : ""}
          <div class="desc-wrap">
            <p class="desc">${esc(product.description)}</p>
            ${product.illustration ? `<img class="desc-gif" src="${product.illustration}" alt="">` : ""}
          </div>
          ${colorPicker(product)}
          <dl class="specs">
            ${specs.map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join("")}
          </dl>
          ${product.unlisted || product.soldOut ? "" : `
          <div class="qty" data-max="${Math.max(buyMax, 1)}"${toneSold ? " hidden" : ""}>
            <button type="button" data-qty-step="-1" aria-label="減少數量">−</button>
            <input data-qty-input value="1" inputmode="numeric" aria-label="數量">
            <button type="button" data-qty-step="1" aria-label="增加數量">+</button>
          </div>`}
          ${product.unlisted ? `<p class="fine">這件已下架。</p>` : `<button class="btn btn-fill${product.soldOut || toneSold ? " is-sold" : ""}" type="button"${product.soldOut || toneSold ? " disabled" : ` data-add="${product.slug}"`}>${product.soldOut || toneSold ? `<img class="sold-out-mark" src="/images/sold-out.png" alt="Sold out">` : "Add to bag"}</button>`}
          ${!product.unlisted && product.soldOut ? `
          <form id="restock" class="restock">
            <p class="fine">這件目前沒有存貨。留下 Gmail，補貨後會寄信通知。</p>
            <label class="field"><span>Gmail</span><input name="gmail" type="email" required autocomplete="email" placeholder="name@gmail.com"></label>
            <button class="btn btn-fill" type="submit">補貨後通知</button>
            <p class="form-note fine"></p>
          </form>` : ""}
          <details open>
            <summary>細節</summary>
            <p>${esc(product.details)}</p>
            ${wornShots.length ? `<div class="detail-photos">${wornShots.map((src) => `<img class="photo" src="${src}" alt="${esc(product.name)}，穿搭">`).join("")}</div>` : ""}
          </details>
          <details>
            <summary>運送</summary>
            <p>${esc(shipping)}</p>
          </details>
          ${care ? `<details>
            <summary>保養</summary>
            <p>${esc(care)}</p>
          </details>` : ""}
        </div>
      </article>
      <section class="related">
        <h2>You may also like</h2>
        ${grid(related(product))}
      </section>
    </div>
  `;
}

function renderCart() {
  const items = store.getCart();
  if (!items.length) {
    return `
      <div class="page">
        <div class="empty">
          <h1><img class="empty-bag-mark" src="/images/your-bag-empty.png" alt="Your bag is empty"></h1>
          <a class="btn" href="/shop/">Continue shopping</a>
        </div>
      </div>
    `;
  }
  const sums = totals();
  return `
    <div class="page">
      ${crumbs([{ href: "/", label: "Home" }, { label: "Your bag" }])}
      <h1 class="page-title"><img class="your-bag-mark" src="/images/your-bag.png" alt="Your bag"></h1>
      <div class="bag-layout">
        <div>${items.map((item) => line(item, false)).join("")}</div>
        <aside class="summary">
          <h2>Summary</h2>
          ${summaryMoney(sums)}
          ${chargeSummary(sums)}
          <a class="btn btn-fill" href="/checkout/">Request order</a>
          <p class="fine" style="margin-top:12px">請填寫 Request an order。付款是匯款到工作室銀行帳戶。送出後訂單進到後台，管理者核准才成立，並寄訂單完成通知到你的 Gmail。這個頁面不會扣款，也不會寄信給賣家。</p>
        </aside>
      </div>
    </div>
  `;
}

function renderOrderSent() {
  return `
    <div class="page">
      <div class="empty">
        <h1 class="page-title">訂單已送出</h1>
        <p>這筆訂單在後台等管理者核准。沒有寄信給賣家。請先匯款到工作室帳戶，核准後才成立，並寄訂單完成通知到你的 Gmail。</p>
        <a class="btn" href="/shop/">Back to the shop</a>
      </div>
    </div>
  `;
}

function paymentBlock() {
  const bank = site.bank || {};
  const rows = [
    ["銀行", bank.name],
    ["戶名", bank.holder],
    ["帳號", bank.account],
  ].filter(([, value]) => String(value || "").trim());
  const list = rows.length
    ? `<dl class="pay-account">${rows.map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join("")}</dl>`
    : "";
  return `
    <section class="pay-block">
      <h2>付款方式</h2>
      <p>請匯款到工作室的銀行帳戶。這個頁面不會扣款。</p>
      ${list}
      <p>姓名、電話、Gmail 和 7-11 店名都要填。送出後訂單進到後台，不會寄信給賣家。管理者核准後，會寄訂單完成通知到這個 Gmail。</p>
      <p>請先匯款。管理者在後台核准後，這筆訂單才成立。</p>
    </section>
  `;
}

function renderCheckout() {
  if (params().get("sent") === "1") return renderOrderSent();
  const items = store.getCart();
  if (!items.length) {
    return `
      <div class="page">
        <div class="empty">
          <h1>Nothing to request</h1>
          <p class="fine">購物袋是空的。</p>
          <a class="btn" href="/shop/">Return to the shop</a>
        </div>
      </div>
    `;
  }
  const sums = totals();
  return `
    <div class="page">
      ${crumbs([{ href: "/", label: "Home" }, { href: "/cart/", label: "Your bag" }, { label: "Request" }])}
      <h1 class="page-title">Request an order</h1>
      ${paymentBlock()}
      <div class="checkout-due">
        ${summaryMoney(sums)}
        ${chargeSummary(sums)}
      </div>
      <form id="request-form" style="max-width:440px">
          <label class="field"><span>姓名</span><input name="name" required autocomplete="name"></label>
          <label class="field"><span>電話</span><input name="phone" type="tel" required inputmode="numeric" autocomplete="tel" placeholder="0912345678"></label>
          <label class="field"><span>Gmail</span><input name="gmail" type="email" required autocomplete="email" placeholder="name@gmail.com"></label>
          <label class="field"><span>7-11 店名</span><input name="store" required></label>
          <button class="btn btn-fill" type="submit">送出</button>
          <p class="form-note fine" id="request-note"></p>
      </form>
    </div>
  `;
}

function outfitShots() {
  return looks;
}

function outfitGridHtml() {
  return `<div class="outfit-grid">
    ${outfitShots().map(([slug, src, name]) => `
      <article class="outfit-shot">
        <a class="outfit-frame" href="/product/${slug}/">
          <img src="${src}" alt="${esc(name)}，穿搭" class="photo">
        </a>
        <a class="outfit-name is-taipei" href="/product/${slug}/">${esc(name)}</a>
      </article>
    `).join("")}
  </div>`;
}

function renderOutfit() {
  return `
    <div class="page">
      ${crumbs([{ href: "/", label: "Home" }, { label: "Outfits" }])}
      <h1 class="page-title">${wordImg("outfit", "is-title")}</h1>
      <div class="about-panel">${outfitGridHtml()}</div>
    </div>
  `;
}

function igGrid(items) {
  return `<div class="ig-grid">${items.map((item) => `
    <a class="ig-cell" href="${esc(item.href)}" target="_blank" rel="noopener noreferrer">
      <img class="photo" src="${esc(item.image)}" alt="">
    </a>
  `).join("")}</div>`;
}

function consignmentPanel() {
  return `
    <p class="lede">Consignment at <a class="linkish" href="${site.consignment}" target="_blank" rel="noopener noreferrer">Sugar Needle</a>, ${esc(site.consignmentHandle)}.</p>
    <p class="consign-address"><a class="linkish" href="${site.consignmentMap}" target="_blank" rel="noopener noreferrer">${esc(site.consignmentAddress)}</a></p>
    <p class="fine">${esc(site.consignmentHours)}</p>
    <div class="consign-map">
      <iframe title="Sugar Needle" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=${encodeURIComponent(site.consignmentAddress)}&z=17&output=embed"></iframe>
    </div>
    ${igGrid(site.consignmentPosts || [])}
  `;
}

function instagramPanel() {
  return `
    <section class="ig-profile">
      <div class="ig-head">
        <img class="ig-avatar photo" src="/images/logo.png" alt="">
        <div>
          <p class="ig-name">BiJulia</p>
          <a class="linkish" href="${site.instagram}" target="_blank" rel="noopener noreferrer">${esc(site.instagramHandle)}</a>
          <p class="fine">Based in Taipei. DM for purchase.</p>
        </div>
      </div>
      ${igGrid(site.instagramPosts || [])}
    </section>
  `;
}

function renderAbout() {
  const part = params().get("part");
  if (part === "outfit") {
    location.replace("/outfit/");
    return `<div class="page"></div>`;
  }
  if (part === "consignment") {
    location.replace("/about/#consignment");
    return `<div class="page"></div>`;
  }
  if (part === "ig") {
    location.replace("/customer-care/#contact");
    return `<div class="page"></div>`;
  }
  return `
    <div class="page">
      ${crumbs([{ href: "/", label: "Home" }, { label: "About" }])}
      <h1 class="page-title">${wordImg("about", "is-title")}</h1>
      <section class="about-block" id="consignment">
        <h2 class="page-title">${wordImg("consignment", "is-title")}</h2>
        ${consignmentPanel()}
      </section>
      <div class="about-panel about-gate"><div class="split"><img src="/images/about-gate.jpg" alt="黑色鐵花門的捲草花紋"></div></div>
    </div>
  `;
}

function renderCare() {
  return `
    <div class="page">
      ${crumbs([{ href: "/", label: "Home" }, { label: "Customer Care" }])}
      <h1 class="page-title">${wordImg("care", "is-title")}</h1>
      <p class="fine" style="max-width:48ch;margin:8px 0 12px">這是一間小工作室。需要人回答的時候，請到 Instagram 私訊。</p>
      <section class="care-block" id="shipping">
        <h2 class="page-title">${wordImg("shipping", "is-title")}</h2>
        <p>滿 ${ntd(site.freeShipping)} 免運。未滿則運費 ${ntd(site.shippingFee)}。一般顧客沒有會員優惠。一般會員在社群分享商品後，下次免運。高級會員是買過三次的客人，作品 9 折，而且免運。項鍊裝在麻布袋裡，5–8 天內寄出。貼紙放進封套，多半 3 天內寄出。</p>
      </section>
      <section class="care-block" id="returns">
        <h2 class="page-title">${wordImg("returns", "is-title")}</h2>
        <p>未穿過的項鍊可在 7 天內退回，請放回原來的袋子。貼紙只有完全未使用才能退。寄回之前請先到 Instagram 私訊告訴我們。</p>
      </section>
      <section class="care-block" id="care">
        <h2 class="page-title">${wordImg("jewelry", "is-title")}</h2>
        <p>沒有戴的時候，把項鍊放回鏈袋裡。</p>
      </section>
      <section class="care-block" id="contact">
        <h2 class="page-title">${wordImg("contact", "is-title")}</h2>
        <p>訂單或修理，請到 Instagram 私訊 <a class="linkish" href="${site.instagram}">${esc(site.instagramHandle)}</a>。</p>
        <p>Consignment at <a class="linkish" href="${site.consignment}" target="_blank" rel="noopener noreferrer">${esc(site.consignmentHandle)}</a>.</p>
        ${instagramPanel()}
      </section>
    </div>
  `;
}

function configBanner() {
  if (auth.isConfigured()) return "";
  return `<div class="account-banner" role="status">尚未接上 BiJulia 的 Supabase。需要環境變數 SUPABASE_URL 與 SUPABASE_ANON_KEY。這個畫面沒有讀取或寫入任何帳號。</div>`;
}

function accountView() {
  const value = params().get("view");
  if (value === "register" || value === "admin") return value;
  return "login";
}

function accountSwitch(view) {
  const link = (key, href, label) => `<a href="${href}"${view === key ? ' class="is-on" aria-current="page"' : ""}>${label}</a>`;
  return `<nav class="account-switch" aria-label="帳戶">
    ${link("login", "/account/", "Login")}
    ${link("register", "/account/?view=register", "註冊").replace("<a ", "<a data-open-register ")}
    ${link("admin", "/account/?view=admin", "核准訂單")}
  </nav>`;
}

function formatWhen(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return esc(value);
  return esc(date.toLocaleString("zh-Hant", { hour12: false }));
}

function purchaseHtml(history) {
  if (!Array.isArray(history) || !history.length) return "尚無";
  return history.map((order) => {
    const when = order && order.at ? formatWhen(order.at) : "";
    const items = Array.isArray(order && order.items)
      ? order.items.map((item) => `${esc(item.name || "")} × ${esc(item.qty || "")}`).join("、")
      : "";
    return `${when} ${items}`.trim();
  }).join("<br>");
}

function profileDl(profile, previewRole) {
  const row = (label, value) => `<dt>${label}</dt><dd>${value}</dd>`;
  if (!profile) {
    return `<dl class="profile-dl">
      ${row("顧客編號", "—")}
      ${row("姓名 / 電話", "—")}
      ${row("電子郵件 / 地址", "—")}
      ${row("會員等級", "—")}
      ${row("角色", previewRole)}
      ${row("購買紀錄", "尚無")}
      ${row("建立時間", "—")}
    </dl>`;
  }
  return `<dl class="profile-dl">
    ${row("顧客編號", esc(profile.id))}
    ${row("姓名 / 電話", `${esc(profile.name || "—")} / ${esc(profile.phone || "—")}`)}
    ${row("電子郵件 / 地址", `${esc(profile.email || "—")} / ${esc(profile.address || "—")}`)}
    ${row("會員等級", esc(profile.tier === "高級" || profile.tier === "一般會員" ? profile.tier : "一般顧客"))}
    ${row("角色", profile.role === "super_admin" ? "管理者" : "顧客")}
    ${row("購買紀錄", purchaseHtml(profile.purchase_history))}
    ${row("建立時間", formatWhen(profile.created_at))}
  </dl>`;
}

function logoutButton() {
  return `<div class="account-actions"><button class="btn" type="button" data-logout>登出</button></div>`;
}

function renderLogin() {
  return `<div class="page login-quiet"></div>`;
}

function renderRegister() {
  return `<div class="page login-quiet"></div>`;
}

function tierChoices(row) {
  const tier = row.tier === "高級" || row.tier === "一般會員" ? row.tier : "一般顧客";
  const choice = (value) => {
    const on = tier === value;
    return `<button class="tier-choice${on ? " is-on" : ""}" type="button" data-set-tier="${esc(row.id || "")}" data-tier-value="${value}"${on ? " disabled" : ""}>${value}</button>`;
  };
  return `<span class="tier-choices">${choice("一般顧客")}${choice("一般會員")}${choice("高級")}</span>`;
}

function peopleTable(rows, emptyLabel = "沒有資料") {
  const head = `<tr>
    <th>顧客編號</th><th>姓名 / 電話</th><th>電子郵件 / 地址</th><th>會員等級</th><th>角色</th><th>購買紀錄</th><th>建立時間</th>
  </tr>`;
  const body = rows.length
    ? rows.map((row) => `<tr>
        <td>${esc(row.id || "")}</td>
        <td>${esc(row.name || "—")} / ${esc(row.phone || "—")}</td>
        <td>${esc(row.email || "—")} / ${esc(row.address || "—")}</td>
        <td>${tierChoices(row)}</td>
        <td>顧客</td>
        <td>${purchaseHtml(row.purchase_history)}</td>
        <td>${formatWhen(row.created_at)}</td>
      </tr>`).join("")
    : `<tr><td colspan="7">${esc(emptyLabel)}</td></tr>`;
  return `<div class="account-table-wrap"><table class="account-table"><thead>${head}</thead><tbody>${body}</tbody></table></div>`;
}

function renderAdmin(profile) {
  if (!profile) {
    return `<div class="page">
      ${crumbs([{ href: "/", label: "Home" }, { label: "核准" }])}
      <h1 class="page-title">核准訂單</h1>
      ${accountSwitch("admin")}
      ${configBanner()}
      <p class="account-copy">顧客註冊後就是顧客，不用驗證信箱，也不用核准帳號。管理者只核准訂單，也可以調整會員等級、修改存貨，以及上傳新商品。一般顧客沒有會員優惠。一般會員在社群分享商品後，下次免運。高級會員是買過三次的客人，作品 9 折，而且免運。${esc(site.email)} 註冊後就是管理者。不會寄信給賣家。核准訂單後會打開 Gmail，把訂單完成通知寄給顧客。</p>
      <p class="fine">現在沒有管理者登入，所以沒有訂單。</p>
    </div>`;
  }
  return `<div class="page">
    ${crumbs([{ href: "/", label: "Home" }, { label: "核准" }])}
    <h1 class="page-title">核准訂單</h1>
    ${configBanner()}
    <p class="account-copy">顧客註冊後就是顧客，不用驗證信箱，也不用核准帳號。管理者只核准訂單。待核准的訂單列在下面，核准後才成立，並打開 Gmail 把訂單完成通知寄給顧客。顧客名單裡可以直接改會員等級。下面也可以改存貨，或上傳一張照片加上新商品。不會寄信給賣家。</p>
    <p class="fine">登入身分：${esc(profile.email || "")}，管理者。</p>
    <p class="form-note fine" id="admin-note" role="status"></p>
    <div id="admin-lists"><p class="fine">讀取中。</p></div>
    ${logoutButton()}
  </div>`;
}

function tierSentence(profile) {
  if (profile?.tier === "高級") return "你是高級會員。買過三次，作品 9 折，而且免運。";
  if (profile?.tier === "一般會員") return "你是一般會員。在社群分享商品後，下次免運。";
  return "你是一般顧客，沒有會員優惠。";
}

function renderCustomer(profile) {
  return `<div class="page">
    ${crumbs([{ href: "/", label: "Home" }, { label: "帳戶" }])}
    <h1 class="page-title">帳戶</h1>
    ${configBanner()}
    <p class="account-copy">這是你自己的帳戶。角色是顧客。${tierSentence(profile)}這裡不會列出其他人。</p>
    ${profileDl(profile, "顧客")}
    ${logoutButton()}
  </div>`;
}

function renderSignedInWithoutProfile() {
  return `<div class="page">
    ${crumbs([{ href: "/", label: "Home" }, { label: "帳戶" }])}
    <h1 class="page-title">帳戶</h1>
    ${configBanner()}
    <p class="account-copy">已登入。註冊後就是顧客，不用驗證信箱，也不用等管理者核准。</p>
    ${logoutButton()}
  </div>`;
}

function renderAccount() {
  const profile = auth.getProfile();
  const session = auth.getSession();
  if (profile?.role === "super_admin") {
    document.title = "核准訂單 — BiJulia";
    return renderAdmin(profile);
  }
  if (profile?.role === "pending") {
    document.title = "帳戶 — BiJulia";
    return renderCustomer(profile);
  }
  if (profile) {
    document.title = "帳戶 — BiJulia";
    return renderCustomer(profile);
  }
  if (session) {
    document.title = "帳戶 — BiJulia";
    return renderSignedInWithoutProfile();
  }
  const view = accountView();
  if (view === "admin") {
    document.title = "核准訂單 — BiJulia";
    return renderAdmin(null);
  }
  if (view === "register") {
    document.title = "註冊 — BiJulia";
    return renderRegister();
  }
  document.title = "Login — BiJulia";
  return renderLogin();
}

let adminLoad = 0;
async function loadAdminLists() {
  const box = document.getElementById("admin-lists");
  if (!box) return;
  const token = ++adminLoad;
  const result = await auth.listProfiles();
  if (token !== adminLoad) return;
  const current = document.getElementById("admin-lists");
  if (!current) return;
  if (!result.ok) {
    const message = result.code === "unconfigured"
      ? "沒有接上 Supabase，沒有讀取名單。"
      : (result.message || "讀不到名單。");
    current.innerHTML = `<p class="fine">${esc(message)}</p>`;
    return;
  }
  const orders = await auth.listOrders();
  if (token !== adminLoad) return;
  const customers = result.rows.filter((row) => row.role !== "super_admin");
  const orderRows = orders.ok ? orders.rows : [];
  const waiting = orderRows.filter((row) => row.status === "pending");
  const approved = orderRows.filter((row) => row.status === "approved");
  const orderNote = orders.ok
    ? ""
    : `<p class="fine">${esc(orders.message || "讀不到訂單。")}</p>`;
  current.innerHTML = `
    <section class="account-section"><h2>待核准訂單</h2>${orderNote}${waiting.length ? "" : `<p class="fine">目前沒有待核准的訂單。</p>`}${ordersTable(waiting, true)}</section>
    <section class="account-section"><h2>已核准訂單</h2>${ordersTable(approved, false)}</section>
    <section class="account-section"><h2>顧客</h2><p class="fine">直接改會員等級。一般顧客沒有優惠。一般會員是在社群分享商品後，下次免運。買過三次會變成高級，作品 9 折，而且免運。</p>${peopleTable(customers)}</section>
    <section class="account-section"><h2>存貨</h2><p class="fine">改數量後按儲存。0 就是售完。貼紙要分顏色填。按編輯，作品會出現在下面的新商品，可以改完再儲存。下架後商店不再顯示。</p>${stockTable()}</section>
    <section class="account-section" id="catalog-editor"><h2>新商品</h2>
      <p class="fine" id="catalog-editing"></p>
      <form class="account-form" id="catalog-form">
        <input name="slug" type="hidden" value="">
        <label class="field"><span>名稱</span><input name="name" type="text" required></label>
        <label class="field"><span>價格（NT$）</span><input name="price" type="number" min="0" step="1" required></label>
        <label class="field"><span>分類</span>
          <select name="category">
            <option value="necklace">Necklace</option>
            <option value="sticker">Sticker</option>
          </select>
        </label>
        <label class="field"><span>存貨</span><input name="stock" type="number" min="0" step="1" value="1" required></label>
        <label class="field"><span>說明</span><textarea name="description" rows="3"></textarea></label>
        <label class="field"><span>照片</span><input name="photo" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required></label>
        <div class="catalog-actions">
          <button class="btn" type="submit">上傳</button>
          <button class="btn" type="button" data-set-listed hidden>下架</button>
        </div>
      </form>
    </section>
  `;
}

function ordersTable(rows, approve) {
  const head = `<tr><th>時間</th><th>姓名 / 電話</th><th>Gmail / 7-11</th><th>作品</th><th>合計</th><th>${approve ? "核准" : "通知"}</th></tr>`;
  const body = rows.length
    ? rows.map((row) => `<tr>
        <td>${formatWhen(row.created_at)}</td>
        <td>${esc(row.name || "—")} / ${esc(row.phone || "—")}</td>
        <td>${esc(row.gmail || "—")} / ${esc(row.store || "—")}</td>
        <td>${esc(orderItems(row.items))}</td>
        <td>${ntd(Number(row.total) || 0)}</td>
        ${approve
          ? `<td><button class="btn" type="button" data-approve-order="${esc(row.id || "")}">核准</button></td>`
          : `<td><a class="btn" href="${esc(buildOrderNoticeUrl(row))}" target="_blank" rel="noopener">寄完成通知</a></td>`}
      </tr>`).join("")
    : `<tr><td colspan="6">沒有訂單</td></tr>`;
  return `<div class="account-table-wrap"><table class="account-table"><thead>${head}</thead><tbody>${body}</tbody></table></div>`;
}

function stockValue(known, amount, soldOut) {
  if (known) return amount;
  return soldOut ? 0 : "";
}

function stockState(product) {
  let state;
  if (product.colors && product.colors.some((color) => Number.isInteger(color.stock))) {
    state = product.colors.map((color) => (
      color.stock === 0 ? `${color.name} 售完` : `${color.name} 可賣 ${color.stock}`
    )).join(" · ");
  } else {
    const known = Number.isInteger(product.stock);
    state = known ? (product.stock === 0 ? "售完" : `可賣 ${product.stock}`) : (product.soldOut ? "售完" : "可賣");
  }
  return product.unlisted ? `已下架 · ${state}` : state;
}

function stockFields(product) {
  if (product.colors && product.colors.length) {
    const fields = product.colors.map((color) => {
      const known = Number.isInteger(color.stock);
      const value = stockValue(known, color.stock, Boolean(color.soldOut));
      return `<label>${esc(color.name)} <input class="stock-input" type="number" min="0" step="1" value="${value}" data-color-stock="${esc(color.id)}" aria-label="${esc(color.name)} 存貨"></label>`;
    }).join("");
    return `<div class="stock-colors">${fields}</div>`;
  }
  const known = Number.isInteger(product.stock);
  const value = stockValue(known, product.stock, Boolean(product.soldOut));
  return `<input class="stock-input" type="number" min="0" step="1" value="${value}" aria-label="${esc(product.name)} 存貨">`;
}

function stockTable() {
  const head = `<tr><th>作品</th><th>現在</th><th>存貨</th><th></th></tr>`;
  const body = products.map((product) => `<tr data-stock-row="${esc(product.slug)}">
      <td>${esc(product.name)}</td>
      <td>${esc(stockState(product))}</td>
      <td>${stockFields(product)}</td>
      <td><div class="stock-actions">
        <button class="btn" type="button" data-edit-product="${esc(product.slug)}">編輯</button>
        <button class="btn" type="button" data-save-stock="${esc(product.slug)}">儲存</button>
        <button class="btn" type="button" data-set-listed="${esc(product.slug)}" data-listed="${product.unlisted ? "1" : "0"}">${product.unlisted ? "上架" : "下架"}</button>
      </div></td>
    </tr>`).join("");
  return `<div class="account-table-wrap"><table class="account-table"><thead>${head}</thead><tbody>${body}</tbody></table></div>`;
}

function wholeCount(value) {
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) return value;
  if (typeof value === "string" && /^\d+$/.test(value.trim())) return Number(value.trim());
  return null;
}

function colorCounts(product, raw) {
  if (!product.colors || !product.colors.length) return null;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const counts = {};
  for (const color of product.colors) {
    const count = wholeCount(raw[color.id]);
    if (count === null) return null;
    counts[color.id] = count;
  }
  return counts;
}

function applyColorStock(product, counts) {
  let total = 0;
  for (const color of product.colors) {
    const count = counts[color.id];
    color.stock = count;
    color.soldOut = count === 0;
    total += count;
  }
  product.colorStock = counts;
  product.stock = total;
  product.soldOut = total === 0;
  if (total > 0) product.maxQty = Math.max(...product.colors.filter((color) => color.stock > 0).map((color) => color.stock));
}

function clearColorStock(product) {
  if (!product.colors) return;
  delete product.colorStock;
  for (const color of product.colors) {
    delete color.stock;
    delete color.soldOut;
  }
}

function applyCatalogFields(product, row) {
  if (row.name) product.name = row.name;
  if (row.price !== null && row.price !== undefined && row.price !== "") {
    const price = Math.round(Number(row.price));
    if (Number.isInteger(price) && price >= 0) product.price = price;
  }
  if (typeof row.description === "string" && row.description) product.description = row.description;
  if (row.category === "necklace" || row.category === "sticker") product.category = row.category;
  if (row.image && row.image !== product.image) {
    const rest = (product.images || []).filter((src) => src !== row.image && src !== product.image);
    product.image = row.image;
    product.images = [row.image, ...rest];
  }
  if (row.listed === false) product.unlisted = true;
  else if (row.listed === true) product.unlisted = false;
}

function applyCatalog(rows) {
  if (!Array.isArray(rows)) return;
  for (const row of rows) {
    const stock = Math.max(0, Math.round(Number(row.stock) || 0));
    const existing = products.find((item) => item.slug === row.slug);
    if (existing) {
    const counts = colorCounts(existing, row.color_stock);
    if (counts) {
      applyColorStock(existing, counts);
    } else if (row.stock !== null && row.stock !== undefined && row.stock !== "") {
      const stock = Math.max(0, Math.round(Number(row.stock) || 0));
      clearColorStock(existing);
      existing.stock = stock;
      existing.soldOut = stock === 0;
      if (existing.colors && stock === 0) {
        for (const color of existing.colors) color.soldOut = true;
      }
      if (stock > 0) existing.maxQty = stock;
    }
    applyCatalogFields(existing, row);
    continue;
    }
    if (!row.name || !row.image) continue;
    products.push({
      slug: row.slug,
      name: row.name,
      price: Number(row.price) || 0,
      currency: row.currency || "TWD",
      category: row.category === "sticker" ? "sticker" : "necklace",
      collection: "",
      isNew: false,
      isBestSeller: false,
      soldOut: stock === 0,
      stock,
      maxQty: Math.max(stock, 1),
      image: row.image,
      images: [row.image],
      length: "",
      materials: "",
      description: row.description || "",
      details: "",
      uploaded: true,
      unlisted: row.listed === false,
    });
  }
}

function orderItems(items) {
  if (!Array.isArray(items) || !items.length) return "—";
  return items.map((item) => `${item.name || "作品"} × ${item.qty || 1}`).join("、");
}

function buildOrderNoticeUrl(order) {
  const items = orderItems(order && order.items);
  const shipping = Number(order && order.shipping) || 0;
  const body = [
    `${(order && order.name) || ""} 你好，`,
    "",
    "你的 BiJulia 訂單已經完成。",
    "",
    `作品：${items === "—" ? "" : items}`,
    `7-11：${(order && order.store) || ""}`,
    `合計：${ntd(Number(order && order.total) || 0)}`,
    shipping ? `運費：${ntd(shipping)}` : "運費：免運",
  ].join("\n");
  const query = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: String((order && order.gmail) || "").trim(),
    su: "BiJulia 訂單完成",
    body,
  });
  return `https://mail.google.com/mail/?${query.toString()}`;
}

function openOrderNotice(popup, url) {
  if (popup && !popup.closed) {
    popup.location.href = url;
    return true;
  }
  const opened = window.open(url, "_blank", "noopener");
  return Boolean(opened);
}

async function approveOrderRow(button) {
  const note = document.getElementById("admin-note");
  button.disabled = true;
  const popup = window.open("", "_blank");
  const result = await auth.approveOrder(button.dataset.approveOrder);
  if (!result.ok) {
    if (popup && !popup.closed) popup.close();
    if (note) {
      note.textContent = result.code === "unconfigured"
        ? "沒有接上 Supabase，訂單沒有核准。"
        : (result.message || "沒有核准。");
    }
    button.disabled = false;
    return;
  }
  const url = buildOrderNoticeUrl(result.order || {});
  const opened = openOrderNotice(popup, url);
  if (note) {
    note.innerHTML = opened
      ? "訂單已核准。已打開給顧客的 Gmail，請寄出訂單完成通知。"
      : `訂單已核准。請<a href="${esc(url)}" target="_blank" rel="noopener">打開 Gmail</a>，寄出訂單完成通知給顧客。`;
  }
  await loadAdminLists();
}

async function saveMemberTier(button) {
  const note = document.getElementById("admin-note");
  const next = button.getAttribute("data-tier-value");
  const tier = next === "高級" || next === "一般會員" ? next : "一般顧客";
  const row = button.closest("tr");
  const choices = row ? [...row.querySelectorAll("[data-set-tier]")] : [button];
  choices.forEach((el) => { el.disabled = true; });
  const result = await auth.setMemberTier(button.getAttribute("data-set-tier"), tier);
  if (!result.ok) {
    choices.forEach((el) => { el.disabled = el.classList.contains("is-on"); });
    if (note) note.textContent = result.message || "會員等級沒有改成。";
    return;
  }
  choices.forEach((el) => {
    const on = el.getAttribute("data-tier-value") === tier;
    el.classList.toggle("is-on", on);
    el.disabled = on;
  });
  if (note) {
    note.textContent = tier === "高級"
      ? "已改成高級會員。作品 9 折，而且免運。"
      : tier === "一般會員"
        ? "已改成一般會員。在社群分享商品後，下次免運。"
        : "已改成一般顧客。沒有會員優惠。";
  }
}

function renderNotFound() {
  document.title = "Page not found — BiJulia";
  return `
    <div class="page">
      <div class="empty">
        <h1>This page has wandered off</h1>
        <p class="fine">你要的那一件也許換了名字，或是路徑打錯了。</p>
        <a class="btn" href="/shop/">Back to the shop</a>
      </div>
    </div>
  `;
}

function renderMain() {
  const root = document.getElementById("app");
  const views = {
    home: renderHome,
    shop: renderShop,
    collections: renderCollections,
    collection: renderCollection,
    product: renderProduct,
    cart: renderCart,
    checkout: renderCheckout,
    outfit: renderOutfit,
    about: renderAbout,
    care: renderCare,
    account: renderAccount,
    "not-found": renderNotFound,
  };
  const titles = {
    home: "BiJulia",
    shop: "Shop — BiJulia",
    collections: "Collections — BiJulia",
    cart: "Your Bag — BiJulia",
    checkout: "Request an Order — BiJulia",
    outfit: "About — BiJulia",
    about: "About — BiJulia",
    care: "Customer Care — BiJulia",
    account: "帳戶 — BiJulia",
  };
  if (titles[page]) document.title = titles[page];
  root.innerHTML = (views[page] || renderNotFound)();
  const video = root.querySelector("video");
  if (video) {
    video.muted = true;
    video.play().catch(() => {});
  }
  if (page === "account" && auth.getProfile()?.role === "super_admin") loadAdminLists();
  syncAccountLogin();
}

function drawerHtml() {
  const items = store.getCart();
  const body = document.getElementById("drawer-body");
  const foot = document.getElementById("drawer-foot");
  if (!items.length) {
    body.innerHTML = `<div class="empty"><h2><img class="empty-bag-mark" src="/images/your-bag-empty.png" alt="Your bag is empty"></h2><p class="fine">一條項鍊或一枚貝殼，可以先放在這裡。</p></div>`;
    foot.innerHTML = `<a class="btn btn-fill" href="/shop/">Shop the atelier</a>`;
    return;
  }
  const sums = totals();
  body.innerHTML = items.map((item) => line(item, true)).join("");
  foot.innerHTML = `
    ${discountRow(sums)}
    <div class="summary-row"><span>Total</span><span>${dueText(sums)}</span></div>
    ${sums.basis ? `<p class="fine">${esc(shippingNote(sums.basis))}</p>` : ""}
    <a class="btn btn-fill is-mark" href="/cart/"><img class="view-bag-mark" src="/images/view-bag.png" alt="View bag"></a>
  `;
}

function accountLinksHtml() {
  const profile = auth.getProfile();
  const here = currentPath().startsWith("/account");
  if (profile || auth.getSession()) {
    const label = profile?.role === "super_admin" ? "管理者" : "帳戶";
    return `<a href="/account/"${here ? ' aria-current="page"' : ""}>${label}</a>`;
  }
  const view = accountView();
  const loginOn = here && view === "login" ? ' aria-current="page"' : "";
  const registerOn = here && view === "register" ? ' aria-current="page"' : "";
  return `<a href="/account/"${loginOn}>Login</a><a href="/account/?view=register"${registerOn}>註冊</a>`;
}

function refreshAccountChrome() {
  const html = accountLinksHtml();
  document.querySelectorAll("[data-account-links]").forEach((slot) => {
    slot.innerHTML = html;
  });
  const headerLogin = document.querySelector("[data-header-login]");
  if (headerLogin) {
    const profile = auth.getProfile();
    const here = currentPath().startsWith("/account");
    if (profile || auth.getSession()) {
      headerLogin.textContent = profile?.role === "super_admin" ? "Admin" : "Account";
      headerLogin.href = "/account/";
    } else {
      headerLogin.textContent = "Login";
      headerLogin.href = "/account/";
    }
    if (here) headerLogin.setAttribute("aria-current", "page");
    else headerLogin.removeAttribute("aria-current");
  }
  syncLoginTriggers();
}

function refreshChrome() {
  const cartN = store.cartCount();
  document.querySelectorAll("[data-cart-count]").forEach((node) => {
    node.textContent = String(cartN);
    node.hidden = cartN === 0;
  });
  const bagBtn = document.querySelector("[data-open-drawer]");
  if (bagBtn) bagBtn.setAttribute("aria-label", cartN ? `購物袋，${cartN} 件` : "購物袋");
  drawerHtml();
  refreshAccountChrome();
}

function applyOverlay() {
  document.body.classList.toggle("lock", ui.drawer || ui.search || ui.menu || loginUi.open);
  document.querySelector(".scrim").classList.toggle("is-on", ui.drawer);
  document.querySelector(".scrim").hidden = false;
  const drawer = document.getElementById("drawer");
  const search = document.getElementById("search");
  const menu = document.getElementById("mobile-nav");
  drawer.classList.toggle("is-open", ui.drawer);
  drawer.setAttribute("aria-hidden", String(!ui.drawer));
  search.classList.toggle("is-open", ui.search);
  search.setAttribute("aria-hidden", String(!ui.search));
  menu.classList.toggle("is-open", ui.menu);
  menu.setAttribute("aria-hidden", String(!ui.menu));
  if (ui.search) {
    renderSearch(document.getElementById("q").value || "");
    document.getElementById("q").focus();
  }
}

function openOverlay(name) {
  ui.drawer = name === "drawer";
  ui.search = name === "search";
  ui.menu = name === "menu";
  if (ui.drawer) drawerHtml();
  applyOverlay();
}

function closeOverlays() {
  ui.drawer = false;
  ui.search = false;
  ui.menu = false;
  applyOverlay();
}

function syncLoginTriggers() {
  const signedIn = !!(auth.getProfile() || auth.getSession());
  document.querySelectorAll("[data-header-login]").forEach((el) => {
    if (signedIn) {
      el.removeAttribute("aria-haspopup");
      el.removeAttribute("aria-controls");
      el.removeAttribute("aria-expanded");
      return;
    }
    el.setAttribute("aria-haspopup", "dialog");
    el.setAttribute("aria-controls", "login-dialog");
    el.setAttribute("aria-expanded", String(loginUi.open && loginUi.opener === el));
  });
}

function loginFocusables() {
  const panel = document.querySelector("#login-dialog .login-panel");
  if (!panel) return [];
  return [...panel.querySelectorAll("button, a[href], input, textarea, select")].filter((el) => !el.disabled && !el.closest("[hidden]"));
}

function setAuthMode(mode) {
  const root = document.getElementById("login-dialog");
  if (!root) return;
  const registerMode = mode === "register";
  const loginForm = root.querySelector("#login-form");
  const registerForm = root.querySelector("#register-form");
  const title = root.querySelector("#login-dialog-title");
  const close = root.querySelector("button[data-close-login]");
  if (loginForm) loginForm.hidden = registerMode;
  if (registerForm) registerForm.hidden = !registerMode;
  if (title) title.textContent = registerMode ? "註冊" : "Login";
  if (close) close.setAttribute("aria-label", registerMode ? "關閉註冊" : "關閉登入");
  loginUi.mode = registerMode ? "register" : "login";
}

function openLoginDialog(opener, mode) {
  const root = document.getElementById("login-dialog");
  if (!root) return;
  const trigger = opener || document.querySelector("[data-header-login]");
  if (!loginUi.open) {
    loginUi.returnMenu = !!(trigger && trigger.closest("#mobile-nav") && ui.menu);
    if (ui.drawer || ui.search || ui.menu) closeOverlays();
  }
  loginUi.open = true;
  loginUi.opener = trigger || null;
  root.hidden = false;
  setAuthMode(mode === "register" ? "register" : "login");
  const form = root.querySelector(loginUi.mode === "register" ? "#register-form" : "#login-form");
  const button = form && form.querySelector("button[type=submit]");
  if (button) button.disabled = false;
  applyOverlay();
  syncLoginTriggers();
  const field = form && form.querySelector("input");
  if (field) field.focus();
}

function closeLoginDialog(options = {}) {
  if (!loginUi.open) return;
  const restore = options.restore !== false;
  const opener = loginUi.opener;
  const returnMenu = loginUi.returnMenu && restore;
  loginUi.open = false;
  loginUi.opener = null;
  loginUi.returnMenu = false;
  const root = document.getElementById("login-dialog");
  if (root) root.hidden = true;
  if (page === "account" && (accountView() === "login" || accountView() === "register") && !auth.getProfile() && !auth.getSession()) {
    loginUi.dismissedOnAccount = accountView();
  }
  applyOverlay();
  syncLoginTriggers();
  if (returnMenu) openOverlay("menu");
  if (restore && opener && opener.focus) {
    opener.focus();
    return;
  }
  if (root && root.contains(document.activeElement)) {
    const fallback = document.querySelector("[data-header-login]");
    if (fallback) fallback.focus();
  }
}

function syncAccountLogin() {
  if (!authReady || loginUi.open) return;
  if (page !== "account") return;
  const view = accountView();
  if (view !== "login" && view !== "register") return;
  if (loginUi.dismissedOnAccount === view) return;
  if (auth.getProfile() || auth.getSession()) return;
  openLoginDialog(document.querySelector("[data-header-login]"), view === "register" ? "register" : "login");
}

function trapLoginTab(event) {
  const panel = document.querySelector("#login-dialog .login-panel");
  if (!panel) return;
  const items = loginFocusables();
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  const active = document.activeElement;
  if (!panel.contains(active)) {
    event.preventDefault();
    (event.shiftKey ? last : first).focus();
    return;
  }
  if (event.shiftKey && active === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

function searchPool(query) {
  const text = query.trim().toLowerCase();
  if (!text) return { label: "工作室的新品", list: products.filter((item) => item.isNew && !item.unlisted).slice(0, 4) };
  const list = products.filter((item) => {
    if (item.unlisted) return false;
    const collection = collectionBySlug(item.collection);
    const hay = [item.name, item.description, item.details, item.materials, item.category, collection ? collection.name : ""]
      .join(" ")
      .toLowerCase();
    return hay.includes(text);
  });
  return { label: list.length ? "作品" : "沒有這個名字的作品", list };
}

function renderSearch(query) {
  const { label, list } = searchPool(query);
  const box = document.getElementById("search-results");
  const rows = list.map((item) => `
    <a class="search-hit" href="${productHref(item)}">
      <img src="${item.image}" alt="" class="${fitClass(item)}">
      <strong class="${item.category === "necklace" ? "is-taipei" : ""}">${esc(item.name)}</strong>
      <span>${priceText(item)}</span>
    </a>
  `).join("");
  const empty = query.trim() && !list.length ? `<p class="fine">試試玫瑰、珍珠、蕾絲或貝殼。</p>` : "";
  box.innerHTML = `<p class="search-label">${esc(label)}</p>${rows}${empty}`;
}

function orderSnapshot(data) {
  const items = store.getCart().map((item) => {
    const product = productBySlug(item.slug);
    if (!product) return null;
    const tone = colorById(product, item.color);
    return {
      slug: product.slug,
      name: tone ? `${product.name} (${tone.name})` : product.name,
      qty: item.qty,
      price: product.price * item.qty,
      currency: product.currency,
    };
  }).filter(Boolean);
  const sums = totals();
  return {
    at: new Date().toISOString(),
    name: data.name,
    phone: data.phone,
    gmail: data.gmail,
    store: data.store,
    items,
    shipping: sums.ship,
    total: sums.due,
  };
}

function buildRestockUrl(product, gmail) {
  const body = [
    `請在 ${product.name} 補貨時通知我。`,
    "補貨後請寄到這個 Gmail。",
    "",
    `作品：${product.name}`,
    `Gmail：${gmail}`,
  ].join("\n");
  const query = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: `${site.email},${gmail}`,
    su: "BiJulia 補貨通知",
    body,
  });
  return `https://mail.google.com/mail/?${query.toString()}`;
}

function onClick(event) {
  const tierButton = event.target.closest("[data-set-tier]");
  if (tierButton) {
    event.preventDefault();
    saveMemberTier(tierButton);
    return;
  }
  const stockButton = event.target.closest("[data-save-stock]");
  if (stockButton) {
    event.preventDefault();
    saveStockRow(stockButton);
    return;
  }
  const editButton = event.target.closest("[data-edit-product]");
  if (editButton) {
    event.preventDefault();
    editProduct(editButton.getAttribute("data-edit-product") || "");
    return;
  }
  const listedButton = event.target.closest("[data-set-listed]");
  if (listedButton) {
    event.preventDefault();
    setListedRow(listedButton);
    return;
  }
  const approveOrder = event.target.closest("[data-approve-order]");
  if (approveOrder) {
    event.preventDefault();
    approveOrderRow(approveOrder);
    return;
  }
  if (event.target.closest("[data-logout]")) {
    event.preventDefault();
    auth.logoutAccount().then(() => {
      location.href = "/account/";
    });
    return;
  }
  const colorBtn = event.target.closest(".color-option");
  if (colorBtn) {
    const group = colorBtn.closest(".color-options");
    group.querySelectorAll(".color-option").forEach((btn) => {
      const on = btn === colorBtn;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-checked", on ? "true" : "false");
    });
    const preview = document.querySelector("[data-color-preview]");
    if (preview && colorBtn.dataset.image) {
      preview.src = colorBtn.dataset.image;
      const name = colorBtn.querySelector("span")?.textContent || "";
      const title = document.querySelector(".pdp h1")?.textContent || "";
      preview.alt = `${title}, ${name}`;
    }
    syncColorBuy(colorBtn);
    return;
  }
  const add = event.target.closest("[data-add]");
  if (add) {
    event.preventDefault();
    const product = productBySlug(add.dataset.add);
    if (!product || product.soldOut || product.unlisted) return;
    const scope = add.closest(".pdp");
    const input = scope ? scope.querySelector("[data-qty-input]") : null;
    const qty = input ? Number(input.value) : 1;
    const selected = scope ? scope.querySelector(".color-option.is-on") : null;
    const colorId = selected ? selected.dataset.color || "" : "";
    const tone = colorById(product, colorId);
    if (tone && tone.soldOut) return;
    const max = buyLimit(product, colorId);
    if (max <= 0) return;
    store.addToCart(product.slug, qty, max, colorId);
    openOverlay("drawer");
    return;
  }
  const lineStep = event.target.closest("[data-line-step]");
  if (lineStep) {
    const product = productBySlug(lineStep.dataset.slug);
    const color = lineStep.dataset.color || "";
    const current = store.getCart().find((item) => item.slug === lineStep.dataset.slug && (item.color || "") === color);
    const step = Number(lineStep.dataset.lineStep);
    const tone = product ? colorById(product, color) : null;
    if (product && product.soldOut && step > 0) return;
    if (tone && tone.soldOut && step > 0) return;
    const max = product ? buyLimit(product, color) : 5;
    if (step > 0 && max <= 0) return;
    store.setQty(lineStep.dataset.slug, (current ? current.qty : 1) + step, max, color);
    return;
  }
  const qtyStep = event.target.closest("[data-qty-step]");
  if (qtyStep) {
    const wrap = qtyStep.parentElement;
    const input = wrap.querySelector("[data-qty-input]");
    const max = Number(wrap.dataset.max || 5);
    const next = Math.max(1, Math.min(max, Number(input.value) + Number(qtyStep.dataset.qtyStep)));
    input.value = String(next);
    return;
  }
  const remove = event.target.closest("[data-remove]");
  if (remove) {
    store.removeFromCart(remove.dataset.remove, remove.dataset.color || "");
    return;
  }
  const filter = event.target.closest("[data-filter]");
  if (filter && page === "shop") {
    const url = new URL(location.href);
    const value = filter.dataset.filter;
    if (value === "all") url.searchParams.delete("filter");
    else url.searchParams.set("filter", value);
    history.pushState({}, "", url);
    renderMain();
    refreshChrome();
    return;
  }
  const showRegister = event.target.closest("[data-open-register]");
  if (showRegister && !auth.getProfile() && !auth.getSession()) {
    event.preventDefault();
    openLoginDialog(loginUi.open ? loginUi.opener : showRegister, "register");
    return;
  }
  const showLogin = event.target.closest("[data-show-login]");
  if (showLogin && !auth.getProfile() && !auth.getSession()) {
    event.preventDefault();
    openLoginDialog(loginUi.open ? loginUi.opener : showLogin, "login");
    return;
  }
  const loginTrigger = event.target.closest("[data-header-login]");
  if (loginTrigger && !auth.getProfile() && !auth.getSession()) {
    event.preventDefault();
    openLoginDialog(loginTrigger, "login");
    return;
  }
  if (event.target.closest("[data-close-login]")) {
    event.preventDefault();
    closeLoginDialog();
    return;
  }
  if (event.target.closest("[data-open-drawer]")) { openOverlay("drawer"); return; }
  if (event.target.closest("[data-open-search]")) { openOverlay("search"); return; }
  if (event.target.closest("[data-open-menu]")) { openOverlay("menu"); return; }
  if (event.target.closest("[data-close-overlay]")) closeOverlays();
}

function syncColorBuy(colorBtn) {
  const pdp = colorBtn.closest(".pdp");
  if (!pdp) return;
  const product = productBySlug(slug);
  if (!product || product.soldOut || !product.colors) return;
  const tone = colorById(product, colorBtn.dataset.color || "");
  const sold = Boolean(tone && tone.soldOut);
  const qty = pdp.querySelector(".pdp-info .qty");
  if (qty) {
    qty.hidden = sold;
    if (!sold) {
      const cap = Math.max(buyLimit(product, tone && tone.id), 1);
      qty.dataset.max = String(cap);
      const input = qty.querySelector("[data-qty-input]");
      if (input) {
        const current = Number(input.value);
        input.value = String(Math.max(1, Math.min(cap, Number.isFinite(current) && current > 0 ? current : 1)));
      }
    }
  }
  const button = pdp.querySelector(".pdp-info > .btn.btn-fill");
  if (!button) return;
  button.classList.toggle("is-sold", sold);
  button.disabled = sold;
  if (sold) {
    button.removeAttribute("data-add");
    button.innerHTML = `<img class="sold-out-mark" src="/images/sold-out.png" alt="Sold out">`;
    return;
  }
  button.setAttribute("data-add", product.slug);
  button.textContent = "Add to bag";
}

async function saveStockRow(button) {
  const slug = button.getAttribute("data-save-stock") || "";
  const product = productBySlug(slug);
  const row = button.closest("[data-stock-row]");
  const note = document.getElementById("admin-note");
  const reject = () => {
    if (note) note.textContent = "存貨要是 0 或更大的整數。";
  };
  if (!product || !row) {
    reject();
    return;
  }
  let payload;
  let summary;
  if (product.colors && product.colors.length) {
    const colorStock = {};
    for (const color of product.colors) {
      const input = row.querySelector(`[data-color-stock="${color.id}"]`);
      const raw = String(input && input.value || "").trim();
      if (!/^\d+$/.test(raw)) {
        reject();
        return;
      }
      colorStock[color.id] = Number(raw);
    }
    payload = colorStock;
    summary = product.colors.map((color) => `${color.name} ${colorStock[color.id]}`).join("、");
  } else {
    const input = row.querySelector("input");
    const raw = String(input && input.value || "").trim();
    const stock = /^\d+$/.test(raw) ? Number(raw) : NaN;
    if (!Number.isInteger(stock)) {
      reject();
      return;
    }
    payload = stock;
    summary = String(stock);
  }
  button.disabled = true;
  const result = await auth.saveStock(product, payload);
  button.disabled = false;
  if (!result.ok) {
    if (note) note.textContent = result.message || "存貨沒有存起來。";
    return;
  }
  const applied = { slug: product.slug, name: product.name, image: product.image };
  if (payload && typeof payload === "object") {
    applied.color_stock = payload;
    applied.stock = product.colors.reduce((sum, color) => sum + payload[color.id], 0);
  } else {
    applied.stock = payload;
  }
  applyCatalog([applied]);
  if (note) note.textContent = `${product.name} 的存貨已改成 ${summary}。`;
  loadAdminLists();
}

function editProduct(slug) {
  const product = productBySlug(slug);
  const form = document.getElementById("catalog-form");
  const note = document.getElementById("catalog-editing");
  if (!product || !form) return;
  form.elements.slug.value = product.slug;
  form.elements.name.value = product.name;
  form.elements.price.value = String(Math.max(0, Math.round(Number(product.price) || 0)));
  form.elements.category.value = product.category === "sticker" ? "sticker" : "necklace";
  const counted = product.colors && product.colors.some((color) => Number.isInteger(color.stock));
  if (counted) form.elements.stock.value = String(product.colors.reduce((sum, color) => sum + color.stock, 0));
  else if (Number.isInteger(product.stock)) form.elements.stock.value = String(product.stock);
  else if (product.soldOut) form.elements.stock.value = "0";
  else form.elements.stock.value = "";
  form.elements.description.value = product.description || "";
  form.elements.photo.required = false;
  const submit = form.querySelector("[type=submit]");
  if (submit) submit.textContent = "儲存";
  const unlist = form.querySelector("[data-set-listed]");
  if (unlist) {
    unlist.hidden = false;
    unlist.setAttribute("data-set-listed", product.slug);
    unlist.setAttribute("data-listed", product.unlisted ? "1" : "0");
    unlist.textContent = product.unlisted ? "上架" : "下架";
  }
  if (note) {
    note.textContent = counted
      ? `正在編輯 ${product.name}。不換照片就留空。顏色存貨請在上面的表格改。`
      : `正在編輯 ${product.name}。不換照片就留空。`;
  }
  const editor = document.getElementById("catalog-editor");
  if (editor) editor.scrollIntoView({ block: "center" });
}

async function saveEditedProduct(form) {
  const note = document.getElementById("admin-note");
  const data = new FormData(form);
  const product = productBySlug(String(data.get("slug") || "").trim());
  const name = String(data.get("name") || "").trim();
  const price = Number(data.get("price"));
  const stock = Number(data.get("stock"));
  const category = data.get("category") === "sticker" ? "sticker" : "necklace";
  const description = String(data.get("description") || "").trim();
  const file = data.get("photo");
  if (!product || !name || !Number.isInteger(price) || price < 0 || !Number.isInteger(stock) || stock < 0) {
    if (note) note.textContent = "請填名稱、價格和存貨。價格和存貨都要是整數。";
    return;
  }
  if (file && file.size > 8 * 1024 * 1024) {
    if (note) note.textContent = "照片要小於 8MB。";
    return;
  }
  const button = form.querySelector("[type=submit]");
  if (button) button.disabled = true;
  const result = await auth.updateProduct({
    product,
    name,
    price,
    stock,
    category,
    description,
    file: file && file.size ? file : null,
  });
  if (button) button.disabled = false;
  if (!result.ok) {
    if (note) note.textContent = result.message || "商品沒有存起來。";
    return;
  }
  applyCatalog([result.row]);
  if (note) note.textContent = `${name} 已儲存。`;
  loadAdminLists();
}

async function setListedRow(button) {
  const note = document.getElementById("admin-note");
  const product = productBySlug(button.getAttribute("data-set-listed") || "");
  const listed = button.getAttribute("data-listed") === "1";
  if (!product) return;
  button.disabled = true;
  const result = await auth.setProductListed(product, listed);
  button.disabled = false;
  if (!result.ok) {
    if (note) note.textContent = result.message || "沒有改成。";
    return;
  }
  applyCatalog([result.row]);
  if (note) note.textContent = listed ? `${product.name} 已上架。` : `${product.name} 已下架。`;
  loadAdminLists();
}

async function uploadProduct(form) {
  const note = document.getElementById("admin-note");
  const data = new FormData(form);
  const name = String(data.get("name") || "").trim();
  const price = Number(data.get("price"));
  const stock = Number(data.get("stock"));
  const category = data.get("category") === "sticker" ? "sticker" : "necklace";
  const description = String(data.get("description") || "").trim();
  const file = data.get("photo");
  if (!name || !Number.isInteger(price) || price < 0 || !Number.isInteger(stock) || stock < 0) {
    if (note) note.textContent = "請填名稱、價格和存貨。價格和存貨都要是整數。";
    return;
  }
  if (!file || !file.size) {
    if (note) note.textContent = "請選一張照片。";
    return;
  }
  if (file.size > 8 * 1024 * 1024) {
    if (note) note.textContent = "照片要小於 8MB。";
    return;
  }
  const button = form.querySelector("button");
  if (button) button.disabled = true;
  const result = await auth.createProduct({
    name,
    price,
    stock,
    category,
    description,
    file,
    taken: products.map((item) => item.slug),
  });
  if (button) button.disabled = false;
  if (!result.ok) {
    if (note) note.textContent = result.message || "商品沒有上傳。";
    return;
  }
  applyCatalog([result.row]);
  form.reset();
  if (note) note.textContent = `${name} 已上傳。`;
  loadAdminLists();
}

async function onSubmit(event) {
  if (event.target.id === "catalog-form") {
    event.preventDefault();
    const slug = String(new FormData(event.target).get("slug") || "").trim();
    if (slug) saveEditedProduct(event.target);
    else uploadProduct(event.target);
    return;
  }
  if (event.target.id === "search-form") {
    event.preventDefault();
    return;
  }
  if (event.target.id === "letter-form") {
    event.preventDefault();
    const input = event.target.querySelector("input");
    const note = document.getElementById("letter-note");
    const email = input.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      note.textContent = "請留下有效的電子郵件。";
      return;
    }
    try { localStorage.setItem("bijulia-letter", email); } catch { /* ignore */ }
    note.textContent = "謝謝。在訂閱名單接上之前，這個地址只留在這台瀏覽器裡。";
    input.value = "";
    return;
  }
  if (event.target.id === "restock") {
    event.preventDefault();
    const gmail = String(new FormData(event.target).get("gmail") || "").trim();
    const note = event.target.querySelector(".form-note");
    if (!/@gmail\.com$/i.test(gmail)) {
      note.textContent = "請留下 Gmail。";
      return;
    }
    const product = productBySlug(slug);
    if (!product) return;
    window.open(buildRestockUrl(product, gmail), "_blank", "noopener");
    note.textContent = "Gmail 已打開。請按寄出，補貨後才會寄到這個地址。";
    return;
  }
  if (event.target.id === "request-form") {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target).entries());
    const note = event.target.querySelector(".form-note");
    const phone = String(data.phone || "").replace(/\D/g, "");
    if (!/^09\d{8}$/.test(phone)) {
      note.textContent = "電話要是 09 開頭的十個數字。";
      return;
    }
    data.phone = phone;
    const gmail = String(data.gmail || "").trim();
    if (!/@gmail\.com$/i.test(gmail)) {
      note.textContent = "請留下 Gmail。";
      return;
    }
    data.gmail = gmail;
    if (!String(data.name || "").trim() || !String(data.store || "").trim()) {
      note.textContent = "姓名和 7-11 店名都要填。";
      return;
    }
    const order = orderSnapshot(data);
    const button = event.target.querySelector("button[type=submit]");
    if (button) button.disabled = true;
    note.textContent = "送出中。";
    const result = await auth.placeOrder(order);
    if (!result.ok) {
      note.textContent = result.code === "unconfigured"
        ? "沒有接上 Supabase，訂單沒有送出。"
        : (result.message || "訂單沒有送出。");
      if (button) button.disabled = false;
      return;
    }
    store.clearCart();
    location.href = "/checkout/?sent=1";
    return;
  }
  if (event.target.id === "login-form") {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target).entries());
    const note = document.getElementById("login-note");
    const button = event.target.querySelector("button[type=submit]");
    if (button) button.disabled = true;
    const result = await auth.loginAccount(data.email, data.password);
    if (!result.ok) {
      if (note) {
        note.textContent = result.code === "unconfigured"
          ? "沒有接上 Supabase，無法登入。"
          : (result.message || "沒有登入。");
      }
      if (button) button.disabled = false;
      return;
    }
    closeLoginDialog({ restore: false });
    return;
  }
  if (event.target.id === "register-form") {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target).entries());
    const note = document.getElementById("register-note");
    const phone = String(data.phone || "").replace(/\D/g, "");
    if (!String(data.name || "").trim()) {
      note.textContent = "請留下姓名。";
      return;
    }
    if (!/^09\d{8}$/.test(phone)) {
      note.textContent = "電話要是 09 開頭的十個數字。";
      return;
    }
    const email = String(data.email || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      note.textContent = "請留下有效的電子郵件。";
      return;
    }
    if (String(data.password || "").length < 6) {
      note.textContent = "密碼至少要六個字。";
      return;
    }
    if (data.password !== data.confirm) {
      note.textContent = "兩次密碼不一樣。";
      return;
    }
    const button = event.target.querySelector("button[type=submit]");
    if (button) button.disabled = true;
    note.textContent = "送出中。";
    const result = await auth.registerAccount({
      name: String(data.name).trim(),
      phone,
      email,
      address: "",
      password: String(data.password),
    });
    if (!result.ok) {
      note.textContent = result.code === "unconfigured"
        ? "沒有接上 Supabase，帳號沒有建立。"
        : (result.message || "沒有完成註冊。");
      if (button) button.disabled = false;
      return;
    }
    if (result.needsVerification) {
      event.target.reset();
      note.textContent = "帳號已記下，但這個專案仍要求驗證信，所以現在還不能登入。";
      if (button) button.disabled = false;
      return;
    }
    note.textContent = "已註冊並登入。不用驗證信箱，也不用等管理者核准。";
  }
}

function onChange(event) {
  if (!event.target.matches("[data-sort]")) return;
  const url = new URL(location.href);
  const value = event.target.value;
  if (value === "featured") url.searchParams.delete("sort");
  else url.searchParams.set("sort", value);
  history.pushState({}, "", url);
  renderMain();
  refreshChrome();
}

function onInput(event) {
  if (event.target.id === "q") renderSearch(event.target.value);
  if (event.target.matches("[data-qty-input]")) {
    const max = Number(event.target.parentElement.dataset.max || 5);
    let value = Math.round(Number(event.target.value));
    if (!Number.isFinite(value) || value < 1) value = 1;
    event.target.value = String(Math.min(max, value));
  }
}

function onKey(event) {
  if (loginUi.open && event.key === "Tab") {
    trapLoginTab(event);
    return;
  }
  if (event.key === "Escape") {
    if (loginUi.open) {
      event.preventDefault();
      closeLoginDialog();
      return;
    }
    closeOverlays();
  }
}

function bindLooks() {
  const marquee = document.querySelector(".look-marquee");
  if (!marquee || marquee.dataset.bound) return;
  const track = marquee.querySelector(".look-track");
  const set = marquee.querySelector(".look-set");
  if (!track || !set) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  marquee.dataset.bound = "1";
  let offset = 0;
  let paused = false;
  let slide = null;
  const speed = 0.4;
  function limit() {
    return set.getBoundingClientRect().width;
  }
  function draw() {
    const span = limit();
    if (span > 0) offset = ((offset % span) + span) % span;
    track.style.transform = `translateX(${-offset}px)`;
  }
  function frame(now) {
    if (slide) {
      const t = Math.min(1, (now - slide.start) / 480);
      const eased = 1 - Math.pow(1 - t, 3);
      offset = slide.from + (slide.to - slide.from) * eased;
      if (t >= 1) slide = null;
    } else if (!paused) {
      offset += speed;
    }
    draw();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  marquee.addEventListener("mouseenter", () => { paused = true; });
  marquee.addEventListener("mouseleave", () => { paused = false; });
  function nudge(dir) {
    const card = marquee.querySelector(".look");
    const distance = (card ? card.getBoundingClientRect().width : 280) + 20;
    slide = { from: offset, to: offset + dir * distance, start: performance.now() };
  }
  marquee.querySelector(".look-next").addEventListener("click", () => nudge(1));
  marquee.querySelector(".look-prev").addEventListener("click", () => nudge(-1));
}

function bindColorSwipes() {
  document.querySelectorAll(".color-swipe").forEach((scroller) => {
    if (scroller.dataset.bound) return;
    scroller.dataset.bound = "1";
    let dragging = false;
    let moved = false;
    let startX = 0;
    let scrollLeft = 0;
    scroller.addEventListener("pointerdown", (event) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      dragging = true;
      moved = false;
      startX = event.clientX;
      scrollLeft = scroller.scrollLeft;
      scroller.setPointerCapture(event.pointerId);
    });
    scroller.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const dx = event.clientX - startX;
      if (Math.abs(dx) > 6) moved = true;
      scroller.scrollLeft = scrollLeft - dx;
    });
    function release() {
      if (!dragging) return;
      dragging = false;
      const width = scroller.clientWidth || 1;
      const index = Math.round(scroller.scrollLeft / width);
      scroller.scrollTo({ left: index * width, behavior: "smooth" });
    }
    scroller.addEventListener("pointerup", release);
    scroller.addEventListener("pointercancel", release);
    scroller.addEventListener("click", (event) => {
      if (!moved) return;
      event.preventDefault();
      event.stopPropagation();
      moved = false;
    }, true);
  });
}

function boot() {
  document.body.insertAdjacentHTML("afterbegin", shell());
  renderMain();
  bindLooks();
  bindColorSwipes();
  refreshChrome();
  applyOverlay();
  if (location.hash) {
    const target = document.querySelector(location.hash);
    if (target) target.scrollIntoView();
  }
  document.addEventListener("click", onClick);
  document.addEventListener("submit", onSubmit);
  document.addEventListener("change", onChange);
  document.addEventListener("input", onInput);
  document.addEventListener("keydown", onKey);
  document.addEventListener("focusin", (event) => {
    if (!loginUi.open) return;
    const panel = document.querySelector("#login-dialog .login-panel");
    if (panel && !panel.contains(event.target)) {
      const form = panel.querySelector(loginUi.mode === "register" ? "#register-form" : "#login-form");
      const field = form && form.querySelector("input");
      (field || panel).focus();
    }
  });
  window.addEventListener("popstate", () => {
    renderMain();
    bindColorSwipes();
    refreshChrome();
  });
  store.subscribe(() => {
    if (page === "cart" || page === "checkout") renderMain();
    refreshChrome();
  });
  auth.onChange(() => {
    authReady = true;
    if ((auth.getProfile() || auth.getSession()) && loginUi.open) closeLoginDialog({ restore: false });
    if (page === "account" || page === "cart") renderMain();
    refreshChrome();
  });
  auth.init();
  auth.listCatalog().then((result) => {
    if (!result.ok || !result.rows.length) return;
    applyCatalog(result.rows);
    renderMain();
    bindLooks();
    bindColorSwipes();
    refreshChrome();
  });
}

boot();
