const fs = require('fs');
let code = fs.readFileSync('src/pages/StudentExamView.tsx', 'utf8');

const oldRender = `
            <div className="space-y-3">
              {q.options.map((opt: string, oIdx: number) => {
`;
const newRender = `
            <div className="space-y-3">
              {q.type !== 'mc' && !q.options ? (
                <div className="p-4 bg-amber-50 text-amber-700 rounded-lg text-sm border border-amber-200">
                  Phần mềm chấm điểm tự động hiện tại chỉ hỗ trợ trắc nghiệm. Vui lòng làm câu này ra giấy.
                </div>
              ) : q.options?.map((opt: string, oIdx: number) => {
`;

code = code.replace(oldRender.trim(), newRender.trim());

// We also need to fix the grading. If it's not 'mc', it shouldn't count towards the auto-score or it should be handled differently.
// Let's just calculate score out of MC questions.
const oldScore = `
    let correct = 0;
    currentExam.questions.forEach((q: any, idx: number) => {
      if (answers[idx] === q.correctOptionIndex) correct++;
    });
    
    setScore((correct / currentExam.questions.length) * 10);
`;

const newScore = `
    let correct = 0;
    let totalMc = 0;
    currentExam.questions.forEach((q: any, idx: number) => {
      if (q.type === 'mc' || q.options) {
        totalMc++;
        if (answers[idx] === q.correctOptionIndex) correct++;
      }
    });
    
    setScore(totalMc > 0 ? (correct / totalMc) * 10 : 0);
`;
code = code.replace(oldScore.trim(), newScore.trim());

fs.writeFileSync('src/pages/StudentExamView.tsx', code);
console.log('Student view patched');
