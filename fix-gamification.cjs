const fs = require('fs');
let code = fs.readFileSync('src/pages/Gamification.tsx', 'utf8');
if (code.includes('import { MessageSquare, X, Send, MessageSquare, X, Send, Trophy')) {
   code = code.replace('import { MessageSquare, X, Send, MessageSquare, X, Send, Trophy', 'import { MessageSquare, X, Send, Trophy');
   fs.writeFileSync('src/pages/Gamification.tsx', code);
}
