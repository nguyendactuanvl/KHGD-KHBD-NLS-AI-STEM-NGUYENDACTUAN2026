with open("src/pages/Gamification.tsx", "r") as f:
    lines = f.readlines()

for i in range(len(lines)):
    if "// Load classes list" in lines[i]:
        lines[i-1] = "  useEffect(() => {\n"
    if "const stKey = selectedClassId === \"homeroom\"" in lines[i]:
        lines[i-1] = "  useEffect(() => {\n"

with open("src/pages/Gamification.tsx", "w") as f:
    f.writelines(lines)
