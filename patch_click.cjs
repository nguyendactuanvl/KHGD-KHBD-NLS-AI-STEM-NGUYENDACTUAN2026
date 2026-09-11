const fs = require('fs');
let content = fs.readFileSync('src/pages/ExerciseSolver.tsx', 'utf8');

content = content.replace(
  'onClick={() => fileInputRef.current?.click()}',
  'onClick={() => { if (!isCameraActive) fileInputRef.current?.click() }}'
);

fs.writeFileSync('src/pages/ExerciseSolver.tsx', content);
