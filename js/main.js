import {
  site,
  products,
  collections,
  journal,
  productBySlug,
  collectionBySlug,
  articleBySlug,
  productsIn,
} from "./data.js?v=5";
import * as store from "./store.js?v=2";

const page = document.body.dataset.page || "home";
const slug = document.body.dataset.slug || "";
const ui = { drawer: false, search: false, menu: false };

const ABOUT_LEAD =
  "BiJulia 始於對舊日細節、浪漫花園、蕾絲與被遺忘的小物的喜愛。每一件都少量手工製作。";

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
  const fit = mode === "contain" ? "fit-contain" : mode === "full" ? "fit-full" : "";
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

function shell() {
  const path = currentPath();
  const filter = params().get("filter");
  const mark = (key) => {
    const on =
      (key === "new" && path.startsWith("/shop") && filter === "new") ||
      (key === "shop" && (path.startsWith("/shop") || path.startsWith("/product")) && filter !== "new") ||
      (key === "looks" && path === "/" && location.hash === "#looks") ||
      (key === "about" && path.startsWith("/about")) ||
      (key === "journal" && path.startsWith("/journal"));
    return on ? ' aria-current="page"' : "";
  };
  const sub = (href, label) => `<a href="${href}">${label}</a>`;
  return `
    <a class="skip" href="#app">跳至內文</a>
    <div class="announce">少量手工製作 · 滿 ${money(site.freeShipping)} 免運</div>
    <header class="site-header">
      <div class="header-inner">
        <div class="header-left">
          <button class="menu-toggle" type="button" data-open-menu aria-label="開啟選單">${iconMenu()}</button>
          <a class="logo" href="/" aria-label="BiJulia"><img src="/images/logo.png" alt="BiJulia"></a>
        </div>
        <nav class="nav" aria-label="Primary">
          <a href="/shop/?filter=new"${mark("new")}><img class="new-in-mark" src="/images/new-in.png" alt="New In"></a>
          <div class="has-sub">
            <a href="/shop/"${mark("shop")}>Shop</a>
            <div class="submenu">
              ${sub("/shop/", "All pieces")}
              ${sub("/shop/?filter=necklace", "Necklaces")}
              ${sub("/shop/?filter=sticker", "Stickers")}
            </div>
          </div>
          <a href="/#looks"${mark("looks")}>Outfit</a>
          <a href="/about/"${mark("about")}>About</a>
          <a href="/journal/"${mark("journal")}>Journal</a>
        </nav>
        <div class="tools">
          <button class="icon-btn" type="button" data-open-search aria-label="搜尋">${iconSearch()}</button>
          <button class="icon-btn" type="button" data-open-drawer aria-label="購物袋">${iconBag()}<span class="count" data-cart-count hidden>0</span></button>
        </div>
      </div>
    </header>
    <main id="app"></main>
    <footer class="site-footer">
      <div class="footer-grid">
        <div>
          <h2>Shop</h2>
          <a href="/shop/?filter=new"><img class="new-in-mark" src="/images/new-in.png" alt="New In"></a>
          <a href="/shop/">All pieces</a>
          <a href="/shop/?filter=necklace">Necklaces</a>
          <a href="/shop/?filter=sticker">Stickers</a>
          <a href="/#looks">Outfit</a>
        </div>
        <div>
          <h2>Customer Care</h2>
          <a href="/customer-care/#shipping">Shipping</a>
          <a href="/customer-care/#returns">Returns</a>
          <a href="/customer-care/#care">Jewelry Care</a>
          <a href="/customer-care/#contact">Contact</a>
        </div>
        <div>
          <h2>About</h2>
          <a href="/about/">Our Story</a>
          <a href="/journal/">Journal</a>
          <a href="/#looks">Outfit</a>
        </div>
        <div>
          <h2>Instagram</h2>
          <a href="${site.instagram}" target="_blank" rel="noopener noreferrer">${esc(site.instagramHandle)}</a>
        </div>
      </div>
      <div class="footer-base">
        <a class="logo" href="/" aria-label="BiJulia"><img src="/images/logo.png" alt=""></a>
        <span>© ${new Date().getFullYear()} BiJulia. 少量手工製作。</span>
      </div>
    </footer>
    <div class="scrim" data-close-overlay hidden></div>
    <aside id="drawer" class="drawer" aria-hidden="true" aria-label="購物袋">
      <div class="drawer-head">
        <h2>Your bag</h2>
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
      <a href="/shop/?filter=new"><img class="new-in-mark" src="/images/new-in.png" alt="New In"></a>
      <a href="/shop/">Shop</a>
      <a class="sub" href="/shop/?filter=necklace">Necklaces</a>
      <a class="sub" href="/shop/?filter=sticker">Stickers</a>
      <a href="/#looks">Outfit</a>
      <a href="/about/">About</a>
      <a href="/journal/">Journal</a>
    </div>
  `;
}

function card(product) {
  return `
    <article class="card">
      <div class="card-media">
        <a href="/product/${product.slug}/"><img src="${product.image}" alt="${esc(product.name)}" class="${fitClass(product)}"></a>
        ${product.soldOut
          ? `<span class="quick-add is-sold"><img class="sold-out-mark" src="/images/sold-out.png" alt="Sold out"></span>`
          : product.colors
            ? `<a class="quick-add" href="/product/${product.slug}/">Choose color</a>`
            : `<button class="quick-add" type="button" data-add="${product.slug}">Add to bag</button>`}
      </div>
      <div class="card-info">
        <a class="card-name" href="/product/${product.slug}/">${esc(product.name)}</a>
        <p class="card-price">${priceText(product)}</p>
        ${product.soldOut ? `<p class="fine"><img class="sold-out-mark" src="/images/sold-out.png" alt="Sold out"></p>` : ""}
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
  const ship = sub === 0 ? 0 : sub >= site.freeShipping ? 0 : site.shippingFee;
  return { sub, ship, total: sub + ship, twd };
}

function summaryMoney(sums) {
  const rows = [];
  if (sums.sub) rows.push(`<div class="summary-row"><span>小計</span><span>${money(sums.sub)}</span></div>`);
  if (sums.twd) rows.push(`<div class="summary-row"><span>NT$</span><span>NT$${sums.twd.toLocaleString("en-US")}</span></div>`);
  return rows.join("");
}

function shippingNote(sub) {
  if (sub === 0) return "";
  if (sub >= site.freeShipping) return "免運";
  const rest = site.freeShipping - sub;
  return `再加 ${money(rest)} 即可免運`;
}

function colorById(product, id) {
  return (product && product.colors ? product.colors : []).find((color) => color.id === id) || null;
}

function colorPicker(product) {
  if (!product.colors || !product.colors.length) return "";
  return `
    <div class="color-pick">
      <p class="fine" id="color-label">顏色</p>
      <div class="color-options" role="radiogroup" aria-labelledby="color-label">
        ${product.colors.map((color, index) => `
          <button type="button" class="color-option${index === 0 ? " is-on" : ""}" role="radio" aria-checked="${index === 0}" data-color="${esc(color.id)}" data-image="${color.image}">
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
        <h3><a href="/product/${product.slug}/">${esc(product.name)}</a></h3>
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
        <div class="section-head"><h2><img class="title-mark" src="/images/new-in.png" alt="New In"></h2></div>
        ${grid(newest)}
        <p class="more-link"><a class="linkish" href="/shop/?filter=new">查看全部</a></p>
      </div>
    </section>
    <section class="section looks-section" id="looks">
      <div class="wrap">
        <div class="section-head"><h2>Outfit</h2></div>
      </div>
      <div class="look-marquee">
        <div class="look-track">
          ${[false, true].map((hidden) => `
            <div class="look-set"${hidden ? ' aria-hidden="true"' : ""}>
              ${looks.map(([slug, src, name]) => `
                <article class="look">
                  <a class="look-frame" href="/product/${slug}/"${hidden ? ' tabindex="-1"' : ""}>
                    <img src="${src}" alt="${esc(name)}，穿搭" class="photo">
                  </a>
                  <a class="look-name" href="/product/${slug}/"${hidden ? ' tabindex="-1"' : ""}>${esc(name)}</a>
                </article>
              `).join("")}
            </div>
          `).join("")}
        </div>
      </div>
    </section>
    <section class="section sticker-feature" id="stickers">
      <div class="wrap">
        <div class="section-head">
          <p class="kicker">工作室裡還有</p>
          <h2>Shell Stickers</h2>
          <p class="lede">黑色或薄荷綠。三張貼紙 NT$50。</p>
        </div>
        <div class="sticker-stage">${stickers.map(card).join("")}</div>
        <p class="more-link"><a class="linkish" href="/collections/shell-stickers/">看貝殼</a></p>
      </div>
    </section>
    <section class="section" id="best-sellers">
      <div class="wrap">
        <div class="section-head"><h2>Best Sellers</h2></div>
        ${grid(sellers)}
        <p class="more-link"><a class="linkish" href="/shop/?filter=best">查看全部</a></p>
      </div>
    </section>
    <section class="about-band" id="about-bijulia">
      <img src="/images/about.svg" alt="工作室桌上有蕾絲、玫瑰與一條項鍊">
      <div class="about-copy">
        <p class="kicker">工作室</p>
        <h2>About BiJulia</h2>
        <p>${esc(ABOUT_LEAD)}</p>
        <a class="linkish" href="/about/">閱讀故事</a>
      </div>
    </section>
    <section class="section" id="instagram">
      <div class="wrap">
        <div class="section-head">
          <h2>Instagram</h2>
          <p class="lede"><a href="${site.instagram}" target="_blank" rel="noopener noreferrer">${esc(site.instagramHandle)}</a></p>
        </div>
      </div>
    </section>
    <section class="newsletter" id="newsletter">
      <p class="kicker">信件</p>
      <h2>From the garden</h2>
      <p class="lede">新作品、工作室的日子，以及安靜抵達的消息。偶爾寫，不會太密。</p>
      <form id="letter-form">
        <input type="email" name="email" required placeholder="電子郵件" aria-label="電子郵件">
        <button class="btn" type="submit">Subscribe</button>
      </form>
      <p class="form-note fine" id="letter-note"></p>
    </section>
  `;
}

const filterOptions = [
  ["all", "All"],
  ["new", `<img class="new-in-mark" src="/images/new-in.png" alt="New In">`],
  ["best", "Best Sellers"],
  ["necklace", "Necklaces"],
  ["sticker", "Stickers"],
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
    all: ["Shop", "少量製作的項鍊與貝殼貼紙。"],
    new: ["New In", "最新的項鍊，以及貝殼貼紙。"],
    best: ["Best Sellers", "最先離開桌面的那幾件。"],
    necklace: ["Necklaces", "給浪漫的人的手工飾品。"],
    sticker: ["Stickers", "貝殼圖，三張貼紙 NT$50。"],
  };
  return map[filter] || map.all;
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
          <h1 class="page-title">${title === "New In" ? `<img class="title-mark" src="/images/new-in.png" alt="New In">` : esc(title)}</h1>
          <p class="fine">${esc(lede)}</p>
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
  const care = product.category === "sticker"
    ? "貼在乾淨、乾燥的表面上。這是霧面印刷的紙貼紙，不能貼在布上，也不能水洗。"
    : "沒有戴的時候，把項鍊放回鏈袋裡。";
  const shipping = `滿 ${money(site.freeShipping)} 免運。未滿則運費 ${money(site.shippingFee)}。項鍊於 5–8 天內從工作室寄出。貼紙多半 3 天內寄出。`;
  const pictures = product.images && product.images.length ? product.images : [product.image];
  const wornShots = pictures.filter((src) => /worn/i.test(src));
  const galleryShots = pictures.filter((src) => !/worn/i.test(src));
  return `
    <div class="page">
      ${crumbs([
        { href: "/", label: "Home" },
        { href: "/shop/", label: "Shop" },
        collection ? { href: `/collections/${collection.slug}/`, label: collection.name } : null,
        { label: product.name },
      ].filter(Boolean))}
      <article class="pdp">
        <div class="pdp-gallery">
          ${product.colors && product.colors.length
            ? `<img data-color-preview src="${product.colors[0].image}" alt="${esc(product.name)}，${esc(product.colors[0].name)}" class="${fitClass(product)}">`
            : (galleryShots.length ? galleryShots : [product.image]).map((src, index) => `<img src="${src}" alt="${esc(product.name)}${index ? "，穿搭" : ""}" class="${fitClass(product)}">`).join("")}
          ${product.video ? `<video src="${product.video}" poster="${product.poster || product.image}" autoplay muted playsinline preload="auto" controls></video>` : ""}
        </div>
        <div class="pdp-info">
          <p class="kicker">${esc(collection ? collection.name : "")}</p>
          <h1>${esc(product.name)}</h1>
          <p class="price">${priceText(product)}</p>
          ${product.soldOut ? `<p class="sold-note"><img class="sold-out-mark" src="/images/sold-out.png" alt="Sold out"></p>` : ""}
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
          <details open>
            <summary>細節</summary>
            <p>${esc(product.details)}</p>
            ${wornShots.length ? `<div class="detail-photos">${wornShots.map((src) => `<img class="photo" src="${src}" alt="${esc(product.name)}，穿搭">`).join("")}</div>` : ""}
          </details>
          <details>
            <summary>運送</summary>
            <p>${esc(shipping)}</p>
          </details>
          <details>
            <summary>保養</summary>
            <p>${esc(care)}</p>
          </details>
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
          <h1>Your bag is empty</h1>
          <p class="fine">當一件覺得對了，它會在這裡等你。</p>
          <a class="btn" href="/shop/">Continue shopping</a>
        </div>
      </div>
    `;
  }
  const sums = totals();
  return `
    <div class="page">
      ${crumbs([{ href: "/", label: "Home" }, { label: "Your bag" }])}
      <h1 class="page-title">Your bag</h1>
      <div class="bag-layout">
        <div>${items.map((item) => line(item, false)).join("")}</div>
        <aside class="summary">
          <h2>Summary</h2>
          ${summaryMoney(sums)}
          ${sums.sub ? `<div class="summary-row"><span>運費</span><span>${sums.ship === 0 ? "免運" : money(sums.ship)}</span></div>
          <div class="summary-row"><strong>合計</strong><strong>${money(sums.total)}</strong></div>
          <p class="fine">${esc(shippingNote(sums.sub))}</p>` : ""}
          <a class="btn btn-fill" href="/checkout/">Request order</a>
          <p class="fine" style="margin-top:12px">下單後請到 Instagram 私訊，討論更多細節。這個頁面不會扣款。</p>
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
        ${mail ? `<p class="fine" style="margin-top:28px"><a class="linkish" href="${esc(mail)}">如果 Gmail 沒有打開，請按這裡。寄出後，你的 Gmail 會收到下單成功通知。</a></p>` : ""}
      </div>
    </div>
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
      <p class="fine" style="max-width:52ch;margin-bottom:28px">留下姓名、電話、Gmail 和 7-11 店名。這會打開 Gmail，寄給工作室，也寄到你的 Gmail，通知下單成功。請在 Gmail 按寄出。不會在這裡付款。</p>
      <form id="request-form" style="max-width:440px">
          <label class="field"><span>姓名</span><input name="name" required autocomplete="name"></label>
          <label class="field"><span>電話</span><input name="phone" type="tel" required autocomplete="tel"></label>
          <label class="field"><span>Gmail</span><input name="gmail" type="email" required autocomplete="email" placeholder="name@gmail.com"></label>
          <label class="field"><span>7-11 店名</span><input name="store" required></label>
          <button class="btn btn-fill" type="submit">Send</button>
      </form>
    </div>
  `;
}

function renderAbout() {
  return `
    <div class="page">
      ${crumbs([{ href: "/", label: "Home" }, { label: "About" }])}
      <div class="story">
        <p class="kicker">我們的故事</p>
        <h1 class="page-title">About BiJulia</h1>
        <p>${esc(ABOUT_LEAD)}</p>
      </div>
      <div class="split">
        <img src="/images/about.svg" alt="工作室桌上有玫瑰、蕾絲與珍珠">
        <div class="prose">
          <p>工作從已經有過生活的東西開始：一段蕾絲、一顆有凹痕的珍珠、早晨散步時看見的一扇門。沒有趕工，也沒有一次做上百件。</p>
          <p>項鍊之外，BiJulia 把貝殼印成貼紙。一組三張是 NT$50。</p>
        </div>
      </div>
      <div class="steps">
        <div><h3>Gather</h3><p class="fine">珍珠、緞帶、有舊物感的零件，以及哪天想用紙的時候，那張貝殼圖。</p></div>
        <div><h3>Compose</h3><p class="fine">每一條項鍊都用手排好，在日光下看過，才准它留下。</p></div>
        <div><h3>Keep small</h3><p class="fine">每種只做幾件。沒了以後，下一件不會完全一樣。</p></div>
      </div>
    </div>
  `;
}

function renderJournal() {
  return `
    <div class="page">
      ${crumbs([{ href: "/", label: "Home" }, { label: "Journal" }])}
      <h1 class="page-title">Journal</h1>
      <p class="fine" style="margin-bottom:36px">從工作室慢慢寫下的筆記。</p>
      <div class="journal-list">
        ${journal.map((article) => `
          <a class="journal-item" href="/journal/${article.slug}/">
            <img src="${article.image}" alt="">
            <div>
              <p class="kicker">${esc(article.date)}</p>
              <h2>${esc(article.title)}</h2>
              <p>${esc(article.excerpt)}</p>
            </div>
          </a>
        `).join("")}
      </div>
    </div>
  `;
}

function renderArticle() {
  const article = articleBySlug(slug);
  if (!article) return renderNotFound();
  document.title = `${article.title} — BiJulia`;
  const others = journal.filter((item) => item.slug !== article.slug);
  return `
    <div class="page">
      ${crumbs([{ href: "/", label: "Home" }, { href: "/journal/", label: "Journal" }, { label: article.title }])}
      <article class="article">
        <img class="lead-img" src="${article.image}" alt="">
        <p class="date">${esc(article.date)}</p>
        <h1>${esc(article.title)}</h1>
        <div class="prose">
          <p>${esc(article.paragraphs[0])}</p>
          <p class="pull">${esc(article.pull)}</p>
          ${article.paragraphs.slice(1).map((paragraph) => `<p>${esc(paragraph)}</p>`).join("")}
        </div>
      </article>
      <div class="related">
        <h2>More notes</h2>
        <div class="journal-list">
          ${others.map((item) => `<a class="linkish" href="/journal/${item.slug}/">${esc(item.title)}</a>`).join(" · ")}
        </div>
      </div>
    </div>
  `;
}

function renderCare() {
  return `
    <div class="page">
      ${crumbs([{ href: "/", label: "Home" }, { label: "Customer Care" }])}
      <h1 class="page-title">Customer Care</h1>
      <p class="fine" style="max-width:48ch;margin:8px 0 12px">這是一間小工作室。需要人回答的時候，請到 Instagram 私訊。</p>
      <section class="care-block" id="shipping">
        <h2>Shipping</h2>
        <p>滿 ${money(site.freeShipping)} 免運。未滿則運費 ${money(site.shippingFee)}。項鍊裝在麻布袋裡，5–8 天內寄出。貼紙放進封套，多半 3 天內寄出。</p>
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
    about: renderAbout,
    journal: renderJournal,
    "journal-article": renderArticle,
    care: renderCare,
    "not-found": renderNotFound,
  };
  const titles = {
    home: "BiJulia",
    shop: "Shop — BiJulia",
    collections: "Collections — BiJulia",
    cart: "Your Bag — BiJulia",
    checkout: "Request an Order — BiJulia",
    about: "About — BiJulia",
    journal: "Journal — BiJulia",
    care: "Customer Care — BiJulia",
  };
  if (titles[page]) document.title = titles[page];
  root.innerHTML = (views[page] || renderNotFound)();
  const video = root.querySelector("video");
  if (video) {
    video.muted = true;
    video.play().catch(() => {});
  }
}

function drawerHtml() {
  const items = store.getCart();
  const body = document.getElementById("drawer-body");
  const foot = document.getElementById("drawer-foot");
  if (!items.length) {
    body.innerHTML = `<div class="empty"><h2>Your bag is empty</h2><p class="fine">一條項鍊或一枚貝殼，可以先放在這裡。</p></div>`;
    foot.innerHTML = `<a class="btn btn-fill" href="/shop/">Shop the atelier</a>`;
    return;
  }
  const sums = totals();
  body.innerHTML = items.map((item) => line(item, true)).join("");
  foot.innerHTML = `
    ${summaryMoney(sums)}
    ${sums.sub ? `<p class="fine">${esc(shippingNote(sums.sub))}</p>` : ""}
    <a class="btn btn-fill" href="/cart/">View bag</a>
  `;
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
      <strong>${esc(item.name)}</strong>
      <span>${priceText(item)}</span>
    </a>
  `).join("");
  const empty = query.trim() && !list.length ? `<p class="fine">試試玫瑰、珍珠、蕾絲或貝殼。</p>` : "";
  box.innerHTML = `<p class="search-label">${esc(label)}</p>${rows}${empty}`;
}

function buildGmailUrl(data) {
  const items = store.getCart().map((item) => {
    const product = productBySlug(item.slug);
    const tone = product && colorById(product, item.color);
    const label = product ? (tone ? `${product.name} (${tone.name})` : product.name) : "";
    return product ? `${label} × ${item.qty} — ${priceText(product, item.qty)}` : "";
  }).filter(Boolean);
  const sums = totals();
  const body = [
    `${data.name}，你的 BiJulia 訂單已送出。`,
    "這封信會寄到工作室，也會寄到你的 Gmail。",
    "請到 Instagram 私訊 @2sbijulia，討論更多細節。",
    "",
    `姓名：${data.name}`,
    `電話：${data.phone}`,
    `Gmail：${data.gmail}`,
    `7-11 店名：${data.store}`,
    "",
    "作品：",
    ...items,
    "",
    sums.twd ? `NT$: NT$${sums.twd}` : "",
    sums.sub ? `飾品：${money(sums.sub)}` : "",
    sums.sub ? `運費：${sums.ship === 0 ? "免運" : money(sums.ship)}` : "",
    sums.sub ? `飾品合計：${money(sums.total)}` : "",
  ].filter((line) => line !== undefined).join("\n");
  const query = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: `${site.email},${data.gmail}`,
    su: "BiJulia 下單成功",
    body,
  });
  return `https://mail.google.com/mail/?${query.toString()}`;
}

function onClick(event) {
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

function onSubmit(event) {
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
  if (event.target.id === "request-form") {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target).entries());
    const url = buildGmailUrl(data);
    store.clearCart();
    try { sessionStorage.setItem("bijulia-order-mail", url); } catch { /* ignore */ }
    window.open(url, "_blank", "noopener");
    location.href = "/checkout/?sent=1";
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

function boot() {
  document.body.insertAdjacentHTML("afterbegin", shell());
  renderMain();
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
    refreshChrome();
  });
  store.subscribe(() => {
    if (page === "cart" || page === "checkout") renderMain();
    refreshChrome();
  });
}

boot();
