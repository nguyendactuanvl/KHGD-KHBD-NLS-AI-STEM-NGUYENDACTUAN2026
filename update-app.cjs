const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

if (!code.includes("HistoryPage")) {
    code = code.replace("import { Circulars } from \"./pages/Circulars\";", "import { Circulars } from \"./pages/Circulars\";\nimport { HistoryPage } from \"./pages/HistoryPage\";");
    code = code.replace("{activeTab === \"circulars\" && <Circulars />}", "{activeTab === \"circulars\" && <Circulars />}\n        {activeTab === \"history\" && <HistoryPage />}");
    fs.writeFileSync('src/App.tsx', code);
    console.log("Success updated App.tsx");
} else {
    console.log("Already updated.");
}

let sidebarCode = fs.readFileSync('src/components/Sidebar.tsx', 'utf-8');
if (!sidebarCode.includes("history")) {
    sidebarCode = sidebarCode.replace("BookOpen, Calendar, FileText, Settings, Sparkles", "BookOpen, Calendar, FileText, Settings, Sparkles, Clock");
    sidebarCode = sidebarCode.replace(`{ id: "circulars", label: "Kiểm tra thông tư", icon: FileText },`, `{ id: "circulars", label: "Kiểm tra thông tư", icon: FileText },\n    { id: "history", label: "Lịch sử đã tạo", icon: Clock },`);
    fs.writeFileSync('src/components/Sidebar.tsx', sidebarCode);
    console.log("Success updated Sidebar.tsx");
} else {
    console.log("Sidebar already updated.");
}
