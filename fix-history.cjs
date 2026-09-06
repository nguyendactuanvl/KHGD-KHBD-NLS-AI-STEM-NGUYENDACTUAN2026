const fs = require('fs');
let code = fs.readFileSync('src/lib/history.ts', 'utf-8');

code = code.replace(
  'return JSON.parse(data);',
  `const items = JSON.parse(data);
    return items.map((item: any) => {
      if (item.content && typeof item.content === 'object') {
        // Try to extract text if it was a GenerateContentResponse object
        let textContent = '';
        try {
          if (item.content.candidates && item.content.candidates[0]?.content?.parts) {
            textContent = item.content.candidates[0].content.parts.map((p: any) => p.text).join('');
          } else if (item.content.text) {
            textContent = typeof item.content.text === 'function' ? item.content.text() : item.content.text;
          } else {
            textContent = JSON.stringify(item.content);
          }
        } catch(e) {
          textContent = "[Lỗi định dạng dữ liệu]";
        }
        return { ...item, content: textContent };
      }
      return item;
    });`
);

fs.writeFileSync('src/lib/history.ts', code);
console.log("Fixed history to handle object contents");
