const fs = require('fs');

function fixFile(filePath) {
  let code = fs.readFileSync(filePath, 'utf-8');
  
  const searchPattern = `    const katexElements = clone.querySelectorAll('.katex');
    katexElements.forEach(el => {
      const mathml = el.querySelector('.katex-mathml');
      if (mathml) {
        const mathmlClone = mathml.cloneNode(true) as HTMLElement;
        const annotation = mathmlClone.querySelector("annotation");
        if (annotation) annotation.remove();
        el.parentNode?.replaceChild(mathmlClone, el);
      }
    });`;

  const replacePattern = `    const katexElements = clone.querySelectorAll('.katex');
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

  if (code.includes('const mathml = el.querySelector(\'.katex-mathml\');')) {
    code = code.replace(searchPattern, replacePattern);
    fs.writeFileSync(filePath, code);
    console.log('Fixed', filePath);
  }
}

fixFile('src/pages/LessonPlan.tsx');
fixFile('src/pages/Worksheets.tsx');
fixFile('src/pages/HistoryPage.tsx');
