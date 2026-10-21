import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { soundEngine } from '../../utils/soundEngine';
import { Camera, Download, X, Sliders, Sparkles } from 'lucide-react';

export const PhotoModeModal: React.FC = () => {
  const isPhotoModeOpen = useGameStore((s) => s.isPhotoModeOpen);
  const setPhotoModeOpen = useGameStore((s) => s.setPhotoModeOpen);
  const photoFilter = useGameStore((s) => s.photoFilter);
  const setPhotoFilter = useGameStore((s) => s.setPhotoFilter);

  const [isCapturing, setIsCapturing] = useState(false);

  if (!isPhotoModeOpen) return null;

  const filters = [
    { id: 'none', label: 'Natural' },
    { id: 'sepia', label: 'Vintage Parchment' },
    { id: 'cyberpunk', label: 'Neon Cyber' },
    { id: 'golden', label: 'Golden Hour' },
    { id: 'noir', label: 'Monochrome Noir' }
  ] as const;

  const takeScreenshot = () => {
    soundEngine.playClickSound();
    setIsCapturing(true);

    setTimeout(() => {
      try {
        const canvas = document.querySelector('canvas');
        if (canvas) {
          const image = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = `Prasad_Portfolio_Island_${Date.now()}.png`;
          link.href = image;
          link.click();
          soundEngine.playBadgeFanfareSound();
        }
      } catch (err) {
        console.error('Failed to capture canvas screenshot:', err);
      } finally {
        setIsCapturing(false);
      }
    }, 150);
  };

  return (
    <>
      {/* Visual CSS Filter Overlay applied to the canvas */}
      <style>{`
        canvas {
          filter: ${
            photoFilter === 'sepia' 
              ? 'sepia(0.65) contrast(1.15) brightness(0.95)' 
              : photoFilter === 'cyberpunk'
              ? 'hue-rotate(200deg) saturate(1.8) contrast(1.2)'
              : photoFilter === 'golden'
              ? 'sepia(0.25) saturate(1.4) brightness(1.08)'
              : photoFilter === 'noir'
              ? 'grayscale(1) contrast(1.3)'
              : 'none'
          } !important;
          transition: filter 0.4s ease;
        }
      `}</style>

      {/* Floating Photo Controls Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-auto flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 select-none">
        
        {/* Filter Selection Pills */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-[#111916]/90 border border-[#D6BC83]/40 shadow-2xl backdrop-blur-md">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                soundEngine.playClickSound();
                setPhotoFilter(f.id);
              }}
              className={`px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                photoFilter === f.id
                  ? 'bg-[#D6BC83] text-[#111916] font-bold shadow-md'
                  : 'text-[#F0E9DA]/70 hover:text-[#F0E9DA] hover:bg-[#3A4B40]/30'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={takeScreenshot}
            disabled={isCapturing}
            className="game-btn-tactile game-btn-gold px-6 py-2.5 text-xs flex items-center gap-2 text-[#111916] font-heading font-black shadow-2xl cursor-pointer"
          >
            <Camera className="w-4 h-4 text-[#111916]" />
            <span>{isCapturing ? 'Snapping...' : 'Capture Screenshot (PNG)'}</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClickSound();
              setPhotoFilter('none');
              setPhotoModeOpen(false);
            }}
            className="game-btn-tactile game-btn-crimson p-2.5 rounded-full flex items-center justify-center shadow-xl"
            title="Exit Photo Mode"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </>
  );
};
