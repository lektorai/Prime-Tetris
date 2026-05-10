import React from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Trophy, Share2, Star, Timer, PartyPopper } from 'lucide-react';
import { COLS, ROWS } from '../constants';
import { Theme } from '../types/tetris';

interface GameOverProps {
  score: number;
  highScore: number;
  time: string;
  onRestart: () => void;
  grid: (string | null)[][];
  backgroundImage: string | null;
  t: any;
  theme: Theme;
  isVictory?: boolean;
}

export const GameOver: React.FC<GameOverProps> = ({ 
  score, 
  highScore, 
  time, 
  onRestart, 
  grid, 
  backgroundImage,
  t,
  theme,
  isVictory
}) => {
  const isClassic = theme === 'classic';
  const isLight = theme === 'light';

  return (
    <div className={`flex flex-col items-center min-h-screen ${isClassic ? 'bg-[#8b956d]' : isLight ? 'bg-white' : 'bg-[#050505]'} text-white font-sans overflow-y-auto py-8 px-6 transition-colors duration-500`}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`w-full max-w-sm rounded-[32px] p-8 shadow-2xl relative border ${
          isClassic ? 'bg-[#9bbc0f] border-[#0f380f]' : isLight ? 'bg-gray-50 border-gray-100' : 'bg-[#0f0f0f] border-white/5'
        }`}
      >
        <div className="flex flex-col items-center">
          <motion.div 
            initial={{ rotate: -10, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-xl ${
              isVictory ? 'bg-green-500' : 'bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-700'
            }`}
          >
            {isVictory ? <PartyPopper size={40} className="text-white" /> : <Trophy size={40} className="text-yellow-900" />}
          </motion.div>

          <h2 className={`text-4xl font-black tracking-tighter mb-2 uppercase text-center ${isClassic ? 'text-[#0f380f]' : isLight ? 'text-gray-900' : 'text-white'}`}>
            {isVictory ? t.victory : t.gameOver}
          </h2>
          <p className={`text-sm font-bold tracking-[0.2em] mb-8 uppercase ${isClassic ? 'text-[#0f380f]/60' : 'text-yellow-500'}`}>
            {score >= highScore && score > 0 ? 'NEW RECORD!' : 'GAME SUMMARY'}
          </p>

          <div className="grid grid-cols-2 gap-3 w-full mb-8">
            <StatsCard label={t.score} value={score.toLocaleString()} icon={<Star size={14} />} theme={theme} />
            <StatsCard label={t.time} value={time} icon={<Timer size={14} />} theme={theme} />
          </div>

          {/* Mini Board View for Puzzle mode */}
          {backgroundImage && (
            <div className="w-full mb-8 text-center">
               <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 opacity-40 ${isClassic ? 'text-[#0f380f]' : isLight ? 'text-gray-500' : 'text-white'}`}>
                YOUR PUZZLE PROGRESS
              </p>
              <div 
                className="mx-auto bg-black/20 rounded-lg overflow-hidden border border-white/10"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                  gridTemplateRows: `repeat(${ROWS}, 1fr)`,
                  width: '120px',
                  aspectRatio: `${COLS}/${ROWS}`,
                }}
              >
                {grid.map((row, y) =>
                  row.map((cell, x) => (
                    <div 
                      key={`${x}-${y}`} 
                      className="relative border-[0.1px] border-white/5"
                    >
                      {cell && (
                        <div 
                          className="absolute inset-0 bg-cover bg-no-repeat"
                          style={{
                            backgroundImage: `url(${backgroundImage})`,
                            backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
                            backgroundPosition: `${(x / (COLS - 1)) * 100}% ${(y / (ROWS - 1)) * 100}%`,
                          }}
                        />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 w-full">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onRestart}
              className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-black tracking-widest uppercase shadow-lg transition-all ${
                isClassic ? 'bg-[#0f380f] text-[#8b956d]' : 'bg-yellow-500 text-black hover:bg-yellow-400'
              }`}
            >
              <RotateCcw size={20} fill="currentColor" />
              {t.play}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Prime Tetris',
                    text: `My score: ${score}!`,
                    url: window.location.href,
                  });
                }
              }}
              className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold tracking-widest uppercase transition-all ${
                isClassic ? 'bg-[#0f380f]/10 text-[#0f380f]' : isLight ? 'bg-gray-200 text-gray-500' : 'bg-white/5 text-white/60'
              }`}
            >
              <Share2 size={18} />
              SHARE
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const StatsCard = ({ label, value, icon, theme }: { label: string; value: string; icon: React.ReactNode, theme: string }) => {
  const isClassic = theme === 'classic';
  const isLight = theme === 'light';
  
  return (
    <div className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center ${
      isClassic ? 'bg-[#0f380f]/10 border-[#0f380f]/20' : isLight ? 'bg-white border-gray-100' : 'bg-white/5 border-white/5'
    }`}>
      <div className={`mb-2 ${isClassic ? 'text-[#0f380f]/40' : 'text-yellow-500/40'}`}>
        {icon}
      </div>
      <span className={`text-[8px] font-black uppercase tracking-[0.2em] mb-1 opacity-40 ${isClassic ? 'text-[#0f380f]' : isLight ? 'text-gray-500' : 'text-white'}`}>{label}</span>
      <span className={`text-xl font-black tracking-tighter ${isClassic ? 'text-[#0f380f]' : isLight ? 'text-gray-900' : 'text-white'}`}>{value}</span>
    </div>
  );
};
