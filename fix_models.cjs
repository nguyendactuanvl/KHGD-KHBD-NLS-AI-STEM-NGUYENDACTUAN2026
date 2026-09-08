const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, 'api');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, file));
    }
  });
  return arrayOfFiles;
}

const allFiles = getAllFiles(apiDir).filter(f => f.endsWith('.ts'));

allFiles.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');

  // Fix the models array
  content = content.replace(/const models = \[[^\]]+\];/g, 'const models = ["gemini-3.6-flash", "gemini-3.1-pro-preview"];');
  
  // Fix any other hardcoded models in getGenerativeModel
  content = content.replace(/model:\s*['"]gemini-[^'"]+['"]/g, "model: 'gemini-3.6-flash'");

  fs.writeFileSync(f, content);
  console.log(`Updated models in ${f}`);
});
