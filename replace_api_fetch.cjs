const fs = require('fs');
const path = require('path');

const srcDirs = ['src/pages', 'src/components'];

for (const dir of srcDirs) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (!file.endsWith('.tsx') && !file.endsWith('.ts')) continue;
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. We replace `fetch('/api/` with `apiFetch('/api/`
    // 2. We replace `fetch("/api/` with `apiFetch("/api/`
    // 3. Import `apiFetch` from `../lib/apiFetch` if not present and we made a replacement
    
    let modified = false;
    if (content.includes("fetch('/api/") || content.includes('fetch("/api/') || content.includes('fetch(`/api/')) {
      content = content.replace(/fetch\('\/api\//g, "apiFetch('/api/");
      content = content.replace(/fetch\("\/api\//g, 'apiFetch("/api/');
      content = content.replace(/fetch\(\`\/api\//g, 'apiFetch(`/api/');
      modified = true;
    }

    if (modified) {
      if (!content.includes('apiFetch')) {
         // Should not happen as we just added it, but just in case
      }
      const importStatement = `import { apiFetch } from '../lib/apiFetch';\n`;
      content = importStatement + content;
      fs.writeFileSync(filePath, content);
      console.log('Modified', filePath);
    }
  }
}
