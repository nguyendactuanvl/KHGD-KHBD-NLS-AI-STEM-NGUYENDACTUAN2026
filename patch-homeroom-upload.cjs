const fs = require('fs');
let code = fs.readFileSync('src/pages/HomeroomManagement.tsx', 'utf8');

const uploadFunc = `
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\\r?\\n/).map(l => {
        if (l.includes(',')) {
          const parts = l.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
          if (!isNaN(Number(parts[0])) && parts.length > 1) return parts[1];
          return parts[0];
        }
        return l.trim();
      }).filter(l => l && isNaN(Number(l)));
      
      let names = lines;
      if (names.length > 0 && (names[0].toLowerCase().includes('tên') || names[0].toLowerCase().includes('name') || names[0].toLowerCase().includes('stt'))) {
          names = names.slice(1);
      }

      if (names.length === 0) return;

      const newStudents = names.map((name, i) => ({
        id: \`hs_\${Date.now()}_\${i}\`,
        name: name,
        role: "",
        isFixed: false
      }));

      saveStudents(newStudents);
      e.target.value = '';
    };
    reader.readAsText(file);
  };
`;

code = code.replace(/const handleFileUpload = \(e: React.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?\};/, uploadFunc.trim());

// Update accept to .csv,.txt
code = code.replace('accept=".csv,.xlsx"', 'accept=".csv,.txt"');

fs.writeFileSync('src/pages/HomeroomManagement.tsx', code);
console.log('Homeroom patched for upload');
