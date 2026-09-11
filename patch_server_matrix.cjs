const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const replacement = `
    const parts: any[] = [{ text: promptText }];
    if (body.matrixFile) {
        const matches = body.matrixFile.match(/^data:(.*?);base64,(.*)$/);
        if (matches && matches.length === 3) {
            parts.push({
                inlineData: {
                    mimeType: matches[1],
                    data: matches[2]
                }
            });
        }
    }

    const response = await generateWithFallback(req, {
      contents: [{ parts }],
      config: {
          responseMimeType: "application/json"
      }
    });
`;

content = content.replace(/const response = await generateWithFallback\(req, \{[\s\S]*?contents: \[\{ parts: \[\{ text: promptText \}\] \}\][\s\S]*?\}\);/m, replacement);

fs.writeFileSync('server.ts', content);
