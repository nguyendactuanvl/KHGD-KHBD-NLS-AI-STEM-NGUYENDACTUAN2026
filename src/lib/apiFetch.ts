export const API_KEY_STORAGE = 'eduplan_gemini_api_key_v2';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
      throw new Error("Dữ liệu quá lớn, đã bị hệ thống proxy/mạng từ chối (hoặc máy chủ bảo trì). Vui lòng giảm dung lượng file xuống dưới 5MB để đảm bảo kết nối ổn định.");
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
