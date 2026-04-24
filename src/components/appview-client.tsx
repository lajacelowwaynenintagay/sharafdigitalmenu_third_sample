"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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

export function AppViewClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const itemId = searchParams.get("id");
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [lang, setLang] = useState<MenuLanguage>("en");
  const [currency, setCurrency] = useState("ETB");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [liveStatus, setLiveStatus] = useState<MenuStatusMap>({});

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
      .then((value) => {
        setLiveStatus(value);
      })
      .catch(() => {
        setLiveStatus({});
      });
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

  // Use router.push (not replace) for prev/next so each navigation adds to the browser
  // history stack. This lets the Android hardware back button traverse items in reverse.
  // When the user reaches the first item and hits back, the browser naturally goes to home.
  const goToItem = (targetItem: { id: string; category: string }) => {
    router.replace(buildItemHref(targetItem.id, targetItem.category));
  };

  const addToCart = () => {
    if (!item) return;
    const resolvedBasePrice = status?.price ?? item.price;
    const resolvedFinalPrice =
      typeof status?.offer === "number" && status.offer > 0
        ? resolvedBasePrice - resolvedBasePrice * (status.offer / 100)
        : resolvedBasePrice;

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

    window.localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(current));
    router.replace("/", { scroll: false });
  };

  return (
    <main className="smart-detail-page">
      <div className="detail-app-bar">
        {/* The ← back arrow always goes directly to home without forcing scroll to top */}
        <Link href="/" className="back-btn-round" scroll={false}>
          <i className="fas fa-arrow-left" />
        </Link>
        <div className="detail-brand-name">
          {menuData?.settings.restaurant_name?.toUpperCase() ?? "SHARAF HOTEL"}
        </div>
        <button className="cart-btn-round" onClick={() => router.replace("/", { scroll: false })}>
          <i className="fas fa-shopping-bag" />
        </button>
      </div>

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
                {typeof status?.offer === "number" && status.offer > 0 ? (
                  <>
                     <span className="old-price">
                       {formatMoney(status?.price ?? item.price, currency)}
                     </span>
                     {formatMoney(
                       (status?.price ?? item.price) -
                         (status?.price ?? item.price) * (status.offer / 100),
                       currency,
                     )}
                  </>
                ) : (
                  formatMoney(status?.price ?? item.price, currency)
                )}
              </span>
              {item.calories ? (
                <span className="immersive-calories">{item.calories} Calories</span>
              ) : null}
            </div>

            {/* Description placeholder, normally loaded from item.description if added to menu-data.json */}
            <p className="immersive-description">
               {/* @ts-expect-error adding optional description */}
               {item.description ? getLocalizedText(item.description, lang) : "A delightful dish crafted with fresh ingredients perfectly portioned for your enjoyment. Ask your server for more details."}
            </p>

            <button type="button" className="immersive-add-btn" onClick={addToCart}>
              ADD TO ORDER
            </button>

            <div className="tap-review-text">
               TAP TO REVIEW <i className="fas fa-chevron-up" />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
