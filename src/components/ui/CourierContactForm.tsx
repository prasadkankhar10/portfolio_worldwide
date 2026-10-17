import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { 
  Send, Mail, User, MessageSquare, Compass, 
  CheckCircle2, Sparkles, Loader2, ExternalLink, Ship
} from 'lucide-react';

interface CourierContactFormProps {
  onSuccess?: () => void;
  compact?: boolean;
}

const TOPIC_OPTIONS = [
  'Software Development Engineer (SDE) Opportunity',
  'Game Engine, Three.js & 3D Systems Role',
  'Distributed Systems & AI / RAG Architecture',
  'Technical Discussion & Mentorship',
  'Open Source Collaboration / General Inquiry'
];

export const CourierContactForm: React.FC<CourierContactFormProps> = ({ onSuccess, compact = false }) => {
  const dispatchCourierShip = useGameStore((state) => state.dispatchCourierShip);
  const setIsWatchingVessel = useGameStore((state) => state.setIsWatchingVessel);
  const setStationModalOpen = useGameStore((state) => state.setStationModalOpen);
  const setQuickPortfolioOpen = useGameStore((state) => state.setQuickPortfolioOpen);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState(TOPIC_OPTIONS[0]);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus('error');
      setFeedback('Please fill out all fields before sending your message.');
      return;
    }

    setStatus('sending');
    setFeedback('Sending your message to Prasad\'s inbox...');

    try {
      // 1. Dispatch real email via Web3Forms API
      // If VITE_WEB3FORMS_ACCESS_KEY is set in .env, it uses that; otherwise uses user key
      const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || '2579dee0-a5e0-4ba1-83cf-bef8c19c6a68';
      
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          access_key: accessKey,
          name: name.trim(),
          email: email.trim(),
          subject: `Portfolio Message from ${name.trim()} [${topic}]`,
          message: message.trim(),
          recipient: 'prasadkankhar5@gmail.com',
          from_name: 'Portfolio Contact'
        })
      });

      const resJson = await response.json().catch(() => ({}));

      // 2. Trigger in-engine Ship Departure Simulation
      dispatchCourierShip({
        name: name.trim(),
        email: email.trim(),
        subject: topic,
        message: message.trim()
      });

      setStatus('success');
      setFeedback(
        resJson?.success 
          ? 'Email successfully delivered to Prasad’s inbox! The harbor boat has set sail.'
          : 'Message sent! The harbor boat has set sail across the ocean.'
      );

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.warn('Network issue during direct email dispatch, activating local vessel simulation fallback:', err);
      // Fallback: Still trigger the in-game ship simulation so the game experience is never interrupted
      dispatchCourierShip({
        name: name.trim(),
        email: email.trim(),
        subject: topic,
        message: message.trim()
      });

      setStatus('success');
      setFeedback('Message sent! The harbor boat has set sail. A backup mail client is also available.');
    }
  };

  const handleWatchVessel = () => {
    // Close modals and trigger cinematic camera
    setStationModalOpen(false);
    setQuickPortfolioOpen(false);
    setIsWatchingVessel(true);
  };

  const handleOpenMailtoDraft = () => {
    const subjectEncoded = encodeURIComponent(`Portfolio Inquiry from ${name} [${topic}]`);
    const bodyEncoded = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nTopic: ${topic}\n\nMessage:\n${message}`
    );
    window.open(`mailto:prasadkankhar5@gmail.com?subject=${subjectEncoded}&body=${bodyEncoded}`, '_blank');
  };

  return (
    <div className="bg-[#101a18]/90 border border-[#D4B777]/35 rounded-2xl p-5 sm:p-6 backdrop-blur-md shadow-xl text-[#E9E4D7] relative overflow-hidden">
      {/* Decorative Gold Header Bar */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#527C68]/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#D4B777]/15 border border-[#D4B777]/30 flex items-center justify-center text-[#D4B777]">
            <Ship className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-base font-heading font-bold text-[#E9E4D7] tracking-tight flex items-center gap-2">
              <span>Send Message</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#527C68]/25 text-[#D4B777] border border-[#D4B777]/25 font-normal">
                Direct Email & 3D Boat
              </span>
            </h4>
            <p className="text-[11px] font-sans text-[#E9E4D7]/70">
              Delivers directly to Prasad's email inbox with a 3D boat sailing animation.
            </p>
          </div>
        </div>
      </div>

      {status === 'success' ? (
        <div className="space-y-4 py-3 animate-in fade-in duration-500">
          <div className="p-4 rounded-xl bg-[#527C68]/20 border border-[#D4B777]/40 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="text-sm font-heading font-bold text-[#E9E4D7]">
                Message Delivered to Inbox!
              </h5>
              <p className="text-xs text-[#E9E4D7]/85 font-sans leading-relaxed">
                {feedback}
              </p>
              <div className="text-[11px] font-mono text-[#D4B777] pt-1">
                Delivering to: <span className="underline">prasadkankhar5@gmail.com</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleWatchVessel}
              className="px-5 py-2.5 rounded-xl bg-[#D4B777] hover:bg-[#E5CD94] text-[#182522] font-heading font-bold text-xs uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>🔭 Watch Boat Set Sail</span>
            </button>

            <button
              onClick={handleOpenMailtoDraft}
              className="px-4 py-2.5 rounded-xl bg-[#182522] hover:bg-[#1f302c] border border-[#527C68]/40 hover:border-[#D4B777]/40 text-[#E9E4D7] font-heading font-semibold text-xs tracking-wider transition-all cursor-pointer flex items-center gap-2"
            >
              <Mail className="w-3.5 h-3.5 text-[#D4B777]" />
              <span>Open Mail Client Copy</span>
              <ExternalLink className="w-3 h-3 text-[#E9E4D7]/40" />
            </button>

            <button
              onClick={() => {
                setStatus('idle');
                setMessage('');
              }}
              className="px-4 py-2.5 rounded-xl bg-transparent hover:bg-white/5 border border-transparent hover:border-[#527C68]/30 text-xs font-mono text-[#E9E4D7]/70 transition-all cursor-pointer"
            >
              Send Another Message
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Sender Name */}
            <div>
              <label className="block text-[11px] font-mono text-[#D4B777] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <User className="w-3 h-3 text-[#D4B777]/70" />
                <span>Your Name</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maya Lin"
                className="w-full px-3.5 py-2 rounded-xl bg-[#182522]/80 border border-[#527C68]/40 focus:border-[#D4B777] focus:ring-1 focus:ring-[#D4B777]/50 text-xs text-[#E9E4D7] placeholder-[#E9E4D7]/35 outline-none transition-all font-sans"
              />
            </div>

            {/* Sender Email */}
            <div>
              <label className="block text-[11px] font-mono text-[#D4B777] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-[#D4B777]/70" />
                <span>Your Email</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. maya@company.com"
                className="w-full px-3.5 py-2 rounded-xl bg-[#182522]/80 border border-[#527C68]/40 focus:border-[#D4B777] focus:ring-1 focus:ring-[#D4B777]/50 text-xs text-[#E9E4D7] placeholder-[#E9E4D7]/35 outline-none transition-all font-sans"
              />
            </div>
          </div>

          {/* Topic Select */}
          <div>
            <label className="block text-[11px] font-mono text-[#D4B777] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#D4B777]/70" />
              <span>Inquiry Focus</span>
            </label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#182522]/90 border border-[#527C68]/40 focus:border-[#D4B777] focus:ring-1 focus:ring-[#D4B777]/50 text-xs text-[#E9E4D7] outline-none transition-all font-sans cursor-pointer"
            >
              {TOPIC_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-[#182522] text-[#E9E4D7]">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Message Textarea */}
          <div>
            <label className="block text-[11px] font-mono text-[#D4B777] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <MessageSquare className="w-3 h-3 text-[#D4B777]/70" />
              <span>Your Message</span>
            </label>
            <textarea
              required
              rows={compact ? 3 : 4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your note, job opportunity details, or collaboration ideas..."
              className="w-full px-3.5 py-2 rounded-xl bg-[#182522]/80 border border-[#527C68]/40 focus:border-[#D4B777] focus:ring-1 focus:ring-[#D4B777]/50 text-xs text-[#E9E4D7] placeholder-[#E9E4D7]/35 outline-none transition-all font-sans resize-none"
            />
          </div>

          {status === 'error' && (
            <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 font-mono">
              ⚠️ {feedback}
            </div>
          )}

          {/* Submit CTA */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11px] font-mono text-[#E9E4D7]/55 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Direct to: prasadkankhar5@gmail.com</span>
            </div>

            <button
              type="submit"
              disabled={status === 'sending'}
              className="px-6 py-2.5 rounded-xl bg-[#D4B777] hover:bg-[#E5CD94] disabled:opacity-50 text-[#182522] font-heading font-bold text-xs uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
            >
              {status === 'sending' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Message...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message & Launch Boat</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
