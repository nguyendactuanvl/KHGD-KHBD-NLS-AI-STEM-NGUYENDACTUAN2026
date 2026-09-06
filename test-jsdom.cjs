const { JSDOM } = require('jsdom');
const katex = require('katex');

const mathHtml = katex.renderToString('P \\Rightarrow Q');
const dom = new JSDOM(`<div>${mathHtml}</div>`);
const document = dom.window.document;

const clone = document.body.cloneNode(true);
const katexElements = clone.querySelectorAll('.katex');
katexElements.forEach(el => {
  const mathml = el.querySelector('.katex-mathml');
  if (mathml) {
    const mathmlClone = mathml.cloneNode(true);
    const annotation = mathmlClone.querySelector("annotation");
    if (annotation) annotation.remove();
    el.parentNode.replaceChild(mathmlClone, el);
  }
});

console.log(clone.innerHTML);
