const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const oldFunc = `  if (errorMsg.includes("RESOURCE_EXHAUSTED") || errorMsg.includes("quota") || errorMsg.includes("429") || error?.status === 429 || errorMsg.includes("503") || error?.status === 503 || errorMsg.includes("UNAVAILABLE")) {
    return res.status(429).json({ error: "Hệ thống đang quá tải hoặc tạm thời không khả dụng do nhu cầu cao (503). Vui lòng thử lại sau ít phút hoặc sử dụng API Key cá nhân." });
  }`;

const newFunc = `  if (errorMsg.includes("RESOURCE_EXHAUSTED") || errorMsg.includes("quota") || errorMsg.includes("429") || error?.status === 429) {
    if (!isCustomKey) {
        return res.status(429).json({ error: "Hệ thống đang quá tải hoặc tạm thời không khả dụng do nhu cầu cao (429). Vui lòng thử lại sau ít phút hoặc sử dụng API Key cá nhân." });
    }
    return res.status(429).json({ error: "API Key cá nhân của bạn đã vượt quá giới hạn lượt dùng hoặc bị giới hạn tốc độ (429). Vui lòng đợi một lát rồi thử lại hoặc kiểm tra quota." });
  }
  if (errorMsg.includes("503") || error?.status === 503 || errorMsg.includes("UNAVAILABLE")) {
    if (!isCustomKey) {
        return res.status(503).json({ error: "Hệ thống đang quá tải hoặc tạm thời không khả dụng do nhu cầu cao (503). Vui lòng thử lại sau ít phút hoặc sử dụng API Key cá nhân." });
    }
    return res.status(503).json({ error: "Hệ thống AI của Google đang quá tải (503). Vui lòng đợi vài giây và thử lại." });
  }`;

content = content.replace(oldFunc, newFunc);
fs.writeFileSync('server.ts', content);
