const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

const regex = /const response = await fetch\(`https:\/\/generativelanguage\.googleapis\.com\/v1beta\/models\/[^`]+`,\s*\{\s*method:\s*'POST',\s*headers:\s*\{\s*'Content-Type':\s*'application\/json'\s*\},\s*body:\s*JSON\.stringify\(\{\s*contents:\s*(\[\{\s*parts:\s*\[\{\s*text:\s*promptText\s*\}\]\s*\}\])(?:,\s*generationConfig:\s*(\{\s*responseMimeType:\s*"application\/json"\s*\}))?\s*\}\)\s*\}\);[\s\S]*?if\s*\(!response\.ok\)[\s\S]*?\}\s*const\s*(\w+)\s*=\s*data\.candidates\?\.\[0\]\?\.content\?\.parts\?\.\[0\]\?\.text\s*\|\|\s*'[^']*';/g;

content = content.replace(regex, (match, contents, config, varname) => {
  return `
    const response = await generateWithFallback(req, {
      contents: ${contents}
      ${config ? `, config: ${config}` : ''}
    });
    const ${varname} = response.text || '';
  `;
});

// Also there might be a raw output assignment that looks like:
// const rawOutput = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
const regex2 = /const response = await fetch\(`https:\/\/generativelanguage\.googleapis\.com\/v1beta\/models\/[^`]+`,\s*\{\s*method:\s*'POST',\s*headers:\s*\{\s*'Content-Type':\s*'application\/json'\s*\},\s*body:\s*JSON\.stringify\(\{\s*contents:\s*(\[\{\s*parts:\s*\[\{\s*text:\s*promptText\s*\}\]\s*\}\]),\s*generationConfig:\s*(\{\s*responseMimeType:\s*"application\/json"\s*\})\s*\}\)\s*\}\);[\s\S]*?if\s*\(!response\.ok\)[\s\S]*?\}\s*const\s*rawOutput\s*=\s*data\.candidates\?\.\[0\]\?\.content\?\.parts\?\.\[0\]\?\.text\s*\|\|\s*'[^']*';/g;

content = content.replace(regex2, (match, contents, config) => {
  return `
    const response = await generateWithFallback(req, {
      contents: ${contents},
      config: ${config}
    });
    const rawOutput = response.text || '{}';
  `;
});

fs.writeFileSync('server.ts', content);
