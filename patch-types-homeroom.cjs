const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

if (!code.includes('phone?: string')) {
  code = code.replace('isFixed?: boolean;', 'isFixed?: boolean;\n  phone?: string;\n  parentName?: string;\n  parentPhone?: string;\n  address?: string;\n  notes?: string;\n  dob?: string;');
  fs.writeFileSync('src/types.ts', code);
  console.log('Types updated');
}
