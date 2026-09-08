const fs = require('fs');
let code = fs.readFileSync('src/pages/ExamGenerator.tsx', 'utf8');

// We need to import fullPlan
if (!code.includes('import { fullPlan }')) {
  code = code.replace('import Markdown from', 'import { fullPlan } from "../data/mockData";\nimport Markdown from');
}

// Add state variables
const stateVars = `
  const [duration, setDuration] = useState(45);
  const [examType, setExamType] = useState("15p"); // 15p, mid, final
  const [qCounts, setQCounts] = useState({ mc: 20, tf: 0, sa: 0, essay: 0 });
  const [matrixFile, setMatrixFile] = useState<File | null>(null);
  const [matrixBase64, setMatrixBase64] = useState<string | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMatrixFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMatrixBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const availableTopics = subject.toLowerCase().includes("toán") ? fullPlan.filter(p => p.grade.toString() === grade).map(p => p.lesson) : [];
`;
code = code.replace('const [examName, setExamName] = useState("");', stateVars + '\n  const [examName, setExamName] = useState("");');

// Add types to Question interface
code = code.replace('interface Question {', 'interface Question {\n  type?: "mc" | "tf" | "sa" | "essay";\n  explanation?: string;');
code = code.replace('correctOptionIndex: number;', 'correctOptionIndex?: number;\n  correctAnswer?: string;');

// Update API call
const apiCallNew = `
      const response = await fetch("/api/generate-exam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-api-key": apiKey
        },
        body: JSON.stringify({ 
          subject, grade, duration, examType, matrix, customPrompt,
          qCounts,
          matrixFile: matrixBase64,
          selectedTopics
        })
      });
`;
code = code.replace(/const response = await fetch\("\/api\/generate-exam", \{[\s\S]*?\}\);/, apiCallNew);

fs.writeFileSync('src/pages/ExamGenerator.tsx', code);
console.log('Exam UI updated');
