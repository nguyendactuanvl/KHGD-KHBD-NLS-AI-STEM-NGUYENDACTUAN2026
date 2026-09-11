const { JSDOM } = require('jsdom');
const fs = require('fs');

const html = `<!DOCTYPE html><html><head></head><body><div id="root"></div></body></html>`;
const dom = new JSDOM(html, { runScripts: "dangerously", url: "http://localhost/" });

dom.window.addEventListener('error', (e) => {
  console.log('CLIENT ERROR:', e.message, e.filename, e.lineno);
});

const scriptContent = fs.readFileSync('dist/assets/index-B5J97Puo.js', 'utf8');

try {
  dom.window.eval(scriptContent);
  setTimeout(() => {
    const root = dom.window.document.getElementById('root');
    console.log("Script executed. Root:", root ? root.innerHTML.substring(0, 100) : 'No root');
  }, 1000);
} catch(e) {
  console.error("EVAL ERROR:", e.message);
}
