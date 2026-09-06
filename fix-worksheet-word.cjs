const fs = require('fs');
let code = fs.readFileSync('src/pages/Worksheets.tsx', 'utf-8');

const targetFunctionStart = `const handleExportWord = () => {
    if (!suggestion || !exportRef.current) {
      if (isEditing) {
        alert("Vui lòng chuyển sang chế độ 'Xem trước' (con mắt) trước khi tải xuống.");
      }
      return;
    }`;

const newFunctionStart = `const handleExportWord = () => {
    if (!suggestion || !exportRef.current) {
      if (isEditing) {
        alert("Vui lòng chuyển sang chế độ 'Xem trước' (con mắt) trước khi tải xuống.");
      }
      return;
    }

    const clone = exportRef.current.cloneNode(true);
    
    // Extract MathML from KaTeX for native Word Equation support
    const katexElements = clone.querySelectorAll('.katex');
    katexElements.forEach(el => {
      const mathml = el.querySelector('.katex-mathml');
      if (mathml) {
        el.parentNode?.replaceChild(mathml.cloneNode(true), el);
      }
    });`;

if (code.includes(targetFunctionStart)) {
    code = code.replace(targetFunctionStart, newFunctionStart);
    // Replace the innerHTML reference
    code = code.replace("${exportRef.current.innerHTML}", "${clone.innerHTML}");
    fs.writeFileSync('src/pages/Worksheets.tsx', code);
    console.log("Fixed Worksheets Word Export");
} else {
    console.log("Could not find target string in Worksheets.tsx");
}
