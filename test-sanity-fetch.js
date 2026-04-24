const SANITY_PROJECT_ID = 'lno8raw1';
const SANITY_DATASET = 'production';

async function fetchSanity(query) {
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2022-03-07/data/query/${SANITY_DATASET}?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Sanity API error: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return json.result;
}

async function test() {
  const query = `{
    "settings": *[_type == "settings"][0] {
      restaurant_name,
      restaurant_logo
    },
    "categories": *[_type == "category"] | order(order asc) {
      id, icon, name_en, name_ar, name_fr, name_de, order
    },
    "items": *[_type == "menuItem"] {
      id, category, subgroup, price, calories, type, is_4d,
      title_en, title_ar, title_fr, title_de,
      "image": image.asset->url,
      description_en, ingredients, stock, offer, badges
    }
  }`;

  try {
    const data = await fetchSanity(query);
    console.log("Categories count:", data.categories ? data.categories.length : 0);
    console.log("Items count:", data.items ? data.items.length : 0);
    if (!data || !data.categories || data.categories.length === 0) {
      console.log("TRIGGERING FALLBACK: No data returned from Sanity");
    } else {
      console.log("Sanity fetch SUCCESS");
    }
  } catch (e) {
    console.error("TRIGGERING FALLBACK: Error fetching Sanity", e);
  }
}

test();
