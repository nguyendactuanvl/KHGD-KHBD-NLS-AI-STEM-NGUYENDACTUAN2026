const fs = require('fs');

const filePath = 'src/pages/HistoryPage.tsx';
let code = fs.readFileSync(filePath, 'utf-8');

const searchPattern = `    const katexElements = clone.querySelectorAll('.katex');
    katexElements.forEach(el => {
      const mathml = el.querySelector('.katex-mathml');
      if (mathml) {
        const mathmlClone = mathml.cloneNode(true) as HTMLElement;
        const annotation = mathmlClone.querySelector('annotation');
        if (annotation) {
          annotation.remove();
        }
        el.parentNode?.replaceChild(mathmlClone, el);
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

code = code.replace(searchPattern, newPatternMathML);
fs.writeFileSync(filePath, code);
console.log('Fixed', filePath);
