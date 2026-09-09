import re

with open("src/pages/WeeklyTimetable.tsx", "r") as f:
    code = f.read()

# 1. Timetable header
old_tkb_header = """          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" /> Thời khóa biểu giảng dạy
          </h3>"""

new_tkb_header = """          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" /> Thời khóa biểu giảng dạy
            </h3>
            <button
              onClick={() => {
                if (window.confirm("Bạn có chắc chắn muốn xóa trắng Thời khóa biểu?")) {
                  saveTimetable({});
                }
              }}
              className="text-xs flex items-center gap-1 px-2 py-1 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-md transition-colors font-medium"
            >
              <Trash2 className="w-3 h-3" /> Xóa TKB
            </button>
          </div>"""
code = code.replace(old_tkb_header, new_tkb_header)

# 2. Todos header
old_todos_header = """          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-600" /> Việc cần làm (GVCN)
          </h3>"""

new_todos_header = """          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-600" /> Việc cần làm (GVCN)
            </h3>
            <button
              onClick={() => {
                if (window.confirm("Bạn có chắc chắn muốn xóa tất cả công việc?")) {
                  saveTodos([]);
                }
              }}
              className="text-xs flex items-center gap-1 px-2 py-1 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-md transition-colors font-medium"
            >
              <Trash2 className="w-3 h-3" /> Xóa việc
            </button>
          </div>"""
code = code.replace(old_todos_header, new_todos_header)

with open("src/pages/WeeklyTimetable.tsx", "w") as f:
    f.write(code)

print("patched")
