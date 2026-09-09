import re

with open("src/pages/WeeklyTimetable.tsx", "r") as f:
    code = f.read()

# Timetable replace
old_tkb_button = """            <button
              onClick={() => {
                if (window.confirm("Bạn có chắc chắn muốn xóa trắng Thời khóa biểu?")) {
                  saveTimetable({});
                }
              }}
              className="text-xs flex items-center gap-1 px-2 py-1 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-md transition-colors font-medium"
            >
              <Trash2 className="w-3 h-3" /> Xóa TKB
            </button>"""

new_tkb_button = """            <button
              onClick={() => {
                saveTimetable({});
              }}
              className="text-xs flex items-center gap-1 px-2 py-1 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-md transition-colors font-medium"
              title="Xóa trắng Thời khóa biểu"
            >
              <Trash2 className="w-3 h-3" /> Xóa TKB
            </button>"""
code = code.replace(old_tkb_button, new_tkb_button)

# Todos replace
old_todos_button = """            <button
              onClick={() => {
                if (window.confirm("Bạn có chắc chắn muốn xóa tất cả công việc?")) {
                  saveTodos([]);
                }
              }}
              className="text-xs flex items-center gap-1 px-2 py-1 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-md transition-colors font-medium"
            >
              <Trash2 className="w-3 h-3" /> Xóa việc
            </button>"""

new_todos_button = """            <button
              onClick={() => {
                saveTodos([]);
              }}
              className="text-xs flex items-center gap-1 px-2 py-1 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-md transition-colors font-medium"
              title="Xóa tất cả công việc"
            >
              <Trash2 className="w-3 h-3" /> Xóa việc
            </button>"""
code = code.replace(old_todos_button, new_todos_button)

# Also fix the alert in handleFileUpload
code = code.replace('alert("Trích xuất TKB thành công!");', 'console.log("Trích xuất TKB thành công!");')
code = code.replace('alert("Lỗi: Không tìm thấy dữ liệu TKB");', 'console.error("Lỗi: Không tìm thấy dữ liệu TKB");')
code = code.replace('alert("Có lỗi xảy ra khi trích xuất tài liệu. Vui lòng kiểm tra API Key.");', 'console.error("Có lỗi xảy ra khi trích xuất tài liệu.");')

with open("src/pages/WeeklyTimetable.tsx", "w") as f:
    f.write(code)

print("patched")
