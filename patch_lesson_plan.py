import re

with open("src/pages/LessonPlan.tsx", "r") as f:
    code = f.read()

# 1. Fix the useMemo -> useEffect issue
old_memo = """  // Set the first lesson as default when changing grades
  useMemo(() => {
    if (availableLessons.length > 0 && (!selectedLessonId || !availableLessons.find(l => l.id === selectedLessonId))) {
      setSelectedLessonId(availableLessons[0].id);
    }
  }, [availableLessons]);"""

new_effect = """  // Set the first lesson as default when changing grades
  useEffect(() => {
    if (availableLessons.length > 0 && (!selectedLessonId || !availableLessons.find(l => l.id === selectedLessonId))) {
      setSelectedLessonId(availableLessons[0].id);
    }
  }, [availableLessons, selectedLessonId]);"""

code = code.replace(old_memo, new_effect)

# Make sure useEffect is imported
if "useEffect" not in code:
    code = code.replace('import { useState, useMemo, useRef } from "react";', 'import { useState, useEffect, useMemo, useRef } from "react";')
else:
    if "import { useState, useMemo, useRef }" in code:
        code = code.replace('import { useState, useMemo, useRef } from "react";', 'import { useState, useEffect, useMemo, useRef } from "react";')

# 2. Fix the bare text nodes for React + Google Translate compatibility
old_lesson_text = """<p><span className="font-medium text-slate-700">Tên bài:</span> {selectedLesson.lesson}</p>"""
new_lesson_text = """<p><span className="font-medium text-slate-700">Tên bài:</span> <span className="text-slate-800">{selectedLesson.lesson}</span></p>"""
code = code.replace(old_lesson_text, new_lesson_text)

old_periods_text = """<p><span className="font-medium text-slate-700">Số tiết:</span> {selectedLesson.periods}</p>"""
new_periods_text = """<p><span className="font-medium text-slate-700">Số tiết:</span> <span className="text-slate-800">{selectedLesson.periods}</span></p>"""
code = code.replace(old_periods_text, new_periods_text)

with open("src/pages/LessonPlan.tsx", "w") as f:
    f.write(code)

print("patched")
