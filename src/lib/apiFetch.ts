export const API_KEY_STORAGE = 'eduplan_gemini_api_key_v2';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  if (options.body && typeof options.body === 'string' && options.body.length > 250 * 1024) {
    try {
      const parsedBody = JSON.parse(options.body);
      let modified = false;
      
      if (parsedBody.files && Array.isArray(parsedBody.files)) {
        parsedBody.fileIds = parsedBody.fileIds || [];
        for (let i = 0; i < parsedBody.files.length; i++) {
          const f = parsedBody.files[i];
          if (f.data && f.data.length > 100 * 1024) {
            const fileId = await uploadFileChunked(f.data, f.type);
            parsedBody.fileIds.push(fileId);
            f.data = ""; // Clear large data
            modified = true;
          }
        }
        // Filter out empty data files if they were offloaded
        parsedBody.files = parsedBody.files.filter((f: any) => f.data.length > 0);
      }
      
      if (parsedBody.file && typeof parsedBody.file === 'string' && parsedBody.file.length > 100 * 1024) {
        const fileId = await uploadFileChunked(parsedBody.file, parsedBody.type || 'text/plain');
        parsedBody.fileId = fileId;
        parsedBody.file = ""; // Clear
        modified = true;
      }
      
      if (modified) {
        options.body = JSON.stringify(parsedBody);
      }
    } catch (e) {
      console.warn("Could not chunk upload:", e);
    }
  }

  const getHeaders = (skipCustomKey = false) => {
    const headers = new Headers(options.headers || {});
    headers.delete('x-gemini-api-key');
    
    if (!skipCustomKey) {
      const customKey = localStorage.getItem(API_KEY_STORAGE);
      if (customKey) {
        headers.set('x-gemini-api-key', encodeURIComponent(customKey));
      }
    }
    return headers;
  };

  const maxRetries = 5; // Up to 5 retries (total ~1 minute wait)

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    let skipCustomKey = false;
    let customKeyUsed = !!localStorage.getItem(API_KEY_STORAGE);
    
    // First try with custom key (if exists), or system key
    let response = await fetch(url, {
      ...options,
      headers: getHeaders(skipCustomKey)
    });

    
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      if (response.status === 504 || response.status === 502) {
        throw new Error("Hệ thống xử lý quá lâu và bị ngắt kết nối (Lỗi Timeout). Việc tạo tài liệu chi tiết (như Kế hoạch bài dạy, Đề thi) tốn rất nhiều thời gian. Vui lòng thử chia nhỏ yêu cầu, hoặc thiết lập API Key cá nhân để bỏ qua giới hạn của máy chủ proxy.");
      } else if (response.status === 413) {
        throw new Error("Dữ liệu quá lớn, đã bị hệ thống proxy/mạng từ chối. Vui lòng giảm dung lượng file hoặc nội dung yêu cầu.");
      } else {
        throw new Error("Máy chủ trả về trang lỗi HTML thay vì JSON (Lỗi " + response.status + "). Có thể do hệ thống đang bảo trì hoặc quá tải.");
      }
    }
    if (response.ok) return response;

    const clonedRes = response.clone();
    let errorData;
    try {
      errorData = await clonedRes.json();
    } catch (e) {
      errorData = { error: await clonedRes.text() };
    }

    const is401 = response.status === 401;
    
    let errorMsg = typeof errorData?.error === 'string' ? errorData.error : JSON.stringify(errorData?.error || "");

    const isAuthError = is401 || errorMsg.includes("UNAUTHENTICATED") || errorMsg.includes("deleted or disabled") || errorMsg.includes("Tài khoản dịch vụ");
    const isQuotaError = response.status === 429 || errorMsg.includes("vượt quá giới hạn") || errorMsg.includes("quota") || errorMsg.includes("429");
    const isInvalidKeyError = response.status === 400 && (errorMsg.includes("API_KEY_INVALID") || errorMsg.includes("API Key không hợp lệ") || errorMsg.includes("API key not valid"));

    // If Custom key is used and it's invalid or auth error, tell the user explicitly
    if ((isAuthError || isInvalidKeyError) && customKeyUsed) {
      localStorage.removeItem(API_KEY_STORAGE);
      throw new Error("API Key cá nhân của bạn không hợp lệ, đã bị vô hiệu hóa, hoặc đã bị xóa (Lỗi 400/401). Vui lòng kiểm tra lại. Hệ thống đã tự động gỡ API Key lỗi này.");
    }
    
    if (isQuotaError || response.status === 503 || errorMsg.includes("overloaded")) {
      if (attempt < maxRetries) {
        console.warn(`[apiFetch] Rate limited (429/503). Retrying in 15 seconds... (Attempt ${attempt + 1} of ${maxRetries})`);
        window.dispatchEvent(new CustomEvent('api-retry-status', { detail: { attempt: attempt + 1, maxRetries } }));
        await delay(15000);
        continue;
      } else {
        if (customKeyUsed) {
          throw new Error(`API Key cá nhân của bạn hiện đang nhận quá nhiều yêu cầu (Lỗi 429) hoặc tài khoản của bạn bị giới hạn. Hệ thống đã tự động thử lại nhiều lần nhưng chưa thành công. Chi tiết từ Google: ${errorMsg}`);
        } else {
          throw new Error("Hệ thống (API Key mặc định) hiện đang nhận quá nhiều yêu cầu hoặc đã hết hạn mức. Vui lòng thử lại sau, hoặc thiết lập API Key cá nhân của riêng bạn trong Cài đặt để sử dụng ổn định hơn.");
        }
      }
    }

    // For any other non-retryable errors
    throw new Error(errorMsg || "Đã xảy ra lỗi khi kết nối.");
  }
  
  throw new Error("Request failed after retries.");
}

export async function uploadFileChunked(fileData: string, type: string): Promise<string> {
  const fileId = Math.random().toString(36).substring(2) + Date.now().toString(36);
  // Max payload is ~1MB for Nginx, so we use 500KB chunks
  const chunkSize = 500 * 1024;
  const totalChunks = Math.ceil(fileData.length / chunkSize);
  
  for (let i = 0; i < totalChunks; i++) {
    const chunkData = fileData.substring(i * chunkSize, (i + 1) * chunkSize);
    const res = await fetch('/api/upload-chunk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId, chunkIndex: i, totalChunks, chunkData, type })
    });
    if (!res.ok) {
      throw new Error(`Lỗi khi tải file lên (phần ${i + 1}/${totalChunks}). Vui lòng thử lại.`);
    }
  }
  return fileId;
}
