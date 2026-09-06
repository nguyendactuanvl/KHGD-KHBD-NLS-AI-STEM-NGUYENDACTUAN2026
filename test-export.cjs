const fs = require('fs');

function fixFile(filePath) {
  let code = fs.readFileSync(filePath, 'utf-8');
  
  if (code.includes('mathml.cloneNode(true)')) {
    code = code.replace(
      'el.parentNode?.replaceChild(mathml.cloneNode(true), el);',
      'const mathmlClone = mathml.cloneNode(true) as HTMLElement;\n        const annotation = mathmlClone.querySelector("annotation");\n        if (annotation) annotation.remove();\n        el.parentNode?.replaceChild(mathmlClone, el);'
    );
    fs.writeFileSync(filePath, code);
    console.log('Fixed', filePath);
  }
}

fixFile('src/pages/LessonPlan.tsx');
fixFile('src/pages/Worksheets.tsx');
