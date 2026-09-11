const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

// Replace the fallback inside generateWithFallback
const oldFallback = /if \(e\?\.message\?\.includes\("429"\) \|\| e\?\.message\?\.includes\("quota"\) \|\| e\?\.status === 429\) continue;/;
const newFallback = `if (e?.message?.includes("429") || e?.message?.includes("quota") || e?.status === 429 || e?.message?.includes("503") || e?.status === 503 || e?.message?.includes("UNAVAILABLE") || e?.message?.includes("High demand") || e?.message?.includes("high demand") || e?.message?.includes("experiencing high demand")) continue;`;
content = content.replace(oldFallback, newFallback);

// Replace the error handler inside handleAiError
const oldErrorHandler = /if \(errorMsg\.includes\("RESOURCE_EXHAUSTED"\) \|\| errorMsg\.includes\("quota"\) \|\| errorMsg\.includes\("429"\) \|\| error\?\.status === 429\) \{[\s\S]*?return res\.status\(429\)\.json\(\{ error: "[^"]*" \}\);\s*\}/;
const newErrorHandler = `if (errorMsg.includes("RESOURCE_EXHAUSTED") || errorMsg.includes("quota") || errorMsg.includes("429") || error?.status === 429 || errorMsg.includes("503") || error?.status === 503 || errorMsg.includes("UNAVAILABLE") || errorMsg.includes("high demand") || errorMsg.includes("High demand")) {
    return res.status(429).json({ error: "Hệ thống đang quá tải hoặc tạm thời không khả dụng do nhu cầu cao. Vui lòng thử lại sau ít phút hoặc sử dụng API Key cá nhân." });
  }`;
content = content.replace(oldErrorHandler, newErrorHandler);

fs.writeFileSync('server.ts', content);
