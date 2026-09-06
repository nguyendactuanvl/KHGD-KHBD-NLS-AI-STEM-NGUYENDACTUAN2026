const fs = require('fs');
let code = fs.readFileSync('src/pages/ExerciseSolver.tsx', 'utf-8');

code = code.replace(/setSolution\(data\.result\);/g, "setSolution(typeof data.result === 'string' ? data.result : (data.result?.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(data.result)));");

fs.writeFileSync('src/pages/ExerciseSolver.tsx', code);
console.log("Fixed setSolution in ExerciseSolver.tsx");
