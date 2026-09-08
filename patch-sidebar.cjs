const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

if (!code.includes('Sơ đồ lớp')) {
  code = code.replace('import {  BookOpen, Calendar, FileText, Settings, Sparkles, Clock, ClipboardList, FileEdit, FileCheck } from "lucide-react";', 'import {  BookOpen, Calendar, FileText, Settings, Sparkles, Clock, ClipboardList, FileEdit, FileCheck, Users, ShieldCheck, CalendarDays } from "lucide-react";');
  
  const navItemsNew = `
    { id: "classmap", label: "Sơ đồ lớp", icon: Users },
    { id: "homeroom", label: "Quản lý lớp CN", icon: ShieldCheck },
    { id: "timetable", label: "TKB & Công việc", icon: CalendarDays },
    { id: "exam", label: "Tạo & Trộn đề", icon: FileCheck },
`;
  code = code.replace('{ id: "exam", label: "Tạo & Trộn đề", icon: FileCheck },', navItemsNew.trim());
  fs.writeFileSync('src/components/Sidebar.tsx', code);
  console.log('Sidebar updated');
}
