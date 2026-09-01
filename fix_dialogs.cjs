const fs = require('fs');
const file = 'src/data/dialogs.ts';
let c = fs.readFileSync(file, 'utf8');
c = c.replace(/  questAdvance\?: boolean;[^\n]*\n/g, '');
c = c.replace(/  requiredQuestStep\?: number;[^\n]*\n/g, '');
c = c.replace(/  outOfOrderText\?: string;[^\n]*\n/g, '');
c = c.replace(/,\n\s*questAdvance: true/g, '');
c = c.replace(/,\n\s*requiredQuestStep: \d+/g, '');
c = c.replace(/,\n\s*outOfOrderText: "[^"]*"/g, '');
// add test building dialog
c = c.replace(/export const dialogData[^\n]*\n/, "export const dialogData: Record<string, DialogNode> = {\n  building_test_1: {\n    id: 'building_test_1',\n    npcName: 'System',\n    text: 'You have approached a building! (Text will be added here later).'\n  },\n");
fs.writeFileSync(file, c);
