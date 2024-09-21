const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'src');
const destDir = path.join(__dirname, '..', 'dist');

// Ensure the destination directory exists
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Read all files in the source directory
fs.readdirSync(sourceDir).forEach(file => {
  if (file.endsWith('.json')) {
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(destDir, file);
    
    // Copy the file
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copied ${file} to dist/`);
  }
});