import fs from 'fs';
import path from 'path';

const originalPath = path.resolve('resources/react/views/pages/Machinary/MachineryStockTable.js');
const diffPath = path.resolve('scratch/diff_table_utf8.js');

const originalContent = fs.readFileSync(originalPath, 'utf8');
const diffContent = fs.readFileSync(diffPath, 'utf8');

const originalLines = originalContent.split(/\r?\n/);
const diffLines = diffContent.split(/\r?\n/);

const newLines = [];
let currentOldLineIdx = 0;
let idx = 0;

while (idx < diffLines.length) {
  const line = diffLines[idx];
  
  if (line.startsWith('diff ') || line.startsWith('index ') || line.startsWith('--- ') || line.startsWith('+++ ')) {
    idx++;
    continue;
  }
  
  if (line.startsWith('@@ ')) {
    const match = line.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
    if (!match) {
      console.error('Invalid hunk header:', line);
      process.exit(1);
    }
    
    const oldStart = parseInt(match[1], 10);
    
    // Copy original lines up to the start of this hunk
    while (currentOldLineIdx < oldStart - 1) {
      if (currentOldLineIdx >= originalLines.length) break;
      newLines.push(originalLines[currentOldLineIdx]);
      currentOldLineIdx++;
    }
    
    currentOldLineIdx = oldStart - 1;
    idx++; // move past hunk header
    
    // Process hunk lines
    while (idx < diffLines.length) {
      const hunkLine = diffLines[idx];
      if (hunkLine.startsWith('@@ ') || hunkLine.startsWith('diff ') || hunkLine.startsWith('index ')) {
        // We reached the next hunk or next file
        break;
      }
      
      if (hunkLine.startsWith('+')) {
        newLines.push(hunkLine.slice(1));
      } else if (hunkLine.startsWith('-')) {
        currentOldLineIdx++;
      } else {
        // Common line
        const content = hunkLine.startsWith(' ') ? hunkLine.slice(1) : hunkLine;
        newLines.push(originalLines[currentOldLineIdx]);
        currentOldLineIdx++;
      }
      idx++;
    }
    continue;
  }
  
  idx++;
}

// Copy remaining original lines
while (currentOldLineIdx < originalLines.length) {
  newLines.push(originalLines[currentOldLineIdx]);
  currentOldLineIdx++;
}

fs.writeFileSync(originalPath, newLines.join('\n'), 'utf8');
console.log('Successfully applied patch to MachineryStockTable.js!');
