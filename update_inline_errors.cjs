const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(/catch \(error: any\) \{[\s\S]*?res\.status\(500\)\.json\([\s\S]*?\}\s*\}/g, (match) => {
  return `catch (error: any) {
      console.error(error);
      return handleAiError(error, req, res);
    }`;
});

fs.writeFileSync('server.ts', content);
