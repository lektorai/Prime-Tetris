import { useState, useEffect, useCallback, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pause, Play, Trophy, Sparkles, Settings as SettingsIcon, X, Globe, Palette, DownloadCloud } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTetris } from './hooks/useTetris';
import { Menu } from './components/Menu';
import { TetrisBoard } from './components/TetrisBoard';
import { Controls } from './components/Controls';
import { GameOver } from './components/GameOver';
import { Settings } from './components/Settings';
import { DEFAULT_MOUNTAIN_IMAGE, COLS, ROWS } from './constants';
import { audioService } from './services/audioService';
import { GameMode, Language, Theme } from './types/tetris';
import { translations } from './translations';

export default function App() {
  const [screen, setScreen] = useState<'menu' | 'game' | 'gameover'>('menu');
  const [gameMode, setGameMode] = useState<GameMode>('standard');
  const [menuStage, setMenuStage] = useState<'initial' | 'mode'>('initial');
  const [selectedType, setSelectedType] = useState<'standard' | 'special'>('standard');
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [gameTime, setGameTime] = useState(0);
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('prime-tetris-lang');
    return (saved as Language) || 'ru';
  });
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('prime-tetris-theme');
    return (saved as Theme) || 'light';
  });
  const [showSettings, setShowSettings] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = translations[lang];

  // PWA Install Prompt Logic
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const {
    grid,
    currentPiece,
    position,
    ghostPosition,
    nextPiece,
    score,
    lines,
    level,
    isGameOver,
    isPaused,
    isVictory,
    highScore,
    puzzleProgress,
    movePiece,
    rotatePiece,
    hardDrop,
    setIsPaused,
    resetGame,
  } = useTetris(gameMode);

  const [isShaking, setIsShaking] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const prevLevelRef = useRef(level);

  useEffect(() => {
    if (level > prevLevelRef.current) {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 2000);
      prevLevelRef.current = level;
    }
  }, [level]);

  const triggerShake = useCallback(() => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 200);
  }, []);

  const handleMove = useCallback((dx: number, dy: number) => {
    const moved = movePiece(dx, dy);
    if (!moved && dy > 0) {
      triggerShake();
    }
  }, [movePiece, triggerShake]);

  const handleHardDrop = useCallback(() => {
    hardDrop();
    triggerShake();
  }, [hardDrop, triggerShake]);

  const handleRotate = useCallback(() => {
    rotatePiece();
  }, [rotatePiece]);

  // Persistence
  useEffect(() => {
    localStorage.setItem('prime-tetris-lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('prime-tetris-theme', theme);
  }, [theme]);

  // Time tracking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (screen === 'game' && !isPaused && !isGameOver && !isVictory) {
      interval = setInterval(() => {
        setGameTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [screen, isPaused, isGameOver, isVictory]);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Music start
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (screen === 'game' && !isGameOver && !isVictory) {
        audioService.startMusic();
      } else {
        audioService.startMenuMusic();
      }
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);
  }, []);

  useEffect(() => {
    if (screen === 'menu' || screen === 'gameover') {
      audioService.startMenuMusic();
    } else if (screen === 'game' && !isPaused && !isGameOver && !isVictory) {
      audioService.startMusic();
    }
  }, [screen, isPaused, isGameOver, isVictory]);

  const handleMenuStart = (type: 'standard' | 'special') => {
    audioService.playClick();
    setSelectedType(type);
    setMenuStage('mode');
  };

  const handleModeSelect = (mode: GameMode) => {
    audioService.playClick();
    setGameMode(mode);
    setGameTime(0);
    if (selectedType === 'special') {
      fileInputRef.current?.click();
    } else {
      setCustomImage(null);
      resetGame(mode);
      setScreen('game');
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomImage(event.target?.result as string);
        resetGame(gameMode);
        setScreen('game');
      };
      reader.readAsDataURL(file);
    } else {
      resetGame(gameMode);
      setScreen('game');
    }
  };

  const backgroundImage = selectedType === 'special' ? (customImage || DEFAULT_MOUNTAIN_IMAGE) : DEFAULT_MOUNTAIN_IMAGE;
  // Always show background image except maybe in some very specific case, 
  // but user said "standard gameplay with base image".
  const finalBackgroundImage = backgroundImage;

  useEffect(() => {
    if (isGameOver || isVictory) {
      setScreen('gameover');
      if ((score >= highScore && score > 0) || isVictory) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: theme === 'neon' ? ['#ff00ff', '#00ffff', '#ffff00'] : ['#FFD700', '#FFFFFF', '#FFA500']
        });
      }
    }
  }, [isGameOver, isVictory, score, highScore, theme]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (screen !== 'game' || isPaused || isGameOver || isVictory) return;
      
      switch (e.key) {
        case 'ArrowLeft': handleMove(-1, 0); break;
        case 'ArrowRight': handleMove(1, 0); break;
        case 'ArrowDown': handleMove(0, 1); break;
        case 'ArrowUp': handleRotate(); break;
        case ' ': handleHardDrop(); break;
        case 'p': setIsPaused(!isPaused); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, isPaused, isGameOver, isVictory, handleMove, handleRotate, handleHardDrop, setIsPaused]);

  // Theme colors
  const getThemeBg = () => {
    switch(theme) {
      case 'light': return 'bg-[#f0f0f0] text-gray-900';
      case 'neon': return 'bg-[#0a0014] text-pink-500';
      case 'classic': return 'bg-[#8b956d] text-[#0f380f]';
      default: return 'bg-[#050505] text-white';
    }
  };

  return (
    <div className={`min-h-screen ${getThemeBg()} font-sans touch-none select-none flex flex-col overflow-x-hidden transition-colors duration-500 relative`}>
      {/* Dynamic Background for Neon */}
      {theme === 'neon' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-500/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />
          <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-blue-500/5 rounded-full blur-[80px] animate-pulse [animation-name:pulse] [animation-duration:8s]" />
        </div>
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <Settings 
            onClose={() => setShowSettings(false)}
            lang={lang}
            setLang={setLang}
            theme={theme}
            setTheme={setTheme}
            t={t}
            onInstall={handleInstallClick}
            canInstall={!!deferredPrompt}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {screen === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 relative"
          >
            <Menu 
              onStart={handleMenuStart}
              onModeSelect={handleModeSelect}
              menuStage={menuStage}
              setMenuStage={setMenuStage}
              highScore={highScore} 
              t={t} 
              theme={theme} 
              onOpenSettings={() => setShowSettings(true)}
              onInstall={handleInstallClick}
              canInstall={!!deferredPrompt}
            />
          </motion.div>
        )}

        {screen === 'game' && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-between p-2 max-h-screen overflow-hidden"
          >
            {/* Header / HUD */}
            <div className="w-full max-w-[420px] pt-1 px-4 relative flex flex-col shrink-0 gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className={`text-[5px] font-bold uppercase tracking-[0.4em] ${theme === 'light' ? 'text-gray-500' : 'text-yellow-500/40'}`}>{t.score}</span>
                  <span className={`text-base font-black tracking-tighter leading-none ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{score.toLocaleString()}</span>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className={`flex p-1 rounded-md shadow-lg ${theme === 'light' ? 'bg-gray-200' : 'bg-gradient-to-t from-yellow-700 to-yellow-200'}`}>
                    <svg viewBox="0 0 24 24" fill="currentColor" className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-gray-800' : 'text-yellow-900'}`}>
                      <path d="M5,16L3,5L8.5,10L12,4L15.5,10L21,5L19,16H5M19,19A1,1 0 0,1 18,20H6A1,1 0 0,1 5,19V18H19V19Z" />
                    </svg>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className={`text-[5px] font-bold uppercase tracking-[0.4em] ${theme === 'light' ? 'text-gray-500' : 'text-yellow-500/40'}`}>{t.time}</span>
                  <span className={`text-base font-black tracking-tighter leading-none ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{formatTime(gameTime)}</span>
                </div>
              </div>
              
              <div className={`flex items-center justify-between px-2 h-9 border rounded-lg ${theme === 'light' ? 'bg-gray-100 border-gray-200' : 'bg-white/[0.02] border-white/5'}`}>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-[5px] font-bold uppercase ${theme === 'light' ? 'text-gray-400' : 'text-white/30'}`}>{t.next}</span>
                    <div className={`w-10 flex items-center justify-center p-1 rounded-sm border h-6 ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-black/40 border-yellow-500/5'}`}>
                      <div className="scale-[0.2] origin-center">
                        <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gridTemplateRows: 'repeat(2, minmax(0, 1fr))' }}>
                          {[...Array(8)].map((_, idx) => {
                            const r = Math.floor(idx / 4);
                            const c = idx % 4;
                            const isFilled = nextPiece.shape[r]?.[c];
                            return (
                              <div key={idx} className={`w-8 h-8 rounded-sm ${isFilled ? (theme === 'classic' ? 'bg-[#0f380f]' : 'bg-yellow-500') : 'opacity-0'}`} />
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span className={`text-[5px] font-bold uppercase ${theme === 'light' ? 'text-gray-400' : 'text-white/20'}`}>{t.lines}</span>
                      <span className={`text-[10px] font-black ${theme === 'light' ? 'text-gray-700' : 'text-white/80'}`}>{lines}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`text-[5px] font-bold uppercase ${theme === 'light' ? 'text-gray-400' : 'text-white/20'}`}>
                        {gameMode === 'puzzle' ? 'PROGRESS' : t.level}
                      </span>
                      <span className={`text-[10px] font-black ${theme === 'light' ? 'text-gray-700' : 'text-white/80'}`}>
                        {gameMode === 'puzzle' ? `${Math.min(100, Math.round((puzzleProgress / 16) * 100))}%` : level}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                   <button 
                    onClick={() => setShowSettings(true)}
                    className={`p-1.5 rounded-md transition-colors ${theme === 'light' ? 'text-gray-400 hover:bg-gray-200' : 'text-white/20 hover:bg-white/10'}`}
                  >
                    <SettingsIcon size={12} />
                  </button>
                  <button 
                    onClick={() => setIsPaused(!isPaused)}
                    className={`flex items-center justify-center p-1.5 rounded-md transition-colors ${theme === 'light' ? 'text-gray-500 hover:bg-gray-200' : 'text-yellow-500/40 hover:bg-white/10 active:text-yellow-500'}`}
                  >
                    {isPaused ? <Play size={12} fill="currentColor" /> : <Pause size={12} fill="currentColor" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Game Board */}
            <div className="flex-1 w-full flex items-center justify-center min-h-0 overflow-hidden relative">
               <TetrisBoard 
                grid={grid} 
                currentPiece={currentPiece} 
                position={position} 
                ghostPosition={ghostPosition}
                backgroundImage={finalBackgroundImage} 
                theme={theme}
                isShaking={isShaking}
              />

              <AnimatePresence>
                {showLevelUp && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.5, y: -50 }}
                    className="absolute z-40 pointer-events-none"
                  >
                    <div className="bg-yellow-500 text-black px-8 py-3 rounded-2xl font-black text-2xl shadow-[0_0_30px_rgba(234,179,8,0.5)] tracking-tighter">
                      LEVEL UP!
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <AnimatePresence>
                {isPaused && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl"
                  >
                    <div className="flex flex-col items-center gap-4 w-full max-w-[200px]">
                      <h3 className="text-xl font-black tracking-[0.5em] text-yellow-500 mb-4 uppercase">{t.pause}</h3>
                      
                      <button 
                        onClick={() => setIsPaused(false)}
                        className="w-full py-4 bg-yellow-500/10 border border-yellow-500/50 rounded-xl text-yellow-500 font-bold tracking-[0.2em] uppercase active:scale-95 transition-transform"
                      >
                        {t.resume}
                      </button>
                      
                      <button 
                        onClick={() => { resetGame(gameMode); setIsPaused(false); setGameTime(0); }}
                        className="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-white/80 font-bold tracking-[0.2em] uppercase active:scale-95 transition-transform"
                      >
                        {t.restart}
                      </button>

                      <button 
                        onClick={() => setShowSettings(true)}
                        className="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-white/80 font-bold tracking-[0.2em] uppercase active:scale-95 transition-transform"
                      >
                        {t.settings}
                      </button>
                      
                      <button 
                        onClick={() => { setScreen('menu'); setIsPaused(false); }}
                        className="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-white/40 font-bold tracking-[0.2em] uppercase active:scale-95 transition-transform"
                      >
                        {t.menu}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className={`w-full py-2 bg-gradient-to-t ${theme === 'light' ? 'from-white/50' : 'from-black'} to-transparent shrink-0`}>
              <Controls 
                onMove={handleMove} 
                onRotate={handleRotate} 
                onHardDrop={handleHardDrop} 
                theme={theme}
              />
            </div>
          </motion.div>
        )}

        {screen === 'gameover' && (
          <motion.div
            key="gameover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1"
          >
            <GameOver 
              score={score} 
              highScore={highScore} 
              time={formatTime(gameTime)} 
              onRestart={() => {
                resetGame('standard');
                setScreen('menu');
                setMenuStage('initial');
              }} 
              grid={grid}
              backgroundImage={finalBackgroundImage}
              t={t}
              theme={theme}
              isVictory={isVictory}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        body, html {
          margin: 0;
          padding: 0;
          height: 100dvh;
          width: 100vw;
          overflow: hidden;
          position: fixed;
          top: 0;
          left: 0;
        }
        #root {
          height: 100dvh;
          display: flex;
          flex-direction: column;
        }
        * {
          -webkit-tap-highlight-color: transparent;
          user-select: none;
          box-sizing: border-box;
        }
        .theme-classic-bg { background-color: #8b956d; }
        .theme-classic-ink { color: #0f380f; }
      `}} />
    </div>
  );
}

