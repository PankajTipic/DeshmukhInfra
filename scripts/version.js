import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get current date in DD_MM format
const now = new Date();
const day = String(now.getDate()).padStart(2, '0');
const month = String(now.getMonth() + 1).padStart(2, '0');
const year = now.getFullYear();
const dateString = `${day}_${month}_${year}`;

// Read current version from package.json or create default
const packageJsonPath = path.join(__dirname, '..', 'package.json');
let currentVersion = '1.0.0';

try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  currentVersion = packageJson.version || '1.0.0';
} catch (error) {
  console.log('No package.json found, using default version 1.0.0');
}

// Parse and increment version
const versionParts = currentVersion.split('.').map(Number);
const buildType = process.argv[2] || 'patch';

switch (buildType) {
  case 'major':
    versionParts[0] += 1;
    versionParts[1] = 0;
    versionParts[2] = 0;
    break;
  case 'minor':
    versionParts[1] += 1;
    versionParts[2] = 0;
    break;
  case 'patch':
  default:
    versionParts[2] += 1;
    break;
}

const newVersion = versionParts.join('.');
const versionWithDate = `${newVersion}_${dateString}`;

// Update package.json if it exists
try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.version = newVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
} catch (error) {
  // If no package.json, just continue
}

// Create version.js file
const versionFileContent = `// Auto-generated version file
export const APP_VERSION = '${versionWithDate}';
export const BUILD_DATE = '${now.toISOString()}';
export const VERSION_NUMBER = '${newVersion}';
`;

// Ensure src directory exists
const srcDir = path.join(__dirname, '..', 'resources', 'react');
if (!fs.existsSync(srcDir)) {
  fs.mkdirSync(srcDir, { recursive: true });
}

const versionFilePath = path.join(srcDir, 'version.js');
fs.writeFileSync(versionFilePath, versionFileContent);

console.log(`✅ Version updated to: v${versionWithDate}`);
console.log(`📦 New version: ${newVersion}`);
console.log(`📅 Build date: ${dateString}`);