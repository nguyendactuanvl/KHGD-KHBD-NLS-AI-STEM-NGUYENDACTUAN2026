const fs = require('fs');
const glob = require('glob');

const files = [...glob.sync('api/*.ts'), 'server.ts'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Remove console.warn about Quota
  content = content.replace(/console\.warn\(\`Attempt \S+ failed with Quota\/Overload[^\)]+\);\n?/g, '');
  content = content.replace(/console\.warn\("Attempt \S+ failed with Quota\/Overload[^\)]+\);\n?/g, '');
  // Remove console.log("Trying model...")
  content = content.replace(/console\.log\(\`Trying model[^\)]+\);\n?/g, '');
  content = content.replace(/console\.log\('Trying model[^\)]+\);\n?/g, '');
  // Remove console.error("Model failed...")
  content = content.replace(/console\.error\(\`Model[^\)]+\);\n?/g, '');
  content = content.replace(/console\.error\('Model[^\)]+\);\n?/g, '');
  
  // In api/pdf-to-word.ts, api/solve-exercise.ts, etc., make sure it doesn't leak ugly JSON
  // We'll replace res.status(500).json({ error: error.message ... }) with a clean error
  content = content.replace(/res\.status\(500\)\.json\(\{ error: error\.message \|\| "Failed to convert document" \}\);/g, 'res.status(429).json({ error: "Hệ thống đang bận, vui lòng thử lại sau." });');
  
  fs.writeFileSync(file, content);
});

