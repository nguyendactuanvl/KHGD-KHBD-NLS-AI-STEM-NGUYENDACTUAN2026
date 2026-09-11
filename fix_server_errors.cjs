const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

const handleAiErrorFunc = `
function handleAiError(error: any, req: any, res: any) {
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

if (!content.includes('function handleAiError')) {
  content = content.replace('async function generateWithFallback', handleAiErrorFunc + '\nasync function generateWithFallback');
}

// Now replace catch blocks
content = content.replace(/catch \((err|error|e)(: any)?\) \{[\s\S]*?res\.status\(\d+\)\.json\(\{[\s\S]*?\}\);?\s*\}/g, (match, errVar) => {
  return `catch (${errVar}: any) {
    return handleAiError(${errVar}, req, res);
  }`;
});

fs.writeFileSync('server.ts', content);
