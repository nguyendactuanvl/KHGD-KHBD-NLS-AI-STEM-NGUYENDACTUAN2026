with open("api/generate-exam.ts", "r") as f:
    lines = f.readlines()

for i in range(len(lines)):
    if "examName: parsedData.title || \`Đề kiểm tra \${subject}\`," in lines[i]:
        lines[i] = lines[i].replace("\`", "`")
        lines[i] = lines[i].replace("\$\{", "${")
        lines[i] = lines[i].replace("\}", "}")

with open("api/generate-exam.ts", "w") as f:
    f.writelines(lines)
