import re

with open('server.ts', 'r') as f:
    code = f.read()

# Replace block
regex = r"const\s+response\s*=\s*await\s+fetch\(`https://generativelanguage\.googleapis\.com/v1beta/models/[^`]+`,\s*\{\s*method:\s*'POST',\s*headers:\s*\{\s*'Content-Type':\s*'application/json'\s*\},\s*body:\s*JSON\.stringify\(\{\s*contents:\s*(.*?)(?:,\s*generationConfig:\s*(.*?))?\s*\}\)\s*\}\);[\s\S]*?if\s*\(!response\.ok\)[\s\S]*?\}\s*const\s*(\w+)\s*=\s*data\.candidates\?\.\[0\]\?\.content\?\.parts\?\.\[0\]\?\.text\s*\|\|\s*'[^']*';"

def replacer(match):
    contents = match.group(1).strip()
    config = match.group(2)
    varname = match.group(3)
    
    config_str = ""
    if config:
        config_str = f", config: {config.strip()}"
        
    fallback = "''"
    if "rawOutput" in varname or "data" in varname or varname == "jsonText":
        fallback = "'{}'"
    if "jsonText" in varname:
        fallback = "'[]'"
    
    return f"""
    const response = await generateWithFallback(req, {{
      contents: {contents}{config_str}
    }});
    const {varname} = response.text || '';
    """

code = re.sub(regex, replacer, code)

# Clean up any remaining apiKey assignments
code = re.sub(r"const apiKey = process\.env\.GEMINI_API_KEY;.*?if \(!apiKey\).*?\}", "", code, flags=re.DOTALL)

with open('server.ts', 'w') as f:
    f.write(code)
