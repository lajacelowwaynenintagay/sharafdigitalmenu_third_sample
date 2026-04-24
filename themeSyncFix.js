const fs = require('fs');

// 1. Fix smart-menu-page.tsx so it ACTUALLY respects the user's stored theme
let tsx = fs.readFileSync('src/components/smart-menu-page.tsx', 'utf8');

tsx = tsx.replace(
  /\/\/ Always default to light mode on refresh\r?\n\s*setTheme\("light"\);/,
  `// Respect stored theme or default to light mode
      if (storedTheme === "dark" || storedTheme === "light") setTheme(storedTheme);
      else setTheme("light");`
);

fs.writeFileSync('src/components/smart-menu-page.tsx', tsx);
console.log('smart-menu-page.tsx theme logic fixed');

// 2. Add theme tracking to appview-client.tsx so the item details page knows how to load/set the theme
let appview = fs.readFileSync('src/components/appview-client.tsx', 'utf8');

// Insert the theme state into the top of AppViewClient
appview = appview.replace(
  /const \[lang, setLang\] = useState<MenuLanguage>\("en"\);/,
  `const [theme, setTheme] = useState<"light" | "dark">("light");\n  const [lang, setLang] = useState<MenuLanguage>("en");`
);

// Add the logic to read theme from local storage when initializing
appview = appview.replace(
  /setLang\(readLanguage\(\)\);\r?\n\s*setCurrency\(readCurrency\(\)\);/,
  `setLang(readLanguage());
      setCurrency(readCurrency());
      const storedTheme = window.localStorage.getItem(STORAGE_KEYS.theme) as "light" | "dark" | null;
      if (storedTheme === "dark" || storedTheme === "light") setTheme(storedTheme);`
);

// Add the useEffect to apply it to the HTML root
appview = appview.replace(
  /const item = useMemo\(/,
  `useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const item = useMemo(`
);

fs.writeFileSync('src/components/appview-client.tsx', appview);
console.log('appview-client.tsx theme tracking added');
