import { useState, useEffect, useCallback, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pause, Play, Trophy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTetris } from './hooks/useTetris';
import { Menu } from './components/Menu';
import { TetrisBoard } from './components/TetrisBoard';
import { Controls } from './components/Controls';
import { GameOver } from './components/GameOver';
import { DEFAULT_MOUNTAIN_IMAGE } from './constants';

type Screen = 'menu' | 'game' | 'gameover';

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [gameMode, setGameMode] = useState<'standard' | 'special'>('standard');
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [gameTime, setGameTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    grid,
    currentPiece,
    position,
    nextPiece,
    score,
    lines,
    level,
    isGameOver,
    isPaused,
    highScore,
    movePiece,
    rotatePiece,
    hardDrop,
    setIsPaused,
    resetGame,
  } = useTetris();

  // Time tracking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (screen === 'game' && !isPaused && !isGameOver) {
      interval = setInterval(() => {
        setGameTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [screen, isPaused, isGameOver]);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleStart = (mode: 'standard' | 'special') => {
    setGameMode(mode);
    setGameTime(0);
    if (mode === 'special') {
      fileInputRef.current?.click();
    } else {
      setCustomImage(null);
      resetGame();
      setScreen('game');
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomImage(event.target?.result as string);
        resetGame();
        setScreen('game');
      };
      reader.readAsDataURL(file);
    }
  };

  const backgroundImage = gameMode === 'special' ? customImage : DEFAULT_MOUNTAIN_IMAGE;

  useEffect(() => {
    if (isGameOver) {
      setScreen('gameover');
      if (score >= highScore && score > 0) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFFFFF', '#FFA500']
        });
      }
    }
  }, [isGameOver, score, highScore]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (screen !== 'game' || isPaused || isGameOver) return;
      
      switch (e.key) {
        case 'ArrowLeft': movePiece(-1, 0); break;
        case 'ArrowRight': movePiece(1, 0); break;
        case 'ArrowDown': movePiece(0, 1); break;
        case 'ArrowUp': rotatePiece(); break;
        case ' ': hardDrop(); break;
        case 'p': setIsPaused(!isPaused); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, isPaused, isGameOver, movePiece, rotatePiece, hardDrop, setIsPaused]);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans touch-none select-none flex flex-col overflow-x-hidden">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      <AnimatePresence mode="wait">
        {screen === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1"
          >
            <Menu onStart={handleStart} highScore={highScore} />
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
            {/* Header / HUD - Redesigned for absolute clarity and no overlaps */}
            <div className="w-full max-w-[420px] pt-2 px-4 relative flex flex-col shrink-0 gap-3">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[6px] text-yellow-500/40 tracking-[0.4em] font-bold uppercase">СЧЕТ</span>
                  <span className="text-xl font-extrabold tracking-tighter text-white">{score.toLocaleString()}</span>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="flex bg-gradient-to-t from-yellow-700 to-yellow-200 p-1.5 rounded-md shadow-[0_0_15px_rgba(255,215,0,0.25)] ring-1 ring-yellow-500/20">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-900">
                      <path d="M5,16L3,5L8.5,10L12,4L15.5,10L21,5L19,16H5M19,19A1,1 0 0,1 18,20H6A1,1 0 0,1 5,19V18H19V19Z" />
                    </svg>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-[6px] text-yellow-500/40 tracking-[0.4em] font-bold uppercase">ВРЕМЯ</span>
                  <span className="text-lg font-extrabold tracking-tighter text-white">{formatTime(gameTime)}</span>
                </div>
              </div>
              
              {/* Secondary HUD: Fixed height and structure */}
              <div className="flex items-center justify-between px-3 h-12 bg-white/[0.03] border border-white/5 rounded-lg">
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-2">
                    <span className="text-[6px] text-white/30 font-bold uppercase">NEXT</span>
                    <div className="w-14 flex items-center justify-center bg-black/40 p-1.5 rounded-sm border border-yellow-500/10 h-8">
                      <div className="scale-[0.25] origin-center">
                        <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gridTemplateRows: 'repeat(2, minmax(0, 1fr))' }}>
                          {[...Array(8)].map((_, idx) => {
                            const r = Math.floor(idx / 4);
                            const c = idx % 4;
                            const isFilled = nextPiece.shape[r]?.[c];
                            return (
                              <div key={idx} className={`w-8 h-8 rounded-sm ${isFilled ? 'bg-yellow-500' : 'opacity-0'}`} />
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <span className="text-[6px] text-white/20 font-bold uppercase">LINES:</span>
                      <span className="text-[11px] font-black text-white/80">{lines}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[6px] text-white/20 font-bold uppercase">LVL:</span>
                      <span className="text-[11px] font-black text-white/80">{level}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setIsPaused(!isPaused)}
                  className="flex items-center justify-center p-2 rounded-md hover:bg-white/10 transition-colors text-yellow-500/60 active:text-yellow-500"
                >
                  {isPaused ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />}
                </button>
              </div>
            </div>

            {/* Game Board - Optimized for 9:16 aspect ratio */}
            <div className="flex-1 w-full flex items-center justify-center min-h-0 overflow-hidden relative">
               <TetrisBoard 
                grid={grid} 
                currentPiece={currentPiece} 
                position={position} 
                backgroundImage={backgroundImage} 
              />
              
              {/* Pause Overlay (now only shows if paused, centered on board) */}
              <AnimatePresence>
                {isPaused && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl"
                  >
                    <div className="flex flex-col items-center gap-4 w-full max-w-[200px]">
                      <h3 className="text-xl font-black tracking-[0.5em] text-yellow-500 mb-4">ПАУЗА</h3>
                      
                      <button 
                        onClick={() => setIsPaused(false)}
                        className="w-full py-4 bg-yellow-500/10 border border-yellow-500/50 rounded-xl text-yellow-500 font-bold tracking-[0.2em] uppercase active:scale-95 transition-transform"
                      >
                        ПРОДОЛЖИТЬ
                      </button>
                      
                      <button 
                        onClick={() => { resetGame(); setIsPaused(false); setGameTime(0); }}
                        className="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-white/80 font-bold tracking-[0.2em] uppercase active:scale-95 transition-transform"
                      >
                        ЗАНОВО
                      </button>
                      
                      <button 
                        onClick={() => { setScreen('menu'); setIsPaused(false); }}
                        className="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-white/40 font-bold tracking-[0.2em] uppercase active:scale-95 transition-transform"
                      >
                        В МЕНЮ
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Controls - Positioned at bottom */}
            <div className="w-full py-4 bg-gradient-to-t from-black to-transparent">
              <Controls 
                onMove={movePiece} 
                onRotate={rotatePiece} 
                onHardDrop={hardDrop} 
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
              onRestart={() => setScreen('menu')} 
              grid={grid}
              backgroundImage={backgroundImage}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        body, html {
          background-color: #050505;
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          overflow: hidden;
          position: fixed;
        }
        #root {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        * {
          -webkit-tap-highlight-color: transparent;
          user-select: none;
          touch-action: none;
        }
        .shine-effect {
          position: relative;
          overflow: hidden;
        }
        .shine-effect::after {
          content: "";
          position: absolute;
          top: 0; left: 0; width: 100%; height: 200%;
          background: linear-gradient(0deg, transparent, rgba(255,255,255,0.4), transparent);
          transform: rotate(45deg);
          animation: shine 1.5s infinite;
        }
        @keyframes shine {
          0% { transform: translate(-100%, -100%) rotate(45deg); }
          100% { transform: translate(100%, 100%) rotate(45deg); }
        }
      `}} />
    </div>
  );
}

