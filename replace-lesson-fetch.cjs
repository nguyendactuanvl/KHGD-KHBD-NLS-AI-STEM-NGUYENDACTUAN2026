const fs = require('fs');
let code = fs.readFileSync('src/pages/LessonPlan.tsx', 'utf-8');

const target = `      if (!response.ok) {
        let errorMsg = "Lỗi khi kết nối với AI (API trả về lỗi).";
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          if (response.status === 504 || response.status === 502) {
            errorMsg = "Hệ thống đang quá tải hoặc hết thời gian chờ. Vui lòng thử lại sau.";
          } else {
            errorMsg = \`Lỗi hệ thống (\${response.status}): Không thể kết nối với máy chủ.\`;
          }
        }
        throw new Error(errorMsg);
      }`;

const replacement = `      if (!response.ok) {
        let errorMsg = "Lỗi khi kết nối với AI (API trả về lỗi).";
        try {
          const text = await response.text();
          try {
             const errorData = JSON.parse(text);
             errorMsg = errorData.error || errorMsg;
          } catch(e) {
             if (response.status === 503 || response.status === 504 || response.status === 502) {
                errorMsg = "Hệ thống đang quá tải hoặc hết thời gian chờ. Vui lòng thử lại sau.";
             } else {
                errorMsg = \`Lỗi hệ thống (\${response.status}): Không thể kết nối với máy chủ.\`;
             }
          }
        } catch (e) {
          // ignore
        }
        throw new Error(errorMsg);
      }`;

if(code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/pages/LessonPlan.tsx', code);
    console.log("Success with exact match");
} else {
    console.log("Target not found. Doing regex...");
}
