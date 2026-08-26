import React, { useState, useRef } from "react";
import { KHGDRow } from "../types";
import { fullPlan } from "../data/mockData";
import { Download, Upload, Sparkles, Plus, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";

export function EducationalPlan() {
  const [plans, setPlans] = useState<KHGDRow[]>(fullPlan);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
       alert(`Đã tải lên và phân tích thành công file: ${e.target.files[0].name}. Giả lập AI: Hệ thống đã nhận diện đầy đủ dữ liệu của Khối 10, Khối 11, Khối 12.`);
       setPlans(fullPlan); 
    }
  };

  const handleExportWord = () => {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title><style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid black; padding: 8px; text-align: left; vertical-align: top; white-space: pre-wrap; }</style></head><body>";
    const footer = "</body></html>";
    
    let tableHTML = "<table><thead><tr><th>STT</th><th>Bài học</th><th>Số tiết/bài</th><th>Yêu cầu cần đạt</th><th>Năng lực số (Bổ sung)</th><th>Năng lực AI (Bổ sung)</th><th>Giáo dục STEM/STEAM (Bổ sung)</th><th>Ghi chú</th></tr></thead><tbody>";
    
    const grades = Array.from(new Set(plans.map(p => p.grade || 10))).sort((a, b) => Number(a) - Number(b));
    
    grades.forEach(grade => {
      tableHTML += `<tr><td colspan="8" style="font-weight: bold; font-size: 16px; text-transform: uppercase; background-color: #f1f5f9; text-align: center;">Khối ${grade}</td></tr>`;
      plans.filter(p => p.grade === grade).forEach(plan => {
        tableHTML += `<tr>
          <td style="text-align: center;">${plan.stt}</td>
          <td>${plan.lesson}</td>
          <td style="text-align: center;">${plan.periods}</td>
          <td>${plan.requirement}</td>
          <td style="color: #1d4ed8;">${plan.digitalComp}</td>
          <td style="color: #7e22ce;">${plan.aiComp}</td>
          <td style="color: #047857;">${plan.stem}</td>
          <td>${plan.note}</td>
        </tr>`;
      });
    });
    
    tableHTML += "</tbody></table>";

    const html = header + "<h2 style='text-align: center;'>KẾ HOẠCH GIÁO DỤC CỦA TỔ CHUYÊN MÔN</h2><p style='text-align: center;'>Năm học 2026-2027</p>" + tableHTML + footer;
    
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'KeHoachGiaoDuc_2026_2027.doc';
    link.click();
  };

  const generateAIPlan = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: "Toán",
          grade: "10",
          topic: "Đại số tổ hợp"
        }),
      });
      
      const data = await response.json();
      if (data && data.length > 0) {
        const newPlans = data.map((item: any, index: number) => ({
          id: Date.now().toString() + index,
          grade: 10,
          stt: plans.length + index + 1,
          lesson: item.lesson,
          periods: item.periods,
          requirement: item.requirement,
          digitalComp: item.digitalComp,
          aiComp: item.aiComp,
          stem: item.stem,
          note: item.note
        }));
        setPlans([...plans, ...newPlans]);
      }
    } catch (error) {
      console.error("Lỗi khi tạo KHGD:", error);
      alert("Có lỗi xảy ra khi kết nối AI.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateField = (id: string, field: keyof KHGDRow, value: string | number) => {
    setPlans(plans.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      <div className="bg-white px-8 py-6 border-b border-slate-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Kế hoạch giáo dục</h2>
            <p className="text-slate-500 mt-1">Cập nhật theo Công văn 5512 và QĐ 2422 (Năm học 2026-2027)</p>
          </div>
          
          <div className="flex items-center gap-3">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden" 
              accept=".docx,.xlsx,.xls"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Upload className="h-4 w-4" />
              Tải lên KHGD
            </button>
            <button 
              onClick={handleExportWord}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Xuất Word
            </button>
            <button 
              onClick={generateAIPlan}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-70"
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              AI Bổ sung NLS/AI
            </button>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            {/* We keep a hidden simplified version of the table just for export, or we can use the same */}
            <div id="khgd-table-export">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="text-xs text-slate-700 bg-slate-100 uppercase">
                  <tr>
                    <th className="px-4 py-3 border border-slate-200 w-12 text-center">STT</th>
                    <th className="px-4 py-3 border border-slate-200 min-w-[200px]">Bài học</th>
                    <th className="px-4 py-3 border border-slate-200 w-24 text-center">Số tiết/bài</th>
                    <th className="px-4 py-3 border border-slate-200 min-w-[250px]">Yêu cầu cần đạt</th>
                    <th className="px-4 py-3 border border-slate-200 min-w-[200px] text-blue-700">Năng lực số (Bổ sung)</th>
                    <th className="px-4 py-3 border border-slate-200 min-w-[200px] text-purple-700">Năng lực AI (Bổ sung)</th>
                    <th className="px-4 py-3 border border-slate-200 min-w-[150px] text-emerald-700">Giáo dục STEM/STEAM (Bổ sung)</th>
                    <th className="px-4 py-3 border border-slate-200 w-32">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from(new Set(plans.map(p => p.grade || 10))).sort((a, b) => Number(a) - Number(b)).map(grade => (
                    <React.Fragment key={grade}>
                      <tr className="bg-slate-200/80">
                        <td colSpan={8} className="px-4 py-3 font-bold text-lg text-slate-800 uppercase border border-slate-300">
                          Khối {grade}
                        </td>
                      </tr>
                      {plans.filter(p => p.grade === grade).map((plan) => (
                        <tr key={plan.id} className="bg-white hover:bg-slate-50 transition-colors group">
                          <td className="px-4 py-3 border border-slate-200 text-center">{plan.stt}</td>
                          <td className="border border-slate-200 p-0">
                            <textarea 
                              className="w-full h-full min-h-[80px] p-4 resize-none border-none outline-none bg-transparent"
                              value={plan.lesson}
                              onChange={(e) => handleUpdateField(plan.id, 'lesson', e.target.value)}
                            />
                          </td>
                          <td className="border border-slate-200 p-0">
                            <input 
                              type="number"
                              className="w-full h-full p-4 text-center border-none outline-none bg-transparent"
                              value={plan.periods}
                              onChange={(e) => handleUpdateField(plan.id, 'periods', parseInt(e.target.value) || 0)}
                            />
                          </td>
                          <td className="border border-slate-200 p-0">
                            <textarea 
                              className="w-full h-full min-h-[80px] p-4 resize-none border-none outline-none bg-transparent"
                              value={plan.requirement}
                              onChange={(e) => handleUpdateField(plan.id, 'requirement', e.target.value)}
                            />
                          </td>
                          <td className="border border-slate-200 p-0 bg-blue-50/30">
                            <textarea 
                              className="w-full h-full min-h-[80px] p-4 resize-none border-none outline-none bg-transparent text-blue-800"
                              value={plan.digitalComp}
                              onChange={(e) => handleUpdateField(plan.id, 'digitalComp', e.target.value)}
                              placeholder="[Mã NLS]..."
                            />
                          </td>
                          <td className="border border-slate-200 p-0 bg-purple-50/30">
                            <textarea 
                              className="w-full h-full min-h-[80px] p-4 resize-none border-none outline-none bg-transparent text-purple-800"
                              value={plan.aiComp}
                              onChange={(e) => handleUpdateField(plan.id, 'aiComp', e.target.value)}
                              placeholder="[Mã NLAI]..."
                            />
                          </td>
                          <td className="border border-slate-200 p-0 bg-emerald-50/30">
                            <textarea 
                              className="w-full h-full min-h-[80px] p-4 resize-none border-none outline-none bg-transparent text-emerald-800"
                              value={plan.stem}
                              onChange={(e) => handleUpdateField(plan.id, 'stem', e.target.value)}
                              placeholder="Dự án STEM..."
                            />
                          </td>
                          <td className="border border-slate-200 p-0">
                            <textarea 
                              className="w-full h-full min-h-[80px] p-4 resize-none border-none outline-none bg-transparent"
                              value={plan.note}
                              onChange={(e) => handleUpdateField(plan.id, 'note', e.target.value)}
                            />
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="p-4 bg-slate-50 border-t border-slate-200">
            <button 
              onClick={() => {
                setPlans([...plans, {
                  id: Date.now().toString(),
                  grade: 10,
                  stt: plans.length + 1,
                  lesson: "",
                  periods: 1,
                  requirement: "",
                  digitalComp: "",
                  aiComp: "",
                  stem: "",
                  note: ""
                }]);
              }}
              className="flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              <Plus className="h-4 w-4" />
              Thêm bài học mới
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
