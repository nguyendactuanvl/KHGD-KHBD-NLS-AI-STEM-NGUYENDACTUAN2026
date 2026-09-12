const fs = require('fs');
let content = fs.readFileSync('src/lib/apiFetch.ts', 'utf8');

// Remove forced modal dispatch on Quota Error when falling back
const target1 = `      if (!response.ok) {
        window.dispatchEvent(new CustomEvent('show-api-key-modal'));
        if (isQuotaError) {`;
const rep1 = `      if (!response.ok) {
        // Do not force show modal on Quota error to avoid spamming the user
        if (isQuotaError) {`;
content = content.replace(target1, rep1);

// Remove forced modal dispatch on Quota Error when using System Key directly
const target2 = `      } else if (isQuotaError) {
        window.dispatchEvent(new CustomEvent('show-api-key-modal'));
        throw new Error("Hệ thống đang quá tải (429). Vui lòng thiết lập API Key cá nhân trong Cài đặt ⚙️ để không bị giới hạn.");
      }`;
const rep2 = `      } else if (isQuotaError) {
        // Just throw error, do not force popup
        throw new Error("Hệ thống đang quá tải (429). Vui lòng thiết lập API Key cá nhân trong Cài đặt ⚙️ để không bị giới hạn.");
      }`;
content = content.replace(target2, rep2);

fs.writeFileSync('src/lib/apiFetch.ts', content);
