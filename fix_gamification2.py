with open("src/pages/Gamification.tsx", "r") as f:
    lines = f.readlines()

for i in range(len(lines)):
    if "const saveStudents = (newSt: Student[]) => {" in lines[i]:
        if "useEffect" in lines[i+1]:
            lines[i+1] = "    setStudents(newSt);\n"
            
with open("src/pages/Gamification.tsx", "w") as f:
    f.writelines(lines)
