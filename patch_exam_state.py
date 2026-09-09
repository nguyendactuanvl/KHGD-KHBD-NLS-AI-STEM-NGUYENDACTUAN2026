import re

with open("src/pages/ExamGenerator.tsx", "r") as f:
    code = f.read()

replacement = """  const [outputConfig, setOutputConfig] = useState({ answers: true, matrix: true, spec: true, shuffleQuestions: true, shuffleOptions: true, detailedSolution: true });
  
  const [savedConfigs, setSavedConfigs] = useState<MatrixConfig[]>(() => {
    try {
      const saved = localStorage.getItem('matrix_configs');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const saveCurrentConfig = () => {
    const name = prompt("Nhập tên để lưu cấu hình ma trận này (ví dụ: Giữa kì 1 Toán 9):");
    if (!name) return;
    const newConfig: MatrixConfig = {
      id: Date.now().toString(),
      name,
      schoolLevel, subject, grade, duration, examType, numCodes,
      qCounts, qPoints, qEnabled, levels, outputConfig, matrix, customPrompt,
      timestamp: Date.now()
    };
    const updated = [...savedConfigs, newConfig];
    setSavedConfigs(updated);
    localStorage.setItem('matrix_configs', JSON.stringify(updated));
    alert("Đã lưu cấu hình ma trận!");
  };

  const loadConfig = (id: string) => {
    if (!id) return;
    const conf = savedConfigs.find(c => c.id === id);
    if (conf) {
      setSchoolLevel(conf.schoolLevel);
      setSubject(conf.subject);
      setGrade(conf.grade);
      setDuration(conf.duration);
      setExamType(conf.examType);
      setNumCodes(conf.numCodes);
      setQCounts(conf.qCounts);
      setQPoints(conf.qPoints);
      setQEnabled(conf.qEnabled);
      setLevels(conf.levels);
      setOutputConfig(conf.outputConfig);
      setMatrix(conf.matrix);
      setCustomPrompt(conf.customPrompt);
    }
  };

  const deleteConfig = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa cấu hình này?")) {
      const updated = savedConfigs.filter(c => c.id !== id);
      setSavedConfigs(updated);
      localStorage.setItem('matrix_configs', JSON.stringify(updated));
    }
  };
"""

code = code.replace("  const [outputConfig, setOutputConfig] = useState({ answers: true, matrix: true, spec: true, shuffleQuestions: true, shuffleOptions: true, detailedSolution: true });", replacement)

with open("src/pages/ExamGenerator.tsx", "w") as f:
    f.write(code)

print("patched state")
