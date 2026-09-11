const fs = require('fs');

const newContent = `export function exportHtmlToWord(element: HTMLElement, filename: string) {
    const clone = element.cloneNode(true) as HTMLElement;
    
    // Transform grid into tables for MS Word
    const grids = clone.querySelectorAll('.grid-cols-1.sm\\\\:grid-cols-2, .grid');
    grids.forEach(grid => {
        if (grid.children.length === 0) return;
        const children = Array.from(grid.children);
        const table = document.createElement('table');
        table.setAttribute('style', 'width: 100%; border: none; margin-bottom: 10pt; table-layout: fixed;');
        
        let tr: HTMLTableRowElement | null = null;
        children.forEach((child, index) => {
            if (index % 2 === 0) {
                tr = document.createElement('tr');
                tr.setAttribute('style', 'border: none;');
                table.appendChild(tr);
            }
            const td = document.createElement('td');
            td.setAttribute('style', 'width: 50%; border: none; padding: 4pt; vertical-align: top;');
            td.innerHTML = child.innerHTML;
            if (tr) tr.appendChild(td);
        });
        
        if (grid.parentNode) {
            grid.parentNode.replaceChild(table, grid);
        }
    });

    // Extract MathML from KaTeX for native Word Equation support
    const katexElements = clone.querySelectorAll('.katex');
    katexElements.forEach(el => {
      const mathNode = el.querySelector('.katex-mathml math');
      if (mathNode) {
        const mathClone = mathNode.cloneNode(true) as Element;
        // IMPORTANT: Add MathML namespace for MS Word
        mathClone.setAttribute('xmlns', 'http://www.w3.org/1998/Math/MathML');
        
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
        
        if (el.parentNode) {
            el.parentNode.replaceChild(mathClone, el);
        }
      }
    });

    const contentHtml = clone.innerHTML;
    const header = \`<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns:m='http://schemas.microsoft.com/office/2004/12/omml' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>Document</title>
<style>
@page Section1 { size: 8.27in 11.69in; margin: 0.8in 0.8in 0.8in 0.8in; mso-header-margin: .5in; mso-footer-margin: .5in; mso-paper-source: 0; }
div.Section1 { page: Section1; }
body { font-family: 'Times New Roman', Times, serif; font-size: 13pt; line-height: 1.5; }
table { border-collapse: collapse; width: 100%; margin: 10pt 0; }
th, td { border: 1px solid black; padding: 6pt; }
table[style*="border: none"] th, table[style*="border: none"] td { border: none !important; }
img { max-width: 100%; height: auto; display: block; margin: 15pt auto; text-align: center; }
h1 { font-size: 18pt; text-align: center; margin-bottom: 20px; font-weight: bold; }
h2 { font-size: 16pt; margin-top: 15pt; margin-bottom: 5pt; font-weight: bold; }
h3 { font-size: 14pt; margin-top: 15px; font-weight: bold; }
p { margin: 0 0 6pt 0; }
.katex-html { display: none; }
.katex-mathml { display: inline; font-family: "Cambria Math", serif; }
math { font-family: "Cambria Math", serif; }
</style>
</head>
<body>
<div class="Section1">\`;
    const footer = "</div></body></html>";
    const sourceHTML = header + contentHtml + footer;
    
    const blob = new Blob(['\\ufeff', sourceHTML], { type: 'application/msword' });
    const source = URL.createObjectURL(blob);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = filename.endsWith('.doc') ? filename : filename + '.doc';
    fileDownload.click();
    document.body.removeChild(fileDownload);
}
`;

fs.writeFileSync('src/lib/exportUtils.ts', newContent);
