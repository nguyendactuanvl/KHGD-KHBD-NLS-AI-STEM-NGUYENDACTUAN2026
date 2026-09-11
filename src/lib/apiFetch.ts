export const API_KEY_STORAGE = 'eduplan_gemini_api_key_v2';

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const getHeaders = (skipCustomKey = false) => {
    const headers = new Headers(options.headers || {});
    // If the caller already added x-gemini-api-key manually from the old local storage logic, remove it.
    // We will manage it here.
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

    // 2. If Auth Error AND we used a custom key, the custom key is broken.
    if (isAuthError && localStorage.getItem(API_KEY_STORAGE)) {
      console.warn("Custom API Key failed. Falling back to system API Key...");
      // Remove broken key
      localStorage.removeItem(API_KEY_STORAGE);
      
      // Retry without custom key (so the server uses its own system key)
      response = await fetch(url, {
        ...options,
        headers: getHeaders(true)
      });

      if (!response.ok) {
        const retryClonedRes = response.clone();
        let retryErrorData;
        try {
          retryErrorData = await retryClonedRes.json();
        } catch(e) {}
        
        const retryErrorMsg = typeof retryErrorData?.error === 'string' ? retryErrorData.error : JSON.stringify(retryErrorData?.error || "");
        const retryIsAuthError = response.status === 401 || retryErrorMsg.includes("UNAUTHENTICATED") || retryErrorMsg.includes("deleted or disabled");

        // 3. If the system key ALSO fails
        if (retryIsAuthError) {
            window.dispatchEvent(new CustomEvent('show-api-key-modal'));
            throw new Error("Khóa API Hệ Thống không khả dụng. Vui lòng bấm vào Cài đặt ⚙️ ở menu bên trái để thiết lập mã API key cá nhân miễn phí.");
        }
      }
    } else if (isAuthError) {
        // We didn't have a custom key (meaning system key failed directly).
        window.dispatchEvent(new CustomEvent('show-api-key-modal'));
        throw new Error("Khóa API Hệ Thống không khả dụng. Vui lòng bấm vào Cài đặt ⚙️ ở menu bên trái để thiết lập mã API key cá nhân miễn phí.");
    }
  }

  return response;
}
