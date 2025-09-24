import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const extensionDir = path.join(rootDir, 'extension');

async function buildExtension() {
  try {
    // Ensure extension directory exists
    await fs.ensureDir(extensionDir);
    
    // Copy files to extension directory
    await fs.copy(distDir, extensionDir);
    
    // Copy manifest.json
    await fs.copyFile(
      path.join(rootDir, 'src/manifest.json'),
      path.join(extensionDir, 'manifest.json')
    );
    
    // Copy icons
    await fs.copy(
      path.join(rootDir, 'public/icons'),
      path.join(extensionDir, 'icons')
    );
    
    console.log('Extension build completed successfully!');
  } catch (error) {
    console.error('Error building extension:', error);
    process.exit(1);
  }
}

buildExtension();
