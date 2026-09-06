const { JSDOM } = require('jsdom');
const katex = require('katex');

const mathHtml = katex.renderToString('y = x^2 - 2x');
const dom = new JSDOM(`<div>${mathHtml}</div>`);
const document = dom.window.document;

const katexElements = document.querySelectorAll('.katex');
katexElements.forEach(el => {
  const annotation = el.querySelector('annotation[encoding="application/x-tex"]');
  if (annotation) {
    const latex = annotation.textContent;
    const img = document.createElement('img');
    img.src = 'https://latex.codecogs.com/png.image?\\dpi{300}\\bg{white}' + encodeURIComponent(latex);
    img.style.verticalAlign = 'middle';
    img.style.height = '1.2em';
    el.parentNode.replaceChild(img, el);
  }
});

console.log(document.body.innerHTML);
