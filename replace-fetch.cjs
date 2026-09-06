const fs = require('fs');
let code = fs.readFileSync('src/pages/EducationalPlan.tsx', 'utf-8');

const target = `      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-api-key": encodeURIComponent(localStorage.getItem("user_gemini_api_key") || ""),
        },
        body: JSON.stringify({
          subject,
          grade: "10, 11, 12",
          topic,
          files: uploadedFiles
        }),
      });
      
      const data = await response.json();
      if (data && data.length > 0) {`;

const replacement = `      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-api-key": encodeURIComponent(localStorage.getItem("user_gemini_api_key") || ""),
        },
        body: JSON.stringify({
          subject,
          grade: "10, 11, 12",
          topic,
          files: uploadedFiles
        }),
      });
      
      if (!response.ok) {
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
      }
      
      const data = await response.json();
      if (data && Array.isArray(data) && data.length > 0) {`;

if(code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/pages/EducationalPlan.tsx', code);
    console.log("Success with exact match");
} else {
    console.log("Target not found. Doing regex...");
    const regex = /const response = await fetch\("\/api\/generate-plan"[\s\S]*?const data = await response\.json\(\);\s*if \(data && data\.length > 0\) \{/s;
    if(regex.test(code)) {
        code = code.replace(regex, replacement);
        fs.writeFileSync('src/pages/EducationalPlan.tsx', code);
        console.log("Success with regex");
    } else {
        console.log("Regex also failed.");
    }
}
