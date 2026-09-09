import re

with open("src/pages/WeeklyTimetable.tsx", "r") as f:
    code = f.read()

# 1. Update imports
if "useEffect" not in code:
    code = code.replace('import { useState } from "react";', 'import { useState, useEffect } from "react";')

# 2. Update state definitions and add useEffect
old_state = """  const [todos, setTodos] = useState<{id: number, text: string, done: boolean}[]>([
    { id: 1, text: "Thu tiền BHYT đợt 1", done: false },
    { id: 2, text: "Nhắc nhở học sinh trang phục", done: true },
    { id: 3, text: "Chuẩn bị sinh hoạt lớp chủ đề 20/11", done: false }
  ]);
  const [newTodo, setNewTodo] = useState("");
  const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  
  const [isExtracting, setIsExtracting] = useState(false);

  const periods = [
    { id: "1", label: "Tiết 1" },
    { id: "2", label: "Tiết 2" },
    { id: "3", label: "Tiết 3" },
    { id: "4", label: "Tiết 4" },
    { id: "5", label: "Tiết 5" },
    { id: "6", label: "Tiết 6" },
    { id: "7", label: "Tiết 7" },
    { id: "8", label: "Tiết 8" },
    { id: "9", label: "Tiết 9" },
    { id: "10", label: "Tiết 10" },
    { id: "Tối", label: "Tối" }
  ];
  
  // Mock timetable
  const [timetable, setTimetable] = useState<Record<string, string>>({
    "Thứ 2-1": "Chào cờ",
    "Thứ 2-2": "Toán",
    "Thứ 3-3": "Lý",
    "Thứ 6-5": "Sinh hoạt lớp"
  });"""

new_state = """  const [todos, setTodos] = useState<{id: number, text: string, done: boolean}[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  
  const [isExtracting, setIsExtracting] = useState(false);

  const periods = [
    { id: "1", label: "Tiết 1" },
    { id: "2", label: "Tiết 2" },
    { id: "3", label: "Tiết 3" },
    { id: "4", label: "Tiết 4" },
    { id: "5", label: "Tiết 5" },
    { id: "6", label: "Tiết 6" },
    { id: "7", label: "Tiết 7" },
    { id: "8", label: "Tiết 8" },
    { id: "9", label: "Tiết 9" },
    { id: "10", label: "Tiết 10" },
    { id: "Tối", label: "Tối" }
  ];
  
  const [timetable, setTimetable] = useState<Record<string, string>>({});

  useEffect(() => {
    const savedTimetable = localStorage.getItem("timetable_data");
    if (savedTimetable) {
      try {
        setTimetable(JSON.parse(savedTimetable));
      } catch(e) {}
    } else {
      setTimetable({
        "Thứ 2-1": "Chào cờ",
        "Thứ 2-2": "Toán",
        "Thứ 3-3": "Lý",
        "Thứ 6-5": "Sinh hoạt lớp"
      });
    }

    const savedTodos = localStorage.getItem("timetable_todos");
    if (savedTodos) {
      try {
        setTodos(JSON.parse(savedTodos));
      } catch(e) {}
    } else {
      setTodos([
        { id: 1, text: "Thu tiền BHYT đợt 1", done: false },
        { id: 2, text: "Nhắc nhở học sinh trang phục", done: true },
        { id: 3, text: "Chuẩn bị sinh hoạt lớp chủ đề 20/11", done: false }
      ]);
    }
  }, []);

  const saveTimetable = (newTimetable: Record<string, string>) => {
    setTimetable(newTimetable);
    localStorage.setItem("timetable_data", JSON.stringify(newTimetable));
  };

  const saveTodos = (newTodos: {id: number, text: string, done: boolean}[]) => {
    setTodos(newTodos);
    localStorage.setItem("timetable_todos", JSON.stringify(newTodos));
  };"""

code = code.replace(old_state, new_state)

# 3. Replace setTodos with saveTodos in helper functions
code = code.replace("setTodos([{ id: Date.now(), text: newTodo, done: false }, ...todos]);", "saveTodos([{ id: Date.now(), text: newTodo, done: false }, ...todos]);")
code = code.replace("setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));", "saveTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));")
code = code.replace("setTodos(todos.filter(t => t.id !== id));", "saveTodos(todos.filter(t => t.id !== id));")

# 4. Replace setTimetable with saveTimetable in updateTimetable and extraction
code = code.replace("setTimetable({ ...timetable, [`${day}-${period}`]: val });", "saveTimetable({ ...timetable, [`${day}-${period}`]: val });")
code = code.replace("setTimetable(newTimetable);", "saveTimetable(newTimetable);")

# 5. Fix table styling for mobile responsiveness
old_table = """<table className="w-full text-center border-collapse">"""
new_table = """<table className="w-full text-center border-collapse min-w-[700px]">"""
code = code.replace(old_table, new_table)

with open("src/pages/WeeklyTimetable.tsx", "w") as f:
    f.write(code)

print("patched timetable")
