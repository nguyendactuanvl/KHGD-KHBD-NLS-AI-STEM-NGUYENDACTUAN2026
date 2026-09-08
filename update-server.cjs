const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes('/api/chat')) {
  const chatRoute = `
  app.post("/api/chat", async (req, res) => {
    try {
      const { prompt, context } = req.body;
      let fullPrompt = prompt;
      if (context) {
        fullPrompt = \`Ngữ cảnh dữ liệu học sinh hiện tại: \${JSON.stringify(context)}\\n\\nCâu hỏi của giáo viên: \${prompt}\`;
      }
      
      const response = await generateWithFallback(req, {
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }]
      });
      
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("/api/chat error:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI response" });
    }
  });
`;

  code = code.replace('app.get("/api/health"', chatRoute + '\n  app.get("/api/health"');
  fs.writeFileSync('server.ts', code);
  console.log('Added /api/chat route');
} else {
  console.log('/api/chat already exists');
}
