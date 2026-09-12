const fs = require('fs');

const pdfToWordPath = 'src/pages/PdfToWord.tsx';
let content = fs.readFileSync(pdfToWordPath, 'utf8');

const targetCatch = `    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi kết nối. Vui lòng thử lại sau.');
    } finally {`;

const newCatch = `    } catch (err: any) {
      console.error(err);
      const errorMsg = err.message || '';
      if (errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("RESOURCE_EXHAUSTED")) {
        setError("Hệ thống đang quá tải hoặc tạm thời không khả dụng do nhu cầu cao. Vui lòng thử lại sau ít phút hoặc sử dụng API Key cá nhân.");
      } else if (errorMsg.includes('{"error":')) {
        try {
          const parsed = JSON.parse(errorMsg);
          setError(parsed.error?.message || "Có lỗi xảy ra khi xử lý file");
        } catch {
          setError("Có lỗi xảy ra trong quá trình số hóa tài liệu. Vui lòng thử lại.");
        }
      } else {
        setError(errorMsg || 'Lỗi kết nối. Vui lòng thử lại sau.');
      }
    } finally {`;

if (content.includes(targetCatch)) {
  content = content.replace(targetCatch, newCatch);
  fs.writeFileSync(pdfToWordPath, content);
  console.log('Patched src/pages/PdfToWord.tsx');
} else {
  console.log('Could not patch src/pages/PdfToWord.tsx');
}

