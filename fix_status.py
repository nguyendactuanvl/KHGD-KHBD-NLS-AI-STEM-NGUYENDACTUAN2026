import re

with open("server.ts", "r") as f:
    code = f.read()

# Replace return res.status(403) with return res.status(400)
code = code.replace("return res.status(403).json", "return res.status(400).json")

with open("server.ts", "w") as f:
    f.write(code)

print("Status fixed")
