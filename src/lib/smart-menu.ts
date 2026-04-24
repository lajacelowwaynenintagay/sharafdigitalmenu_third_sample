import type {
  MenuCategory,
  MenuData,
  MenuItem,
  MenuLanguage,
  MenuStatusMap,
} from "@/types/menu";

export const RESTAURANT_SLUG = "sharaf-hotel";
export const BRAND_NAME = "Sharaf Hotel";
export const LOCAL_MIRROR_BASE = `/mirror/${RESTAURANT_SLUG}`;

export const STORAGE_KEYS = {
  theme: "4d_theme",
  lang: "4d_lang",
  currency: "4d_currency",
  layout: "4d_layout",
  cart: "4d_cart",
} as const;

export const LANG_ORDER: MenuLanguage[] = ["en"];
export const CURRENCY_LIST = ["ETB", "$"];
export const CURRENCY_RATES: Record<string, number> = {
  ETB: 1,
  $: 1 / 156,
  "\u20B9": 83.5,
  "\u20AC": 0.92,
  "C$": 1.36,
};

export const UI_COPY: Record<
  MenuLanguage,
  {
    cats: string;
    swipe: string;
    search: string;
    kitchen: string;
    filterAll: string;
    filterVeg: string;
    filterNonVeg: string;
    waiterTitle: string;
    waiterDesc: string;
    waiterInput: string;
    waiterButton: string;
    waiterToast: string;
    cartTitle: string;
    cartEmpty: string;
    cartTotal: string;
    cartTax: string;
    cartButton: string;
    orderToast: string;
    morning: string;
    afternoon: string;
    evening: string;
    noItems: string;
    tablePrompt: string;
  }
> = {
  en: {
    cats: "CATEGORIES",
    swipe: "Swipe List",
    search: "Search dishes...",
    kitchen: "Prepared fresh on order",
    filterAll: "All",
    filterVeg: "Veg",
    filterNonVeg: "Non",
    waiterTitle: "Call a Waiter?",
    waiterDesc: "Please enter your table number",
    waiterInput: "Table No.",
    waiterButton: "Send Request",
    waiterToast: "Waiter Called!",
    cartTitle: "Your Cart",
    cartEmpty: "Cart is empty",
    cartTotal: "Total",
    cartTax: "(service & tax excluded)",
    cartButton: "PLACE ORDER",
    orderToast: "Order Placed!",
    morning: "Good Morning",
    afternoon: "Good Afternoon",
    evening: "Good Evening",
    noItems: "No items found.",
    tablePrompt: "Enter Table Number",
  },
  de: {
    cats: "KATEGORIEN",
    swipe: "Liste wischen",
    search: "Gerichte suchen...",
    kitchen: "Kuche schliesst bald",
    filterAll: "Alle",
    filterVeg: "Veg",
    filterNonVeg: "Non",
    waiterTitle: "Kellner rufen?",
    waiterDesc: "Bitte Tisch Nummer eingeben",
    waiterInput: "Tisch Nr.",
    waiterButton: "Senden",
    waiterToast: "Kellner gerufen!",
    cartTitle: "Ihr Warenkorb",
    cartEmpty: "Warenkorb leer",
    cartTotal: "Gesamt",
    cartTax: "(ohne Steuern & Gebuhren)",
    cartButton: "BESTELLEN",
    orderToast: "Bestellung gesendet!",
    morning: "Guten Morgen",
    afternoon: "Guten Tag",
    evening: "Guten Abend",
    noItems: "Keine Gerichte gefunden.",
    tablePrompt: "Tischnummer eingeben",
  },
  fr: {
    cats: "CATEGORIES",
    swipe: "Balayer liste",
    search: "Rechercher...",
    kitchen: "Cuisine ferme bientot",
    filterAll: "Tout",
    filterVeg: "Vege",
    filterNonVeg: "Non",
    waiterTitle: "Appeler serveur?",
    waiterDesc: "Entrez votre numero de table",
    waiterInput: "Numero de table",
    waiterButton: "Envoyer",
    waiterToast: "Serveur appele!",
    cartTitle: "Votre Panier",
    cartEmpty: "Panier vide",
    cartTotal: "Total",
    cartTax: "(hors taxes et frais)",
    cartButton: "COMMANDER",
    orderToast: "Commande envoyee!",
    morning: "Bonjour",
    afternoon: "Bon apres-midi",
    evening: "Bonsoir",
    noItems: "Aucun plat trouve.",
    tablePrompt: "Entrez votre numero de table",
  },
  ar: {
    cats: "الفئات",
    swipe: "اسحب القائمة",
    search: "بحث عن طبق...",
    kitchen: "المطبخ يغلق قريبا",
    filterAll: "الكل",
    filterVeg: "نباتي",
    filterNonVeg: "غير",
    waiterTitle: "طلب نادل؟",
    waiterDesc: "الرجاء ادخال رقم الطاولة",
    waiterInput: "رقم الطاولة",
    waiterButton: "ارسال الطلب",
    waiterToast: "تم طلب النادل!",
    cartTitle: "سلة التسوق",
    cartEmpty: "السلة فارغة",
    cartTotal: "المجموع",
    cartTax: "(غير شامل الضرائب والرسوم)",
    cartButton: "اطلب الان",
    orderToast: "تم الطلب!",
    morning: "صباح الخير",
    afternoon: "مساء الخير",
    evening: "مساء الخير",
    noItems: "لا توجد عناصر.",
    tablePrompt: "رقم الطاولة",
  },
};

const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'lno8raw1';
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

let cachedMenuData: MenuData | null = null;
let cachedMenuStatus: MenuStatusMap | null = null;

async function fetchSanity<T>(query: string): Promise<T> {
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2022-03-07/data/query/${SANITY_DATASET}?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Sanity API error: ${res.status}`);
  const json = await res.json();
  return json.result as T;
}

export async function fetchMenuData(): Promise<MenuData> {
  if (cachedMenuData) return cachedMenuData;

  const query = `{
    "settings": {
      "restaurant_name": "Sharaf Hotel",
      "currency": "ETB",
      "default_language": "en",
      "theme_auto": false
    },
    "categories": *[_type == "category" && id in ["desserts-delights", "hot-beverages", "iced-beverages"]] | order(order asc) {
      id, icon, 
      "name": { "en": name_en, "ar": name_ar, "fr": name_fr, "de": name_de }
    },
    "items": *[_type == "menuItem" && category in ["desserts-delights", "hot-beverages", "iced-beverages"]] {
      id, category, subgroup, price, price_label, calories, type, is_4d,
      "title": { "en": title_en, "ar": title_ar, "fr": title_fr, "de": title_de },
      "description": { "en": description_en },
      ingredients, stock, offer, badges,
      "image": image.asset->url
    }
  }`;

  try {
    const data = await fetchSanity<MenuData>(query);
    
    // Parse ingredients from JSON string back to array if needed
    data.items = data.items.map(item => ({
      ...item,
      ingredients: typeof item.ingredients === 'string' ? JSON.parse(item.ingredients) : item.ingredients
    }));

    if (data.categories[0]?.id !== "all") {
      data.categories.unshift({
        id: "all",
        name: { en: "All", de: "Alle", fr: "Tout", ar: "الكل" },
        icon: "fa-list",
      });
    }
    
    cachedMenuData = data;
    return data;
  } catch (e) {
    console.error('Failed to load from Sanity, falling back to local JSON.', e);
    // Fallback to local JSON if Sanity fails
    const localResponse = await fetch(`${LOCAL_MIRROR_BASE}/menu-data.json`, { cache: "no-store" });
    const data = (await localResponse.json()) as MenuData;
    if (data.categories[0]?.id !== "all") {
      data.categories.unshift({
        id: "all",
        name: { en: "All", de: "Alle", fr: "Tout", ar: "الكل" },
        icon: "fa-list",
      });
    }
    return data;
  }
}

export async function fetchMenuStatus(): Promise<MenuStatusMap> {
  if (cachedMenuStatus) return cachedMenuStatus;

  // Sanity now holds the status directly on the menu items!
  const query = `*[_type == "menuItem"] { id, stock, offer, badges }`;
  try {
    const items = await fetchSanity<any[]>(query);
    const statusMap: MenuStatusMap = {};
    for (const item of items) {
      statusMap[item.id] = {
        stock: item.stock,
        offer: item.offer,
        badges: item.badges
      };
    }
    cachedMenuStatus = statusMap;
    return statusMap;
  } catch (e) {
    const res = await fetch(`${LOCAL_MIRROR_BASE}/menu-status.json`, { cache: "no-store" });
    return res.json();
  }
}

export function getLocalizedText<T extends Partial<Record<MenuLanguage, string>> & { en: string }>(
  value: T,
  lang: MenuLanguage,
): string {
  return value[lang] ?? value.en;
}

export function getDishImageUrl(item: MenuItem): string {
  if (item.image) {
    return item.image;
  }
  return `${LOCAL_MIRROR_BASE}/images/${item.id}.webp?v=3`;
}

export function getHeroVideoUrl(theme: "dark" | "light"): string {
  const filename = theme === "dark" ? "title_bg.mp4" : "title_bg_light.mp4";
  return `${LOCAL_MIRROR_BASE}/videos/${filename}`;
}

export function getHeroImageUrl() {
  return `${LOCAL_MIRROR_BASE}/assets/hero-cover.png`;
}

export function getLogoUrl() {
  return `${LOCAL_MIRROR_BASE}/assets/logo+text_right.png`;
}

export function getFaviconUrl() {
  return `${LOCAL_MIRROR_BASE}/assets/favicon.png`;
}

export function getDisplayGreeting(lang: MenuLanguage): string {
  const hour = new Date().getHours();
  const copy = UI_COPY[lang];
  if (hour < 12) return copy.morning;
  if (hour < 17) return copy.afternoon;
  return copy.evening;
}

export function formatMoney(price: number, currency: string): string {
  const rate = CURRENCY_RATES[currency] ?? 1;
  const converted =
    currency === "\u20B9" || currency === "ETB" ? Math.round(price * rate) : price * rate;
  if (currency === "ETB") {
    return `${converted} ETB`;
  }
  const formatted = currency === "\u20B9" ? `${converted}` : converted.toFixed(2);
  return currency === "\u20AC" ? `${formatted}${currency}` : `${currency}${formatted}`;
}

export function getCategoryTitle(
  categories: MenuCategory[],
  categoryId: string | null,
  lang: MenuLanguage,
): string {
  if (!categoryId) return "...";
  const category = categories.find((entry) => entry.id === categoryId);
  return category ? getLocalizedText(category.name, lang) : "...";
}

export function filterMenuItems(params: {
  items: MenuItem[];
  categoryId: string | null;
  searchText: string;
  filter: "all" | "veg" | "non-veg" | "drinks" | "fast-food";
  lang: MenuLanguage;
}): MenuItem[] {
  const { items, categoryId, searchText, filter, lang } = params;
  const normalizedSearch = searchText.trim().toLowerCase();

  const DRINKS_CATEGORIES = ["hot-beverages", "iced-beverages"];
  const FASTFOOD_CATEGORIES = ["quick-bites"];
  const DRINKS_KEYWORDS = ["beverage", "drink", "coffee", "tea", "juice", "soda", "smoothie", "water", "latte", "cappuccino", "espresso", "iced"];
  const FASTFOOD_KEYWORDS = ["quick", "burger", "fast", "snack", "fries", "wrap", "sandwich", "pizza", "bite", "nugget"];

  const isDrinksItem = (item: MenuItem) => {
    if (DRINKS_CATEGORIES.includes(item.category)) return true;
    const catLower = item.category.toLowerCase();
    const titleLower = getLocalizedText(item.title, lang).toLowerCase();
    return DRINKS_KEYWORDS.some((kw) => catLower.includes(kw) || titleLower.includes(kw));
  };

  const isFastFoodItem = (item: MenuItem) => {
    if (FASTFOOD_CATEGORIES.includes(item.category)) return true;
    const catLower = item.category.toLowerCase();
    const titleLower = getLocalizedText(item.title, lang).toLowerCase();
    return FASTFOOD_KEYWORDS.some((kw) => catLower.includes(kw) || titleLower.includes(kw));
  };

  const filtered = items.filter((item) => {
    const isAll = categoryId === "all";
    const inCategory = normalizedSearch ? true : (categoryId && !isAll) ? item.category === categoryId : true;
    let filterMatch = true;
    if (filter === "veg") filterMatch = item.type === "veg";
    else if (filter === "non-veg") filterMatch = item.type === "non-veg";
    else if (filter === "drinks") filterMatch = isDrinksItem(item);
    else if (filter === "fast-food") filterMatch = isFastFoodItem(item);
    const titleMatch = normalizedSearch
      ? getLocalizedText(item.title, lang).toLowerCase().includes(normalizedSearch) ||
        item.title.en.toLowerCase().includes(normalizedSearch)
      : true;
    return inCategory && filterMatch && titleMatch;
  });

  // When viewing "All" category (not searching), reorder by priority subgroups
  const isAllView = categoryId === "all" && !normalizedSearch;
  if (isAllView) {
    const PRIORITY_SUBGROUPS = [
      "Breakfast",
      "House Specialties",
      "Sea Foods Specials",
      "Pastas & Penne",
      "Indian Corner",
      "Ethiopian Cuisine",
      "Fresh Salads",
      "Warm Soups",
      "Sandwiches",
      "Arab Corner",
      "Somali Classics",
      "Kids Menu",
      "Bites and Starters",
      "Burgers",
      "Pizza Corner",
      "Classic Cakes",
      "Rich & Decadent Cake",
      "Pastries & Rolls",
      "Fruity & Flavored Cakes",
      "Traditional & Signature Treats",
      "Classic Teas",
      "Coffee Favorites",
      "Milk Based Options",
      "Iced Delights",
      "Juice Corner",
      "Creamy Milkshakes",
      "Mojito"
    ];

    const getSubgroupPriority = (item: MenuItem): number => {
      const sg = item.subgroup ?? "";
      const idx = PRIORITY_SUBGROUPS.indexOf(sg);
      return idx !== -1 ? idx : PRIORITY_SUBGROUPS.length;
    };

    filtered.sort((a, b) => {
      const pa = getSubgroupPriority(a);
      const pb = getSubgroupPriority(b);
      if (pa !== pb) return pa - pb;
      // Within the same priority group, keep original order
      return 0;
    });
  }

  return filtered;
}
