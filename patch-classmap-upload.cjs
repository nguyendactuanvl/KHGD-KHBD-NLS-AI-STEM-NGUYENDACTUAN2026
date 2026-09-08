const fs = require('fs');
let code = fs.readFileSync('src/pages/ClassMap.tsx', 'utf8');

// Add Upload icon
code = code.replace('import { Shuffle, Printer, Settings2, Users } from "lucide-react";', 'import { Shuffle, Printer, Settings2, Users, Upload } from "lucide-react";');

const uploadFunc = `
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\\r?\\n/).map(l => {
        // If CSV, take the first column if it's not a number, or try to find the name column.
        // For simplicity, just split by comma and take the longest string or just the whole line if no comma
        if (l.includes(',')) {
          const parts = l.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
          // Take the second column if the first is a number (STT)
          if (!isNaN(Number(parts[0])) && parts.length > 1) {
            return parts[1];
          }
          return parts[0];
        }
        return l.trim();
      }).filter(l => l && isNaN(Number(l)));
      
      let names = lines;
      if (names.length > 0 && (names[0].toLowerCase().includes('tên') || names[0].toLowerCase().includes('name') || names[0].toLowerCase().includes('stt'))) {
          names = names.slice(1);
      }

      if (names.length === 0) {
        alert("Không tìm thấy dữ liệu hợp lệ trong file.");
        return;
      }

      const newStudents = names.map((name, i) => ({
        id: \`hs_\${Date.now()}_\${i}\`,
        name: name,
        role: "",
        isFixed: false
      }));

      setStudents(newStudents);
      localStorage.setItem("homeroom_students", JSON.stringify(newStudents));
      
      // Auto assign to seats sequentially
      const newSeats = [];
      let studentIdx = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          newSeats.push({
            row: r,
            col: c,
            studentId: studentIdx < newStudents.length ? newStudents[studentIdx++].id : null
          });
        }
      }
      setSeats(newSeats);
      
      // Reset input
      e.target.value = '';
    };
    reader.readAsText(file);
  };
`;

code = code.replace('const generateMap = () => {', uploadFunc + '\n  const generateMap = () => {');

const uploadBtn = `
          <label className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors shadow-sm cursor-pointer">
            <Upload className="w-4 h-4" />
            <span className="font-medium">Tải DS (CSV/TXT)</span>
            <input type="file" className="hidden" accept=".csv,.txt" onChange={handleFileUpload} />
          </label>
`;

code = code.replace('<button onClick={generateMap}', uploadBtn + '\n          <button onClick={generateMap}');

fs.writeFileSync('src/pages/ClassMap.tsx', code);
console.log('ClassMap patched for upload');
