const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src', 'components', '3d');
const files = fs.readdirSync(dir).filter(f => f.endsWith('NPC.tsx'));

files.forEach(file => {
    const fullPath = path.join(dir, file);
    let content = fs.readFileSync(fullPath, 'utf8');

    // Fix ESCAPING state type
    content = content.replace(/useRef<'([^']+)'(?: \| '([^']+)')*(?: \| '([^']+)')*>\('([^']+)'\);/g, (match) => {
        if (!match.includes("'ESCAPING'")) {
            return match.replace(/>\(/, " | 'ESCAPING' | 'WALKING_TO_WAYPOINT'>(");
        }
        return match;
    });

    // Fix hit implicit any
    content = content.replace(/\(hit\) => {/g, "(hit: any) => {");
    
    // Fix hit in sort
    content = content.replace(/\(a, b\) => a\.timeOfImpact - b\.timeOfImpact/g, "(a: any, b: any) => a.timeOfImpact - b.timeOfImpact");

    fs.writeFileSync(fullPath, content, 'utf8');
});

console.log("Fixed TS errors in NPC files");
