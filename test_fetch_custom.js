fetch('http://localhost:3000/api/generate-lesson-plan', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-gemini-api-key': encodeURIComponent('invalid_key')
  },
  body: JSON.stringify({
    lesson: "Mệnh đề"
  })
}).then(r => r.json()).then(console.log).catch(console.error);
