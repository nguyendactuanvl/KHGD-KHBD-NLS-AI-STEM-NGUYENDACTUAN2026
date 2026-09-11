const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

const originalFallback = `      if (e?.message?.includes("429") || e?.message?.includes("quota") || e?.status === 429) continue;`;
const newFallback = `      if (e?.message?.includes("429") || e?.message?.includes("quota") || e?.status === 429 || e?.message?.includes("503") || e?.status === 503 || e?.message?.includes("UNAVAILABLE")) continue;`;

content = content.replace(originalFallback, newFallback);

const originalErrorHandle = `  if (errorMsg.includes("RESOURCE_EXHAUSTED") || errorMsg.includes("quota") || errorMsg.includes("429") || error?.status === 429) {
    return res.status(429).json({ error: "Hệ thống đang quá tải hoặc hết hạn ngạch. Vui lòng thử lại sau ít phút hoặc sử dụng API Key cá nhân." });
  }`;

const newErrorHandle = `  if (errorMsg.includes("RESOURCE_EXHAUSTED") || errorMsg.includes("quota") || errorMsg.includes("429") || error?.status === 429 || errorMsg.includes("503") || error?.status === 503 || errorMsg.includes("UNAVAILABLE")) {
    return res.status(429).json({ error: "Hệ thống đang quá tải hoặc tạm thời không khả dụng do nhu cầu cao (503). Vui lòng thử lại sau ít phút hoặc sử dụng API Key cá nhân." });
  }`;

content = content.replace(originalErrorHandle, newErrorHandle);

fs.writeFileSync('server.ts', content);

// We should also do this for the Vercel APIs. Let's fix them too.
