import re

with open("src/pages/ExamGenerator.tsx", "r") as f:
    code = f.read()

matrix_render_code = """
                  {/* MA TRẬN */}
                  {outputConfig.matrix && (
                    <div className="border border-slate-200 rounded-lg p-6 space-y-6 bg-white overflow-x-auto printable-matrix" id="matrix-container">
                      <div className="flex justify-between items-center mb-4 no-print">
                        <h2 className="text-xl font-bold text-center flex-1">MA TRẬN ĐỀ KIỂM TRA</h2>
                        <div className="flex gap-2">
                            <button onClick={() => {
                                const html = document.getElementById('matrix-table-wrap')?.innerHTML;
                                if (!html) return;
                                const preHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Ma Tran</title><style>table { border-collapse: collapse; width: 100%; font-family: "Times New Roman", Times, serif; font-size: 11pt; } th, td { border: 1px solid black; padding: 4px; text-align: center; } th { font-weight: bold; }</style></head><body><div style="text-align: center; font-weight: bold; font-size: 14pt; margin-bottom: 20px;">MA TRẬN ĐỀ KIỂM TRA ĐỊNH KÌ</div>`;
                                const postHtml = "</body></html>";
                                const blob = new Blob(['\\ufeff', preHtml + html + postHtml], { type: 'application/msword' });
                                const url = URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = 'Ma_Tran_De_Kiem_Tra.doc';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }} className="px-3 py-1.5 bg-blue-50 text-blue-600 font-medium rounded hover:bg-blue-100 flex items-center gap-2 text-sm border border-blue-200 no-print">
                              Xuất Word
                            </button>
                            <button onClick={() => window.print()} className="px-3 py-1.5 bg-slate-50 text-slate-600 font-medium rounded hover:bg-slate-200 flex items-center gap-2 text-sm border border-slate-300 no-print">
                              <Printer className="w-4 h-4" /> In PDF
                            </button>
                        </div>
                      </div>
                      <div id="matrix-table-wrap">
                          <table className="w-full border-collapse border border-black text-[13px] min-w-[1000px] font-serif text-black" style={{fontFamily: '"Times New Roman", Times, serif'}}>
                            <thead>
                              <tr>
                                <th className="border border-black p-1 text-center font-bold" rowSpan={4}>TT</th>
                                <th className="border border-black p-1 text-center font-bold" rowSpan={4}>Chủ đề/Chương</th>
                                <th className="border border-black p-1 text-center font-bold" rowSpan={4}>Nội dung/đơn vị kiến thức</th>
                                <th className="border border-black p-1 text-center font-bold" colSpan={16}>Mức độ đánh giá</th>
                                <th className="border border-black p-1 text-center font-bold" colSpan={4} rowSpan={3}>Tổng</th>
                                <th className="border border-black p-1 text-center font-bold" rowSpan={4}>Tỉ lệ %<br/>điểm</th>
                              </tr>
                              <tr>
                                <th className="border border-black p-1 text-center font-bold" colSpan={8}>TNKQ</th>
                                <th className="border border-black p-1 text-center font-bold" colSpan={4} rowSpan={2}>Trả lời ngắn</th>
                                <th className="border border-black p-1 text-center font-bold" colSpan={4} rowSpan={2}>Tự luận</th>
                              </tr>
                              <tr>
                                <th className="border border-black p-1 text-center font-bold" colSpan={4}>Nhiều lựa chọn</th>
                                <th className="border border-black p-1 text-center font-bold" colSpan={4}>"Đúng - Sai"</th>
                              </tr>
                              <tr>
                                {Array.from({length: 4}).map((_, i) => (
                                    <td key={`sub-${i}`} className="p-0 border-0">
                                      <table className="w-full h-full border-collapse"><tbody><tr>
                                        <th className="border-r border-black p-1 text-center font-bold w-1/4">Biết</th>
                                        <th className="border-r border-black p-1 text-center font-bold w-1/4">Hiểu</th>
                                        <th className="border-r border-black p-1 text-center font-bold w-1/4">VD</th>
                                        <th className="border-0 p-1 text-center font-bold w-1/4">VDC</th>
                                      </tr></tbody></table>
                                    </td>
                                ))}
                                <th className="border border-black p-1 text-center font-bold">Biết</th>
                                <th className="border border-black p-1 text-center font-bold">Hiểu</th>
                                <th className="border border-black p-1 text-center font-bold">VD</th>
                                <th className="border border-black p-1 text-center font-bold">VDC</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Array.from(new Set(questions.map(q => q.topic))).map((topic, tIdx) => {
                                 const topicQs = questions.filter(q => q.topic === topic);
                                 const subtopics = Array.from(new Set(topicQs.map(q => q.subtopic)));
                                 
                                 return subtopics.map((sub, sIdx) => {
                                    const subQs = topicQs.filter(q => q.subtopic === sub);
                                    
                                    const getLevelCount = (type: string, lvl: string) => {
                                        return subQs.filter(q => {
                                            if (q.type !== type) return false;
                                            const l = (q.level || '').toLowerCase();
                                            if (lvl === 'nb') return l.includes('biết');
                                            if (lvl === 'th') return l.includes('hiểu');
                                            if (lvl === 'vdc') return l.includes('cao');
                                            if (lvl === 'vd') return l.includes('dụng') && !l.includes('cao');
                                            return false;
                                        }).length;
                                    };

                                    const rowData = {
                                        mc: { nb: getLevelCount('mc','nb'), th: getLevelCount('mc','th'), vd: getLevelCount('mc','vd'), vdc: getLevelCount('mc','vdc') },
                                        tf: { nb: getLevelCount('tf','nb'), th: getLevelCount('tf','th'), vd: getLevelCount('tf','vd'), vdc: getLevelCount('tf','vdc') },
                                        sa: { nb: getLevelCount('sa','nb'), th: getLevelCount('sa','th'), vd: getLevelCount('sa','vd'), vdc: getLevelCount('sa','vdc') },
                                        es: { nb: getLevelCount('essay','nb'), th: getLevelCount('essay','th'), vd: getLevelCount('essay','vd'), vdc: getLevelCount('essay','vdc') }
                                    };
                                    
                                    const totalNB = rowData.mc.nb + rowData.tf.nb + rowData.sa.nb + rowData.es.nb;
                                    const totalTH = rowData.mc.th + rowData.tf.th + rowData.sa.th + rowData.es.th;
                                    const totalVD = rowData.mc.vd + rowData.tf.vd + rowData.sa.vd + rowData.es.vd;
                                    const totalVDC = rowData.mc.vdc + rowData.tf.vdc + rowData.sa.vdc + rowData.es.vdc;
                                    
                                    const rowPoints = 
                                        (rowData.mc.nb + rowData.mc.th + rowData.mc.vd + rowData.mc.vdc) * qPoints.mc +
                                        (rowData.tf.nb + rowData.tf.th + rowData.tf.vd + rowData.tf.vdc) * qPoints.tf +
                                        (rowData.sa.nb + rowData.sa.th + rowData.sa.vd + rowData.sa.vdc) * qPoints.sa +
                                        (rowData.es.nb + rowData.es.th + rowData.es.vd + rowData.es.vdc) * qPoints.essay;
                                    const rowPercent = totalPointsCalc > 0 ? Math.round((rowPoints / totalPointsCalc) * 100) : 0;

                                    return (
                                      <tr key={`${tIdx}-${sIdx}`}>
                                        {sIdx === 0 && <td className="border border-black p-1 text-center" rowSpan={subtopics.length}>{tIdx + 1}</td>}
                                        {sIdx === 0 && <td className="border border-black p-1" rowSpan={subtopics.length}>{topic}</td>}
                                        <td className="border border-black p-1">{sub}</td>
                                        
                                        {/* Nhiều lựa chọn */}
                                        <td className="border border-black p-1 text-center">{rowData.mc.nb || ''}</td>
                                        <td className="border border-black p-1 text-center">{rowData.mc.th || ''}</td>
                                        <td className="border border-black p-1 text-center">{rowData.mc.vd || ''}</td>
                                        <td className="border border-black p-1 text-center">{rowData.mc.vdc || ''}</td>
                                        
                                        {/* Đúng sai */}
                                        <td className="border border-black p-1 text-center">{rowData.tf.nb || ''}</td>
                                        <td className="border border-black p-1 text-center">{rowData.tf.th || ''}</td>
                                        <td className="border border-black p-1 text-center">{rowData.tf.vd || ''}</td>
                                        <td className="border border-black p-1 text-center">{rowData.tf.vdc || ''}</td>
                                        
                                        {/* Trả lời ngắn */}
                                        <td className="border border-black p-1 text-center">{rowData.sa.nb || ''}</td>
                                        <td className="border border-black p-1 text-center">{rowData.sa.th || ''}</td>
                                        <td className="border border-black p-1 text-center">{rowData.sa.vd || ''}</td>
                                        <td className="border border-black p-1 text-center">{rowData.sa.vdc || ''}</td>
                                        
                                        {/* Tự luận */}
                                        <td className="border border-black p-1 text-center">{rowData.es.nb || ''}</td>
                                        <td className="border border-black p-1 text-center">{rowData.es.th || ''}</td>
                                        <td className="border border-black p-1 text-center">{rowData.es.vd || ''}</td>
                                        <td className="border border-black p-1 text-center">{rowData.es.vdc || ''}</td>
                                        
                                        {/* Tổng */}
                                        <td className="border border-black p-1 text-center font-bold">{totalNB || ''}</td>
                                        <td className="border border-black p-1 text-center font-bold">{totalTH || ''}</td>
                                        <td className="border border-black p-1 text-center font-bold">{totalVD || ''}</td>
                                        <td className="border border-black p-1 text-center font-bold">{totalVDC || ''}</td>
                                        
                                        <td className="border border-black p-1 text-center">{rowPercent > 0 ? rowPercent + '%' : ''}</td>
                                      </tr>
                                    );
                                 });
                              })}
                              
                              {/* Dòng TỔNG CỘNG */}
                              {(() => {
                                  const getGlobalCount = (type: string, lvl: string) => {
                                        return questions.filter(q => {
                                            if (q.type !== type) return false;
                                            const l = (q.level || '').toLowerCase();
                                            if (lvl === 'nb') return l.includes('biết');
                                            if (lvl === 'th') return l.includes('hiểu');
                                            if (lvl === 'vdc') return l.includes('cao');
                                            if (lvl === 'vd') return l.includes('dụng') && !l.includes('cao');
                                            return false;
                                        }).length;
                                  };
                                  const totals = {
                                      mc: { nb: getGlobalCount('mc','nb'), th: getGlobalCount('mc','th'), vd: getGlobalCount('mc','vd'), vdc: getGlobalCount('mc','vdc') },
                                      tf: { nb: getGlobalCount('tf','nb'), th: getGlobalCount('tf','th'), vd: getGlobalCount('tf','vd'), vdc: getGlobalCount('tf','vdc') },
                                      sa: { nb: getGlobalCount('sa','nb'), th: getGlobalCount('sa','th'), vd: getGlobalCount('sa','vd'), vdc: getGlobalCount('sa','vdc') },
                                      es: { nb: getGlobalCount('essay','nb'), th: getGlobalCount('essay','th'), vd: getGlobalCount('essay','vd'), vdc: getGlobalCount('essay','vdc') }
                                  };
                                  const gNB = totals.mc.nb + totals.tf.nb + totals.sa.nb + totals.es.nb;
                                  const gTH = totals.mc.th + totals.tf.th + totals.sa.th + totals.es.th;
                                  const gVD = totals.mc.vd + totals.tf.vd + totals.sa.vd + totals.es.vd;
                                  const gVDC = totals.mc.vdc + totals.tf.vdc + totals.sa.vdc + totals.es.vdc;
                                  
                                  const pts = {
                                      mc: totals.mc.nb*qPoints.mc + totals.mc.th*qPoints.mc + totals.mc.vd*qPoints.mc + totals.mc.vdc*qPoints.mc,
                                      tf: totals.tf.nb*qPoints.tf + totals.tf.th*qPoints.tf + totals.tf.vd*qPoints.tf + totals.tf.vdc*qPoints.tf,
                                      sa: totals.sa.nb*qPoints.sa + totals.sa.th*qPoints.sa + totals.sa.vd*qPoints.sa + totals.sa.vdc*qPoints.sa,
                                      es: totals.es.nb*qPoints.essay + totals.es.th*qPoints.essay + totals.es.vd*qPoints.essay + totals.es.vdc*qPoints.essay
                                  };
                                  const globalTotalPts = pts.mc + pts.tf + pts.sa + pts.es;
                                  
                                  return (
                                    <>
                                        <tr className="font-bold bg-slate-50">
                                            <td className="border border-black p-1 text-center" colSpan={3}>Tổng số câu</td>
                                            <td className="border border-black p-1 text-center">{totals.mc.nb || ''}</td>
                                            <td className="border border-black p-1 text-center">{totals.mc.th || ''}</td>
                                            <td className="border border-black p-1 text-center">{totals.mc.vd || ''}</td>
                                            <td className="border border-black p-1 text-center">{totals.mc.vdc || ''}</td>
                                            
                                            <td className="border border-black p-1 text-center">{totals.tf.nb || ''}</td>
                                            <td className="border border-black p-1 text-center">{totals.tf.th || ''}</td>
                                            <td className="border border-black p-1 text-center">{totals.tf.vd || ''}</td>
                                            <td className="border border-black p-1 text-center">{totals.tf.vdc || ''}</td>
                                            
                                            <td className="border border-black p-1 text-center">{totals.sa.nb || ''}</td>
                                            <td className="border border-black p-1 text-center">{totals.sa.th || ''}</td>
                                            <td className="border border-black p-1 text-center">{totals.sa.vd || ''}</td>
                                            <td className="border border-black p-1 text-center">{totals.sa.vdc || ''}</td>
                                            
                                            <td className="border border-black p-1 text-center">{totals.es.nb || ''}</td>
                                            <td className="border border-black p-1 text-center">{totals.es.th || ''}</td>
                                            <td className="border border-black p-1 text-center">{totals.es.vd || ''}</td>
                                            <td className="border border-black p-1 text-center">{totals.es.vdc || ''}</td>
                                            
                                            <td className="border border-black p-1 text-center">{gNB || ''}</td>
                                            <td className="border border-black p-1 text-center">{gTH || ''}</td>
                                            <td className="border border-black p-1 text-center">{gVD || ''}</td>
                                            <td className="border border-black p-1 text-center">{gVDC || ''}</td>
                                            <td className="border border-black p-1 text-center">{gNB+gTH+gVD+gVDC}</td>
                                        </tr>
                                        <tr className="font-bold bg-slate-50">
                                            <td className="border border-black p-1 text-center" colSpan={3}>Tổng số điểm</td>
                                            <td className="border border-black p-1 text-center" colSpan={4}>{pts.mc > 0 ? pts.mc : ''}</td>
                                            <td className="border border-black p-1 text-center" colSpan={4}>{pts.tf > 0 ? pts.tf : ''}</td>
                                            <td className="border border-black p-1 text-center" colSpan={4}>{pts.sa > 0 ? pts.sa : ''}</td>
                                            <td className="border border-black p-1 text-center" colSpan={4}>{pts.es > 0 ? pts.es : ''}</td>
                                            <td className="border border-black p-1 text-center" colSpan={4}>{globalTotalPts > 0 ? globalTotalPts : ''}</td>
                                            <td className="border border-black p-1 text-center">10.0</td>
                                        </tr>
                                        <tr className="font-bold bg-slate-50">
                                            <td className="border border-black p-1 text-center" colSpan={3}>Tỉ lệ %</td>
                                            <td className="border border-black p-1 text-center" colSpan={4}>{globalTotalPts > 0 ? Math.round(pts.mc/globalTotalPts*100) + '%' : ''}</td>
                                            <td className="border border-black p-1 text-center" colSpan={4}>{globalTotalPts > 0 ? Math.round(pts.tf/globalTotalPts*100) + '%' : ''}</td>
                                            <td className="border border-black p-1 text-center" colSpan={4}>{globalTotalPts > 0 ? Math.round(pts.sa/globalTotalPts*100) + '%' : ''}</td>
                                            <td className="border border-black p-1 text-center" colSpan={4}>{globalTotalPts > 0 ? Math.round(pts.es/globalTotalPts*100) + '%' : ''}</td>
                                            <td className="border border-black p-1 text-center" colSpan={5}>100%</td>
                                        </tr>
                                    </>
                                  );
                              })()}
                            </tbody>
                          </table>
                      </div>
                    </div>
                  )}"""

# Replace the old matrix block
pattern = r'\{\/\*\s*MA TRẬN\s*\*\/\}.*?(?=<div className="border border-slate-200 rounded-lg p-6 space-y-6 bg-white" id="original-exam">)'
parts = re.split(pattern, code, flags=re.DOTALL)
if len(parts) == 2:
    code = parts[0] + matrix_render_code + "\n\n                  " + parts[1]

# Let's fix the print styles in index.html as well using python
with open("index.html", "r") as f:
    index_code = f.read()

print_styles = """
    <style>
      @media print {
        body * {
          visibility: hidden;
        }
        .printable-matrix, .printable-matrix * {
          visibility: visible;
        }
        .printable-matrix {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          border: none !important;
          box-shadow: none !important;
          background: white !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        /* Override app wrappers to prevent clipping */
        html, body, #root, .h-screen, .overflow-hidden, .overflow-y-auto {
          height: auto !important;
          min-height: auto !important;
          overflow: visible !important;
          position: static !important;
          background: white !important;
        }
        .no-print {
          display: none !important;
        }
      }
    </style>
"""
index_code = re.sub(r'<style>[\s\S]*?<\/style>', print_styles.strip(), index_code)

with open("index.html", "w") as f:
    f.write(index_code)

with open("src/pages/ExamGenerator.tsx", "w") as f:
    f.write(code)

print("patched matrix v2 and index.html")
