fetch('http://localhost:3000/api/generate-plan', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    grade: "10",
    subject: "Toán",
    unit: "Bài 1",
    numLessons: 2,
    requirements: "Không"
  })
}).then(r => r.json()).then(console.log).catch(console.error);
