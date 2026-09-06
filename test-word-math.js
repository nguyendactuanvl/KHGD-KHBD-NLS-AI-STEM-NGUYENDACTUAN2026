const { JSDOM } = require('jsdom');
const katex = require('katex');

const mathHtml = katex.renderToString('y = x^2 - 2x');
const dom = new JSDOM(`<div>${mathHtml}</div>`);
const document = dom.window.document;

const katexElements = document.querySelectorAll('.katex');
katexElements.forEach(el => {
  const mathml = el.querySelector('.katex-mathml math');
  if (mathml) {
    const mathClone = mathml.cloneNode(true);
    const semantics = mathClone.querySelector('semantics');
    if (semantics) {
      Array.from(semantics.childNodes).forEach(child => {
        if (child.tagName && child.tagName.toLowerCase() !== 'annotation') {
          mathClone.appendChild(child);
        }
      });
      semantics.remove();
    }
    el.parentNode.replaceChild(mathClone, el);
  }
});

console.log(document.body.innerHTML);
