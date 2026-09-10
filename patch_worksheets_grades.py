import re

with open("src/pages/Worksheets.tsx", "r") as f:
    code = f.read()

# Replace grade selector
old_grade_selector = """              <div className="flex bg-slate-100 p-1 rounded-lg">
                {[10, 11, 12].map((grade) => (
                  <button
                    key={grade}
                    onClick={() => setSelectedGrade(grade)}
                    className={cn(
                      "flex-1 py-1.5 text-sm font-medium rounded-md transition-colors",
                      selectedGrade === grade
                        ? "bg-white text-emerald-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    Lớp {grade}
                  </button>
                ))}
              </div>"""

new_grade_selector = """              <select 
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => (
                  <option key={g} value={g}>Lớp {g}</option>
                ))}
              </select>"""

code = code.replace(old_grade_selector, new_grade_selector)

with open("src/pages/Worksheets.tsx", "w") as f:
    f.write(code)
print("Worksheets patched")
