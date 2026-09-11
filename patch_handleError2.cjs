const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const oldFunc = `  if (errorMsg.includes("UNAUTHENTICATED") || errorMsg.includes("service account is deleted") || error?.status === 401 || errorMsg.includes("ACCOUNT_STATE_INVALID")) {`;

const newFunc = `  if (errorMsg.includes("API_KEY_INVALID") || errorMsg.includes("API key not valid")) {
    return res.status(400).json({ error: "API Key không hợp lệ. Vui lòng kiểm tra lại Cài đặt hệ thống và đảm bảo API Key chính xác." });
  }
  if (errorMsg.includes("UNAUTHENTICATED") || errorMsg.includes("service account is deleted") || error?.status === 401 || errorMsg.includes("ACCOUNT_STATE_INVALID")) {`;

content = content.replace(oldFunc, newFunc);
fs.writeFileSync('server.ts', content);
