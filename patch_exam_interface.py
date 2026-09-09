import re

with open("src/pages/ExamGenerator.tsx", "r") as f:
    code = f.read()

replacement = """interface Question {
  type?: "mc" | "tf" | "sa" | "essay";
  explanation?: string;
  id: number;
  content: string;
  options: string[];
  correctOptionIndex?: number;
  correctAnswer?: string;
  level: string;
  topic?: string;
  subtopic?: string;
}

interface MatrixConfig {
  id: string;
  name: string;
  schoolLevel: string;
  subject: string;
  grade: string;
  duration: number;
  examType: string;
  numCodes: number;
  qCounts: any;
  qPoints: any;
  qEnabled: any;
  levels: any;
  outputConfig: any;
  matrix: string;
  customPrompt: string;
  timestamp: number;
}
"""

code = re.sub(r'interface Question \{[\s\S]*?level: string;\s*\}', replacement.strip(), code)

with open("src/pages/ExamGenerator.tsx", "w") as f:
    f.write(code)

print("patched interface")
