const fs = require('fs');
let code = fs.readFileSync('src/pages/ExamGenerator.tsx', 'utf8');

const originalRenderOld = `
                        <p className="font-medium text-slate-800 mb-3"><span className="font-bold">Câu {idx + 1}:</span> <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} className="inline-markdown">{q.content}</Markdown> <span className="text-xs text-emerald-600 font-normal ml-2">[{q.level}]</span></p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-4">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className={\`p-2 rounded-md border \${oIdx === q.correctOptionIndex ? 'bg-emerald-50 border-emerald-200 font-medium' : 'border-transparent'}\`}>
                              {String.fromCharCode(65 + oIdx)}. <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} className="inline-markdown">{opt}</Markdown>
                            </div>
                          ))}
                        </div>
`;

const originalRenderNew = `
                        <p className="font-medium text-slate-800 mb-3"><span className="font-bold">Câu {idx + 1}:</span> <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} className="inline-markdown">{q.content}</Markdown> <span className="text-xs text-emerald-600 font-normal ml-2">[{q.level}]</span></p>
                        
                        {q.type === 'mc' && q.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-4">
                            {q.options.map((opt, oIdx) => (
                              <div key={oIdx} className={\`p-2 rounded-md border \${oIdx === q.correctOptionIndex ? 'bg-emerald-50 border-emerald-200 font-medium' : 'border-transparent'}\`}>
                                {String.fromCharCode(65 + oIdx)}. <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} className="inline-markdown">{opt}</Markdown>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {q.type !== 'mc' && q.correctAnswer && (
                          <div className="mt-2 pl-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                            <span className="font-semibold text-emerald-800">Đáp án:</span> <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} className="inline-markdown">{q.correctAnswer}</Markdown>
                          </div>
                        )}
`;

code = code.replace(originalRenderOld.trim(), originalRenderNew.trim());

const printRenderOld = `
                                <div><strong>Câu {idx + 1}:</strong> <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} className="inline-markdown">{q.content}</Markdown></div>
                                <div className="options" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', marginTop: '5px'}}>
                                  {q.options.map((opt, oIdx) => (
                                    <div key={oIdx} className="option" style={{paddingLeft: '10px'}}>
                                      {String.fromCharCode(65 + oIdx)}. <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} className="inline-markdown">{opt}</Markdown>
                                    </div>
                                  ))}
                                </div>
`;

const printRenderNew = `
                                <div><strong>Câu {idx + 1}:</strong> <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} className="inline-markdown">{q.content}</Markdown></div>
                                {q.type === 'mc' && q.options && (
                                  <div className="options" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', marginTop: '5px'}}>
                                    {q.options.map((opt, oIdx) => (
                                      <div key={oIdx} className="option" style={{paddingLeft: '10px'}}>
                                        {String.fromCharCode(65 + oIdx)}. <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} className="inline-markdown">{opt}</Markdown>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {q.type !== 'mc' && (
                                  <div style={{marginTop: '15px', marginBottom: '30px'}}>
                                    <em>(Học sinh làm bài vào giấy thi)</em>
                                  </div>
                                )}
`;

code = code.replace(printRenderOld.trim(), printRenderNew.trim());

const printAnswerOld = `
                            <div className="answers-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', marginTop: '10px', gap: '5px'}}>
                              {exam.questions.map((q, idx) => (
                                <div key={idx}><strong>{idx + 1}.</strong> {String.fromCharCode(65 + q.correctOptionIndex)}</div>
                              ))}
                            </div>
`;

const printAnswerNew = `
                            <div className="answers-grid" style={{display: 'flex', flexWrap: 'wrap', marginTop: '10px', gap: '15px'}}>
                              {exam.questions.map((q, idx) => (
                                <div key={idx} style={{minWidth: '60px'}}>
                                  <strong>{idx + 1}.</strong> {q.type === 'mc' ? String.fromCharCode(65 + (q.correctOptionIndex || 0)) : <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} className="inline-markdown">{q.correctAnswer || ''}</Markdown>}
                                </div>
                              ))}
                            </div>
`;
code = code.replace(printAnswerOld.trim(), printAnswerNew.trim());

fs.writeFileSync('src/pages/ExamGenerator.tsx', code);
console.log('Exam question rendering patched');
