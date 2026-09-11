fetch('http://localhost:3000/api/generate-lesson-plan', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    lesson: "§1 Mệnh đề",
    requirement: "Thiết lập và phát biểu mệnh đề phủ định, đảo, kéo theo, tương đương; xác định tính đúng sai.",
    digitalComp: "1.1.NC1a: Kiểm tra tính logic của mệnh đề.",
    aiComp: "10.C2.3; 10.C3.2: Phân tích logic và kiểm tra mệnh đề qua ChatGPT/Gemini.",
    stem: "Có",
    grade: 10,
    periods: 4,
    subject: "Toán",
    textbook: "Kết nối tri thức với cuộc sống"
  })
}).then(r => r.json()).then(console.log).catch(console.error);
