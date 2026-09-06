const fs = require('fs');

const filePath = 'src/pages/EducationalPlan.tsx';
let code = fs.readFileSync(filePath, 'utf-8');

// Add useRef import if not present
if (!code.includes("useRef")) {
  code = code.replace("useState", "useState, useRef");
}

// Add exportRef to component
if (!code.includes("const exportRef = useRef")) {
  code = code.replace("const [isGenerating, setIsGenerating] = useState(false);", "const [isGenerating, setIsGenerating] = useState(false);\n  const exportRef = useRef<HTMLDivElement>(null);");
}

// Attach exportRef to the table container
code = code.replace('<div className="overflow-x-auto">', '<div className="overflow-x-auto" ref={exportRef}>');

fs.writeFileSync(filePath, code);
