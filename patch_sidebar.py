import re

with open("src/components/Sidebar.tsx", "r") as f:
    code = f.read()

# Replace the navItems definition
old_nav_items = """  const navItems = [
    { id: "gamification", label: "Thi đua & Gọi tên", icon: Trophy },
    { id: "classmap", label: "Sơ đồ lớp", icon: Users },
    { id: "homeroom", label: "Sổ Chủ Nhiệm & QL", icon: ShieldCheck },
    { id: "timetable", label: "TKB & Công việc", icon: CalendarDays },
    { id: "exam", label: "Tạo & Trộn đề", icon: FileCheck },
    { id: "khgd", label: "Kế hoạch giáo dục", icon: Calendar },
    { id: "khdh", label: "Kế hoạch dạy học", icon: BookOpen },
    { id: "worksheets", label: "Phiếu học tập", icon: ClipboardList },
    { id: "exercise", label: "Giải bài tập", icon: Sparkles },
    { id: "pdf2word", label: "Chuyển PDF sang Word", icon: FileEdit },
    { id: "circulars", label: "Tài liệu & Thông tư", icon: FileText },
    { id: "history", label: "Lịch sử đã tạo", icon: Clock },
  ];"""

new_nav_items = """  const navGroups = [
    {
      title: "Chuyên môn & Soạn giảng",
      items: [
        { id: "khgd", label: "Kế hoạch giáo dục", icon: Calendar },
        { id: "khdh", label: "Kế hoạch dạy học", icon: BookOpen },
        { id: "worksheets", label: "Phiếu học tập", icon: ClipboardList },
        { id: "exercise", label: "Giải bài tập", icon: Sparkles },
        { id: "pdf2word", label: "Chuyển PDF sang Word", icon: FileEdit },
        { id: "exam", label: "Tạo & Trộn đề", icon: FileCheck },
      ]
    },
    {
      title: "Nghiệp vụ Giáo viên & Công tác Chủ nhiệm",
      items: [
        { id: "homeroom", label: "Sổ Chủ Nhiệm & QL", icon: ShieldCheck },
        { id: "classmap", label: "Sơ đồ lớp", icon: Users },
        { id: "gamification", label: "Thi đua & Gọi tên", icon: Trophy },
      ]
    },
    {
      title: "Tiện ích & Hồ sơ",
      items: [
        { id: "timetable", label: "TKB & Công việc", icon: CalendarDays },
        { id: "circulars", label: "Tài liệu & Thông tư", icon: FileText },
        { id: "history", label: "Lịch sử đã tạo", icon: Clock },
      ]
    }
  ];"""

code = code.replace(old_nav_items, new_nav_items)

# Replace the rendering part
old_nav_render = """      <nav className="flex-1 py-4">
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
      </nav>"""

new_nav_render = """      <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="mb-6 last:mb-2">
            <h3 className="px-6 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {group.title}
            </h3>
            <ul className="space-y-1">
              {group.items.map((item) => {
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
          </div>
        ))}
      </nav>"""

code = code.replace(old_nav_render, new_nav_render)

with open("src/components/Sidebar.tsx", "w") as f:
    f.write(code)

print("sidebar patched")
