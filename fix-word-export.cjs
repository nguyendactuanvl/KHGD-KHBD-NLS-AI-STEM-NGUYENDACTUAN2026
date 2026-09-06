const fs = require('fs');

function fixFile(file) {
  let code = fs.readFileSync(file, 'utf-8');
  if (code.includes('mathClone.setAttribute')) return; // already fixed
  
  code = code.replace(
    /const mathClone = mathNode\.cloneNode\(true\) as Element;/,
    "const mathClone = mathNode.cloneNode(true) as Element;\n        mathClone.setAttribute('xmlns', 'http://www.w3.org/1998/Math/MathML');"
  );
  
  fs.writeFileSync(file, code);
  console.log("Fixed", file);
}

fixFile('src/pages/ExerciseSolver.tsx');
fixFile('src/pages/PdfToWord.tsx');
