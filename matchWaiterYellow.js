const fs = require('fs');

let css = fs.readFileSync('src/app/globals.css', 'utf8');

// The exact yellow from the waiter/call button is #facc15
// Update hotel title, price, and add-to-order button colors

// 1. detail-brand-name (SHARAF HOTEL title) → #facc15
css = css.replace(
  /\.detail-brand-name\s*\{[\s\S]*?color:\s*#[a-fA-F0-9]+;/,
  (match) => match.replace(/color:\s*#[a-fA-F0-9]+;/, 'color: #facc15;')
);
// Remove text-shadow if present (not needed on the green/teal header bg)
css = css.replace(
  /\.detail-brand-name\s*\{[\s\S]*?text-shadow:[^;]+;/,
  (match) => match.replace(/text-shadow:[^;]+;/, '')
);

// 2. immersive-price → #facc15
css = css.replace(
  /\.immersive-price\s*\{\s*color:\s*#[a-fA-F0-9]+;[\s\S]*?\}/,
  (match) => match.replace(/color:\s*#[a-fA-F0-9]+;/, 'color: #facc15;')
);
// Remove text-shadow if present
css = css.replace(
  /\.immersive-price\s*\{[^}]*text-shadow:[^;]+;/,
  (match) => match.replace(/\s*text-shadow:[^;]+;/, '')
);

// 3. immersive-add-btn → background #facc15, text black (to match waiter button style)
css = css.replace(
  /\.immersive-add-btn\s*\{[\s\S]*?background:\s*[^;]+;/,
  (match) => match.replace(/background:\s*[^;]+;/, 'background: #facc15;')
);
css = css.replace(
  /\.immersive-add-btn\s*\{[\s\S]*?color:\s*#[a-fA-F0-9]+;/,
  (match) => match.replace(/color:\s*#[a-fA-F0-9]+;/, 'color: #000000;')
);

fs.writeFileSync('src/app/globals.css', css);
console.log('Colors updated to #facc15 to match the waiter button yellow');
