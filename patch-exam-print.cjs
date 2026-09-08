const fs = require('fs');
let code = fs.readFileSync('src/pages/ExamGenerator.tsx', 'utf8');

const printTitle = `<h2 style={{textAlign:'center', fontSize: '18px', fontWeight: 'bold'}}>{examName}</h2>
                            <h3 style={{textAlign:'center', fontSize: '16px', marginBottom: '20px'}}>Mã đề: {exam.code}</h3>`;
                            
const printTitleNew = `<h2 style={{textAlign:'center', fontSize: '18px', fontWeight: 'bold'}}>{examName}</h2>
                            <h3 style={{textAlign:'center', fontSize: '16px', marginBottom: '5px'}}>Thời gian làm bài: {duration} phút</h3>
                            <h3 style={{textAlign:'center', fontSize: '16px', marginBottom: '20px'}}>Mã đề: {exam.code}</h3>`;
                            
code = code.replace(printTitle, printTitleNew);

fs.writeFileSync('src/pages/ExamGenerator.tsx', code);
console.log('Exam print patched');
