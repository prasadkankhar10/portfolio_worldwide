import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { soundEngine } from '../../utils/soundEngine';
import { BookOpen, Send, X, MessageSquare, Building2, User, Sparkles } from 'lucide-react';

interface GuestbookEntry {
  id: string;
  author: string;
  organization: string;
  message: string;
  date: string;
}

const DEFAULT_GUESTBOOK_ENTRIES: GuestbookEntry[] = [
  {
    id: '1',
    author: 'Elena R.',
    organization: 'Senior Frontend Tech Lead',
    message: 'One of the most immersive 3D engineering portfolios I have ever experienced. The WebGL performance and C++ systems work are top-notch!',
    date: 'Oct 20, 2026'
  },
  {
    id: '2',
    author: 'Marcus Vance',
    organization: 'Autonomous Robotics Researcher',
    message: 'The Butler OS architecture is genuinely inventive. Love seeing bare-metal and modern AI agents integrated into a cohesive vision.',
    date: 'Oct 19, 2026'
  },
  {
    id: '3',
    author: 'Aria Chen',
    organization: 'Game Tech Recruiter',
    message: 'The Recruiter Speedrun saved our hiring committee so much time. Excited to schedule an interview with Prasad!',
    date: 'Oct 17, 2026'
  }
];

export const HarborGuestbookModal: React.FC = () => {
  const isGuestbookOpen = useGameStore((s) => s.isGuestbookOpen);
  const setGuestbookOpen = useGameStore((s) => s.setGuestbookOpen);

  const [entries, setEntries] = useState<GuestbookEntry[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_GUESTBOOK_ENTRIES;
    try {
      const stored = localStorage.getItem('portfolio_guestbook_entries');
      return stored ? JSON.parse(stored) : DEFAULT_GUESTBOOK_ENTRIES;
    } catch {
      return DEFAULT_GUESTBOOK_ENTRIES;
    }
  });

  const [name, setName] = useState('');
  const [org, setOrg] = useState('');
  const [message, setMessage] = useState('');

  if (!isGuestbookOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    soundEngine.playBadgeFanfareSound();
    const newEntry: GuestbookEntry = {
      id: Date.now().toString(),
      author: name.trim(),
      organization: org.trim() || 'Tech Explorer',
      message: message.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('portfolio_guestbook_entries', JSON.stringify(updated));
      } catch {}
    }

    setName('');
    setOrg('');
    setMessage('');
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 select-none"
      onClick={() => setGuestbookOpen(false)}
    >
      <div 
        className="relative w-full max-w-3xl max-h-[88vh] game-frame game-corner-brackets rounded-3xl flex flex-col shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden bg-[#1B2822]/95 border-2 border-[#D6BC83]/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#3A4B40]/40 bg-[#182620]/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#D6BC83]/20 border border-[#D6BC83]/40 flex items-center justify-center text-[#D6BC83]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-lg text-[#F0E9DA] tracking-tight">
                Harbor Visitor Guestbook
              </h3>
              <p className="text-[11px] font-mono text-[#D6BC83]/70">
                Leave a sign or message for Prasad from your voyage
              </p>
            </div>
          </div>

          <button
            onClick={() => setGuestbookOpen(false)}
            className="game-btn-tactile game-btn-crimson p-1.5 text-xs flex items-center justify-center"
            title="Close Guestbook (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {/* Sign the Guestbook Form */}
          <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-[#111916]/80 border border-[#3A4B40]/40 space-y-3">
            <div className="flex items-center gap-2 text-xs font-heading font-bold text-[#D6BC83]">
              <Sparkles className="w-4 h-4" />
              <span>Sign the Harbor Ledger</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name (e.g. Alex Mercer)"
                className="bg-[#182620] border border-[#3A4B40]/40 rounded-xl px-3.5 py-2 text-xs text-[#F0E9DA] placeholder-[#F0E9DA]/40 focus:outline-none focus:border-[#D6BC83]/60"
              />
              <input
                type="text"
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                placeholder="Company / Title (Optional)"
                className="bg-[#182620] border border-[#3A4B40]/40 rounded-xl px-3.5 py-2 text-xs text-[#F0E9DA] placeholder-[#F0E9DA]/40 focus:outline-none focus:border-[#D6BC83]/60"
              />
            </div>

            <textarea
              required
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Leave your message or feedback..."
              className="w-full bg-[#182620] border border-[#3A4B40]/40 rounded-xl px-3.5 py-2 text-xs text-[#F0E9DA] placeholder-[#F0E9DA]/40 focus:outline-none focus:border-[#D6BC83]/60 resize-none"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                className="game-btn-tactile game-btn-gold px-5 py-2 text-xs flex items-center gap-2"
              >
                <span>Sign Guestbook</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* List of Messages */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#D6BC83] font-bold">
              Archived Signatures ({entries.length})
            </h4>

            {entries.map((entry) => (
              <div 
                key={entry.id} 
                className="p-4 rounded-2xl bg-[#111916]/60 border border-[#3A4B40]/30 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-xs text-[#F0E9DA]">
                      {entry.author}
                    </span>
                    <span className="text-[10px] font-mono text-[#D6BC83]/80 px-2 py-0.5 rounded bg-[#3A4B40]/20 border border-[#3A4B40]/30">
                      {entry.organization}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#F0E9DA]/40">
                    {entry.date}
                  </span>
                </div>
                <p className="text-xs text-[#F0E9DA]/85 font-sans leading-relaxed">
                  "{entry.message}"
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};
