/**
 * portfolioData.js
 * Prasad Kankhar - Interactive 3D Portfolio Content Registry
 * 
 * Every entry maps directly to a 3D station and trigger on the island.
 * Edit this file anytime to update projects, stats, or text without touching 3D models.
 */

export const portfolioData = {
  // 1. HARBOR DOCKS - HERO & RESUME
  TRIGGER_Harbor_Welcome: {
    stationId: "TRIGGER_Harbor_Welcome",
    category: "Hero & Welcome",
    title: "Prasad Kankhar",
    subtitle: "Computer Science & Engineering Student | Game & Software Developer",
    badge: "Level 0 • Harbor Arrival",
    shortBio: "Passionate about game development, Unreal Engine, C++, artificial intelligence, full-stack systems, and interactive 3D web experiences.",
    primaryTech: ["C++", "Unreal Engine 5", "Three.js", "React", "Node.js", "Python", "JavaScript"],
    resume: {
      label: "Download Official Resume / CV",
      fileUrl: "assets/Prasad_Kankhar_Resume.pdf"
    },
    quickLinks: {
      github: "https://github.com/prasadkankhar10",
      linkedin: "https://linkedin.com/in/prasadkankhar"
    },
    controlsHint: "WASD / Arrows to Move • Space to Jump • [E] or Tap to Interact"
  },

  // 2. VILLAGE INN / TAVERN - ABOUT ME & CREDENTIALS
  TRIGGER_Village_About: {
    stationId: "TRIGGER_Village_About",
    category: "About Me & Journey",
    title: "About Prasad",
    badge: "The Village Tavern",
    education: {
      degree: "B.Tech in Computer Science & Engineering",
      college: "MIT, Chhatrapati Sambhajinagar",
      expectedGraduation: "2027"
    },
    story: "I am a Computer Science and Engineering student who loves learning by building. My primary fascination lies at the intersection of game development and robust software engineering. Alongside building 3D game mechanics in Unreal Engine and C++, I develop full-stack applications, explore AI/RAG architectures, and craft interactive 3D web worlds.",
    engineeringPrinciples: [
      "Build to learn — understanding why something works over memorizing solutions.",
      "Break complex problems into smaller, testable systems.",
      "Debug systematically and improve continuously through iteration.",
      "Use technology as a meaningful tool to solve real human problems."
    ],
    leadership: {
      organization: "ACTS (Association of Computer Technology Students)",
      role: "Technical Coordinator",
      responsibilities: "Coordinating technical initiatives, organizing student technology activities, and hosting college community events like the Among Us interactive tournament."
    },
    ambassadorships: [
      "Google Gemini Campus Ambassador (2026)",
      "Microsoft Learn Student Ambassador",
      "Unreal Engine Student Ambassador",
      "GeeksforGeeks Campus Ambassador",
      "GitHub Student Developer Pack Access"
    ],
    certifications: [
      {
        name: "CS50x: Introduction to Computer Science",
        issuer: "Harvard University / CS50",
        finalProject: "To-Do List Application",
        status: "Completed"
      }
    ]
  },

  // 3. MARKET PLINTH 1 - EXAM PLATFORM
  TRIGGER_Project_ExamPlatform: {
    stationId: "TRIGGER_Project_ExamPlatform",
    category: "Featured Software Project",
    title: "Professional Assessment Platform",
    badge: "Full-Stack Web App",
    techStack: ["React", "Node.js", "PostgreSQL", "NLP", "REST APIs"],
    description: "A structured, secure environment designed for creating, administering, and evaluating professional assessments with natural language processing integration.",
    highlights: [
      "Engineered secure examination workflows and evaluation systems.",
      "Integrated NLP algorithms for automated text analysis and response processing.",
      "Optimized PostgreSQL schema for high-concurrency exam submissions."
    ],
    github: "https://github.com/prasadkankhar10/exam-platform",
    liveDemo: null
  },

  // 4. MARKET PLINTH 2 - SADHANA PWA
  TRIGGER_Project_Sadhana: {
    stationId: "TRIGGER_Project_Sadhana",
    category: "Featured Software Project",
    title: "Sadhana",
    badge: "Progressive Web App (PWA)",
    techStack: ["React", "Node.js", "PostgreSQL", "PWA", "Service Workers"],
    description: "A full-stack Progressive Web Application developed to deliver seamless offline performance, reliable local data caching, and cross-platform productivity workflows.",
    highlights: [
      "Offline-first PWA architecture with Service Worker background caching.",
      "Responsive, clean UI built in React with snappy mobile UX.",
      "Scalable Node.js + PostgreSQL backend for task and habit synchronization."
    ],
    github: "https://github.com/prasadkankhar10/sadhana",
    liveDemo: null
  },

  // 5. MARKET PLINTH 3 - VYUHAM EXTENSION
  TRIGGER_Project_Vyuham: {
    stationId: "TRIGGER_Project_Vyuham",
    category: "Featured Software Project",
    title: "Vyuham",
    badge: "Chrome Browser Extension",
    techStack: ["React", "JavaScript", "Chrome Extension API", "DOM Manipulation"],
    description: "A productivity-focused browser extension leveraging the Chrome Extension API to enhance web navigation, tab management, and user workflow.",
    highlights: [
      "Direct integration with Chrome tabs and browser runtime APIs.",
      "Lightweight React-based popup interface with sub-100ms response time.",
      "Custom workflow shortcuts streamlining daily developer browsing."
    ],
    github: "https://github.com/prasadkankhar10/Vyuham",
    liveDemo: null
  },

  // 6. BLACKSMITH FORGE - GAME DEV ("ON THE WAY")
  TRIGGER_Forge_GameDev: {
    stationId: "TRIGGER_Forge_GameDev",
    category: "Game Development Flagship",
    title: "On The Way",
    badge: "Open-World Mobile Game",
    engine: "Unreal Engine 5",
    developmentMethod: "Blueprints & 3D Systems",
    platform: "Android / Mobile",
    description: "An open-world mobile game centered around delivery quests, responsive vehicle/player movement, and expansive environment exploration.",
    coreSystems: [
      "Custom player and vehicle movement physics tuned for mobile touchscreens.",
      "Open-world delivery quest loop with dynamic destinations and reward mechanics.",
      "Hierarchical LOD management and mobile rendering optimization in Unreal Engine 5."
    ],
    gameDevFocus: {
      interests: ["Open-World Systems", "Game Mechanics", "C++ Gameplay Programming", "Game AI", "Procedural Systems"],
      currentPath: "Advancing from Blueprints into C++ gameplay architecture and large-scale game systems in Unreal Engine 5."
    }
  },

  // 7. SACRED MOONWELL GROVE - SKILLS & LAB
  TRIGGER_Moonwell_Skills: {
    stationId: "TRIGGER_Moonwell_Skills",
    category: "Skills & Interactive Lab",
    title: "The Mana Well • Technical Competencies",
    badge: "The Sacred Grove",
    skills: {
      "Programming Languages": ["C", "C++", "Python", "JavaScript"],
      "Game Development": ["Unreal Engine 5", "Blueprints", "C++ Gameplay", "3D Mechanics", "Open-World Design"],
      "Web & 3D": ["Three.js", "React", "Node.js", "PostgreSQL", "PWA", "HTML5/CSS3", "Blender"],
      "Artificial Intelligence": ["LLMs", "RAG Architecture", "AI Agents", "NLP", "Prompt Engineering"],
      "Computer Science Foundations": ["Data Structures & Algorithms", "OOP", "DBMS", "Operating Systems", "Networks"]
    },
    labExperiments: [
      "Three.js Interactive 3D Shaders & Particles",
      "Marathi RAG System & Local LLM Exploration",
      "Unreal Engine Prototype Mechanics",
      "Browser Extension Integrations"
    ]
  },

  // 8. ANCIENT STONEHENGE - PUZZLE & BEYOND CODE
  TRIGGER_Stonehenge_Puzzle: {
    stationId: "TRIGGER_Stonehenge_Puzzle",
    category: "Interactive Puzzle & Creativity",
    title: "Stonehenge Megaliths • Beyond Code",
    badge: "Ancient Ruins",
    miniGame: {
      title: "6-Pillar Elemental Rune Puzzle",
      instructions: "Inspect the 6 standing stones (Sun, Moon, Fire, Water, Earth, Air). Activating them in the mystical harmonic sequence unlocks the ancient relic.",
      rewardMessage: "Secret Unlocked: 'Technology is the structure; creativity is the soul.'",
    },
    creativeSide: {
      title: "Poetry & Shayari",
      themes: ["Growth", "Struggle", "Ambition", "Purpose", "Human Connection"],
      philosophy: "Combining technology and creative expression to build experiences that are technically meaningful and emotionally resonant."
    }
  },

  // 9. THE CITADEL RIFT PORTAL - CONTACT & FINALE
  TRIGGER_Citadel_Contact: {
    stationId: "TRIGGER_Citadel_Contact",
    category: "Contact & Finale",
    title: "Citadel Arcane Rift • Connect With Me",
    badge: "Mountain Summit",
    promptText: "Step through the portal to initiate collaboration.",
    email: "prasadkankhar10@gmail.com", // Replace with preferred email
    github: "https://github.com/prasadkankhar10",
    linkedin: "https://linkedin.com/in/prasadkankhar",
    collaborationAreas: [
      "Software Engineering & Full-Stack Internships",
      "Game Development & Unreal Engine Roles",
      "AI / RAG / Agentic System Projects",
      "Interactive 3D Web & Open-Source Collaboration"
    ],
    futureVision: [
      "Large-scale immersive 3D games with C++ and Unreal Engine.",
      "AI-driven NPC behavior and procedural interactive worlds.",
      "High-performance interactive 3D web experiences with Three.js."
    ]
  }
};
