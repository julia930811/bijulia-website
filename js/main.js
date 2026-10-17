import {
  site,
  products,
  collections,
  journal,
  instagramShots,
  productBySlug,
  collectionBySlug,
  articleBySlug,
  productsIn,
} from "./data.js";
import * as store from "./store.js";

const page = document.body.dataset.page || "home";
const slug = document.body.dataset.slug || "";
const ui = { drawer: false, search: false, menu: false };

const ABOUT_LEAD =
  "BiJulia was born from a love of vintage details, romantic gardens, lace, and forgotten treasures. Each piece is handmade in small quantities.";

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

function iconHeart() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.2c-.3 0-7.2-4.1-9.1-8.2C1.4 9.2 2.6 6 5.8 6c1.8 0 3.1 1 3.8 2.3C10.3 7 11.6 6 13.4 6c3.2 0 4.4 3.2 2.7 6-1.9 4.1-8.8 8.2-9.1 8.2z"></path></svg>';
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
      (key === "collections" && path.startsWith("/collections")) ||
      (key === "about" && path.startsWith("/about")) ||
      (key === "journal" && path.startsWith("/journal"));
    return on ? ' aria-current="page"' : "";
  };
  const sub = (href, label) => `<a href="${href}">${label}</a>`;
  return `
    <a class="skip" href="#app">Skip to content</a>
    <div class="announce">Handmade in small batches · Complimentary shipping over ${money(site.freeShipping)}</div>
    <header class="site-header">
      <div class="header-inner">
        <div class="header-left">
          <button class="menu-toggle" type="button" data-open-menu aria-label="Open menu">${iconMenu()}</button>
          <a class="logo" href="/" aria-label="BiJulia"><img src="/images/logo.png" alt="BiJulia"></a>
        </div>
        <nav class="nav" aria-label="Primary">
          <a href="/shop/?filter=new"${mark("new")}>New In</a>
          <div class="has-sub">
            <a href="/shop/"${mark("shop")}>Shop</a>
            <div class="submenu">
              ${sub("/shop/", "All pieces")}
              ${sub("/shop/?filter=necklace", "Necklaces")}
              ${sub("/shop/?filter=sticker", "Stickers")}
              ${sub("/collections/rose-garden/", "Rose Garden")}
              ${sub("/collections/lace-ribbons/", "Lace & Ribbons")}
              ${sub("/collections/vintage-treasures/", "Vintage Treasures")}
              ${sub("/collections/pearl-collection/", "Pearl Collection")}
            </div>
          </div>
          <div class="has-sub">
            <a href="/collections/"${mark("collections")}>Collections</a>
            <div class="submenu">
              ${collections.map((item) => sub(`/collections/${item.slug}/`, item.name)).join("")}
            </div>
          </div>
          <a href="/about/"${mark("about")}>About</a>
          <a href="/journal/"${mark("journal")}>Journal</a>
        </nav>
        <div class="tools">
          <button class="icon-btn" type="button" data-open-search aria-label="Search">${iconSearch()}</button>
          <a class="icon-btn" href="/wishlist/" aria-label="Wishlist">${iconHeart()}<span class="count" data-wish-count hidden>0</span></a>
          <button class="icon-btn" type="button" data-open-drawer aria-label="Shopping bag">${iconBag()}<span class="count" data-cart-count hidden>0</span></button>
        </div>
      </div>
    </header>
    <main id="app"></main>
    <footer class="site-footer">
      <div class="footer-grid">
        <div>
          <h2>Shop</h2>
          <a href="/shop/?filter=new">New In</a>
          <a href="/shop/">All pieces</a>
          <a href="/shop/?filter=necklace">Necklaces</a>
          <a href="/shop/?filter=sticker">Stickers</a>
          <a href="/collections/rose-garden/">Rose Garden</a>
          <a href="/collections/lace-ribbons/">Lace &amp; Ribbons</a>
          <a href="/collections/vintage-treasures/">Vintage Treasures</a>
          <a href="/collections/pearl-collection/">Pearl Collection</a>
        </div>
        <div>
          <h2>Customer Care</h2>
          <a href="/customer-care/#shipping">Shipping</a>
          <a href="/customer-care/#returns">Returns</a>
          <a href="/customer-care/#care">Jewelry Care</a>
          <a href="/customer-care/#stickers">Sticker Care</a>
          <a href="/customer-care/#contact">Contact</a>
        </div>
        <div>
          <h2>About</h2>
          <a href="/about/">Our Story</a>
          <a href="/journal/">Journal</a>
          <a href="/collections/">Collections</a>
        </div>
        <div>
          <h2>Instagram</h2>
          <a href="${site.instagram}" target="_blank" rel="noopener noreferrer">${esc(site.instagramHandle)}</a>
          <p class="fine">Studio days, new ribbons, and shells on the table.</p>
        </div>
      </div>
      <div class="footer-base">
        <a class="logo" href="/" aria-label="BiJulia"><img src="/images/logo.png" alt=""></a>
        <span>© ${new Date().getFullYear()} BiJulia. Handmade in small quantities.</span>
      </div>
    </footer>
    <div class="scrim" data-close-overlay hidden></div>
    <aside id="drawer" class="drawer" aria-hidden="true" aria-label="Shopping bag">
      <div class="drawer-head">
        <h2>Your bag</h2>
        <button class="icon-btn" type="button" data-close-overlay aria-label="Close bag">${iconClose()}</button>
      </div>
      <div id="drawer-body"></div>
      <div class="drawer-foot" id="drawer-foot"></div>
    </aside>
    <div id="search" class="search-screen" aria-hidden="true">
      <form id="search-form" class="search-top" role="search">
        <label class="sr-only" for="q">Search the atelier</label>
        <input id="q" type="search" placeholder="Search the atelier" autocomplete="off">
        <button class="icon-btn" type="button" data-close-overlay aria-label="Close search">${iconClose()}</button>
      </form>
      <div id="search-results" class="search-results"></div>
    </div>
    <div id="mobile-nav" class="mobile-nav" aria-hidden="true">
      <div class="mobile-head">
        <a class="logo" href="/" aria-label="BiJulia"><img src="/images/logo.png" alt=""></a>
        <button class="icon-btn" type="button" data-close-overlay aria-label="Close menu">${iconClose()}</button>
      </div>
      <a href="/shop/?filter=new">New In</a>
      <a href="/shop/">Shop</a>
      <a class="sub" href="/shop/?filter=necklace">Necklaces</a>
      <a class="sub" href="/shop/?filter=sticker">Stickers</a>
      <a class="sub" href="/collections/rose-garden/">Rose Garden</a>
      <a class="sub" href="/collections/lace-ribbons/">Lace &amp; Ribbons</a>
      <a class="sub" href="/collections/vintage-treasures/">Vintage Treasures</a>
      <a class="sub" href="/collections/pearl-collection/">Pearl Collection</a>
      <a href="/collections/">Collections</a>
      <a href="/about/">About</a>
      <a href="/journal/">Journal</a>
    </div>
  `;
}

function card(product) {
  const saved = store.hasWish(product.slug);
  return `
    <article class="card">
      <div class="card-media">
        <a href="/product/${product.slug}/"><img src="${product.image}" alt="${esc(product.name)}" class="${fitClass(product)}"></a>
        <button class="wish ${saved ? "is-on" : ""}" type="button" data-wish="${product.slug}" aria-label="${saved ? "Remove from wishlist" : "Save to wishlist"}: ${esc(product.name)}">${iconHeart()}</button>
        ${product.soldOut
          ? `<span class="quick-add is-sold">Sold out</span>`
          : `<button class="quick-add" type="button" data-add="${product.slug}">Add to bag</button>`}
      </div>
      <div class="card-info">
        <a class="card-name" href="/product/${product.slug}/">${esc(product.name)}</a>
        <p class="card-price">${priceText(product)}</p>
        ${product.soldOut ? `<p class="fine">Sold out</p>` : ""}
        ${product.unit ? `<p class="fine">${esc(product.unit)}</p>` : ""}
      </div>
    </article>
  `;
}

function grid(list) {
  if (!list.length) {
    return `<div class="empty"><h2>Nothing in this edit yet.</h2><p class="fine">The table is between pieces.</p></div>`;
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
  if (sums.sub) rows.push(`<div class="summary-row"><span>Subtotal</span><span>${money(sums.sub)}</span></div>`);
  if (sums.twd) rows.push(`<div class="summary-row"><span>NT$</span><span>NT$${sums.twd.toLocaleString("en-US")}</span></div>`);
  return rows.join("");
}

function shippingNote(sub) {
  if (sub === 0) return "";
  if (sub >= site.freeShipping) return "Complimentary shipping";
  const rest = site.freeShipping - sub;
  return `Add ${money(rest)} for complimentary shipping`;
}

function line(item, compact) {
  const product = productBySlug(item.slug);
  if (!product) return "";
  const limit = item.qty >= product.maxQty ? '<p class="fine">Small-batch limit for this piece.</p>' : "";
  return `
    <article class="line">
      <a href="/product/${product.slug}/"><img src="${product.image}" alt="" class="${fitClass(product)}"></a>
      <div>
        <h3><a href="/product/${product.slug}/">${esc(product.name)}</a></h3>
        <div class="qty" data-max="${product.maxQty}">
          <button type="button" data-line-step="-1" data-slug="${product.slug}" aria-label="Decrease quantity">−</button>
          <span aria-live="polite">${item.qty}</span>
          <button type="button" data-line-step="1" data-slug="${product.slug}" aria-label="Increase quantity">+</button>
        </div>
        ${compact ? "" : limit}
        <button class="remove" type="button" data-remove="${product.slug}">Remove</button>
      </div>
      <p class="line-price">${priceText(product, item.qty)}</p>
    </article>
  `;
}

function renderHome() {
  const newest = products.filter((item) => item.isNew && item.category === "necklace").slice(0, 4);
  const sellers = products.filter((item) => item.isBestSeller && item.category === "necklace").slice(0, 4);
  const stickers = products.filter((item) => item.category === "sticker");
  const homeCollections = collections.filter((item) => item.home);
  return `
    <section class="hero">
      <div class="hero-copy">
        <h1>BiJulia</h1>
        <p>${esc(site.tagline)}</p>
        <a class="btn" href="/shop/">Shop now</a>
      </div>
    </section>
    <section class="swan-band" aria-label="Swans">
      <img src="/images/swans.gif" alt="Two glittering swans">
    </section>
    <section class="fountain-band" aria-label="Fountain">
      <img src="/images/fountain.gif" alt="A fountain with a bird, flowers, and a sign">
    </section>
    <section class="section" id="new-in">
      <div class="wrap">
        <div class="section-head"><h2>New In</h2></div>
        ${grid(newest)}
        <p class="more-link"><a class="linkish" href="/shop/?filter=new">View all</a></p>
      </div>
    </section>
    <section class="section" id="collections">
      <div class="wrap">
        <div class="section-head"><h2>Collections</h2></div>
        <div class="collection-grid">
          ${homeCollections.map((item) => `
            <a class="tile" href="/collections/${item.slug}/">
              <img src="${item.image}" alt="" class="${fitClass(item)}">
              <span>${esc(item.name)}</span>
            </a>
          `).join("")}
        </div>
      </div>
    </section>
    <section class="section sticker-feature" id="stickers">
      <div class="wrap">
        <div class="section-head">
          <p class="kicker">Also in the atelier</p>
          <h2>Shell Stickers</h2>
          <p class="lede">Three stickers for NT$50.</p>
        </div>
        <div class="sticker-stage">${stickers.map(card).join("")}</div>
        <p class="more-link"><a class="linkish" href="/collections/shell-stickers/">View the shells</a></p>
      </div>
    </section>
    <section class="section" id="best-sellers">
      <div class="wrap">
        <div class="section-head"><h2>Best Sellers</h2></div>
        ${grid(sellers)}
        <p class="more-link"><a class="linkish" href="/shop/?filter=best">View all</a></p>
      </div>
    </section>
    <section class="about-band" id="about-bijulia">
      <img src="/images/about.svg" alt="A studio table with lace, roses, and a necklace">
      <div class="about-copy">
        <p class="kicker">The studio</p>
        <h2>About BiJulia</h2>
        <p>${esc(ABOUT_LEAD)}</p>
        <a class="linkish" href="/about/">Read the story</a>
      </div>
    </section>
    <section class="section" id="instagram">
      <div class="wrap">
        <div class="section-head">
          <h2>Instagram</h2>
          <p class="lede"><a href="${site.instagram}" target="_blank" rel="noopener noreferrer">${esc(site.instagramHandle)}</a></p>
        </div>
        <div class="ig-grid">
          ${instagramShots.map((shot) => `
            <a href="${site.instagram}" target="_blank" rel="noopener noreferrer">
              <img src="${shot.src}" alt="${esc(shot.alt)}" class="${fitClass(shot)}">
            </a>
          `).join("")}
        </div>
      </div>
    </section>
    <section class="newsletter" id="newsletter">
      <p class="kicker">Letters</p>
      <h2>From the garden</h2>
      <p class="lede">Notes on new pieces, studio days, and quiet arrivals. Occasional, and never crowded.</p>
      <form id="letter-form">
        <input type="email" name="email" required placeholder="Email address" aria-label="Email address">
        <button class="btn" type="submit">Subscribe</button>
      </form>
      <p class="form-note fine" id="letter-note"></p>
    </section>
  `;
}

const filterOptions = [
  ["all", "All"],
  ["new", "New In"],
  ["best", "Best Sellers"],
  ["necklace", "Necklaces"],
  ["sticker", "Stickers"],
  ["rose-garden", "Rose Garden"],
  ["lace-ribbons", "Lace & Ribbons"],
  ["vintage-treasures", "Vintage Treasures"],
  ["pearl-collection", "Pearls"],
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
    all: ["Shop", "Necklaces and shell stickers, made in small quantities."],
    new: ["New In", "The latest necklaces, and the shell stickers."],
    best: ["Best Sellers", "The pieces that leave the table first."],
    necklace: ["Necklaces", "Handmade jewelry for romantic souls."],
    sticker: ["Stickers", "The shell drawing, three stickers for NT$50."],
  };
  return map[filter] || map.all;
}

function renderShop() {
  const filter = params().get("filter") || "all";
  const sort = params().get("sort") || "featured";
  const [title, lede] = shopHeading(filter);
  const list = applySort(applyFilter(products, filter), sort);
  const word = list.length === 1 ? "piece" : "pieces";
  return `
    <div class="page">
      ${crumbs([{ href: "/", label: "Home" }, { label: "Shop" }])}
      <div class="shop-top">
        <div>
          <h1 class="page-title">${esc(title)}</h1>
          <p class="fine">${esc(lede)}</p>
        </div>
        <label class="sort">Sort
          <select data-sort aria-label="Sort pieces">
            <option value="featured"${sort === "featured" ? " selected" : ""}>Featured</option>
            <option value="price-asc"${sort === "price-asc" ? " selected" : ""}>Price, low to high</option>
            <option value="price-desc"${sort === "price-desc" ? " selected" : ""}>Price, high to low</option>
            <option value="name"${sort === "name" ? " selected" : ""}>Name</option>
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
        <p class="lede" style="margin-left:0">Four jewelry edits, and the shell stickers printed from the same drawings.</p>
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
          <p class="kicker">Collection</p>
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
  const saved = store.hasWish(product.slug);
  const specs = product.category === "sticker"
    ? [["Set", "3 stickers"], ["Price", "NT$50"], ["Made", "In small batches"]]
    : [["Length", product.length], ["Materials", product.materials], ["Made", "By hand, in small batches"]];
  const care = product.category === "sticker"
    ? "Place on a clean, dry surface. These are paper stickers with a matte print — not for fabric, and not for the wash."
    : "When you are not wearing it, put the necklace in its chain bag.";
  const shipping = `Complimentary shipping begins at ${money(site.freeShipping)}. Below that, shipping is ${money(site.shippingFee)}. Necklaces leave the studio within 5–8 days. Stickers often leave within 3.`;
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
          ${(product.images && product.images.length ? product.images : [product.image]).map((src, index) => `<img src="${src}" alt="${esc(product.name)}${index ? ", worn" : ""}" class="${fitClass(product)}">`).join("")}
          ${product.video ? `<video src="${product.video}" poster="${product.poster || product.image}" controls playsinline preload="metadata"></video>` : ""}
        </div>
        <div class="pdp-info">
          <p class="kicker">${esc(collection ? collection.name : "")}</p>
          <h1>${esc(product.name)}</h1>
          <p class="price">${priceText(product)}</p>
          ${product.soldOut ? `<p class="sold-note">Sold out</p>` : ""}
          ${product.unit ? `<p class="fine">${esc(product.unit)}</p>` : ""}
          <p class="desc">${esc(product.description)}</p>
          <dl class="specs">
            ${specs.map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join("")}
          </dl>
          ${product.soldOut ? "" : `
          <div class="qty" data-max="${product.maxQty}">
            <button type="button" data-qty-step="-1" aria-label="Decrease quantity">−</button>
            <input data-qty-input value="1" inputmode="numeric" aria-label="Quantity">
            <button type="button" data-qty-step="1" aria-label="Increase quantity">+</button>
          </div>`}
          <button class="btn btn-fill${product.soldOut ? " is-sold" : ""}" type="button"${product.soldOut ? " disabled" : ` data-add="${product.slug}"`}>${product.soldOut ? "Sold out" : "Add to bag"}</button>
          <button class="linkish wish-text ${saved ? "is-on" : ""}" type="button" data-wish="${product.slug}">${saved ? "Saved to wishlist" : "Save to wishlist"}</button>
          <details open>
            <summary>Details</summary>
            <p>${esc(product.details)}</p>
          </details>
          <details>
            <summary>Shipping</summary>
            <p>${esc(shipping)}</p>
          </details>
          <details>
            <summary>Care</summary>
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
          <p class="fine">When a piece feels right, it will wait for you here.</p>
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
          ${sums.sub ? `<div class="summary-row"><span>Shipping</span><span>${sums.ship === 0 ? "Complimentary" : money(sums.ship)}</span></div>
          <div class="summary-row"><strong>Total</strong><strong>${money(sums.total)}</strong></div>
          <p class="fine">${esc(shippingNote(sums.sub))}</p>` : ""}
          <a class="btn btn-fill" href="/checkout/">Request order</a>
          <p class="fine" style="margin-top:12px">We confirm each order by email before payment. Nothing is charged on this preview.</p>
        </aside>
      </div>
    </div>
  `;
}

function renderWishlist() {
  const saved = store.getWishlist().map(productBySlug).filter(Boolean);
  if (!saved.length) {
    return `
      <div class="page">
        <div class="empty">
          <h1>Wishlist</h1>
          <p class="fine">Nothing saved yet. The heart on a piece will keep it here.</p>
          <a class="btn" href="/shop/">Shop the atelier</a>
        </div>
      </div>
    `;
  }
  return `
    <div class="page">
      ${crumbs([{ href: "/", label: "Home" }, { label: "Wishlist" }])}
      <h1 class="page-title">Wishlist</h1>
      <p class="count-line">${saved.length} saved</p>
      ${grid(saved)}
    </div>
  `;
}

function renderCheckout() {
  const items = store.getCart();
  if (!items.length) {
    return `
      <div class="page">
        <div class="empty">
          <h1>Nothing to request</h1>
          <p class="fine">Your bag is empty.</p>
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
      <p class="fine" style="max-width:52ch;margin-bottom:28px">Handmade pieces are confirmed personally. This opens an email with your list — it does not take payment.</p>
      <div class="checkout-layout">
        <form id="request-form">
          <label class="field"><span>Name</span><input name="name" required autocomplete="name"></label>
          <label class="field"><span>Email</span><input name="email" type="email" required autocomplete="email"></label>
          <label class="field"><span>Where shall we send it?</span><input name="place" autocomplete="shipping address-level2"></label>
          <label class="field"><span>A note</span><textarea name="note" placeholder="A length, a pearl preference, a date."></textarea></label>
          <button class="btn btn-fill" type="submit">Email this request</button>
          <p class="form-note fine" id="request-note"></p>
        </form>
        <aside class="summary">
          <h2>Pieces</h2>
          ${items.map((item) => {
            const product = productBySlug(item.slug);
            if (!product) return "";
            return `<div class="summary-row"><span>${esc(product.name)} × ${item.qty}</span><span>${priceText(product, item.qty)}</span></div>`;
          }).join("")}
          ${summaryMoney(sums)}
          ${sums.sub ? `<div class="summary-row"><span>Shipping</span><span>${sums.ship === 0 ? "Complimentary" : money(sums.ship)}</span></div>
          <div class="summary-row"><strong>Total</strong><strong>${money(sums.total)}</strong></div>` : ""}
        </aside>
      </div>
    </div>
  `;
}

function renderAbout() {
  return `
    <div class="page">
      ${crumbs([{ href: "/", label: "Home" }, { label: "About" }])}
      <div class="story">
        <p class="kicker">Our story</p>
        <h1 class="page-title">About BiJulia</h1>
        <p>${esc(ABOUT_LEAD)}</p>
      </div>
      <div class="split">
        <img src="/images/about.svg" alt="Studio table with roses, lace, and pearls">
        <div class="prose">
          <p>The work starts with things that already have a life: a length of lace, a pearl with a dent, a gate seen on a morning walk. Nothing is made in a rush, and nothing is made in hundreds.</p>
          <p>Beside the necklaces, BiJulia prints the shell as a sticker. A set of three is NT$50.</p>
        </div>
      </div>
      <div class="steps">
        <div><h3>Gather</h3><p class="fine">Pearls, ribbon, vintage-feeling findings, and the shell drawing when the day asks for paper.</p></div>
        <div><h3>Compose</h3><p class="fine">Each necklace is arranged by hand, then looked at in daylight before it is allowed to stay.</p></div>
        <div><h3>Keep small</h3><p class="fine">A few of each. When they are gone, the next ones will not be identical.</p></div>
      </div>
    </div>
  `;
}

function renderJournal() {
  return `
    <div class="page">
      ${crumbs([{ href: "/", label: "Home" }, { label: "Journal" }])}
      <h1 class="page-title">Journal</h1>
      <p class="fine" style="margin-bottom:36px">Notes from the studio, written slowly.</p>
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
      <p class="fine" style="max-width:48ch;margin:8px 0 12px">A small studio. Write if you need a human answer.</p>
      <section class="care-block" id="shipping">
        <h2>Shipping</h2>
        <p>Complimentary shipping begins at ${money(site.freeShipping)}. Below that, shipping is ${money(site.shippingFee)}. Necklaces are packed in a linen pouch and leave within 5–8 days. Stickers are slipped into a sleeve and often leave within 3 days.</p>
      </section>
      <section class="care-block" id="returns">
        <h2>Returns</h2>
        <p>Unworn necklaces may come back within 14 days, in their pouch. Stickers can be returned only if they are still unused and in their sleeve. Write to us before you post anything back.</p>
      </section>
      <section class="care-block" id="care">
        <h2>Jewelry Care</h2>
        <p>When you are not wearing a necklace, put it in its chain bag.</p>
      </section>
      <section class="care-block" id="stickers">
        <h2>Sticker Care</h2>
        <p>The shells are matte printed stickers, cut to the drawing. Press them onto a clean, dry surface — paper, a mirror, a laptop. They are not for fabric and they are not meant to be washed.</p>
      </section>
      <section class="care-block" id="contact">
        <h2>Contact</h2>
        <p>Email <a class="linkish" href="mailto:${site.email}">${esc(site.email)}</a> for an order, a repair, or a question about a pearl.</p>
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
        <p class="fine">The piece you wanted may have a new name, or the path was mistyped.</p>
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
    wishlist: renderWishlist,
    checkout: renderCheckout,
    about: renderAbout,
    journal: renderJournal,
    "journal-article": renderArticle,
    care: renderCare,
    "not-found": renderNotFound,
  };
  const titles = {
    home: "BiJulia — Handmade jewelry for romantic souls",
    shop: "Shop — BiJulia",
    collections: "Collections — BiJulia",
    cart: "Your Bag — BiJulia",
    wishlist: "Wishlist — BiJulia",
    checkout: "Request an Order — BiJulia",
    about: "About — BiJulia",
    journal: "Journal — BiJulia",
    care: "Customer Care — BiJulia",
  };
  if (titles[page]) document.title = titles[page];
  root.innerHTML = (views[page] || renderNotFound)();
}

function drawerHtml() {
  const items = store.getCart();
  const body = document.getElementById("drawer-body");
  const foot = document.getElementById("drawer-foot");
  if (!items.length) {
    body.innerHTML = `<div class="empty"><h2>Your bag is empty</h2><p class="fine">A necklace or a shell can wait here.</p></div>`;
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
  const wishN = store.wishCount();
  document.querySelectorAll("[data-cart-count]").forEach((node) => {
    node.textContent = String(cartN);
    node.hidden = cartN === 0;
  });
  document.querySelectorAll("[data-wish-count]").forEach((node) => {
    node.textContent = String(wishN);
    node.hidden = wishN === 0;
  });
  const bagBtn = document.querySelector("[data-open-drawer]");
  if (bagBtn) bagBtn.setAttribute("aria-label", cartN ? `Shopping bag, ${cartN} items` : "Shopping bag");
  document.querySelectorAll("[data-wish]").forEach((node) => {
    const on = store.hasWish(node.dataset.wish);
    node.classList.toggle("is-on", on);
    if (node.classList.contains("wish-text")) node.textContent = on ? "Saved to wishlist" : "Save to wishlist";
    else node.setAttribute("aria-label", `${on ? "Remove from wishlist" : "Save to wishlist"}: ${node.getAttribute("aria-label")?.split(":").slice(1).join(":").trim() || ""}`);
  });
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
  if (!text) return { label: "New in the atelier", list: products.filter((item) => item.isNew).slice(0, 4) };
  const list = products.filter((item) => {
    const collection = collectionBySlug(item.collection);
    const hay = [item.name, item.description, item.details, item.materials, item.category, collection ? collection.name : ""]
      .join(" ")
      .toLowerCase();
    return hay.includes(text);
  });
  return { label: list.length ? "Pieces" : "No pieces by that name", list };
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
  const empty = query.trim() && !list.length ? `<p class="fine">Try rose, pearl, lace, or shell.</p>` : "";
  box.innerHTML = `<p class="search-label">${esc(label)}</p>${rows}${empty}`;
}

function buildMailto(data) {
  const items = store.getCart().map((item) => {
    const product = productBySlug(item.slug);
    return product ? `${product.name} × ${item.qty} — ${priceText(product, item.qty)}` : "";
  }).filter(Boolean);
  const sums = totals();
  const body = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Send to: ${data.place || "—"}`,
    "",
    "Pieces:",
    ...items,
    "",
    sums.twd ? `NT$: NT$${sums.twd}` : "",
    sums.sub ? `Jewelry: ${money(sums.sub)}` : "",
    sums.sub ? `Shipping: ${sums.ship === 0 ? "Complimentary" : money(sums.ship)}` : "",
    sums.sub ? `Jewelry total: ${money(sums.total)}` : "",
    "",
    `Note: ${data.note || "—"}`,
  ].join("\n");
  return `mailto:${site.email}?subject=${encodeURIComponent(`BiJulia order request from ${data.name}`)}&body=${encodeURIComponent(body)}`;
}

function onClick(event) {
  const wish = event.target.closest("[data-wish]");
  if (wish) {
    event.preventDefault();
    store.toggleWish(wish.dataset.wish);
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
    store.addToCart(product.slug, qty, product.maxQty);
    openOverlay("drawer");
    return;
  }
  const lineStep = event.target.closest("[data-line-step]");
  if (lineStep) {
    const product = productBySlug(lineStep.dataset.slug);
    const current = store.getCart().find((item) => item.slug === lineStep.dataset.slug);
    const step = Number(lineStep.dataset.lineStep);
    if (product && product.soldOut && step > 0) return;
    store.setQty(lineStep.dataset.slug, (current ? current.qty : 1) + step, product ? product.maxQty : 5);
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
    store.removeFromCart(remove.dataset.remove);
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
      note.textContent = "Please leave a valid email.";
      return;
    }
    try { localStorage.setItem("bijulia-letter", email); } catch { /* ignore */ }
    note.textContent = "Thank you. Your address stays in this browser until the letter list is connected.";
    input.value = "";
    return;
  }
  if (event.target.id === "request-form") {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target).entries());
    const note = document.getElementById("request-note");
    note.innerHTML = `Your email app should open with this request. If it does not, write to <a href="mailto:${site.email}">${esc(site.email)}</a>.`;
    window.location.href = buildMailto(data);
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
    if (page === "cart" || page === "wishlist" || page === "checkout") renderMain();
    refreshChrome();
  });
}

boot();
