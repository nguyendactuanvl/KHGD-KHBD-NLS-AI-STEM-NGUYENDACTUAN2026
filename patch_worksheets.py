import re

with open("src/pages/Worksheets.tsx", "r") as f:
    code = f.read()

target = "const mathClone = mathNode.cloneNode(true) as Element;"
replacement = "const mathClone = mathNode.cloneNode(true) as Element;\n        mathClone.setAttribute('xmlns', 'http://www.w3.org/1998/Math/MathML');"

code = code.replace(target, replacement)

code = code.replace("xmlns:m='http://schemas.openxmlformats.org/officeDocument/2006/math'", "xmlns:m='http://schemas.microsoft.com/office/2004/12/omml'")

with open("src/pages/Worksheets.tsx", "w") as f:
    f.write(code)

print("Patched Worksheets!")
