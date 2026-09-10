import re

with open("src/pages/Worksheets.tsx", "r") as f:
    code = f.read()

# Replace types
old_types = """  const worksheetTypes = [
    "Kết hợp trắc nghiệm và tự luận",
    "Chỉ trắc nghiệm khách quan",
    "Chỉ tự luận",
    "Bài tập thực hành / Dự án nhỏ"
  ];"""

new_types = """  const worksheetTypes = [
    "Đề 3 phần (12 câu TN nhiều lựa chọn; 4 câu Đ/S; 6 câu TL ngắn)",
    "Đề 4 phần (12 câu TN; 2 câu Đ/S; 4 câu TL ngắn; 3 câu Tự luận)",
    "Kết hợp trắc nghiệm và tự luận",
    "Chỉ trắc nghiệm khách quan",
    "Chỉ tự luận",
    "Bài tập thực hành / Dự án nhỏ"
  ];"""

code = code.replace(old_types, new_types)

with open("src/pages/Worksheets.tsx", "w") as f:
    f.write(code)

print("Worksheets types patched")
