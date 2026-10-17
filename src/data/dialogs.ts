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
  building_test_1: {
    id: 'building_test_1',
    npcName: 'Information Guide',
    text: 'Welcome! Walk up to any station or character to learn more about Prasad\'s projects and background.'
  },
  moonwell_commune: {
    id: 'moonwell_commune',
    npcName: 'Skills Pool',
    text: "You are looking at the Technical Skills Pool. This area showcases Prasad's full toolset across C++, TypeScript, 3D graphics, AI systems, and cloud databases."
  },
  rift_ascend: {
    id: 'rift_ascend',
    npcName: 'Summit Teleporter',
    text: "This teleporter takes you to the mountain summit where you can view Prasad's direct contact info and career opportunities."
  },
  // --- WELCOME GUIDE (Personal Profile) ---
  wizard_intro_1: {
    id: 'wizard_intro_1',
    npcName: 'Welcome Guide',
    conditionFlag: 'learned_profile',
    altNextId: 'wizard_return',
    text: "Hello and welcome! This 3D island is an interactive way to explore Prasad Kankhar's software engineering portfolio.",
    nextId: 'wizard_intro_2'
  },
  wizard_intro_2: {
    id: 'wizard_intro_2',
    npcName: 'Welcome Guide',
    text: "Prasad is a software and game engine developer from Buldhana, Maharashtra, passionate about building reliable software and creative digital experiences.",
    nextId: 'wizard_intro_3'
  },
  wizard_intro_3: {
    id: 'wizard_intro_3',
    npcName: 'Welcome Guide',
    text: "Take a walk through the courtyard to meet the Academic Guide and learn about his university studies and leadership roles!",
    setFlag: 'learned_profile'
  },
  wizard_return: {
    id: 'wizard_return',
    npcName: 'Welcome Guide',
    text: "You have discovered all key areas of the portfolio! Feel free to review his project stations or contact him directly from the menu."
  },

  // --- ACADEMICS & LEADERSHIP ---
  knight_academics_1: {
    id: 'knight_academics_1',
    npcName: 'Academic Guide',
    conditionFlag: 'learned_academics',
    altNextId: 'knight_return',
    text: "Hello! Looking for Prasad's academic background? He is pursuing a B.Tech in Computer Science at MIT, Chhatrapati Sambhajinagar.",
    nextId: 'knight_academics_2'
  },
  knight_academics_2: {
    id: 'knight_academics_2',
    npcName: 'Academic Guide',
    text: "Alongside his studies, he serves as Technical Coordinator for ACTS and Campus Mantri for GeeksforGeeks, helping organize workshops and hackathons.",
    nextId: 'knight_academics_3'
  },
  knight_academics_3: {
    id: 'knight_academics_3',
    npcName: 'Academic Guide',
    text: "He was also selected as a Google Student Ambassador! Head over to the tech workshop in the woods to learn about the programming languages he uses.",
    setFlag: 'learned_academics'
  },
  knight_return: {
    id: 'knight_return',
    npcName: 'Academic Guide',
    text: "Prasad's education and leadership records are saved in your Portfolio Journal (M). Have a great walk around!"
  },

  // --- TECHNICAL EXPERTISE ---
  elf_tech_1: {
    id: 'elf_tech_1',
    npcName: 'Engineering Specialist',
    conditionFlag: 'learned_tech',
    altNextId: 'elf_return',
    text: "Hi there! Want to know what tools Prasad uses? His primary programming languages are C++, TypeScript, JavaScript, Python, and SQL.",
    nextId: 'elf_tech_2'
  },
  elf_tech_2: {
    id: 'elf_tech_2',
    npcName: 'Engineering Specialist',
    text: "He develops web applications with React and Node.js, and builds 3D simulations and games using Three.js, WebGL, and Unreal Engine.",
    nextId: 'elf_tech_3'
  },
  elf_tech_3: {
    id: 'elf_tech_3',
    npcName: 'Engineering Specialist',
    text: "He prioritizes fast performance and clean architectures. Walk down to the harbor docks to check out his web applications!",
    setFlag: 'learned_tech'
  },
  elf_return: {
    id: 'elf_return',
    npcName: 'Engineering Specialist',
    text: "You've already reviewed his tech stack! You can check the full breakdown anytime in the Skills station."
  },

  // --- WEB & SOFTWARE ENGINEERING ---
  pirate_web_1: {
    id: 'pirate_web_1',
    npcName: 'Web Systems Lead',
    conditionFlag: 'learned_web',
    altNextId: 'pirate_return',
    text: "Welcome to the docks! Let me share a few web apps Prasad has built and deployed. First is 'Nishtha'—an open-source habit tracking platform.",
    nextId: 'pirate_web_2'
  },
  pirate_web_2: {
    id: 'pirate_web_2',
    npcName: 'Web Systems Lead',
    text: "He also engineered 'Sadhana', a full productivity web app with offline sync and clean goal tracking.",
    nextId: 'pirate_web_3'
  },
  pirate_web_3: {
    id: 'pirate_web_3',
    npcName: 'Web Systems Lead',
    text: "He also created 'Vyuham', a modern Chrome extension dashboard. Head over to the central area to see his AI projects!",
    setFlag: 'learned_web'
  },
  pirate_return: {
    id: 'pirate_return',
    npcName: 'Web Systems Lead',
    text: "His web applications and live links are in your Portfolio Journal. Check out the harbor vessel if you want to send him an email!"
  },

  // --- AI & ML PROJECTS ---
  cleric_ai_1: {
    id: 'cleric_ai_1',
    npcName: 'AI & Data Lead',
    conditionFlag: 'learned_ai',
    altNextId: 'cleric_return',
    text: "Hello! Interested in Prasad's work with Artificial Intelligence and Machine Learning?",
    nextId: 'cleric_ai_2'
  },
  cleric_ai_2: {
    id: 'cleric_ai_2',
    npcName: 'AI & Data Lead',
    text: "He built an Automated Assessment Platform using Natural Language Processing (NLP) to objectively evaluate long-form student answers.",
    nextId: 'cleric_ai_3'
  },
  cleric_ai_3: {
    id: 'cleric_ai_3',
    npcName: 'AI & Data Lead',
    text: "He also developed 'Butler AI'—an assistant capable of automating computer tasks and generating code. Next, check out the game development stations in the valley!",
    setFlag: 'learned_ai'
  },
  cleric_return: {
    id: 'cleric_return',
    npcName: 'AI & Data Lead',
    text: "Prasad's AI projects are recorded in your journal. Feel free to explore the interactive demos nearby!"
  },

  // --- GAME DEVELOPMENT ---
  goblin_game_1: {
    id: 'goblin_game_1',
    npcName: 'Game Developer',
    conditionFlag: 'learned_games',
    altNextId: 'goblin_return',
    text: "Hey there! Prasad is passionate about building games and real-time graphics engines.",
    nextId: 'goblin_game_2'
  },
  goblin_game_2: {
    id: 'goblin_game_2',
    npcName: 'Game Developer',
    text: "He engineered 'On the Way', an engaging delivery mobile game, as well as 'One More Move', a custom turn-based puzzle game engine written in C++17.",
    nextId: 'goblin_game_3'
  },
  goblin_game_3: {
    id: 'goblin_game_3',
    npcName: 'Game Developer',
    text: "Visit the marketplace nearby to learn about the tech events and student workshops he has organized!",
    setFlag: 'learned_games'
  },
  goblin_return: {
    id: 'goblin_return',
    npcName: 'Game Developer',
    text: "You've seen his game projects! You can inspect the source code and details at the game station."
  },

  // --- COMMUNITY & EVENTS ---
  cowboy_events_1: {
    id: 'cowboy_events_1',
    npcName: 'Community Lead',
    conditionFlag: 'learned_events',
    altNextId: 'cowboy_return',
    text: "Welcome! Prasad doesn't just code in isolation—he actively builds student and developer communities.",
    nextId: 'cowboy_events_2'
  },
  cowboy_events_2: {
    id: 'cowboy_events_2',
    npcName: 'Community Lead',
    text: "He organized an AI & Career Guidance Session that helped over 220 students understand internships and industry skills.",
    nextId: 'cowboy_events_3'
  },
  cowboy_events_3: {
    id: 'cowboy_events_3',
    npcName: 'Community Lead',
    text: "He also coordinated campus tech festivals and interactive coding events. Check out the creative writing area next!",
    setFlag: 'learned_events'
  },
  cowboy_return: {
    id: 'cowboy_return',
    npcName: 'Community Lead',
    text: "His community leadership details are saved in your journal."
  },

  // --- CREATIVE EXPRESSION & PHILOSOPHY ---
  witch_creative_1: {
    id: 'witch_creative_1',
    npcName: 'Creative Design Lead',
    conditionFlag: 'learned_creative',
    altNextId: 'witch_return',
    text: "Hello! Beyond pure engineering, Prasad strongly values creative storytelling, writing, and user experience.",
    nextId: 'witch_creative_2'
  },
  witch_creative_2: {
    id: 'witch_creative_2',
    npcName: 'Creative Design Lead',
    text: "He writes authentic poetry and Hindi/Devanagari Shayari, focusing on growth, discipline, and purpose.",
    nextId: 'witch_creative_3'
  },
  witch_creative_3: {
    id: 'witch_creative_3',
    npcName: 'Creative Design Lead',
    text: "His goal is building software that feels both technologically sound and genuinely human to use. You've now seen all main areas of his journey!",
    setFlag: 'learned_creative'
  },
  witch_return: {
    id: 'witch_return',
    npcName: 'Creative Design Lead',
    text: "Prasad's creative philosophy is recorded in your journal."
  },

  // --- VILLAGE CENTER ---
  well_interaction: {
    id: 'well_interaction',
    npcName: 'Village Center',
    text: "You are at the Village Center. From here you can access all project districts across the island.",
  },

  // --- WORLD GUIDES ---
  world_guide_1: {
    id: 'world_guide_1',
    npcName: 'Tour Guide',
    conditionFlag: 'met_guide',
    altNextId: 'world_guide_return_1',
    text: "Welcome to Prasad's 3D Portfolio! Need a quick orientation?",
    nextId: 'world_guide_2'
  },
  world_guide_2: {
    id: 'world_guide_2',
    npcName: 'Tour Guide',
    text: "This interactive island showcases Prasad's real-world software projects, certifications, and developer skills.",
    nextId: 'world_guide_3'
  },
  world_guide_3: {
    id: 'world_guide_3',
    npcName: 'Tour Guide',
    text: "Feel free to walk around with WASD, press [M] for your journal, or press [N] for the map. Let me know if you need anything!",
    setFlag: 'met_guide'
  },
  world_guide_return_1: {
    id: 'world_guide_return_1',
    npcName: 'Tour Guide',
    text: "Hi again! Enjoying your walk around the portfolio?",
    nextId: 'world_guide_return_2'
  },
  world_guide_return_2: {
    id: 'world_guide_return_2',
    npcName: 'Tour Guide',
    text: "Tip: You can press [E] in front of any station monument to open its complete project case study and live demo.",
  },
  
  // --- MARKETPLACE NPCs ---
  blacksmith_talk_1: {
    id: 'blacksmith_talk_1',
    npcName: 'Systems Engineer',
    text: "Welcome to the workshop! Looking for details on Prasad's technical foundations?",
    nextId: 'blacksmith_talk_2'
  },
  blacksmith_talk_2: {
    id: 'blacksmith_talk_2',
    npcName: 'Systems Engineer',
    text: "He specializes in C++, JavaScript, TypeScript, React, Node.js, and Firebase.",
    nextId: 'blacksmith_talk_3'
  },
  blacksmith_talk_3: {
    id: 'blacksmith_talk_3',
    npcName: 'Systems Engineer',
    text: "He focuses on clean code structure, fast rendering, and reliable backends."
  },

  cowboy_shop_1: {
    id: 'cowboy_shop_1',
    npcName: 'Events Coordinator',
    text: "Hello! Glad to see you visiting the island.",
    nextId: 'cowboy_shop_2'
  },
  cowboy_shop_2: {
    id: 'cowboy_shop_2',
    npcName: 'Events Coordinator',
    text: "Prasad has extensive experience hosting student tech events and mentorship workshops.",
    nextId: 'cowboy_shop_3'
  },
  cowboy_shop_3: {
    id: 'cowboy_shop_3',
    npcName: 'Events Coordinator',
    text: "He hosted an AI & Career Guidance session with over 220 attendees, helping students plan their careers."
  },

  casual_shop_1: {
    id: 'casual_shop_1',
    npcName: 'Software Architect',
    text: "Welcome! Looking into how Prasad builds web systems?",
    nextId: 'casual_shop_2'
  },
  casual_shop_2: {
    id: 'casual_shop_2',
    npcName: 'Software Architect',
    text: "He builds robust architectures with clear data models and fast response times.",
    nextId: 'casual_shop_3'
  },
  casual_shop_3: {
    id: 'casual_shop_3',
    npcName: 'Software Architect',
    text: "His applications Nishtha and Sadhana are great examples of clean full-stack design."
  },

  witch_shop_1: {
    id: 'witch_shop_1',
    npcName: 'UI/UX Designer',
    text: "Hello! Great to meet you.",
    nextId: 'witch_shop_2'
  },
  witch_shop_2: {
    id: 'witch_shop_2',
    npcName: 'UI/UX Designer',
    text: "Prasad pays close attention to user interface design, visual hierarchy, and smooth interactions.",
    nextId: 'witch_shop_3'
  },
  witch_shop_3: {
    id: 'witch_shop_3',
    npcName: 'UI/UX Designer',
    text: "He believes software should be intuitive, accessible, and enjoyable for everyone."
  },

  goblin_fruit_1: {
    id: 'goblin_fruit_1',
    npcName: 'App Tester',
    text: "Hi there! Have you tested Prasad's mobile game yet?",
    nextId: 'goblin_fruit_2'
  },
  goblin_fruit_2: {
    id: 'goblin_fruit_2',
    npcName: 'App Tester',
    text: "He built 'On the Way', a fun delivery puzzle game.",
    nextId: 'goblin_fruit_3'
  },
  goblin_fruit_3: {
    id: 'goblin_fruit_3',
    npcName: 'App Tester',
    text: "You can check out its gameplay and tech details at the game station in the valley!"
  }
};
