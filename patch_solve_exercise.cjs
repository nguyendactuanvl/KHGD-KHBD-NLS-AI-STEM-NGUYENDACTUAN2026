const fs = require('fs');
const solveExPath = 'src/pages/SolveExercise.tsx';
if (fs.existsSync(solveExPath)) {
  let content = fs.readFileSync(solveExPath, 'utf8');
  const targetCatch = `    } catch (err: any) {
      console.error(err);
      setError(err.message || "Lỗi kết nối. Vui lòng thử lại sau.");
    } finally {`;

  const newCatch = `    } catch (err: any) {
      console.error(err);
      let errorMsg = err.message || "";
      if (errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("RESOURCE_EXHAUSTED")) {
        errorMsg = "Hệ thống đang quá tải hoặc tạm thời không khả dụng do nhu cầu cao. Vui lòng thử lại sau ít phút hoặc sử dụng API Key cá nhân.";
      } else if (errorMsg.includes('{"error":')) {
        try {
          const parsed = JSON.parse(errorMsg);
          errorMsg = parsed.error?.message || "Có lỗi xảy ra khi xử lý file";
        } catch {
          errorMsg = "Có lỗi xảy ra trong quá trình xử lý. Vui lòng thử lại.";
        }
      }
      setError(errorMsg || "Lỗi kết nối. Vui lòng thử lại sau.");
    } finally {`;
  if (content.includes(targetCatch)) {
    content = content.replace(targetCatch, newCatch);
    fs.writeFileSync(solveExPath, content);
    console.log('Patched SolveExercise UI');
  }
}
