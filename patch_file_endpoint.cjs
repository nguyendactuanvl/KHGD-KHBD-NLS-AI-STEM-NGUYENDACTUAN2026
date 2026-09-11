const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const target = `    } catch (error: any) {
      console.error("AI File Generation error:", error);
      const errorMsg = error?.message || "";
      if (errorMsg.includes("API_KEY_INVALID") || errorMsg.includes("API key not valid")) {
        return res.status(400).json({ error: "API Key không hợp lệ. Vui lòng kiểm tra lại Cài đặt hệ thống và đảm bảo API Key chính xác." });
      }
      if (errorMsg.includes("Unsupported MIME type")) {
        return res.status(400).json({ error: "Định dạng file không được AI hỗ trợ. Vui lòng chuyển file sang định dạng PDF và thử lại." });
      }
      if (errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("RESOURCE_EXHAUSTED") || error?.status === 429) {
        return res.status(429).json({ error: "API Key của bạn đã vượt quá giới hạn lượt dùng miễn phí (Quota exceeded). Vui lòng đợi khoảng 1 phút rồi thử lại, hoặc nâng cấp tài khoản." });
      }
      if (errorMsg.includes("503") || errorMsg.includes("high demand") || errorMsg.includes("overloaded") || error?.status === 503) {
        return res.status(503).json({ error: "Hệ thống AI của Google hiện đang quá tải (Server Overloaded). Vui lòng đợi 5-10 giây rồi bấm thử lại." });
      }
      res.status(500).json({ error: "Failed to generate lesson plan from file" });
    }`;

const replacement = `    } catch (error: any) {
      const errorMsg = error?.message || "";
      if (errorMsg.includes("Unsupported MIME type")) {
        return res.status(400).json({ error: "Định dạng file không được AI hỗ trợ. Vui lòng chuyển file sang định dạng PDF và thử lại." });
      }
      return handleAiError(error, req, res);
    }`;

content = content.replace(target, replacement);
fs.writeFileSync('server.ts', content);
