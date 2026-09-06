const fs = require('fs');
let code = fs.readFileSync('src/pages/ExerciseSolver.tsx', 'utf-8');

// Replace solution.split with String(solution).split
code = code.replace(/solution\.split/g, 'String(solution).split');

fs.writeFileSync('src/pages/ExerciseSolver.tsx', code);
console.log("Fixed solution.split error in ExerciseSolver.tsx");
