const { JSDOM } = require('jsdom');
const katex = require('katex');

const mathHtmlDefault = katex.renderToString('y = x^2 - 2x');
const dom = new JSDOM(`<div>${mathHtmlDefault}</div>`);
const document = dom.window.document;

const katexElements = document.querySelectorAll('.katex');
katexElements.forEach(el => {
  const mathNode = el.querySelector('.katex-mathml math');
  if (mathNode) {
    const mathClone = mathNode.cloneNode(true);
    
    // Remove annotation tags completely
    const annotations = mathClone.querySelectorAll('annotation');
    annotations.forEach(a => a.remove());
    
    // Remove semantics tag but keep its children
    const semantics = mathClone.querySelector('semantics');
    if (semantics) {
       while (semantics.firstChild) {
           mathClone.insertBefore(semantics.firstChild, semantics);
       }
       semantics.remove();
    }
    
    el.parentNode.replaceChild(mathClone, el);
  }
});

console.log('Processed DOM:\n', document.body.innerHTML);
