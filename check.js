fetch("http://localhost:3000/api/generate-lesson-plan", {method: "POST"}).then(r => console.log(r.status)).catch(console.error)
