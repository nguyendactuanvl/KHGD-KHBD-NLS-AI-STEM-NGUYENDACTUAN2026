import re

with open("src/components/Sidebar.tsx", "r") as f:
    code = f.read()

code = code.replace('{ id: "homeroom", label: "Quản lý lớp CN", icon: ShieldCheck }', '{ id: "homeroom", label: "Sổ Chủ Nhiệm & QL", icon: ShieldCheck }')
code = code.replace('{ id: "circulars", label: "Kiểm tra thông tư", icon: FileText }', '{ id: "circulars", label: "Tài liệu & Thông tư", icon: FileText }')

with open("src/components/Sidebar.tsx", "w") as f:
    f.write(code)

print("patched sidebar labels")
