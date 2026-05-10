import { useState, useEffect, useCallback, useRef } from 'react';
import { COLS, ROWS, PIECES, INITIAL_LEVEL, LINES_PER_LEVEL, SCORE_PER_LINE } from '../constants';
import { GameState, Position, Piece, PieceType, GameMode } from '../types/tetris';
import { audioService } from '../services/audioService';

const createEmptyGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(null));

const getRandomPiece = (): Piece => {
  const types: PieceType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  const type = types[Math.floor(Math.random() * types.length)];
  return PIECES[type];
};

export function useTetris(initialMode: GameMode = 'standard') {
  const [grid, setGrid] = useState<(string | null)[][]>(createEmptyGrid());
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [nextPiece, setNextPiece] = useState<Piece>(getRandomPiece());
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(INITIAL_LEVEL);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>(initialMode);
  const [isVictory, setIsVictory] = useState(false);
  
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('prime-tetris-highscore');
    return saved ? parseInt(saved, 10) : 0;
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetGame = useCallback((mode: GameMode = 'standard') => {
    setGrid(createEmptyGrid());
    setCurrentPiece(getRandomPiece());
    setPosition({ x: Math.floor(COLS / 2) - 1, y: 0 });
    setNextPiece(getRandomPiece());
    setScore(0);
    setLines(0);
    setLevel(INITIAL_LEVEL);
    setIsGameOver(false);
    setIsPaused(false);
    setGameMode(mode);
    setIsVictory(false);
    audioService.startMusic();
  }, []);

  const clearLines = useCallback((currentGrid: (string | null)[][]) => {
    let linesCleared = 0;
    
    if (gameMode === 'standard') {
      const newGrid = currentGrid.filter((row) => {
        const isFull = row.every((cell) => cell !== null);
        if (isFull) linesCleared++;
        return !isFull;
      });

      while (newGrid.length < ROWS) {
        newGrid.unshift(Array(COLS).fill(null));
      }

      if (linesCleared > 0) {
        audioService.playLineClear();
        const lineScore = SCORE_PER_LINE[linesCleared] * level;
        setScore((prev) => prev + lineScore);
        setLines((prev) => {
          const newLines = prev + linesCleared;
          if (Math.floor(newLines / LINES_PER_LEVEL) + 1 > level) {
            setLevel((l) => l + 1);
          }
          return newLines;
        });
      }
      return newGrid;
    } else {
      // PUZZLE MODE (Сбор)
      const newGrid = [...currentGrid.map(row => [...row])];
      
      // Check full lines from top to bottom
      for (let y = 0; y < ROWS; y++) {
        const isFull = newGrid[y].every(cell => cell !== null);
        if (isFull) {
          linesCleared++;
          // If a full line is above an incomplete line, the incomplete line below disappears
          for (let dy = y + 1; dy < ROWS; dy++) {
            const isRowEmpty = newGrid[dy].every(cell => cell === null);
            const isRowFull = newGrid[dy].every(cell => cell !== null);
            if (!isRowEmpty && !isRowFull) {
              newGrid.splice(dy, 1);
              newGrid.unshift(Array(COLS).fill(null));
              break; 
            }
          }
        }
      }

      if (linesCleared > 0) {
          audioService.playLineClear();
          setScore(prev => prev + linesCleared * 100);
          setLines(prev => prev + linesCleared);
        }

        // --- PUZZLE VICTORY LOGIC ---
        // Победить если заполнено хотя бы 16 линий снизу (4 или меньше осталось сверху)
        let totalFullLines = 0;
        for (let rowY = 0; rowY < ROWS; rowY++) {
          if (newGrid[rowY].every(cell => cell !== null)) {
            totalFullLines++;
          }
        }

        if (totalFullLines >= 16) {
          setIsVictory(true);
          audioService.playVictory();
        }
        
        return newGrid;
      }
    }, [gameMode]);

  const isValidMove = useCallback((piece: Piece, pos: Position, currentGrid: (string | null)[][]) => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = pos.x + x;
          const newY = pos.y + y;
          if (
            newX < 0 ||
            newX >= COLS ||
            newY >= ROWS ||
            (newY >= 0 && currentGrid[newY][newX] !== null)
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }, []);

  const rotatePiece = useCallback(() => {
    if (!currentPiece || isGameOver || isPaused || isVictory) return;

    const rotatedShape = currentPiece.shape[0].map((_, i) =>
      currentPiece.shape.map((row) => row[i]).reverse()
    );

    const rotatedPiece = { ...currentPiece, shape: rotatedShape };

    if (isValidMove(rotatedPiece, position, grid)) {
      audioService.playRotate();
      setCurrentPiece(rotatedPiece);
    } else {
      if (isValidMove(rotatedPiece, { ...position, x: position.x - 1 }, grid)) {
        audioService.playRotate();
        setPosition(prev => ({ ...prev, x: prev.x - 1 }));
        setCurrentPiece(rotatedPiece);
      } else if (isValidMove(rotatedPiece, { ...position, x: position.x + 1 }, grid)) {
        audioService.playRotate();
        setPosition(prev => ({ ...prev, x: prev.x + 1 }));
        setCurrentPiece(rotatedPiece);
      }
    }
  }, [currentPiece, position, grid, isGameOver, isPaused, isVictory, isValidMove]);

  const movePiece = useCallback((dx: number, dy: number) => {
    if (!currentPiece || isGameOver || isPaused || isVictory) return false;

    const newPos = { x: position.x + dx, y: position.y + dy };
    if (isValidMove(currentPiece, newPos, grid)) {
      setPosition(newPos);
      return true;
    }

    if (dy > 0) {
      const newGrid = [...grid.map(row => [...row])];
      currentPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell) {
            const gridX = position.x + x;
            const gridY = position.y + y;
            if (gridY >= 0) {
              newGrid[gridY][gridX] = currentPiece.type;
            }
          }
        });
      });

      const clearedGrid = clearLines(newGrid);
      setGrid(clearedGrid);

      const nextPos = { x: Math.floor(COLS / 2) - 1, y: 0 };
      if (!isValidMove(nextPiece, nextPos, clearedGrid)) {
        setIsGameOver(true);
        audioService.playGameOver();
        if (score > highScore) {
          setHighScore(score);
          localStorage.setItem('prime-tetris-highscore', score.toString());
        }
      } else {
        if (!isVictory && !isGameOver) {
          setCurrentPiece(nextPiece);
          setPosition(nextPos);
          setNextPiece(getRandomPiece());
        }
      }
      return false;
    }
    return false;
  }, [currentPiece, position, grid, isGameOver, isPaused, isVictory, isValidMove, nextPiece, clearLines, score, highScore]);

  const hardDrop = useCallback(() => {
    if (!currentPiece || isGameOver || isPaused || isVictory) return;
    let dy = 0;
    while (isValidMove(currentPiece, { x: position.x, y: position.y + dy + 1 }, grid)) {
      dy++;
    }
    movePiece(0, dy);
    movePiece(0, 1); // Trigger landing
  }, [currentPiece, position, grid, isGameOver, isPaused, isVictory, isValidMove, movePiece]);

  useEffect(() => {
    if (isGameOver || isPaused || isVictory) return;

    const dropSpeed = Math.max(100, 800 - (level - 1) * 100);
    timerRef.current = setInterval(() => {
      movePiece(0, 1);
    }, dropSpeed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isGameOver, isPaused, isVictory, level, movePiece]);

  const ghostPosition = (() => {
    if (!currentPiece) return null;
    let dy = 0;
    while (isValidMove(currentPiece, { x: position.x, y: position.y + dy + 1 }, grid)) {
      dy++;
    }
    return { x: position.x, y: position.y + dy };
  })();

  const puzzleProgress = (() => {
    if (gameMode !== 'puzzle') return 0;
    let count = 0;
    for (let y = 0; y < ROWS; y++) {
      if (grid[y].every(cell => cell !== null)) {
        count++;
      }
    }
    return count;
  })();

  return {
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
    gameMode,
    isVictory,
    highScore,
    puzzleProgress,
    movePiece: (dx: number, dy: number) => movePiece(dx, dy),
    rotatePiece,
    hardDrop,
    setIsPaused: (p: boolean) => setIsPaused(p),
    resetGame,
  };
}
