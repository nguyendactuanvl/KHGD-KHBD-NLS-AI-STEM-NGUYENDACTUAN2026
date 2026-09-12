const fs = require('fs');
let content = fs.readFileSync('src/lib/apiFetch.ts', 'utf8');

const targetIf = `    const isAuthError = is401 || errorMsg.includes("UNAUTHENTICATED") || errorMsg.includes("deleted or disabled") || errorMsg.includes("Tài khoản dịch vụ");`;
const replacementIf = `    const isAuthError = is401 || errorMsg.includes("UNAUTHENTICATED") || errorMsg.includes("deleted or disabled") || errorMsg.includes("Tài khoản dịch vụ");
    const isQuotaError = response.status === 429 || errorMsg.includes("vượt quá giới hạn") || errorMsg.includes("quota") || errorMsg.includes("429");`;

const targetElseIf = `    } else if (isAuthError) {`;
const replacementElseIf = `    } else if (isQuotaError && localStorage.getItem(API_KEY_STORAGE)) {
      // Don't delete the key for quota error, just throw specific message
      throw new Error(errorMsg || "API Key cá nhân của bạn đã bị giới hạn tốc độ (429). Quota của loại key miễn phí Google AI Studio là 15 request/phút. Vui lòng đợi 1 phút rồi thử lại.");
    } else if (isAuthError) {`;

content = content.replace(targetIf, replacementIf);
content = content.replace(targetElseIf, replacementElseIf);

fs.writeFileSync('src/lib/apiFetch.ts', content);
