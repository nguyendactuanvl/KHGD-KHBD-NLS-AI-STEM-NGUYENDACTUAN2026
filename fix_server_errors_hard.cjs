const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

// Replace any catch block at the end of an app.all block that ends with });
content = content.replace(/catch \((err|error|e)(: any)?\) \{\s*(?:console\.error\([^)]+\);\s*)?(?:return\s+)?res\.status\(\d+\)\.json\([^)]+\);\s*\}\s*\n\s*\}\);/g, (match, errVar) => {
  return `catch (${errVar}: any) {
    return handleAiError(${errVar}, req, res);
  }
});`;
});

// For some that don't have console.error
content = content.replace(/catch \((err|error|e)(: any)?\) \{\s*(?:return\s+)?res\.status\(\d+\)\.json\(\{ error: [^}]+\} \);\s*\}\s*\n\s*\}\);/g, (match, errVar) => {
  return `catch (${errVar}: any) {
    return handleAiError(${errVar}, req, res);
  }
});`;
});

// Also let's check for specific ones like line 183
content = content.replace(/catch \(error\) \{\s*console\.error\(error\);\s*res\.status\(500\)\.json\(\{ error: error\.message \|\| "Failed to extract data" \}\);\s*\}\s*\n\s*\}\);/g, `catch (error: any) {
    return handleAiError(error, req, res);
  }
});`);

fs.writeFileSync('server.ts', content);
