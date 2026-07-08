const fs = require('fs');
const path = require('path');

const files = [
    'src/components/3d/WizardNPC.tsx',
    'src/components/3d/WitchNPC.tsx'
];

files.forEach(file => {
    const fullPath = path.join(__dirname, '..', file);
    if (!fs.existsSync(fullPath)) return;
    
    let content = fs.readFileSync(fullPath, 'utf8');

    // activeSpell
    content = content.replace(/const activeSpell = useRef\(\{/g, 'const [activeSpell, setActiveSpell] = useState({');
    content = content.replace(/activeSpell\.current = \{/g, 'setActiveSpell({');
    content = content.replace(/activeSpell\.current\.color/g, 'activeSpell.color');
    content = content.replace(/activeSpell\.current\.duration/g, 'activeSpell.duration');
    content = content.replace(/activeSpell\.current\.type/g, 'activeSpell.type');
    content = content.replace(/activeSpell\.current\.scaleMultiplier/g, 'activeSpell.scaleMultiplier');

    // currentGreeting
    content = content.replace(/const currentGreeting = useRef\(/g, 'const [currentGreeting, setCurrentGreeting] = useState(');
    content = content.replace(/currentGreeting\.current = /g, 'setCurrentGreeting(');
    // Fix missing closing parenthesis if replacing `currentGreeting.current = ...`
    content = content.replace(/setCurrentGreeting\(greetings\[Math\.floor\(Math\.random\(\) \* greetings\.length\)\]\);/g, 'setCurrentGreeting(greetings[Math.floor(Math.random() * greetings.length)]);');
    
    content = content.replace(/\{currentGreeting\.current\}/g, '{currentGreeting}');
    content = content.replace(/"\{currentGreeting\.current\}"/g, '"{currentGreeting}"');

    fs.writeFileSync(fullPath, content, 'utf8');
});

console.log("Fixed refs in Wizard and Witch");
