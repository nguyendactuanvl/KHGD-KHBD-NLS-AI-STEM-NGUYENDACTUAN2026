import { BookOpen, Calendar, FileText, Settings, Sparkles } from "lucide-react";
import { cn } from "../lib/utils";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const navItems = [
    { id: "khgd", label: "Kế hoạch giáo dục", icon: Calendar },
    { id: "khdh", label: "Kế hoạch dạy học", icon: BookOpen },
    { id: "circulars", label: "Kiểm tra thông tư", icon: FileText },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3 text-emerald-400">
          <Sparkles className="h-8 w-8" />
          <h1 className="text-xl font-bold">EduPlan AI</h1>
        </div>
        <p className="text-xs text-slate-400 mt-2">Dành cho Tổ trưởng chuyên môn</p>
      </div>

      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400 border-r-4 border-emerald-500"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-6 border-t border-slate-800">
        <button className="flex items-center gap-3 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">
          <Settings className="h-5 w-5" />
          Cài đặt hệ thống
        </button>
      </div>
    </div>
  );
}
