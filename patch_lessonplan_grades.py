import re

with open("src/pages/LessonPlan.tsx", "r") as f:
    code = f.read()

# Replace grade selector
old_grade_options = """                <option value={10}>Lớp 10</option>
                <option value={11}>Lớp 11</option>
                <option value={12}>Lớp 12</option>"""

new_grade_options = """                <option value={1}>Lớp 1</option>
                <option value={2}>Lớp 2</option>
                <option value={3}>Lớp 3</option>
                <option value={4}>Lớp 4</option>
                <option value={5}>Lớp 5</option>
                <option value={6}>Lớp 6</option>
                <option value={7}>Lớp 7</option>
                <option value={8}>Lớp 8</option>
                <option value={9}>Lớp 9</option>
                <option value={10}>Lớp 10</option>
                <option value={11}>Lớp 11</option>
                <option value={12}>Lớp 12</option>"""
code = code.replace(old_grade_options, new_grade_options)

# Handle empty availableLessons
old_system_lesson_selector = """            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Chọn Bài học từ Kế hoạch</label>
              <select 
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                value={selectedLessonId}
                onChange={(e) => setSelectedLessonId(e.target.value)}
              >
                {availableLessons.map(lesson => (
                  <option key={lesson.id} value={lesson.id}>
                    Bài {lesson.stt}: {lesson.lesson.length > 50 ? lesson.lesson.substring(0, 50) + '...' : lesson.lesson}
                  </option>
                ))}
              </select>
            </div>"""

new_system_lesson_selector = """            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Chọn Bài học từ Kế hoạch</label>
              {availableLessons.length > 0 ? (
                <select 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  value={selectedLessonId}
                  onChange={(e) => setSelectedLessonId(e.target.value)}
                >
                  {availableLessons.map(lesson => (
                    <option key={lesson.id} value={lesson.id}>
                      Bài {lesson.stt}: {lesson.lesson.length > 50 ? lesson.lesson.substring(0, 50) + '...' : lesson.lesson}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-lg">
                  Hệ thống hiện tại chỉ tích hợp sẵn Kế hoạch mẫu cho môn <b>Toán (10, 11, 12)</b>. 
                  <br/>Với các lớp/môn khác, vui lòng chuyển sang tab <b>"Từ tệp tải lên"</b> để AI đọc bài từ file Kế hoạch dạy học của bạn hoặc gõ thủ công.
                </div>
              )}
            </div>"""
code = code.replace(old_system_lesson_selector, new_system_lesson_selector)

with open("src/pages/LessonPlan.tsx", "w") as f:
    f.write(code)

print("LessonPlan patched")
