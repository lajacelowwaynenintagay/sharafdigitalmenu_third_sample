import { NextResponse } from "next/server";

const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "lno8raw1";
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

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
  try {
    const items = await fetchSanity<
      Array<{ id: string; stock?: string; offer?: number; badges?: string[] }>
    >(`*[_type == "menuItem"] { id, stock, offer, badges }`);

    const statusMap = Object.fromEntries(
      items.map((item) => [
        item.id,
        {
          stock: item.stock,
          offer: item.offer,
          badges: item.badges,
        },
      ]),
    );

    return NextResponse.json(statusMap, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Failed to load menu status from Sanity API route.", error);
    return NextResponse.json(
      { error: "Unable to load menu status from Sanity." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
