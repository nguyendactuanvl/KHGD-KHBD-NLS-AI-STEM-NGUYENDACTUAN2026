const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

// Replace the fetch block in server.ts
// There are multiple fetch blocks. We can replace them all.

const regex = /const response = await fetch\(`https:\/\/generativelanguage\.googleapis\.com\/v1beta\/models\/[^`]+`,\s*\{\s*method:\s*'POST',\s*headers:\s*\{\s*'Content-Type':\s*'application\/json'\s*\},\s*body:\s*JSON\.stringify\(\{\s*contents:(.*?)\s*(?:,\s*generationConfig:(.*?))?\}\)\s*\}\);[\s\S]*?if\s*\(!response\.ok\)[\s\S]*?\}\s*const\s*(\w+)\s*=\s*data\.candidates\?\.\[0\]\?\.content\?\.parts\?\.\[0\]\?\.text \|\| '';/g;

content = content.replace(regex, (match, contents, generationConfig, outVar) => {
  let replacement = `
    const response = await generateWithFallback(req, {
      contents: ${contents.trim()}
      ${generationConfig ? `, config: ${generationConfig.trim()}` : ''}
    });
    const ${outVar} = response.text || '';
  `;
  return replacement;
});

fs.writeFileSync('server.ts', content);
