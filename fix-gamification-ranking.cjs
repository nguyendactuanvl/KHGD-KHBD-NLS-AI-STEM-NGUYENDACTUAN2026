const fs = require('fs');
let code = fs.readFileSync('src/pages/Gamification.tsx', 'utf8');

// Fix getRankedStudents -> calculateRanking
code = code.replace(/getRankedStudents\(\)\.map\(\(st, i\) => \(\{\n        rank: i \+ 1,\n        name: st\.name,\n        score: st\.totalScore/g, 
`calculateRanking().map((rs, i) => ({
        rank: i + 1,
        name: rs.student.name,
        score: rs.total`);

fs.writeFileSync('src/pages/Gamification.tsx', code);
