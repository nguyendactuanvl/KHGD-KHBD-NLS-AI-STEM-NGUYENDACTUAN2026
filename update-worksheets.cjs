const fs = require('fs');
let code = fs.readFileSync('src/pages/Worksheets.tsx', 'utf-8');

// 1. Import pptxgenjs
if (!code.includes('import pptxgen from "pptxgenjs";')) {
    code = code.replace('import { cn } from "../lib/utils";', 'import { cn } from "../lib/utils";\nimport pptxgen from "pptxgenjs";\nimport { Presentation } from "lucide-react";');
}

// 2. Fix Word export CSS
code = code.replace('.katex-mathml { display: none; } /* Hide MathML from Word export */', '.katex-html { display: none; }\n          .katex-mathml { display: block; font-family: "Cambria Math", serif; }');
code = code.replace("<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>", "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns:m='http://schemas.openxmlformats.org/officeDocument/2006/math' xmlns='http://www.w3.org/TR/REC-html40'>");

// 3. Add handleExportPPTX
const pptxFunc = `
  const handleExportPPTX = async () => {
    if (!suggestion) return;
    
    setIsLoading(true);
    try {
      const pres = new pptxgen();
      
      // Basic markdown parsing for PPT
      const sections = suggestion.split(/\\n(?=##? )/g);
      
      // Cover slide
      const coverSlide = pres.addSlide();
      coverSlide.addText(customLessonName, { x: 1, y: 2, w: 8, h: 1, fontSize: 36, bold: true, align: 'center', color: '059669' });
      coverSlide.addText("Môn: " + subject + " - Lớp " + selectedGrade, { x: 1, y: 3, w: 8, h: 1, fontSize: 24, align: 'center', color: '475569' });
      
      // Content slides
      for (const section of sections) {
        if (!section.trim()) continue;
        
        const lines = section.split('\\n');
        let title = "";
        let bullets = [];
        let currentText = "";
        
        for (const line of lines) {
          if (line.startsWith('#')) {
            if (currentText) bullets.push(currentText);
            currentText = "";
            title = line.replace(/^#+\\s*/, '').replace(/\\*\\*/g, '');
          } else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            if (currentText) bullets.push(currentText);
            currentText = line.replace(/^[\\-\\*]\\s*/, '').replace(/\\*\\*/g, '');
          } else if (line.trim()) {
            // Remove markdown table syntax and asterisks for simple text
            let cleanLine = line.replace(/\\*\\*/g, '').replace(/\\|/g, '').trim();
            if (cleanLine && !cleanLine.startsWith(':---')) {
               currentText += (currentText ? "\\n" : "") + cleanLine;
            }
          }
        }
        if (currentText) bullets.push(currentText);
        
        // Chunk bullets if too many
        const chunkSize = 5;
        for (let i = 0; i < bullets.length; i += chunkSize) {
            const slideBullets = bullets.slice(i, i + chunkSize);
            const slide = pres.addSlide();
            
            // Clean math syntax for PPTX since it doesn't render latex natively easily this way
            const cleanTitle = title.replace(/\\$/g, '');
            slide.addText(cleanTitle || "Nội dung", { x: 0.5, y: 0.5, w: 9, h: 0.8, fontSize: 28, bold: true, color: '0f172a' });
            
            const bulletItems = slideBullets.map(b => ({
              text: b.replace(/\\$[^\\$]+\\$/g, '(Công thức)').substring(0, 300) + (b.length > 300 ? '...' : ''), 
              options: { bullet: true, fontSize: 18, color: '334155' }
            }));
            
            if (bulletItems.length > 0) {
              slide.addText(bulletItems, { x: 0.5, y: 1.5, w: 9, h: 3.5, valign: 'top' });
            }
        }
      }
      
      await pres.writeFile({ fileName: \`BaiGiang_\${customLessonName.replace(/\\s+/g, '_')}.pptx\` });
    } catch (error) {
      console.error("Export PPTX error", error);
      alert("Có lỗi xảy ra khi xuất file PowerPoint");
    } finally {
      setIsLoading(false);
    }
  };
`;

if (!code.includes('handleExportPPTX')) {
    code = code.replace('const handleExportWord = () => {', pptxFunc + '\n  const handleExportWord = () => {');
}

// 4. Add PPTX button
const pptxButton = `
                <button
                  onClick={handleExportPPTX}
                  className={cn(
                    "px-4 py-2 text-white font-medium rounded-lg flex items-center gap-2 shadow-sm transition-colors",
                    isEditing ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  )}
                  title={isEditing ? "Chuyển sang chế độ xem trước để tải xuống" : ""}
                >
                  <Presentation className="w-4 h-4" /> Xuất PPTX
                </button>
`;

if (!code.includes('Xuất PPTX')) {
    code = code.replace('<Download className="w-4 h-4" /> Xuất Word\n                </button>', '<Download className="w-4 h-4" /> Xuất Word\n                </button>' + pptxButton);
}

fs.writeFileSync('src/pages/Worksheets.tsx', code);
console.log("Updated Worksheets.tsx");
