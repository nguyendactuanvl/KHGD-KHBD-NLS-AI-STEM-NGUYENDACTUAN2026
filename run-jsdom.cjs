const { JSDOM } = require('jsdom');
const fs = require('fs');

JSDOM.fromURL("https://khgdkhbd2026.vercel.app/", {
  runScripts: "dangerously",
  resources: "usable"
}).then(dom => {
  dom.window.addEventListener("error", (event) => {
    console.error("DOM ERROR:", event.error ? event.error.message : event.message);
  });
  dom.window.addEventListener("unhandledrejection", (event) => {
    console.error("UNHANDLED REJECTION:", event.reason);
  });
  
  setTimeout(() => {
    console.log("HTML length after 5s:", dom.serialize().length);
    console.log("Root HTML:", dom.window.document.getElementById('root') ? dom.window.document.getElementById('root').innerHTML : "NO ROOT");
  }, 5000);
}).catch(console.error);
