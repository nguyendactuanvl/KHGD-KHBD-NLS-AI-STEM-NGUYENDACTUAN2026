const { JSDOM } = require("jsdom");
const dom = new JSDOM(`
  <td style="width: 50%; border: none; padding: 4pt; vertical-align: top;">
    <div class="flex items-start gap-1 p-2 rounded-md border border-transparent">
       <span class="shrink-0 font-medium">A.</span>
       <div class="markdown-body inline-markdown flex-1"><p>Opt1</p></div>
    </div>
  </td>
`);
const document = dom.window.document;

const flexOpts = document.querySelectorAll('.flex.items-start.gap-1');
flexOpts.forEach(flex => {
    if (flex.children.length === 2 && flex.children[0].tagName === 'SPAN' && flex.children[1].classList.contains('markdown-body')) {
        const table = document.createElement('table');
        table.setAttribute('style', 'width: 100%; border: none; border-collapse: collapse; margin: 0; padding: 0;');
        const tr = document.createElement('tr');
        tr.setAttribute('style', 'border: none;');
        
        const td1 = document.createElement('td');
        td1.setAttribute('style', 'width: 25px; border: none; padding: 0; vertical-align: top; font-weight: bold;');
        td1.innerHTML = flex.children[0].innerHTML;
        
        const td2 = document.createElement('td');
        td2.setAttribute('style', 'border: none; padding: 0; vertical-align: top;');
        td2.innerHTML = flex.children[1].innerHTML;
        
        tr.appendChild(td1);
        tr.appendChild(td2);
        table.appendChild(tr);
        
        flex.parentNode.replaceChild(table, flex);
    }
});
console.log(document.body.innerHTML);
