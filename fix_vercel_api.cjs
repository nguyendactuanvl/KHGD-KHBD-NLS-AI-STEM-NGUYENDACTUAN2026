const fs = require('fs');
const path = require('path');

const apiFiles = fs.readdirSync('api').filter(f => f.endsWith('.ts'));

for (const file of apiFiles) {
  let content = fs.readFileSync(path.join('api', file), 'utf8');
  
  // Replace the API key extraction logic
  const originalApiKeyLogic = `  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Thiếu biến GEMINI_API_KEY trên Vercel' });
  }`;

  const newApiKeyLogic = `  let customKey = req.headers['x-gemini-api-key'];
  if (customKey) {
    try { customKey = decodeURIComponent(customKey); } catch (e) {}
  }
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Thiếu biến GEMINI_API_KEY trên Vercel' });
  }`;

  if (content.includes(originalApiKeyLogic)) {
    content = content.replace(originalApiKeyLogic, newApiKeyLogic);
  } else if (!content.includes('req.headers[\'x-gemini-api-key\']')) {
      // If it doesn't match exactly, we can regex it
      content = content.replace(/const apiKey = process\.env\.GEMINI_API_KEY;\s*if \(!apiKey\) \{\s*return res\.status\(\d+\)\.json\(\{ error: [^}]+\} \);\s*\}/, newApiKeyLogic);
  }

  // Also replace response.ok error handling to include more details
  const originalErrorHandling = `    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || 'Lỗi từ Google API' });
    }`;
    
  const originalErrorHandling2 = `    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || 'Lỗi Google API' });
    }`;

  const newErrorHandling = `    if (!response.ok) {
      const errorMsg = data.error?.message || 'Lỗi từ Google API';
      const isAuthError = errorMsg.includes("UNAUTHENTICATED") || errorMsg.includes("deleted") || errorMsg.includes("disabled");
      if (isAuthError) {
        return res.status(401).json({ error: "UNAUTHENTICATED: " + errorMsg });
      }
      return res.status(500).json({ error: errorMsg });
    }`;

  content = content.replace(originalErrorHandling, newErrorHandling);
  content = content.replace(originalErrorHandling2, newErrorHandling);

  fs.writeFileSync(path.join('api', file), content);
}
