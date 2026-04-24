import { copyFile, mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const SLUG = "sharaf-hotel";
const targetRoot = path.join(ROOT, "public", "mirror", SLUG);
const targetImageDir = path.join(targetRoot, "images");
const targetAssetDir = path.join(targetRoot, "assets");
const targetVideoDir = path.join(targetRoot, "videos");

const sourceImageDir = path.join(ROOT, "public", "mirror", "the-golden-oak", "images");
const sourceVideoDir = path.join(ROOT, "public", "mirror", "the-golden-oak", "videos");
const tempPdfDir = path.join(ROOT, ".tmp_sharaf_pdf");

const locale = (text) => ({ en: text, de: text, fr: text, ar: text });
const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const nonVegKeywords = [
  "chicken",
  "beef",
  "goat",
  "mutton",
  "fish",
  "tuna",
  "hanid",
  "shawarma",
  "schnitzel",
  "burger",
  "steak",
  "samosa",
];

const categoryIcons = {
  breakfast: "fa-sun",
  "classic-dishes": "fa-utensils",
  mainers: "fa-bowl-food",
  "regional-classics": "fa-earth-africa",
  "quick-bites": "fa-burger",
  "desserts-delights": "fa-cake-candles",
  "hot-beverages": "fa-mug-hot",
  "iced-beverages": "fa-glass-water",
};

const categoryNames = {
  breakfast: "Breakfast",
  "classic-dishes": "Classic Dishes",
  mainers: "The Mainers",
  "regional-classics": "Regional Classics",
  "quick-bites": "Quick Bites",
  "desserts-delights": "Desserts Delights",
  "hot-beverages": "Hot Beverages",
  "iced-beverages": "Iced Beverages",
};

const rawItems = [
  // Breakfast
  ["breakfast", "Breakfast", "Boiled Egg", 199],
  ["breakfast", "Breakfast", "Fried Egg", 299],
  ["breakfast", "Breakfast", "Plain Omelet", 299],
  ["breakfast", "Breakfast", "Spanish Omelet", 399],
  ["breakfast", "Breakfast", "Scrambled Egg", 299],
  ["breakfast", "Breakfast", "Sharaf Special Omelet", 499],
  ["breakfast", "Breakfast", "French Toast", 299],
  ["breakfast", "Breakfast", "Fetira", 399],
  ["breakfast", "Breakfast", "Foul", 299],
  ["breakfast", "Breakfast", "Special Foul", 340],
  ["breakfast", "Breakfast", "Sharaf Breakfast", 799],

  // Classic Dishes
  ["classic-dishes", "House Specialties", "Full Hanid", 2199],
  ["classic-dishes", "House Specialties", "Half Hanid", 1199],
  ["classic-dishes", "House Specialties", "Special Goat Meat", 999],
  ["classic-dishes", "House Specialties", "Chicken Skewers", 899],
  ["classic-dishes", "House Specialties", "Grilled Chicken", 999],
  ["classic-dishes", "House Specialties", "Drum Sticks", 999],
  ["classic-dishes", "House Specialties", "Chicken Schnitzel", 999],
  ["classic-dishes", "House Specialties", "Roasted Full Chicken", 2199],
  ["classic-dishes", "House Specialties", "Half Roasted Chicken", 1199],
  ["classic-dishes", "House Specialties", "Beef Steak", 1499],
  ["classic-dishes", "House Specialties", "Maharagwe Nazi", 499, "veg"],
  ["classic-dishes", "Sea Foods Specials", "Grilled Fish", 999],
  ["classic-dishes", "Sea Foods Specials", "Fish Cutlet", 999],
  ["classic-dishes", "Sea Foods Specials", "Fish Goulash", 999],
  ["classic-dishes", "Sea Foods Specials", "Coconut and Ginger Fish", 999],
  ["classic-dishes", "Pastas & Penne", "Pasta in Curry", 599],
  ["classic-dishes", "Pastas & Penne", "Primavera", 349, "veg"],
  ["classic-dishes", "Pastas & Penne", "Penne/Pasta Arabiata", 300, "veg"],
  ["classic-dishes", "Pastas & Penne", "Pasta with Tuna", 400],
  ["classic-dishes", "Pastas & Penne", "Pasta/Penne/Rice with Minced Meat", 400],
  ["classic-dishes", "Indian Corner", "Chicken Biryani", 999],
  ["classic-dishes", "Indian Corner", "Fish Curry", 999],
  ["classic-dishes", "Indian Corner", "Honey Chicken", 999],
  ["classic-dishes", "Indian Corner", "Chicken Curry", 999],
  ["classic-dishes", "Indian Corner", "Mutton Curry", 999],
  ["classic-dishes", "Indian Corner", "Mutton Biryani", 999],
  ["classic-dishes", "Ethiopian Cuisine", "Shiro", 300, "veg"],
  ["classic-dishes", "Ethiopian Cuisine", "Cooked Vegetable", 300, "veg"],
  ["classic-dishes", "Ethiopian Cuisine", "Baya'aynet", 400, "veg"],
  ["classic-dishes", "Ethiopian Cuisine", "Tibs Fir Fir", 600],
  ["classic-dishes", "Ethiopian Cuisine", "Goat Tibs", 700],
  ["classic-dishes", "Ethiopian Cuisine", "Beef Tibs", 600],
  ["classic-dishes", "Ethiopian Cuisine", "Special Goman", 400, "veg"],

  // Mainers
  ["mainers", "Fresh Salads", "Ceaser Salad", 549],
  ["mainers", "Fresh Salads", "Green Salad", 299, "veg"],
  ["mainers", "Fresh Salads", "Chicken Tikka Salad", 549],
  ["mainers", "Fresh Salads", "Special Salad", 649],
  ["mainers", "Fresh Salads", "Tuna Salad", 440],
  ["mainers", "Fresh Salads", "Avocado Salad", 499, "veg"],
  ["mainers", "Warm Soups", "Vegetable Soup", 299, "veg"],
  ["mainers", "Warm Soups", "Goat Soup", 499],
  ["mainers", "Warm Soups", "Chicken Soup", 460],
  ["mainers", "Sandwiches", "BBQ Chicken Sandwich", 500],
  ["mainers", "Sandwiches", "Beef Sandwich", 600],
  ["mainers", "Sandwiches", "Chicken and Cheese Sandwich", 600],
  ["mainers", "Sandwiches", "Omlette Sandwich", 400, "veg"],
  ["mainers", "Sandwiches", "Vegetable Sandwich", 300, "veg"],
  ["mainers", "Sandwiches", "Sharaf Special / Club Sandwich", 500],

  // Regional Classics
  ["regional-classics", "Arab Corner", "Special Shawarma", 700],
  ["regional-classics", "Arab Corner", "Normal Shawarma", 650],
  ["regional-classics", "Arab Corner", "Extra Chapati", 100, "veg"],
  ["regional-classics", "Somali Classics", "Garow Somali", 350, "veg"],
  ["regional-classics", "Somali Classics", "Fara'ad Somali", 350, "veg"],
  ["regional-classics", "Somali Classics", "Digir Cas Somali", 300, "veg"],
  ["regional-classics", "Kids Menu", "Mini Pizza", 300, "veg"],
  ["regional-classics", "Kids Menu", "Pasta", 300, "veg"],
  ["regional-classics", "Kids Menu", "Penne", 150, "veg"],
  ["regional-classics", "Kids Menu", "Burger", 300],
  ["regional-classics", "Kids Menu", "Chicken Finger", 400],
  ["regional-classics", "Kids Menu", "Fish Finger", 400],
  ["regional-classics", "Bites and Starters", "Beef Samosa", 299],
  ["regional-classics", "Bites and Starters", "Lentil Samosa", 249, "veg"],
  ["regional-classics", "Bites and Starters", "Homemade Humus", 299, "veg"],
  ["regional-classics", "Bites and Starters", "French-Fries(Chips)", 299, "veg"],

  // Quick Bites
  ["quick-bites", "Burgers", "Cheese Burger", 550],
  ["quick-bites", "Burgers", "Beef Burger", 550],
  ["quick-bites", "Burgers", "Tuna Burger", 550],
  ["quick-bites", "Burgers", "Chicken Monalisa Burger", 550],
  ["quick-bites", "Burgers", "Sharaf Special Burger", 650],
  ["quick-bites", "Pizza Corner", "Vegetarian Pizza", 350, "veg", "350/500 ETB"],
  ["quick-bites", "Pizza Corner", "Sharaf Special Pizza", 400, "non-veg", "400/750 ETB"],
  ["quick-bites", "Pizza Corner", "Margareta Pizza", 350, "veg", "350/650 ETB"],
  ["quick-bites", "Pizza Corner", "Tuna Pizza", 400, "non-veg", "400/700 ETB"],
  ["quick-bites", "Pizza Corner", "Chicken Lover Pizza", 400, "non-veg", "400/700 ETB"],
  ["quick-bites", "Pizza Corner", "Meat Lover Pizza", 400, "non-veg", "400/700 ETB"],

  // Desserts
  ["desserts-delights", "Classic Cakes", "Vanila Cake", 150, "veg"],
  ["desserts-delights", "Classic Cakes", "Banana Cake", 200, "veg"],
  ["desserts-delights", "Classic Cakes", "Carrot Cake", 200, "veg"],
  ["desserts-delights", "Classic Cakes", "Date Cake", 200, "veg"],
  ["desserts-delights", "Rich & Decadent Cake", "Wet Cake / Milk Cake", 200, "veg"],
  ["desserts-delights", "Rich & Decadent Cake", "Black Forest", 200, "veg"],
  ["desserts-delights", "Rich & Decadent Cake", "White Forest", 200, "veg"],
  ["desserts-delights", "Rich & Decadent Cake", "Caramel Cake", 250, "veg"],
  ["desserts-delights", "Pastries & Rolls", "Cinnamon Rolls", 150, "veg"],
  ["desserts-delights", "Pastries & Rolls", "Croissant (Butter)", 200, "veg"],
  ["desserts-delights", "Fruity & Flavored Cakes", "Strawberry Cake", 250, "veg"],
  ["desserts-delights", "Fruity & Flavored Cakes", "Red Velvet Cake", 250, "veg"],
  ["desserts-delights", "Traditional & Signature Treats", "Sekerpare", 70, "veg"],
  ["desserts-delights", "Traditional & Signature Treats", "Kazandibi", 150, "veg"],
  ["desserts-delights", "Traditional & Signature Treats", "Aluminum Cake", 150, "veg"],

  // Hot beverages
  ["hot-beverages", "Classic Teas", "Black Tea", 100, "veg"],
  ["hot-beverages", "Classic Teas", "Lemon Tea", 100, "veg"],
  ["hot-beverages", "Classic Teas", "Tea with Almond (Laws)", 100, "veg"],
  ["hot-beverages", "Classic Teas", "Ginger (Kasher) Tea", 100, "veg"],
  ["hot-beverages", "Classic Teas", "Special Tea", 150, "veg"],
  ["hot-beverages", "Classic Teas", "Somali Tea", 150, "veg"],
  ["hot-beverages", "Classic Teas", "Strawberry Tea", 150, "veg"],
  ["hot-beverages", "Classic Teas", "Green Lipton Tea", 100, "veg"],
  ["hot-beverages", "Coffee Favorites", "Coffee", 100, "veg"],
  ["hot-beverages", "Coffee Favorites", "Tea with Coffee", 100, "veg"],
  ["hot-beverages", "Coffee Favorites", "Macchiato Sigle\\Double", 100, "veg", "100/150 ETB"],
  ["hot-beverages", "Coffee Favorites", "Cafe Late", 100, "veg"],
  ["hot-beverages", "Coffee Favorites", "Cappuccino", 120, "veg"],
  ["hot-beverages", "Coffee Favorites", "Mocha", 150, "veg"],
  ["hot-beverages", "Milk Based Options", "Coffee with Milk", 100, "veg"],
  ["hot-beverages", "Milk Based Options", "Hot Chocolate", 150, "veg"],
  ["hot-beverages", "Milk Based Options", "Tea with Camel Milk Single\\Double", 150, "veg", "150/100 ETB"],
  ["hot-beverages", "Milk Based Options", "Tea with Cow Milk Single\\Double", 150, "veg", "150/100 ETB"],
  ["hot-beverages", "Milk Based Options", "Cow Milk Single\\Double", 150, "veg"],
  ["hot-beverages", "Milk Based Options", "Camel Milk Single\\Double", 150, "veg", "150/100 ETB"],

  // Iced beverages
  ["iced-beverages", "Iced Delights", "Iced Americano", 260, "veg"],
  ["iced-beverages", "Iced Delights", "Special Iced Tea", 300, "veg"],
  ["iced-beverages", "Iced Delights", "Ginger Iced Tea", 150, "veg"],
  ["iced-beverages", "Iced Delights", "Black Iced Tea", 150, "veg"],
  ["iced-beverages", "Iced Delights", "Caramel Iced Coffee", 150, "veg"],
  ["iced-beverages", "Iced Delights", "Iced Mocha", 250, "veg"],
  ["iced-beverages", "Iced Delights", "Iced Cafe Late", 250, "veg"],
  ["iced-beverages", "Juice Corner", "Avocado Juice", 300, "veg"],
  ["iced-beverages", "Juice Corner", "Mango Juice", 350, "veg"],
  ["iced-beverages", "Juice Corner", "Pineapple Juice", 300, "veg"],
  ["iced-beverages", "Juice Corner", "Orange Juice", 400, "veg"],
  ["iced-beverages", "Juice Corner", "Papaya Juice", 300, "veg"],
  ["iced-beverages", "Juice Corner", "Watermelon Juice", 300, "veg"],
  ["iced-beverages", "Juice Corner", "Lemon Juice", 200, "veg"],
  ["iced-beverages", "Juice Corner", "Mixed or Cocktail Juice", 300, "veg"],
  ["iced-beverages", "Creamy Milkshakes", "Papaya Milkshake", 350, "veg"],
  ["iced-beverages", "Creamy Milkshakes", "Mango Milkshake", 400, "veg"],
  ["iced-beverages", "Creamy Milkshakes", "Avocado Milkshake", 350, "veg"],
  ["iced-beverages", "Creamy Milkshakes", "Banana Milkshake", 300, "veg"],
  ["iced-beverages", "Creamy Milkshakes", "Chocolate Milkshake", 400, "veg"],
  ["iced-beverages", "Creamy Milkshakes", "Caramel Milkshake", 400, "veg"],
  ["iced-beverages", "Creamy Milkshakes", "Vanila Milkshake", 400, "veg"],
  ["iced-beverages", "Creamy Milkshakes", "Special Sharaf Juice", 400, "veg"],
  ["iced-beverages", "Mojito", "Classic Mojito", 400, "veg"],
  ["iced-beverages", "Mojito", "Strawberry Mojito", 400, "veg"],
  ["iced-beverages", "Mojito", "Ginger Mojito", 400, "veg"],
  ["iced-beverages", "Mojito", "Lemon Mojito", 400, "veg"],
  ["iced-beverages", "Mojito", "Watermelon Mojito", 400, "veg"],
  ["iced-beverages", "Mojito", "Ananas Mojito", 400, "veg"],
  ["iced-beverages", "Mojito", "Cinnamon Mojito", 400, "veg"],
];

const ingredientColors = ["#d8bb83", "#1f5e50", "#4aa18a", "#b4a188", "#6a8e84"];
const makeIngredients = (name, subgroup) => {
  const words = name
    .replace(/[\\/()]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  const base = [
    words[0] ?? "Signature",
    words[1] ?? subgroup.split(" ")[0],
    subgroup.split(" ")[0] ?? "Chef",
  ];

  return base.map((label, index) => ({
    n: locale(label),
    c: ingredientColors[index % ingredientColors.length],
  }));
};

function detectType(name, explicit) {
  if (explicit) return explicit;
  const lower = name.toLowerCase();
  return nonVegKeywords.some((keyword) => lower.includes(keyword)) ? "non-veg" : "veg";
}

async function ensureDirs() {
  await Promise.all([
    mkdir(targetRoot, { recursive: true }),
    mkdir(targetImageDir, { recursive: true }),
    mkdir(targetAssetDir, { recursive: true }),
    mkdir(targetVideoDir, { recursive: true }),
  ]);
}

async function build() {
  await ensureDirs();

  const categories = Object.entries(categoryNames).map(([id, name]) => ({
    id,
    icon: categoryIcons[id],
    name: locale(name),
  }));

  const usedIds = new Map();
  const items = rawItems.map(([category, subgroup, title, price, explicitType, priceLabel], index) => {
    const baseId = slugify(title);
    const count = usedIds.get(baseId) ?? 0;
    usedIds.set(baseId, count + 1);
    const id = count === 0 ? baseId : `${baseId}_${count + 1}`;

    const numericPrice = Number(price);
    return {
      id,
      category,
      subgroup,
      price: numericPrice,
      price_label: priceLabel ?? `${numericPrice} ETB`,
      calories: `${160 + ((index % 11) * 35)}`,
      type: detectType(title, explicitType),
      is_4d: title.toLowerCase().includes("special"),
      title: locale(title),
      ingredients: makeIngredients(title, subgroup),
      formatted_price: `${numericPrice} ETB`,
      image: `/mirror/${SLUG}/images/${id}.png`,
    };
  });

  const menuData = {
    settings: {
      restaurant_name: "Sharaf Hotel",
      currency: "ETB",
      default_language: "en",
      theme_auto: false,
    },
    categories,
    items,
  };

  const status = {
    sharaf_special_omelet: { badges: ["NEW"], stock: "few" },
    sharaf_breakfast: { badges: ["SPECIAL"], offer: 10 },
    full_hanid: { badges: ["SPECIAL"], stock: "few" },
    roasted_full_chicken: { badges: ["SPECIAL"] },
    fish_goulash: { stock: "out" },
    sharaf_special_club_sandwich: { badges: ["SPICY1"] },
    sharaf_special_burger: { badges: ["SPECIAL"], offer: 15 },
    sharaf_special_pizza: { badges: ["SPECIAL"], offer: 10 },
    strawberry_cake: { badges: ["NEW"] },
    special_tea: { badges: ["HOT"] },
    special_sharaf_juice: { badges: ["COLD", "SPECIAL"] },
    classic_mojito: { badges: ["COLD"], stock: "few" },
  };

  const imagePool = (await readdir(sourceImageDir))
    .filter((file) => file.endsWith(".png"))
    .sort();

  await Promise.all(
    items.map(async (item, index) => {
      const sourceFile = imagePool[index % imagePool.length];
      await copyFile(
        path.join(sourceImageDir, sourceFile),
        path.join(targetImageDir, `${item.id}.png`),
      );
    }),
  );

  await Promise.all([
    copyFile(path.join(tempPdfDir, "logo_alpha_p1.png"), path.join(targetAssetDir, "logo+text_right.png")),
    copyFile(path.join(tempPdfDir, "logo_alpha_p2.png"), path.join(targetAssetDir, "logo-dark.png")),
    copyFile(path.join(tempPdfDir, "menu_p1.png"), path.join(targetAssetDir, "hero-cover.png")),
    copyFile(path.join(ROOT, "public", "mirror", "the-golden-oak", "assets", "favicon.png"), path.join(targetAssetDir, "favicon.png")),
    copyFile(path.join(sourceVideoDir, "title_bg.mp4"), path.join(targetVideoDir, "title_bg.mp4")),
    copyFile(path.join(sourceVideoDir, "title_bg_light.mp4"), path.join(targetVideoDir, "title_bg_light.mp4")),
  ]);

  await Promise.all([
    writeFile(path.join(targetRoot, "menu-data.json"), JSON.stringify(menuData, null, 2), "utf8"),
    writeFile(path.join(targetRoot, "menu-status.json"), JSON.stringify(status, null, 2), "utf8"),
    writeFile(
      path.join(targetRoot, "restaurant-meta.json"),
      JSON.stringify(
        {
          slug: SLUG,
          brand: "Sharaf Hotel",
          source: "local-pdf-mirror",
          generatedAt: new Date().toISOString(),
          itemCount: items.length,
        },
        null,
        2,
      ),
      "utf8",
    ),
  ]);

  console.log(`Sharaf mirror built with ${items.length} items.`);
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
