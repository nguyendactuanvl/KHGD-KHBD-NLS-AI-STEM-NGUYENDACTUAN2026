const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

if (!code.includes("Worksheets")) {
    code = code.replace("import { HistoryPage } from \"./pages/HistoryPage\";", "import { HistoryPage } from \"./pages/HistoryPage\";\nimport { Worksheets } from \"./pages/Worksheets\";");
    code = code.replace("{activeTab === \"history\" && <HistoryPage />}", "{activeTab === \"history\" && <HistoryPage />}\n        {activeTab === \"worksheets\" && <Worksheets />}");
    fs.writeFileSync('src/App.tsx', code);
    console.log("Success updated App.tsx");
} else {
    console.log("App already updated.");
}

let sidebarCode = fs.readFileSync('src/components/Sidebar.tsx', 'utf-8');
if (!sidebarCode.includes("worksheets")) {
    sidebarCode = sidebarCode.replace("BookOpen, Calendar, FileText, Settings, Sparkles, Clock", "BookOpen, Calendar, FileText, Settings, Sparkles, Clock, ClipboardList");
    sidebarCode = sidebarCode.replace(`{ id: "circulars", label: "Kiểm tra thông tư", icon: FileText },`, `{ id: "worksheets", label: "Phiếu học tập", icon: ClipboardList },\n    { id: "circulars", label: "Kiểm tra thông tư", icon: FileText },`);
    fs.writeFileSync('src/components/Sidebar.tsx', sidebarCode);
    console.log("Success updated Sidebar.tsx");
} else {
    console.log("Sidebar already updated.");
}
