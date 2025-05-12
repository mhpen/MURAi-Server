import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to fix route issues in files
const fixRouteIssues = (dir) => {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules
      if (file !== 'node_modules') {
        fixRouteIssues(filePath);
      }
    } else if (file.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // Replace problematic patterns
      if (content.includes('https://git.new/pathToRegexpError')) {
        content = content.replace(/['"]https:\/\/git\.new\/pathToRegexpError['"]/g, '"/path-to-regexp-error"');
        modified = true;
      }
      
      // Replace any router.get with full URLs
      content = content.replace(/router\.(get|post|put|delete|patch)\(['"]https?:\/\/[^'"]+['"]/g, (match) => {
        modified = true;
        // Extract the path part from the URL
        const urlMatch = match.match(/https?:\/\/[^\/]+(\/[^'"]*)/);
        const path = urlMatch ? urlMatch[1] : '/fixed-path';
        return match.replace(/['"]https?:\/\/[^'"]+['"]/, `"${path}"`);
      });
      
      if (modified) {
        console.log(`Fixed issues in: ${filePath}`);
        fs.writeFileSync(filePath, content, 'utf8');
      }
    }
  }
};

console.log('Fixing route issues...');
fixRouteIssues(__dirname);
console.log('Fix complete'); 