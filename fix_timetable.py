import re

with open("src/pages/WeeklyTimetable.tsx", "r") as f:
    code = f.read()

# 1. We need to add saveTimetable and saveTodos. They should be after the `useState` declarations.
# Let's find `const addTodo = () => {` and insert it just before that.

if "const saveTimetable =" not in code:
    insert_str = """
  useEffect(() => {
    const savedTimetable = localStorage.getItem("timetable_data");
    if (savedTimetable) {
      try {
        setTimetable(JSON.parse(savedTimetable));
      } catch(e) {}
    }

    const savedTodos = localStorage.getItem("timetable_todos");
    if (savedTodos) {
      try {
        setTodos(JSON.parse(savedTodos));
      } catch(e) {}
    }
  }, []);

  const saveTimetable = (newTimetable: Record<string, string>) => {
    setTimetable(newTimetable);
    localStorage.setItem("timetable_data", JSON.stringify(newTimetable));
  };

  const saveTodos = (newTodos: {id: number, text: string, done: boolean}[]) => {
    setTodos(newTodos);
    localStorage.setItem("timetable_todos", JSON.stringify(newTodos));
  };

"""
    code = code.replace("const addTodo = () => {", insert_str + "  const addTodo = () => {")

with open("src/pages/WeeklyTimetable.tsx", "w") as f:
    f.write(code)

print("fixed")
