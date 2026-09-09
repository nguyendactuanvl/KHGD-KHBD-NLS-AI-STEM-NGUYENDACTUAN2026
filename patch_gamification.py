import re

with open("src/pages/Gamification.tsx", "r") as f:
    code = f.read()

# Add dialog state
state_search = """  // AI Modal state"""
state_replace = """  // Dialog state
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    type: 'alert' | 'confirm' | 'prompt' | 'confirm_upload';
    title: string;
    message: string;
    defaultValue?: string;
    onConfirm?: (val?: string) => void;
    onCancel?: () => void;
  } | null>(null);

  const showDialog = (type: 'alert'|'confirm'|'prompt'|'confirm_upload', message: string, onConfirm?: (val?: string) => void, onCancel?: () => void, defaultValue = "") => {
    setDialog({
      isOpen: true,
      type,
      title: "EduPlan AI cho biết:",
      message,
      defaultValue,
      onConfirm,
      onCancel
    });
  };

  // AI Modal state"""
code = code.replace(state_search, state_replace)

# Replace addClass
add_class_search = """  const addClass = () => {
    const name = prompt("Nhập tên lớp (VD: 10A1, 10A2...):");
    if (!name) return;
    const newClass = { id: `cls_${Date.now()}`, name };
    const newClasses = [...classes, newClass];
    setClasses(newClasses);
    localStorage.setItem("gvbm_classes", JSON.stringify(newClasses));
    setSelectedClassId(newClass.id);
  };"""
add_class_replace = """  const addClass = () => {
    showDialog('prompt', 'Nhập tên lớp (VD: 10A1, 10A2...):', (name) => {
      if (!name) return;
      const newClass = { id: `cls_${Date.now()}`, name };
      const newClasses = [...classes, newClass];
      setClasses(newClasses);
      localStorage.setItem("gvbm_classes", JSON.stringify(newClasses));
      setSelectedClassId(newClass.id);
    });
  };"""
code = code.replace(add_class_search, add_class_replace)

# Replace removeClass
remove_class_search = """  const removeClass = (id: string) => {
    if (id === "homeroom") {
      alert("Không thể xóa Lớp Chủ nhiệm mặc định");
      return;
    }
    if (confirm("Bạn có chắc chắn muốn xóa lớp này và toàn bộ điểm số của học sinh lớp này?")) {
      const newClasses = classes.filter(c => c.id !== id);
      setClasses(newClasses);
      localStorage.setItem("gvbm_classes", JSON.stringify(newClasses));
      localStorage.removeItem(`gvbm_students_${id}`);
      localStorage.removeItem(`gvbm_scores_${id}`);
      if (selectedClassId === id) setSelectedClassId("homeroom");
    }
  };"""
remove_class_replace = """  const removeClass = (id: string) => {
    if (id === "homeroom") {
      showDialog('alert', "Không thể xóa Lớp Chủ nhiệm mặc định");
      return;
    }
    showDialog('confirm', "Bạn có chắc chắn muốn xóa lớp này và toàn bộ điểm số của học sinh lớp này?", () => {
      const newClasses = classes.filter(c => c.id !== id);
      setClasses(newClasses);
      localStorage.setItem("gvbm_classes", JSON.stringify(newClasses));
      localStorage.removeItem(`gvbm_students_${id}`);
      localStorage.removeItem(`gvbm_scores_${id}`);
      if (selectedClassId === id) setSelectedClassId("homeroom");
    });
  };"""
code = code.replace(remove_class_search, remove_class_replace)

# Replace removeStudent
remove_st_search = """  const removeStudent = (id: string) => {
    if (confirm("Xác nhận xóa học sinh này?")) {
      saveStudents(students.filter(s => s.id !== id));
      saveScores(scores.filter(s => s.studentId !== id));
    }
  };"""
remove_st_replace = """  const removeStudent = (id: string) => {
    showDialog('confirm', "Xác nhận xóa học sinh này?", () => {
      saveStudents(students.filter(s => s.id !== id));
      saveScores(scores.filter(s => s.studentId !== id));
    });
  };"""
code = code.replace(remove_st_search, remove_st_replace)

with open("src/pages/Gamification.tsx", "w") as f:
    f.write(code)
print("replaced simple alerts")
