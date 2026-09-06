const fs = require('fs');

const filePath = 'src/App.tsx';
let code = fs.readFileSync(filePath, 'utf-8');

if (!code.includes('ExerciseSolver')) {
    // Import
    const importPos = code.lastIndexOf("import ");
    const newlinePos = code.indexOf('\n', importPos);
    code = code.substring(0, newlinePos + 1) + "import { ExerciseSolver } from './pages/ExerciseSolver';\n" + code.substring(newlinePos + 1);
    
    // Add tab button
    const tabsTarget = `<button
            onClick={() => setActiveTab('history')}
            className={\`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors relative \${
              activeTab === 'history' ? 'text-emerald-600' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
            }\`}
          >
            <History className="w-4 h-4" /> Lịch sử
            {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600" />}
          </button>`;
          
    const newTab = `<button
            onClick={() => setActiveTab('exercise')}
            className={\`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors relative \${
              activeTab === 'exercise' ? 'text-emerald-600' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
            }\`}
          >
            <Sparkles className="w-4 h-4" /> Giải bài tập
            {activeTab === 'exercise' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600" />}
          </button>`;
          
    code = code.replace(tabsTarget, tabsTarget + '\n          ' + newTab);
    
    // Add tab content
    const contentTarget = `{activeTab === 'history' && <HistoryPage />}`;
    const newContent = `{activeTab === 'history' && <HistoryPage />}
        {activeTab === 'exercise' && <ExerciseSolver />}`;
        
    code = code.replace(contentTarget, newContent);
    
    // update type
    code = code.replace(`const [activeTab, setActiveTab] = useState<'lesson' | 'worksheet' | 'plan' | 'history'>('lesson');`, `const [activeTab, setActiveTab] = useState<'lesson' | 'worksheet' | 'plan' | 'history' | 'exercise'>('lesson');`);
    
    fs.writeFileSync(filePath, code);
    console.log("Updated App.tsx");
}
