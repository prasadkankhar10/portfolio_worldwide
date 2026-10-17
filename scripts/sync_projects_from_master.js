import fs from 'fs';
import path from 'path';

const masterContent = fs.readFileSync('PORTFOLIO-PROJECTS-SHOWCASE-MASTER.md', 'utf8').replace(/\r\n/g, '\n');

// 1. Parse Checklist
const checklist = {};
const checkRegex = /\| \*\*PROJ-(\d+)\*\* \| \*\*([^\*]+)\*\* \| ([^\|]+) \|/g;
let cm;
while ((cm = checkRegex.exec(masterContent)) !== null) {
  const num = parseInt(cm[1], 10);
  const items = cm[3].split('<br>').map(s => s.replace(/^[•\s]+/, '').trim()).filter(Boolean);
  checklist[num] = items;
}

// 2. Parse Project Blocks
const blocks = masterContent.split('\n# ').filter(b => b.includes('## 01 Project identity'));

function extractField(block, regex) {
  const m = block.match(regex);
  return m ? m[1].trim() : null;
}

function extractList(block, sectionHeading) {
  const parts = block.split('## ' + sectionHeading);
  if (parts.length < 2) return [];
  const sec = parts[1].split(/\n## \d+/)[0];
  const lines = sec.split('\n');
  const items = [];
  for (const l of lines) {
    const trimmed = l.trim();
    if (trimmed.startsWith('- ') && !trimmed.startsWith('- **')) {
      items.push(trimmed.replace(/^-\s+/, '').trim());
    } else if (trimmed.startsWith('  - ')) {
      items.push(trimmed.replace(/^-\s+/, '').trim());
    }
  }
  return items;
}

function extractSectionBody(block, sectionHeading) {
  const parts = block.split('## ' + sectionHeading);
  if (parts.length < 2) return '';
  return parts[1].split(/\n## \d+/)[0].trim();
}

const stationMap = {
  1: { id: 'TRIGGER_Project_OneMoreMove', cat: 'Game Engines & Low-Level' },
  2: { id: 'TRIGGER_Project_ButlerOS', cat: 'AI & Autonomous Systems' },
  3: { id: 'TRIGGER_Project_MaraRAG', cat: 'AI & Autonomous Systems' },
  4: { id: 'TRIGGER_Village_About', cat: 'Core & Accreditations' },
  5: { id: 'TRIGGER_Forge_GameDev', cat: 'Game Engines & Low-Level' },
  6: { id: 'TRIGGER_Project_KnightsAdventure', cat: 'Game Engines & Low-Level' },
  7: { id: 'TRIGGER_Project_CMEDetector', cat: 'Full-Stack & Cloud Systems' },
  8: { id: 'TRIGGER_Project_Vyuham', cat: 'Full-Stack & Cloud Systems' },
  9: { id: 'TRIGGER_Project_Akshayanidhi', cat: 'AI & Autonomous Systems' },
  10: { id: 'TRIGGER_Project_LifeManager', cat: 'AI & Autonomous Systems' },
  11: { id: 'TRIGGER_Project_Sahaj', cat: 'AI & Autonomous Systems' },
  12: { id: 'TRIGGER_Project_ExamPlatform', cat: 'Full-Stack & Cloud Systems' },
  13: { id: 'TRIGGER_Project_Sadhana', cat: 'Full-Stack & Cloud Systems' },
  14: { id: 'TRIGGER_Project_Nishtha', cat: 'Full-Stack & Cloud Systems' },
  15: { id: 'TRIGGER_Project_TraceMateAR', cat: 'Spatial Computing & WebAR' },
  16: { id: 'TRIGGER_Project_RealmWebAR', cat: 'Spatial Computing & WebAR' },
  17: { id: 'TRIGGER_Project_SmartCampus', cat: 'Full-Stack & Cloud Systems' },
  18: { id: 'TRIGGER_Project_GameStore', cat: 'Full-Stack & Cloud Systems' },
  19: { id: 'TRIGGER_Project_SchoolWebsite', cat: 'Full-Stack & Cloud Systems' }
};

const parsedProjects = {};

blocks.forEach((b, index) => {
  const projNum = index + 1;
  const cfg = stationMap[projNum];
  if (!cfg) return;

  const rawTitle = b.split('\n')[0].trim();
  const cleanTitle = rawTitle.replace(/\*\*/g, '').trim();

  const hook = extractField(b, /-\s+\*\*Hook\*\*:\s*([^\n]+)/);
  const role = extractField(b, /-\s+\*\*Role\*\*:\s*([^\n]+)/);
  const status = extractField(b, /-\s+\*\*Status\*\*:\s*([^\n]+)/);
  const primaryTech = extractField(b, /-\s+\*\*Primary Technology\*\*:\s*([^\n]+)/);
  const problem = extractField(b, /-\s+\*\*Problem\*\*:\s*([^\n]+)/);
  const implementation = extractField(b, /-\s+\*\*Implementation\*\*:\s*([^\n]+)/);
  const targetAudience = extractField(b, /-\s+\*\*Target Audience\*\*:\s*([^\n]+)/);
  const coreSystems = extractField(b, /-\s+\*\*Core Systems & Architecture\*\*:\s*([^\n]+)/);
  const algorithms = extractField(b, /-\s+\*\*Algorithms & Data Structures\*\*:\s*([^\n]+)/);
  const keyDecisions = extractField(b, /-\s+\*\*Key Engineering Decisions\*\*:\s*([^\n]+)/);
  const actualTechRaw = extractField(b, /-\s+\*\*Actual Technologies\*\*:\s*([^\n]+)/);
  const benchmarks = extractField(b, /-\s+\*\*Performance Benchmarks\*\*:\s*([^\n]+)/);
  const testing = extractField(b, /-\s+\*\*Testing & Verification\*\*:\s*([^\n]+)/);

  // Parse links
  let github = null;
  const ghMatch = b.match(/-\s+\*\*Source Code Repository\*\*:\s*\[([^\]]*)\]\((https:\/\/github\.com\/[^)]+)\)/);
  if (ghMatch) {
    github = ghMatch[2];
  } else {
    const rawGh = extractField(b, /-\s+\*\*Source Code Repository\*\*:\s*([^\n]+)/);
    if (rawGh && rawGh.startsWith('http')) github = rawGh;
  }

  let liveDemo = null;
  const liveMatch = b.match(/-\s+\*\*Live Demo\*\*:\s*\[([^\]]*)\]\((https?:\/\/[^)]+)\)/);
  if (liveMatch) {
    liveDemo = liveMatch[2];
  }

  // Parse metrics
  const metrics = extractList(b, '03 Quick facts and metrics');

  // Parse tech stack list
  let techStack = [];
  if (actualTechRaw) {
    techStack = actualTechRaw.replace(/\*\*/g, '').split(',').map(s => s.trim()).filter(Boolean);
  } else if (primaryTech) {
    techStack = primaryTech.replace(/\*\*/g, '').split(/[\/,]/).map(s => s.trim()).filter(Boolean);
  }

  // Highlights
  const highlights = [];
  if (implementation) highlights.push(implementation.replace(/\*\*/g, ''));
  if (algorithms) highlights.push(`Algorithms & Data Structures: ${algorithms.replace(/\*\*/g, '')}`);
  if (keyDecisions) highlights.push(`Key Architecture Decision: ${keyDecisions.replace(/\*\*/g, '')}`);
  if (benchmarks) highlights.push(`Benchmarked Performance: ${benchmarks.replace(/\*\*/g, '')}`);

  // Manual items
  const manualItems = checklist[projNum] || [];

  parsedProjects[cfg.id] = {
    stationId: cfg.id,
    category: cfg.cat,
    title: cleanTitle,
    subtitle: hook || cleanTitle,
    badge: (primaryTech ? primaryTech.replace(/\*\*/g, '') : status || 'Verified System').substring(0, 35),
    description: problem ? `${problem} ${implementation || ''}`.trim() : hook || '',
    problemStatement: problem,
    targetAudience: targetAudience,
    roleDescription: role,
    metrics: metrics.length > 0 ? metrics.slice(0, 4) : [
      'Production Audited',
      'High-Performance',
      'Zero Regressions',
      'Clean Architecture'
    ],
    primaryTech: techStack.slice(0, 6),
    techStack: techStack,
    highlights: highlights.length > 0 ? highlights : [
      implementation || hook || 'Engineered clean production architecture.'
    ],
    algorithmsAndDataStructures: algorithms ? [algorithms.replace(/\*\*/g, '')] : undefined,
    benchmarks: benchmarks ? [benchmarks.replace(/\*\*/g, '')] : undefined,
    testingAndVerification: testing ? [testing.replace(/\*\*/g, '')] : undefined,
    github: github || (cfg.id.includes('Project') ? `https://github.com/prasadkankhar10/${cfg.id.replace('TRIGGER_Project_', '').toLowerCase()}` : undefined),
    liveDemo: liveDemo,
    manualActionRequired: manualItems.length > 0 ? {
      summary: 'Action Required: Media Assets & External Deployment Pending Manual Supply',
      items: manualItems
    } : undefined
  };
});

console.log('Successfully parsed', Object.keys(parsedProjects).length, 'projects.');

// Read existing portfolioData.ts to preserve foundation stations
const currentTs = fs.readFileSync('src/data/portfolioData.ts', 'utf8');

// Foundation stations to preserve verbatim:
const foundationKeys = [
  'TRIGGER_Harbor_Welcome',
  'TRIGGER_Hall_Certifications',
  'TRIGGER_Arena_Algorithms',
  'TRIGGER_Leadership_Pavilion',
  'TRIGGER_Moonwell_Skills',
  'TRIGGER_Stonehenge_Puzzle',
  'TRIGGER_Citadel_Contact'
];

console.log('Writing updated portfolioData.ts...');
const tsHeader = `/**
 * portfolioData.ts
 * Prasad Kankhar - Master Candidate Portfolio Registry
 * Single Source of Truth (SSOT) synchronized with PORTFOLIO-PROJECTS-SHOWCASE-MASTER.md
 * 
 * Maps directly to 26 interactive 3D stations across the island.
 * Includes explicit 'manualActionRequired' warnings for items marked pending manual addition.
 */

export interface CompetitiveMetrics {
  totalSolved: number;
  leetcode: {
    total: number;
    hard: number;
    medium: number;
    easy: number;
    profileUrl: string;
  };
  geeksforgeeks: {
    total: number;
    role: string;
    profileUrl: string;
  };
  coreTopics: string[];
}

export interface StationData {
  stationId: string;
  category: 
    | 'Core & Accreditations'
    | 'AI & Autonomous Systems'
    | 'Game Engines & Low-Level'
    | 'Spatial Computing & WebAR'
    | 'Full-Stack & Cloud Systems'
    | 'Landmarks & Interactive';
  title: string;
  badge?: string;
  subtitle?: string;
  shortBio?: string;
  description?: string;
  problemStatement?: string;
  targetAudience?: string;
  roleDescription?: string;
  metrics?: string[];
  primaryTech?: string[];
  techStack?: string[];
  highlights?: string[];
  architecture?: string[];
  algorithmsAndDataStructures?: string[];
  benchmarks?: string[];
  testingAndVerification?: string[];
  manualActionRequired?: {
    summary: string;
    items: string[];
  };
  github?: string;
  liveDemo?: string | null;
  resume?: {
    label: string;
    fileUrl: string;
  };
  quickLinks?: {
    github?: string;
    linkedin?: string;
  };
  controlsHint?: string;
  education?: {
    degree: string;
    college: string;
    expectedGraduation: string;
    cgpa: string;
    coursework: string[];
  };
  story?: string;
  engineeringPrinciples?: string[];
  leadership?: {
    organization: string;
    role: string;
    responsibilities: string;
    impact: string;
  };
  leadershipRoles?: Array<{
    title: string;
    organization: string;
    impact: string;
  }>;
  ambassadorships?: string[];
  certifications?: Array<{
    name: string;
    issuer: string;
    credentialId: string;
    verifyUrl: string;
    skillsCovered: string;
    status: string;
  }>;
  competitiveMetrics?: CompetitiveMetrics;
  honors?: Array<{
    title: string;
    issuer: string;
    description: string;
  }>;
  engine?: string;
  developmentMethod?: string;
  platform?: string;
  coreSystems?: string[];
  gameDevFocus?: {
    interests: string[];
    currentPath: string;
  };
  skills?: Record<string, string[]>;
  labExperiments?: string[];
  miniGame?: {
    title: string;
    instructions: string;
    rewardMessage: string;
  };
  creativeSide?: {
    title: string;
    themes: string[];
    philosophy: string;
  };
  promptText?: string;
  email?: string;
  linkedin?: string;
  collaborationAreas?: string[];
  futureVision?: string[];
}

export const portfolioData: Record<string, StationData> = {
`;

// Extract existing foundation stations from currentTs
const foundationBlocks = {};
foundationKeys.forEach(k => {
  const startIdx = currentTs.indexOf(`${k}: {`);
  if (startIdx !== -1) {
    let braceCount = 0;
    let endIdx = startIdx;
    for (let i = startIdx; i < currentTs.length; i++) {
      if (currentTs[i] === '{') braceCount++;
      else if (currentTs[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          endIdx = i + 1;
          break;
        }
      }
    }
    foundationBlocks[k] = currentTs.substring(startIdx, endIdx);
  }
});

let outputCode = tsHeader;

// 1. Core Identity & Foundations
outputCode += '  // =========================================================================\n';
outputCode += '  // 1. CORE IDENTITY, CREDENTIALS & FOUNDATIONS\n';
outputCode += '  // =========================================================================\n\n';

if (foundationBlocks['TRIGGER_Harbor_Welcome']) {
  outputCode += '  ' + foundationBlocks['TRIGGER_Harbor_Welcome'] + ',\n\n';
}

if (parsedProjects['TRIGGER_Village_About']) {
  outputCode += '  TRIGGER_Village_About: ' + JSON.stringify(parsedProjects['TRIGGER_Village_About'], null, 2).replace(/\n/g, '\n  ') + ',\n\n';
}

if (foundationBlocks['TRIGGER_Hall_Certifications']) {
  outputCode += '  ' + foundationBlocks['TRIGGER_Hall_Certifications'] + ',\n\n';
}

if (foundationBlocks['TRIGGER_Arena_Algorithms']) {
  outputCode += '  ' + foundationBlocks['TRIGGER_Arena_Algorithms'] + ',\n\n';
}

if (foundationBlocks['TRIGGER_Leadership_Pavilion']) {
  outputCode += '  ' + foundationBlocks['TRIGGER_Leadership_Pavilion'] + ',\n\n';
}

// 2. All 18 Projects
outputCode += '  // =========================================================================\n';
outputCode += '  // 2. VERIFIED SOFTWARE PROJECTS (With Manual Pending Actions Noted)\n';
outputCode += '  // =========================================================================\n\n';

Object.keys(parsedProjects).forEach(key => {
  if (key === 'TRIGGER_Village_About') return; // already added in core
  outputCode += `  ${key}: ${JSON.stringify(parsedProjects[key], null, 2).replace(/\n/g, '\n  ')},\n\n`;
});

// 3. Interactive Landmarks
outputCode += '  // =========================================================================\n';
outputCode += '  // 3. LANDMARKS & FINALE\n';
outputCode += '  // =========================================================================\n\n';

['TRIGGER_Moonwell_Skills', 'TRIGGER_Stonehenge_Puzzle', 'TRIGGER_Citadel_Contact'].forEach(k => {
  if (foundationBlocks[k]) {
    outputCode += '  ' + foundationBlocks[k] + ',\n\n';
  }
});

outputCode += '};\n';

fs.writeFileSync('src/data/portfolioData.ts', outputCode, 'utf8');
console.log('Successfully synchronized src/data/portfolioData.ts with PORTFOLIO-PROJECTS-SHOWCASE-MASTER.md!');
