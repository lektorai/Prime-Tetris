import React from 'react';
import { motion } from 'motion/react';
import { X, Volume2, Music, Globe, Palette } from 'lucide-react';
import { Theme, Language } from '../types/tetris';
import { audioService } from '../services/audioService';

interface SettingsProps {
  onClose: () => void;
  lang: Language;
  setLang: (l: Language) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  t: any;
  onInstall?: () => void;
  canInstall?: boolean;
}

export const Settings: React.FC<SettingsProps> = ({ onClose, lang, setLang, theme, setTheme, t, onInstall, canInstall }) => {
  const isClassic = theme === 'classic';
  const isLight = theme === 'light';
  
  const [audioSettings, setAudioSettings] = React.useState(audioService.getSettings());

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    audioService.setVolume(v);
    setAudioSettings(prev => ({ ...prev, volume: v }));
  };

  const toggleSound = () => {
    const next = !audioSettings.sound;
    audioService.toggleSound(next);
    setAudioSettings(prev => ({ ...prev, sound: next }));
    if (next) audioService.playClick();
  };

  const toggleMusic = () => {
    const next = !audioSettings.music;
    audioService.toggleMusic(next);
    setAudioSettings(prev => ({ ...prev, music: next }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-6"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className={`w-full max-w-sm rounded-3xl p-8 relative border shadow-2xl ${
          isClassic ? 'bg-[#9bbc0f] border-[#0f380f]' : 
          isLight ? 'bg-white border-gray-100' : 
          'bg-[#1a1a1a] border-white/10'
        }`}
      >
        <button 
          onClick={onClose}
          className={`absolute top-6 right-6 p-2 rounded-full transition-colors ${
            isClassic ? 'hover:bg-[#0f380f]/10 text-[#0f380f]' : 
            isLight ? 'hover:bg-gray-100 text-gray-500' : 
            'text-white/40 hover:text-white'
          }`}
        >
          <X size={24} />
        </button>

        <h2 className={`text-2xl font-black mb-8 tracking-widest uppercase flex items-center gap-3 ${
          isClassic ? 'text-[#0f380f]' : isLight ? 'text-gray-900' : 'text-white'
        }`}>
          {t.settings}
        </h2>

        <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {/* Audio Section */}
          <section>
            <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-40 ${
              isClassic ? 'text-[#0f380f]' : isLight ? 'text-gray-500' : 'text-white'
            }`}>
              {t.sound} & {t.music}
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Volume2 size={18} className={isClassic ? 'text-[#0f380f]' : isLight ? 'text-gray-900' : 'text-yellow-500'} />
                  <span className={`text-sm font-bold ${isClassic ? 'text-[#0f380f]' : isLight ? 'text-gray-700' : 'text-white/80'}`}>{t.sound}</span>
                </div>
                <button 
                  onClick={toggleSound}
                  className={`w-12 h-6 rounded-full relative transition-colors ${
                    audioSettings.sound ? (isClassic ? 'bg-[#0f380f]' : 'bg-yellow-500') : 'bg-gray-400/20'
                  }`}
                >
                  <motion.div 
                    animate={{ x: audioSettings.sound ? 26 : 4 }}
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Music size={18} className={isClassic ? 'text-[#0f380f]' : isLight ? 'text-gray-900' : 'text-yellow-500'} />
                  <span className={`text-sm font-bold ${isClassic ? 'text-[#0f380f]' : isLight ? 'text-gray-700' : 'text-white/80'}`}>{t.music}</span>
                </div>
                <button 
                  onClick={toggleMusic}
                  className={`w-12 h-6 rounded-full relative transition-colors ${
                    audioSettings.music ? (isClassic ? 'bg-[#0f380f]' : 'bg-yellow-500') : 'bg-gray-400/20'
                  }`}
                >
                  <motion.div 
                    animate={{ x: audioSettings.music ? 26 : 4 }}
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                  />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-[10px] font-bold opacity-40">
                  <span className={isClassic ? 'text-[#0f380f]' : isLight ? 'text-gray-500' : 'text-white'}>{t.volume}</span>
                  <span className={isClassic ? 'text-[#0f380f]' : isLight ? 'text-gray-500' : 'text-white'}>{Math.round(audioSettings.volume * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="1" step="0.01"
                  value={audioSettings.volume}
                  onChange={handleVolumeChange}
                  className={`w-full h-1 bg-gray-400/20 rounded-lg appearance-none cursor-pointer accent-yellow-500 ${isClassic ? 'accent-[#0f380f]' : ''}`}
                />
              </div>
            </div>
          </section>

          {/* Language Selection */}
          <section>
            <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-40 ${
              isClassic ? 'text-[#0f380f]' : isLight ? 'text-gray-500' : 'text-white'
            }`}>
              {t.language}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {(['ru', 'en'] as Language[]).map(l => (
                <button
                  key={l}
                  onClick={() => { setLang(l); audioService.playClick(); }}
                  className={`py-3 rounded-xl border transition-all font-bold text-xs ${
                    lang === l 
                      ? (isClassic ? 'bg-[#0f380f] border-[#0f380f] text-[#9bbc0f]' : 'bg-yellow-500 border-yellow-500 text-black shadow-lg') 
                      : (isClassic ? 'bg-transparent border-[#0f380f]/20 text-[#0f380f]' : 
                         isLight ? 'bg-gray-100 border-gray-300 text-gray-900 hover:bg-gray-200' :
                         'bg-white/5 border-white/10 text-white/60')
                  }`}
                >
                  {l === 'ru' ? 'РУССКИЙ' : 'ENGLISH'}
                </button>
              ))}
            </div>
          </section>

          {/* Theme Selection */}
          <section>
            <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-40 ${
              isClassic ? 'text-[#0f380f]' : isLight ? 'text-gray-500' : 'text-white'
            }`}>
              {t.theme}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {(['dark', 'light', 'neon', 'classic'] as Theme[]).map(th => (
                <button
                  key={th}
                  onClick={() => { setTheme(th); audioService.playClick(); }}
                  className={`py-3 rounded-xl border transition-all font-bold text-[10px] tracking-widest ${
                    theme === th 
                      ? (isClassic && th === 'classic' ? 'bg-[#0f380f] border-[#0f380f] text-[#9bbc0f]' : 'bg-yellow-500 border-yellow-500 text-black shadow-lg') 
                      : (isClassic ? 'bg-transparent border-[#0f380f]/20 text-[#0f380f]' : 
                         isLight ? 'bg-gray-100 border-gray-300 text-gray-900 hover:bg-gray-200' :
                         'bg-white/5 border-white/10 text-white/60')
                  }`}
                >
                  {(t.themes as any)[th]}
                </button>
              ))}
            </div>
          </section>

          {canInstall && onInstall && (
            <section>
              <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-40 ${
                isClassic ? 'text-[#0f380f]' : isLight ? 'text-gray-500' : 'text-white'
              }`}>
                PWA
              </h3>
              <button
                onClick={onInstall}
                className={`w-full py-4 rounded-xl border flex items-center justify-center gap-3 font-bold text-xs tracking-widest transition-all ${
                  isClassic ? 'bg-[#0f380f] border-[#0f380f] text-[#9bbc0f]' : 
                  isLight ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                  'bg-yellow-500/10 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/20'
                }`}
              >
                <Palette size={16} />
                {t.install}
              </button>
            </section>
          )}
        </div>

        <button 
          onClick={onClose}
          className={`w-full mt-10 py-4 font-bold rounded-2xl transition-all uppercase tracking-widest ${
            isClassic ? 'bg-[#0f380f] text-[#9bbc0f]' : isLight ? 'bg-gray-900 text-white' : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          {t.close}
        </button>
      </motion.div>
    </motion.div>
  );
};
