import type {
  AllSection,
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

let cachedMenuData: MenuData | null = null;
let cachedMenuStatus: MenuStatusMap | null = null;

export async function fetchMenuData(): Promise<MenuData> {
  if (cachedMenuData) return cachedMenuData;

  try {
    const response = await fetch(`${LOCAL_MIRROR_BASE}/menu-data.json`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Menu data error: ${response.status}`);

    const data = (await response.json()) as MenuData;
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
    console.error("Failed to load menu data.", e);
    throw e;
  }
}

export async function fetchMenuStatus(): Promise<MenuStatusMap> {
  if (cachedMenuStatus) return cachedMenuStatus;

  try {
    const response = await fetch(`${LOCAL_MIRROR_BASE}/menu-status.json`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Menu status error: ${response.status}`);

    const statusMap = (await response.json()) as MenuStatusMap;
    cachedMenuStatus = statusMap;
    return statusMap;
  } catch (e) {
    console.error("Failed to load menu status.", e);
    throw e;
  }
}

export function getLocalizedText<T extends Partial<Record<MenuLanguage, string | null>>>(
  value: T | undefined | null,
  lang: MenuLanguage,
): string {
  if (!value) return "";
  return value[lang] ?? value.en ?? "";
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
  categories: MenuCategory[];
  allSections?: AllSection[];
  categoryId: string | null;
  searchText: string;
  filter: "all" | "veg" | "non-veg" | "drinks" | "fast-food";
  lang: MenuLanguage;
}): MenuItem[] {
  const { items, categories, allSections, categoryId, searchText, filter, lang } = params;
  const normalizedSearch = searchText.trim().toLowerCase();

  const DRINKS_CATEGORIES = ["hot-beverages", "iced-beverages"];
  const FASTFOOD_CATEGORIES = ["quick-bites"];
  const DRINKS_KEYWORDS = [
    "beverage",
    "drink",
    "coffee",
    "tea",
    "juice",
    "soda",
    "smoothie",
    "water",
    "latte",
    "cappuccino",
    "espresso",
    "iced",
  ];
  const FASTFOOD_KEYWORDS = [
    "quick",
    "burger",
    "fast",
    "snack",
    "fries",
    "wrap",
    "sandwich",
    "pizza",
    "bite",
    "nugget",
  ];

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
    const inCategory = normalizedSearch ? true : categoryId && !isAll ? item.category === categoryId : true;

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

  const isAllView = categoryId === "all" && !normalizedSearch;
  if (isAllView && allSections && allSections.length > 0) {
    // ── Sanity-driven "All" view ordering ──────────────────────────────
    // Each allSection document defines a heading + how to match items.
    // Build a lookup: for each item, find its section order.

    // Map: matchKey → { order, label }
    const sectionByCategory = new Map<string, { order: number; label: string }>();
    const sectionBySubgroup = new Map<string, { order: number; label: string }>();

    for (const sec of allSections) {
      const entry = { order: sec.order, label: sec.label };
      if (sec.matchField === "category") {
        sectionByCategory.set(sec.matchValue, entry);
      } else {
        sectionBySubgroup.set(sec.matchValue, entry);
      }
    }

    const getSection = (item: MenuItem): { order: number; label: string } => {
      // First try matching by subgroup (more specific)
      if (item.subgroup) {
        const bySub = sectionBySubgroup.get(item.subgroup);
        if (bySub) return bySub;
      }
      // Then try matching by category
      const byCat = sectionByCategory.get(item.category);
      if (byCat) return byCat;
      // Fallback: use category name from categories array
      const cat = categories.find((c) => c.id === item.category);
      const fallbackLabel = cat ? getLocalizedText(cat.name, "en") : item.category;
      return { order: 9999, label: fallbackLabel };
    };

    // Track original positions for stable sort within the same section
    const originalIndex = new Map<MenuItem, number>();
    filtered.forEach((item, idx) => originalIndex.set(item, idx));

    // Assign the section label as the item's subgroup so headings render
    for (const item of filtered) {
      const sec = getSection(item);
      (item as any).__allSectionOrder = sec.order;
      (item as any).subgroup = sec.label;
    }

    filtered.sort((a, b) => {
      const orderA = (a as any).__allSectionOrder ?? 9999;
      const orderB = (b as any).__allSectionOrder ?? 9999;
      if (orderA !== orderB) return orderA - orderB;
      return (originalIndex.get(a) ?? 0) - (originalIndex.get(b) ?? 0);
    });
  } else if (isAllView) {
    // Fallback when no allSections exist: sort by category tab order
    const categoryOrder = new Map<string, number>();
    categories.forEach((cat, idx) => {
      if (cat.id !== "all") categoryOrder.set(cat.id, idx);
    });

    // Assign category name as subgroup for headings
    for (const item of filtered) {
      if (!item.subgroup) {
        const cat = categories.find((c) => c.id === item.category);
        if (cat) {
          (item as any).subgroup = getLocalizedText(cat.name, "en");
        }
      }
    }

    const originalIndex = new Map<MenuItem, number>();
    filtered.forEach((item, idx) => originalIndex.set(item, idx));

    filtered.sort((a, b) => {
      const catA = categoryOrder.get(a.category) ?? 999;
      const catB = categoryOrder.get(b.category) ?? 999;
      if (catA !== catB) return catA - catB;
      return (originalIndex.get(a) ?? 0) - (originalIndex.get(b) ?? 0);
    });
  }

  return filtered;
}
