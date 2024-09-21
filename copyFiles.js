const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'src');
const destDir = path.join(__dirname, '..', 'dist');


if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}
fs.readdirSync(sourceDir).forEach(file => {
  if (file.endsWith('.json')) {
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(destDir, file);
    
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copied ${file} to dist/`);
  }
});