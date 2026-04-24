const { execSync } = require('child_process');

const token = process.env.SANITY_API_TOKEN || 'skpxOsZNgZ8b0biMbf9ovmZLwubXu0oKSJ0GbR0WGmOBHYvLHCcOBqZ1XWqDhIIgEy4pPEelkopolzdbWL8XTmwpeeNRj6jpkJ0pu2Ol3WupNsDwS4k9CKVeO9vK1l9olyFyLVMvbhHsYsNFnHQkZdLd1rROEo3vWTkGZCikbkHGNauYijQC';

console.log("Deploying Sanity Studio...");

try {
  execSync('npx sanity deploy -y', {
    env: { ...process.env, SANITY_AUTH_TOKEN: token },
    stdio: 'inherit'
  });
  console.log("Deployment successful!");
} catch (e) {
  console.error("Deployment failed:", e.message);
}
