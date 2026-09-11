const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const target1 = `    } catch (error: any) {
      console.error("AI Generation error:", error);
      const errorMsg = error?.message || "";
      if (errorMsg.includes("API_KEY_INVALID") || errorMsg.includes("API key not valid")) {
        return res.status(400).json({ error: "API Key không hợp lệ. Vui lòng kiểm tra lại Cài đặt hệ thống và đảm bảo API Key chính xác." });
      }
      if (errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("RESOURCE_EXHAUSTED") || error?.status === 429) {
        return res.status(429).json({ error: "API Key của bạn đã vượt quá giới hạn lượt dùng miễn phí (Quota exceeded). Vui lòng đợi khoảng 1 phút rồi thử lại, hoặc nâng cấp tài khoản." });
      }
      if (errorMsg.includes("503") || errorMsg.includes("high demand") || errorMsg.includes("overloaded") || error?.status === 503) {
        return res.status(503).json({ error: "Hệ thống AI của Google hiện đang quá tải (Server Overloaded). Vui lòng đợi 5-10 giây rồi bấm thử lại." });
      }
      res.status(500).json({ error: "Failed to generate plan" });
    }`;

const replacement1 = `    } catch (error: any) {
      return handleAiError(error, req, res);
    }`;

const target2 = `    } catch (error: any) {
      console.error("AI Generation error:", error);
      const errorMsg = error?.message || "";
      if (errorMsg.includes("API_KEY_INVALID") || errorMsg.includes("API key not valid")) {
        return res.status(400).json({ error: "API Key không hợp lệ. Vui lòng kiểm tra lại Cài đặt hệ thống và đảm bảo API Key chính xác." });
      }
      if (errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("RESOURCE_EXHAUSTED") || error?.status === 429) {
        return res.status(429).json({ error: "API Key của bạn đã vượt quá giới hạn lượt dùng miễn phí (Quota exceeded). Vui lòng đợi khoảng 1 phút rồi thử lại, hoặc nâng cấp tài khoản." });
      }
      if (errorMsg.includes("503") || errorMsg.includes("high demand") || errorMsg.includes("overloaded") || error?.status === 503) {
        return res.status(503).json({ error: "Hệ thống AI của Google hiện đang quá tải (Server Overloaded). Vui lòng đợi 5-10 giây rồi bấm thử lại." });
      }
      res.status(500).json({ error: "Failed to generate activities" });
    }`;

content = content.replace(target1, replacement1);
content = content.replace(target2, replacement1);
fs.writeFileSync('server.ts', content);
