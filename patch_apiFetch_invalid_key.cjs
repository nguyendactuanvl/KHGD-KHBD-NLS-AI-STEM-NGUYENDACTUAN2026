const fs = require('fs');
let content = fs.readFileSync('src/lib/apiFetch.ts', 'utf8');

const targetIf = `    const isQuotaError = response.status === 429 || errorMsg.includes("vượt quá giới hạn") || errorMsg.includes("quota") || errorMsg.includes("429");`;
const replacementIf = `    const isQuotaError = response.status === 429 || errorMsg.includes("vượt quá giới hạn") || errorMsg.includes("quota") || errorMsg.includes("429");
    const isInvalidKeyError = response.status === 400 && (errorMsg.includes("API_KEY_INVALID") || errorMsg.includes("API Key không hợp lệ") || errorMsg.includes("API key not valid"));`;

const targetElseIf = `    } else if (isQuotaError && localStorage.getItem(API_KEY_STORAGE)) {`;
const replacementElseIf = `    } else if (isInvalidKeyError && localStorage.getItem(API_KEY_STORAGE)) {
      localStorage.removeItem(API_KEY_STORAGE);
      window.dispatchEvent(new CustomEvent('show-api-key-modal'));
      throw new Error("API Key cá nhân của bạn không hợp lệ hoặc bị gõ sai. Hệ thống đã xóa key cũ, vui lòng nhập lại chính xác.");
    } else if (isQuotaError && localStorage.getItem(API_KEY_STORAGE)) {`;

content = content.replace(targetIf, replacementIf);
content = content.replace(targetElseIf, replacementElseIf);

fs.writeFileSync('src/lib/apiFetch.ts', content);
