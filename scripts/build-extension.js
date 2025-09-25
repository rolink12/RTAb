import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const extensionDir = path.join(rootDir, 'extension');

async function buildExtension() {
  try {
    // Ensure extension directory exists
    await fs.ensureDir(extensionDir);
    
    // Copy all necessary files to extension directory
    await fs.copy(rootDir, extensionDir, {
      filter: (src, dest) => {
        // Skip certain files/directories
        const skipPatterns = ['.git', 'node_modules', 'extension', 'dist', 'src', '.gitignore'];
        return !skipPatterns.some(pattern => src.includes(pattern));
      }
    });
    
    console.log('Extension build completed successfully!');
  } catch (error) {
    console.error('Error building extension:', error);
    process.exit(1);
  }
}

buildExtension();
