const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const targetAuthErrorSystem = `    if (!isCustomKey) {
        return res.status(401).json({ error: "UNAUTHENTICATED: Hệ thống AI hiện đang bảo trì hoặc hết hạn ngạch." });
    }`;
const replacementAuthErrorSystem = `    if (!isCustomKey) {
        return res.status(401).json({ error: "UNAUTHENTICATED: Hệ thống AI hiện đang bảo trì hoặc hết hạn ngạch. Vui lòng thiết lập API Key cá nhân trong phần Cài đặt." });
    }`;

content = content.replace(targetAuthErrorSystem, replacementAuthErrorSystem);
fs.writeFileSync('server.ts', content);

let apiContent = fs.readFileSync('src/lib/apiFetch.ts', 'utf8');

const targetApiFetchAuthError = `        if (retryIsAuthError) {
            window.dispatchEvent(new CustomEvent('show-api-key-modal'));
            throw new Error("Khóa API không khả dụng. Vui lòng bấm vào nút 'Nhập mã API key' ở cột menu bên trái để thiết lập khóa cá nhân miễn phí.");
        }
      }
    } else if (isAuthError) {
        // We didn't have a custom key (meaning system key failed directly).
        window.dispatchEvent(new CustomEvent('show-api-key-modal'));
        throw new Error("Khóa API hiện tại không khả dụng. Vui lòng bấm vào nút 'Nhập mã API key' ở cột menu bên trái để thiết lập khóa cá nhân miễn phí.");
    }`;

const replacementApiFetchAuthError = `        if (retryIsAuthError) {
            window.dispatchEvent(new CustomEvent('show-api-key-modal'));
            throw new Error("Khóa API Hệ Thống không khả dụng. Vui lòng bấm vào Cài đặt ⚙️ ở menu bên trái để thiết lập mã API key cá nhân miễn phí.");
        }
      }
    } else if (isAuthError) {
        // We didn't have a custom key (meaning system key failed directly).
        window.dispatchEvent(new CustomEvent('show-api-key-modal'));
        throw new Error("Khóa API Hệ Thống không khả dụng. Vui lòng bấm vào Cài đặt ⚙️ ở menu bên trái để thiết lập mã API key cá nhân miễn phí.");
    }`;

apiContent = apiContent.replace(targetApiFetchAuthError, replacementApiFetchAuthError);
fs.writeFileSync('src/lib/apiFetch.ts', apiContent);
