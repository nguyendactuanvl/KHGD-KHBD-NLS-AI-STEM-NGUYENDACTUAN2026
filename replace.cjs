const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const target = `      const { lesson, requirement, digitalComp, aiComp, stem, grade, subject } = req.body;
    
      const prompt = \`Bạn là một giáo viên xuất sắc và chuyên gia giáo dục. Hãy soạn chi tiết một Kế hoạch bài dạy (Giáo án) môn \${subject || "chung"} theo chuẩn Công văn 5512/BGDĐT-GDTrH cho bài học: "\${lesson}" (Khối lớp \${grade}).

Dựa vào các dữ liệu bắt buộc sau từ Kế hoạch giáo dục:
- Yêu cầu cần đạt: \${requirement || "Không có yêu cầu đặc thù"}
- Năng lực số (theo CV 3456): \${digitalComp || "Không áp dụng"}
- Năng lực AI (theo QĐ 2422): \${aiComp || "Không áp dụng"}
- Tích hợp STEM/STEAM: \${stem || "Không áp dụng"}

Yêu cầu định dạng và nội dung (dùng cú pháp Markdown):
1. **Tuyệt đối KHÔNG sử dụng thẻ HTML \\\`<br>\\\` hoặc \\\`<br/>\\\`**: Hãy sử dụng dấu xuống dòng chuẩn của Markdown (Enter 2 lần) để ngắt đoạn.
2. **Tô màu Năng lực số (NLS) và Năng lực AI**: Khi nhắc đến phần mềm, công cụ thiết bị số, Năng lực số hoặc công cụ AI trong bài, BẮT BUỘC phải bọc trong thẻ HTML \\\`<mark style="background-color: #dbeafe; color: #1d4ed8; font-weight: bold; padding: 2px 4px; border-radius: 4px;">Tên phần mềm / NLS</mark>\\\` để tô màu xanh nổi bật.
3. **Toán học và công thức**: Bắt buộc sử dụng chuẩn LaTeX. Đặt công thức trên cùng 1 dòng trong cặp dấu \\\`$\\\` (ví dụ: $x^2 + y^2 = R^2$), hoặc trên 1 dòng riêng trong cặp dấu \\\`$$\\\` (ví dụ: \\\`$$\\int f(x)dx$$\\\`). Không dùng các ký tự Unicode mô phỏng công thức.
4. **Bảng biểu**: Sử dụng chuẩn bảng Markdown đẹp mắt (Markdown tables) để phân chia rõ ràng Mục tiêu, Nội dung, Sản phẩm, Tổ chức thực hiện.
6. **I. MỤC TIÊU**: Trình bày rõ ràng Kiến thức, Năng lực số, Năng lực AI, và Yêu cầu STEM. Các mã chỉ báo (như [3.1.NC1a]) phải được giữ nguyên và giải thích ngắn gọn cách đạt được trong bài.
7. **II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU**: Ghi rõ các thiết bị số, phần mềm, công cụ AI cần thiết.
8. **III. TIẾN TRÌNH DẠY HỌC**:
   Phải thiết kế theo 4 hoạt động chuẩn: 
   - Hoạt động 1: Xác định vấn đề / Nhiệm vụ học tập.
   - Hoạt động 2: Hình thành kiến thức mới.
   - Hoạt động 3: Luyện tập.
   - Hoạt động 4: Vận dụng.
   Mỗi hoạt động phải trình bày rõ ràng bằng BẢNG (Mục tiêu, Nội dung, Sản phẩm, Tổ chức thực hiện). Đặc biệt, lồng ghép khéo léo việc sử dụng phần mềm, kỹ năng số, hoặc ứng dụng AI vào phần "Tổ chức thực hiện".
   
Văn phong cần chuyên nghiệp, sư phạm, thực tế.\`;`;

const replacement = `      const { lesson, requirement, digitalComp, aiComp, stem, grade, subject, periods } = req.body;
    
      const prompt = \`Bạn là một giáo viên xuất sắc và chuyên gia giáo dục. Hãy soạn chi tiết một Kế hoạch bài dạy (Giáo án) môn \${subject || "chung"} theo chuẩn Công văn 5512/BGDĐT-GDTrH cho bài học: "\${lesson}" (Khối lớp \${grade}).

Dựa vào các dữ liệu bắt buộc sau từ Kế hoạch giáo dục:
- Số tiết: \${periods || "1"} tiết (Mỗi tiết chuẩn đúng 45 phút)
- Yêu cầu cần đạt: \${requirement || "Không có yêu cầu đặc thù"}
- Năng lực số (theo CV 3456): \${digitalComp || "Không áp dụng"}
- Năng lực AI (theo QĐ 2422): \${aiComp || "Không áp dụng"}
- Tích hợp STEM/STEAM: \${stem || "Không áp dụng"}

Yêu cầu định dạng và nội dung (dùng cú pháp Markdown):
1. **Phân chia tiết học**: BẮT BUỘC phải phân bổ rõ ràng tiến trình dạy học thành \${periods || "1"} tiết học. Mỗi tiết phải ghi rõ "Tiết 1: ... (45 phút)", "Tiết 2: ... (45 phút)", v.v... đảm bảo khối lượng nội dung và các hoạt động vừa vặn cho đúng 45 phút/tiết.
2. **Tuyệt đối KHÔNG sử dụng thẻ HTML \\\`<br>\\\` hoặc \\\`<br/>\\\`**: Hãy sử dụng dấu xuống dòng chuẩn của Markdown (Enter 2 lần) để ngắt đoạn.
3. **Tô màu Năng lực số (NLS) và Năng lực AI**: Khi nhắc đến phần mềm, công cụ thiết bị số, Năng lực số hoặc công cụ AI trong bài, BẮT BUỘC phải bọc trong thẻ HTML \\\`<mark style="background-color: #dbeafe; color: #1d4ed8; font-weight: bold; padding: 2px 4px; border-radius: 4px;">Tên phần mềm / NLS</mark>\\\` để tô màu xanh nổi bật.
4. **Toán học và công thức**: Bắt buộc sử dụng chuẩn LaTeX. Đặt công thức trên cùng 1 dòng trong cặp dấu \\\`$\\\` (ví dụ: $x^2 + y^2 = R^2$), hoặc trên 1 dòng riêng trong cặp dấu \\\`$$\\\` (ví dụ: \\\`$$\\int f(x)dx$$\\\`). Không dùng các ký tự Unicode mô phỏng công thức.
5. **Bảng biểu**: Sử dụng chuẩn bảng Markdown đẹp mắt (Markdown tables) để phân chia rõ ràng Mục tiêu, Nội dung, Sản phẩm, Tổ chức thực hiện.
6. **I. MỤC TIÊU**: Trình bày rõ ràng Kiến thức, Năng lực số, Năng lực AI, và Yêu cầu STEM. Các mã chỉ báo (như [3.1.NC1a]) phải được giữ nguyên và giải thích ngắn gọn cách đạt được trong bài.
7. **II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU**: Ghi rõ các thiết bị số, phần mềm, công cụ AI cần thiết.
8. **III. TIẾN TRÌNH DẠY HỌC**:
   Trình bày tiến trình giảng dạy rõ ràng theo từng tiết (Tiết 1, Tiết 2...). Phải thiết kế theo 4 hoạt động chuẩn: 
   - Hoạt động 1: Xác định vấn đề / Nhiệm vụ học tập.
   - Hoạt động 2: Hình thành kiến thức mới.
   - Hoạt động 3: Luyện tập.
   - Hoạt động 4: Vận dụng.
   Mỗi hoạt động phải trình bày rõ ràng bằng BẢNG (Mục tiêu, Nội dung, Sản phẩm, Tổ chức thực hiện). Đặc biệt, lồng ghép khéo léo việc sử dụng phần mềm, kỹ năng số, hoặc ứng dụng AI vào phần "Tổ chức thực hiện".
   
Văn phong cần chuyên nghiệp, sư phạm, thực tế.\`;`;

if(code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server.ts', code);
    console.log("Success");
} else {
    console.log("Target not found. Doing fuzzy replace...");
    // Let's just do regex replacement
    const regexTarget = /const \{ lesson, requirement, digitalComp, aiComp, stem, grade, subject \} = req\.body;\s*const prompt = `Bạn là một giáo viên xuất sắc.*?Văn phong cần chuyên nghiệp, sư phạm, thực tế.`;/s;
    if(regexTarget.test(code)) {
         code = code.replace(regexTarget, replacement);
         fs.writeFileSync('server.ts', code);
         console.log("Success with regex");
    } else {
         console.log("Regex also failed.");
    }
}
