with open("src/pages/LessonPlan.tsx", "r") as f:
    code = f.read()

code = code.replace("lessonName.replace(/\\s+/g, '_')", "(activeTab === 'system' && selectedLesson ? selectedLesson.lesson : customLessonName).replace(/\\s+/g, '_')")

with open("src/pages/LessonPlan.tsx", "w") as f:
    f.write(code)
