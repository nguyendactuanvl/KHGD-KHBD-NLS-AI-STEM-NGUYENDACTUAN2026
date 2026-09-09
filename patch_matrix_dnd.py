import re

with open("src/pages/ExamGenerator.tsx", "r") as f:
    code = f.read()

# 1. Add useEffect to imports
code = code.replace('import { useState, useRef } from "react";', 'import { useState, useRef, useEffect } from "react";')

# 2. Add state hooks
state_code = """
  const [examName, setExamName] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [matrixStructure, setMatrixStructure] = useState<{topic: string, subtopics: string[]}[]>([]);
  const [draggedTopicIdx, setDraggedTopicIdx] = useState<number | null>(null);
  const [draggedSubtopic, setDraggedSubtopic] = useState<{tIdx: number, sIdx: number} | null>(null);

  useEffect(() => {
     const structure: {topic: string, subtopics: string[]}[] = [];
     const topics = Array.from(new Set(questions.map(q => q.topic || 'Chung')));
     for (const t of topics) {
         const subs = Array.from(new Set(questions.filter(q => (q.topic || 'Chung') === t).map(q => q.subtopic || 'Chung')));
         structure.push({ topic: t, subtopics: subs });
     }
     setMatrixStructure(structure);
  }, [questions]);
"""
code = code.replace('  const [examName, setExamName] = useState("");\n  const [questions, setQuestions] = useState<Question[]>([]);', state_code.strip())

# 3. Replace the Tbody of matrix
matrix_body_old_pattern = r'<tbody>\s*\{Array\.from\(new Set\(questions\.map.*?Dòng TỔNG CỘNG.*?\}\)\(\)\}?\s*<\/tbody>'

matrix_body_new = """
                              {matrixStructure.map((topicObj, tIdx) => {
                                 const topic = topicObj.topic;
                                 const topicQs = questions.filter(q => (q.topic || 'Chung') === topic);
                                 
                                 return (
                                   <tbody 
                                      key={`topic-${tIdx}`}
                                      draggable
                                      onDragStart={(e) => { 
                                          setDraggedTopicIdx(tIdx); 
                                      }}
                                      onDragOver={(e) => { 
                                          e.preventDefault(); 
                                      }}
                                      onDrop={(e) => {
                                         if (draggedTopicIdx !== null && draggedTopicIdx !== tIdx) {
                                             const newStruct = [...matrixStructure];
                                             const [moved] = newStruct.splice(draggedTopicIdx, 1);
                                             newStruct.splice(tIdx, 0, moved);
                                             setMatrixStructure(newStruct);
                                         }
                                         setDraggedTopicIdx(null);
                                      }}
                                      onDragEnd={() => setDraggedTopicIdx(null)}
                                      className={draggedTopicIdx === tIdx ? 'opacity-30 bg-slate-100' : 'hover:bg-slate-50 transition-colors'}
                                      title="💡 Kéo thả mảng chủ đề này để đổi vị trí"
                                   >
                                     {topicObj.subtopics.map((sub, sIdx) => {
                                        const subQs = topicQs.filter(q => (q.subtopic || 'Chung') === sub);
                                        
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
                                          <tr 
                                            key={`sub-${tIdx}-${sIdx}`}
                                            draggable
                                            onDragStart={(e) => { 
                                                e.stopPropagation(); 
                                                setDraggedSubtopic({ tIdx, sIdx }); 
                                            }}
                                            onDragOver={(e) => { 
                                                e.preventDefault(); 
                                                e.stopPropagation(); 
                                            }}
                                            onDrop={(e) => {
                                                e.stopPropagation();
                                                if (draggedSubtopic && draggedSubtopic.tIdx === tIdx && draggedSubtopic.sIdx !== sIdx) {
                                                    const newStruct = [...matrixStructure];
                                                    const subs = [...newStruct[tIdx].subtopics];
                                                    const [moved] = subs.splice(draggedSubtopic.sIdx, 1);
                                                    subs.splice(sIdx, 0, moved);
                                                    newStruct[tIdx].subtopics = subs;
                                                    setMatrixStructure(newStruct);
                                                }
                                                setDraggedSubtopic(null);
                                            }}
                                            onDragEnd={(e) => { 
                                                e.stopPropagation(); 
                                                setDraggedSubtopic(null); 
                                            }}
                                            className={draggedSubtopic?.tIdx === tIdx && draggedSubtopic?.sIdx === sIdx ? 'opacity-30 bg-blue-100' : 'cursor-move'}
                                            title="💡 Kéo thả hàng này để đổi vị trí nội dung kiến thức"
                                          >
                                            {sIdx === 0 && <td className="border border-black p-1 text-center" rowSpan={topicObj.subtopics.length}>{tIdx + 1}</td>}
                                            {sIdx === 0 && <td className="border border-black p-1" rowSpan={topicObj.subtopics.length}>{topic}</td>}
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
                                     })}
                                   </tbody>
                                 );
                              })}
                              
                              {/* Dòng TỔNG CỘNG */}
                              <tbody className="no-drag">
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
"""

code = re.sub(matrix_body_old_pattern, matrix_body_new, code, flags=re.DOTALL)

# Insert the tip text above the matrix table
matrix_header_old = """<h2 className="text-xl font-bold text-center flex-1">MA TRẬN ĐỀ KIỂM TRA</h2>"""
matrix_header_new = """<div className="flex-1 text-center">
                          <h2 className="text-xl font-bold">MA TRẬN ĐỀ KIỂM TRA</h2>
                          <p className="text-sm text-slate-500 font-normal no-print italic mt-1">💡 Mẹo: Bấm giữ và kéo thả các hàng (chủ đề hoặc nội dung) để sắp xếp lại thứ tự</p>
                        </div>"""

code = code.replace(matrix_header_old, matrix_header_new)

with open("src/pages/ExamGenerator.tsx", "w") as f:
    f.write(code)

print("patched matrix dnd")
