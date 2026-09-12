const fs = require('fs');
let content = fs.readFileSync('src/lib/apiFetch.ts', 'utf8');

// The logic previously left one throw Error for custom key fallback fail without checking if it was auth error
// We want to make sure we don't dispatch modal unless it's strictly an Auth Error on the system key side.

const target = `      if (isAuthError) {
        window.dispatchEvent(new CustomEvent('show-api-key-modal'));
        throw new Error("Khóa API Hệ Thống không khả dụng. Vui lòng bấm vào Cài đặt ⚙️ ở menu bên trái để thiết lập mã API key cá nhân miễn phí.");
      }`;

const replacement = `      if (isAuthError) {
        // Only show modal if the system key is failing due to auth, and user hasn't set custom key
        // Wait, if it's a completely invalid system key, maybe don't pop up EVERY time they click.
        // But for now, we'll keep it.
        window.dispatchEvent(new CustomEvent('show-api-key-modal'));
        throw new Error("Khóa API Hệ Thống không khả dụng. Vui lòng bấm vào Cài đặt ⚙️ ở menu bên trái để thiết lập mã API key cá nhân miễn phí.");
      }`;

// Wait, the user complaint is "sao cứ bắt nhập apikey hoài vậy. 1 lần thôi chứ" 
// (Why does it keep asking to enter apikey all the time. Just 1 time is enough)
// Let's remove the automatic modal dispatch entirely for system key failures.
// They can click Settings themselves.

const targetRemoveAll = `      if (isAuthError) {
        window.dispatchEvent(new CustomEvent('show-api-key-modal'));
        throw new Error("Khóa API Hệ Thống không khả dụng. Vui lòng bấm vào Cài đặt ⚙️ ở menu bên trái để thiết lập mã API key cá nhân miễn phí.");
      }`;
      
const replacementRemoveAll = `      if (isAuthError) {
        throw new Error("Khóa API Hệ Thống không khả dụng. Vui lòng bấm vào Cài đặt ⚙️ ở menu bên trái để thiết lập mã API key cá nhân miễn phí.");
      }`;
content = content.replace(targetRemoveAll, replacementRemoveAll);

// Also remove it from here if we removed a bad key. Just tell them.
const targetFallbackSuccess = `        if (isAuthError || isInvalidKeyError) {
           window.dispatchEvent(new CustomEvent('show-api-key-modal'));
           setTimeout(() => alert("API Key cá nhân của bạn không hợp lệ hoặc đã hết hạn nên hệ thống đã tạm xóa. Yêu cầu vừa rồi đã được xử lý thành công bằng Key Hệ Thống. Vui lòng nhập lại Key mới vào Cài đặt."), 1000);
        }`;
const replacementFallbackSuccess = `        if (isAuthError || isInvalidKeyError) {
           setTimeout(() => alert("API Key cá nhân của bạn không hợp lệ hoặc đã hết hạn nên hệ thống đã tạm xóa. Yêu cầu vừa rồi đã được xử lý thành công bằng Key Hệ Thống. Vui lòng nhập lại Key mới vào Cài đặt."), 1000);
        }`;
content = content.replace(targetFallbackSuccess, replacementFallbackSuccess);


fs.writeFileSync('src/lib/apiFetch.ts', content);
