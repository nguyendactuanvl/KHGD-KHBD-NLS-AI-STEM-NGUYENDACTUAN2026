const fs = require('fs');

const lessonPlanPath = 'src/pages/LessonPlan.tsx';
let content = fs.readFileSync(lessonPlanPath, 'utf8');

const targetCatch = `    } catch (err: any) {
      console.error(err);
      setError(err.message || "Không thể soạn giáo án lúc này. Vui lòng thử lại sau.");
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
          errorMsg = "Có lỗi xảy ra trong quá trình tạo tài liệu. Vui lòng thử lại.";
        }
      }
      setError(errorMsg || "Không thể soạn giáo án lúc này. Vui lòng thử lại sau.");
    } finally {`;

if (content.includes(targetCatch)) {
  content = content.replace(targetCatch, newCatch);
  fs.writeFileSync(lessonPlanPath, content);
  console.log('Patched src/pages/LessonPlan.tsx');
} else {
  console.log('Could not patch src/pages/LessonPlan.tsx');
}
