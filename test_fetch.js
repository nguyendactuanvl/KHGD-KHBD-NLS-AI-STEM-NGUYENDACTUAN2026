fetch('http://localhost:3000/api/generate-lesson-plan', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    lesson: "Hàm số lượng giác",
    grade: 11,
    periods: 2,
    requirement: "Học sinh hiểu",
    subject: "Toán",
    textbook: "Kết nối tri thức"
  })
}).then(r => r.json()).then(console.log).catch(console.error);
