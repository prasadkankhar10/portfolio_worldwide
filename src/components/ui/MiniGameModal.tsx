import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { soundEngine } from '../../utils/soundEngine';
import { Sword, Shield, Flame, RotateCcw, X, Trophy, Heart } from 'lucide-react';

export const MiniGameModal: React.FC = () => {
  const isMiniGameOpen = useGameStore((s) => s.isMiniGameOpen);
  const setMiniGameOpen = useGameStore((s) => s.setMiniGameOpen);

  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [turn, setTurn] = useState(1);
  const [battleLog, setBattleLog] = useState<string[]>([
    '⚔️ A training automaton challenges you! Choose your tactical move.'
  ]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [victory, setVictory] = useState(false);

  if (!isMiniGameOpen) return null;

  const handleAction = (action: 'slash' | 'parry' | 'magic') => {
    if (isGameOver) return;

    soundEngine.playClickSound();
    let pDamage = 0;
    let logMsg = '';
    let enemyDamage = Math.floor(Math.random() * 14) + 8;

    if (action === 'slash') {
      pDamage = Math.floor(Math.random() * 20) + 15;
      logMsg = `You strike with a Precision Slash dealing ${pDamage} DMG!`;
    } else if (action === 'parry') {
      enemyDamage = Math.floor(enemyDamage * 0.3);
      pDamage = Math.floor(Math.random() * 10) + 8;
      logMsg = `You execute a Perfect Parry, mitigating blow to ${enemyDamage} DMG and countering for ${pDamage} DMG!`;
    } else if (action === 'magic') {
      pDamage = Math.floor(Math.random() * 28) + 10;
      logMsg = `You channel an Arcane Burst surging for ${pDamage} Critical DMG!`;
    }

    const nextEnemyHp = Math.max(0, enemyHp - pDamage);
    const nextPlayerHp = action === 'parry' ? Math.max(0, playerHp - enemyDamage) : Math.max(0, playerHp - enemyDamage);

    setEnemyHp(nextEnemyHp);
    setPlayerHp(nextPlayerHp);
    setTurn(turn + 1);

    if (nextEnemyHp <= 0) {
      soundEngine.playBadgeFanfareSound();
      setBattleLog((prev) => [
        `🏆 VICTORY! You defeated the Automaton in ${turn} turns!`,
        logMsg,
        ...prev
      ]);
      setIsGameOver(true);
      setVictory(true);
    } else if (nextPlayerHp <= 0) {
      setBattleLog((prev) => [
        `💀 DEFEAT! The Automaton broke through your defense.`,
        logMsg,
        ...prev
      ]);
      setIsGameOver(true);
      setVictory(false);
    } else {
      setBattleLog((prev) => [
        `Automaton retaliates for ${enemyDamage} DMG!`,
        logMsg,
        ...prev
      ]);
    }
  };

  const handleReset = () => {
    soundEngine.playClickSound();
    setPlayerHp(100);
    setEnemyHp(100);
    setTurn(1);
    setIsGameOver(false);
    setVictory(false);
    setBattleLog(['⚔️ Rematch initiated. Choose your opening tactical move!']);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 select-none"
      onClick={() => setMiniGameOpen(false)}
    >
      <div 
        className="relative w-full max-w-2xl game-frame game-corner-brackets rounded-3xl p-6 sm:p-8 flex flex-col shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden bg-[#1B2822]/95 border-2 border-[#D6BC83]/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#3A4B40]/40">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#D6BC83] font-bold">
              In-World Playable Exhibit · C++17 Logic Demo
            </span>
            <h3 className="text-xl sm:text-2xl font-heading font-black text-[#F0E9DA] tracking-tight">
              One More Move: Arena Duel
            </h3>
          </div>
          <button
            onClick={() => setMiniGameOpen(false)}
            className="game-btn-tactile game-btn-crimson p-1.5 text-xs flex items-center justify-center"
            title="Close Arena (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Combatant Gauges */}
        <div className="grid grid-cols-2 gap-4 my-6">
          {/* Player Box */}
          <div className="p-4 rounded-2xl bg-[#111916]/80 border border-[#3A4B40]/40">
            <div className="flex items-center justify-between text-xs font-heading font-bold text-[#F0E9DA] mb-1.5">
              <span>Player (Prasad)</span>
              <span className="text-[#10b981] font-mono">{playerHp}/100 HP</span>
            </div>
            <div className="w-full h-2.5 bg-[#1B2822] rounded-full overflow-hidden border border-[#3A4B40]/40">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-300"
                style={{ width: `${playerHp}%` }}
              />
            </div>
          </div>

          {/* Enemy Box */}
          <div className="p-4 rounded-2xl bg-[#111916]/80 border border-[#3A4B40]/40">
            <div className="flex items-center justify-between text-xs font-heading font-bold text-[#F0E9DA] mb-1.5">
              <span>Training Automaton</span>
              <span className="text-[#ef4444] font-mono">{enemyHp}/100 HP</span>
            </div>
            <div className="w-full h-2.5 bg-[#1B2822] rounded-full overflow-hidden border border-[#3A4B40]/40">
              <div 
                className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-300"
                style={{ width: `${enemyHp}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tactical Actions or Game Over State */}
        {!isGameOver ? (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <button
              onClick={() => handleAction('slash')}
              className="game-btn-tactile game-btn-slate p-3 sm:p-4 text-xs flex flex-col items-center gap-1.5 cursor-pointer hover:border-[#D6BC83]"
            >
              <Sword className="w-5 h-5 text-[#D6BC83]" />
              <span className="font-heading font-bold text-[#F0E9DA]">Precision Slash</span>
              <span className="text-[10px] font-mono text-[#F0E9DA]/50">15-35 DMG</span>
            </button>

            <button
              onClick={() => handleAction('parry')}
              className="game-btn-tactile game-btn-slate p-3 sm:p-4 text-xs flex flex-col items-center gap-1.5 cursor-pointer hover:border-[#D6BC83]"
            >
              <Shield className="w-5 h-5 text-sky-400" />
              <span className="font-heading font-bold text-[#F0E9DA]">Tactical Parry</span>
              <span className="text-[10px] font-mono text-[#F0E9DA]/50">Defend & Counter</span>
            </button>

            <button
              onClick={() => handleAction('magic')}
              className="game-btn-tactile game-btn-gold p-3 sm:p-4 text-xs flex flex-col items-center gap-1.5 cursor-pointer"
            >
              <Flame className="w-5 h-5 text-[#17221C]" />
              <span className="font-heading font-bold text-[#17221C]">Arcane Burst</span>
              <span className="text-[10px] font-mono text-[#17221C]/70">10-38 Critical DMG</span>
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#111916] border border-[#D6BC83]/40 text-center mb-6 animate-in zoom-in-95 duration-200">
            <Trophy className={`w-8 h-8 mx-auto mb-2 ${victory ? 'text-[#D6BC83]' : 'text-red-400'}`} />
            <h4 className="font-heading font-extrabold text-lg text-[#F0E9DA]">
              {victory ? 'Encounter Conquered!' : 'Match Finished'}
            </h4>
            <p className="text-xs text-[#D6BC83] font-sans mb-3">
              {victory ? 'Proof of turn-based deterministic state transitions.' : 'Try another tactical approach.'}
            </p>
            <button
              onClick={handleReset}
              className="game-btn-tactile game-btn-gold px-4 py-2 text-xs inline-flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Rematch Automaton</span>
            </button>
          </div>
        )}

        {/* Combat Log */}
        <div className="bg-[#111916]/90 border border-[#3A4B40]/30 rounded-2xl p-4 max-h-36 overflow-y-auto custom-scrollbar font-mono text-[11px] space-y-1">
          {battleLog.map((log, idx) => (
            <p key={idx} className={idx === 0 ? 'text-[#D6BC83] font-bold' : 'text-[#F0E9DA]/60'}>
              {log}
            </p>
          ))}
        </div>

      </div>
    </div>
  );
};
