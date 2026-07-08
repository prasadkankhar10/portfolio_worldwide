const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src', 'components', '3d');
const files = fs.readdirSync(srcDir);

for (const file of files) {
    if (!file.endsWith('.tsx')) continue;
    const filePath = path.join(srcDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Fix implicit 'any' for 'hit'
    content = content.replace(/\(hit\) =>/g, '(hit: any) =>');
    
    // Fix Pirate bestHit possibly null
    content = content.replace(/bestHit\.toi/g, 'bestHit?.toi');
    
    // Fix Pirate comparison unintentional overlap
    content = content.replace(/state\.current === 'ESCAPING'/g, 'false /* ESCAPING REMOVED */');

    fs.writeFileSync(filePath, content);
}
console.log('Fixed hit typing and Pirate errors.');
