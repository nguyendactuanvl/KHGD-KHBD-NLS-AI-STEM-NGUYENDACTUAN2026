const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');
content = content.replace(/if \(!isCustomKey\) \{\s*return res\.status\(400\)\.json\(\{ error: "Hệ thống AI hiện đang bảo trì[^}]+\} /g, 
  'if (!isCustomKey) { return res.status(401).json({ error: "UNAUTHENTICATED: Hệ thống AI hiện đang bảo trì hoặc hết hạn ngạch. Vui lòng nhập API Key cá nhân." }); } ');

content = content.replace(/return res\.status\(400\)\.json\(\{ error: "Tài khoản dịch vụ liên kết với API Key cá nhân của bạn đã bị vô hiệu hóa[^}]+\} /g,
  'return res.status(401).json({ error: "UNAUTHENTICATED: Tài khoản dịch vụ liên kết với API Key cá nhân của bạn đã bị vô hiệu hóa. Vui lòng tạo API Key mới." }); ');

fs.writeFileSync('server.ts', content);
