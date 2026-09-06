const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf-8');

if (!code.includes('FileEdit')) {
  code = code.replace(/import \{([^}]+)\} from "lucide-react";/, 'import { $1, FileEdit } from "lucide-react";');
}

if (!code.includes('pdf2word')) {
  code = code.replace(
    /\{ id: "exercise", label: "Giải bài tập", icon: Sparkles \},/,
    '{ id: "exercise", label: "Giải bài tập", icon: Sparkles },\n    { id: "pdf2word", label: "Chuyển PDF sang Word", icon: FileEdit },'
  );
}

fs.writeFileSync('src/components/Sidebar.tsx', code);
console.log("Updated Sidebar.tsx");
