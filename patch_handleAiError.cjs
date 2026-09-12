const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const targetFunc = `function handleAiError(error: any, req: any, res: any) {
  const errorMsg = error?.message || "";
  const isCustomKey = !!req.headers['x-gemini-api-key'];

  if (errorMsg.includes("API_KEY_INVALID") || errorMsg.includes("API key not valid")) {
    return res.status(400).json({ error: "API Key không hợp lệ. Vui lòng kiểm tra lại Cài đặt hệ thống và đảm bảo API Key chính xác." });
  }

  if (errorMsg.includes("UNAUTHENTICATED") || errorMsg.includes("service account is deleted") || error?.status === 401 || errorMsg.includes("ACCOUNT_STATE_INVALID")) {
    if (!isCustomKey) {
        return res.status(401).json({ error: "UNAUTHENTICATED: Hệ thống AI hiện đang bảo trì hoặc hết hạn ngạch. Vui lòng thiết lập API Key cá nhân trong phần Cài đặt." });
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
    if (!isCustomKey) {
        return res.status(429).json({ error: "Hệ thống đang quá tải hoặc tạm thời không khả dụng do nhu cầu cao (429). Vui lòng thử lại sau ít phút hoặc sử dụng API Key cá nhân." });
    }
    return res.status(429).json({ error: "API Key cá nhân của bạn đã bị giới hạn tốc độ (Lỗi 429). Đối với Key miễn phí của Google AI Studio, giới hạn là 15 câu lệnh/phút. Vui lòng đợi đúng 1 phút rồi thử lại." });
  }

  if (errorMsg.includes("503") || error?.status === 503 || errorMsg.includes("UNAVAILABLE")) {
    if (!isCustomKey) {
        return res.status(503).json({ error: "Hệ thống đang quá tải hoặc tạm thời không khả dụng do nhu cầu cao (503). Vui lòng thử lại sau ít phút hoặc sử dụng API Key cá nhân." });
    }
    return res.status(503).json({ error: "Hệ thống AI của Google đang quá tải (503). Vui lòng đợi vài giây và thử lại." });
  }

  console.error("Unhandled AI Error:", error);
  res.status(500).json({ error: errorMsg || "Đã xảy ra lỗi không xác định từ máy chủ AI. Vui lòng thử lại sau." });
}`;

const replaceFunc = `function handleAiError(error: any, req: any, res: any) {
  const errorMsg = error?.message || typeof error === 'string' ? error : JSON.stringify(error);
  const isCustomKey = !!req.headers['x-gemini-api-key'];

  if (errorMsg.includes("API_KEY_INVALID") || errorMsg.includes("API key not valid")) {
    return res.status(400).json({ error: "API Key không hợp lệ. Vui lòng kiểm tra lại Cài đặt hệ thống và đảm bảo API Key chính xác." });
  }

  if (errorMsg.includes("UNAUTHENTICATED") || errorMsg.includes("service account is deleted") || error?.status === 401 || errorMsg.includes("ACCOUNT_STATE_INVALID")) {
    if (!isCustomKey) {
        return res.status(401).json({ error: "UNAUTHENTICATED: Hệ thống AI hiện đang bảo trì hoặc hết hạn ngạch. Vui lòng thiết lập API Key cá nhân trong phần Cài đặt." });
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
    if (!isCustomKey) {
        return res.status(429).json({ error: "Hệ thống đang quá tải hoặc tạm thời không khả dụng do nhu cầu cao (429). Vui lòng thử lại sau ít phút hoặc sử dụng API Key cá nhân." });
    }
    return res.status(429).json({ error: "API Key cá nhân của bạn đã bị giới hạn tốc độ (Lỗi 429). Đối với Key miễn phí của Google AI Studio, giới hạn là 15 câu lệnh/phút. Vui lòng đợi đúng 1 phút rồi thử lại." });
  }

  if (errorMsg.includes("503") || error?.status === 503 || errorMsg.includes("UNAVAILABLE")) {
    if (!isCustomKey) {
        return res.status(503).json({ error: "Hệ thống đang quá tải hoặc tạm thời không khả dụng do nhu cầu cao (503). Vui lòng thử lại sau ít phút hoặc sử dụng API Key cá nhân." });
    }
    return res.status(503).json({ error: "Hệ thống AI của Google đang quá tải (503). Vui lòng đợi vài giây và thử lại." });
  }

  console.error("Unhandled AI Error:", error);
  res.status(500).json({ error: errorMsg || "Đã xảy ra lỗi không xác định từ máy chủ AI. Vui lòng thử lại sau." });
}`;

if (content.includes(targetFunc)) {
  content = content.replace(targetFunc, replaceFunc);
  fs.writeFileSync('server.ts', content);
  console.log("Patched server.ts successfully");
} else {
  console.log("Could not find exact function block in server.ts");
}
