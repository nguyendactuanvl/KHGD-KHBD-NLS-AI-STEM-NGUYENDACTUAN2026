const katex = require('katex');
const html = katex.renderToString('a = b', { displayMode: true, output: 'mathml' });
console.log(html);
