import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import routes from './routes/index.js';
import adminRoutes from './routes/admin.routes.js';
import authRoutes from './routes/auth.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a simple Express app
const app = express();

// Function to recursively search for route definitions in files
const searchForRouteIssues = (dir) => {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules
      if (file !== 'node_modules') {
        searchForRouteIssues(filePath);
      }
    } else if (file.endsWith('.js')) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Look for potential route issues
      if (content.includes('https://git.new') || 
          content.includes('router.get(\'http') || 
          content.includes('router.post(\'http') ||
          content.includes('app.get(\'http') ||
          content.includes('app.post(\'http')) {
        console.log(`Potential issue found in: ${filePath}`);
        
        // Extract the problematic line
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.includes('https://git.new') || 
              line.includes('router.get(\'http') || 
              line.includes('router.post(\'http') ||
              line.includes('app.get(\'http') ||
              line.includes('app.post(\'http')) {
            console.log(`Line ${i+1}: ${line.trim()}`);
          }
        }
      }
    }
  }
};

console.log('Searching for route issues...');
searchForRouteIssues(__dirname);
console.log('Search complete');

// Test each route file individually
try {
  console.log('Testing auth routes...');
  app.use('/api/auth', authRoutes);
  console.log('Auth routes OK');
} catch (error) {
  console.error('Error in auth routes:', error);
}

try {
  console.log('Testing admin routes...');
  app.use('/api/admin', adminRoutes);
  console.log('Admin routes OK');
} catch (error) {
  console.error('Error in admin routes:', error);
}

try {
  console.log('Testing main routes...');
  app.use('/api', routes);
  console.log('Main routes OK');
} catch (error) {
  console.error('Error in main routes:', error);
}

console.log('All route tests complete'); 