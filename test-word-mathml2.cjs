const { JSDOM } = require('jsdom');
const katex = require('katex');

const mathHtml = katex.renderToString('y = x^2 - 2x', { output: 'mathml' }); // Output only mathml?
console.log('KaTeX MathML Only:\n', mathHtml);

const mathHtmlDefault = katex.renderToString('y = x^2 - 2x');
const dom = new JSDOM(`<div>${mathHtmlDefault}</div>`);
const document = dom.window.document;

const katexElements = document.querySelectorAll('.katex');
katexElements.forEach(el => {
  const mathNode = el.querySelector('.katex-mathml math');
  if (mathNode) {
    const mathClone = mathNode.cloneNode(true);
    // Remove annotation just in case
    const annotation = mathClone.querySelector('annotation');
    if (annotation) annotation.remove();
    // also remove semantics wrapper if it's there? Actually, Word usually ignores semantics but let's keep it clean
    el.parentNode.replaceChild(mathClone, el);
  }
});

console.log('Processed DOM:\n', document.body.innerHTML);
