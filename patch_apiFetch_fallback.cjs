const fs = require('fs');

const content = `export const API_KEY_STORAGE = 'eduplan_gemini_api_key_v2';

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
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

  // 1. Initial request
  let response = await fetch(url, {
    ...options,
    headers: getHeaders(false)
  });

  if (!response.ok) {
    const clonedRes = response.clone();
    let errorData;
    try {
      errorData = await clonedRes.json();
    } catch (e) {
      errorData = { error: await clonedRes.text() };
    }

    const is401 = response.status === 401;
    const errorMsg = typeof errorData?.error === 'string' ? errorData.error : JSON.stringify(errorData?.error || "");
    
    const isAuthError = is401 || errorMsg.includes("UNAUTHENTICATED") || errorMsg.includes("deleted or disabled") || errorMsg.includes("Tài khoản dịch vụ");
    const isQuotaError = response.status === 429 || errorMsg.includes("vượt quá giới hạn") || errorMsg.includes("quota") || errorMsg.includes("429");
    const isInvalidKeyError = response.status === 400 && (errorMsg.includes("API_KEY_INVALID") || errorMsg.includes("API Key không hợp lệ") || errorMsg.includes("API key not valid"));

    const customKeyUsed = !!localStorage.getItem(API_KEY_STORAGE);

    // 2. If Custom key fails, fall back to system key.
    if ((isAuthError || isInvalidKeyError || isQuotaError) && customKeyUsed) {
      console.warn("Custom API Key failed. Falling back to system API Key...");
      
      // Remove broken keys so we don't keep trying them
      if (isAuthError || isInvalidKeyError) {
        localStorage.removeItem(API_KEY_STORAGE);
      }

      // Retry without custom key (so the server uses its own system key)
      response = await fetch(url, {
        ...options,
        headers: getHeaders(true)
      });

      // If the system key ALSO fails, throw the ORIGINAL error
      if (!response.ok) {
        window.dispatchEvent(new CustomEvent('show-api-key-modal'));
        if (isQuotaError) {
           throw new Error("API Key cá nhân của bạn đã bị giới hạn tốc độ (Lỗi 429). Hệ thống đã tự động chuyển sang Key Hệ Thống nhưng cũng không khả dụng. Vui lòng đợi 1 phút rồi thử lại.");
        }
        if (isInvalidKeyError) {
           throw new Error("API Key cá nhân của bạn không hợp lệ hoặc bị gõ sai. Hệ thống đã xóa key cũ, vui lòng nhập lại chính xác. (Key dự phòng của hệ thống hiện cũng đang bảo trì).");
        }
        throw new Error(errorMsg || "Khóa API Hệ Thống và cá nhân đều không khả dụng. Vui lòng kiểm tra lại thiết lập API Key cá nhân.");
      } else {
        // Fallback succeeded! If we removed a bad key, let user know.
        if (isAuthError || isInvalidKeyError) {
           window.dispatchEvent(new CustomEvent('show-api-key-modal'));
           setTimeout(() => alert("API Key cá nhân của bạn không hợp lệ hoặc đã hết hạn nên hệ thống đã tạm xóa. Yêu cầu vừa rồi đã được xử lý thành công bằng Key Hệ Thống. Vui lòng nhập lại Key mới vào Cài đặt."), 1000);
        }
        return response;
      }
    } else {
      // 3. We didn't have a custom key (meaning system key failed directly), or it's a non-fallback error
      if (isAuthError) {
        window.dispatchEvent(new CustomEvent('show-api-key-modal'));
        throw new Error("Khóa API Hệ Thống không khả dụng. Vui lòng bấm vào Cài đặt ⚙️ ở menu bên trái để thiết lập mã API key cá nhân miễn phí.");
      } else if (isQuotaError) {
        window.dispatchEvent(new CustomEvent('show-api-key-modal'));
        throw new Error("Hệ thống đang quá tải (429). Vui lòng thiết lập API Key cá nhân trong Cài đặt ⚙️ để không bị giới hạn.");
      }
      
      throw new Error(errorMsg || "Đã xảy ra lỗi khi kết nối.");
    }
  }

  return response;
}
`;

fs.writeFileSync('src/lib/apiFetch.ts', content);
