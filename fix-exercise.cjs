const fs = require('fs');

let content = fs.readFileSync('src/pages/ExerciseSolver.tsx', 'utf8');
content = content.replace('p-8"', 'p-4 lg:p-8"');
content = content.replace('p-12 ', 'p-6 lg:p-12 ');
content = content.replace('className="max-w-7xl mx-auto space-y-6"', 'className="max-w-7xl mx-auto space-y-6 p-4 lg:p-8"');

// Fix the main outer padding, if we already added p-4 lg:p-8, we might have double padding. 
// Ah, the parent of max-w-7xl is probably in App.tsx flex-1 overflow-y-auto. 
// ExerciseSolver itself doesn't have an outer padding.

fs.writeFileSync('src/pages/ExerciseSolver.tsx', content);
console.log('ExerciseSolver updated');
