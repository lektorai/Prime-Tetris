import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Image as ImageIcon, Sparkles } from 'lucide-react';

interface MenuProps {
  onStart: (mode: 'standard' | 'special') => void;
  highScore: number;
}

export const Menu: React.FC<MenuProps> = ({ onStart, highScore }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] p-6 text-white font-sans overflow-hidden">
      <div className="relative mb-12 flex flex-col items-center">
        {/* Decorative elements */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="w-24 h-24 mb-6 relative"
        >
          {/* Logo-like J piece */}
          <div className="grid grid-cols-2 gap-1 w-full h-full p-2">
            <div className="bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 rounded-sm shadow-[0_0_15px_rgba(255,215,0,0.4)]" />
            <div className="rounded-sm" />
            <div className="bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 rounded-sm shadow-[0_0_15px_rgba(255,215,0,0.4)]" />
            <div className="bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 rounded-sm shadow-[0_0_15px_rgba(255,215,0,0.4)]" />
          </div>
          <div className="absolute -top-4 -right-4 text-yellow-500/30">
            <Sparkles size={40} />
          </div>
        </motion.div>

        <h1 className="text-5xl font-black tracking-tighter text-center uppercase flex items-baseline">
          <span className="text-white">PRIME</span>
          <span className="bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-700 bg-clip-text text-transparent ml-2">TETRIS</span>
        </h1>
        
        <div className="w-full h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent mt-4 mb-2" />
        <div className="w-2 h-2 rotate-45 border border-yellow-500 rotate-45 relative -top-3.5 bg-[#050505]" />
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onStart('standard')}
          className="relative group overflow-hidden bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 transition-all hover:border-yellow-500/50"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex flex-col items-center">
            <Play className="text-yellow-500 mb-2" size={32} fill="currentColor" />
            <span className="text-xl font-bold tracking-widest uppercase">ИГРАТЬ</span>
          </div>
        </motion.button>

        <div className="grid grid-cols-1 gap-3 mt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onStart('standard')}
            className="flex items-center justify-between bg-[#1a1a1a] border border-yellow-800/30 rounded-xl p-4 text-sm tracking-widest uppercase font-semibold hover:border-yellow-500 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="grid grid-cols-2 gap-0.5 w-6 h-6">
                <div className="bg-yellow-600 rounded-[1px]" />
                <div className="bg-yellow-600 rounded-[1px]" />
                <div className="bg-yellow-600 rounded-[1px]" />
                <div className="bg-yellow-600 rounded-[1px]" />
              </div>
              СТАНДАРТНЫЙ
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onStart('special')}
            className="flex items-center justify-between bg-[#1a1a1a] border border-yellow-800/30 rounded-xl p-4 text-sm tracking-widest uppercase font-semibold hover:border-yellow-500 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="grid grid-cols-3 gap-0.5 w-6 h-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-yellow-600 rounded-[1px]" />
                ))}
              </div>
              СПЕЦИАЛЬНЫЙ
            </div>
            <ImageIcon size={18} className="text-yellow-500" />
          </motion.button>
        </div>
      </div>

      {highScore > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-12 text-sm text-yellow-500/60 tracking-[0.2em] font-medium"
        >
          РЕКОРД: {highScore.toLocaleString()}
        </motion.div>
      )}

      {/* Subtle bottom glow */}
      <div className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-yellow-600/5 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
};
