const fs = require('fs');

function updateFile(file) {
  let code = fs.readFileSync(file, 'utf-8');
  
  // Update function signature
  code = code.replace(
    /const handleExportWord = \(\) => \{/g,
    'const handleExportWord = (keepLatex: boolean = false) => {'
  );
  
  // Update logic inside handleExportWord
  const oldLogic = `const katexElements = clone.querySelectorAll('.katex');
    katexElements.forEach(el => {
      const mathNode = el.querySelector('.katex-mathml math');
      if (mathNode) {
        const mathClone = mathNode.cloneNode(true) as Element;
        mathClone.setAttribute('xmlns', 'http://www.w3.org/1998/Math/MathML');
        
        const annotations = mathClone.querySelectorAll('annotation');
        annotations.forEach(a => a.remove());
        
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

  const newLogic = `const katexElements = clone.querySelectorAll('.katex');
    katexElements.forEach(el => {
      const annotation = el.querySelector('annotation[encoding="application/x-tex"]');
      if (keepLatex && annotation && annotation.textContent) {
        // Replace with raw LaTeX wrapped in $ or $$
        const isBlock = el.classList.contains('katex-display');
        const rawTex = annotation.textContent;
        const textNode = document.createTextNode(isBlock ? \`$$\\n\${rawTex}\\n$$\` : \`$\${rawTex}$\`);
        el.parentNode?.replaceChild(textNode, el);
      } else {
        // Use MathML for Native Word Equations
        const mathNode = el.querySelector('.katex-mathml math');
        if (mathNode) {
          const mathClone = mathNode.cloneNode(true) as Element;
          mathClone.setAttribute('xmlns', 'http://www.w3.org/1998/Math/MathML');
          const annotations = mathClone.querySelectorAll('annotation');
          annotations.forEach(a => a.remove());
          const semantics = mathClone.querySelector('semantics');
          if (semantics) {
             while (semantics.firstChild) {
                 mathClone.insertBefore(semantics.firstChild, semantics);
             }
             semantics.remove();
          }
          el.parentNode?.replaceChild(mathClone, el);
        }
      }
    });`;
    
  code = code.replace(oldLogic, newLogic);
  
  // Update buttons in PdfToWord
  if (file.includes('PdfToWord')) {
    code = code.replace(
      /<button[\s\S]*?onClick=\{handleExportWord\}[\s\S]*?Tải về file Word \(\.doc\)[\s\S]*?<\/button>/,
      `<div className="flex gap-2">
                <button 
                  onClick={() => handleExportWord(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm"
                >
                  <Download className="w-4 h-4" /> Word (Chuẩn)
                </button>
                <button 
                  onClick={() => handleExportWord(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium text-sm"
                  title="Dành cho giáo viên dùng MathType"
                >
                  <Download className="w-4 h-4" /> Word (Mã LaTeX)
                </button>
              </div>`
    );
  }
  
  // Update buttons in ExerciseSolver
  if (file.includes('ExerciseSolver')) {
    code = code.replace(
      /<button[\s\S]*?onClick=\{handleExportWord\}[\s\S]*?Word[\s\S]*?<\/button>/,
      `<div className="flex gap-2">
                  <button 
                    onClick={() => handleExportWord(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm"
                  >
                    <Download className="w-4 h-4" /> Word
                  </button>
                  <button 
                    onClick={() => handleExportWord(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm"
                    title="Giữ nguyên mã LaTeX để dùng MathType"
                  >
                    LaTeX
                  </button>
                </div>`
    );
  }
  
  fs.writeFileSync(file, code);
  console.log("Updated buttons in", file);
}

updateFile('src/pages/PdfToWord.tsx');
updateFile('src/pages/ExerciseSolver.tsx');
