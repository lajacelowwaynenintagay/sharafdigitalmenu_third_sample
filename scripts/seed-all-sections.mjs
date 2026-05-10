/**
 * One-time seed script to create allSection documents in Sanity.
 * These control the section headings and their order in the "All" tab.
 *
 * Usage: node scripts/seed-all-sections.mjs
 *
 * After running, manage sections from Sanity Studio → "All Section".
 */

const PROJECT_ID = "lno8raw1";
const DATASET = "production";
const API_VERSION = "2022-03-07";

// Token: Sanity write token (set via env or paste here temporarily)
const TOKEN = process.env.SANITY_TOKEN;

if (!TOKEN) {
  console.error(
    "ERROR: Set the SANITY_TOKEN environment variable first.\n" +
    "  You can create a token at: https://www.sanity.io/manage/project/lno8raw1/api#tokens\n" +
    "  Then run:  set SANITY_TOKEN=sk-... && node scripts/seed-all-sections.mjs"
  );
  process.exit(1);
}

// ── Sections in the order matching the PDF menu ─────────────────────────
// matchField: "category" = match by item.category ID
// matchField: "subgroup" = match by item.subgroup name
const sections = [
  // Page 2 – Breakfast
  { label: "Breakfast",            matchField: "category", matchValue: "breakfast-delights",  order: 1  },

  // Page 3 – Classic Dishes: House Specialties + Sea Foods
  { label: "House Specialties",    matchField: "category", matchValue: "main-dishes",         order: 2  },
  { label: "Sea Foods Specials",   matchField: "category", matchValue: "sea-food-specials",   order: 3  },

  // Page 4 – Classic Dishes: Pastas, Indian, Ethiopian
  { label: "Pastas & Penne",       matchField: "category", matchValue: "Pastas-&-penne",      order: 4  },
  { label: "Indian Corner",        matchField: "category", matchValue: "Indian-corner",        order: 5  },
  { label: "Ethiopian Cuisine",    matchField: "category", matchValue: "ethiopian-cuisine",    order: 6  },

  // Page 5 – The Mainers: Salads, Soups, Sandwiches
  { label: "Fresh Salads",         matchField: "category", matchValue: "fresh-salads",         order: 7  },
  { label: "Warm Soups",           matchField: "category", matchValue: "warm-soups",            order: 8  },
  { label: "Sandwiches",           matchField: "category", matchValue: "sandwiches",            order: 9  },

  // Page 6 – Regional Classics: Arab, Somali, Kids, Bites
  { label: "Arab Corner",          matchField: "category", matchValue: "arab-corner",           order: 10 },
  { label: "Kids Menu",            matchField: "category", matchValue: "kids-menu",             order: 11 },
  { label: "Bites & Starters",     matchField: "category", matchValue: "bites-&-starters",     order: 12 },

  // Page 7 – Quick Bites: Burgers, Pizza
  { label: "Burgers",              matchField: "category", matchValue: "burgers",               order: 13 },
  { label: "Pizza Corner",         matchField: "category", matchValue: "pizza-corner",           order: 14 },

  // Page 8 – Desserts (subgroups)
  { label: "Classic Cakes",        matchField: "subgroup", matchValue: "Classic Cakes",          order: 15 },
  { label: "Rich & Decadent Cake", matchField: "subgroup", matchValue: "Rich & Decadent Cake",  order: 16 },
  { label: "Pastries & Rolls",     matchField: "subgroup", matchValue: "Pastries & Rolls",      order: 17 },
  { label: "Fruity & Flavored Cakes", matchField: "subgroup", matchValue: "Fruity & Flavored Cakes", order: 18 },
  { label: "Sharaf Special Treats",   matchField: "subgroup", matchValue: "Sharaf special treats",    order: 19 },

  // Page 9 – Hot Beverages (subgroups)
  { label: "Classic Teas",         matchField: "subgroup", matchValue: "Classic Teas",           order: 20 },
  { label: "Coffee Favorites",     matchField: "subgroup", matchValue: "Coffee Favorites",      order: 21 },
  { label: "Milk Based Options",   matchField: "subgroup", matchValue: "Milk Based Options",    order: 22 },

  // Page 10 – Iced Beverages (subgroups)
  { label: "Iced Delights",        matchField: "subgroup", matchValue: "Iced Delights",         order: 23 },
  { label: "Juice Corner",         matchField: "category", matchValue: "juice-corner",          order: 24 },
  { label: "Creamy Milkshakes",    matchField: "subgroup", matchValue: "Creamy Milkshakes",     order: 25 },
  { label: "Mojito",               matchField: "subgroup", matchValue: "Mojito",                order: 26 },
];

async function createDocument(section) {
  const doc = {
    _type: "allSection",
    label: section.label,
    matchField: section.matchField,
    matchValue: section.matchValue,
    order: section.order,
  };

  const mutations = [{ create: doc }];

  const res = await fetch(
    `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/mutate/${DATASET}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ mutations }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create "${section.label}": ${res.status} ${text}`);
  }

  return res.json();
}

async function main() {
  console.log(`Seeding ${sections.length} allSection documents into Sanity...\n`);

  for (const section of sections) {
    try {
      await createDocument(section);
      console.log(`  ✓ ${section.order}. ${section.label} (${section.matchField} → ${section.matchValue})`);
    } catch (err) {
      console.error(`  ✗ ${section.label}: ${err.message}`);
    }
  }

  console.log("\nDone! You can now manage these sections in Sanity Studio → All Section.");
}

main();
