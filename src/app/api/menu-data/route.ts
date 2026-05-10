import { NextResponse } from "next/server";

import { ITEM_DESCRIPTIONS } from "@/lib/item-descriptions";

const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "lno8raw1";
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

function safeParseIngredients(value: unknown) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function fetchSanity<T>(query: string): Promise<T> {
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2022-03-07/data/query/${SANITY_DATASET}?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Sanity API error: ${res.status}`);
  }

  const json = await res.json();
  return json.result as T;
}

export async function GET() {
  const query = `{
    "settings": {
      "restaurant_name": "Sharaf Hotel",
      "currency": "ETB",
      "default_language": "en",
      "theme_auto": false
    },
    "categories": *[_type == "category"] | order(order asc) {
      id, icon,
      "name": { "en": name_en, "ar": name_ar, "fr": name_fr, "de": name_de }
    },
    "items": *[_type == "menuItem"] {
      id, category, subgroup, price, price_label, calories, type, is_4d,
      "title": { "en": title_en, "ar": title_ar, "fr": title_fr, "de": title_de },
      "description": { "en": description_en },
      ingredients, stock, offer, badges,
      "image": image.asset->url
    },
    "allSections": *[_type == "allSection"] | order(order asc) {
      label, matchField, matchValue, order
    }
  }`;

  try {
    const data = await fetchSanity<{
      settings: {
        restaurant_name: string;
        currency: string;
        default_language: string;
        theme_auto: boolean;
      };
      categories: Array<{
        id: string;
        icon: string;
        name: Record<string, string>;
      }>;
      items: Array<Record<string, unknown>>;
      allSections: Array<{
        label: string;
        matchField: string;
        matchValue: string;
        order: number;
      }>;
    }>(query);

    const normalized = {
      ...data,
      items: data.items.map((item) => {
        const itemId = String(item.id ?? "");
        const description =
          item.description && typeof item.description === "object"
            ? (item.description as Record<string, string | null | undefined>)
            : {};

        return {
          ...item,
          ingredients: safeParseIngredients(item.ingredients),
          description: {
            ...description,
            en: description.en || ITEM_DESCRIPTIONS[itemId] || "",
          },
        };
      }),
    };

    if (normalized.categories[0]?.id !== "all") {
      normalized.categories.unshift({
        id: "all",
        name: { en: "All", de: "Alle", fr: "Tout", ar: "الكل" },
        icon: "fa-list",
      });
    }

    return NextResponse.json(normalized, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Failed to load menu data from Sanity API route.", error);
    return NextResponse.json(
      { error: "Unable to load menu data from Sanity." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
