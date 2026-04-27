"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ITEM_DESCRIPTIONS } from "@/lib/item-descriptions";

import {
  STORAGE_KEYS,
  fetchMenuData,
  fetchMenuStatus,
  formatMoney,
  getDishImageUrl,
  getLocalizedText,
} from "@/lib/smart-menu";
import type { CartItem, MenuData, MenuLanguage, MenuStatusMap } from "@/types/menu";

function readLanguage(): MenuLanguage {
  if (typeof window === "undefined") return "en";
  return (window.localStorage.getItem(STORAGE_KEYS.lang) as MenuLanguage | null) ?? "en";
}

function readCurrency() {
  if (typeof window === "undefined") return "ETB";
  return window.localStorage.getItem(STORAGE_KEYS.currency) ?? "ETB";
}

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEYS.cart) ?? "[]") as CartItem[];
  } catch {
    return [];
  }
}

function saveCart(cart: CartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
}

export function AppViewClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const itemId = searchParams.get("id");
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [lang, setLang] = useState<MenuLanguage>("en");
  const [currency, setCurrency] = useState("ETB");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [liveStatus, setLiveStatus] = useState<MenuStatusMap>({});

  // ── Cart state ────────────────────────────────────────────────────────────
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    setCartItems(readCart());
  }, []);

  const cartCount = cartItems.reduce((acc, i) => acc + i.qty, 0);
  const cartTotal = cartItems.reduce((acc, i) => acc + i.price * i.qty, 0);

  useEffect(() => {
    fetchMenuData().then(setMenuData).catch(() => null);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLang(readLanguage());
      setCurrency(readCurrency());
      const storedTheme = window.localStorage.getItem(STORAGE_KEYS.theme) as "light" | "dark" | null;
      if (storedTheme) setTheme(storedTheme);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    fetchMenuStatus()
      .then((value) => { setLiveStatus(value); })
      .catch(() => { setLiveStatus({}); });
  }, []);

  const item = useMemo(
    () => menuData?.items.find((entry) => entry.id === itemId) ?? null,
    [itemId, menuData],
  );

  const allItems = menuData?.items ?? [];
  const currentIndex = item ? allItems.findIndex((i) => i.id === item.id) : -1;
  const prevItem = currentIndex > 0 ? allItems[currentIndex - 1] : null;
  const nextItem = currentIndex !== -1 && currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null;

  const status = item ? liveStatus[item.id] : undefined;

  const buildItemHref = (targetId: string, targetCategory: string) => {
    const nextParams = new URLSearchParams();
    nextParams.set("id", targetId);
    nextParams.set("cat", targetCategory);
    return `/appview?${nextParams.toString()}`;
  };

  const goToItem = (targetItem: { id: string; category: string }) => {
    router.replace(buildItemHref(targetItem.id, targetItem.category));
  };

  const addToCart = () => {
    if (!item) return;
    const resolvedFinalPrice = status?.price ?? item.price;

    const current = readCart();
    const index = current.findIndex((entry) => entry.id === item.id);

    if (index === -1) {
      current.push({
        id: item.id,
        title: getLocalizedText(item.title, lang),
        price: resolvedFinalPrice,
        qty: 1,
        category: item.category,
      });
    } else {
      current[index] = {
        ...current[index],
        qty: current[index].qty + 1,
      };
    }

    saveCart(current);
    setCartItems([...current]);
    setToast("✓ Added to cart!");
    setTimeout(() => setToast(""), 2000);
  };

  const removeFromCart = (index: number) => {
    const current = readCart();
    const updated = current.filter((_, i) => i !== index);
    saveCart(updated);
    setCartItems([...updated]);
  };

  // Description: Sanity field → local library → generic fallback
  let itemDescription = null;
  if (item) {
    const sanityDesc = item.description ? getLocalizedText(item.description, lang).trim() : "";
    if (sanityDesc) {
      itemDescription = sanityDesc;
    } else if (ITEM_DESCRIPTIONS[item.id]) {
      itemDescription = ITEM_DESCRIPTIONS[item.id];
    } else {
      itemDescription = "A carefully crafted item made with quality ingredients. Ask our staff for more details.";
    }
  }

  return (
    <main className="smart-detail-page">
      <div className="detail-app-bar">
        {/* Back arrow — goes home without scroll reset */}
        <Link href="/" className="back-btn-round" scroll={false}>
          <i className="fas fa-arrow-left" />
        </Link>
        <div className="detail-brand-name">
          {menuData?.settings.restaurant_name?.toUpperCase() ?? "SHARAF HOTEL"}
        </div>

        {/* Cart icon — opens mini cart panel in-place */}
        <button
          type="button"
          className="cart-btn-round"
          style={{ position: "relative", display: "inline-flex" }}
          onClick={() => { setCartItems(readCart()); setCartOpen(true); }}
          aria-label="Open cart"
        >
          <i className="fas fa-shopping-bag" />
          {cartCount > 0 && (
            <span style={{
              position: "absolute", top: "-6px", right: "-6px",
              background: "#facc15", color: "#000", borderRadius: "50%",
              width: "18px", height: "18px", fontSize: "11px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, lineHeight: 1,
            }}>{cartCount}</span>
          )}
        </button>
      </div>

      {/* ── Mini Cart Panel ────────────────────────────────────────────────── */}
      {cartOpen && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setCartOpen(false)}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
              zIndex: 200, backdropFilter: "blur(2px)",
            }}
          />

          {/* Panel */}
          <div style={{
            position: "fixed", bottom: 0, left: 0, right: 0,
            background: "var(--glass-bg)", borderRadius: "24px 24px 0 0",
            padding: "24px 20px 32px", zIndex: 201,
            boxShadow: "0 -8px 40px rgba(0,0,0,0.4)",
            border: "1px solid var(--glass-border)",
            maxHeight: "75vh", display: "flex", flexDirection: "column",
          }}>
            {/* Handle bar */}
            <div style={{
              width: "40px", height: "4px", borderRadius: "2px",
              background: "rgba(255,255,255,0.3)", margin: "0 auto 20px",
            }} />

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontFamily: "var(--font-playfair), serif", fontSize: "20px", color: "var(--text)" }}>
                <i className="fas fa-shopping-bag" style={{ marginRight: "10px", color: "#facc15" }} />
                Your Cart
              </h3>
              <button
                onClick={() => setCartOpen(false)}
                style={{ background: "none", border: "none", color: "var(--muted)", fontSize: "20px", cursor: "pointer" }}
              >
                <i className="fas fa-times" />
              </button>
            </div>

            {/* Items list */}
            <div style={{ overflowY: "auto", flex: 1, marginBottom: "16px" }}>
              {cartItems.length === 0 ? (
                <div style={{ color: "var(--muted)", textAlign: "center", padding: "32px 0", fontSize: "14px" }}>
                  Your cart is empty
                </div>
              ) : (
                cartItems.map((ci, idx) => (
                  <div key={`${ci.id}-${idx}`} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "12px 0",
                  }}>
                    <span style={{ flex: 1, color: "var(--text)", fontSize: "14px", fontWeight: 600 }}>
                      {ci.qty}× {ci.title}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ color: "#facc15", fontWeight: 700, fontSize: "14px" }}>
                        {formatMoney(ci.price * ci.qty, currency)}
                      </span>
                      <button
                        onClick={() => removeFromCart(idx)}
                        style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "4px 6px" }}
                        aria-label="Remove item"
                      >
                        <i className="fas fa-times" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total + note */}
            {cartItems.length > 0 && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "16px" }}>
                  <div>
                    <div style={{ color: "var(--muted)", fontSize: "13px" }}>Total</div>
                    <div style={{ color: "var(--muted)", fontSize: "10px" }}>(service &amp; tax excluded)</div>
                  </div>
                  <span style={{ color: "#facc15", fontSize: "20px", fontWeight: 800 }}>
                    {formatMoney(cartTotal, currency)}
                  </span>
                </div>

                {/* Go to home to place order */}
                <Link
                  href="/?openCart=1"
                  scroll={false}
                  style={{
                    display: "block", textAlign: "center", background: "#facc15",
                    color: "#000", fontWeight: 800, padding: "16px", borderRadius: "30px",
                    fontSize: "15px", letterSpacing: "1px", textDecoration: "none",
                  }}
                >
                  VIEW FULL CART & PLACE ORDER
                </Link>
              </>
            )}
          </div>
        </>
      )}

      {!item ? (
        <div className="empty-state">Loading item...</div>
      ) : (
        <div className="immersive-detail-content">
          <div className="detail-hero-section">
            {prevItem ? (
              <button
                onClick={() => goToItem(prevItem)}
                className="nav-arrow-btn"
                aria-label="Previous item"
              >
                <i className="fas fa-chevron-left" />
              </button>
            ) : <div className="nav-arrow-placeholder" />}

            <img
              src={getDishImageUrl(item)}
              alt={getLocalizedText(item.title, lang)}
              className="immersive-dish-image"
            />

            {nextItem ? (
              <button
                onClick={() => goToItem(nextItem)}
                className="nav-arrow-btn"
                aria-label="Next item"
              >
                <i className="fas fa-chevron-right" />
              </button>
            ) : <div className="nav-arrow-placeholder" />}
          </div>

          <div className="immersive-detail-body">
            <div className="immersive-title-row">
              <h1 className="immersive-title">{getLocalizedText(item.title, lang)}</h1>
              {item.type === "non-veg" ? (
                <i className="fas fa-drumstick-bite diet-icon-large" style={{ color: "#ef4444" }} />
              ) : (
                <i className="fas fa-leaf diet-icon-large" style={{ color: "#4ade80" }} />
              )}
            </div>

            <div className="immersive-price-row">
              <span className="immersive-price">
                {formatMoney(status?.price ?? item.price, currency)}
              </span>
              {item.calories ? (
                <span className="immersive-calories">{item.calories} Calories</span>
              ) : null}
            </div>

            <p className="immersive-description">
               {itemDescription}
            </p>

            <button type="button" className="immersive-add-btn" onClick={addToCart}>
              ADD TO ORDER
            </button>

            {toast && (
              <div style={{
                position: "fixed", bottom: "90px", left: "50%", transform: "translateX(-50%)",
                background: "#22c55e", color: "#fff", padding: "10px 22px",
                borderRadius: "24px", fontWeight: 600, fontSize: "0.95rem",
                zIndex: 9999, boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                display: "flex", alignItems: "center", gap: "8px",
                whiteSpace: "nowrap",
              }}>
                <i className="fas fa-check-circle" /> {toast}
              </div>
            )}

            <div className="tap-review-text">
               TAP TO REVIEW <i className="fas fa-chevron-up" />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
