export function exportHtmlToWord(element: HTMLElement, filename: string) {
    const clone = element.cloneNode(true) as HTMLElement;
    
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
        
        el.parentNode?.replaceChild(mathClone, el);
      }
    });

    const contentHtml = clone.innerHTML;
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns:m='http://schemas.microsoft.com/office/2004/12/omml' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>Document</title>
<style>
body { font-family: 'Times New Roman', Times, serif; font-size: 13pt; line-height: 1.5; } 
table { border-collapse: collapse; width: 100%; margin: 15pt 0; } 
th, td { border: 1px solid black; padding: 6pt; } 
img { max-width: 100%; height: auto; display: block; margin: 15pt auto; text-align: center; } 
h1 { font-size: 18pt; text-align: center; margin-bottom: 20px; }
h2 { font-size: 16pt; margin-top: 15pt; margin-bottom: 5pt; }
h3 { font-size: 14pt; margin-top: 15px; }
.katex-html { display: none; }
.katex-mathml { display: block; font-family: "Cambria Math", serif; }
</style>
</head>
<body>`;
    const footer = "</body></html>";
    const sourceHTML = header + contentHtml + footer;
    
    const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword' });
    const source = URL.createObjectURL(blob);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = filename.endsWith('.doc') ? filename : filename + '.doc';
    fileDownload.click();
    document.body.removeChild(fileDownload);
}
