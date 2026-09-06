const fs = require('fs');
let code = fs.readFileSync('src/pages/HistoryPage.tsx', 'utf-8');

const target = `{item.grade === 0 ? "Khác" : \`Lớp \${item.grade}\`} • {item.subject}`;
const replacement = `{item.type === "PHT" ? "Phiếu bài tập" : (item.grade === 0 ? "Khác" : \`Lớp \${item.grade}\`)} • {item.subject}`;

if(code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/pages/HistoryPage.tsx', code);
    console.log("Success with exact match");
}
