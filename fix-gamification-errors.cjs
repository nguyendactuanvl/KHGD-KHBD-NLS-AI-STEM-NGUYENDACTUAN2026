const fs = require('fs');
let code = fs.readFileSync('src/pages/Gamification.tsx', 'utf8');

// 1. Fix duplicate imports
code = code.replace('import { MessageSquare, X, Send, Trophy, Star, MinusCircle, Play, Users, Medal, Crown, Filter, History, Loader2, Upload, Plus, Trash2, Edit2, FolderOpen, MessageSquare, X, Send } from "lucide-react";', 
'import { Trophy, Star, MinusCircle, Play, Users, Medal, Crown, Filter, History, Loader2, Upload, Plus, Trash2, Edit2, FolderOpen, MessageSquare, X, Send } from "lucide-react";');

// 2. Fix getRankedStudents to use rankedStudents which is already a computed value or getFilteredScores
// Wait, I need to know what rankedStudents is in Gamification.tsx
fs.writeFileSync('src/pages/Gamification.tsx', code);
