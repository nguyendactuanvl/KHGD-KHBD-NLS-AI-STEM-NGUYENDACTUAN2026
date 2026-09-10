import re

with open("server.ts", "r") as f:
    code = f.read()

# We need to replace all instances of:
#      if (errorMsg.includes("UNAUTHENTICATED") || errorMsg.includes("service account is deleted") || error?.status === 401) {
#        return res.status(400).json({ error: "Tài khoản dịch vụ liên kết với API Key này đã bị vô hiệu hóa hoặc bị xóa. Vui lòng tạo API Key mới." });
#      }
#      if (errorMsg.includes("suspended") || errorMsg.includes("PERMISSION_DENIED") || error?.status === 403) {
#        return res.status(400).json({ error: "API Key của bạn đã bị khóa (Suspended) bởi Google. Vui lòng vào Cài đặt đổi API Key khác." });
#      }

new_auth_handling = """
      const isCustomKey = !!req.headers['x-gemini-api-key'];
      if (errorMsg.includes("UNAUTHENTICATED") || errorMsg.includes("service account is deleted") || error?.status === 401) {
        if (!isCustomKey) {
            return res.status(400).json({ error: "Hệ thống AI hiện đang quá tải hoặc bảo trì. Để tiếp tục sử dụng ngay lập tức mà không bị gián đoạn, bạn hãy nhấp vào mục Cài đặt hệ thống (ở góc trái bên dưới) và nhập API Key cá nhân của mình nhé." });
        }
        return res.status(400).json({ error: "Tài khoản dịch vụ liên kết với API Key cá nhân của bạn đã bị xóa. Vui lòng tạo API Key mới." });
      }
      if (errorMsg.includes("suspended") || errorMsg.includes("PERMISSION_DENIED") || error?.status === 403) {
        if (!isCustomKey) {
            return res.status(400).json({ error: "Hệ thống AI hiện đang quá tải hoặc bảo trì. Để tiếp tục sử dụng ngay lập tức mà không bị gián đoạn, bạn hãy nhấp vào mục Cài đặt hệ thống (ở góc trái bên dưới) và nhập API Key cá nhân của mình nhé." });
        }
        return res.status(400).json({ error: "API Key cá nhân của bạn đã bị khóa bởi Google. Vui lòng vào Cài đặt đổi API Key khác." });
      }
"""

code = re.sub(
    r'if\s*\([^)]*UNAUTHENTICATED[^}]+\}\s*if\s*\([^)]*suspended[^}]+\}',
    new_auth_handling.strip(),
    code,
    flags=re.MULTILINE | re.DOTALL
)

with open("server.ts", "w") as f:
    f.write(code)

print("Patched server.ts")
