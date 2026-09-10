with open("src/lib/print.ts", "r") as f:
    code = f.read()

code = code.replace("orientation: 'portrait'", "orientation: 'portrait' as 'portrait'")

with open("src/lib/print.ts", "w") as f:
    f.write(code)
