// A quick script to simulate the transformation
const { JSDOM } = require("jsdom");
const dom = new JSDOM(`
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-4">
    <div class="flex items-start gap-1 p-2">A. Opt1</div>
    <div class="flex items-start gap-1 p-2">B. Opt2</div>
    <div class="flex items-start gap-1 p-2">C. Opt3</div>
    <div class="flex items-start gap-1 p-2">D. Opt4</div>
  </div>
`);

const document = dom.window.document;
const grids = document.querySelectorAll('.grid-cols-1.sm\\:grid-cols-2, .grid');
grids.forEach(grid => {
  const children = Array.from(grid.children);
  const table = document.createElement('table');
  table.setAttribute('style', 'width: 100%; border: none; margin-top: 10px; margin-bottom: 10px;');
  
  let tr;
  children.forEach((child, index) => {
    if (index % 2 === 0) {
      tr = document.createElement('tr');
      table.appendChild(tr);
    }
    const td = document.createElement('td');
    td.setAttribute('style', 'width: 50%; border: none; padding: 5px; vertical-align: top;');
    td.innerHTML = child.innerHTML;
    tr.appendChild(td);
  });
  
  grid.parentNode.replaceChild(table, grid);
});

console.log(document.body.innerHTML);
