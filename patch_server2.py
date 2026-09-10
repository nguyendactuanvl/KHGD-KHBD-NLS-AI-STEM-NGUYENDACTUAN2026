import re

with open("server.ts", "r") as f:
    code = f.read()

old_quota_handling = """      if (errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("RESOURCE_EXHAUSTED") || error?.status === 429) {
        return res.status(429).json({ error: "API Key của bạn đã vượt quá giới hạn lượt dùng miễn phí (Quota exceeded). Vui lòng đợi khoảng 1 phút rồi thử lại, hoặc nâng cấp tài khoản." });
      }"""

new_quota_handling = """      if (errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("RESOURCE_EXHAUSTED") || error?.status === 429) {
        if (!isCustomKey) {
            return res.status(429).json({ error: "Hệ thống AI hiện đang quá tải do có nhiều người sử dụng. Vui lòng vào Cài đặt hệ thống để điền API Key cá nhân của bạn để dùng riêng và không bị giới hạn." });
        }
        return res.status(429).json({ error: "API Key của bạn đã vượt quá giới hạn lượt dùng miễn phí (Quota exceeded). Vui lòng đợi khoảng 1 phút rồi thử lại, hoặc dùng API Key khác." });
      }"""

code = code.replace(old_quota_handling, new_quota_handling)

with open("server.ts", "w") as f:
    f.write(code)

print("patched server.ts")
