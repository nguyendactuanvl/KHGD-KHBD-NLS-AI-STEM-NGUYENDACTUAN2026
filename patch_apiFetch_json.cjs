const fs = require('fs');
let content = fs.readFileSync('src/lib/apiFetch.ts', 'utf8');

const targetStr = `const errorMsg = typeof errorData?.error === 'string' ? errorData.error : JSON.stringify(errorData?.error || "");`;
const replacementStr = `
    let errorMsg = typeof errorData?.error === 'string' ? errorData.error : JSON.stringify(errorData?.error || "");
    if (errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("RESOURCE_EXHAUSTED")) {
      errorMsg = "Hệ thống đang quá tải hoặc tạm thời không khả dụng do nhu cầu cao (429). Vui lòng thử lại sau ít phút hoặc sử dụng API Key cá nhân.";
    }
`;

content = content.replace(targetStr, replacementStr);

const targetStr2 = `const newErrorMsg = typeof errorData?.error === 'string' ? errorData.error : JSON.stringify(errorData?.error || "");`;
const replacementStr2 = `
      let newErrorMsg = typeof errorData?.error === 'string' ? errorData.error : JSON.stringify(errorData?.error || "");
      if (newErrorMsg.includes("429") || newErrorMsg.includes("quota") || newErrorMsg.includes("RESOURCE_EXHAUSTED")) {
        newErrorMsg = "Hệ thống đang quá tải hoặc tạm thời không khả dụng do nhu cầu cao (429). Vui lòng thử lại sau ít phút hoặc sử dụng API Key cá nhân.";
      }
`;
content = content.replace(targetStr2, replacementStr2);

fs.writeFileSync('src/lib/apiFetch.ts', content);
console.log('Patched src/lib/apiFetch.ts');
