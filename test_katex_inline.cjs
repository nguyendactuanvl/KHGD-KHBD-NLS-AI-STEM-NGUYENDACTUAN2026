const katex = require('katex');
const html = katex.renderToString('a = b', { displayMode: false, output: 'mathml' });
console.log(html);
