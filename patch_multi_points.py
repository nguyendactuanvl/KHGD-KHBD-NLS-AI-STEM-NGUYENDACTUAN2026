import re

with open('src/pages/ExamGenerator.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

multi_point_component = """
const MultiPointInput = ({ count, value, onChange, disabled }: { count: number, value: string, onChange: (val: string) => void, disabled: boolean }) => {
  const points = value.split(',').map(s => s.trim()).filter(s => s !== '');
  if (points.length === 0) points.push("1");
  
  // Create an array of length `count`
  const currentPoints = [];
  for (let i = 0; i < count; i++) {
    currentPoints.push(points[i] !== undefined ? points[i] : (points[points.length - 1] || "1"));
  }

  if (count > 0 && count <= 6) {
    return (
      <div className="flex flex-wrap gap-1 justify-center">
        {currentPoints.map((pt, i) => (
          <input 
            key={i}
            type="text"
            className="w-10 text-center border border-slate-300 rounded py-1 text-xs focus:ring-1 focus:ring-blue-500"
            value={pt}
            disabled={disabled}
            onChange={e => {
              const newPoints = [...currentPoints];
              newPoints[i] = e.target.value;
              onChange(newPoints.join(', '));
            }}
            title={`Điểm câu ${i+1}`}
          />
        ))}
      </div>
    );
  }

  return (
    <input type="text" value={value} onChange={e=>onChange(e.target.value)} disabled={disabled} className="w-full text-center border border-slate-300 rounded py-1.5 text-sm" placeholder="VD: 0.5 hoặc 0.75, 1.0" title="Nhập điểm số (vd: 0.5) hoặc chuỗi (vd: 0.75, 1.0) cho các câu hỏi" />
  );
};
"""

# Insert component at top level
content = content.replace("export function ExamGenerator() {", multi_point_component + "\nexport function ExamGenerator() {")

# Replace inputs
content = content.replace(
    '<input type="text" value={qPoints.sa} onChange={e=>setQPoints({...qPoints, sa: e.target.value})} disabled={!qEnabled.sa} className="w-full text-center border border-slate-300 rounded py-1.5 text-sm" placeholder="VD: 0.5 hoặc 0.75, 1.0" title="Nhập điểm số (vd: 0.5) hoặc chuỗi (vd: 0.75, 1.0) cho các câu hỏi" />',
    '<MultiPointInput count={qCounts.sa} value={qPoints.sa} onChange={(val) => setQPoints({...qPoints, sa: val})} disabled={!qEnabled.sa} />'
)

content = content.replace(
    '<input type="text" value={qPoints.essay} onChange={e=>setQPoints({...qPoints, essay: e.target.value})} disabled={!qEnabled.essay} className="w-full text-center border border-slate-300 rounded py-1.5 text-sm" placeholder="VD: 2 hoặc 1.5, 3" title="Nhập điểm số (vd: 2) hoặc chuỗi (vd: 1.5, 3.0) cho các câu hỏi" />',
    '<MultiPointInput count={qCounts.essay} value={qPoints.essay} onChange={(val) => setQPoints({...qPoints, essay: val})} disabled={!qEnabled.essay} />'
)

# Modify subject input to a datalist for Ngữ Văn and apply Ngữ Văn preset
# First add Ngữ Văn preset function
ngu_van_preset = """
  const applyPresetNguVan = () => {
    setQEnabled({ mc: false, tf: false, sa: true, essay: true });
    setQCounts({ mc: 0, tf: 0, sa: 4, essay: 2 });
    setQPoints({ mc: "0.25", tf: "0.5", sa: "0.75", essay: "2, 5" });
    setSubject("Ngữ Văn");
  };
"""

content = content.replace("const applyPreset4Phan = () => {", ngu_van_preset + "\n  const applyPreset4Phan = () => {")

# Add button for Ngữ Văn
preset_buttons = """<button onClick={applyPresetBGD3Phan} className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-md text-sm hover:bg-blue-100 transition-colors">Chuẩn BGD 3 phần (12 TN, 4 ĐS, 6 TLN)</button>
                     <button onClick={applyPreset4Phan} className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-md text-sm hover:bg-emerald-100 transition-colors">Đề 4 phần (có Tự luận)</button>
                     <button onClick={applyPresetNguVan} className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-md text-sm hover:bg-amber-100 transition-colors">Đề Ngữ Văn (Đọc hiểu & Làm văn)</button>"""

content = re.sub(
    r'<button onClick=\{applyPresetBGD3Phan\}.*?</button>\s*<button onClick=\{applyPreset4Phan\}.*?</button>',
    preset_buttons,
    content,
    flags=re.DOTALL
)

# And if subject === "Ngữ Văn", change the text of SA and Essay
content = content.replace('<span className="font-medium text-sm text-slate-700">Trả lời ngắn</span>', 
                          '<span className="font-medium text-sm text-slate-700">{subject.toLowerCase().includes("văn") ? "Đọc hiểu (Trả lời ngắn)" : "Trả lời ngắn"}</span>')

content = content.replace('<span className="font-medium text-sm text-slate-700">Tự luận</span>',
                          '<span className="font-medium text-sm text-slate-700">{subject.toLowerCase().includes("văn") ? "Làm văn (Tự luận)" : "Tự luận"}</span>')


with open('src/pages/ExamGenerator.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

