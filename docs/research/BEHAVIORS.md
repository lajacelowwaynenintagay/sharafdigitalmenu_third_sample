# 4D Smart Menu Behaviors

- URL inspected: `https://tgo.4d-menu.com/smartmenu.html`
- Primary interaction model: touch-first mobile menu shell with local UI state and remote menu content.
- Theme behavior: dark/light toggle persisted in `localStorage` under `4d_theme`; hero background video swaps between dark and light assets.
- Language behavior: cycle `en -> de -> fr -> ar`; text and document direction update immediately.
- Currency behavior: cycle `$ -> ₹ -> € -> C$`; prices re-render client-side.
- Category behavior: horizontal snap-scroller; active category card receives gold gradient styling.
- Search behavior: typing searches across menu item titles and suppresses active category emphasis.
- Filter behavior: `all`, `veg`, `non-veg` chips filter visible items.
- Layout behavior: list/gallery switch persisted in `localStorage`.
- Cart behavior: local cart badge, bottom sheet, table-number prompt, local success toast.
- Waiter behavior: centered modal with local success toast.
- Sticky header behavior: translucent glass header becomes more transparent once the main scroll container moves.
