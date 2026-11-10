import {
  site,
  products,
  collections,
  productBySlug,
  collectionBySlug,
  productsIn,
} from "./data.js?v=20";
import * as store from "./store.js?v=2";
import * as auth from "./auth.js?v=3";

const page = document.body.dataset.page || "home";
const slug = document.body.dataset.slug || "";
const ui = { drawer: false, search: false, menu: false };

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
    <div class="announce"><span>少量手工製作 · 滿 ${ntd(site.freeShipping)} 免運</span></div>
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
        <div>
          <h2>${wordImg("shop")}</h2>
          <a href="/shop/?filter=new"><img class="new-in-mark" src="/images/new-in.png" alt="New In"></a>
          <a href="/shop/">${wordImg("pieces")}</a>
          <a href="/shop/?filter=necklace">${wordImg("necklace")}</a>
          <a href="/shop/?filter=sticker">${wordImg("sticker")}</a>
        </div>
        <div>
          <h2>${wordImg("care")}</h2>
          <a href="/customer-care/#shipping">Shipping</a>
          <a href="/customer-care/#returns">Returns</a>
          <a href="/customer-care/#care">Jewelry Care</a>
          <a href="/customer-care/#contact">Contact</a>
        </div>
        <div class="footer-bottom">
          <div>
            <h2>${wordImg("about")}</h2>
            <a href="/outfit/">${wordImg("outfit")}</a>
          </div>
          <div>
            <h2>${wordImg("instagram")}</h2>
            <a href="${site.instagram}" target="_blank" rel="noopener noreferrer">${esc(site.instagramHandle)}</a>
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
      <a href="/shop/">${wordImg("shop")}</a>
      <a href="/shop/?filter=new"><img class="new-in-mark" src="/images/new-in.png" alt="New In"></a>
      <a class="menu-small" href="/shop/">${wordImg("pieces")}</a>
      <a class="menu-small" href="/shop/?filter=necklace">${wordImg("necklace")}</a>
      <a class="menu-small" href="/shop/?filter=sticker">${wordImg("sticker")}</a>
      <a class="menu-small" href="/outfit/">${wordImg("outfit")}</a>
      <a href="/about/">${wordImg("about")}</a>
      <a href="/customer-care/">${wordImg("care")}</a>
      <a class="account-entry" href="/account/" data-mobile-login>Login</a>
      <a class="account-entry" href="/account/?view=register" data-mobile-register>註冊</a>
      <img class="menu-under photo" src="/images/menu-garden.jpg" alt="">
    </div>
  `;
}

function card(product) {
  const media = product.colors && product.colors.length > 1
    ? `<div class="color-swipe">
        ${product.colors.map((color) => `
          <a href="/product/${product.slug}/?color=${esc(color.id)}">
            <img src="${color.image}" alt="${esc(product.name)}，${esc(color.name)}" class="${fitClass({ ...product, image: color.image })}">
          </a>
        `).join("")}
      </div>`
    : `<a href="/product/${product.slug}/"><img src="${product.image}" alt="${esc(product.name)}" class="${fitClass(product)}"></a>`;
  return `
    <article class="card">
      <div class="card-media">
        ${media}
        ${product.soldOut
          ? `<span class="quick-add is-sold"><img class="sold-out-mark" src="/images/sold-out.png" alt="Sold out"></span>`
          : product.colors
            ? `<a class="quick-add" href="/product/${product.slug}/">Choose color</a>`
            : `<button class="quick-add" type="button" data-add="${product.slug}">Add to bag</button>`}
      </div>
      <div class="card-info">
        <a class="card-name${product.category === "necklace" ? " is-taipei" : ""}" href="/product/${product.slug}/">${esc(product.name)}</a>
        <p class="card-price">${priceText(product)}</p>
        ${product.soldOut ? `<a class="card-restock" href="/product/${product.slug}/#restock">補貨後通知</a>` : ""}
        ${product.colors ? `<p class="fine">${product.colors.map((color) => esc(color.name)).join(" · ")}</p>` : ""}
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
  const basis = twd > 0 ? twd : sub;
  const ship = basis === 0 ? 0 : freeShippingQualified(basis) ? 0 : site.shippingFee;
  return { sub, ship, total: sub + (twd > 0 ? 0 : ship), twd, basis };
}

function hasPriorPurchase() {
  const history = auth.getProfile()?.purchase_history;
  return Array.isArray(history) && history.length > 0;
}

function freeShippingQualified(basis) {
  return basis >= site.freeShipping || hasPriorPurchase();
}

function summaryMoney(sums, twdLabel = "NT$") {
  const rows = [];
  if (sums.sub) rows.push(`<div class="summary-row"><span>小計</span><span>${money(sums.sub)}</span></div>`);
  if (sums.twd) rows.push(`<div class="summary-row"><span>${esc(twdLabel)}</span><span>NT$${sums.twd.toLocaleString("en-US")}</span></div>`);
  return rows.join("");
}

function shippingNote(amount) {
  if (!amount) return "";
  if (hasPriorPurchase()) return "買過一次，這次免運";
  if (amount >= site.freeShipping) return "免運";
  const rest = site.freeShipping - amount;
  return `再加 ${ntd(rest)} 即可免運`;
}

function colorById(product, id) {
  return (product && product.colors ? product.colors : []).find((color) => color.id === id) || null;
}

function colorPicker(product) {
  if (!product.colors || !product.colors.length) return "";
  const picked = Math.max(0, product.colors.findIndex((color) => color.id === params().get("color")));
  return `
    <div class="color-pick">
      <p class="fine" id="color-label">顏色</p>
      <div class="color-options" role="radiogroup" aria-labelledby="color-label">
        ${product.colors.map((color, index) => `
          <button type="button" class="color-option${index === picked ? " is-on" : ""}" role="radio" aria-checked="${index === picked}" data-color="${esc(color.id)}" data-image="${color.image}">
            <img src="${color.image}" alt="">
            <span>${esc(color.name)}</span>
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
  const limit = item.qty >= product.maxQty ? '<p class="fine">這件已到少量上限。</p>' : "";
  return `
    <article class="line">
      <a href="/product/${product.slug}/"><img src="${image}" alt="" class="${fitClass({ ...product, image })}"></a>
      <div>
        <h3 class="${product.category === "necklace" ? "is-taipei" : ""}"><a href="/product/${product.slug}/">${esc(product.name)}</a></h3>
        ${tone ? `<p class="fine">${esc(tone.name)}</p>` : ""}
        <div class="qty" data-max="${product.maxQty}">
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
  ["lock-and-key-chain", "/images/products/lock-and-key-chain-worn.jpg", "Lock and Key Chain"],
  ["comb-and-chair-chain", "/images/products/comb-and-chair-chain-worn.jpg", "Comb and Chair Chain"],
  ["button-drop-necklace", "/images/products/button-drop-necklace-worn.jpg", "Button Drop Necklace"],
];

function renderHome() {
  const newest = products.filter((item) => item.isNew && item.category === "necklace").slice(0, 4);
  const sellers = products.filter((item) => item.isBestSeller && item.category === "necklace").slice(0, 4);
  const stickers = products.filter((item) => item.category === "sticker");
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
    <section class="about-band" id="about-bijulia">
      <img src="/images/about-gate.jpg" alt="黑色鐵花門的捲草花紋">
      <div class="about-copy">
        <p class="kicker">工作室</p>
        <h2>${wordImg("about", "is-title")}</h2>
      </div>
    </section>
    <section class="section" id="instagram">
      <div class="wrap">
        <div class="section-head">
          <h2>${wordImg("instagram")}</h2>
          <p class="lede"><a href="${site.instagram}" target="_blank" rel="noopener noreferrer">${esc(site.instagramHandle)}</a></p>
        </div>
      </div>
    </section>
    <section class="newsletter" id="newsletter">
      <p class="kicker">信件</p>
      <h2>From the garden</h2>
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
  ["all", wordImg("all")],
  ["new", `<img class="new-in-mark" src="/images/new-in.png" alt="New In">`],
  ["best", wordImg("best")],
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
    all: ["Shop", ""],
    new: ["New In", ""],
    best: ["Best Sellers", ""],
    necklace: ["Necklaces", ""],
    sticker: ["Stickers", ""],
  };
  return map[filter] || map.all;
}

function shopTitle(title) {
  if (title === "New In") return `<img class="title-mark" src="/images/new-in.png" alt="New In">`;
  if (title === "Shop") return wordImg("shop", "is-title");
  if (title === "Necklaces") return wordImg("necklace", "is-title");
  if (title === "Stickers") return wordImg("sticker", "is-title");
  if (title === "Best Sellers") return wordImg("best", "is-title");
  return esc(title);
}

function renderShop() {
  const filter = params().get("filter") || "all";
  const sort = params().get("sort") || "featured";
  const [title, lede] = shopHeading(filter);
  const list = applySort(applyFilter(products, filter), sort);
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
      ${grid(productsIn(collection.slug))}
    </div>
  `;
}

function related(product) {
  const same = products.filter((item) => item.collection === product.collection && item.slug !== product.slug);
  const rest = products.filter((item) => item.slug !== product.slug && !same.includes(item));
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
  const shipping = `滿 ${ntd(site.freeShipping)} 免運。未滿則運費 ${ntd(site.shippingFee)}。項鍊於 5–8 天內從工作室寄出。貼紙多半 3 天內寄出。`;
  const pictures = product.images && product.images.length ? product.images : [product.image];
  const wornShots = pictures.filter((src) => /worn/i.test(src));
  const galleryShots = pictures.filter((src) => !/worn/i.test(src));
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
          ${product.soldOut ? "" : `
          <div class="qty" data-max="${product.maxQty}">
            <button type="button" data-qty-step="-1" aria-label="減少數量">−</button>
            <input data-qty-input value="1" inputmode="numeric" aria-label="數量">
            <button type="button" data-qty-step="1" aria-label="增加數量">+</button>
          </div>`}
          <button class="btn btn-fill${product.soldOut ? " is-sold" : ""}" type="button"${product.soldOut ? " disabled" : ` data-add="${product.slug}"`}>${product.soldOut ? `<img class="sold-out-mark" src="/images/sold-out.png" alt="Sold out">` : "Add to bag"}</button>
          ${product.soldOut ? `
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
          ${sums.basis ? `<div class="summary-row"><span>運費</span><span>${sums.ship === 0 ? "免運" : ntd(sums.ship)}</span></div>
          <div class="summary-row"><strong>合計</strong><strong>${sums.twd ? ntd(sums.twd + sums.ship) : money(sums.sub + sums.ship)}</strong></div>
          <p class="fine">${esc(shippingNote(sums.basis))}</p>` : ""}
          <a class="btn btn-fill" href="/checkout/">Request order</a>
          <p class="fine" style="margin-top:12px">請填寫 Request an order。付款是匯款到工作室銀行帳戶。匯款確認後，工作室會寄信通知下單成功。這個頁面不會扣款。</p>
        </aside>
      </div>
    </div>
  `;
}

function renderOrderSent() {
  let mail = "";
  try { mail = sessionStorage.getItem("bijulia-order-mail") || ""; } catch { /* ignore */ }
  return `
    <div class="page">
      <div class="empty">
        <p class="kicker">Instagram</p>
        <h1 class="page-title"><a href="${site.instagram}">${esc(site.instagramHandle)}</a></h1>
        <p>請私訊討論更多細節。</p>
        <a class="btn" href="${site.instagram}">${esc(site.instagramHandle)}</a>
        ${mail ? `<p class="fine" style="margin-top:28px"><a class="linkish" href="${esc(mail)}">如果 Gmail 沒有打開，請按這裡。寄出後，工作室才會收到這筆訂單。匯款確認後，工作室會寄信到你的 Gmail，通知下單成功。</a></p>` : ""}
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
      <p>姓名、電話、Gmail 和 7-11 店名都要填。送出後會打開 Gmail，把訂單寄給工作室。請在 Gmail 按寄出。</p>
      <p>匯款確認後，工作室會寄信到你的 Gmail，通知下單成功。</p>
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
  return `
    <div class="page">
      ${crumbs([{ href: "/", label: "Home" }, { href: "/cart/", label: "Your bag" }, { label: "Request" }])}
      <h1 class="page-title">Request an order</h1>
      ${paymentBlock()}
      <form id="request-form" style="max-width:440px">
          <label class="field"><span>姓名</span><input name="name" required autocomplete="name"></label>
          <label class="field"><span>電話</span><input name="phone" type="tel" required inputmode="numeric" autocomplete="tel" placeholder="0912345678"></label>
          <label class="field"><span>Gmail</span><input name="gmail" type="email" required autocomplete="email" placeholder="name@gmail.com"></label>
          <label class="field"><span>7-11 店名</span><input name="store" required></label>
          <button class="btn btn-fill" type="submit">Send</button>
          <p class="form-note fine" id="request-note"></p>
      </form>
    </div>
  `;
}

function renderOutfit() {
  const shots = [];
  looks.forEach((look) => {
    shots.push(look);
    if (look[0] === "comb-and-chair-chain") {
      shots.push(["comb-and-chair-chain", "/images/products/comb-and-chair-chain-worn-2.jpg", "Comb and Chair Chain"]);
    }
  });
  return `
    <div class="page">
      ${crumbs([{ href: "/", label: "Home" }, { label: "Outfits" }])}
      <h1 class="page-title">${wordImg("outfit", "is-title")}</h1>
      <div class="outfit-grid">
        ${shots.map(([slug, src, name]) => `
          <article class="outfit-shot">
            <a class="outfit-frame" href="/product/${slug}/">
              <img src="${src}" alt="${esc(name)}，穿搭" class="photo">
            </a>
            <a class="outfit-name is-taipei" href="/product/${slug}/">${esc(name)}</a>
          </article>
        `).join("")}
      </div>
    </div>
  `;
}

function renderAbout() {
  return `
    <div class="page">
      ${crumbs([{ href: "/", label: "Home" }, { label: "About" }])}
      <div class="story">
        <h1 class="page-title">${wordImg("about", "is-title")}</h1>
      </div>
      <div class="split">
        <img src="/images/about-gate.jpg" alt="黑色鐵花門的捲草花紋">
      </div>
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
        <h2>Shipping</h2>
        <p>滿 ${ntd(site.freeShipping)} 免運。未滿則運費 ${ntd(site.shippingFee)}。項鍊裝在麻布袋裡，5–8 天內寄出。貼紙放進封套，多半 3 天內寄出。</p>
      </section>
      <section class="care-block" id="returns">
        <h2>Returns</h2>
        <p>未穿過的項鍊可在 14 天內退回，請放回原來的袋子。貼紙只有完全未使用、仍在封套裡才能退。寄回之前請先到 Instagram 私訊告訴我們。</p>
      </section>
      <section class="care-block" id="care">
        <h2>Jewelry Care</h2>
        <p>沒有戴的時候，把項鍊放回鏈袋裡。</p>
      </section>
      <section class="care-block" id="contact">
        <h2>Contact</h2>
        <p>訂單、修理，或關於一顆珍珠的問題，請到 Instagram 私訊 <a class="linkish" href="${site.instagram}">${esc(site.instagramHandle)}</a>。</p>
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
  if (value === "register" || value === "pending" || value === "admin") return value;
  return "login";
}

function accountSwitch(view) {
  const link = (key, href, label) => `<a href="${href}"${view === key ? ' class="is-on" aria-current="page"' : ""}>${label}</a>`;
  return `<nav class="account-switch" aria-label="帳戶">
    ${link("login", "/account/", "Login")}
    ${link("register", "/account/?view=register", "註冊")}
    ${link("pending", "/account/?view=pending", "待核准")}
    ${link("admin", "/account/?view=admin", "核准")}
  </nav>`;
}

function roleLabel(role) {
  if (role === "pending") return "待核准";
  if (role === "customer") return "顧客";
  if (role === "super_admin") return "管理者";
  return esc(role || "—");
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
    ${row("會員等級", esc(profile.tier || "—"))}
    ${row("角色", roleLabel(profile.role))}
    ${row("購買紀錄", purchaseHtml(profile.purchase_history))}
    ${row("建立時間", formatWhen(profile.created_at))}
  </dl>`;
}

function logoutButton() {
  return `<div class="account-actions"><button class="btn" type="button" data-logout>登出</button></div>`;
}

function renderLogin() {
  return `<div class="page">
    ${crumbs([{ href: "/", label: "Home" }, { label: "Login" }])}
    <h1 class="page-title">Login</h1>
    ${accountSwitch("login")}
    ${configBanner()}
    <p class="account-copy">顧客與管理者都從這裡登入。新註冊的帳號要先完成信箱驗證，角色是待核准。待核准可以看自己的帳戶，不能核准別人。管理者核准後，角色才會改成顧客。</p>
    <form id="login-form" class="account-form">
      <label class="field"><span>電子郵件</span><input name="email" type="email" required autocomplete="email"></label>
      <label class="field"><span>密碼</span><input name="password" type="password" required autocomplete="current-password"></label>
      <button class="btn btn-fill" type="submit">Login</button>
      <a class="btn" href="/account/?view=register">註冊</a>
      <p class="form-note fine" id="login-note" role="status"></p>
    </form>
  </div>`;
}

function renderRegister() {
  return `<div class="page">
    ${crumbs([{ href: "/", label: "Home" }, { label: "註冊" }])}
    <h1 class="page-title">註冊</h1>
    ${accountSwitch("register")}
    ${configBanner()}
    <p class="account-copy">留下姓名、電話、電子郵件、地址和密碼。送出後要到信箱完成驗證。驗證完成才會建立個人資料，角色是待核准，會員等級是一般，購買紀錄是空的。核准前不能使用管理功能。</p>
    <form id="register-form" class="account-form">
      <label class="field"><span>姓名</span><input name="name" required autocomplete="name"></label>
      <label class="field"><span>電話</span><input name="phone" type="tel" required inputmode="numeric" autocomplete="tel" placeholder="0912345678"></label>
      <label class="field"><span>電子郵件</span><input name="email" type="email" required autocomplete="email"></label>
      <label class="field"><span>地址</span><textarea name="address" required autocomplete="street-address"></textarea></label>
      <label class="field"><span>密碼</span><input name="password" type="password" required autocomplete="new-password" minlength="6"></label>
      <label class="field"><span>再輸入一次密碼</span><input name="confirm" type="password" required autocomplete="new-password" minlength="6"></label>
      <button class="btn btn-fill" type="submit">註冊</button>
      <p class="form-note fine" id="register-note" role="status"></p>
    </form>
  </div>`;
}

function renderPending(profile) {
  const intro = profile
    ? "信箱驗證已完成。角色仍是待核准，不能使用管理功能。請等管理者核准。這頁只顯示你自己的資料。"
    : "註冊並完成信箱驗證後，角色會是待核准。核准前不能使用管理功能。現在沒有登入中的帳號，所以下面沒有個人資料。";
  return `<div class="page">
    ${crumbs([{ href: "/", label: "Home" }, { label: "待核准" }])}
    <h1 class="page-title">待核准</h1>
    ${profile ? "" : accountSwitch("pending")}
    ${configBanner()}
    <p class="account-copy">${intro}</p>
    ${profileDl(profile, "待核准")}
    ${profile ? logoutButton() : ""}
  </div>`;
}

function peopleTable(rows, approve, emptyLabel = "沒有資料") {
  const head = `<tr>
    <th>顧客編號</th><th>姓名 / 電話</th><th>電子郵件 / 地址</th><th>會員等級</th><th>角色</th><th>購買紀錄</th><th>建立時間</th>${approve ? "<th>核准</th>" : ""}
  </tr>`;
  const body = rows.length
    ? rows.map((row) => `<tr>
        <td>${esc(row.id || "")}</td>
        <td>${esc(row.name || "—")} / ${esc(row.phone || "—")}</td>
        <td>${esc(row.email || "—")} / ${esc(row.address || "—")}</td>
        <td>${esc(row.tier || "—")}</td>
        <td>${roleLabel(row.role)}</td>
        <td>${purchaseHtml(row.purchase_history)}</td>
        <td>${formatWhen(row.created_at)}</td>
        ${approve ? `<td><button class="btn" type="button" data-approve="${esc(row.id || "")}">核准</button></td>` : ""}
      </tr>`).join("")
    : `<tr><td colspan="${approve ? 8 : 7}">${esc(emptyLabel)}</td></tr>`;
  return `<div class="account-table-wrap"><table class="account-table"><thead>${head}</thead><tbody>${body}</tbody></table></div>`;
}

function renderAdmin(profile) {
  if (!profile) {
    return `<div class="page">
      ${crumbs([{ href: "/", label: "Home" }, { label: "核准" }])}
      <h1 class="page-title">核准帳號</h1>
      ${accountSwitch("admin")}
      ${configBanner()}
      <p class="account-copy">只有管理者登入後可以看見待核准名單。按下核准，角色會從待核准改成顧客。店主請用 ${esc(site.email)} 註冊並完成信箱驗證，再在 Supabase 的 SQL editor 把那一筆 role 改成 super_admin。這個網站不會把註冊的人自動變成管理者。</p>
      <p class="fine">現在沒有管理者登入，所以沒有名單，也沒有核准任何帳號。</p>
      <section class="account-section"><h2>待核准</h2>${peopleTable([], false, "沒有名單")}</section>
    </div>`;
  }
  return `<div class="page">
    ${crumbs([{ href: "/", label: "Home" }, { label: "核准" }])}
    <h1 class="page-title">核准帳號</h1>
    ${configBanner()}
    <p class="account-copy">待核准的帳號列在下面。按下核准後，角色會從待核准改成顧客。顧客只能看見自己的帳戶。</p>
    <p class="fine">登入身分：${esc(profile.email || "")}，管理者。</p>
    <p class="form-note fine" id="admin-note" role="status"></p>
    <div id="admin-lists"><p class="fine">讀取中。</p></div>
    ${logoutButton()}
  </div>`;
}

function renderCustomer(profile) {
  return `<div class="page">
    ${crumbs([{ href: "/", label: "Home" }, { label: "帳戶" }])}
    <h1 class="page-title">帳戶</h1>
    ${configBanner()}
    <p class="account-copy">這是你自己的帳戶。角色是顧客。這裡不會列出其他人。</p>
    ${profileDl(profile, "顧客")}
    ${logoutButton()}
  </div>`;
}

function renderSignedInWithoutProfile() {
  return `<div class="page">
    ${crumbs([{ href: "/", label: "Home" }, { label: "帳戶" }])}
    <h1 class="page-title">帳戶</h1>
    ${configBanner()}
    <p class="account-copy">已登入，但 public.profiles 還沒有這一筆。請先完成信箱驗證。驗證完成後資料庫才會寫入，角色是待核准。</p>
    ${logoutButton()}
  </div>`;
}

function renderAccount() {
  const profile = auth.getProfile();
  const session = auth.getSession();
  if (profile?.role === "super_admin") {
    document.title = "核准帳號 — BiJulia";
    return renderAdmin(profile);
  }
  if (profile?.role === "pending") {
    document.title = "待核准 — BiJulia";
    return renderPending(profile);
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
  if (view === "pending") {
    document.title = "待核准 — BiJulia";
    return renderPending(null);
  }
  if (view === "admin") {
    document.title = "核准帳號 — BiJulia";
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
  const pending = result.rows.filter((row) => row.role === "pending");
  const customers = result.rows.filter((row) => row.role === "customer");
  current.innerHTML = `
    <section class="account-section"><h2>待核准</h2>${pending.length ? "" : `<p class="fine">目前沒有待核准的帳號。</p>`}${peopleTable(pending, true)}</section>
    <section class="account-section"><h2>顧客</h2>${peopleTable(customers, false)}</section>
  `;
}

async function approveProfile(button) {
  const note = document.getElementById("admin-note");
  button.disabled = true;
  const result = await auth.approveCustomer(button.dataset.approve);
  if (!result.ok) {
    if (note) {
      note.textContent = result.code === "unconfigured"
        ? "沒有接上 Supabase，沒有變更角色。"
        : (result.message || "沒有核准。");
    }
    button.disabled = false;
    return;
  }
  if (note) note.textContent = "已核准，角色改成顧客。";
  await loadAdminLists();
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
    outfit: "Outfits — BiJulia",
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
  const totalText = sums.twd ? ntd(sums.twd + sums.ship) : money(sums.sub + sums.ship);
  body.innerHTML = items.map((item) => line(item, true)).join("");
  foot.innerHTML = `
    <div class="summary-row"><span>Total</span><span>${totalText}</span></div>
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
  const login = document.querySelector("[data-mobile-login]");
  const register = document.querySelector("[data-mobile-register]");
  if (!login || !register) return;
  const profile = auth.getProfile();
  if (profile || auth.getSession()) {
    login.textContent = profile?.role === "super_admin" ? "管理者" : "帳戶";
    login.href = "/account/";
    register.hidden = true;
    return;
  }
  login.textContent = "Login";
  login.href = "/account/";
  register.hidden = false;
  register.textContent = "註冊";
  register.href = "/account/?view=register";
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
  document.body.classList.toggle("lock", ui.drawer || ui.search || ui.menu);
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

function searchPool(query) {
  const text = query.trim().toLowerCase();
  if (!text) return { label: "工作室的新品", list: products.filter((item) => item.isNew).slice(0, 4) };
  const list = products.filter((item) => {
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
    <a class="search-hit" href="/product/${item.slug}/">
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
    total: sums.twd ? sums.twd + sums.ship : sums.sub + sums.ship,
  };
}

function buildGmailUrl(data) {
  const items = store.getCart().map((item) => {
    const product = productBySlug(item.slug);
    const tone = product && colorById(product, item.color);
    const label = product ? (tone ? `${product.name} (${tone.name})` : product.name) : "";
    return product ? `${label} × ${item.qty} — ${priceText(product, item.qty)}` : "";
  }).filter(Boolean);
  const sums = totals();
  const totalLine = sums.twd
    ? `合計：${ntd(sums.twd + sums.ship)}`
    : (sums.sub ? `飾品合計：${money(sums.sub + sums.ship)}` : "");
  const bank = site.bank || {};
  const bankLines = [
    bank.name ? `銀行：${bank.name}` : "",
    bank.holder ? `戶名：${bank.holder}` : "",
    bank.account ? `帳號：${bank.account}` : "",
  ].filter(Boolean);
  const body = [
    `${data.name} 送來一筆 BiJulia 訂單請求。`,
    "請等匯款確認後，再寄信到客人的 Gmail，主旨寫「BiJulia 下單成功」。",
    "",
    `姓名：${data.name}`,
    `電話：${data.phone}`,
    `Gmail：${data.gmail}`,
    `7-11 店名：${data.store}`,
    "",
    "作品：",
    ...items,
    "",
    sums.twd ? `NT$：${ntd(sums.twd)}` : "",
    sums.sub ? `飾品：${money(sums.sub)}` : "",
    (sums.twd || sums.sub) ? `運費：${sums.ship === 0 ? "免運" : ntd(sums.ship)}` : "",
    totalLine,
    "",
    bankLines.length ? "匯款帳戶：" : undefined,
    ...bankLines,
  ].filter((line) => line !== undefined).join("\n");
  const query = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: site.email,
    su: "BiJulia 訂單請求",
    body,
  });
  return `https://mail.google.com/mail/?${query.toString()}`;
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
  const approve = event.target.closest("[data-approve]");
  if (approve) {
    event.preventDefault();
    approveProfile(approve);
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
    return;
  }
  const add = event.target.closest("[data-add]");
  if (add) {
    event.preventDefault();
    const product = productBySlug(add.dataset.add);
    if (!product || product.soldOut) return;
    const scope = add.closest(".pdp");
    const input = scope ? scope.querySelector("[data-qty-input]") : null;
    const qty = input ? Number(input.value) : 1;
    const selected = scope ? scope.querySelector(".color-option.is-on") : null;
    store.addToCart(product.slug, qty, product.maxQty, selected ? selected.dataset.color : "");
    openOverlay("drawer");
    return;
  }
  const lineStep = event.target.closest("[data-line-step]");
  if (lineStep) {
    const product = productBySlug(lineStep.dataset.slug);
    const color = lineStep.dataset.color || "";
    const current = store.getCart().find((item) => item.slug === lineStep.dataset.slug && (item.color || "") === color);
    const step = Number(lineStep.dataset.lineStep);
    if (product && product.soldOut && step > 0) return;
    store.setQty(lineStep.dataset.slug, (current ? current.qty : 1) + step, product ? product.maxQty : 5, color);
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
  if (event.target.closest("[data-open-drawer]")) { openOverlay("drawer"); return; }
  if (event.target.closest("[data-open-search]")) { openOverlay("search"); return; }
  if (event.target.closest("[data-open-menu]")) { openOverlay("menu"); return; }
  if (event.target.closest("[data-close-overlay]")) closeOverlays();
}

async function onSubmit(event) {
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
    const url = buildGmailUrl(data);
    const order = orderSnapshot(data);
    const button = event.target.querySelector("button[type=submit]");
    if (button) button.disabled = true;
    window.open(url, "_blank", "noopener");
    try { sessionStorage.setItem("bijulia-order-mail", url); } catch { /* ignore */ }
    await Promise.race([
      auth.appendPurchase(order).catch(() => {}),
      new Promise((resolve) => setTimeout(resolve, 2500)),
    ]);
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
      note.textContent = result.code === "unconfigured"
        ? "沒有接上 Supabase，無法登入。"
        : (result.message || "沒有登入。");
      if (button) button.disabled = false;
      return;
    }
    if (!auth.getProfile()) {
      note.textContent = "已通過登入，但還沒有個人資料。請確認已完成信箱驗證。";
    }
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
    if (!String(data.address || "").trim()) {
      note.textContent = "請留下地址。";
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
      address: String(data.address).trim(),
      password: String(data.password),
    });
    if (!result.ok) {
      note.textContent = result.code === "unconfigured"
        ? "沒有接上 Supabase，驗證信沒有寄出，帳號也沒有建立。"
        : (result.message || "沒有完成註冊。");
      if (button) button.disabled = false;
      return;
    }
    if (result.needsVerification) {
      event.target.reset();
      note.textContent = "驗證信已寄出。請到信箱完成驗證。完成後角色是待核准，管理者核准前不能使用管理功能。";
      if (button) button.disabled = false;
      return;
    }
    note.textContent = "已登入。角色若仍是待核准，要等管理者核准後才是顧客。";
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
  if (event.key === "Escape") closeOverlays();
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
    if (page === "account" || page === "cart") renderMain();
    refreshChrome();
  });
  auth.init();
}

boot();
