const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const targetQuota = `    return res.status(429).json({ error: "API Key cá nhân của bạn đã vượt quá giới hạn lượt dùng hoặc bị giới hạn tốc độ (429). Vui lòng đợi một lát rồi thử lại hoặc kiểm tra quota." });`;
const replacementQuota = `    return res.status(429).json({ error: "API Key cá nhân của bạn đã bị giới hạn tốc độ (Lỗi 429). Đối với Key miễn phí của Google AI Studio, giới hạn là 15 câu lệnh/phút. Vui lòng đợi đúng 1 phút rồi thử lại." });`;

content = content.replace(targetQuota, replacementQuota);
fs.writeFileSync('server.ts', content);
