import re

with open('server.ts', 'r') as f:
    code = f.read()

handle_ai_error_func = """
function handleAiError(error: any, req: any, res: any) {
  const errorMsg = error?.message || "";
  const isCustomKey = !!req.headers['x-gemini-api-key'];

  if (errorMsg.includes("UNAUTHENTICATED") || errorMsg.includes("service account is deleted") || error?.status === 401 || errorMsg.includes("ACCOUNT_STATE_INVALID")) {
    if (!isCustomKey) {
        return res.status(401).json({ error: "UNAUTHENTICATED: Hệ thống AI hiện đang bảo trì hoặc hết hạn ngạch." });
    }
    return res.status(401).json({ error: "UNAUTHENTICATED: Tài khoản dịch vụ liên kết với API Key cá nhân của bạn đã bị vô hiệu hóa hoặc không hợp lệ." });
  }

  if (errorMsg.includes("suspended") || errorMsg.includes("PERMISSION_DENIED") || error?.status === 403) {
    if (!isCustomKey) {
        return res.status(401).json({ error: "UNAUTHENTICATED: Hệ thống AI hiện đang bảo trì hoặc hết hạn ngạch." });
    }
    return res.status(401).json({ error: "UNAUTHENTICATED: Tài khoản API Key cá nhân của bạn đã bị từ chối quyền truy cập." });
  }

  if (errorMsg.includes("RESOURCE_EXHAUSTED") || errorMsg.includes("quota") || errorMsg.includes("429") || error?.status === 429) {
    return res.status(429).json({ error: "Hệ thống đang quá tải hoặc hết hạn ngạch. Vui lòng thử lại sau ít phút hoặc sử dụng API Key cá nhân." });
  }

  console.error("Unhandled AI Error:", error);
  res.status(500).json({ error: errorMsg || "Đã xảy ra lỗi không xác định từ máy chủ AI. Vui lòng thử lại sau." });
}
"""

if "function handleAiError" not in code:
    code = code.replace("async function generateWithFallback", handle_ai_error_func + "\nasync function generateWithFallback")

# Replace only the catch blocks at the end of app.all
# They usually look like:
#     } catch (error) {
#       console.error(error);
#       res.status(500).json({ error: error.message || "Failed to extract data" });
#     }
# });
# We can use a regex that matches `catch (someVar) { ... } \n});`
regex = r"catch\s*\(([^)]+)\)\s*\{[^}]*res\.status\((?:500|\w+\.status|err\.status)\)[^}]*\}\s*\n\s*\}"
def replacer(match):
    err_var = match.group(1).replace(": any", "")
    return f"catch ({err_var}: any) {{\n    return handleAiError({err_var}, req, res);\n  }}\n"

# But wait, python regex for this might be tricky because there can be multiple statements inside catch.
# Let's just use string replacement for common patterns.
code = re.sub(r"catch\s*\(([^)]+)\)\s*\{[^}]*res\.status\(500\)[^}]*\}\s*\n\s*\}\);", 
              r"catch (\1) {\n    return handleAiError(\1, req, res);\n  }\n});", code)

# Let's also do a pass for any `return res.status(500).json({ error: err.message });`
code = re.sub(r"catch\s*\(([^)]+)\)\s*\{\s*return\s+res\.status\(500\)\.json\([^)]+\);\s*\}\s*\n\s*\}\);",
              r"catch (\1) {\n    return handleAiError(\1, req, res);\n  }\n});", code)

with open('server.ts', 'w') as f:
    f.write(code)
