fetch('http://localhost:3000/api/generate-lesson-plan', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ lesson: 'Test Lesson', subject: 'Math', grade: '10' })
}).then(r => r.json()).then(console.log).catch(console.error);
