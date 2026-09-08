const fs = require('fs');

function addMath(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes('react-markdown')) {
    content = content.replace('import { useState', 'import { useState',);
    const imports = `
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
`;
    content = imports + content;
  }

  // Replace {q.content} with <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{q.content}</Markdown>
  content = content.replace(/{q\.content}/g, '<Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} className="inline-markdown">{q.content}</Markdown>');
  content = content.replace(/{opt}/g, '<Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} className="inline-markdown">{opt}</Markdown>');
  
  // same for examName ? 
  // content = content.replace(/{examName}/g, '{examName}');
  
  fs.writeFileSync(file, content);
}

addMath('src/pages/ExamGenerator.tsx');
addMath('src/pages/StudentExamView.tsx');
console.log('Math patched');
