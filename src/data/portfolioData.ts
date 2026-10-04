/**
 * portfolioData.ts
 * Prasad Kankhar - Complete Master Candidate Portfolio Registry
 * Single Source of Truth (SSOT) derived from COMPLETE-CANDIDATE-MASTER-DOSSIER.md
 * 
 * Maps directly to 26 interactive 3D stations across the fantasy world.
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
  metrics?: string[];
  primaryTech?: string[];
  techStack?: string[];
  highlights?: string[];
  architecture?: string[];
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
  // =========================================================================
  // 1. CORE IDENTITY, CREDENTIALS & FOUNDATIONS
  // =========================================================================

  TRIGGER_Harbor_Welcome: {
    stationId: "TRIGGER_Harbor_Welcome",
    category: "Core & Accreditations",
    title: "Prasad Anil Kankhar",
    subtitle: "Software Development Engineer (SDE) | Full-Stack & AI Systems | 3D Graphics",
    badge: "Level 0 • Harbor Arrival",
    shortBio: "Results-driven Software Development Engineer with deep expertise in C++, TypeScript, Python, and scalable distributed architectures. Architect of 19 verified software systems spanning bare-metal C++17 game engines, autonomous multi-agent operating systems, and production Indic RAG platforms with over 100,000+ lines of audited code. Solved 850+ algorithmic coding problems across LeetCode and GeeksforGeeks.",
    metrics: [
      "100,000+ Lines Audited Code",
      "19 Verified Software Projects",
      "854+ Algorithmic Solved",
      "Harvard CS50x Certified"
    ],
    primaryTech: ["C++ (17/20)", "Python", "TypeScript", "Three.js / WebGL", "FastAPI", "React 19", "Unreal Engine 5.4"],
    resume: {
      label: "Download Official Resume / Master Dossier",
      fileUrl: "assets/Prasad_Kankhar_Resume.pdf"
    },
    quickLinks: {
      github: "https://github.com/prasadkankhar10",
      linkedin: "https://linkedin.com/in/prasad-kankhar"
    },
    controlsHint: "WASD / Arrows to Move • Space to Jump • [E] to Inspect Stations • Click Station list to Teleport"
  },

  TRIGGER_Village_About: {
    stationId: "TRIGGER_Village_About",
    category: "Core & Accreditations",
    title: "Candidate Journey & Education",
    subtitle: "B.Tech in Computer Science & Engineering (2023–2027)",
    badge: "The Village Tavern",
    education: {
      degree: "Bachelor of Technology in Computer Science & Engineering",
      college: "Maharashtra Institute of Technology (MIT), BAMU, Chhatrapati Sambhajinagar",
      expectedGraduation: "June 2027",
      cgpa: "7.34 / 10.0 (Verified Academic Record)",
      coursework: [
        "Data Structures & Algorithms",
        "Operating Systems",
        "Database Management Systems (DBMS)",
        "Computer Networks",
        "Object-Oriented Programming in C++",
        "Discrete Mathematics",
        "Theory of Computation"
      ]
    },
    story: "I am a Computer Science & Engineering student driven by first-principles systems engineering. My engineering philosophy focuses on understanding exactly how bits, memory, and graphics pipelines function under the hood—from zero-leak C++ RAII buffers to GPU instancing and low-latency vector retrieval engines.",
    engineeringPrinciples: [
      "Zero-Magic Systems: Understanding low-level memory allocation, hardware execution, and cache lines.",
      "Mathematical Determinism: Proving algorithms (e.g. BFS golden paths, 3-sigma Z-scores) over trial-and-error.",
      "Google XYZ Impact: Accomplished [X] as measured by [Y], by doing [Z].",
      "User-Centric Architecture: Building high-performance, accessible software that solves real human needs."
    ]
  },

  TRIGGER_Hall_Certifications: {
    stationId: "TRIGGER_Hall_Certifications",
    category: "Core & Accreditations",
    title: "Harvard CS50x Hall of Honor",
    subtitle: "Official Harvard University Certification & Low-Level Foundations",
    badge: "Verified Credential",
    metrics: [
      "HarvardX Verified",
      "100% Comprehensive",
      "C, Python, SQL, Memory",
      "Low-Level Data Structures"
    ],
    certifications: [
      {
        name: "CS50x: Introduction to Computer Science",
        issuer: "Harvard University (edX / HarvardX)",
        credentialId: "3e980807-b342-4380-8d42-496a9788e810",
        verifyUrl: "https://certificates.cs50.io/3e980807-b342-4380-8d42-496a9788e810.pdf?size=letter",
        skillsCovered: "Memory pointers, heap/stack allocation, buffer safety in C, asymptotic complexity (Big-O), Hash Tables, Tries, Binary Search Trees, SQL queries, and Python web architectures.",
        status: "Officially Certified & Verified"
      }
    ],
    highlights: [
      "Mastered low-level pointer arithmetic, memory management, and dynamic memory allocation in ANSI C.",
      "Implemented fundamental data structures from scratch: Hash tables, linked lists, and trie-based spell checkers.",
      "Engineered full-stack capstone projects demonstrating database normalization and robust error handling."
    ]
  },

  TRIGGER_Arena_Algorithms: {
    stationId: "TRIGGER_Arena_Algorithms",
    category: "Core & Accreditations",
    title: "The Algorithmic Arena",
    subtitle: "854+ Algorithmic Problems Solved across LeetCode & GeeksforGeeks",
    badge: "70 LeetCode Hard Solved",
    metrics: [
      "854+ Total Problems Solved",
      "350 LeetCode (70 Hard, 179 Medium)",
      "504+ GeeksforGeeks Solved",
      "Campus Mantri Lead"
    ],
    competitiveMetrics: {
      totalSolved: 854,
      leetcode: {
        total: 350,
        hard: 70,
        medium: 179,
        easy: 101,
        profileUrl: "https://leetcode.com/u/prasadkankhar/"
      },
      geeksforgeeks: {
        total: 504,
        role: "Campus Mantri Lead & Top Departmental Solver",
        profileUrl: "https://www.geeksforgeeks.org/profile/prasadka19y4"
      },
      coreTopics: [
        "Graph Algorithms (BFS, DFS, Dijkstra, Topological Sort)",
        "Dynamic Programming (1D, 2D, Knapsack, Digit DP)",
        "Binary Trees & Binary Search Trees (LCA, Traversals, Views)",
        "Heaps & Priority Queues",
        "Trie & String Hashing (KMP, Rabin-Karp)",
        "Sliding Window & Two Pointers",
        "Disjoint Set Union (DSU / Union-Find)"
      ]
    },
    highlights: [
      "Solved 70 LeetCode Hard problems encompassing complex graph traversals, interval DP, and multi-state search.",
      "Proven production application: Engineered 2-stage BFS puzzle solver in One More Move and 768-dim FAISS cosine similarity in MaraRAG.",
      "Organized departmental coding competitions and mentored 350+ students in algorithmic problem-solving circles."
    ]
  },

  TRIGGER_Leadership_Pavilion: {
    stationId: "TRIGGER_Leadership_Pavilion",
    category: "Core & Accreditations",
    title: "Guildmaster Leadership Pavilion",
    subtitle: "Developer Advocacy, Technical Mentorship & Departmental Leadership",
    badge: "350+ Students Mentored",
    metrics: [
      "GFG Campus Mantri",
      "ACTS Technical Coordinator",
      "15 Team Coordinators Led",
      "National Contest Director"
    ],
    leadershipRoles: [
      {
        title: "Campus Mantri (Campus Ambassador)",
        organization: "GeeksforGeeks (GFG) • 2024–Present",
        impact: "Facilitated 350+ student registrations for national-level coding contests and technical workshops. Conducted weekly problem-solving circles on Data Structures & Algorithms (DSA), solving 504+ problems on the platform."
      },
      {
        title: "Technical Coordinator",
        organization: "Association of Computer Technology Students (ACTS), CSE Dept • 2024–Present",
        impact: "Led technical committee for annual institutional symposiums, hackathons, and exhibitions. Managed live judging portal deployments and scoring infrastructure while coordinating 15 student coordinators."
      }
    ],
    ambassadorships: [
      "GeeksforGeeks Campus Mantri (2024–Present)",
      "Microsoft Learn Student Ambassador",
      "Unreal Engine Student Ambassador",
      "GitHub Student Developer Pack Community"
    ]
  },

  // =========================================================================
  // 2. ARTIFICIAL INTELLIGENCE, AGENTS & NLP
  // =========================================================================

  TRIGGER_Project_ButlerOS: {
    stationId: "TRIGGER_Project_ButlerOS",
    category: "AI & Autonomous Systems",
    title: "Butler OS • Multi-Agent Operating System",
    subtitle: "Autonomous Desktop Multi-Agent OS with Local Voice & Sandboxed Execution",
    badge: "Electron 30 + FastAPI",
    metrics: [
      "Sub-200ms Voice Latency",
      "768-dim Vector Memory",
      "Zero-Cloud Speech Pipeline",
      "Multi-Agent Broker"
    ],
    techStack: ["Electron 30", "React 18", "FastAPI", "WebSockets", "SQLite WAL", "ONNX Silero VAD", "faster-whisper", "Kokoro-TTS"],
    description: "An autonomous desktop AI operating system orchestrating multi-agent collaboration with a centralized Supervisor broker, sandboxed terminal code execution worker, and real-time local voice interface.",
    highlights: [
      "Architected a centralized Supervisor broker orchestrating task routing across specialized LLM agents with automated retry fallbacks.",
      "Built a hybrid SQLite long-term memory engine with 768-dimensional float32 vector BLOBs for cosine similarity retrieval and dynamic knowledge graph extraction.",
      "Engineered an offline speech pipeline utilizing ONNX Silero VAD, faster-whisper STT, and Kokoro neural voice synthesis for sub-200ms latency.",
      "Constructed bidirectional WebSocket telemetry and Telegram bridge for remote system execution, screenshot captures, and proactive morning schedule briefings."
    ],
    github: "https://github.com/prasadkankhar10/butler-os",
    liveDemo: null
  },

  TRIGGER_Project_MaraRAG: {
    stationId: "TRIGGER_Project_MaraRAG",
    category: "AI & Autonomous Systems",
    title: "MaraRAG • Indic Vernacular RAG Platform",
    subtitle: "Devanagari Normalization & Sub-Second Marathi Legal Document Question Answering",
    badge: "FAISS + Groq LLaMA 3.1",
    metrics: [
      "768-dim SBERT Vectors",
      "Sub-Second Generation",
      "Danda Boundary Chunking",
      "Zero Multi-Lingual Drift"
    ],
    techStack: ["FastAPI", "React 18", "Vite", "FAISS CPU", "L3Cube Marathi-SBERT", "Groq LLaMA 3.1 8B", "Docker", "SQLAlchemy"],
    description: "An enterprise Vernacular Retrieval-Augmented Generation (RAG) platform tailored for Devanagari script, achieving high-precision question answering over complex Marathi legal and government documents.",
    highlights: [
      "Built a domain-specific text preprocessing pipeline incorporating Indic NLP normalization and Danda (।) sentence-boundary chunking to eliminate hallucinations.",
      "Indexed 768-dimensional normalized document vectors using FAISS CPU vector stores with cosine similarity ranking and sub-second generation via Groq LLaMA 3.1 8B.",
      "Formulated an automated LLMOps evaluation schema in SQLAlchemy logging Mean Reciprocal Rank (MRR), BERTScore, and Ragas faithfulness metrics.",
      "Packaged the entire multi-container service in Docker with sub-500ms cold start query endpoints."
    ],
    github: "https://github.com/prasadkankhar10/marathi-rag",
    liveDemo: null
  },

  TRIGGER_Project_Akshayanidhi: {
    stationId: "TRIGGER_Project_Akshayanidhi",
    category: "AI & Autonomous Systems",
    title: "Akshayanidhi • Zero-Cost AI Media Archive",
    subtitle: "Facial Recognition Clustering & Semantic Photo Search with Edge Proxy",
    badge: "InsightFace + CLIP + Cloudflare",
    metrics: [
      "512-dim Face Embeddings",
      "75% Latency Reduction",
      "10,000+ Photo Virtual Grid",
      "Zero-Cost Cloud Storage"
    ],
    techStack: ["React 18", "Node.js", "Express", "SQLite WAL", "InsightFace buffalo_sc", "OpenAI CLIP (ViT-B/32)", "Cloudflare Workers", "ChromaDB"],
    description: "A private cloud media archive leveraging Telegram cloud channels for zero-cost, unlimited photo and 4K video backups with local neural face clustering and semantic natural-language search.",
    highlights: [
      "Integrated InsightFace buffalo_sc for 512-dimensional facial recognition clustering and OpenAI CLIP (ViT-B/32) for natural-language semantic photo search.",
      "Deployed a Cloudflare Worker edge proxy with HTTP Range header streaming and 30-day immutable caching, reducing media delivery latency by 75%.",
      "Engineered a virtualized 60 FPS media grid in React capable of smoothly rendering 10,000+ photo cards with sub-50ms thumbnail decodes.",
      "Implemented SQLite WAL mode metadata indexing with zero memory leaks across large photo collections."
    ],
    github: "https://github.com/prasadkankhar10/akshayanidhi",
    liveDemo: null
  },

  TRIGGER_Project_LifeManager: {
    stationId: "TRIGGER_Project_LifeManager",
    category: "AI & Autonomous Systems",
    title: "Autonomous Telegram-to-Notion OS",
    subtitle: "Natural Language Life Manager with 4:00 AM Day Rollover & Atomic Idempotency",
    badge: "FastAPI + Gemini API + Notion",
    metrics: [
      "6 Relational Databases Synced",
      "4:00 AM Rollover Logic",
      "Zero-Duplicate Webhooks",
      "Autonomous 6h AI Processor"
    ],
    techStack: ["FastAPI", "Python 3.10+", "PostgreSQL", "Notion API v2026", "Google Gemini Structured JSON API", "Telegram Bot API"],
    description: "An autonomous Telegram-to-Notion operating system synchronizing natural-language voice and text logs across 6 distinct Notion relational databases in real time.",
    highlights: [
      "Implemented Google Gemini structured JSON extraction with a 4:00 AM logical day rollover algorithm to group late-night logs into the previous day's waking cycle.",
      "Built an autonomous 6-hour background AI Note Processor that scans unreviewed notes and automatically converts unstructured brainstorms into scheduled action items.",
      "Constructed a webhook idempotency layer backed by atomic PostgreSQL transactions to prevent duplicate transaction recording during Telegram network retries.",
      "Automated financial expense categorization, workout logging, and journal entries with sub-second Notion API synchronization."
    ],
    github: "https://github.com/prasadkankhar10/life_manager",
    liveDemo: null
  },

  TRIGGER_Project_Sahaj: {
    stationId: "TRIGGER_Project_Sahaj",
    category: "AI & Autonomous Systems",
    title: "Sahaj • Multilingual Accessibility Assistant",
    subtitle: "Vision Transformer Document Reader & Neural TTS for Visually Impaired Users",
    badge: "Top 5 Hackathon Finalist",
    metrics: [
      "92% Character OCR Accuracy",
      "6 Indic Languages Supported",
      "ViT-GPT2 Image Captioning",
      "Real-Time Neural Speech"
    ],
    techStack: ["Python", "Streamlit", "EasyOCR (CRAFT+CRNN)", "Hugging Face ViT-GPT2", "pyttsx3", "gTTS", "MyMemory Translation"],
    description: "A multilingual assistive vision system extracting and translating text from complex physical documents and describing scenes for visually impaired individuals.",
    highlights: [
      "Integrated EasyOCR dual-framework detection (CRAFT) and recognition (CRNN) to extract bilingual Latin and Devanagari text with 92% character accuracy.",
      "Deployed Hugging Face Vision Transformer (ViT-GPT2) image captioning paired with MyMemory multi-language neural translation across 6 Indic languages.",
      "Engineered an offline-first speech generation engine using pyttsx3 with automatic fallback to gTTS when online.",
      "Awarded Top 5 Finalist in Institutional Hackathon out of 40+ engineering teams."
    ],
    github: "https://github.com/prasadkankhar10/sahaj-assistant",
    liveDemo: null
  },

  // =========================================================================
  // 3. LOW-LEVEL SYSTEMS, C++ & GAME ENGINES
  // =========================================================================

  TRIGGER_Project_OneMoreMove: {
    stationId: "TRIGGER_Project_OneMoreMove",
    category: "Game Engines & Low-Level",
    title: "One More Move • C++17 Roguelike Engine",
    subtitle: "Bare-Metal Turn-Based Puzzle Engine with Procedural Audio & Android NDK",
    badge: "C++17 + SDL3 + Android NDK",
    metrics: [
      "Locked 60 FPS under 35MB RAM",
      "4,869 Lines Native C++",
      "100% Solvable BFS Golden Path",
      "Real-Time PCM Audio Synthesis"
    ],
    techStack: ["C++17", "SDL3 (Simple DirectMedia Layer 3.2)", "CMake", "Android NDK r26b", "Gradle", "GitHub Actions CI/CD"],
    description: "A cross-platform turn-based roguelike puzzle game engineered completely from scratch in modern C++17 and SDL3, supporting 24 campaign levels with locked 60 FPS performance and sub-35MB memory usage.",
    highlights: [
      "Engineered 4,869 lines of custom native C++ across 25 source files with zero third-party game engine dependencies and zero memory leaks (strict RAII).",
      "Implemented a two-stage Breadth-First Search (BFS) level generation algorithm that verifies an optimal 'Golden Path' to mathematically guarantee 100% puzzle solvability on every seed.",
      "Synthesized procedural 8-bit chiptune audio and dynamic-tempo background music directly into SDL_AudioStream PCM buffers using mathematical sine and square waveforms with zero external audio assets.",
      "Configured an automated GitHub Actions CI/CD pipeline cross-compiling native C++ code via Android NDK across multiple ABIs (arm64-v8a, armeabi-v7a, x86_64) into downloadable release APKs."
    ],
    github: "https://github.com/prasadkankhar10/one-more-move",
    liveDemo: null
  },

  TRIGGER_Forge_GameDev: {
    stationId: "TRIGGER_Forge_GameDev",
    category: "Game Engines & Low-Level",
    title: "On The Way • 3D Mobile Vehicle Simulator",
    subtitle: "Open-World Delivery Simulation with Chaos Physics & Smartphone GPS HUD",
    badge: "Unreal Engine 5.4 + Blueprints",
    metrics: [
      "Chaos Physics Suspension Tuning",
      "Diegetic World-to-Screen GPS",
      "Waypoint Civilian Traffic AI",
      "Mobile GPU Optimization"
    ],
    techStack: ["Unreal Engine 5.4", "Blueprints", "Chaos Physics", "UMG Slate UI", "Android NDK", "LOD Hierarchies"],
    description: "A full 3D mobile delivery simulation game in Unreal Engine 5.4 featuring custom vehicle handling, Chaos physics suspension tuning, and dynamic package delivery objectives across expansive island environments.",
    highlights: [
      "Engineered realistic vehicle suspension and drifting physics tuned specifically for touch input and mobile gyroscope controls.",
      "Designed a diegetic in-game smartphone GPS navigation HUD with custom world-to-screen coordinate projection shaders, interactive minimap waypoints, and battery simulation.",
      "Engineered waypoint-based civilian traffic AI and dynamic delivery drop-off triggers with comprehensive performance profiling for mobile GPU memory constraints.",
      "Optimized rendering through hierarchical LOD meshes and mobile forward shading pipelines."
    ],
    engine: "Unreal Engine 5.4",
    developmentMethod: "Blueprints & C++ Systems",
    platform: "Android Mobile & PC",
    coreSystems: [
      "Chaos Physics Vehicle Component Tuning",
      "World-to-Screen Smartphone Minimap Shaders",
      "Dynamic Package Delivery State Machine",
      "Waypoint Spline Civilian Traffic AI"
    ],
    gameDevFocus: {
      interests: ["Open-World Systems", "Game Mechanics", "C++ Gameplay Programming", "Game AI", "Procedural Systems"],
      currentPath: "Advancing from Blueprints into high-performance C++ gameplay architectures and large-scale game systems in Unreal Engine 5.4."
    }
  },

  TRIGGER_Project_KnightsAdventure: {
    stationId: "TRIGGER_Project_KnightsAdventure",
    category: "Game Engines & Low-Level",
    title: "Knight's Adventure • 2D Retro Platformer",
    subtitle: "Kinematic Platformer Engine with Coyote-Time Buffering & WebAssembly",
    badge: "Godot Engine 4 + WASM",
    metrics: [
      "< 1.2s Cold Boot Load Time",
      "Web Audio Worklet Multithreading",
      "Pixel-Perfect Kinematic Physics",
      "PWA Installable"
    ],
    techStack: ["Godot Engine 4", "GDScript", "WebAssembly (WASM)", "WebGL 2.0", "Web Audio Worklet", "Progressive Web App"],
    description: "A 2D retro action-platformer in Godot Engine 4 utilizing custom CharacterBody2D kinematic physics, coyote-time jump buffering, and raycast edge-detection enemy AI.",
    highlights: [
      "Cross-compiled game engine runtimes to WebAssembly (WASM) and WebGL 2.0, achieving instantaneous cold-boot load times (< 1.2s) in desktop and mobile web browsers.",
      "Implemented custom kinematic character controller featuring coyote-time, jump buffering, and variable jump height for responsive retro platforming feel.",
      "Implemented Web Audio Worklet multi-threading to eliminate audio stutter on mobile Safari and packaged the platform as an installable Progressive Web App (PWA).",
      "Engineered state-machine based enemy patrol and attack AI using RayCast2D edge and obstacle sensors."
    ],
    github: "https://github.com/prasadkankhar10/knights-adventure",
    liveDemo: null
  },

  // =========================================================================
  // 4. SPATIAL COMPUTING, 3D WEB GRAPHICS & WEBAR
  // =========================================================================

  TRIGGER_Project_RealmWebAR: {
    stationId: "TRIGGER_Project_RealmWebAR",
    category: "Spatial Computing & WebAR",
    title: "Realm of Prasad • WebAR Tabletop Diorama",
    subtitle: "Markerless Tabletop AR Diorama with Rapier 3D Physics Normalization",
    badge: "8th Wall SLAM + WebXR + R3F",
    metrics: [
      "11,000+ Lines 3D TypeScript",
      "0.015x Rapier Physics Scaling",
      "4-Tier Spatial Fallback",
      "Markerless Surface SLAM"
    ],
    techStack: ["TypeScript", "React 19", "React Three Fiber", "8th Wall SLAM", "Rapier 3D", "WebXR Device API", "AR.js"],
    description: "A markerless WebAR diorama projection mode projecting a miniature fantasy island directly onto physical tabletop surfaces using 8th Wall SLAM computer vision.",
    highlights: [
      "Built a markerless WebAR diorama projection mode projecting a miniature fantasy island directly onto physical tabletop surfaces using 8th Wall SLAM computer vision.",
      "Engineered PhysicsScaler, monkey-patching Rapier 3D physics raycasting internals to normalize miniature diorama coordinates (× 0.015) and preserve terrain collisions.",
      "Created a 4-tier spatial fallback architecture supporting 8th Wall SLAM, WebXR floor hit-testing, AR.js Hiro markers, and desktop 3D with an automated mobile QR hand-off modal.",
      "Optimized WebGL draw calls and GPU fill-rate for high-framerate mobile Safari and Chrome AR viewports."
    ],
    github: "https://github.com/prasadkankhar10/portfolio_AR",
    liveDemo: null
  },

  TRIGGER_Project_TraceMateAR: {
    stationId: "TRIGGER_Project_TraceMateAR",
    category: "Spatial Computing & WebAR",
    title: "TraceMate Pro • WebAR Camera Tracing PWA",
    subtitle: "Optical Template Matching & Gesture Engine for Physical Sketch Projection",
    badge: "WebRTC + Canvas SAD Algorithm",
    metrics: [
      "Pure JS SAD Optical Matching",
      "Sub-Pixel Gesture Precision",
      "Zero-Lag Canvas Compositing",
      "WebRTC Stream Processing"
    ],
    techStack: ["Vanilla JavaScript", "HTML5 Canvas 2D", "WebRTC MediaDevices API", "MediaRecorder API", "Service Workers"],
    description: "A browser-based augmented reality drawing projector allowing users to trace physical sketches onto paper using real-time camera overlay compositing.",
    highlights: [
      "Implemented a pure JavaScript Sum of Absolute Differences (SAD) optical template matching algorithm on Canvas ImageData buffers for markerless drift compensation.",
      "Built a multi-touch Euclidean distance and trigonometric rotation gesture engine for sub-pixel image scale, opacity, and orientation manipulation.",
      "Constructed a high-frame-rate WebRTC camera compositor rendering transparent reference outlines over live video feeds with zero latency.",
      "Engineered local image session persistence via IndexedDB with complete offline PWA capability."
    ],
    github: "https://github.com/prasadkankhar10/AR-drow",
    liveDemo: null
  },

  // =========================================================================
  // 5. FULL-STACK WEB, CHROME EXTENSIONS & CLOUD SYSTEMS
  // =========================================================================

  TRIGGER_Project_ExamPlatform: {
    stationId: "TRIGGER_Project_ExamPlatform",
    category: "Full-Stack & Cloud Systems",
    title: "Local LAN AI Examination Platform",
    subtitle: "Semantic Answer Grading & AntiCheatGuard Air-Gapped Assessment Suite",
    badge: "FastAPI + Sentence-Transformers",
    metrics: [
      "Automated Semantic Grading",
      "AntiCheatGuard Security Suite",
      "Automated ReportLab Scorecards",
      "Air-Gapped Offline Operation"
    ],
    techStack: ["FastAPI", "React 18", "Sentence-Transformers (all-MiniLM-L6-v2)", "ReportLab", "SQLite WAL", "TailwindCSS"],
    description: "An air-gapped local LAN examination system featuring automated semantic grading of subjective answers using Sentence-Transformers cosine similarity.",
    highlights: [
      "Built an air-gapped local LAN examination system featuring automated semantic grading of subjective answers using Sentence-Transformers cosine similarity.",
      "Engineered AntiCheatGuard browser lockdown capturing tab switches, clipboard attempts, and fullscreen exits, generating real-time integrity penalty scores.",
      "Automated dynamic PDF performance scorecard generation using ReportLab, compiling class analytics and question-level difficulty heatmaps.",
      "Optimized SQLite database transactions for concurrent multi-student exam submissions without deadlocks."
    ],
    github: "https://github.com/prasadkankhar10/exam-platform",
    liveDemo: null
  },

  TRIGGER_Project_CMEDetector: {
    stationId: "TRIGGER_Project_CMEDetector",
    category: "Full-Stack & Cloud Systems",
    title: "CME Space Weather Anomaly Engine",
    subtitle: "Real-Time NOAA Solar Wind Telemetry Stream Processing & EWMA Forecasting",
    badge: "Top Finalist YCCE CodeRush 1.0",
    metrics: [
      "3-Sigma Rolling Z-Score",
      "500,000+ Records Streamed",
      "Zero-RAM Cursor Buffering",
      "Real-Time NOAA Telemetry"
    ],
    techStack: ["Node.js", "Express", "MongoDB", "NOAA Live Telemetry API", "Chart.js", "Docker"],
    description: "A real-time Coronal Mass Ejection (CME) anomaly detector parsing live NOAA solar wind telemetry streams developed for the YCCE CodeRush 1.0 National Hackathon.",
    highlights: [
      "Implemented a 3-sigma rolling Z-score statistical anomaly detection algorithm paired with Exponentially Weighted Moving Averages (EWMA) for magnetic storm forecasting.",
      "Built streaming cursor exports in MongoDB enabling zero-RAM buffering when querying 500,000+ time-series solar telemetry records.",
      "Architected interactive real-time telemetry dashboards in Chart.js visualizing proton density, bulk speed, and interplanetary magnetic field fluctuations.",
      "Awarded Top Finalist in the Space Tech Track at the YCCE CodeRush 1.0 National Hackathon."
    ],
    github: "https://github.com/prasadkankhar10/cme-detector",
    liveDemo: null
  },

  TRIGGER_Project_Sadhana: {
    stationId: "TRIGGER_Project_Sadhana",
    category: "Full-Stack & Cloud Systems",
    title: "Sadhana • Habit Tracker PWA",
    subtitle: "Offline-First Habit Architecture with Atomic Cloud Firestore Counters",
    badge: "React 18 + Firestore + PWA",
    metrics: [
      "Atomic Counter Increment",
      "Full Offline PWA Logging",
      "Optimistic UI Updates",
      "Service Worker Background Sync"
    ],
    techStack: ["TypeScript", "React 18", "TailwindCSS", "Firebase Auth", "Cloud Firestore", "Chart.js", "Service Workers"],
    description: "A full-stack Progressive Web Application developed to deliver seamless offline performance, reliable local data caching, and cross-platform productivity workflows.",
    highlights: [
      "Developed an installable Progressive Web App (PWA) with atomic Cloud Firestore streak counters, optimistic UI state updates, and multi-metric habit analytics.",
      "Implemented service worker caching strategies enabling full offline habit logging with automatic background synchronization upon network reconnection.",
      "Designed clean interactive completion analytics and streak heatmaps using Chart.js.",
      "Optimized mobile render speed with sub-100ms interaction latency."
    ],
    github: "https://github.com/prasadkankhar10/sadhana",
    liveDemo: null
  },

  TRIGGER_Project_Nishtha: {
    stationId: "TRIGGER_Project_Nishtha",
    category: "Full-Stack & Cloud Systems",
    title: "Nishtha • Gamified Habit RPG PWA",
    subtitle: "15-Tier Sanskrit RPG Progression System with Canvas 2D Particle Engine",
    badge: "Vanilla JS OOP + Supabase",
    metrics: [
      "15 Sanskrit Level Tiers",
      "Canvas 2D Particle Explosions",
      "Dual Local/Postgres Sync",
      "Integrated Cheat Engine"
    ],
    techStack: ["Vanilla JavaScript (OOP)", "Supabase Auth", "PostgreSQL", "HTML5 Canvas 2D", "LocalStorage API"],
    description: "An offline-first gamified habit tracker featuring a 15-tier Sanskrit RPG leveling system with dual-storage synchronization between LocalStorage and Supabase PostgreSQL.",
    highlights: [
      "Engineered a 15-tier Sanskrit progression curve calculating XP thresholds, rank promotions, and daily quest streaks with zero framework overhead.",
      "Built an interactive Canvas 2D particle explosion engine for level-up celebrations and an integrated developer cheat panel (Ctrl+Shift+D).",
      "Engineered dual-storage synchronization ensuring offline LocalStorage modifications resolve cleanly with remote Supabase PostgreSQL rows upon reconnection.",
      "Maintained 100% responsive vanilla DOM architecture running smoothly on legacy mobile browsers."
    ],
    github: "https://github.com/prasadkankhar10/nishtha",
    liveDemo: null
  },

  TRIGGER_Project_Vyuham: {
    stationId: "TRIGGER_Project_Vyuham",
    category: "Full-Stack & Cloud Systems",
    title: "Vyuham • Glassmorphic Chrome Extension",
    subtitle: "New-Tab Productivity Dashboard with DOMMatrix 10px Snapping Engine",
    badge: "Chrome Manifest V3",
    metrics: [
      "10px Snapping DOMMatrix Grid",
      "Epoch-Differential Timer",
      "Recursive Bookmark Tree",
      "Zero-Library Overhead"
    ],
    techStack: ["Vanilla JavaScript", "HTML5", "CSS Glassmorphism", "Chrome Manifest V3 APIs", "DOMMatrix API"],
    description: "A high-performance new-tab productivity dashboard Chrome extension featuring a draggable, 10px-snapping grid layout engine powered by CSS DOMMatrix.",
    highlights: [
      "Engineered a tab-throttling resilient Pomodoro timer utilizing epoch timestamp differentials to maintain second-accurate countdowns even when Chrome suspends background tabs.",
      "Implemented a custom draggable, 10px-snapping widget grid using hardware-accelerated CSS DOMMatrix transformations.",
      "Constructed recursive Chrome bookmark tree traversal and an in-memory Kanban task board with zero external library overhead.",
      "Packaged under Manifest V3 adhering to strict CSP security regulations with sub-50ms cold popup load time."
    ],
    github: "https://github.com/prasadkankhar10/Vyuham",
    liveDemo: null
  },

  TRIGGER_Project_SmartCampus: {
    stationId: "TRIGGER_Project_SmartCampus",
    category: "Full-Stack & Cloud Systems",
    title: "Smart Campus • QR Room Availability System",
    subtitle: "Real-Time Doorway QR Availability Engine & Multi-Sheet Python ETL",
    badge: "Python ETL + Static Edge",
    metrics: [
      "26 University Rooms Tracked",
      "Minute-Accurate Temporal Logic",
      "Multi-Sheet Merged Excel Parser",
      "Zero-Server Static Edge Host"
    ],
    techStack: ["JavaScript", "HTML5", "CSS3", "Python (pandas, openpyxl)", "Static Edge Hosting"],
    description: "A static client-side web application and Python ETL pipeline providing real-time classroom and computer lab availability across 26 university rooms via doorway QR codes.",
    highlights: [
      "Engineered an inverted timetable extraction script in Python that parses merged cells across complex multi-sheet Excel files, mapping concurrent multi-batch lab practicals to physical rooms.",
      "Built a client-side minute-accurate temporal evaluation engine that parses informal timetable formats and campus afternoon conventions to display live occupancy badges.",
      "Implemented instant doorway QR code routing displaying current professor, batch, subject, and next free time slot.",
      "Eliminated backend server hosting costs by compiling the entire timetable dataset into optimized static JSON for instant edge caching."
    ],
    github: "https://github.com/prasadkankhar10/class-info",
    liveDemo: null
  },

  TRIGGER_Project_GameStore: {
    stationId: "TRIGGER_Project_GameStore",
    category: "Full-Stack & Cloud Systems",
    title: "Digital Game Discovery Platform",
    subtitle: "Headless Game Storefront with Real-Time Substring Search & PaperCSS",
    badge: "PaperCSS + Decoupled JSON",
    metrics: [
      "Instant Substring Filtering",
      "Bookmarkable URL Routing",
      "Decoupled JSON Architecture",
      "Responsive Hand-Drawn UI"
    ],
    techStack: ["Vanilla JavaScript", "HTML5", "PaperCSS", "JSON Data Store", "Fetch API", "URLSearchParams"],
    description: "A lightweight, headless digital game discovery storefront utilizing a decoupled games.json database and responsive retro hand-drawn styling via PaperCSS.",
    highlights: [
      "Built a lightweight, headless digital game discovery storefront utilizing a decoupled games.json database and responsive retro hand-drawn styling via PaperCSS.",
      "Implemented real-time client-side substring search filtering and dynamic URLSearchParams routing for bookmarkable catalog views.",
      "Constructed category-based faceted filtering with zero external framework dependencies.",
      "Optimized asset loading for high responsiveness across low-bandwidth mobile connections."
    ],
    github: "https://github.com/prasadkankhar10/gamestore",
    liveDemo: null
  },

  TRIGGER_Project_SchoolWebsite: {
    stationId: "TRIGGER_Project_SchoolWebsite",
    category: "Full-Stack & Cloud Systems",
    title: "Z.P. Model Girls School Portal",
    subtitle: "Accessible Civic Portal with Zero-JavaScript CSS Modal Architecture",
    badge: "Civic Public Sector Portal",
    metrics: [
      "Zero-JS :target Lightbox",
      "High Accessibility Compliance",
      "Bilingual Administrative Board",
      "100% Free Edge Deployment"
    ],
    techStack: ["HTML5", "CSS3", "Bootstrap 4", "FontAwesome", "JavaScript", "GitHub Pages"],
    description: "An accessible civic digital portal for a rural girls' school, serving administrative notices, faculty directories, and student enrollment records.",
    highlights: [
      "Designed and deployed an accessible civic digital portal for a rural girls' school, serving administrative notices, faculty directories, and student enrollment records.",
      "Engineered a pure CSS :target pseudo-class lightbox modal system, achieving interactive full-screen photo viewing with zero JavaScript execution overhead.",
      "Optimized high-contrast typography and semantic HTML tags for high accessibility across rural mobile devices.",
      "Deployed via GitHub Pages providing 100% uptime with zero hosting costs for the institution."
    ],
    github: "https://github.com/prasadkankhar10/school-website",
    liveDemo: null
  },

  // =========================================================================
  // 6. SACRED GROVE, RUINS & FINALE
  // =========================================================================

  TRIGGER_Moonwell_Skills: {
    stationId: "TRIGGER_Moonwell_Skills",
    category: "Landmarks & Interactive",
    title: "The Mana Well • Full Skills Inventory",
    subtitle: "Complete ATS-Clustered Technical Competency Matrix",
    badge: "The Sacred Grove",
    skills: {
      "Programming Languages": ["C++ (17/20)", "Python (3.10+)", "TypeScript", "JavaScript (ES6+)", "GDScript", "SQL", "C"],
      "3D Graphics & Spatial": ["Three.js", "React Three Fiber", "WebXR Device API", "8th Wall SLAM", "Rapier 3D", "Unreal Engine 5.4", "Godot 4"],
      "Artificial Intelligence": ["Retrieval-Augmented Generation (RAG)", "FAISS Vector Search", "InsightFace (buffalo_sc)", "OpenAI CLIP (ViT-B/32)", "Groq LLaMA 3.1", "Gemini API"],
      "Low-Level & Audio": ["SDL3 Engine", "Android NDK (r26b)", "Real-Time PCM Audio Synthesis", "CMake", "C++ RAII Memory Management"],
      "Backend & Storage": ["FastAPI", "Node.js / Express", "PostgreSQL", "SQLite WAL", "Cloudflare Workers", "Supabase", "Docker"]
    },
    labExperiments: [
      "Three.js Photorealistic Lunar Scattering Shader",
      "Indic RAG Marathi-SBERT Vectorization",
      "Unreal Engine 5.4 Chaos Physics Suspension",
      "8th Wall Tabletop AR PhysicsScaler"
    ]
  },

  TRIGGER_Stonehenge_Puzzle: {
    stationId: "TRIGGER_Stonehenge_Puzzle",
    category: "Landmarks & Interactive",
    title: "Stonehenge Megaliths • Beyond Code",
    subtitle: "Interactive 6-Pillar Rune Puzzle & Creative Expression",
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

  TRIGGER_Citadel_Contact: {
    stationId: "TRIGGER_Citadel_Contact",
    category: "Landmarks & Interactive",
    title: "The Citadel Arcane Rift • Connect With Me",
    subtitle: "Direct Contact, Career Opportunities & Strategic Vision",
    badge: "Mountain Summit Finale",
    promptText: "Step through the portal to initiate direct technical collaboration or interview scheduling.",
    email: "prasadkankhar5@gmail.com",
    github: "https://github.com/prasadkankhar10",
    linkedin: "https://linkedin.com/in/prasad-kankhar",
    collaborationAreas: [
      "Software Development Engineer (SDE) & Backend Systems Roles",
      "AI / Machine Learning Systems & RAG Architecture Roles",
      "3D Graphics, Game Engine & Spatial Computing Engineering",
      "Full-Stack Web & Open-Source Collaboration"
    ],
    futureVision: [
      "Architecting distributed AI agents with sub-100ms real-time conversational reasoning.",
      "Large-scale immersive 3D spatial worlds combining C++, Unreal Engine, and WebXR.",
      "High-performance low-level systems with zero memory overhead and deterministic execution."
    ]
  }
};
