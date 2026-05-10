import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Image as ImageIcon, Sparkles, Settings as SettingsIcon, LayoutGrid, Star } from 'lucide-react';
import { Theme } from '../types/tetris';
import { audioService } from '../services/audioService';

interface MenuProps {
  onStart: (type: 'standard' | 'special') => void;
  onModeSelect: (mode: 'standard' | 'puzzle') => void;
  menuStage: 'initial' | 'mode';
  setMenuStage: (stage: 'initial' | 'mode') => void;
  highScore: number;
  t: any;
  theme: Theme;
  onOpenSettings: () => void;
  onInstall?: () => void;
  canInstall?: boolean;
}

export const Menu: React.FC<MenuProps> = ({ 
  onStart, 
  onModeSelect, 
  menuStage, 
  setMenuStage,
  highScore, 
  t, 
  theme, 
  onOpenSettings,
  onInstall,
  canInstall
}) => {
  const isNeon = theme === 'neon';
  const isLight = theme === 'light';
  const isClassic = theme === 'classic';

  const handleModeSelect = (mode: string) => {
    onModeSelect(mode as any);
    audioService.playClick();
  };

  const handleStart = (type: 'standard' | 'special') => {
    onStart(type);
    audioService.playClick();
  };

  return (
    <div className={`flex flex-col items-center justify-center h-full w-full p-6 overflow-hidden transition-colors duration-500 relative`}>
      {/* Settings FAB */}
      <motion.button
        whileHover={{ rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => { onOpenSettings(); audioService.playClick(); }}
        className={`absolute top-6 right-6 p-3 border rounded-full z-50 shadow-lg transition-colors ${
          isClassic ? 'bg-[#9bbc0f] border-[#0f380f] text-[#0f380f]' : 
          isLight ? 'bg-white border-gray-200 text-gray-900 shadow-md' : 
          'bg-white/5 border-white/10 text-white/40 hover:text-white'
        }`}
      >
        <SettingsIcon size={24} />
      </motion.button>

      <div className="relative mb-12 flex flex-col items-center">
        {/* Decorative elements */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-20 h-20 mb-6 relative"
        >
          {/* Logo-like J piece */}
          <div className="grid grid-cols-2 gap-1 w-full h-full p-2">
            <div className={`rounded-sm shadow-md ${isClassic ? 'bg-[#0f380f]' : 'bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 shadow-yellow-500/20'}`} />
            <div className="rounded-sm" />
            <div className={`rounded-sm shadow-md ${isClassic ? 'bg-[#0f380f]' : 'bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 shadow-yellow-500/20'}`} />
            <div className={`rounded-sm shadow-md ${isClassic ? 'bg-[#0f380f]' : 'bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 shadow-yellow-500/20'}`} />
          </div>
          {!isClassic && (
            <div className={`absolute -top-4 -right-4 ${isNeon ? 'text-pink-500' : 'text-yellow-500/30'}`}>
              <Sparkles size={40} />
            </div>
          )}
        </motion.div>

        <h1 className={`text-4xl md:text-5xl font-black tracking-tighter text-center uppercase flex items-baseline ${isClassic ? 'text-[#0f380f]' : ''}`}>
          <span className={isLight ? 'text-gray-900' : 'text-white'}>PRIME</span>
          <span className={`bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-700 bg-clip-text text-transparent ml-2 ${isClassic ? 'from-[#0f380f] to-[#0f380f]' : ''}`}>TETRIS</span>
        </h1>
        
        <div className={`w-full h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent mt-4 mb-2 ${isClassic ? 'via-[#0f380f]/30' : ''}`} />
        <div className={`w-2 h-2 rotate-45 border relative -top-3.5 ${isClassic ? 'border-[#0f380f] bg-[#8b956d]' : 'border-yellow-500'}`} />
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs relative min-h-[180px] justify-center">
        <AnimatePresence mode="wait">
          {menuStage === 'initial' ? (
            <motion.div 
              key="initial"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              className="flex flex-col gap-3"
            >
              <MenuButton 
                onClick={() => handleStart('standard')} 
                title={t.standard} 
                icon={<Star className="text-yellow-500" />} 
                theme={theme}
              />
              <MenuButton 
                onClick={() => handleStart('special')} 
                title={t.special} 
                icon={<ImageIcon className="text-yellow-500" />} 
                theme={theme}
              />
            </motion.div>
          ) : (
            <motion.div 
              key="mode"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="flex flex-col gap-3"
            >
              <MenuButton 
                onClick={() => handleModeSelect('standard')} 
                title={t.tetris} 
                icon={<Play className="text-yellow-500" fill="currentColor" />} 
                theme={theme}
              />
              <div className="flex flex-col gap-1">
                <MenuButton 
                  onClick={() => handleModeSelect('puzzle')} 
                  title={t.puzzle} 
                  icon={<LayoutGrid className="text-yellow-500" />} 
                  theme={theme}
                />
                <p className={`px-2 text-[7px] text-left opacity-60 uppercase tracking-widest leading-relaxed max-w-[280px] ${isClassic ? 'text-[#0f380f]' : 'text-white'}`}>
                  {t.puzzleHint}
                </p>
              </div>
              <button 
                onClick={() => { setMenuStage('initial'); audioService.playClick(); }}
                className={`mt-4 text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity ${
                  isClassic ? 'text-[#0f380f]' : 
                  isLight ? 'text-gray-900' : 
                  'text-white'
                }`}
              >
                &larr; {t.menu}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

        {highScore > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mt-10 text-xs tracking-[0.2em] font-bold ${
              isClassic ? 'text-[#0f380f]/40' : 
              isLight ? 'text-gray-500' : 
              'text-yellow-500/60'
            }`}
          >
            {t.highScore}: {highScore.toLocaleString()}
          </motion.div>
        )}

        {canInstall && onInstall && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onInstall}
            className={`mt-6 flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-bold tracking-[0.2em] uppercase transition-all ${
              isClassic ? 'bg-[#9bbc0f] border-[#0f380f] text-[#0f380f]' : 
              isLight ? 'bg-white border-gray-200 text-gray-500 shadow-sm' : 
              'bg-white/5 border-white/10 text-white/40 hover:text-white'
            }`}
          >
            <Star size={12} className="text-yellow-500" fill="currentColor" />
            {t.install}
          </motion.button>
        )}

      {!isClassic && (
        <div className={`absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-[300px] h-[300px] blur-[120px] rounded-full pointer-events-none ${
          isNeon ? 'bg-pink-500/10' : 'bg-yellow-600/5'
        }`} />
      )}
    </div>
  );
};

const MenuButton = ({ onClick, title, icon, theme }: { onClick: () => void; title: string; icon: React.ReactNode; theme: Theme }) => {
  const isClassic = theme === 'classic';
  const isLight = theme === 'light';
  const isNeon = theme === 'neon';
  
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative group flex items-center justify-between border rounded-2xl p-5 text-sm tracking-[0.15em] uppercase font-bold transition-all shadow-lg ${
        isClassic 
          ? 'bg-[#9bbc0f] border-[#0f380f] text-[#0f380f] shadow-[4px_4px_0px_#0f380f]' 
          : isLight 
          ? 'bg-white border-gray-200 text-gray-700 hover:border-yellow-500' 
          : 'bg-[#1a1a1a] border-white/10 text-white hover:border-yellow-500/50'
      } ${isNeon ? 'hover:border-pink-500' : ''}`}
    >
      <div className="flex items-center gap-4">
        {React.cloneElement(icon as React.ReactElement, { size: 20, className: isClassic ? 'text-[#0f380f]' : (icon as any).props.className })}
        {title}
      </div>
      <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${isClassic ? 'text-[#0f380f]' : 'text-yellow-500'}`}>
        <Play size={14} fill="currentColor" />
      </div>
    </motion.button>
  );
};
