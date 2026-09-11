const fs = require('fs');
const path = require('path');

const apiFiles = fs.readdirSync('api').filter(f => f.endsWith('.ts'));

for (const file of apiFiles) {
  let content = fs.readFileSync(path.join('api', file), 'utf8');
  
  const originalErrorHandling = `    if (!response.ok) {
      const errorMsg = data.error?.message || 'Lỗi từ Google API';
      const isAuthError = errorMsg.includes("UNAUTHENTICATED") || errorMsg.includes("deleted") || errorMsg.includes("disabled");
      if (isAuthError) {
        return res.status(401).json({ error: "UNAUTHENTICATED: " + errorMsg });
      }
      return res.status(500).json({ error: errorMsg });
    }`;

  const newErrorHandling = `    if (!response.ok) {
      const errorMsg = typeof data.error?.message === 'string' ? data.error.message : JSON.stringify(data.error || 'Lỗi từ Google API');
      const isAuthError = errorMsg.includes("UNAUTHENTICATED") || errorMsg.includes("deleted") || errorMsg.includes("disabled") || errorMsg.includes("ACCOUNT_STATE_INVALID");
      const isOverload = errorMsg.includes("RESOURCE_EXHAUSTED") || errorMsg.includes("quota") || errorMsg.includes("429") || response.status === 429 || errorMsg.includes("503") || response.status === 503 || errorMsg.includes("UNAVAILABLE") || errorMsg.includes("high demand") || errorMsg.includes("High demand");
      
      if (isAuthError) {
        return res.status(401).json({ error: "UNAUTHENTICATED: Tài khoản API Key của bạn không hợp lệ hoặc đã bị khóa." });
      }
      if (isOverload) {
        return res.status(429).json({ error: "Hệ thống đang quá tải hoặc tạm thời không khả dụng do nhu cầu cao. Vui lòng thử lại sau ít phút hoặc sử dụng API Key cá nhân." });
      }
      return res.status(500).json({ error: errorMsg });
    }`;

  if (content.includes(originalErrorHandling)) {
    content = content.replace(originalErrorHandling, newErrorHandling);
  }

  fs.writeFileSync(path.join('api', file), content);
}
