const fs = require('fs');

const pdfToWordPath = 'api/pdf-to-word.ts';
let content = fs.readFileSync(pdfToWordPath, 'utf8');

// The line is: return res.status(429).json({ error: error.message || "Hệ thống đang quá tải hoặc tạm thời không khả dụng do nhu cầu cao (429). Vui lòng thử lại sau ít phút hoặc sử dụng API Key cá nhân." });
// Let's replace it with a clean string check so we don't leak ugly JSON if error.message is an object.

const replacement = `
    } catch (error: any) {
      console.error("Error converting pdf to word:", error);
      const errorMsg = error?.message || "";
      if (errorMsg.includes("429") || error?.status === 429 || errorMsg.includes("quota") || errorMsg.includes("RESOURCE_EXHAUSTED")) {
        return res.status(429).json({ error: "Hệ thống đang quá tải hoặc tạm thời không khả dụng do nhu cầu cao. Vui lòng thử lại sau ít phút hoặc sử dụng API Key cá nhân." });
      }
      return res.status(500).json({ error: "Có lỗi xảy ra trong quá trình số hóa tài liệu. Vui lòng thử lại." });
    }
}
`;

content = content.replace(/\} catch \(error: any\) \{\s*console\.error\("Error converting pdf to word:", error\);\s*return res\.status\(429\)\.json\(\{ error: error\.message[^\}]+\}\);\s*\}/g, replacement.trim());
fs.writeFileSync(pdfToWordPath, content);
console.log('Patched api/pdf-to-word.ts');
