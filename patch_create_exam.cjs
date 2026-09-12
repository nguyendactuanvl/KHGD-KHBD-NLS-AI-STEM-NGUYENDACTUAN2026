const fs = require('fs');
const createExamPath = 'src/pages/CreateExam.tsx';
if (fs.existsSync(createExamPath)) {
  let content = fs.readFileSync(createExamPath, 'utf8');
  const targetCatch = `    } catch (err: any) {
      setError(err.message || "Không thể tạo đề lúc này. Vui lòng thử lại sau.");
    } finally {`;

  const newCatch = `    } catch (err: any) {
      let errorMsg = err.message || "";
      if (errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("RESOURCE_EXHAUSTED")) {
        errorMsg = "Hệ thống đang quá tải hoặc tạm thời không khả dụng do nhu cầu cao. Vui lòng thử lại sau ít phút hoặc sử dụng API Key cá nhân.";
      } else if (errorMsg.includes('{"error":')) {
        try {
          const parsed = JSON.parse(errorMsg);
          errorMsg = parsed.error?.message || "Có lỗi xảy ra khi tạo đề";
        } catch {
          errorMsg = "Có lỗi xảy ra trong quá trình tạo đề. Vui lòng thử lại.";
        }
      }
      setError(errorMsg || "Không thể tạo đề lúc này. Vui lòng thử lại sau.");
    } finally {`;
  if (content.includes(targetCatch)) {
    content = content.replace(targetCatch, newCatch);
    fs.writeFileSync(createExamPath, content);
    console.log('Patched CreateExam UI');
  }
}
