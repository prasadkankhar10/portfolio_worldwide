import React, { useState } from 'react';
import { Smartphone, ArrowRight } from 'lucide-react';

export const RotateDeviceOverlay: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center text-white portrait-overlay portrait:flex landscape:hidden p-4 select-none">
      <div className="flex flex-col items-center gap-5 max-w-sm text-center p-6 sm:p-7 bg-[#1B2822]/95 border border-[#D6BC83]/40 rounded-3xl shadow-2xl">
        <div className="relative">
          <Smartphone size={72} className="text-[#D6BC83] animate-[spin_3s_ease-in-out_infinite]" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold tracking-wide uppercase text-[#D6BC83]">
            Rotate for Best View
          </h2>
          <p className="text-[#F0E9DA]/80 text-xs sm:text-sm font-sans leading-relaxed">
            For optimal wide-angle vision and dual thumb virtual joysticks, landscape mode is recommended.
          </p>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="mt-2 px-5 py-2.5 rounded-full bg-[#111916] hover:bg-[#111916]/80 border border-[#D6BC83]/30 text-[#D6BC83] text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
        >
          <span>Continue in Portrait</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
