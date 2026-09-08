const fs = require('fs');
let code = fs.readFileSync('src/pages/ExamGenerator.tsx', 'utf8');

const shuffleFuncNew = `
  const handleShuffle = () => {
    if (questions.length === 0) return;
    const newExams = [];
    for (let i = 0; i < Math.min(numCodes, 24); i++) {
      const code = (101 + i).toString();
      const shuffledQ = [...questions].sort(() => Math.random() - 0.5).map((q, index) => {
        if (q.type === 'mc' && q.options) {
          const optionObjects = q.options.map((opt, i) => ({ text: opt, isCorrect: i === q.correctOptionIndex }));
          const shuffledOptions = optionObjects.sort(() => Math.random() - 0.5);
          return {
            ...q,
            id: index + 1,
            options: shuffledOptions.map(o => o.text),
            correctOptionIndex: shuffledOptions.findIndex(o => o.isCorrect)
          };
        }
        return {
          ...q,
          id: index + 1
        };
      });
      newExams.push({ code, questions: shuffledQ });
    }
    setShuffledExams(newExams);
    setActiveTab("shuffle");
  };
`;
code = code.replace(/const handleShuffle = \(\) => \{[\s\S]*?setActiveTab\("shuffle"\);\n  \};/, shuffleFuncNew.trim());

fs.writeFileSync('src/pages/ExamGenerator.tsx', code);
console.log('Shuffle updated');
