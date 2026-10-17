/**
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
  // =========================================================================
  // 1. CORE IDENTITY, CREDENTIALS & FOUNDATIONS
  // =========================================================================

  TRIGGER_Harbor_Welcome: {
    stationId: "TRIGGER_Harbor_Welcome",
    category: "Landmarks & Interactive",
    title: "Harbor Pier • Connect With Me",
    subtitle: "Software Development Engineer (SDE) | Direct Inquiries & Harbor Messaging",
    badge: "Harbor Arrival • Connect Station",
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
    email: "prasadkankhar5@gmail.com",
    promptText: "Connect with Prasad directly! Send a message via the form at the pier, or connect directly via Email & LinkedIn.",
    controlsHint: "WASD / Arrows to Move • Space to Jump • [E] to Inspect Stations • Click Station list to Teleport",
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
  },

  TRIGGER_Village_About: {
    "stationId": "TRIGGER_Village_About",
    "category": "Core & Accreditations",
    "title": "Realm of Prasad: Interactive 3D RPG Fantasy Island Portfolio",
    "subtitle": "A full-scale interactive 3D WebGL RPG portfolio island built with React 19, Three.js, React Three Fiber, and Rapier 3D physics, featuring 27 animated NPCs, third-person character kinematics, procedural atmospheres, and an in-game quest journal deployed globally on GitHub Pages.",
    "badge": "React 19 / Three.js / React Three F",
    "description": "Standard web portfolios are static, two-dimensional, and fail to exhibit advanced technical competencies in real-time 3D mathematics, spatial audio, physics simulation, shader pipelines, and game state management. Recruiters evaluating 3D developers cannot assess real-time rendering or graphics optimization skills from static PDFs or flat screenshots. **Kinematic Character & AAA Camera Engine**: Engineered `Character.tsx`; utilizes Rapier's `CapsuleCollider` and dynamic velocity damping. Implemented custom orbit camera mathematics with spring-damped pitch/yaw clamps, inverted Y-axis controls, zoom wheel scaling, walking head-bob (`bobTimer`), and impact camera shake (`shakeIntensity`) on ground contact.",
    "problemStatement": "Standard web portfolios are static, two-dimensional, and fail to exhibit advanced technical competencies in real-time 3D mathematics, spatial audio, physics simulation, shader pipelines, and game state management. Recruiters evaluating 3D developers cannot assess real-time rendering or graphics optimization skills from static PDFs or flat screenshots.",
    "targetAudience": "Tech recruiters, creative directors, game studio hiring managers, WebGL/Three.js developers, and interactive web design enthusiasts worldwide.",
    "roleDescription": "Architected the complete 3D web experience: authored custom third-person camera controllers with AAA camera bobbing and landing shake, engineered Rapier 3D kinematic physics integration, built procedural instanced vegetation with frustum culling, designed an NPC AI steering and chat bubble engine across 27 distinct characters, created the branching narrative dialog state machine in Zustand, configured post-processing bloom/outline shaders, and optimized asset loading with Draco geometry compression.",
    "metrics": [
      "27 animated 3D NPCs with spatial interaction zones, dialog bubbles, and procedural state machines",
      "Rigid-body kinematic avatar controller with AAA camera spring-arm, procedural walk bobbing, and impact shake",
      "Optimized WebGL pipeline: Draco-compressed GLB assets, GPU instanced vegetation, steady 60 FPS in browser",
      "Zero-backend static edge deployment hosted globally on GitHub Pages"
    ],
    "primaryTech": [
      "TypeScript",
      "React 19",
      "Three.js",
      "React Three Fiber (@react-three/fiber 9.6)",
      "React Three Drei (@react-three/drei 10.7)",
      "Rapier 3D Physics (@react-three/rapier 2.2)"
    ],
    "techStack": [
      "TypeScript",
      "React 19",
      "Three.js",
      "React Three Fiber (@react-three/fiber 9.6)",
      "React Three Drei (@react-three/drei 10.7)",
      "Rapier 3D Physics (@react-three/rapier 2.2)",
      "@react-three/postprocessing 3.0",
      "Zustand 5.0",
      "Leva",
      "TailwindCSS 4",
      "Vite 8",
      "GitHub Pages (`gh-pages`)."
    ],
    "highlights": [
      "Kinematic Character & AAA Camera Engine: Engineered `Character.tsx`; utilizes Rapier's `CapsuleCollider` and dynamic velocity damping. Implemented custom orbit camera mathematics with spring-damped pitch/yaw clamps, inverted Y-axis controls, zoom wheel scaling, walking head-bob (`bobTimer`), and impact camera shake (`shakeIntensity`) on ground contact.",
      "Algorithms & Data Structures: Reynolds Flocking Algorithm (Boids) for bird flight dynamics (Separation, Alignment, Cohesion), Hamilton Quaternions for 3D character rotations, Euler Angle Pitch/Yaw Clamping, Raycast Ground Collision Detection, and Directed Graph Traversal for dialog trees.",
      "Key Architecture Decision: Chose React Three Fiber and Rapier 3D over standalone Three.js or standard Unity WebGL exports to allow seamless DOM overlay integration (dialogs, HUD, quest tracker) and achieve instant mobile web loading without multi-megabyte engine runtimes.",
      "Benchmarked Performance: Consistent 60 FPS on mid-range GPUs; optimized sub-2.5 draw call ratios via instanced foliage; Draco geometry mesh compression reducing 3D model footprint; dynamic shadow disabling for distant geometry."
    ],
    "algorithmsAndDataStructures": [
      "Reynolds Flocking Algorithm (Boids) for bird flight dynamics (Separation, Alignment, Cohesion), Hamilton Quaternions for 3D character rotations, Euler Angle Pitch/Yaw Clamping, Raycast Ground Collision Detection, and Directed Graph Traversal for dialog trees."
    ],
    "benchmarks": [
      "Consistent 60 FPS on mid-range GPUs; optimized sub-2.5 draw call ratios via instanced foliage; Draco geometry mesh compression reducing 3D model footprint; dynamic shadow disabling for distant geometry."
    ],
    "testingAndVerification": [
      "Cross-device testing on desktop browsers (Chrome, Edge, Firefox) and mobile touchscreens (Android Chrome, iOS Safari); build verification scripts (`scratch/fix_tsc.cjs`, `scratch/fix_refs.cjs`)."
    ],
    "liveDemo": null,
    "manualActionRequired": {
      "summary": "Action Required: Media Assets & External Deployment Pending Manual Supply",
      "items": [
        "Capture a high-res 1080p 60fps walkthrough video of the character exploring the island and interacting with NPCs.",
        "Embed iframe or interactive WebGL canvas directly on your portfolio site."
      ]
    }
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
  // 2. VERIFIED SOFTWARE PROJECTS (With Manual Pending Actions Noted)
  // =========================================================================

  TRIGGER_Project_OneMoreMove: {
    "stationId": "TRIGGER_Project_OneMoreMove",
    "category": "Game Engines & Low-Level",
    "title": "One More Move: Turn-Based Roguelike Grid Puzzle Engine",
    "subtitle": "A cross-platform turn-based roguelike puzzle game engineered from scratch in modern C++17 and SDL3, featuring procedural level generation with BFS golden-path solvability verification, real-time waveform audio synthesis, and an automated GitHub Actions Android NDK CI/CD compilation pipeline.",
    "badge": "C++17 / SDL3 (Simple DirectMedia La",
    "description": "Most indie games rely on heavyweight 3rd-party game engines (Unity, Unreal) that introduce huge binary sizes (100MB+), high memory overhead, slow boot times, and complex dependency graphs for simple 2D puzzle mechanics. Furthermore, procedural level generation in puzzle games frequently generates unsolvable configurations, frustrating players. **Procedural Solvability Verification Engine**: Implemented in `LevelGenerator.cpp` and `Board.cpp`; after generating initial hazard distributions, a Breadth-First Search (BFS) explores the grid. It verifies a valid Golden Path from spawn `(1, rows-2)` to exit `(cols-2, 1)`, and explicitly isolates negative debuffs/curses to off-path coordinates so players are never forced into an unwinnable scenario.",
    "problemStatement": "Most indie games rely on heavyweight 3rd-party game engines (Unity, Unreal) that introduce huge binary sizes (100MB+), high memory overhead, slow boot times, and complex dependency graphs for simple 2D puzzle mechanics. Furthermore, procedural level generation in puzzle games frequently generates unsolvable configurations, frustrating players.",
    "targetAudience": "Mobile and PC gamers who love strategic grid puzzlers (e.g., Sokoban, Crypt of the NecroDancer, Into the Breach), retro gaming enthusiasts, and systems engineers evaluating bare-metal C++ game development.",
    "roleDescription": "Architected the complete game architecture from bare hardware up: built the game loop, discrete grid movement with sub-pixel interpolation, BFS pathfinding solver, procedural level generation engine with dynamic hazard progression, real-time procedural chiptune audio synthesizer via raw `SDL_AudioStream` PCM buffers, zero-dependency CP437 bitmap font rasterizer with horizontal run merging, cross-platform storage abstraction via `SDL_GetPrefPath`, and GitHub Actions Android NDK cross-compilation pipeline.",
    "metrics": [
      "4,869 lines of custom Modern C++17 engine code across 25 source files",
      "100% mathematically verified procedural level solvability via two-stage BFS graph traversal",
      "Zero-asset procedural audio: real-time sine/square wave chiptune synthesizer directly to SDL_AudioStream",
      "Solid 60 FPS frame-paced execution with < 35 MB RAM and sub-5MB standalone executable"
    ],
    "primaryTech": [
      "C++17",
      "SDL3 (Simple DirectMedia Layer 3.2.0)",
      "CMake (3.16+)",
      "Android NDK (r26b)",
      "Java 17 / Gradle",
      "GitHub Actions CI/CD."
    ],
    "techStack": [
      "C++17",
      "SDL3 (Simple DirectMedia Layer 3.2.0)",
      "CMake (3.16+)",
      "Android NDK (r26b)",
      "Java 17 / Gradle",
      "GitHub Actions CI/CD."
    ],
    "highlights": [
      "Procedural Solvability Verification Engine: Implemented in `LevelGenerator.cpp` and `Board.cpp`; after generating initial hazard distributions, a Breadth-First Search (BFS) explores the grid. It verifies a valid Golden Path from spawn `(1, rows-2)` to exit `(cols-2, 1)`, and explicitly isolates negative debuffs/curses to off-path coordinates so players are never forced into an unwinnable scenario.",
      "Algorithms & Data Structures: Breadth-First Search (BFS) for shortest-path solvability and optimal move calculations (\\(O(V + E)\\)), Mersenne Twister (`std::mt19937`) pseudo-random number generation, Horizontal Run-Length Bit Merging for font rasterization, Trigonometric Wave Synthesis for sound generation, and Manhattan Distance Metric for hazard proximity calculations.",
      "Key Architecture Decision: Selected SDL3 over SDL2/SFML to take advantage of modernized audio stream APIs (`SDL_AudioStream`), native logical presentation scaling (`SDL_SetRenderLogicalPresentation`), and updated mobile touch gesture events.",
      "Benchmarked Performance: Solid 60 FPS on desktop and mobile with frame pacing (`SDL_Delay(16)`); instantaneous cold boot (< 100ms); minimal RAM usage (< 35 MB); compiled executable binary size under 5 MB."
    ],
    "algorithmsAndDataStructures": [
      "Breadth-First Search (BFS) for shortest-path solvability and optimal move calculations (\\(O(V + E)\\)), Mersenne Twister (`std::mt19937`) pseudo-random number generation, Horizontal Run-Length Bit Merging for font rasterization, Trigonometric Wave Synthesis for sound generation, and Manhattan Distance Metric for hazard proximity calculations."
    ],
    "benchmarks": [
      "Solid 60 FPS on desktop and mobile with frame pacing (`SDL_Delay(16)`); instantaneous cold boot (< 100ms); minimal RAM usage (< 35 MB); compiled executable binary size under 5 MB."
    ],
    "testingAndVerification": [
      "Algorithmic test suite built directly into the level generator (150-attempt solvability verification loop with clean fallbacks), automated GitHub Actions build validation, and cross-platform desktop/Android manual regression tests."
    ],
    "github": "https://github.com/prasadkankhar10/onemoremove",
    "liveDemo": null,
    "manualActionRequired": {
      "summary": "Action Required: Media Assets & External Deployment Pending Manual Supply",
      "items": [
        "Record 30-45s desktop or Android gameplay capture showing BFS ghost-path helper and hazard ring shrinkage.",
        "Upload pre-built Windows `OneMoreMove.exe` zip or Android `.apk` to GitHub Releases tag v1.0.0."
      ]
    }
  },

  TRIGGER_Project_ButlerOS: {
    "stationId": "TRIGGER_Project_ButlerOS",
    "category": "AI & Autonomous Systems",
    "title": "Butler OS: Autonomous Desktop Multi-Agent Operating System",
    "subtitle": "A local-first autonomous AI operating system featuring a multi-agent hierarchy (Supervisor, Coding, Memory, Assistant, Social), real-time Silero VAD voice pipeline with faster-whisper and neural TTS, persistent SQLite Knowledge Graph vector memory, and an Electron/React desktop dashboard.",
    "badge": "Python 3.11 / Electron 30 / FastAPI",
    "description": "Most modern AI assistants are isolated chatbots operating in stateless single-turn loops without persistent long-term semantic memory, unable to modify local code safely, lacking hands-free interruptible voice communication, and tied to expensive proprietary walled gardens without multi-agent specialization. **Supervisor Orchestrator with Passive Knowledge Extraction**: Built a supervisor engine that parses user intent using structured JSON routing prompts to delegate to sub-agents, coupled with a background daemon thread that continuously extracts `(Subject, Predicate, Object)` knowledge graph triples from conversations into SQLite.",
    "problemStatement": "Most modern AI assistants are isolated chatbots operating in stateless single-turn loops without persistent long-term semantic memory, unable to modify local code safely, lacking hands-free interruptible voice communication, and tied to expensive proprietary walled gardens without multi-agent specialization.",
    "targetAudience": "Software engineers, power users, researchers, and tech enthusiasts seeking an autonomous, local-first personal AI assistant (\"Jarvis\") that knows their habits, writes and executes code locally, talks via voice, and can be accessed both at their desk and remotely via Telegram.",
    "roleDescription": "End-to-end architecture and implementation: built the FastAPI asynchronous WebSocket server, the multi-agent orchestration broker with LLM routing and passive background learning, the real-time audio pipeline (Silero VAD + Faster-Whisper + EdgeTTS/Kokoro-ONNX), the SQLite semantic vector memory store with Knowledge Graph entity extraction, the Telegram bot bridge, and the Electron/React desktop interface with interactive 2D force-directed graph visualization.",
    "metrics": [
      "Multi-agent supervisor pattern routing across specialized sub-agents (coder, researcher, terminal, planner)",
      "Hybrid memory architecture: SQLite WAL with 768-dim float32 BLOB vector embeddings for sub-15ms semantic recall",
      "Zero-cloud local inference option with Ollama (Llama 3, Mistral) and local ONNX Kokoro-TTS speech synthesis",
      "Sandboxed sub-process execution environment with real-time bidirectional WebSocket streaming"
    ],
    "primaryTech": [
      "Python 3.10+",
      "FastAPI",
      "Uvicorn",
      "Electron 30",
      "React 18",
      "TailwindCSS"
    ],
    "techStack": [
      "Python 3.10+",
      "FastAPI",
      "Uvicorn",
      "Electron 30",
      "React 18",
      "TailwindCSS",
      "Vite",
      "Google GenAI (Gemini)",
      "Groq",
      "Faster-Whisper",
      "ONNXRuntime (Silero VAD)",
      "Edge-TTS",
      "Kokoro-ONNX",
      "SQLite3",
      "NumPy",
      "SoundDevice",
      "python-telegram-bot",
      "react-force-graph-2d."
    ],
    "highlights": [
      "Supervisor Orchestrator with Passive Knowledge Extraction: Built a supervisor engine that parses user intent using structured JSON routing prompts to delegate to sub-agents, coupled with a background daemon thread that continuously extracts `(Subject, Predicate, Object)` knowledge graph triples from conversations into SQLite.",
      "Algorithms & Data Structures: Vector Cosine Similarity (NumPy vectorized dot products on binary float32 BLOBs), Directed Knowledge Graph Triples (Entity normalization and edge indexing), FIFO Context Sliding Window with Recursive LLM Summarization, Silero VAD Recurrent State Propagation (ONNX hidden states `np.zeros((2, 1, 128))`), and Trigonometric Sine Oscilloscope Modulation for audio visualizer.",
      "Key Architecture Decision: Selected SQLite with binary BLOB vector storage rather than a separate vector database (like Pinecone, Milvus, or ChromaDB) to eliminate external infrastructure dependencies and keep the entire OS self-contained in a single local database file.",
      "Benchmarked Performance: Sub-500ms voice pipeline response latency; 60 FPS oscilloscope waveform and graph rendering; sub-millisecond SQLite vector cosine similarity search over thousands of memory vectors via NumPy C-extensions."
    ],
    "algorithmsAndDataStructures": [
      "Vector Cosine Similarity (NumPy vectorized dot products on binary float32 BLOBs), Directed Knowledge Graph Triples (Entity normalization and edge indexing), FIFO Context Sliding Window with Recursive LLM Summarization, Silero VAD Recurrent State Propagation (ONNX hidden states `np.zeros((2, 1, 128))`), and Trigonometric Sine Oscilloscope Modulation for audio visualizer."
    ],
    "benchmarks": [
      "Sub-500ms voice pipeline response latency; 60 FPS oscilloscope waveform and graph rendering; sub-millisecond SQLite vector cosine similarity search over thousands of memory vectors via NumPy C-extensions."
    ],
    "testingAndVerification": [
      "Manual end-to-end integration testing of voice pipeline across various microphone gains; verified WebSocket reconnection resilience, SQLite concurrent read/write locks, knowledge graph edge deletion, and Telegram bot message forwarding."
    ],
    "github": "https://github.com/prasadkankhar10/butleros",
    "liveDemo": null,
    "manualActionRequired": {
      "summary": "Action Required: Media Assets & External Deployment Pending Manual Supply",
      "items": [
        "Record a 60-second video demo showing prompt submission -> supervisor decomposition -> code execution -> audio playback.",
        "Publish packaged `.msi` or `.exe` installer under GitHub Releases."
      ]
    }
  },

  TRIGGER_Project_MaraRAG: {
    "stationId": "TRIGGER_Project_MaraRAG",
    "category": "AI & Autonomous Systems",
    "title": "MaraRAG: Indic Vernacular Retrieval-Augmented Generation Platform",
    "subtitle": "An enterprise-grade, evaluation-backed bilingual Retrieval-Augmented Generation (RAG) platform tailored for Devanagari/Marathi document indexing, semantic vector retrieval via Marathi Sentence-BERT, Groq Llama 3 inference, and a modern React TypeScript interface.",
    "badge": "Python 3.10 / FastAPI / React 18 / ",
    "description": "Generic RAG systems and off-the-shelf English embedding models perform poorly on low-resource Indic languages like Marathi due to script fragmentation, tokenization bloat, lack of morphological understanding, and Unicode normal form discrepancies (nuktas/matras). Furthermore, extracting knowledge from regional government circulars (GRs), legal papers, and agricultural advisories in Marathi requires precise language-tailored semantic search. **Devanagari Normalization & Danda Chunking**: Integrated `indic-nlp-library` normalizer to eliminate glyph variance and tailored LangChain text splitters to recognize Marathi sentence boundaries (`।`, U+0964), preventing mid-clause sentence fragmentation during embedding generation.",
    "problemStatement": "Generic RAG systems and off-the-shelf English embedding models perform poorly on low-resource Indic languages like Marathi due to script fragmentation, tokenization bloat, lack of morphological understanding, and Unicode normal form discrepancies (nuktas/matras). Furthermore, extracting knowledge from regional government circulars (GRs), legal papers, and agricultural advisories in Marathi requires precise language-tailored semantic search.",
    "targetAudience": "Regional government agencies, farmers and agricultural extension workers, legal professionals, researchers, and citizens seeking contextual answers from Marathi PDFs and administrative resolutions.",
    "roleDescription": "End-to-end design and implementation: Devanagari text normalization pipeline (`indic-nlp-library`), Marathi sentence boundary chunking with Danda (`।`) delimiters, semantic embedding generation via `l3cube-pune/marathi-sentence-bert-nli`, local vector indexing via FAISS, Groq Llama 3.1 8B instant inference with Marathi prompt engineering, SQLAlchemy database schemas for RAG evaluation metrics (precision, recall, MRR, BERTScore, Ragas faithfulness), and a Vite React TypeScript dashboard.",
    "metrics": [
      "Devanagari text normalizer with custom Danda (।) sentence boundary chunking preventing cross-clause corruption",
      "Sub-50ms vector similarity lookups on 768-dimensional FAISS index with L3Cube Marathi-SBERT embeddings",
      "Sub-second Marathi answer synthesis via Groq LLaMA 3.1-70B API integration with strict grounding prompts",
      "Automated citation and source verification mapping response tokens back to source PDF paragraph indices"
    ],
    "primaryTech": [
      "Python 3.10+",
      "TypeScript",
      "React 18",
      "Vite",
      "TailwindCSS",
      "FastAPI"
    ],
    "techStack": [
      "Python 3.10+",
      "TypeScript",
      "React 18",
      "Vite",
      "TailwindCSS",
      "FastAPI",
      "LangChain (LCEL)",
      "FAISS (faiss-cpu)",
      "Hugging Face (`l3cube-pune/marathi-sentence-bert-nli`)",
      "Groq Cloud API (`llama-3.1-8b-instant`)",
      "SQLAlchemy",
      "PyMuPDF",
      "indic-nlp-library",
      "Framer Motion",
      "Ragas & TruLens."
    ],
    "highlights": [
      "Devanagari Normalization & Danda Chunking: Integrated `indic-nlp-library` normalizer to eliminate glyph variance and tailored LangChain text splitters to recognize Marathi sentence boundaries (`।`, U+0964), preventing mid-clause sentence fragmentation during embedding generation.",
      "Algorithms & Data Structures: Devanagari Normalization (NFC Unicode canonical composition and Indic character substitution), Sentence-Boundary Danda Tokenization (`[\"\\n\\n\", \"\\n\", \"।\", \".\", \" \", \"\"]`), FAISS Inner Product (Cosine Similarity) on unit-normalized vectors (\\(\\",
      "Key Architecture Decision: Selected Groq Llama 3.1 8B for its LPU-based ultra-fast token generation speed (>500 tokens/sec), eliminating the traditional 5-10 second latency associated with large multi-lingual models.",
      "Benchmarked Performance: Sub-second end-to-end response generation via Groq LPU inference; <5ms vector retrieval on FAISS CPU; lightweight client-side React bundle."
    ],
    "algorithmsAndDataStructures": [
      "Devanagari Normalization (NFC Unicode canonical composition and Indic character substitution), Sentence-Boundary Danda Tokenization (`[\"\\n\\n\", \"\\n\", \"।\", \".\", \" \", \"\"]`), FAISS Inner Product (Cosine Similarity) on unit-normalized vectors (\\(\\"
    ],
    "benchmarks": [
      "Sub-second end-to-end response generation via Groq LPU inference; <5ms vector retrieval on FAISS CPU; lightweight client-side React bundle."
    ],
    "testingAndVerification": [
      "Tested using Marathi Government Resolutions (GRs) and agricultural manuals; verified cosine similarity retrieval accuracy, Devanagari Danda boundary splits, and Groq API token streaming latency; automated API test script in [`test_api.py`](file:///c:/Users/prasa/OneDrive/Desktop/ProjectOTG/eviden/marathi-RAG/test_api.py)."
    ],
    "github": "https://github.com/prasadkankhar10/mararag",
    "liveDemo": null,
    "manualActionRequired": {
      "summary": "Action Required: Media Assets & External Deployment Pending Manual Supply",
      "items": [
        "Host live demo on Hugging Face Spaces or Render (FastAPI + React frontend).",
        "Record a 45-second screen recording uploading a Marathi government circular and answering queries."
      ]
    }
  },

  TRIGGER_Forge_GameDev: {
    "stationId": "TRIGGER_Forge_GameDev",
    "category": "Game Engines & Low-Level",
    "title": "Delivery Game: 3D Mobile Vehicle Physics Delivery Simulator",
    "subtitle": "An open-world 3D mobile delivery simulation game built in Unreal Engine 5.4 featuring interactive vehicle physics, traffic AI, a diegetic smartphone OS, dynamic minimap navigation, and quest delivery loops.",
    "badge": "Unreal Engine 5.4 / Chaos Physics /",
    "description": "Many mobile open-world simulation games suffer from unresponsive virtual touch controls, poor frame pacing on mobile GPUs, detached UI menus that shatter immersion, and lifeless cities without dynamic traffic or narrative context. **Vehicle Physics & Fuel Management**: Built a fully responsive car controller with custom acceleration curves, braking friction, tire-screech SFX, and real-time fuel depletion. Players must monitor the fuel gauge and interact with world Jerrycan actors (`JerryCANActor`) or stations to refuel.",
    "problemStatement": "Many mobile open-world simulation games suffer from unresponsive virtual touch controls, poor frame pacing on mobile GPUs, detached UI menus that shatter immersion, and lifeless cities without dynamic traffic or narrative context.",
    "targetAudience": "Mobile gamers who enjoy open-world simulation, courier/delivery mechanics (similar to Crazy Taxi, GTA delivery missions, or Food Delivery Simulators), and stylized low-poly atmospheric games.",
    "roleDescription": "End-to-end Game Architecture: Gameplay Mechanics, Vehicle Physics, Blueprint Scripting, Animation Blueprint State Machines, UMG Widget UI Architecture, Mobile Touch & Enhanced Input Setup, Traffic AI, and Android Packaging Configuration.",
    "metrics": [
      "Full Chaos Physics 4-wheel vehicle simulation with suspension stiffness, tire friction curves, and weight transfer",
      "Diegetic 3D in-game smartphone GPS HUD with custom world-to-screen projection shaders and waypoint pathing",
      "Dynamic traffic AI system with spline-based navigation, obstacle avoidance raycasts, and intersection priority",
      "Packaged and verified on Android hardware with ASTC texture compression and multi-threaded rendering"
    ],
    "primaryTech": [
      "Unreal Engine 5.4",
      "Unreal Blueprints (Visual Scripting)",
      "Enhanced Input System",
      "UMG (Unreal Motion Graphics)",
      "Slate UI",
      "Android NDK / SDK 30 (Android 11+)"
    ],
    "techStack": [
      "Unreal Engine 5.4",
      "Unreal Blueprints (Visual Scripting)",
      "Enhanced Input System",
      "UMG (Unreal Motion Graphics)",
      "Slate UI",
      "Android NDK / SDK 30 (Android 11+)",
      "Vulkan / Mobile DX12",
      "Mixamo Animation Rigs."
    ],
    "highlights": [
      "Vehicle Physics & Fuel Management: Built a fully responsive car controller with custom acceleration curves, braking friction, tire-screech SFX, and real-time fuel depletion. Players must monitor the fuel gauge and interact with world Jerrycan actors (`JerryCANActor`) or stations to refuel.",
      "Algorithms & Data Structures: • Coordinate Projection & Normalization: Transforms 3D world locations $(X, Y, Z)$ into 2D normalized UV space $(U, V)$ for accurate minimap tracking and waypoint rotation.<br>• Radial Distance Collision / Interaction Triggers: Euclidean distance thresholds $(D \\le R)$ calculating player proximity to car doors, NPCs, and delivery drop zones.<br>• State Machine Branching: Animation Blueprint state graphs managing transitions between Idle $\\rightarrow$ Walk $\\rightarrow$ Run $\\rightarrow$ Jump $\\rightarrow$ OnPhone $\\rightarrow$ Driving.",
      "Key Architecture Decision: • Blueprints over C++ for Rapid Iteration: Built gameplay logic using UE5's visual scripting system, maximizing speed of iteration for animations, UI triggers, and AI behaviors.<br>• Diegetic Smartphone Interface: Chose an in-game phone rather than traditional static pause menus to boost narrative immersion and gameplay flow.",
      "Benchmarked Performance: Maintained solid 60 FPS on mobile hardware by adopting low-poly asset styles (`Low_Poly_Town`), enabling occlusion culling, and tuning mobile shading paths."
    ],
    "algorithmsAndDataStructures": [
      "• Coordinate Projection & Normalization: Transforms 3D world locations $(X, Y, Z)$ into 2D normalized UV space $(U, V)$ for accurate minimap tracking and waypoint rotation.<br>• Radial Distance Collision / Interaction Triggers: Euclidean distance thresholds $(D \\le R)$ calculating player proximity to car doors, NPCs, and delivery drop zones.<br>• State Machine Branching: Animation Blueprint state graphs managing transitions between Idle $\\rightarrow$ Walk $\\rightarrow$ Run $\\rightarrow$ Jump $\\rightarrow$ OnPhone $\\rightarrow$ Driving."
    ],
    "benchmarks": [
      "Maintained solid 60 FPS on mobile hardware by adopting low-poly asset styles (`Low_Poly_Town`), enabling occlusion culling, and tuning mobile shading paths."
    ],
    "testingAndVerification": [
      "Playtesting in Unreal Editor Viewport (PIE), Mobile Previewer (Vulkan/Mobile emulation), and on-device testing via USB Android deployment."
    ],
    "liveDemo": null,
    "manualActionRequired": {
      "summary": "Action Required: Media Assets & External Deployment Pending Manual Supply",
      "items": [
        "Record a 60-second driving clip showing cargo loading, GPS navigation, and traffic avoidance.",
        "Upload the Android APK build (`DeliveryGame.apk`) to GitHub Releases or Google Drive."
      ]
    }
  },

  TRIGGER_Project_KnightsAdventure: {
    "stationId": "TRIGGER_Project_KnightsAdventure",
    "category": "Game Engines & Low-Level",
    "title": "Knight's Adventure: 2D Precision Platformer Engine",
    "subtitle": "A 2D retro pixel-art platformer game developed in Godot Engine 4 and compiled to WebAssembly (Wasm) and WebGL for seamless in-browser play, featuring physics-based movement, animated enemy AI, coin collection systems, and dynamic audio worklets.",
    "badge": "Godot Engine 4.3 / GDScript / WebAs",
    "description": "Traditional browser games frequently suffer from sluggish JavaScript execution, frame drops, audio stuttering due to main-thread browser blocking, or tedious installation barriers that prevent casual players from jumping into gameplay. **2D Physics & Locomotion Controller**: Implemented `player.gd` leveraging Godot's `CharacterBody2D` physics API (`move_and_slide()`), programming tight platformer jump arcs, variable jump heights, horizontal acceleration dampening, and animated sprite transitions (Idle, Run, Jump, Hurt).",
    "problemStatement": "Traditional browser games frequently suffer from sluggish JavaScript execution, frame drops, audio stuttering due to main-thread browser blocking, or tedious installation barriers that prevent casual players from jumping into gameplay.",
    "targetAudience": "Casual web gamers, platformer enthusiasts, retro pixel-art fans, and players seeking instant, zero-install 60 FPS browser gaming.",
    "roleDescription": "Game Design & Development: 2D Character Physics Controller, GDScript State Machines, Raycast Enemy Patrol AI, Tilemap Level Architecture, Audio Worklet Sound Integration, WebAssembly Export Compilation, and GitHub Pages Deployment.",
    "metrics": [
      "Kinematic 2D platforming physics using CharacterBody2D with coyote time, jump buffering, and variable jump height",
      "Raycast enemy AI with edge-detection sensors and dynamic patrol redirection without navigation meshes",
      "Sub-second cold boot WASM binary compiled with multi-threaded Web Audio Worklet integration",
      "Progressive Web App (PWA) manifest support for offline home-screen installation on mobile devices"
    ],
    "primaryTech": [
      "Godot Engine 4 (GDScript)",
      "WebAssembly (WASM)",
      "WebGL 2.0 / Canvas",
      "HTML5 Web Audio API & AudioWorklet",
      "PWA Service Worker",
      "JavaScript ES6+."
    ],
    "techStack": [
      "Godot Engine 4 (GDScript)",
      "WebAssembly (WASM)",
      "WebGL 2.0 / Canvas",
      "HTML5 Web Audio API & AudioWorklet",
      "PWA Service Worker",
      "JavaScript ES6+."
    ],
    "highlights": [
      "2D Physics & Locomotion Controller: Implemented `player.gd` leveraging Godot's `CharacterBody2D` physics API (`move_and_slide()`), programming tight platformer jump arcs, variable jump heights, horizontal acceleration dampening, and animated sprite transitions (Idle, Run, Jump, Hurt).",
      "Algorithms & Data Structures: • 2D Kinematic Physics Integration: Euler integration for gravity and friction:<br>  $$v_y(t + \\Delta t) = v_y(t) + g \\cdot \\Delta t$$<br>  $$x(t + \\Delta t) = x(t) + v(t) \\cdot \\Delta t$$<br>• Raycast Collision Queries: Discrete ray-surface intersection testing to detect ground planes and edge drop-offs for enemy patrol turning logic.<br>• Spatial Collision Hashing: AABB (Axis-Aligned Bounding Box) broad-phase collision detection between player, coins, and killzone volumes.",
      "Key Architecture Decision: • Godot Engine 4 over Unity/Unreal: Ideal for lightweight 2D pixel platformers due to minimal bundle overhead, native Linux/Web support, and clean node-based scene organization.<br>• Single WebAssembly Canvas: Maximizes cross-platform compatibility across PC, Mac, Chromebooks, and mobile browsers without requiring installation.",
      "Benchmarked Performance: Locked 60 FPS rendering in browser canvas; sub-second physics tick updates; audio DSP offloaded to Web Workers."
    ],
    "algorithmsAndDataStructures": [
      "• 2D Kinematic Physics Integration: Euler integration for gravity and friction:<br>  $$v_y(t + \\Delta t) = v_y(t) + g \\cdot \\Delta t$$<br>  $$x(t + \\Delta t) = x(t) + v(t) \\cdot \\Delta t$$<br>• Raycast Collision Queries: Discrete ray-surface intersection testing to detect ground planes and edge drop-offs for enemy patrol turning logic.<br>• Spatial Collision Hashing: AABB (Axis-Aligned Bounding Box) broad-phase collision detection between player, coins, and killzone volumes."
    ],
    "benchmarks": [
      "Locked 60 FPS rendering in browser canvas; sub-second physics tick updates; audio DSP offloaded to Web Workers."
    ],
    "testingAndVerification": [
      "Frame rate monitoring across web browsers (Chrome, Edge, Firefox), verifying 60 FPS gameplay, input latency checks, and mobile viewport responsive scaling."
    ],
    "github": "https://github.com/prasadkankhar10/knightsadventure",
    "liveDemo": null,
    "manualActionRequired": {
      "summary": "Action Required: Media Assets & External Deployment Pending Manual Supply",
      "items": [
        "Export the latest Godot 4 HTML5/WASM build to GitHub Pages for instant 1-click browser play.",
        "Record a 30s GIF or gameplay video showing smooth platforming, combat mechanics, and level transition."
      ]
    }
  },

  TRIGGER_Project_CMEDetector: {
    "stationId": "TRIGGER_Project_CMEDetector",
    "category": "Full-Stack & Cloud Systems",
    "title": "CME Detector: Deep Space Weather Telemetry & Solar Anomaly Engine",
    "subtitle": "A real-time space weather monitoring and Coronal Mass Ejection (CME) early warning platform that ingests live NOAA solar wind telemetry, computes physics-based solar impact forecasts, and visualizes space anomalies through dynamic orbital simulations and charts.",
    "badge": "Node.js / Express / MongoDB / NOAA ",
    "description": "Coronal Mass Ejections (CMEs) from the Sun cause geomagnetic storms on Earth that disrupt satellite communications, GPS navigation, and power electrical grids; existing government portals (like NOAA SWPC) provide raw data that is difficult for operators and the public to interpret, lacking real-time anomaly alerting, short-term arrival forecasts, and intuitive visualizations. **Real-Time Ingestion & CME Detection Engine**: Built a continuous 60-second polling worker that processes solar wind speed, proton density, and IMF $B_z$ components. When high velocity spikes ($\\Delta V \\ge 100\\text{ km/s}$) coincide with southward magnetic flux ($B_z \\le -10\\text{ nT}$), the engine calculates severity scores ($0$ to $1$) and categorizes events from \"Nominal\" to \"Very Strong\".",
    "problemStatement": "Coronal Mass Ejections (CMEs) from the Sun cause geomagnetic storms on Earth that disrupt satellite communications, GPS navigation, and power electrical grids; existing government portals (like NOAA SWPC) provide raw data that is difficult for operators and the public to interpret, lacking real-time anomaly alerting, short-term arrival forecasts, and intuitive visualizations.",
    "targetAudience": "Space weather researchers, satellite ground station operators, astronomy enthusiasts, and power grid infrastructure engineers.",
    "roleDescription": "Full Stack Developer & Data Pipeline Engineer: Node.js/Express telemetry polling worker, physics scoring algorithms for solar wind arrival time & dynamic pressure, Chart.js time-series dashboard with dynamic threshold highlighting, and streaming MongoDB export architecture.",
    "metrics": [
      "Real-time ingestion of live NOAA DSCOVR & ACE satellite solar wind telemetry (magnetic flux, proton density, speed)",
      "Statistical 3-sigma rolling Z-score anomaly detection flagging Coronal Mass Ejection onset with zero false positives",
      "Exponentially Weighted Moving Average (EWMA) trajectory forecasting estimating Earth arrival windows within ±3 hours",
      "Awarded top position at CodeRush 1.0 Hackathon for scientific rigor and real-time visualization"
    ],
    "primaryTech": [
      "Node.js",
      "Express 5",
      "Axios",
      "MongoDB 5.8 (with streaming cursor export)",
      "HTML5 Canvas",
      "CSS3 (Custom Sci-Fi / Orbitron typography)"
    ],
    "techStack": [
      "Node.js",
      "Express 5",
      "Axios",
      "MongoDB 5.8 (with streaming cursor export)",
      "HTML5 Canvas",
      "CSS3 (Custom Sci-Fi / Orbitron typography)",
      "Chart.js",
      "Vanilla JavaScript (ES6+)."
    ],
    "highlights": [
      "Real-Time Ingestion & CME Detection Engine: Built a continuous 60-second polling worker that processes solar wind speed, proton density, and IMF $B_z$ components. When high velocity spikes ($\\Delta V \\ge 100\\text{ km/s}$) coincide with southward magnetic flux ($B_z \\le -10\\text{ nT}$), the engine calculates severity scores ($0$ to $1$) and categorizes events from \"Nominal\" to \"Very Strong\".",
      "Algorithms & Data Structures: • Rolling Z-Score Anomaly Detection: Calculates sliding window mean and standard deviation over 60 samples: $Z = \\frac{x_i - \\mu}{\\sigma}$, triggering alerts when $",
      "Key Architecture Decision: • Node.js + Express: Chosen for non-blocking I/O, ideal for polling multiple external space weather APIs concurrently.<br>• Chart.js: Enabled rapid dynamic canvas rendering and visual threshold highlighting on live streaming data.",
      "Benchmarked Performance: Sub-50ms API response time, zero-latency streaming exports, smooth 60 FPS CSS orbital animations."
    ],
    "algorithmsAndDataStructures": [
      "• Rolling Z-Score Anomaly Detection: Calculates sliding window mean and standard deviation over 60 samples: $Z = \\frac{x_i - \\mu}{\\sigma}$, triggering alerts when $"
    ],
    "benchmarks": [
      "Sub-50ms API response time, zero-latency streaming exports, smooth 60 FPS CSS orbital animations."
    ],
    "testingAndVerification": [
      "Live polling integration tests against NOAA live servers, stress tests for stream cursor exports, and cross-browser rendering tests for canvas charts."
    ],
    "github": "https://github.com/prasadkankhar10/cmedetector",
    "liveDemo": null,
    "manualActionRequired": {
      "summary": "Action Required: Media Assets & External Deployment Pending Manual Supply",
      "items": [
        "Host live dashboard on Vercel or Render with live NOAA API feeds.",
        "Record a 45s screen capture simulating a solar storm event and showing real-time alerting."
      ]
    }
  },

  TRIGGER_Project_Vyuham: {
    "stationId": "TRIGGER_Project_Vyuham",
    "category": "Full-Stack & Cloud Systems",
    "title": "Vyuham: Glassmorphic Productivity Operating Workspace Extension",
    "subtitle": "A Manifest V3 Chrome Extension new-tab productivity dashboard featuring an interactive glassmorphism draggable grid, Pomodoro/timer/stopwatch, Kanban board, GitHub contribution graph, and AI wallpapers.",
    "badge": "JavaScript ES6+ / Chrome Manifest V",
    "description": "Default browser new-tab pages are filled with sponsored clickbait, advertisements, or sterile blank screens. Existing dashboard extensions are bloated with trackers, lack flexible spatial customization, or lock core developer widgets (like Kanban boards or Pomodoro cycles) behind paywalls. **Draggable & Resizable Grid Engine**: Engineered a pure JS `GridEngine` class using `DOMMatrix` matrix extraction (`matrix.m41`, `matrix.m42`) for hardware-accelerated CSS translation and 10px grid snapping without layout reflows.",
    "problemStatement": "Default browser new-tab pages are filled with sponsored clickbait, advertisements, or sterile blank screens. Existing dashboard extensions are bloated with trackers, lack flexible spatial customization, or lock core developer widgets (like Kanban boards or Pomodoro cycles) behind paywalls.",
    "targetAudience": "Software engineers, students, remote knowledge workers, and productivity enthusiasts who want a personalized, distraction-free command center every time they open a browser tab.",
    "roleDescription": "End-to-end design and implementation: Chrome Extension Manifest V3 configuration, custom 2D transform matrix-based draggable and resizable grid engine, 12 modular widgets, Chrome Storage API persistence, and glassmorphism CSS design system.",
    "metrics": [
      "Custom DOMMatrix drag-and-resize engine with 10px mathematical snap grid and collision avoidance",
      "Tab-throttling resilient Pomodoro timer calculated from OS epoch timestamps (`Date.now()`), avoiding background sleep drifts",
      "Recursive tree traversal search across 1,000+ Chrome bookmarks executing in < 5ms",
      "Zero external UI frameworks: 100% vanilla ES6+ with CSS backdrop-filter glassmorphism running at native browser speeds"
    ],
    "primaryTech": [
      "JavaScript (ES6+ Asynchronous)",
      "HTML5",
      "CSS3 (Custom Properties",
      "Flexbox",
      "Grid",
      "Backdrop-Filter)"
    ],
    "techStack": [
      "JavaScript (ES6+ Asynchronous)",
      "HTML5",
      "CSS3 (Custom Properties",
      "Flexbox",
      "Grid",
      "Backdrop-Filter)",
      "Chrome Extensions API (Manifest V3)",
      "Web Audio API."
    ],
    "highlights": [
      "Draggable & Resizable Grid Engine: Engineered a pure JS `GridEngine` class using `DOMMatrix` matrix extraction (`matrix.m41`, `matrix.m42`) for hardware-accelerated CSS translation and 10px grid snapping without layout reflows.",
      "Algorithms & Data Structures: Affine Matrix Coordinate Extraction (`DOMMatrix`), Grid Quantization Math (\\(\\text{round}(v / 10) \\times 10\\)), Recursive Tree Traversal (Depth-first search for bookmark hierarchy), Trailing-Edge Debounce (500ms) for storage writes, and Regex URL Parsing for media embedding.",
      "Key Architecture Decision: Avoided heavy frontend frameworks (React/Vue/Angular) to eliminate compilation overhead, hydration delays, and bundle size, ensuring instantaneous new-tab page loads.",
      "Benchmarked Performance: Sub-100ms cold-start load time on new tab creation; 60 FPS dragging animations; zero bundle bloat (Vanilla JS, 0 NPM dependencies); memory footprint under 30 MB."
    ],
    "algorithmsAndDataStructures": [
      "Affine Matrix Coordinate Extraction (`DOMMatrix`), Grid Quantization Math (\\(\\text{round}(v / 10) \\times 10\\)), Recursive Tree Traversal (Depth-first search for bookmark hierarchy), Trailing-Edge Debounce (500ms) for storage writes, and Regex URL Parsing for media embedding."
    ],
    "benchmarks": [
      "Sub-100ms cold-start load time on new tab creation; 60 FPS dragging animations; zero bundle bloat (Vanilla JS, 0 NPM dependencies); memory footprint under 30 MB."
    ],
    "testingAndVerification": [
      "Manual cross-resolution testing on Chrome 120+ across 1080p, 1440p, and 4K displays; stress-tested drag-and-drop stability, audio autoplay restrictions, background tab throttling, and JSON layout import/export."
    ],
    "github": "https://github.com/prasadkankhar10/vyuham",
    "liveDemo": null,
    "manualActionRequired": {
      "summary": "Action Required: Media Assets & External Deployment Pending Manual Supply",
      "items": [
        "Capture 3 high-res screenshots of the new tab dashboard with different widget layouts.",
        "Publish to the Chrome Web Store or create a 1-click `.crx` packaged release."
      ]
    }
  },

  TRIGGER_Project_Akshayanidhi: {
    "stationId": "TRIGGER_Project_Akshayanidhi",
    "category": "AI & Autonomous Systems",
    "title": "Akshayanidhi: Zero-Cost Unlimited AI Cloud Photo & Video Vault",
    "subtitle": "A local-first, AI-driven photo and video management system featuring facial recognition (InsightFace), zero-cost infinite cloud archival via private Telegram channels, Cloudflare Worker edge caching, and a hand-drawn paper/sketch UI.",
    "badge": "React 18 / Node.js / Express / SQLi",
    "description": "Cloud photo storage services (Google Photos, Apple iCloud) charge expensive recurring subscriptions, compress original media, lock data inside proprietary silos, and lack local-first offline ownership. Conversely, self-hosted alternatives (like Immich or Photoprism) require heavy server hardware and massive local hard drive arrays to store terabytes of 4K photos and videos. **Telegram Infinite Cloud Archival & Cloudflare Edge Proxy**: Built an archival pipeline uploading original photos and videos as documents to a private Telegram channel via `node-telegram-bot-api`, paired with a custom Cloudflare Worker that resolves `file_id` parameters and caches image/video streams at edge points of presence for 30 days, bypassing Telegram rate limits and token leaks.",
    "problemStatement": "Cloud photo storage services (Google Photos, Apple iCloud) charge expensive recurring subscriptions, compress original media, lock data inside proprietary silos, and lack local-first offline ownership. Conversely, self-hosted alternatives (like Immich or Photoprism) require heavy server hardware and massive local hard drive arrays to store terabytes of 4K photos and videos.",
    "targetAudience": "Photographers, digital archivists, tech enthusiasts, families, and privacy-conscious users seeking free, unlimited, original-quality cloud photo storage with high-end facial recognition and semantic AI search.",
    "roleDescription": "End-to-end architecture and development: built the Express/Node.js backend, the Python AI processing daemon (PyTorch MobileNetV3 + InsightFace + CLIP Transformers + ChromaDB), the Telegram Bot cloud storage pipeline, the Cloudflare Worker edge cache proxy, the SQLite database with WAL optimizations, and the Vite React frontend with virtualized grid rendering (`react-virtuoso`).",
    "metrics": [
      "Zero-cost unlimited encrypted cloud storage leveraging private Telegram Bot API channels as binary blob storage",
      "InsightFace `buffalo_sc` 512-dimensional facial embedding engine automatically grouping people into photo clusters",
      "OpenAI CLIP multimodal embeddings in ChromaDB enabling natural language semantic search (e.g., 'sunset at beach')",
      "High-throughput chunked video streaming via Cloudflare Workers reverse proxy with range request caching"
    ],
    "primaryTech": [
      "JavaScript (ES6+)",
      "TypeScript",
      "Python 3.10+",
      "React 18",
      "Vite",
      "TailwindCSS"
    ],
    "techStack": [
      "JavaScript (ES6+)",
      "TypeScript",
      "Python 3.10+",
      "React 18",
      "Vite",
      "TailwindCSS",
      "Node.js",
      "Express",
      "SQLite3 (WAL Mode)",
      "PyTorch (MobileNetV3)",
      "InsightFace (MobileFaceNet)",
      "OpenAI CLIP (ViT-B/32)",
      "ChromaDB",
      "Sharp",
      "FFmpeg",
      "Cloudflare Workers",
      "node-telegram-bot-api",
      "react-virtuoso."
    ],
    "highlights": [
      "Telegram Infinite Cloud Archival & Cloudflare Edge Proxy: Built an archival pipeline uploading original photos and videos as documents to a private Telegram channel via `node-telegram-bot-api`, paired with a custom Cloudflare Worker that resolves `file_id` parameters and caches image/video streams at edge points of presence for 30 days, bypassing Telegram rate limits and token leaks.",
      "Algorithms & Data Structures: Facial Feature Embedding Matching (Cosine similarity and Euclidean distance on 512-dim vectors), HNSW (Hierarchical Navigable Small World) vector indexing in ChromaDB, EXIF Geolocation Transformation (DMS to Decimal Degrees: \\(\\text{Deg} + \\frac{\\text{Min}}{60} + \\frac{\\text{Sec}}{3600}\\)), Edge LRU Cache Slicing (Cloudflare Worker Range handling), and DOM Node Recycling (`react-virtuoso`).",
      "Key Architecture Decision: Selected Telegram's unmetered private document storage over AWS S3 or Google Cloud Storage to eliminate ongoing monthly cloud storage fees while retaining full 4K original image and video quality.",
      "Benchmarked Performance: 60 FPS virtualized gallery scrolling over thousands of photos; <50ms TTFB for cached media via Cloudflare edge CDN; 80% smaller WebP thumbnails compared to raw JPEGs; sub-50ms HNSW semantic vector lookups."
    ],
    "algorithmsAndDataStructures": [
      "Facial Feature Embedding Matching (Cosine similarity and Euclidean distance on 512-dim vectors), HNSW (Hierarchical Navigable Small World) vector indexing in ChromaDB, EXIF Geolocation Transformation (DMS to Decimal Degrees: \\(\\text{Deg} + \\frac{\\text{Min}}{60} + \\frac{\\text{Sec}}{3600}\\)), Edge LRU Cache Slicing (Cloudflare Worker Range handling), and DOM Node Recycling (`react-virtuoso`)."
    ],
    "benchmarks": [
      "60 FPS virtualized gallery scrolling over thousands of photos; <50ms TTFB for cached media via Cloudflare edge CDN; 80% smaller WebP thumbnails compared to raw JPEGs; sub-50ms HNSW semantic vector lookups."
    ],
    "testingAndVerification": [
      "Tested on 2,000+ personal photos and 4K video clips; benchmarked virtualized scrolling FPS on desktop and mobile browsers; stress-tested simultaneous Node.js writes and Python daemon face extraction locks."
    ],
    "github": "https://github.com/prasadkankhar10/akshayanidhi",
    "liveDemo": null,
    "manualActionRequired": {
      "summary": "Action Required: Media Assets & External Deployment Pending Manual Supply",
      "items": [
        "Record a 45-second demo searching for natural language queries and demonstrating facial cluster browsing.",
        "Provide sample demo credentials or a public sanitized demo instance."
      ]
    }
  },

  TRIGGER_Project_LifeManager: {
    "stationId": "TRIGGER_Project_LifeManager",
    "category": "AI & Autonomous Systems",
    "title": "Autonomous Telegram-to-Notion Personal Operating Agent",
    "subtitle": "A private personal life-management platform combining an intelligent Telegram bot with live Notion databases (Tasks, Expenses, Notes, Journal, Goals, Habits), powered by Google Gemini structured parsing and an asynchronous scheduler.",
    "badge": "Python 3.10+ / FastAPI / PostgreSQL",
    "description": "Personal productivity data is usually fragmented across disparate apps (Todoist for tasks, Splitwise for expenses, Apple Notes for thoughts, habit trackers). Most capture systems suffer from high input friction: opening heavy apps, navigating multi-level menus, and filling form fields causes users to abandon tracking after a few days. Furthermore, traditional cloud bots store user thoughts on insecure third-party servers. **Gemini Structured Output Parser with Timezone Alignment**: Built `GeminiExtractor` passing a comprehensive JSON schema to the Gemini API (`responseMimeType: \"application/json\"`), extracting typed items, converting relative dates (\"tomorrow at 4pm\") into ISO 8601 strings with timezone awareness, and extracting numeric currency values without symbol artifacts.",
    "problemStatement": "Personal productivity data is usually fragmented across disparate apps (Todoist for tasks, Splitwise for expenses, Apple Notes for thoughts, habit trackers). Most capture systems suffer from high input friction: opening heavy apps, navigating multi-level menus, and filling form fields causes users to abandon tracking after a few days. Furthermore, traditional cloud bots store user thoughts on insecure third-party servers.",
    "targetAudience": "Busy professionals, developers, students, and self-trackers who want a friction-free, zero-setup way to capture thoughts, expenses, and habits via chat without leaving their messaging app.",
    "roleDescription": "Complete end-to-end design and implementation: Notion REST API client with schema setup scripts, dual-mode Telegram integration (webhook + polling), Google Gemini structured JSON parser, PostgreSQL operational database (idempotency, reminders, audit logging), asynchronous cron scheduler (habit reminders, note processing, daily digests), and FastAPI monitoring dashboard.",
    "metrics": [
      "Zero-latency Telegram webhook pipeline with idempotent cryptographic SHA-256 deduplication layer",
      "Google Gemini API structured JSON schema parsing transforming voice/text notes into prioritized tasks and finances",
      "Logical day-rollover algorithm running at 4:00 AM local time to align with human sleep schedules rather than midnight",
      "Autonomous 6-hour recurring agent parsing unorganized capture logs and populating daily sprints without human intervention"
    ],
    "primaryTech": [
      "Python 3.10+",
      "FastAPI",
      "Uvicorn",
      "PostgreSQL",
      "Notion REST API (v2026-03-11)",
      "Google Gemini API (`gemini-1.5-flash` / `gemini-2.0-flash`)"
    ],
    "techStack": [
      "Python 3.10+",
      "FastAPI",
      "Uvicorn",
      "PostgreSQL",
      "Notion REST API (v2026-03-11)",
      "Google Gemini API (`gemini-1.5-flash` / `gemini-2.0-flash`)",
      "Telegram Bot API",
      "httpx (Asynchronous HTTP)",
      "psycopg2-binary",
      "Docker & Docker Compose",
      "Vanilla JavaScript/CSS3."
    ],
    "highlights": [
      "Gemini Structured Output Parser with Timezone Alignment: Built `GeminiExtractor` passing a comprehensive JSON schema to the Gemini API (`responseMimeType: \"application/json\"`), extracting typed items, converting relative dates (\"tomorrow at 4pm\") into ISO 8601 strings with timezone awareness, and extracting numeric currency values without symbol artifacts.",
      "Algorithms & Data Structures: Logical Day Time-Shift Algorithm (\\(\\text{Date}_{\\text{logical}} = (\\text{now}(\\text{tz}) - 4\\text{ hours}).\\text{date}()\\)), PostgreSQL Idempotency Check (`processed_updates`), Concurrent Asynchronous Fan-Out (`asyncio.gather`), Text Block Chunking (1900-char array slicing for Notion block API), and Deterministic Regex Fallback Matchers.",
      "Key Architecture Decision: Kept Notion as the single source of truth for user records rather than building a custom database, allowing the user to view, edit, and organize their life data natively in Notion's apps on mobile and desktop.",
      "Benchmarked Performance: Sub-second Telegram message handling; <1s multi-database review generation via parallel `asyncio.gather`; <50 MB RAM footprint in Docker."
    ],
    "algorithmsAndDataStructures": [
      "Logical Day Time-Shift Algorithm (\\(\\text{Date}_{\\text{logical}} = (\\text{now}(\\text{tz}) - 4\\text{ hours}).\\text{date}()\\)), PostgreSQL Idempotency Check (`processed_updates`), Concurrent Asynchronous Fan-Out (`asyncio.gather`), Text Block Chunking (1900-char array slicing for Notion block API), and Deterministic Regex Fallback Matchers."
    ],
    "benchmarks": [
      "Sub-second Telegram message handling; <1s multi-database review generation via parallel `asyncio.gather`; <50 MB RAM footprint in Docker."
    ],
    "testingAndVerification": [
      "Unit tests for deterministic regex parser in [`tests/test_parser.py`](file:///c:/Users/prasa/OneDrive/Desktop/ProjectOTG/eviden/life_manager/tests/test_parser.py); manual end-to-end integration testing for webhook delivery, Notion page updates, and Gemini API error recovery; test script [`test_gemini.py`](file:///c:/Users/prasa/OneDrive/Desktop/ProjectOTG/eviden/life_manager/test_gemini.py)."
    ],
    "github": "https://github.com/prasadkankhar10/lifemanager",
    "liveDemo": null,
    "manualActionRequired": {
      "summary": "Action Required: Media Assets & External Deployment Pending Manual Supply",
      "items": [
        "Record a 30s video sending a messy voice note/text to the bot and showing it appear organized in Notion.",
        "Provide public sanitized Notion template link for portfolio visitors."
      ]
    }
  },

  TRIGGER_Project_Sahaj: {
    "stationId": "TRIGGER_Project_Sahaj",
    "category": "AI & Autonomous Systems",
    "title": "Sahaj: Multilingual AI Accessibility & Document Translation Suite",
    "subtitle": "An AI-powered multimodal accessibility web application that extracts text from images, generates neural visual captions, simplifies complex prose, translates content into 6+ Indian and global languages, and synthesizes natural audio speech.",
    "badge": "Python / Streamlit / EasyOCR / Hugg",
    "description": "Visually impaired individuals, illiterate users, and non-native speakers face massive digital accessibility barriers when encountering printed documents, instructional diagrams, signs, and digital imagery with foreign or complex text. **Multilingual OCR Text Extractor**: Built an image-to-text pipeline using EasyOCR's deep learning models (CRAFT text detection + CRNN text recognition) configured for both Latin and Devanagari scripts, processing PIL images via NumPy arrays.",
    "problemStatement": "Visually impaired individuals, illiterate users, and non-native speakers face massive digital accessibility barriers when encountering printed documents, instructional diagrams, signs, and digital imagery with foreign or complex text.",
    "targetAudience": "Visually impaired and low-vision individuals, cross-border travelers, language learners, elderly users, and frontline workers needing immediate audio translation of physical text and scene contents.",
    "roleDescription": "End-to-end architecture and pipeline integration: implemented multilingual EasyOCR optical text extraction, ViT-GPT2 vision-language captioning via Hugging Face Inference API, MyMemory translation pipeline, offline/online dual-engine speech synthesis (`pyttsx3` / `gTTS`), and Streamlit interactive web interface.",
    "metrics": [
      "Bilingual Latin and Devanagari document OCR leveraging EasyOCR (CRAFT text detection + CRNN text recognition)",
      "Vision Transformer (ViT-GPT2) image captioning generating descriptive auditory scene representations for visually impaired users",
      "Multi-engine text-to-speech with offline pyttsx3 fallback and high-fidelity gTTS streaming in 6 regional languages",
      "Zero-disk in-memory audio buffer pipeline (`io.BytesIO`) ensuring privacy and instantaneous audio playback"
    ],
    "primaryTech": [
      "Python 3.10+",
      "Streamlit",
      "EasyOCR (PyTorch)",
      "Hugging Face Transformers / Inference API (ViT-GPT2)",
      "PIL (Pillow)",
      "NumPy"
    ],
    "techStack": [
      "Python 3.10+",
      "Streamlit",
      "EasyOCR (PyTorch)",
      "Hugging Face Transformers / Inference API (ViT-GPT2)",
      "PIL (Pillow)",
      "NumPy",
      "pyttsx3",
      "gTTS",
      "Requests",
      "Regex."
    ],
    "highlights": [
      "Multilingual OCR Text Extractor: Built an image-to-text pipeline using EasyOCR's deep learning models (CRAFT text detection + CRNN text recognition) configured for both Latin and Devanagari scripts, processing PIL images via NumPy arrays.",
      "Algorithms & Data Structures: Connectionist Temporal Classification (CTC) Decoding (via EasyOCR CRNN), Vision Transformer Patch Tokenization & GPT-2 Self-Attention Decoding (ViT-GPT2), Regular Expression Lexical Mapping (text simplification), In-Memory FIFO Byte Buffering (`io.BytesIO`), and Base64 Payload Encoding.",
      "Key Architecture Decision: Used Streamlit for the front-end to enable rapid prototyping of reactive machine learning pipelines, and chose EasyOCR over Tesseract due to superior handling of curved, low-resolution, and real-world scene text.",
      "Benchmarked Performance: Fast sub-second OCR text extraction on standard imagery; zero server disk I/O through `BytesIO` memory piping; low client bundle footprint (<10 MB client overhead)."
    ],
    "algorithmsAndDataStructures": [
      "Connectionist Temporal Classification (CTC) Decoding (via EasyOCR CRNN), Vision Transformer Patch Tokenization & GPT-2 Self-Attention Decoding (ViT-GPT2), Regular Expression Lexical Mapping (text simplification), In-Memory FIFO Byte Buffering (`io.BytesIO`), and Base64 Payload Encoding."
    ],
    "benchmarks": [
      "Fast sub-second OCR text extraction on standard imagery; zero server disk I/O through `BytesIO` memory piping; low client bundle footprint (<10 MB client overhead)."
    ],
    "testingAndVerification": [
      "Manual testing with diverse test imagery (street signage, bilingual English-Hindi receipts, book pages, low-contrast photos); validated TTS playback across Hindi, Kannada, Bengali, Spanish, French, and German audio engines."
    ],
    "github": "https://github.com/prasadkankhar10/sahaj",
    "liveDemo": null,
    "manualActionRequired": {
      "summary": "Action Required: Media Assets & External Deployment Pending Manual Supply",
      "items": [
        "Deploy Streamlit app to Streamlit Community Cloud (free 1-click hosting).",
        "Record a 30s screen recording showing document upload, OCR extraction, and Marathi audio playback."
      ]
    }
  },

  TRIGGER_Project_ExamPlatform: {
    "stationId": "TRIGGER_Project_ExamPlatform",
    "category": "Full-Stack & Cloud Systems",
    "title": "Local LAN AI-Powered Examination & Anti-Cheat Platform",
    "subtitle": "A full-stack local-network examination system built with FastAPI and React, featuring AI semantic similarity grading using Sentence-Transformers, automated anti-cheat monitoring, and multi-tier question evaluations (MCQ, Scenario, Hands-on Lab).",
    "badge": "FastAPI / React 18 / Sentence-Trans",
    "description": "Traditional educational exam tools are either reliant on continuous external internet connectivity (failing during network outages or strict air-gapped lab environments) or restricted to simple multiple-choice questions because evaluating subjective/scenario-based answers requires tedious manual grading. **AI Semantic Answer Evaluation Engine**: Built `ai_checker.py` using `all-MiniLM-L6-v2`. It encodes the student's open-ended response and the teacher's reference answer into normalized 384-dimensional dense vectors, calculates cosine similarity using PyTorch, and maps scores through a tiered rubric ($\\ge 0.85 \\implies 100\\%$, $\\ge 0.65 \\implies 60\\%$, else $0\\%$) with instantaneous feedback.",
    "problemStatement": "Traditional educational exam tools are either reliant on continuous external internet connectivity (failing during network outages or strict air-gapped lab environments) or restricted to simple multiple-choice questions because evaluating subjective/scenario-based answers requires tedious manual grading.",
    "targetAudience": "Universities, colleges, coding bootcamps, and schools conducting assessments across internal computer laboratories without requiring cloud subscription fees or high-bandwidth internet connections.",
    "roleDescription": "End-to-end Architecture: FastAPI REST backend, PyTorch/Sentence-Transformers NLP semantic grading engine, React/Vite/Tailwind frontend, client-side Anti-Cheat event interception, LAN network binding (`0.0.0.0`), SQLAlchemy relational schemas, and Admin analytics suite.",
    "metrics": [
      "Zero-cloud campus intranet architecture: runs entirely on local LAN servers without requiring internet connectivity",
      "Automated descriptive answer evaluation using Sentence-Transformers cosine similarity scoring against rubric reference answers",
      "AntiCheatGuard security layer enforcing fullscreen locks, clipboard interception, and logging tab-switch infractions",
      "Automated programmatic PDF scorecard generation using ReportLab compiling detailed question-by-question analytics"
    ],
    "primaryTech": [
      "Backend: Python 3.10+",
      "FastAPI 0.111",
      "Uvicorn",
      "SQLAlchemy 2.0",
      "Pydantic v2",
      "PyJWT"
    ],
    "techStack": [
      "Backend: Python 3.10+",
      "FastAPI 0.111",
      "Uvicorn",
      "SQLAlchemy 2.0",
      "Pydantic v2",
      "PyJWT",
      "Passlib (Bcrypt)",
      "ReportLab (PDF Generation).<br>AI/ML: `sentence-transformers` 2.7 (`all-MiniLM-L6-v2`)",
      "PyTorch",
      "Scikit-learn",
      "NumPy.<br>Frontend: React 18",
      "Vite 5",
      "Tailwind CSS",
      "Zustand / React State",
      "React Router DOM",
      "Axios."
    ],
    "highlights": [
      "AI Semantic Answer Evaluation Engine: Built `ai_checker.py` using `all-MiniLM-L6-v2`. It encodes the student's open-ended response and the teacher's reference answer into normalized 384-dimensional dense vectors, calculates cosine similarity using PyTorch, and maps scores through a tiered rubric ($\\ge 0.85 \\implies 100\\%$, $\\ge 0.65 \\implies 60\\%$, else $0\\%$) with instantaneous feedback.",
      "Algorithms & Data Structures: • Dense Vector Embedding & Cosine Similarity: High-dimensional vector space dot product: $\\cos(\\theta) = \\frac{\\mathbf{u} \\cdot \\mathbf{v}}{\\",
      "Key Architecture Decision: • FastAPI over Django/Flask: Selected for asynchronous request handling speed, native Pydantic schema validation, and automatic OpenAPI documentation.<br>• Local MiniLM Model over Cloud LLM APIs (OpenAI/Anthropic): Kept evaluation 100% local, eliminating API costs, latency spikes, and external internet dependency during exams.",
      "Benchmarked Performance: • NLP inference latency: <50ms per answer on standard quad-core CPU.<br>• React UI responsiveness: 60 FPS transitions.<br>• Backend throughput: Supports 50+ concurrent LAN student connections on a single host PC."
    ],
    "algorithmsAndDataStructures": [
      "• Dense Vector Embedding & Cosine Similarity: High-dimensional vector space dot product: $\\cos(\\theta) = \\frac{\\mathbf{u} \\cdot \\mathbf{v}}{\\"
    ],
    "benchmarks": [
      "• NLP inference latency: <50ms per answer on standard quad-core CPU.<br>• React UI responsiveness: 60 FPS transitions.<br>• Backend throughput: Supports 50+ concurrent LAN student connections on a single host PC."
    ],
    "testingAndVerification": [
      "Manual end-to-end exam simulations: multi-device testing over Wi-Fi, anti-cheat trigger verification, edge-case validation for timer expiration, and semantic variance testing on diverse phrasing of correct answers."
    ],
    "github": "https://github.com/prasadkankhar10/examplatform",
    "liveDemo": null,
    "manualActionRequired": {
      "summary": "Action Required: Media Assets & External Deployment Pending Manual Supply",
      "items": [
        "Capture screenshots of student test interface and instructor grading dashboard.",
        "Record a 45s walkthrough taking an exam, triggering a tab-switch warning, and seeing the semantic score generated."
      ]
    }
  },

  TRIGGER_Project_Sadhana: {
    "stationId": "TRIGGER_Project_Sadhana",
    "category": "Full-Stack & Cloud Systems",
    "title": "Sadhana: Full-Stack Habit Discipline & Streak PWA",
    "subtitle": "A playful, hand-drawn PWA habit tracker and personal discipline suite featuring offline sync, time-block scheduling, streak analytics, and client-side notifications.",
    "badge": "TypeScript / React 18 / Tailwind CS",
    "description": "Most habit and productivity trackers feel sterile, mechanical, or chore-like, leading to rapid drop-off; additionally, many lack offline reliability, seamless mobile installability, or require heavy, privacy-invasive backend push notification infrastructure. **Habit & Streak Engine**: Implemented real-time habit cards with Firestore persistence, calculating consecutive daily streaks, historical completion arrays, and trigger conditions for `react-confetti` celebrations and sparkle bursts upon habit completion.",
    "problemStatement": "Most habit and productivity trackers feel sterile, mechanical, or chore-like, leading to rapid drop-off; additionally, many lack offline reliability, seamless mobile installability, or require heavy, privacy-invasive backend push notification infrastructure.",
    "targetAudience": "Students, developers, and self-improvement enthusiasts who want an engaging, tactile, notebook-style productivity workspace without ad clutter or complicated setups.",
    "roleDescription": "End-to-end Full Stack Architecture, UI/UX Design, React/TypeScript Frontend, Firebase Backend Integration, PWA Offline Service Worker, Automated CI/CD Pipeline, and Developer Tooling.",
    "metrics": [
      "Atomic Cloud Firestore transactions preventing race conditions and counter corruption on multi-device check-ins",
      "Optimistic UI updates delivering 0ms perceived latency on habit toggle with background synchronization",
      "Multi-metric analytics engine computing streak retention, weekly completion percentages, and category consistency scores",
      "Full Progressive Web App (PWA) offline cache support via Service Worker caching core assets for zero-connectivity access"
    ],
    "primaryTech": [
      "React 18",
      "TypeScript 5",
      "Vite 5",
      "Tailwind CSS 3",
      "Firebase 10 (Google Auth & Firestore)",
      "Chart.js 4"
    ],
    "techStack": [
      "React 18",
      "TypeScript 5",
      "Vite 5",
      "Tailwind CSS 3",
      "Firebase 10 (Google Auth & Firestore)",
      "Chart.js 4",
      "react-chartjs-2",
      "react-calendar-heatmap",
      "ReactQuill",
      "react-rough-notation",
      "react-confetti."
    ],
    "highlights": [
      "Habit & Streak Engine: Implemented real-time habit cards with Firestore persistence, calculating consecutive daily streaks, historical completion arrays, and trigger conditions for `react-confetti` celebrations and sparkle bursts upon habit completion.",
      "Algorithms & Data Structures: • Streak Calculation: \\(O(N \\log N)\\) date sorting and \\(O(N)\\) linear delta validation to track consecutive vs. broken day sequences.<br>• Interval Overlap Collision Detection: \\(O(M)\\) bounding interval logic (`newStart < bEnd && newEnd > bStart`) over time-of-day minute representations.<br>• Array Deduplication & Set Intersections: Computes multi-habit \"Perfect Day\" overlap sets across discrete date strings.",
      "Key Architecture Decision: • Firebase Firestore over Relational DB: Provided instantaneous real-time sync (`onSnapshot`) without the overhead of maintaining custom WebSocket server infrastructure.<br>• PWA over Native App Store build: Enabled zero-friction cross-platform installation via browser (\"Add to Home Screen\") while keeping codebase unified in React.",
      "Benchmarked Performance: Fast initial paint (<1.2s on mobile 4G) via Vite ESBuild bundling and chunk splitting; smooth 60 FPS CSS-accelerated animations; instant local optimistic UI updates preceding network roundtrips."
    ],
    "algorithmsAndDataStructures": [
      "• Streak Calculation: \\(O(N \\log N)\\) date sorting and \\(O(N)\\) linear delta validation to track consecutive vs. broken day sequences.<br>• Interval Overlap Collision Detection: \\(O(M)\\) bounding interval logic (`newStart < bEnd && newEnd > bStart`) over time-of-day minute representations.<br>• Array Deduplication & Set Intersections: Computes multi-habit \"Perfect Day\" overlap sets across discrete date strings."
    ],
    "benchmarks": [
      "Fast initial paint (<1.2s on mobile 4G) via Vite ESBuild bundling and chunk splitting; smooth 60 FPS CSS-accelerated animations; instant local optimistic UI updates preceding network roundtrips."
    ],
    "testingAndVerification": [
      "Jest + React Testing Library + JSDOM for UI component testing (e.g. `DarkModeToggle.test.tsx`, testing DOM class mutations and event handlers); manual edge testing via built-in Developer Cheat Menu."
    ],
    "github": "https://github.com/prasadkankhar10/sadhana",
    "liveDemo": null,
    "manualActionRequired": {
      "summary": "Action Required: Media Assets & External Deployment Pending Manual Supply",
      "items": [
        "Deploy live build to Firebase Hosting or Vercel.",
        "Record a 20-second mobile screen recording demonstrating habit toggling and streak celebration animation."
      ]
    }
  },

  TRIGGER_Project_Nishtha: {
    "stationId": "TRIGGER_Project_Nishtha",
    "category": "Full-Stack & Cloud Systems",
    "title": "Nishtha: Gamified Habit Tracking & Sanskrit RPG Leveling Engine",
    "subtitle": "An offline-first, gamified habit tracker Progressive Web App powered by Supabase and localStorage, featuring a 15-tier Sanskrit philosophical RPG progression system, streak-unlocked themes, real-world reward mapping, and audio/confetti micro-interactions.",
    "badge": "Vanilla JavaScript (OOP) / HTML5 Ca",
    "description": "Standard habit trackers rely on dull binary checklists that fail to sustain long-term student motivation; furthermore, most lack offline resilience, data portability, or tangible real-world incentive alignment. **15-Tier RPG Leveling Engine**: Programmed mathematical progression curves across 15 classical discipline stages (Day 1 Ārambha to Day 365 Siddhi), dynamically calculating XP percentages (`getXPBarPercent`), pulse effects, level-up celebration toasts, and tiered badges (Bronze at 5, Silver at 10, Gold at 20).",
    "problemStatement": "Standard habit trackers rely on dull binary checklists that fail to sustain long-term student motivation; furthermore, most lack offline resilience, data portability, or tangible real-world incentive alignment.",
    "targetAudience": "Students, self-improvement enthusiasts, and gamers who respond to RPG-style level progressions, milestone unlockables, and customizable personal reward incentives.",
    "roleDescription": "End-to-end Full Stack Architecture, UI/UX Design, Supabase Database & Auth Integration, Offline-First Service Worker Implementation, Gamification Game Loop Design, SCSS Theming, and Developer Tooling.",
    "metrics": [
      "15-tier Sanskrit RPG leveling system with mathematical XP curve scaling: `XP_required = 100 * (level ^ 1.5)`",
      "Offline-first dual-storage architecture: synchronous LocalStorage updates mirrored to Supabase PostgreSQL on reconnect",
      "Custom lightweight HTML5 Canvas particle explosion engine executing at 60 FPS without external physics libraries",
      "Built-in developer debugging console (`Ctrl+Shift+D`) enabling deterministic state injection and regression testing"
    ],
    "primaryTech": [
      "JavaScript (Vanilla ES6+ Object-Oriented Classes)",
      "HTML5",
      "SCSS/CSS3",
      "Supabase JS Client (`@supabase/supabase-js`)",
      "Supabase Auth & PostgreSQL",
      "Service Worker API"
    ],
    "techStack": [
      "JavaScript (Vanilla ES6+ Object-Oriented Classes)",
      "HTML5",
      "SCSS/CSS3",
      "Supabase JS Client (`@supabase/supabase-js`)",
      "Supabase Auth & PostgreSQL",
      "Service Worker API",
      "HTML5 Web Notification API."
    ],
    "highlights": [
      "15-Tier RPG Leveling Engine: Programmed mathematical progression curves across 15 classical discipline stages (Day 1 Ārambha to Day 365 Siddhi), dynamically calculating XP percentages (`getXPBarPercent`), pulse effects, level-up celebration toasts, and tiered badges (Bronze at 5, Silver at 10, Gold at 20).",
      "Algorithms & Data Structures: • ISO Week Number Calculation: Implemented Thursday-based ISO-8601 calendar arithmetic (`getISOWeek`) to evaluate weekly consistency targets.<br>• XP Interpolation Formula: Fractional percentage calculation mapping streak days to non-linear level intervals:<br>$$\\text{XP\\%} = \\frac{\\text{streak} - \\text{prevDays}}{\\text{nextDays} - \\text{prevDays}} \\times 100$$<br>• Particle Physics Simulation: Generates 32 dynamic DOM confetti particles with randomized HSL color hues, velocity offsets, and CSS keyframe animations.",
      "Key Architecture Decision: • Supabase over Firebase: Selected Supabase to leverage relational PostgreSQL capabilities, custom JSONB structures for rewards, and minimal client library overhead.<br>• Sanskrit Philosophical Progression: Named the 15 levels after classical discipline concepts (Ārambha, Abhyāsa, Niṣṭhā, Sādhanā, Siddhi) to deliver unique cultural resonance and psychological depth.",
      "Benchmarked Performance: Instant initial paint (<150ms) served directly from Service Worker cache; optimistic local DOM updates eliminating perceived network latency; smooth 60 FPS CSS transform animations."
    ],
    "algorithmsAndDataStructures": [
      "• ISO Week Number Calculation: Implemented Thursday-based ISO-8601 calendar arithmetic (`getISOWeek`) to evaluate weekly consistency targets.<br>• XP Interpolation Formula: Fractional percentage calculation mapping streak days to non-linear level intervals:<br>$$\\text{XP\\%} = \\frac{\\text{streak} - \\text{prevDays}}{\\text{nextDays} - \\text{prevDays}} \\times 100$$<br>• Particle Physics Simulation: Generates 32 dynamic DOM confetti particles with randomized HSL color hues, velocity offsets, and CSS keyframe animations."
    ],
    "benchmarks": [
      "Instant initial paint (<150ms) served directly from Service Worker cache; optimistic local DOM updates eliminating perceived network latency; smooth 60 FPS CSS transform animations."
    ],
    "testingAndVerification": [
      "Manual cross-browser testing; DevTools network throttling and offline mode testing; boundary testing via the built-in `Ctrl+Shift+D` Developer Cheat Panel."
    ],
    "github": "https://github.com/prasadkankhar10/nishtha",
    "liveDemo": null,
    "manualActionRequired": {
      "summary": "Action Required: Media Assets & External Deployment Pending Manual Supply",
      "items": [
        "Host on GitHub Pages (static client repo).",
        "Record a 15-second screen recording showing a task completion trigger the particle explosion and rank level-up."
      ]
    }
  },

  TRIGGER_Project_TraceMateAR: {
    "stationId": "TRIGGER_Project_TraceMateAR",
    "category": "Spatial Computing & WebAR",
    "title": "TraceMate Pro: WebAR Camera Tracing & Drawing PWA",
    "subtitle": "A browser-based Augmented Reality optical camera tracing PWA that superimposes reference images onto a live environment camera feed with real-time computer vision template matching to stabilize paper drift.",
    "badge": "Vanilla JavaScript / HTML5 Canvas /",
    "description": "Traditional artists and calligraphers seeking to transfer digital sketches or photos to physical paper often need expensive optical devices (Camera Lucida, lightboxes, or projectors), while existing mobile tracing apps lock features behind paywalls, require heavy native installs, or drift out of alignment when the phone stand shifts. **Smart Anchor Drift Stabilization**: Built a real-time computer vision tracking engine using an offscreen canvas and Sum of Absolute Differences (SAD) template matching on a 32x32 pixel patch to detect and compensate for physical camera movement.",
    "problemStatement": "Traditional artists and calligraphers seeking to transfer digital sketches or photos to physical paper often need expensive optical devices (Camera Lucida, lightboxes, or projectors), while existing mobile tracing apps lock features behind paywalls, require heavy native installs, or drift out of alignment when the phone stand shifts.",
    "targetAudience": "Traditional sketch artists, calligraphers, tattoo designers, art educators, miniature painters, and hobbyist illustrators transferring digital art onto paper or canvas.",
    "roleDescription": "End-to-end design and implementation: pure JS computer vision template matching algorithm, multi-touch gesture engine (pan/zoom/rotate), camera hardware API integration (torch/focus/environment), MediaRecorder canvas compositing, and offline Service Worker caching.",
    "metrics": [
      "Pure JavaScript Sum of Absolute Differences (SAD) optical template matching tracking paper drift in real time",
      "Multi-touch Euclidean distance pinch-to-scale and trigonometric atan2 rotational alignment controls",
      "Dual-feed MediaRecorder compositor recording both real camera stream and virtual overlay into downloadable MP4 video",
      "Direct hardware camera flashlight (torch) control via `ImageCapture.track.applyConstraints()` for low-light tracing"
    ],
    "primaryTech": [
      "JavaScript (ES6+)",
      "HTML5 Canvas API",
      "CSS3 (GPU Transforms",
      "Grid",
      "Flexbox",
      "Blend Modes)"
    ],
    "techStack": [
      "JavaScript (ES6+)",
      "HTML5 Canvas API",
      "CSS3 (GPU Transforms",
      "Grid",
      "Flexbox",
      "Blend Modes)",
      "WebRTC / MediaDevices API",
      "MediaRecorder API",
      "Service Workers API",
      "Web App Manifest."
    ],
    "highlights": [
      "Smart Anchor Drift Stabilization: Built a real-time computer vision tracking engine using an offscreen canvas and Sum of Absolute Differences (SAD) template matching on a 32x32 pixel patch to detect and compensate for physical camera movement.",
      "Algorithms & Data Structures: Sum of Absolute Differences (SAD) Template Matching for optical tracking, ITU-R BT.601 Luminance Formula (\\(Y = 0.3R + 0.59G + 0.11B\\)) for grayscale conversion, Euclidean Geometry for pinch scale, Trigonometric Arctangent for rotation delta, and Debounce Algorithm (1000ms trailing edge) for LocalStorage writes.",
      "Key Architecture Decision: Chose pure Vanilla JavaScript without external frameworks or heavy computer vision libraries (like OpenCV.js or TensorFlow.js) to keep bundle size minimal (<50 KB), eliminate third-party dependencies, and guarantee instant cold-start times on mobile devices.",
      "Benchmarked Performance: Steady 60 FPS UI and camera feed; sub-4ms optical template matching compute cycle; zero server latency; lightweight asset bundle under 50 KB total size (instant sub-second initial load)."
    ],
    "algorithmsAndDataStructures": [
      "Sum of Absolute Differences (SAD) Template Matching for optical tracking, ITU-R BT.601 Luminance Formula (\\(Y = 0.3R + 0.59G + 0.11B\\)) for grayscale conversion, Euclidean Geometry for pinch scale, Trigonometric Arctangent for rotation delta, and Debounce Algorithm (1000ms trailing edge) for LocalStorage writes."
    ],
    "benchmarks": [
      "Steady 60 FPS UI and camera feed; sub-4ms optical template matching compute cycle; zero server latency; lightweight asset bundle under 50 KB total size (instant sub-second initial load)."
    ],
    "testingAndVerification": [
      "Manual cross-device testing across Android (Chrome) and iOS (Safari), testing torch constraint support, touch gesture responsiveness, optical tracking stability across various lighting levels, and PWA offline installation."
    ],
    "github": "https://github.com/prasadkankhar10/tracematear",
    "liveDemo": null,
    "manualActionRequired": {
      "summary": "Action Required: Media Assets & External Deployment Pending Manual Supply",
      "items": [
        "Host on GitHub Pages with HTTPS enabled (required for camera access permissions).",
        "Record a 30s phone video showing someone tracing a sketch onto real paper using the phone screen."
      ]
    }
  },

  TRIGGER_Project_RealmWebAR: {
    "stationId": "TRIGGER_Project_RealmWebAR",
    "category": "Spatial Computing & WebAR",
    "title": "Realm of Prasad: Augmented Reality 3D Portfolio Island",
    "subtitle": "A WebXR & 8th Wall Augmented Reality 3D RPG portfolio diorama built in React Three Fiber, Rapier 3D physics, and Three.js, projecting an interactive floating island with 27 animated NPCs onto tabletop physical surfaces.",
    "badge": "TypeScript / React 19 / R3F / 8th W",
    "description": "Traditional 2D resume websites are static, generic, and unengaging for recruiters evaluating high-end creative technologists, 3D graphics programmers, and game developers. They fail to tangibly demonstrate spatial computing, 3D physics, GLTF optimization, shader programming, and mobile AR expertise. **8th Wall SLAM Camera Sync**: Engineered `EighthWallXR.tsx` to hook into 8th Wall's camera pipeline (`r3f-sync`), disabling R3F's auto-update matrix and directly injecting 6-DOF quaternion rotations, translation vectors, and camera optical intrinsics into Three.js at 60 FPS.",
    "problemStatement": "Traditional 2D resume websites are static, generic, and unengaging for recruiters evaluating high-end creative technologists, 3D graphics programmers, and game developers. They fail to tangibly demonstrate spatial computing, 3D physics, GLTF optimization, shader programming, and mobile AR expertise.",
    "targetAudience": "Tech recruiters, engineering hiring managers, AR/VR studios, game development companies, and interactive web enthusiasts.",
    "roleDescription": "End-to-end architecture and implementation: built the React Three Fiber 3D scene, monkey-patched Rapier physics raycasting for miniature AR tabletop scale (`PhysicsScaler`), integrated 8th Wall SLAM tracking pipeline (`r3f-sync` camera module), configured post-processing bloom/outline shaders, scripted 27 animated GLTF NPCs with idle/walk crossfading, designed the branching dialog state machine, and created hybrid entry modes (WebXR, 8th Wall, AR.js marker, and desktop 3D).",
    "metrics": [
      "Tabletop markerless AR diorama projection anchoring the entire 3D fantasy island onto physical surfaces in real time",
      "PhysicsScaler monkey-patching algorithm for Rapier 3D enabling miniature physics simulations (x0.015 scale) without numerical collapse",
      "8th Wall SLAM tracking and camera intrinsics synchronization rendering high-poly 3D models with true physical depth",
      "Adaptive touch raycasting translating 2D screen taps to 3D world coordinates on miniaturized spatial collider meshes"
    ],
    "primaryTech": [
      "TypeScript",
      "React 19",
      "Three.js",
      "React Three Fiber (@react-three/fiber)",
      "React Three Drei (@react-three/drei)",
      "Rapier 3D Physics (@react-three/rapier)"
    ],
    "techStack": [
      "TypeScript",
      "React 19",
      "Three.js",
      "React Three Fiber (@react-three/fiber)",
      "React Three Drei (@react-three/drei)",
      "Rapier 3D Physics (@react-three/rapier)",
      "8th Wall SLAM Engine (XR8)",
      "WebXR Device API",
      "AR.js",
      "Zustand",
      "@react-three/postprocessing",
      "TailwindCSS",
      "Vite."
    ],
    "highlights": [
      "8th Wall SLAM Camera Sync: Engineered `EighthWallXR.tsx` to hook into 8th Wall's camera pipeline (`r3f-sync`), disabling R3F's auto-update matrix and directly injecting 6-DOF quaternion rotations, translation vectors, and camera optical intrinsics into Three.js at 60 FPS.",
      "Algorithms & Data Structures: Raycast Scale Normalization Algorithm (\\(\\mathbf{R}_{\\text{scaled}} = (\\mathbf{O} \\times s, \\mathbf{D})\\)), Hamilton Quaternion 6-DOF Rotations (\\(q = w + xi + yj + zk\\)), Flocking Boids Algorithm for instanced bird flight paths, and Branching Directed Graph Traversal for dialog trees.",
      "Key Architecture Decision: Selected 8th Wall SLAM as the primary AR engine to provide seamless markerless AR across all mobile browsers (especially iOS Safari, which lacks native WebXR floor tracking support).",
      "Benchmarked Performance: 60 FPS rendering on modern mobile GPUs; sub-100MB memory footprint; efficient GPU instancing for foliage and particles; lazy-loaded GLTF mesh components."
    ],
    "algorithmsAndDataStructures": [
      "Raycast Scale Normalization Algorithm (\\(\\mathbf{R}_{\\text{scaled}} = (\\mathbf{O} \\times s, \\mathbf{D})\\)), Hamilton Quaternion 6-DOF Rotations (\\(q = w + xi + yj + zk\\)), Flocking Boids Algorithm for instanced bird flight paths, and Branching Directed Graph Traversal for dialog trees."
    ],
    "benchmarks": [
      "60 FPS rendering on modern mobile GPUs; sub-100MB memory footprint; efficient GPU instancing for foliage and particles; lazy-loaded GLTF mesh components."
    ],
    "testingAndVerification": [
      "Cross-device testing on mobile devices (iOS Safari with 8th Wall, Android Chrome with WebXR), and desktop testing with automated Playwright browser test scripts (`test_pw.js`)."
    ],
    "github": "https://github.com/prasadkankhar10/realmwebar",
    "liveDemo": null,
    "manualActionRequired": {
      "summary": "Action Required: Media Assets & External Deployment Pending Manual Supply",
      "items": [
        "Provide 8th Wall hosted URL or WebXR deployment link.",
        "Record a 30s video showing the 3D island anchored onto a desk through a smartphone camera."
      ]
    }
  },

  TRIGGER_Project_SmartCampus: {
    "stationId": "TRIGGER_Project_SmartCampus",
    "category": "Full-Stack & Cloud Systems",
    "title": "Smart Campus: Real-Time QR Room & Lab Availability System",
    "subtitle": "A zero-backend static web application and automated Python ETL data pipeline that decodes complex college Excel timetable matrices to provide instant, real-time room and lab occupancy status via doorway QR code scans.",
    "badge": "JavaScript ES6+ / HTML5 / CSS3 / Py",
    "description": "College campuses suffer from persistent scheduling confusion: students and faculty wander hallways searching for empty classrooms or labs to study or hold makeup sessions. Physical paper timetables posted on doors are static, become outdated whenever faculty swap classes, and do not convey whether a room is currently occupied by an active lecture or vacant during a recess. **Inverted Timetable Extraction Pipeline**: Engineered `extract_rooms.py` using `pandas` and regex; instead of indexing spreadsheets by academic batch, it scans cell content across all lecture halls and practical batches for embedded room codes (e.g. `524/526/527`), inverting the entire schedule to construct unified physical room timetables while merging concurrent batch collisions.",
    "problemStatement": "College campuses suffer from persistent scheduling confusion: students and faculty wander hallways searching for empty classrooms or labs to study or hold makeup sessions. Physical paper timetables posted on doors are static, become outdated whenever faculty swap classes, and do not convey whether a room is currently occupied by an active lecture or vacant during a recess.",
    "targetAudience": "University students searching for quiet study rooms, faculty members scheduling ad-hoc practicals, academic administrators managing infrastructure utilization, and campus visitors.",
    "roleDescription": "Built the complete system from end to end: reverse-engineered and parsed legacy college timetable workbooks (`.xls`, `.xlsx`), engineered an \"inverted room extraction\" Python ETL pipeline to resolve multi-batch concurrent lab allocations, authored real-time time-slot matching algorithms in client-side JavaScript, designed a responsive mobile-first UI with CSS variable theme toggling, and generated per-room static QR access landing pages.",
    "metrics": [
      "Inverted room extraction ETL pipeline parsing complex college Excel matrices with merged-cell multi-teacher formats",
      "Client-side temporal scheduling engine computing minute-accurate room occupancy status without database queries",
      "Instant sub-100ms load time engineered as zero-dependency vanilla JS and lightweight JSON files cached on static edge",
      "Campus-wide physical deployment: QR codes posted outside engineering labs and lecture halls across the department"
    ],
    "primaryTech": [
      "JavaScript (ES6+)",
      "HTML5",
      "CSS3 (CSS Variables & Grid/Flexbox)",
      "Python 3.10+",
      "pandas",
      "xlrd"
    ],
    "techStack": [
      "JavaScript (ES6+)",
      "HTML5",
      "CSS3 (CSS Variables & Grid/Flexbox)",
      "Python 3.10+",
      "pandas",
      "xlrd",
      "openpyxl",
      "Local HTTP Server / Static Web Hosting."
    ],
    "highlights": [
      "Inverted Timetable Extraction Pipeline: Engineered `extract_rooms.py` using `pandas` and regex; instead of indexing spreadsheets by academic batch, it scans cell content across all lecture halls and practical batches for embedded room codes (e.g. `524/526/527`), inverting the entire schedule to construct unified physical room timetables while merging concurrent batch collisions.",
      "Algorithms & Data Structures: Matrix Inversion Algorithm (bipartite timetable cell-to-physical room mapping), Regex Tokenizer & Lexical Normalizer for time range parsing, Linear Time-Window Interval Intersection (\\([t_{\\text{start}}, t_{\\text{end}}] \\cap t_{\\text{current}}\\)), Hash Map Deduplication for concurrent lab batch merging, and DOM Event Delegation.",
      "Key Architecture Decision: Opted for a 100% static client-side web application rather than building a heavy React/Node.js/SQL backend to ensure the system can be hosted on zero-budget college infrastructure and load instantly over weak campus Wi-Fi/cellular signals.",
      "Benchmarked Performance: Sub-50ms initial render time; tiny static asset payload (< 35KB compressed without data, ~110KB with full database); zero runtime memory overhead; instant client-side search filtering at 60 FPS."
    ],
    "algorithmsAndDataStructures": [
      "Matrix Inversion Algorithm (bipartite timetable cell-to-physical room mapping), Regex Tokenizer & Lexical Normalizer for time range parsing, Linear Time-Window Interval Intersection (\\([t_{\\text{start}}, t_{\\text{end}}] \\cap t_{\\text{current}}\\)), Hash Map Deduplication for concurrent lab batch merging, and DOM Event Delegation."
    ],
    "benchmarks": [
      "Sub-50ms initial render time; tiny static asset payload (< 35KB compressed without data, ~110KB with full database); zero runtime memory overhead; instant client-side search filtering at 60 FPS."
    ],
    "testingAndVerification": [
      "Cross-browser testing on mobile devices (iOS Safari, Android Chrome) simulating QR code scan workflows; validation scripts (`archive/validate_data.py`, `archive/analyze_cells.py`) checking schedule integrity across all 26 rooms."
    ],
    "github": "https://github.com/prasadkankhar10/smartcampus",
    "liveDemo": null,
    "manualActionRequired": {
      "summary": "Action Required: Media Assets & External Deployment Pending Manual Supply",
      "items": [
        "Host static portal on GitHub Pages or Vercel.",
        "Add photos of actual printed QR codes mounted outside college labs."
      ]
    }
  },

  TRIGGER_Project_GameStore: {
    "stationId": "TRIGGER_Project_GameStore",
    "category": "Full-Stack & Cloud Systems",
    "title": "Digital Game Discovery & Storefront Platform",
    "subtitle": "A lightweight, paper-styled digital storefront and game discovery web application featuring real-time search, multi-category curation, dynamic query-parameter game detail pages, and a developer submission pipeline.",
    "badge": "Vanilla JavaScript ES6+ / HTML5 / P",
    "description": "Major game storefronts (Steam, Epic Games) are often bloated, ad-cluttered, and resource-heavy, making it overwhelming for casual gamers to quickly browse curated categories or for indie developers to find simple community showcase portals. **Real-Time Live Search Engine**: Bound an `input` listener to the search bar that converts search tokens to lowercase, applies an array filtering predicate over titles, rebuilds category grids, and dynamically extracts and elevates the top matching result to the `#featured-games` banner for instant discovery.",
    "problemStatement": "Major game storefronts (Steam, Epic Games) are often bloated, ad-cluttered, and resource-heavy, making it overwhelming for casual gamers to quickly browse curated categories or for indie developers to find simple community showcase portals.",
    "targetAudience": "Indie gamers, casual players looking for categorized recommendations (Top Rated, New Releases, Indie Gems, Simulations, Shooters, Party games), and indie game developers seeking a platform to showcase their creations.",
    "roleDescription": "End-to-end Frontend Engineering, UI/UX Design, JSON Data Architecture, Real-Time Search Algorithm, Dynamic Multi-Page Routing via Query Parameters, and Styling with PaperCSS & Animate.css.",
    "metrics": [
      "Decoupled headless data architecture: entire game catalog driven by structured, validated `games.json` schema",
      "Real-time instant client-side search and multi-attribute filtering (genre, platform, price) with zero latency",
      "Deep linking via `URLSearchParams` enabling bookmarkable, shareable search results and game detail modal views",
      "Distinctive aesthetic: custom PaperCSS hand-drawn sketch styling delivering an authentic retro indie gaming identity"
    ],
    "primaryTech": [
      "HTML5",
      "CSS3",
      "JavaScript (Vanilla ES6+)",
      "PaperCSS 1.8.2 (hand-drawn paper style CSS framework)",
      "Animate.css 4.1.1",
      "JSON (Headless Data Store)."
    ],
    "techStack": [
      "HTML5",
      "CSS3",
      "JavaScript (Vanilla ES6+)",
      "PaperCSS 1.8.2 (hand-drawn paper style CSS framework)",
      "Animate.css 4.1.1",
      "JSON (Headless Data Store)."
    ],
    "highlights": [
      "Real-Time Live Search Engine: Bound an `input` listener to the search bar that converts search tokens to lowercase, applies an array filtering predicate over titles, rebuilds category grids, and dynamically extracts and elevates the top matching result to the `#featured-games` banner for instant discovery.",
      "Algorithms & Data Structures: • Linear Filtering & Substring Matching: \\(O(N)\\) search filtering over JSON datasets utilizing case-insensitive substring matching (`String.prototype.includes`).<br>• Hash-Map / Array Predicate Lookups: \\(O(N)\\) record retrieval via `Array.prototype.find` for detail hydration.<br>• Responsive Flexbox Flow: Mathematical auto-fitting flex-basis algorithm ensuring equal spacing across varying screen sizes.",
      "Key Architecture Decision: • Vanilla JavaScript over React/Vue: Eliminated tooling overhead (no node_modules, webpack, or Vite needed) for maximum portability, instant loading, and 100% vanilla browser execution.<br>• PaperCSS Aesthetic: Selected to give the store a distinctive hand-crafted, playful indie gaming feel.",
      "Benchmarked Performance: Ultra-fast initial load time (<250ms); zero build/compilation lag; instantaneous search updates with zero keystroke latency; 60 FPS CSS transform animations."
    ],
    "algorithmsAndDataStructures": [
      "• Linear Filtering & Substring Matching: \\(O(N)\\) search filtering over JSON datasets utilizing case-insensitive substring matching (`String.prototype.includes`).<br>• Hash-Map / Array Predicate Lookups: \\(O(N)\\) record retrieval via `Array.prototype.find` for detail hydration.<br>• Responsive Flexbox Flow: Mathematical auto-fitting flex-basis algorithm ensuring equal spacing across varying screen sizes."
    ],
    "benchmarks": [
      "Ultra-fast initial load time (<250ms); zero build/compilation lag; instantaneous search updates with zero keystroke latency; 60 FPS CSS transform animations."
    ],
    "testingAndVerification": [
      "Manual cross-browser testing (Chrome, Firefox, Safari); responsive breakpoint testing across mobile, tablet, and widescreen monitors; boundary testing for empty search queries and missing screenshot arrays."
    ],
    "github": "https://github.com/prasadkankhar10/gamestore",
    "liveDemo": null,
    "manualActionRequired": {
      "summary": "Action Required: Media Assets & External Deployment Pending Manual Supply",
      "items": [
        "Enable GitHub Pages on the `gamestore` repository for instant live demonstration.",
        "Capture 2 high-resolution screenshots of the filter system and game details drawer."
      ]
    }
  },

  TRIGGER_Project_SchoolWebsite: {
    "stationId": "TRIGGER_Project_SchoolWebsite",
    "category": "Full-Stack & Cloud Systems",
    "title": "Z.P. Model Girls School Lasurgaon Official Portal",
    "subtitle": "A responsive, community-centered institutional web portal built for a rural model girls' primary school in Maharashtra, featuring interactive lightbox galleries, staff directories, and parent inquiry workflows.",
    "badge": "HTML5 / Semantic CSS3 / Bootstrap 4",
    "description": "Rural and semi-urban government schools (Zilla Parishad schools) frequently lack any digital presence, making it difficult for parents to access curriculum details, inspect school facilities (computer labs, sports grounds), view faculty credentials, or submit inquiries remotely. **Pure CSS Lightbox Gallery**: Implemented a 6-image photo grid showing campus events that expands into full-screen modal overlays using CSS `:target` and transition animations without needing heavy external JavaScript modal libraries.",
    "problemStatement": "Rural and semi-urban government schools (Zilla Parishad schools) frequently lack any digital presence, making it difficult for parents to access curriculum details, inspect school facilities (computer labs, sports grounds), view faculty credentials, or submit inquiries remotely.",
    "targetAudience": "Parents, local community members, students, alumni, and educational inspectors/officers from the Zilla Parishad education department.",
    "roleDescription": "End-to-end UI/UX Design, Information Architecture, Responsive CSS/HTML Layouts, Asset Optimization, Content Localization in Marathi/English, Faculty Directory Structuring, and Client Review Revisions.",
    "metrics": [
      "Civic digital public infrastructure engineered pro bono for a rural government girls' school, serving 400+ students and parents",
      "Pure CSS `:target` pseudo-class lightbox modal system displaying high-resolution gallery photos with zero JavaScript overhead",
      "100% responsive layout optimized for low-bandwidth mobile connections on entry-level Android devices in rural areas",
      "Zero hosting cost: fully automated static deployment on GitHub Pages ensuring continuous 24/7 community availability"
    ],
    "primaryTech": [
      "HTML5",
      "CSS3",
      "Bootstrap 4.6.1",
      "Font Awesome 4.7.0",
      "Google Web Fonts (Raleway & Oswald)."
    ],
    "techStack": [
      "HTML5",
      "CSS3",
      "Bootstrap 4.6.1",
      "Font Awesome 4.7.0",
      "Google Web Fonts (Raleway & Oswald)."
    ],
    "highlights": [
      "Pure CSS Lightbox Gallery: Implemented a 6-image photo grid showing campus events that expands into full-screen modal overlays using CSS `:target` and transition animations without needing heavy external JavaScript modal libraries.",
      "Algorithms & Data Structures: Responsive Grid Math: Flexbox and multi-column breakpoint distribution algorithms ensuring fluid reflow from 320px mobile screens to 1440px wide displays.",
      "Key Architecture Decision: • Vanilla HTML/CSS/Bootstrap over heavy JS frameworks (React/Angular): Chosen for maximum speed, zero client-side JavaScript hydration lag, and effortless long-term maintenance by non-technical school staff.<br>• Pure CSS Drawer Toggle: Implemented a checkbox-hack navigation menu so mobile users can open/close menus without requiring jQuery or runtime scripts.",
      "Benchmarked Performance: Near-instant page load (<800ms) with lightweight footprint (~1.8k lines of code), zero blocking JavaScript execution, and asynchronous Google font imports."
    ],
    "algorithmsAndDataStructures": [
      "Responsive Grid Math: Flexbox and multi-column breakpoint distribution algorithms ensuring fluid reflow from 320px mobile screens to 1440px wide displays."
    ],
    "benchmarks": [
      "Near-instant page load (<800ms) with lightweight footprint (~1.8k lines of code), zero blocking JavaScript execution, and asynchronous Google font imports."
    ],
    "testingAndVerification": [
      "Cross-device manual responsive testing across smartphone viewports (iPhone, Android 360px-414px), tablet viewports, and desktop resolutions; form validation tests."
    ],
    "github": "https://github.com/prasadkankhar10/schoolwebsite",
    "liveDemo": null,
    "manualActionRequired": {
      "summary": "Action Required: Media Assets & External Deployment Pending Manual Supply",
      "items": [
        "Capture full-page desktop and mobile screenshots for the portfolio showcase gallery.",
        "Add testimonial or acknowledgement note from the school principal/administration."
      ]
    }
  },

  // =========================================================================
  // 3. LANDMARKS & FINALE
  // =========================================================================

  TRIGGER_Moonwell_Skills: {
    stationId: "TRIGGER_Moonwell_Skills",
    category: "Landmarks & Interactive",
    title: "Technical Skills & Technologies Hub",
    subtitle: "Complete Technical Competency Matrix",
    badge: "Skills & Stack",
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
    title: "Logic Puzzle & Creative Philosophy",
    subtitle: "Interactive 6-Pillar Puzzle & Creative Writing",
    badge: "Interactive Landmark",
    miniGame: {
      title: "6-Pillar Logic Puzzle",
      instructions: "Inspect the 6 standing stones. Activate them in the correct sequence to solve the puzzle and reveal Prasad's creative philosophy.",
      rewardMessage: "Puzzle Solved: 'Technology is the structure; creativity is the soul.'",
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
    title: "Mountain Summit • Connect With Me",
    subtitle: "Direct Contact, Career Opportunities & Strategic Vision",
    badge: "Contact & Vision",
    promptText: "Reach out directly for software engineering roles, technical collaboration, or interview scheduling.",
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
  },

};
