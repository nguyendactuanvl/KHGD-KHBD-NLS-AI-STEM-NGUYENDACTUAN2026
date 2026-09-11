const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

// The original string in handleAiError is:
// if (!isCustomKey) {
//     return res.status(400).json({ error: "Hệ thống AI hiện đang bảo trì hoặc hết hạn ngạch. Để tiếp tục sử dụng ngay lập tức mà không bị gián đoạn, bạn hãy nhấp vào mục Cài đặt hệ thống (ở góc trái bên dưới) và nhập API Key cá nhân của mình nhé." });
// }
// return res.status(400).json({ error: "Tài khoản dịch vụ liên kết với API Key cá nhân của bạn đã bị vô hiệu hóa. Vui lòng tạo API Key mới." });

// We should just rewrite the handleAiError function completely!

const newHandleAiError = `
function handleAiError(error: any, req: express.Request, res: express.Response) {
  const errorMsg = error?.message || "";
  const isCustomKey = !!req.headers['x-gemini-api-key'];

  if (errorMsg.includes("UNAUTHENTICATED") || errorMsg.includes("service account is deleted") || error?.status === 401 || errorMsg.includes("ACCOUNT_STATE_INVALID")) {
    if (!isCustomKey) {
        return res.status(401).json({ error: "UNAUTHENTICATED: Hệ thống AI hiện đang bảo trì hoặc hết hạn ngạch." });
    }
    return res.status(401).json({ error: "UNAUTHENTICATED: Tài khoản dịch vụ liên kết với API Key cá nhân của bạn đã bị vô hiệu hóa hoặc không hợp lệ." });
  }

  if (errorMsg.includes("suspended") || errorMsg.includes("PERMISSION_DENIED") || error?.status === 403) {
    if (!isCustomKey) {
        return res.status(401).json({ error: "UNAUTHENTICATED: Hệ thống AI hiện đang bảo trì hoặc hết hạn ngạch." });
    }
    return res.status(401).json({ error: "UNAUTHENTICATED: Tài khoản API Key cá nhân của bạn đã bị từ chối quyền truy cập." });
  }

  if (errorMsg.includes("RESOURCE_EXHAUSTED") || errorMsg.includes("quota") || errorMsg.includes("429") || error?.status === 429) {
    return res.status(429).json({ error: "Hệ thống đang quá tải hoặc hết hạn ngạch. Vui lòng thử lại sau ít phút hoặc sử dụng API Key cá nhân." });
  }

  console.error("Unhandled AI Error:", error);
  res.status(500).json({ error: errorMsg || "Đã xảy ra lỗi không xác định từ máy chủ AI. Vui lòng thử lại sau." });
}
`;

content = content.replace(/function handleAiError[\s\S]*?res\.status\(500\)[\s\S]*?\}/, newHandleAiError.trim());

// We also have many duplicate error handlers catching "UNAUTHENTICATED" inside the app.post handlers that were not refactored.
// I will just replace all those inline 400 responses with the handleAiError function or a 401.

fs.writeFileSync('server.ts', content);
