const fs = require('fs');
const https = require('https');

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'lno8raw1';
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const TOKEN = process.env.SANITY_API_TOKEN || 'skpxOsZNgZ8b0biMbf9ovmZLwubXu0oKSJ0GbR0WGmOBHYvLHCcOBqZ1XWqDhIIgEy4pPEelkopolzdbWL8XTmwpeeNRj6jpkJ0pu2Ol3WupNsDwS4k9CKVeO9vK1l9olyFyLVMvbhHsYsNFnHQkZdLd1rROEo3vWTkGZCikbkHGNauYijQC';

const menuData = JSON.parse(fs.readFileSync('./public/mirror/sharaf-hotel/menu-data.json', 'utf8'));

// Try to load status data
let statusData = {};
try {
  statusData = JSON.parse(fs.readFileSync('./public/mirror/sharaf-hotel/menu-status.json', 'utf8'));
} catch (e) {
  console.log('No status data found or failed to parse.');
}

async function mutate(mutations) {
  const body = JSON.stringify({ mutations });
  const options = {
    hostname: `${PROJECT_ID}.api.sanity.io`,
    path: `/v2022-03-07/data/mutate/${DATASET}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`,
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`API Error ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function run() {
  console.log("Migrating Categories...");
  for (const cat of menuData.categories) {
    if (cat.id === 'all') continue;
    const doc = {
      _type: 'category',
      _id: `category-${cat.id}`,
      id: cat.id,
      icon: cat.icon,
      name_en: cat.name.en,
      name_ar: cat.name.ar || "",
      name_fr: cat.name.fr || "",
      name_de: cat.name.de || "",
      order: menuData.categories.findIndex(c => c.id === cat.id)
    };
    try {
      await mutate([{ createOrReplace: doc }]);
      console.log(`Migrated Category: ${cat.id}`);
    } catch (e) {
      console.error(`Failed Category ${cat.id}:`, e.message);
    }
  }

  console.log("Migrating Items...");
  for (const item of menuData.items) {
    const status = statusData[item.id] || {};
    
    const doc = {
      _type: 'menuItem',
      _id: `item-${item.id}`,
      id: item.id,
      category: item.category,
      subgroup: item.subgroup || "",
      price: item.price,
      price_label: item.price_label || "",
      calories: item.calories || "",
      type: item.type || "non-veg",
      is_4d: item.is_4d || false,
      title_en: item.title.en,
      title_ar: item.title.ar || "",
      title_fr: item.title.fr || "",
      title_de: item.title.de || "",
      description_en: item.description ? item.description.en : "",
      ingredients: JSON.stringify(item.ingredients || []),
      stock: status.stock || "available",
      offer: status.offer || 0,
      badges: status.badges || []
    };
    
    try {
      await mutate([{ createOrReplace: doc }]);
      console.log(`Migrated Item: ${item.id}`);
    } catch (e) {
      console.error(`Failed Item ${item.id}:`, e.message);
    }
  }
  console.log("Migration Complete!");
}

run();
