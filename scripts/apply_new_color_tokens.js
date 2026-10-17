import fs from 'fs';
import path from 'path';

const COLOR_REPLACEMENTS = [
  // Canvas: Primary page background
  { search: /#101a18/gi, replace: '#111916' },
  
  // Surface: Cards, navigation and panels
  { search: /#182522/gi, replace: '#1B2822' },
  
  // Elevated: Menus, modals and hover surfaces
  { search: /#14201d/gi, replace: '#25352D' },
  
  // Border: Dividers and subtle outlines
  { search: /#527c68/gi, replace: '#3A4B40' },
  
  // Champagne: Primary buttons and active states
  { search: /#d4b777/gi, replace: '#D6BC83' },
  
  // Champagne Light: Hover emphasis and selected highlights
  { search: /#e5cd94/gi, replace: '#E8D5A7' },
  
  // Ivory: Headings and important text
  { search: /#e9e4d7/gi, replace: '#F0E9DA' },
];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (
      fullPath.endsWith('.tsx') || 
      fullPath.endsWith('.ts') || 
      fullPath.endsWith('.css')
    ) {
      results.push(fullPath);
    }
  }
  return results;
}

const targetFiles = walk('src');
let totalReplacements = 0;
let modifiedFilesCount = 0;

for (const filePath of targetFiles) {
  let content = fs.readFileSync(filePath, 'utf8');
  let fileReplacements = 0;

  for (const { search, replace } of COLOR_REPLACEMENTS) {
    const matches = content.match(search);
    if (matches) {
      fileReplacements += matches.length;
      content = content.replace(search, replace);
    }
  }

  if (fileReplacements > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    modifiedFilesCount++;
    totalReplacements += fileReplacements;
    console.log(`Updated ${filePath}: ${fileReplacements} replacements`);
  }
}

console.log(`\n[SUCCESS] Applied new color tokens across ${modifiedFilesCount} files (${totalReplacements} total replacements).`);
