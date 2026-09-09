import re

with open("src/pages/HomeroomManagement.tsx", "r") as f:
    code = f.read()

# 1. Add Book button
button_code = """
              <div className="flex gap-2">
                <button onClick={() => {
                   const preHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
                   <head><meta charset='utf-8'><title>So Chu Nhiem</title>
                   <style>
                    body { font-family: "Times New Roman", Times, serif; font-size: 14pt; }
                    .center { text-align: center; }
                    .bold { font-weight: bold; }
                    table { border-collapse: collapse; width: 100%; margin-top: 10px; margin-bottom: 20px;}
                    th, td { border: 1px solid black; padding: 6px; }
                    th { font-weight: bold; text-align: center; }
                    .page-break { page-break-before: always; }
                    .title { font-size: 24pt; font-weight: bold; text-align: center; margin-top: 50px; margin-bottom: 50px; }
                   </style></head><body>`;
                   
                   let content = `<div class="center bold" style="font-size: 16pt;">SỞ GIÁO DỤC VÀ ĐÀO TẠO .......</div>`;
                   content += `<div class="center bold" style="font-size: 16pt; margin-bottom: 80px;">TRƯỜNG ......................................</div>`;
                   content += `<div class="title">SỔ CHỦ NHIỆM<br/>CẤP TRUNG HỌC PHỔ THÔNG</div>`;
                   content += `<div style="margin-left: 50px; font-size: 16pt; line-height: 2;">`;
                   content += `Họ tên GVCN: ..............................................................<br/>`;
                   content += `Lớp: ............................................................................<br/>`;
                   content += `Năm học: 2026 - 2027<br/>`;
                   content += `</div>`;
                   
                   content += `<div class="page-break"></div>`;
                   content += `<div class="bold center" style="font-size: 16pt;">PHẦN I: NHỮNG VĂN BẢN QUY ĐỊNH NHIỆM VỤ<br/>HỌC SINH VÀ GIÁO VIÊN</div>`;
                   content += `<p><i>(Căn cứ Thông tư 15/2026/TT-BGDĐT ban hành Điều lệ trường học và Thông tư 22/2021/TT-BGDĐT về đánh giá học sinh THPT)</i></p>`;
                   content += `<p class="bold">1. Nhiệm vụ và quyền của học sinh (Theo Điều 32, 33 TT 15/2026/TT-BGDĐT)</p>`;
                   content += `<ul><li>Thực hiện nhiệm vụ học tập, rèn luyện theo chương trình, kế hoạch giáo dục của nhà trường.</li><li>Được tôn trọng và bảo vệ, được đối xử bình đẳng, dân chủ...</li></ul>`;
                   content += `<p class="bold">2. Quy định Đánh giá xếp loại (Theo TT 22/2021/TT-BGDĐT)</p>`;
                   content += `<ul><li>Đánh giá bằng nhận xét kết hợp điểm số.</li><li>Đánh giá thường xuyên và đánh giá định kì.</li></ul>`;
                   
                   content += `<div class="page-break"></div>`;
                   content += `<div class="bold center" style="font-size: 16pt;">PHẦN II: DANH SÁCH HỌC SINH LỚP</div>`;
                   content += `<table><thead><tr><th>STT</th><th>Họ và tên</th><th>Ngày sinh</th><th>Điện thoại</th></tr></thead><tbody>`;
                   students.forEach((st, idx) => {
                       content += `<tr><td class="center">${idx + 1}</td><td>${st.name}</td><td></td><td></td></tr>`;
                   });
                   content += `</tbody></table>`;
                   
                   content += `<div class="page-break"></div>`;
                   content += `<div class="bold center" style="font-size: 16pt;">PHẦN III: KẾ HOẠCH CHỦ NHIỆM CẢ NĂM HỌC 2026-2027</div>`;
                   content += `<p><b>I. Đặc điểm tình hình lớp:</b></p><p>Thuận lợi: .............................................................</p><p>Khó khăn: .............................................................</p>`;
                   content += `<p><b>II. Chỉ tiêu phấn đấu:</b></p><p>Hạnh kiểm: 100% Khá, Tốt</p><p>Học lực: ...% Giỏi, ...% Khá</p>`;
                   content += `<p><b>III. Kế hoạch hàng tháng (Tháng 8 đến Tháng 5):</b></p><p>(Giáo viên tự điền chi tiết nội dung sinh hoạt theo chủ điểm từng tháng)</p>`;

                   const postHtml = "</body></html>";
                   const blob = new Blob(['\\ufeff', preHtml + content + postHtml], { type: 'application/msword' });
                   const url = URL.createObjectURL(blob);
                   const link = document.createElement('a');
                   link.href = url;
                   link.download = 'So_Chu_Nhiem_THPT_2026_2027.doc';
                   document.body.appendChild(link);
                   link.click();
                   document.body.removeChild(link);
                }} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white border border-indigo-700 rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors shadow-sm mb-3">
                  <FileText className="w-4 h-4" /> Xuất Sổ Chủ Nhiệm (Cả năm)
                </button>
              </div>
"""

target_header = """      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab("list")}
          className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "list" ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Danh sách & Chức vụ
        </button>
        <button 
          onClick={() => setActiveTab("competition")}
          className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "competition" ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Quy định & Thi đua
        </button>
      </div>"""

replacement_header = """      <div className="flex justify-between items-end border-b border-slate-200 mb-6">
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab("list")}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "list" ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Danh sách & Chức vụ
          </button>
          <button 
            onClick={() => setActiveTab("competition")}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "competition" ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Quy định & Thi đua
          </button>
        </div>
        """ + button_code + """
      </div>"""

code = code.replace(target_header, replacement_header)

with open("src/pages/HomeroomManagement.tsx", "w") as f:
    f.write(code)

print("patched homeroom export v2")
