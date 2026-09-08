const fs = require('fs');
let content = fs.readFileSync('package.json', 'utf8');
content = content.replace(/"build":.*/, `"build": "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs && cp -r dist build && cp -r dist out",`);
fs.writeFileSync('package.json', content);
