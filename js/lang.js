import { products, collections } from "./data.js?v=25";

const STORAGE_KEY = "bijulia-lang";
const zhMeta = "BiJulia 是少量手工飾品。項鍊與貝殼貼紙，從舊日花園、蕾絲與被遺忘的小物而來。";
const enMeta = "BiJulia is a small studio of handmade jewelry. Necklaces and shell stickers, from an old garden, lace, and little forgotten things.";

export let lang = "zh";

try {
  if (localStorage.getItem(STORAGE_KEY) === "en") lang = "en";
} catch (error) {
  lang = "zh";
}

const en = {
  "語言": "Language",
  "排序": "Sort",
  "，穿搭": ", worn",
  "件": "pieces",
  "存貨": "Stock",
  "材質": "Materials",
  "帳號": "Account",
  "搜尋": "Search",
  "電話": "Phone",
  "顧客": "Customer",
  "細節": "Details",
  "顏色": "Color",
  "作品": "Piece",
  "通知": "Note",
  "說明": "Description",
  "免運": "Free shipping",
  "現在": "Now",
  "登出": "Log out",
  "分類": "Category",
  "數量": "Quantity",
  "合計": "Total",
  "高級": "Premium",
  "角色": "Role",
  "名稱": "Name",
  "運費": "Shipping",
  "下架": "Unlist",
  "戶名": "Account name",
  "銀行": "Bank",
  "小計": "Subtotal",
  "帳戶": "Account",
  "儲存": "Save",
  "製作": "Made",
  "照片": "Photo",
  "長度": "Length",
  "編輯": "Edit",
  "售完": "Sold out",
  "核准": "Approve",
  "系列": "Collection",
  "運送": "Shipping",
  "尚無": "None yet",
  "送出": "Send",
  "密碼": "Password",
  "價格": "Price",
  "可賣": "In stock",
  "上架": "List",
  "精選": "Featured",
  "組數": "Set",
  "保養": "Care",
  "姓名": "Name",
  "信件": "Letter",
  "註冊": "Register",
  "時間": "Time",
  "上傳": "Upload",
  "看貝殼": "See the shells",
  "上一張": "Previous",
  "新商品": "New piece",
  "不連結": "No link",
  "購物袋": "Bag",
  "管理者": "Admin",
  "下一張": "Next",
  "讀取中。": "Loading.",
  "增加數量": "Increase quantity",
  "開啟選單": "Open menu",
  "三張貼紙": "Three stickers",
  "少量製作": "Made in a small batch",
  "跳至內文": "Skip to content",
  "查看全部": "See all",
  "沒有訂單": "No orders",
  "排序作品": "Sort pieces",
  "送出中。": "Sending.",
  "付款方式": "Payment",
  "核准訂單": "Approve orders",
  "連結作品": "Linked piece",
  "這張穿搭": "This outfit",
  "購買紀錄": "Purchases",
  "一般顧客": "Customer",
  "減少數量": "Decrease quantity",
  "關閉註冊": "Close register",
  "電子郵件": "Email",
  "一般會員": "Member",
  "建立時間": "Created",
  "關閉登入": "Close login",
  "搜尋作品": "Search pieces",
  "會員等級": "Member tier",
  "顧客編號": "Customer number",
  "關閉選單": "Close menu",
  "關閉搜尋": "Close search",
  "沒有資料": "Nothing here",
  "寄完成通知": "Send the completion note",
  "沒有核准。": "Not approved.",
  "沒有改成。": "Nothing changed.",
  "補貨後通知": "Email me when it's back",
  "訂單已送出": "Order sent",
  "待核准訂單": "Orders waiting",
  "已核准訂單": "Approved orders",
  "運費：免運": "Shipping: free",
  "關閉購物袋": "Close bag",
  "沒有登入。": "Not signed in.",
  "價格由高到低": "Price, high to low",
  "讀不到訂單。": "Couldn't load orders.",
  "工作室的新品": "New in the studio",
  "價格由低到高": "Price, low to high",
  "仙女與噴水池": "Fairy and fountain",
  "請留下姓名。": "Please leave your name.",
  "讀不到名單。": "Couldn't load the list.",
  "這件已下架。": "This piece is unlisted.",
  "商品沒有上傳。": "The piece was not uploaded.",
  "請填穿搭名稱。": "Please name the outfit.",
  "再輸入一次密碼": "Password again",
  "桌上暫時空著。": "The table is empty for now.",
  "請選一張照片。": "Choose a photo.",
  "價格（NT$）": "Price (NT$)",
  "姓名 / 電話": "Name / phone",
  "訂單沒有送出。": "The order was not sent.",
  "購物袋是空的。": "Your bag is empty.",
  "7-11 店名": "7-Eleven store",
  "手工，少量製作": "Handmade, in small batches",
  "沒有完成註冊。": "Registration didn't finish.",
  "穿搭沒有上架。": "The outfit was not published.",
  "仙女在花噴水池旁": "A fairy beside a flower fountain",
  "商品沒有存起來。": "The piece was not saved.",
  "兩次密碼不一樣。": "The two passwords don't match.",
  "打開 Gmail": "Open Gmail",
  "存貨沒有存起來。": "The stock was not saved.",
  "高級會員 9 折": "Premium member, 10% off",
  "密碼至少要六個字。": "Use at least six characters.",
  "請選一張穿搭照片。": "Choose an outfit photo.",
  "上架 Outfit": "Publish an outfit",
  "電子郵件 / 地址": "Email / address",
  "會員等級沒有改成。": "The tier was not changed.",
  "沒有這個名字的作品": "No piece with that name",
  "三張一組 不可單賣": "Set of three. Not sold separately.",
  "一般會員，這次免運": "Member, free shipping on this order",
  "這件已到少量上限。": "This piece is at its small-batch limit.",
  "黑色鐵花門的捲草花紋": "Scrollwork on a black iron gate",
  "照片要小於 8MB。": "The photo must be under 8MB.",
  "請留下 Gmail。": "Please leave a Gmail address.",
  "目前沒有待核准的訂單。": "No orders are waiting.",
  "請留下有效的電子郵件。": "Please leave a valid email.",
  "高級會員，9 折、免運": "Premium member, 10% off and free shipping",
  "BiJulia 補貨通知": "BiJulia restock note",
  "註冊 — BiJulia": "Register — BiJulia",
  "帳戶 — BiJulia": "Account — BiJulia",
  "BiJulia 訂單完成": "BiJulia order complete",
  "核准訂單 — BiJulia": "Approve orders — BiJulia",
  "試試玫瑰、珍珠、蕾絲或貝殼。": "Try rose, pearl, lace, or shell.",
  "你是一般顧客，沒有會員優惠。": "You are a customer, with no member perk.",
  "存貨要是 0 或更大的整數。": "Stock must be a whole number, 0 or more.",
  "補貨後請寄到這個 Gmail。": "Please write to this Gmail when it's back.",
  "姓名和 7-11 店名都要填。": "Name and 7-Eleven store are both required.",
  "新的項鍊上架、消息，或新活動。": "New necklaces, news, or a new gathering.",
  "已改成一般顧客。沒有會員優惠。": "Now a customer. No member perk.",
  "沒有戴的時候，把項鍊放回鏈袋裡。": "When you're not wearing it, put the necklace back in its bag.",
  "電話要是 09 開頭的十個數字。": "The phone number must be 10 digits starting with 09.",
  "現在沒有管理者登入，所以沒有訂單。": "No admin is signed in, so there are no orders.",
  "你的 BiJulia 訂單已經完成。": "Your BiJulia order is complete.",
  "一條項鍊或一枚貝殼，可以先放在這裡。": "A necklace or a shell can wait here.",
  "沒有接上 Supabase，無法登入。": "Supabase isn't connected, so login isn't available.",
  "四組飾品，以及從同一批圖印成的貝殼貼紙。": "Four groups of jewelry, and shell stickers printed from the same drawings.",
  "已改成高級會員。作品 9 折，而且免運。": "Now a premium member. 10% off, and free shipping.",
  "你是一般會員。在社群分享商品後，下次免運。": "You are a member. After sharing a piece, the next order ships free.",
  "這是你自己的帳戶。角色是顧客。": "This is your account. Your role is customer. ",
  "這裡不會列出其他人。": "No one else is listed here.",
  "登入身分：": "Signed in as ",
  "，管理者。": ", admin.",
  " 註冊後就是管理者。不會寄信給賣家。核准訂單後會打開 Gmail，把訂單完成通知寄給顧客。": " registers as the admin. Nothing is emailed to the seller. Approving an order opens Gmail so the completion note can go to the customer.",
  "沒有接上 Supabase，帳號沒有建立。": "Supabase isn't connected, so the account was not created.",
  "沒有接上 Supabase，沒有讀取名單。": "Supabase isn't connected, so the list was not loaded.",
  "沒有接上 Supabase，訂單沒有送出。": "Supabase isn't connected, so the order was not sent.",
  "你要的那一件也許換了名字，或是路徑打錯了。": "That piece may have a new name, or the path is wrong.",
  "沒有接上 Supabase，訂單沒有核准。": "Supabase isn't connected, so the order was not approved.",
  "已改成一般會員。在社群分享商品後，下次免運。": "Now a member. After sharing a piece, the next order ships free.",
  "請填名稱、價格和存貨。價格和存貨都要是整數。": "Please fill in name, price, and stock. Price and stock must be whole numbers.",
  "請匯款到工作室的銀行帳戶。這個頁面不會扣款。": "Transfer the payment to the studio's bank account. This page does not charge you.",
  "請先匯款。管理者在後台核准後，這筆訂單才成立。": "Transfer first. The order is confirmed when an admin approves it.",
  "已註冊並登入。不用驗證信箱，也不用等管理者核准。": "Registered and signed in. No email confirmation, and no wait for admin approval.",
  "你是高級會員。買過三次，作品 9 折，而且免運。": "You are a premium member. Three purchases, 10% off, and free shipping.",
  "謝謝。在訂閱名單接上之前，這個地址只留在這台瀏覽器裡。": "Thank you. Until the mailing list is connected, this address stays only in this browser.",
  "Gmail 已打開。請按寄出，補貨後才會寄到這個地址。": "Gmail is open. Press send, and the note goes out when the piece is back.",
  "這件目前沒有存貨。留下 Gmail，補貨後會寄信通知。": "This piece is out of stock. Leave a Gmail address and you'll be emailed when it's back.",
  "只有管理者可以加穿搭照。上架後會出現在 Outfit。": "Only an admin can add outfit photos. Once published, they appear in Outfits.",
  "帳號已記下，但這個專案仍要求驗證信，所以現在還不能登入。": "The account was saved, but this project still requires a confirmation email, so you can't sign in yet.",
  "訂單已核准。已打開給顧客的 Gmail，請寄出訂單完成通知。": "The order is approved. Gmail is open to the customer. Please send the completion note.",
  "這是一間小工作室。需要人回答的時候，請到 Instagram 私訊。": "This is a small studio. When you need a person, send an Instagram message.",
  "改數量後按儲存。0 就是售完。貼紙要分顏色填。按編輯，作品會出現在下面的新商品，可以改完再儲存。下架後商店不再顯示。": "Change the quantity, then press Save. 0 means sold out. Fill stickers by color. Press Edit and the piece appears in the new-piece form below, ready to save. Once unlisted, it leaves the shop.",
  "直接改會員等級。一般顧客沒有優惠。一般會員是在社群分享商品後，下次免運。買過三次會變成高級，作品 9 折，而且免運。": "Change the tier here. Customers have no perk. Members get free shipping on the next order after sharing a piece. Three purchases become Premium: 10% off, and free shipping.",
  "這筆訂單在後台等管理者核准。沒有寄信給賣家。請先匯款到工作室帳戶，核准後才成立，並寄訂單完成通知到你的 Gmail。": "This order is waiting for an admin. Nothing was emailed to the studio. Transfer to the studio account first. It is confirmed after approval, and a completion note goes to your Gmail.",
  "未穿過的項鍊可在 7 天內退回，請放回原來的袋子。貼紙只有完全未使用才能退。寄回之前請先到 Instagram 私訊告訴我們。": "Unworn necklaces can come back within 7 days, in the original bag. Stickers can be returned only if they are completely unused. Send an Instagram message before you post them back.",
  "姓名、電話、Gmail 和 7-11 店名都要填。送出後訂單進到後台，不會寄信給賣家。管理者核准後，會寄訂單完成通知到這個 Gmail。": "Name, phone, Gmail, and the 7-Eleven store are all required. After you send it, the order goes to the studio. Nothing is emailed to the seller. After approval, a completion note goes to this Gmail.",
  "尚未接上 BiJulia 的 Supabase。需要環境變數 SUPABASE_URL 與 SUPABASE_ANON_KEY。這個畫面沒有讀取或寫入任何帳號。": "BiJulia's Supabase is not connected. It needs SUPABASE_URL and SUPABASE_ANON_KEY. This screen does not read or write any account.",
  "請填寫 Request an order。付款是匯款到工作室銀行帳戶。送出後訂單進到後台，管理者核准才成立，並寄訂單完成通知到你的 Gmail。這個頁面不會扣款，也不會寄信給賣家。": "Fill in Request an order. Payment is a transfer to the studio's bank account. After you send it, the order waits for an admin. It is confirmed on approval, and a completion note goes to your Gmail. This page does not charge you, and it does not email the seller.",
  "顧客註冊後就是顧客，不用驗證信箱，也不用核准帳號。管理者只核准訂單，也可以調整會員等級、修改存貨，以及上傳新商品。一般顧客沒有會員優惠。一般會員在社群分享商品後，下次免運。高級會員是買過三次的客人，作品 9 折，而且免運。": "A person who registers is a customer right away, with no email confirmation and no account approval. An admin only approves orders, and can also change member tiers, edit stock, and upload new pieces. Customers have no member perk. Members get free shipping on the next order after sharing a piece. Premium members have bought three times: 10% off, and free shipping.",
  "顧客註冊後就是顧客，不用驗證信箱，也不用核准帳號。管理者只核准訂單。待核准的訂單列在下面，核准後才成立，並打開 Gmail 把訂單完成通知寄給顧客。顧客名單裡可以直接改會員等級。下面也可以改存貨，或上傳一張照片加上新商品。不會寄信給賣家。": "A person who registers is a customer right away, with no email confirmation and no account approval. An admin only approves orders. Orders waiting are listed below. An order is confirmed after approval, and Gmail opens so the completion note can go to the customer. Member tiers can be changed in the customer list. Stock can be edited below, or a photo can be uploaded as a new piece. Nothing is emailed to the seller.",
  "已登入。註冊後就是顧客，不用驗證信箱，也不用等管理者核准。": "Signed in. After registering you are a customer, with no email confirmation and no wait for admin approval.",
  "沒有完成。請再試一次。": "That didn't finish. Please try again.",
  "電子郵件或密碼不對。": "The email or password is wrong.",
  "只有管理者可以核准。": "Only an admin can approve.",
  "只有管理者可以改存貨。": "Only an admin can change stock.",
  "只有管理者可以改商品。": "Only an admin can edit pieces.",
  "寄信太頻繁，請稍後再試。": "Too many emails. Please try again in a moment.",
  "只有管理者可以核准訂單。": "Only an admin can approve orders.",
  "只有管理者可以讀取訂單。": "Only an admin can read orders.",
  "只有管理者可以上傳商品。": "Only an admin can upload pieces.",
  "只有管理者可以上架穿搭。": "Only an admin can publish outfits.",
  "連不上 Supabase。": "Can't reach Supabase.",
  "只有管理者可以調整會員等級。": "Only an admin can change member tiers.",
  "請先到信箱完成驗證，再登入。": "Confirm the email first, then sign in.",
  "沒有接上 Supabase。": "Supabase isn't connected.",
  "這個帳號不能讀取其他人的資料。": "This account can't read other people's records.",
  "連不上 Supabase，沒有登入。": "Can't reach Supabase, so you are not signed in.",
  "沒有核准。這筆帳號可能已經不是待核准。": "Not approved. This account may no longer be waiting.",
  "沒有核准。這筆訂單可能已經不是待核准。": "Not approved. This order may no longer be waiting.",
  "連不上 Supabase，沒有讀取名單。": "Can't reach Supabase, so the list was not loaded.",
  "連不上 Supabase，沒有讀取訂單。": "Can't reach Supabase, so the orders were not loaded.",
  "連不上 Supabase，訂單沒有送出。": "Can't reach Supabase, so the order was not sent.",
  "連不上 Supabase，訂單沒有核准。": "Can't reach Supabase, so the order was not approved.",
  "連不上 Supabase，帳號沒有建立。": "Can't reach Supabase, so the account was not created.",
  "連不上 Supabase，角色沒有變更。": "Can't reach Supabase, so the role was not changed.",
  "連不上 Supabase，會員等級沒有改成。": "Can't reach Supabase, so the tier was not changed.",
  "這個電子郵件已經有密碼。請用原來的密碼登入。": "This email already has a password. Sign in with the original password.",
  "沒有接上 Supabase，會員等級沒有改成。": "Supabase isn't connected, so the tier was not changed.",
  "下架欄位還沒建立。請先在 Supabase 執行 profiles.sql。": "The unlist column doesn't exist yet. Run profiles.sql in Supabase first.",
  "穿搭資料表還沒建立。請先在 Supabase 執行 profiles.sql。": "The outfit table doesn't exist yet. Run profiles.sql in Supabase first.",
  "存貨資料表還沒建立。請先在 Supabase 執行 profiles.sql。": "The stock table doesn't exist yet. Run profiles.sql in Supabase first.",
  "會員等級還沒寫進資料庫。請先在 Supabase 執行 profiles.sql。": "Member tiers aren't in the database yet. Run profiles.sql in Supabase first.",
  "讀不到訂單或帳戶資料表。請先在 BiJulia 的 Supabase 執行資料表設定。": "The order or account table can't be read. Run the table setup in BiJulia's Supabase first.",
  "中國信託富錦分行（2134）": "CTBC Fujin Branch (2134)",
  "台北市中正區同安街73巷10號": "No. 10, Lane 73, Tong'an Street, Zhongzheng District, Taipei",
  "14:00–20:00，週二公休": "14:00–20:00, closed Tuesdays",
};

const productEn = {
  "lace-butterfly-choker": {
    length: "Choker",
    materials: "Pale blue lace, an openwork silver butterfly, green beads",
    description: "A pale blue lace choker with an openwork butterfly at the center and three green beads below.",
    details: "The lace sits at the base of the neck. The butterfly hangs in the center, with a short row of green beads under it.",
  },
  "button-lace-choker": {
    length: "Choker",
    materials: "Pale blue lace, metal rings, buttons, and shell discs",
    description: "Pale blue lace, with buttons and shell discs hanging from small rings.",
    details: "Each charm is tied to the edge of the lace and moves when you turn your head. The buttons and shells have slightly different weights. They are meant to rest against the neck that way.",
  },
  "ivory-lace-cross": {
    length: "Choker",
    materials: "Ivory lace, freshwater pearls, an openwork cross",
    description: "An ivory lace choker with a pearl drop and a small openwork cross.",
    details: "Pearls hang from the edge of the fan-shaped lace. The cross sits just below the lace, at the center of the collarbone.",
  },
  "lace-fan-choker": {
    length: "Choker",
    materials: "Ivory lace, pearls, a fan charm",
    description: "An ivory lace choker with a fan charm at the center and pearls hanging beside it.",
    details: "The lace sits against the neck. The fan falls at the center, and pearls and small shells hang from the edge.",
  },
  "lock-and-key-chain": {
    length: "Long chain",
    materials: "An openwork silver chain, a lock and key charm",
    description: "An openwork chain, worn with a lock and key.",
    details: "The links repeat an openwork pattern. The lock and key sit close together, with an even smaller charm under the key.",
  },
  "comb-and-chair-chain": {
    length: "Choker",
    materials: "A silver chain, a comb and chair charm",
    description: "A silver chain, worn with a comb and a chair.",
    details: "The chain sits against the neck. The charms are a small comb and a tiny chair.",
  },
  "button-chain-choker": {
    length: "Choker",
    materials: "Silver rings, shell buttons",
    description: "Shell buttons and black buttons linked by silver rings, worn close to the neck.",
    details: "Each button is held between two rings. Cream shell, a carved black button, and a small clasp are set along the chain.",
  },
  "button-drop-necklace": {
    length: "Long chain",
    materials: "A fine chain, small beads, buttons, and a shell charm",
    description: "Small beads scattered on a long chain, ending in a charm of buttons and shell.",
    details: "The chain is light and can be layered. The drop is a stack of buttons and small shells, with a few loose charms left underneath.",
  },
  "shell-sticker": {
    unit: "A set of three. Not sold separately.",
    materials: "Printed stickers",
    description: "BiJulia's shell, printed as a sticker. Black, mint, or blue. Three for NT$50.",
    details: "Each set is three stickers in the color you choose. They suit a phone, a laptop, or a bottle.",
  },
};

const collectionEn = {
  "rose-garden": "Charms and chains, gathered along a path of gray roses.",
  "lace-ribbons": "Lace chokers, a butterfly, and buttons, worn at the neck.",
  "vintage-treasures": "A lock, a key, a comb, a chair, and button drops — small old things worn close.",
  "pearl-collection": "Black, cream, and silver shell discs, strung into a choker.",
  "shell-stickers": "A set of three. Not sold separately.",
};

const originalProducts = Object.fromEntries(products.map((item) => [item.slug, item]));
const originalCollections = Object.fromEntries(collections.map((item) => [item.slug, item]));
const keepRaw = new Set(["高級", "一般會員", "一般顧客"]);

export function t(zh) {
  if (lang !== "en" || zh == null) return zh;
  return Object.prototype.hasOwnProperty.call(en, zh) ? en[zh] : zh;
}

export function tx(zh, english) {
  return lang === "en" ? english : zh;
}

export function setLang(next) {
  lang = next === "en" ? "en" : "zh";
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch (error) {
    /* the choice still applies on this page */
  }
  if (typeof document === "undefined") return;
  document.documentElement.lang = lang === "en" ? "en" : "zh-Hant";
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", lang === "en" ? enMeta : zhMeta);
}

export function productCopy(product) {
  if (!product || lang !== "en") return product;
  const extra = productEn[product.slug];
  if (!extra) return product;
  const base = originalProducts[product.slug];
  const next = { ...product };
  for (const key of ["length", "materials", "description", "details", "unit"]) {
    if (!extra[key]) continue;
    if (key === "description" && base && product.description !== base.description) continue;
    next[key] = extra[key];
  }
  return next;
}

export function collectionCopy(collection) {
  if (!collection || lang !== "en") return collection;
  const blurb = collectionEn[collection.slug];
  if (!blurb) return collection;
  const base = originalCollections[collection.slug];
  if (base && collection.blurb !== base.blurb) return collection;
  return { ...collection, blurb };
}

export function pieceCount(n) {
  if (lang !== "en") return `${n} 件`;
  return `${n} ${n === 1 ? "piece" : "pieces"}`;
}

export function bagLabel(n) {
  if (lang !== "en") return n ? `購物袋，${n} 件` : "購物袋";
  if (!n) return "Bag";
  return `Bag, ${n} ${n === 1 ? "piece" : "pieces"}`;
}

export function shippingRemain(amount) {
  return lang === "en" ? `Add ${amount} for free shipping` : `再加 ${amount} 即可免運`;
}

export function shippingStory(kind, free, fee) {
  if (lang !== "en") {
    if (kind === "care") {
      return `滿 ${free} 免運。未滿則運費 ${fee}。一般顧客沒有會員優惠。一般會員在社群分享商品後，下次免運。高級會員是買過三次的客人，作品 9 折，而且免運。項鍊裝在麻布袋裡，5–8 天內寄出。貼紙放進封套，多半 3 天內寄出。`;
    }
    return `滿 ${free} 免運。未滿則運費 ${fee}。一般顧客沒有會員優惠。一般會員在社群分享商品後，下次免運。高級會員是買過三次的客人，作品 9 折，而且免運。項鍊於 5–8 天內從工作室寄出。貼紙多半 3 天內寄出。`;
  }
  const shared = `Free shipping over ${free}. Under that, shipping is ${fee}. Customers have no member perk. Members get free shipping on the next order after sharing a piece. Premium members have bought three times: 10% off, and free shipping.`;
  if (kind === "care") return `${shared} Necklaces leave the studio in a linen bag within 5–8 days. Stickers go out in an envelope, usually within 3 days.`;
  return `${shared} Necklaces leave the studio within 5–8 days. Stickers usually go out within 3 days.`;
}

export function shouldKeepRaw(value) {
  return keepRaw.has(value);
}
