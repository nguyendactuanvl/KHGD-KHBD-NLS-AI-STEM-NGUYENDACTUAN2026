import re

with open("src/pages/ExamGenerator.tsx", "r") as f:
    code = f.read()

validation_old = """  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const apiKey = localStorage.getItem("user_gemini_api_key");
      if (!apiKey) throw new Error("Vui lòng cài đặt API Key trong phần Cài đặt.");"""

validation_new = """  const handleGenerate = async () => {
    if (generateMode === "from_matrix_file" && !matrixBase64) {
      alert("Bạn đã chọn 'Bám sát Ma trận đính kèm' nhưng chưa tải file lên. Vui lòng tải file ma trận lên trước.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const apiKey = localStorage.getItem("user_gemini_api_key");
      if (!apiKey) throw new Error("Vui lòng cài đặt API Key trong phần Cài đặt.");"""

code = code.replace(validation_old, validation_new)

with open("src/pages/ExamGenerator.tsx", "w") as f:
    f.write(code)

print("patched validate")
