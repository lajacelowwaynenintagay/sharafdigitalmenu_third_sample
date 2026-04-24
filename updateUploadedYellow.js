const fs = require('fs');

let css = fs.readFileSync('src/app/globals.css', 'utf8');

// Replace the previous neon #FFFF00 with the new uploaded yellow color #e6b91c
css = css.replace(/#FFFF00/g, '#E6B91C');

fs.writeFileSync('src/app/globals.css', css);
console.log('Colors successfully updated to the newly uploaded yellow #E6B91C');
