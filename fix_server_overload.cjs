const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldCheck = `      if (errorMsg.includes("503") || errorMsg.includes("high demand") || error?.status === 503) {
        return res.status(503).json({ error: "Hệ thống AI của Google hiện đang quá tải do nhu cầu sử dụng cao. Vui lòng thử lại sau vài giây." });
      }`;
const newCheck = `      if (errorMsg.includes("503") || errorMsg.includes("high demand") || errorMsg.includes("overloaded") || error?.status === 503) {
        return res.status(503).json({ error: "Hệ thống AI của Google hiện đang quá tải (Server Overloaded). Vui lòng đợi 5-10 giây rồi bấm thử lại." });
      }`;

code = code.replace(oldCheck, newCheck);
code = code.replace(oldCheck, newCheck); // Apply to all occurrences

// Also check if there's any other 503 check
const oldCheck2 = `      if (errorMsg.includes("503") || errorMsg.includes("high demand") || error?.status === 503) {
        return res.status(503).json({ error: "Hệ thống AI của Google hiện đang quá tải do nhu cầu sử dụng cao. Vui lòng thử lại sau vài giây." });
      }`;
code = code.replace(oldCheck2, newCheck);

// Additionally, for generate-plan API where we might not have 503 handled:
if (!code.includes('errorMsg.includes("overloaded")')) {
  // just in case
}

fs.writeFileSync('server.ts', code);
