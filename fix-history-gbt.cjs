const fs = require('fs');
let code = fs.readFileSync('src/pages/HistoryPage.tsx', 'utf-8');

if (!code.includes('Giải bài tập')) {
  // Update the label for item.type === "GBT"
  // Search for item.type === "PHT" ? "Phiếu bài tập" :
  code = code.replace(
    'item.type === "PHT" ? "Phiếu bài tập" :', 
    'item.type === "GBT" ? "Giải bài tập" : item.type === "PHT" ? "Phiếu bài tập" :'
  );
  
  fs.writeFileSync('src/pages/HistoryPage.tsx', code);
  console.log("Updated HistoryPage.tsx");
}
