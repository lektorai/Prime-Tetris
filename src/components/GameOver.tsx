import React from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Trophy } from 'lucide-react';
import { COLS, ROWS } from '../constants';

interface GameOverProps {
  score: number;
  highScore: number;
  time: string;
  onRestart: () => void;
  grid: (string | null)[][];
  backgroundImage: string | null;
}

export const GameOver: React.FC<GameOverProps> = ({ 
  score, 
  highScore, 
  time, 
  onRestart, 
  grid, 
  backgroundImage 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] p-6 text-white font-sans overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="text-yellow-500/60 text-xs tracking-[0.3em] font-bold mb-2 uppercase flex items-center justify-center gap-2">
          МАКС. РЕКОРД: {highScore.toLocaleString()} <Trophy size={14} />
        </div>
        <div className="w-full h-px bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent my-6" />
        <h2 className="text-4xl font-black tracking-tighter text-yellow-500 uppercase mb-8">ИГРА ОКОНЧЕНА</h2>
      </motion.div>

      <div className="grid grid-cols-2 gap-12 mb-12 relative">
        <div className="flex flex-col items-center">
          <span className="text-xs text-white/40 tracking-widest uppercase mb-2">СЧЕТ</span>
          <span className="text-3xl font-bold text-white">{score.toLocaleString()}</span>
        </div>
        
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-yellow-500/30 to-transparent" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rotate-45 bg-yellow-500 shadow-[0_0_8px_rgba(255,215,0,0.5)]" />

        <div className="flex flex-col items-center">
          <span className="text-xs text-white/40 tracking-widest uppercase mb-2">ВРЕМЯ</span>
          <span className="text-3xl font-bold text-white">{time}</span>
        </div>
      </div>

      <div 
        className="w-full max-w-[220px] rounded-xl border border-yellow-900/40 p-1 bg-[#1a1a1a] mb-8 shadow-2xl relative overflow-hidden shrink-0"
        style={{ 
          aspectRatio: `${COLS}/${ROWS}`
        }}
      >
        <div 
          className="grid w-full h-full gap-[1px] opacity-90"
          style={{ 
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gridTemplateRows: `repeat(${ROWS}, 1fr)`
          }}
        >
          {grid.map((row, y) => 
            row.map((cell, x) => (
              <div 
                key={`${x}-${y}`} 
                className="relative rounded-[1px] bg-white/5"
              >
                {cell !== null && backgroundImage && (
                   <div 
                    className="absolute inset-0 bg-cover bg-no-repeat rounded-[1px]"
                    style={{
                      backgroundImage: `url(${backgroundImage})`,
                      backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
                      backgroundPosition: `${(x / (COLS - 1)) * 100}% ${(y / (ROWS - 1)) * 100}%`,
                      filter: 'sepia(0.2) brightness(1.1) saturate(1.2)'
                    }}
                  />
                )}
              </div>
            ))
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onRestart}
        className="flex items-center gap-3 bg-[#1a1a1a] border border-yellow-500/40 rounded-2xl px-10 py-5 transition-all hover:bg-yellow-500/10 hover:border-yellow-500 shadow-lg group"
      >
        <RotateCcw className="text-yellow-500 group-hover:rotate-180 transition-transform duration-500" size={24} />
        <span className="text-lg font-bold tracking-widest uppercase text-white/90">ИГРАТЬ СНОВА</span>
      </motion.button>
    </div>
  );
};
