const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

if (!code.includes('Tạo & Trộn đề')) {
  code = code.replace('import {  BookOpen, Calendar, FileText, Settings, Sparkles, Clock, ClipboardList , FileEdit } from "lucide-react";', 'import {  BookOpen, Calendar, FileText, Settings, Sparkles, Clock, ClipboardList, FileEdit, FileCheck } from "lucide-react";');
  
  const newItem = `{ id: "exam", label: "Tạo & Trộn đề", icon: FileCheck },\n    { id: "khgd"`;
  code = code.replace('{ id: "khgd"', newItem);
  fs.writeFileSync('src/components/Sidebar.tsx', code);
  console.log("Sidebar.tsx patched");
} else {
  console.log("Already patched");
}
