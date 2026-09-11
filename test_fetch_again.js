fetch('http://localhost:3000/api/generate-lesson-plan', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    lesson: "Khái niệm góc lượng giác",
    grade: 11,
    periods: 3,
    requirement: "Biết khái niệm",
    subject: "Toán",
    textbook: "Kết nối tri thức",
    customPrompt: "Soạn giáo án bài Khái niệm góc lượng giác lớp 11 môn Toán. Chỉ cần chào, không cần làm chi tiết, output 'Chào bạn'."
  })
}).then(r => r.json()).then(console.log).catch(console.error);
