const fs = require('fs');

function fixFile(filePath) {
  let code = fs.readFileSync(filePath, 'utf-8');
  
  const searchPatternImage = `    const katexElements = clone.querySelectorAll('.katex');
    katexElements.forEach(el => {
      const annotation = el.querySelector('annotation[encoding="application/x-tex"]');
      if (annotation && annotation.textContent) {
        const latex = annotation.textContent;
        const isBlock = el.parentElement?.classList.contains('katex-display');
        const encoded = encodeURIComponent(latex);
        
        const img = document.createElement('img');
        img.src = \`https://latex.codecogs.com/png.image?\\\\dpi{150}\\\\bg_white\\\\space \${encoded}\`;
        img.style.verticalAlign = 'middle';
        if (!isBlock) {
          img.style.height = '1.5em';
        } else {
          img.style.display = 'block';
          img.style.margin = '10px auto';
        }
        
        el.parentNode?.replaceChild(img, el);
      } else {
        // Fallback if no annotation
        const mathml = el.querySelector('.katex-mathml');
        if (mathml) {
          el.parentNode?.replaceChild(mathml.cloneNode(true), el);
        }
      }
    });`;

  const newPatternMathML = `    const katexElements = clone.querySelectorAll('.katex');
    katexElements.forEach(el => {
      const mathNode = el.querySelector('.katex-mathml math');
      if (mathNode) {
        const mathClone = mathNode.cloneNode(true) as Element;
        
        // Remove annotation tags completely
        const annotations = mathClone.querySelectorAll('annotation');
        annotations.forEach(a => a.remove());
        
        // Remove semantics tag but keep its children to avoid Word confusion
        const semantics = mathClone.querySelector('semantics');
        if (semantics) {
           while (semantics.firstChild) {
               mathClone.insertBefore(semantics.firstChild, semantics);
           }
           semantics.remove();
        }
        
        el.parentNode?.replaceChild(mathClone, el);
      }
    });`;

  if (code.includes('https://latex.codecogs.com/png.image')) {
    code = code.replace(searchPatternImage, newPatternMathML);
    fs.writeFileSync(filePath, code);
    console.log('Fixed', filePath);
  } else {
    console.log('Pattern not found in', filePath);
  }
}

fixFile('src/pages/LessonPlan.tsx');
fixFile('src/pages/Worksheets.tsx');
fixFile('src/pages/HistoryPage.tsx');
fixFile('src/pages/EducationalPlan.tsx');
