const fs = require('fs');
let code = fs.readFileSync('src/lib/apiFetch.ts', 'utf8');

const replacement = `
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      if (response.status === 504 || response.status === 502) {
        throw new Error("Hệ thống xử lý quá lâu và bị ngắt kết nối (Lỗi Timeout). Việc tạo tài liệu chi tiết (như Kế hoạch bài dạy, Đề thi) tốn rất nhiều thời gian. Vui lòng thử chia nhỏ yêu cầu, hoặc thiết lập API Key cá nhân để bỏ qua giới hạn của máy chủ proxy.");
      } else if (response.status === 413) {
        throw new Error("Dữ liệu quá lớn, đã bị hệ thống proxy/mạng từ chối. Vui lòng giảm dung lượng file hoặc nội dung yêu cầu.");
      } else {
        throw new Error("Máy chủ trả về trang lỗi HTML thay vì JSON (Lỗi " + response.status + "). Có thể do hệ thống đang bảo trì hoặc quá tải.");
      }
    }
`;

code = code.replace(/const contentType = response\.headers\.get\("content-type"\);\s*if \(contentType && contentType\.includes\("text\/html"\)\) \{\s*throw new Error\("Dữ liệu quá lớn, đã bị hệ thống proxy\/mạng từ chối \(hoặc máy chủ bảo trì\)\. Vui lòng giảm dung lượng file xuống dưới 5MB để đảm bảo kết nối ổn định\."\);\s*\}/g, replacement.trim());

fs.writeFileSync('src/lib/apiFetch.ts', code);
console.log("Updated apiFetch.ts");
