import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { soundEngine } from '../../utils/soundEngine';
import { Terminal, Send, Sparkles, X, User, Bot, HelpCircle } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

const KNOWLEDGE_BASE: Array<{ keywords: string[]; answer: string }> = [
  {
    keywords: ['why hire', 'hire you', 'why should', 'strengths', 'value', 'fit'],
    answer: "Prasad combines low-level algorithmic rigor (C++17, systems programming, procedural synthesis) with modern full-stack web and spatial computing expertise (TypeScript, React, Three.js, WebGL). He doesn't just assemble libraries—he engineers systems from first principles with a deep focus on performance, visual fidelity, and clean architectural design."
  },
  {
    keywords: ['c++', 'game engine', 'one more move', 'sdl', 'low level'],
    answer: "For 'One More Move', Prasad engineered a complete 2D roguelike engine in modern C++17 and SDL3 from bare metal. Features include a deterministic turn loop, procedural PCM audio waveform generation, and zero bloated third-party dependencies, running at rock-solid 60 FPS."
  },
  {
    keywords: ['butler', 'multi-agent', 'agent', 'ai', 'autonomous', 'akshayanidhi'],
    answer: "Prasad researches multi-agent orchestration. 'Butler OS' is an autonomous desktop multi-agent architecture with zero-latency local inter-process comms. 'Akshayanidhi' is a zero-cost intelligent photo vault utilizing 512-dimensional facial embedding clustering without external API fees."
  },
  {
    keywords: ['education', 'college', 'degree', 'gpa', 'harvard', 'cs50', 'academics'],
    answer: "Prasad is pursuing his B.Tech in Computer Science at MIT, Chhatrapati Sambhajinagar (Class of 2026). He is a Harvard CS50x Certified Scholar, served as Technical Coordinator for ACTS, and was selected as Campus Mantri for GeeksforGeeks."
  },
  {
    keywords: ['web', 'frontend', 'react', 'three.js', 'nishtha', 'sadhana', 'tracemate'],
    answer: "Prasad has shipped 19 production-grade web systems including 'TraceMate Pro' (WebAR camera tracing PWA), 'Nishtha' (habit-tracking RPG), and 'Sadhana' (offline-first PWA with real-time sync). This very 3D portfolio is built on React Three Fiber, Rapier physics, and WebGL."
  },
  {
    keywords: ['contact', 'email', 'hire', 'call', 'interview', 'reach'],
    answer: "You can reach Prasad directly at prasadkankhar5@gmail.com, or check out his verified repositories at github.com/prasadkankhar10. He is actively interviewing for Software Engineering, AI Systems, and Game Tech opportunities."
  }
];

const QUICK_PROMPTS = [
  "Why should we hire Prasad?",
  "Tell me about your C++ game engine",
  "How does Butler OS multi-agent work?",
  "Academic achievements & Harvard CS50x",
  "Full-stack & WebAR experience"
];

export const AITerminalModal: React.FC = () => {
  const isAITerminalOpen = useGameStore((s) => s.isAITerminalOpen);
  const setAITerminalOpen = useGameStore((s) => s.setAITerminalOpen);

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: "Greetings, explorer. I am Prasad's autonomous Terminal Guide. Ask me anything about Prasad's engineering architecture, low-level game development, AI systems, or background.",
      time: 'Just now'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  if (!isAITerminalOpen) return null;

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    soundEngine.playClickSound();
    const userMsg: ChatMessage = {
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    // Intelligent match
    const lower = query.toLowerCase();
    const matched = KNOWLEDGE_BASE.find((entry) => 
      entry.keywords.some((k) => lower.includes(k))
    );

    const reply = matched
      ? matched.answer
      : `Prasad is a passionate creator and software engineer focusing on high-performance C++, Three.js WebGL, and Autonomous AI systems. For this specific topic, feel free to connect directly via email at prasadkankhar5@gmail.com!`;

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      soundEngine.playWaypointTrackSound();
    }, 600);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 select-none"
      onClick={() => setAITerminalOpen(false)}
    >
      <div 
        className="relative w-full max-w-3xl h-[85vh] game-frame game-corner-brackets rounded-3xl flex flex-col shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden bg-[#111916]/95 border border-[#D6BC83]/40"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-[#D6BC83]/30 bg-[#182620]/90 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3A4B40]/30 border border-[#D6BC83]/40 flex items-center justify-center text-[#D6BC83]">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-[#F0E9DA] tracking-wide flex items-center gap-2">
                <span>Prasad AI Autonomous Terminal</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h3>
              <p className="text-[10px] font-mono text-[#D6BC83]/70">
                Interactive Engineering Knowledge Base
              </p>
            </div>
          </div>

          <button
            onClick={() => setAITerminalOpen(false)}
            className="game-btn-tactile game-btn-crimson p-1.5 text-xs flex items-center justify-center"
            title="Close Terminal (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Scroll Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-[#D6BC83]/20 border border-[#D6BC83]/40 flex items-center justify-center text-[#D6BC83] shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div 
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-xs sm:text-sm font-sans leading-relaxed shadow-md select-text ${
                  msg.sender === 'user'
                    ? 'bg-[#D6BC83] text-[#111916] font-medium rounded-tr-none'
                    : 'bg-[#182620] border border-[#3A4B40]/40 text-[#F0E9DA] rounded-tl-none'
                }`}
              >
                <p>{msg.text}</p>
                <span className={`block text-[9px] font-mono mt-1 ${msg.sender === 'user' ? 'text-[#111916]/60 text-right' : 'text-[#D6BC83]/60'}`}>
                  {msg.time}
                </span>
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-[#3A4B40]/40 border border-[#3A4B40]/60 flex items-center justify-center text-[#F0E9DA] shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs font-mono text-[#D6BC83] p-2">
              <span className="w-2 h-2 rounded-full bg-[#D6BC83] animate-ping" />
              <span>Prasad AI is compiling response...</span>
            </div>
          )}
        </div>

        {/* Quick Query Chips */}
        <div className="px-4 py-2 border-t border-[#3A4B40]/25 bg-[#111916]/70 flex gap-1.5 overflow-x-auto custom-scrollbar shrink-0">
          {QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-[#182620] hover:bg-[#25352D] text-[#D6BC83] border border-[#D6BC83]/30 whitespace-nowrap transition-all cursor-pointer hover:border-[#D6BC83]"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 sm:p-4 border-t-2 border-[#D6BC83]/30 bg-[#182620]/95 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your inquiry for Prasad's AI Guide..."
            className="flex-1 bg-[#111916]/80 border border-[#3A4B40]/40 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#F0E9DA] placeholder-[#F0E9DA]/40 focus:outline-none focus:border-[#D6BC83]/60 font-sans"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="game-btn-tactile game-btn-gold px-4 py-2.5 text-xs flex items-center gap-1.5 disabled:opacity-40"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
};
