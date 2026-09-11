const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const target = `        if (
          errorMsg.includes("429") || errorMsg.includes("quota") || status === 429 || 
          errorMsg.includes("503") || status === 503 || errorMsg.includes("UNAVAILABLE") || errorMsg.includes("overloaded")
        ) {
          console.log(\`Model \${model} failed on attempt \${attempt + 1}. Retrying...\`);
          continue; // Try next model or next attempt
        }`;

const replacement = `        // Do not retry if quota is exhausted
        if (errorMsg.includes("RESOURCE_EXHAUSTED") || errorMsg.includes("quota") || (status === 429 && !errorMsg.includes("rate limit"))) {
             throw e; // Quota exhausted, throw immediately
        }
        if (
          errorMsg.includes("429") || 
          errorMsg.includes("503") || status === 503 || errorMsg.includes("UNAVAILABLE") || errorMsg.includes("overloaded")
        ) {
          console.log(\`Model \${model} failed on attempt \${attempt + 1}. Retrying...\`);
          continue; // Try next model or next attempt
        }`;

content = content.replace(target, replacement);

fs.writeFileSync('server.ts', content);
