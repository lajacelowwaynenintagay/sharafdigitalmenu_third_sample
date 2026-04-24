const fs = require('fs');

// ─── 1. smart-menu-page.tsx: save scroll on item click & restore on home mount ───
let tsx = fs.readFileSync('src/components/smart-menu-page.tsx', 'utf8');

// Add onClick scroll save to the item card Link
tsx = tsx.replace(
  /className={cardClass}\r?\n\s+style=\{\{ animationDelay: `\$\{index \* 0\.05\}s` \}\}\s*\n\s*>/,
  `className={cardClass}
                style={{ animationDelay: \`\${index * 0.05}s\` }}
                onClick={() => {
                  if (typeof window !== "undefined") {
                    sessionStorage.setItem("home_scroll", String(window.scrollY));
                  }
                }}
              >`
);

// Add scroll restore useEffect near the top of SmartMenuPage (after the theme useEffect)
tsx = tsx.replace(
  /\/\/ ─── Restore scroll position when returning from item page ───\n[\s\S]*?\/\/ ─── end scroll restore ───\n/,
  ''  // Remove if already exists to avoid duplicates
);

// Find a good injection point - after the theme useEffect
tsx = tsx.replace(
  /useEffect\(\(\) => \{\s*document\.documentElement\.setAttribute\("data-theme", theme\);/,
  `// Restore home scroll position when returning from an item page
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = sessionStorage.getItem("home_scroll");
    if (saved) {
      sessionStorage.removeItem("home_scroll");
      requestAnimationFrame(() => {
        window.scrollTo({ top: parseInt(saved, 10), behavior: "instant" });
      });
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);`
);

fs.writeFileSync('src/components/smart-menu-page.tsx', tsx);
console.log('smart-menu-page.tsx updated');

// ─── 2. appview-client.tsx: make ALL navigation use replace so no item history builds up ───
let appview = fs.readFileSync('src/components/appview-client.tsx', 'utf8');

// Change goToItem to use replace instead of push
appview = appview.replace(
  /router\.push\(buildItemHref\(targetItem\.id, targetItem\.category\)\);/,
  'router.replace(buildItemHref(targetItem.id, targetItem.category));'
);

fs.writeFileSync('src/components/appview-client.tsx', appview);
console.log('appview-client.tsx updated');
