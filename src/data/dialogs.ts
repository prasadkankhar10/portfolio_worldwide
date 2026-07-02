export interface DialogNode {
  id: string;
  npcName: string;
  text: string;
  nextId?: string; // If undefined, the dialog ends
  setFlag?: string; // Flag to set to true when node is completed/skipped
  conditionFlag?: string; // Condition to check before playing this node
  altNextId?: string; // Jump to this ID immediately if conditionFlag is true
}

export const dialogData: Record<string, DialogNode> = {
  // --- WIZARD (Personal Profile) ---
  wizard_intro_1: {
    id: 'wizard_intro_1',
    npcName: 'Wizard of Origins',
    text: "Greetings, traveler! Welcome to the realm of Prasad Anil Kankhar.",
    nextId: 'wizard_intro_2'
  },
  wizard_intro_2: {
    id: 'wizard_intro_2',
    npcName: 'Wizard of Origins',
    text: "He is a creator originating from Buldhana, Maharashtra, building a brand that blends technology, creativity, emotional storytelling, and personal growth.",
    nextId: 'wizard_intro_3'
  },
  wizard_intro_3: {
    id: 'wizard_intro_3',
    npcName: 'Wizard of Origins',
    text: "A disciplined soul, strict vegetarian, and practitioner of artistic handwriting. Seek out the others across this island to learn of his achievements!",
  },

  // --- GOLDEN KNIGHTS (Academics & Leadership) ---
  knight_academics_1: {
    id: 'knight_academics_1',
    npcName: 'Knight of Academia',
    text: "Halt! Do you seek knowledge of Prasad's training? He pursues a B.Tech in Computer Science at MIT, Chhatrapati Sambhajinagar.",
    nextId: 'knight_academics_2'
  },
  knight_academics_2: {
    id: 'knight_academics_2',
    npcName: 'Knight of Academia',
    text: "A natural leader, he serves as the Technical Coordinator for ACTS and the Campus Mantri for GeeksforGeeks.",
    nextId: 'knight_academics_3'
  },
  knight_academics_3: {
    id: 'knight_academics_3',
    npcName: 'Knight of Academia',
    text: "He even bears the prestigious title of Google Student Ambassador! A mighty warrior of the mind, indeed.",
  },

  // --- ELF (Technical Expertise) ---
  elf_tech_1: {
    id: 'elf_tech_1',
    npcName: 'Elf of Engineering',
    text: "Ah, looking for the tools of the trade? Prasad is a master of the ancient languages: C++, JavaScript, React, Node.js, and Firebase.",
    nextId: 'elf_tech_2'
  },
  elf_tech_2: {
    id: 'elf_tech_2',
    npcName: 'Elf of Engineering',
    text: "He builds virtual worlds in Unreal Engine and is currently expanding his magic into Unity and C#.",
    nextId: 'elf_tech_3'
  },
  elf_tech_3: {
    id: 'elf_tech_3',
    npcName: 'Elf of Engineering',
    text: "He prefers highly concise, direct communication—especially when receiving technical feedback on logic and architecture. Keep it sharp!",
  },

  // --- PIRATES (Web & Software Engineering) ---
  pirate_web_1: {
    id: 'pirate_web_1',
    npcName: 'Captain of the Web',
    text: "Ahoy matey! Let me tell ye about the grand ships Prasad has launched into the digital sea! First, there was 'Nishtha'—an open-source habit-tracking platform.",
    nextId: 'pirate_web_2'
  },
  pirate_web_2: {
    id: 'pirate_web_2',
    npcName: 'Captain of the Web',
    text: "Then came 'Sadhana', a massive discipline platform with advanced gamification. A true treasure of personal growth!",
    nextId: 'pirate_web_3'
  },
  pirate_web_3: {
    id: 'pirate_web_3',
    npcName: 'Captain of the Web',
    text: "He also built 'Vyuham', a gorgeous Chrome dashboard, and 'TraceMate Pro', an AR tracing PWA. The boy's a legendary shipwright!",
  },

  // --- CLERIC (AI & ML Projects) ---
  cleric_ai_1: {
    id: 'cleric_ai_1',
    npcName: 'Cleric of Artificial Intelligence',
    text: "Blessings upon you. Have you heard of Prasad's miracles in Artificial Intelligence?",
    nextId: 'cleric_ai_2'
  },
  cleric_ai_2: {
    id: 'cleric_ai_2',
    npcName: 'Cleric of Artificial Intelligence',
    text: "He engineered a Professional Assessment Platform using NLP to evaluate scenario-driven answers, and conducts research on Advanced Multi-Concept Memory Models.",
    nextId: 'cleric_ai_3'
  },
  cleric_ai_3: {
    id: 'cleric_ai_3',
    npcName: 'Cleric of Artificial Intelligence',
    text: "He even summoned 'Butler AI', a self-coding multi-agent assistant, and 'Akṣayanidhi', a local-first AI photo archive. True divine creation!",
  },

  // --- GOBLINS (Game Development) ---
  goblin_game_1: {
    id: 'goblin_game_1',
    npcName: 'Goblin Tinkerer',
    text: "Hehe! You like games? Prasad makes games! Very fun games!",
    nextId: 'goblin_game_2'
  },
  goblin_game_2: {
    id: 'goblin_game_2',
    npcName: 'Goblin Tinkerer',
    text: "He built 'On the Way', a joyful delivery-themed mobile game. Perfect for humans ages 12 to 30! You should play it, hehe!",
  },

  // --- COWBOYS (Events & Community) ---
  cowboy_events_1: {
    id: 'cowboy_events_1',
    npcName: 'Community Sheriff',
    text: "Howdy partner. Prasad ain't just a coder; he's a community builder. Roundin' folks up is his specialty.",
    nextId: 'cowboy_events_2'
  },
  cowboy_events_2: {
    id: 'cowboy_events_2',
    npcName: 'Community Sheriff',
    text: "He organized an AI & ML Career Guidance Session for over 220 students. Showed 'em the ropes for placements and internships.",
    nextId: 'cowboy_events_3'
  },
  cowboy_events_3: {
    id: 'cowboy_events_3',
    npcName: 'Community Sheriff',
    text: "He even orchestrated a massive 'Among Us IRL' physical game event for a campus festival. Yeehaw!",
  },

  // --- WITCH (Creative Expression & Philosophy) ---
  witch_creative_1: {
    id: 'witch_creative_1',
    npcName: 'Witch of the Arts',
    text: "Do you feel the emotional depth in the air? Prasad is not just logic... he is art.",
    nextId: 'witch_creative_2'
  },
  witch_creative_2: {
    id: 'witch_creative_2',
    npcName: 'Witch of the Arts',
    text: "He writes original, authentic Shayari in Roman Hindi and Devanagari. No copied spells here—only pure, purpose-driven storytelling.",
    nextId: 'witch_creative_3'
  },
  witch_creative_3: {
    id: 'witch_creative_3',
    npcName: 'Witch of the Arts',
    text: "A rare blend of technical ambition, creative thinking, and emotional intelligence. He builds systems that connect with people both logically and emotionally.",
  },

  // --- WELL (Map Center) ---
  well_interaction: {
    id: 'well_interaction',
    npcName: 'Ancient Well',
    text: "You are in Center of the map",
  },

  // --- WORLD GUIDES (Summoned) ---
  world_guide_1: {
    id: 'world_guide_1',
    npcName: 'World Guide',
    conditionFlag: 'met_guide',
    altNextId: 'world_guide_return_1',
    text: "Welcome to Prasad's World! I came as quickly as I could.",
    nextId: 'world_guide_2'
  },
  world_guide_2: {
    id: 'world_guide_2',
    npcName: 'World Guide',
    text: "This island is a living representation of Prasad's skills, achievements, and journey as a software developer and creator.",
    nextId: 'world_guide_3'
  },
  world_guide_3: {
    id: 'world_guide_3',
    npcName: 'World Guide',
    text: "Feel free to explore! You can find other characters scattered around who can tell you more. Let me know if you need anything!",
    setFlag: 'met_guide'
  },
  world_guide_return_1: {
    id: 'world_guide_return_1',
    npcName: 'World Guide',
    text: "Hey again! Still exploring the map?",
    nextId: 'world_guide_return_2'
  },
  world_guide_return_2: {
    id: 'world_guide_return_2',
    npcName: 'World Guide',
    text: "Remember, just press E near the well if you ever want me to run back over here!",
  }
};
