# SmartMenuPage Specification

## Overview
- Target file: `src/components/smart-menu-page.tsx`
- Target route: `src/app/page.tsx`
- Interaction model: click-driven and local-state driven with remote JSON content.

## DOM Structure
- Fixed top navigation
- Scroll container with hero, categories, sticky controls, and menu items
- Floating waiter button
- Overlay
- Waiter popup
- Cart bottom panel
- Toast

## Computed Style Notes
- Background: `#050505` dark / `#f8f8f8` light
- Card background: `#0a0a0a` dark / `#ffffff` light
- Accent gold: `#D4AF37`
- Typography: Inter + Playfair Display
- Primary radii: `12px`, `16px`, `18px`, `30px`
- Header blur: `backdrop-filter: blur(16px)`

## States & Behaviors
- Theme toggle swaps document `data-theme` and hero background video.
- Language toggle cycles four locales and flips `dir="rtl"` for Arabic.
- Currency toggle re-renders prices using client-side conversion.
- Search filters item cards live.
- Layout switch toggles list and gallery grid modes.
- Category cards update highlighted state and item subset.
- Cart and waiter actions open layered overlay-driven surfaces.

## Assets
- Logo: `https://tgo.4d-menu.com/assets/logo+text_right.png`
- Favicon: `https://tgo.4d-menu.com/assets/favicon.png`
- Hero videos: `https://tgo.4d-menu.com/data-box/the-golden-oak/title_bg.mp4`, `.../title_bg_light.mp4`
- Dish images: `https://tgo.4d-menu.com/data-box/the-golden-oak/<encoded-title>.png`

## Responsive Behavior
- Desktop: retains same single-column shell with wider breathing room.
- Tablet: control groups stack.
- Mobile: matches original phone-first composition; gallery collapses to one column under small widths.
