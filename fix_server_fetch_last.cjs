const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

const regex = /const response = await fetch\(`https:\/\/generativelanguage\.googleapis\.com\/v1beta\/models\/[^`]+`,\s*\{\s*method:\s*'POST',\s*headers:\s*\{\s*'Content-Type':\s*'application\/json'\s*\},\s*body:\s*JSON\.stringify\(\{\s*contents:\s*(\[\{ parts: \[\{ text: promptText \}\] \}\])(?:,\s*generationConfig:\s*(\{\s*responseMimeType:\s*"application\/json"\s*\}))?\s*\}\)\s*\}\);[\s\S]*?if\s*\(!response\.ok\)[\s\S]*?\}\s*const\s*(\w+)\s*=\s*data\.candidates\?\.\[0\]\?\.content\?\.parts\?\.\[0\]\?\.text\s*\|\|\s*'[^']*';/g;

content = content.replace(regex, (match, contents, config, varname) => {
  return `
    const response = await generateWithFallback(req, {
      contents: ${contents}
      ${config ? `, config: ${config}` : ''}
    });
    const ${varname} = response.text || '';
  `;
});

fs.writeFileSync('server.ts', content);
