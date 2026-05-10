import { useState, useEffect, useCallback, useRef } from 'react';
import { COLS, ROWS, PIECES, INITIAL_LEVEL, LINES_PER_LEVEL, SCORE_PER_LINE } from '../constants';
import { GameState, Position, Piece, PieceType } from '../types/tetris';

const createEmptyGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(null));

const getRandomPiece = (): Piece => {
  const types: PieceType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  const type = types[Math.floor(Math.random() * types.length)];
  return PIECES[type];
};

export function useTetris() {
  const [grid, setGrid] = useState<(string | null)[][]>(createEmptyGrid());
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [nextPiece, setNextPiece] = useState<Piece>(getRandomPiece());
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(INITIAL_LEVEL);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('prime-tetris-highscore');
    return saved ? parseInt(saved, 10) : 0;
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetGame = useCallback(() => {
    setGrid(createEmptyGrid());
    setCurrentPiece(getRandomPiece());
    setPosition({ x: Math.floor(COLS / 2) - 1, y: 0 });
    setNextPiece(getRandomPiece());
    setScore(0);
    setLines(0);
    setLevel(INITIAL_LEVEL);
    setIsGameOver(false);
    setIsPaused(false);
  }, []);

  const clearLines = useCallback((currentGrid: (string | null)[][]) => {
    let linesCleared = 0;
    const newGrid = currentGrid.filter((row) => {
      const isFull = row.every((cell) => cell !== null);
      if (isFull) linesCleared++;
      return !isFull;
    });

    while (newGrid.length < ROWS) {
      newGrid.unshift(Array(COLS).fill(null));
    }

    if (linesCleared > 0) {
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
  }, [level]);

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
    if (!currentPiece || isGameOver || isPaused) return;

    const rotatedShape = currentPiece.shape[0].map((_, i) =>
      currentPiece.shape.map((row) => row[i]).reverse()
    );

    const rotatedPiece = { ...currentPiece, shape: rotatedShape };

    // Wall kick attempt
    if (isValidMove(rotatedPiece, position, grid)) {
      setCurrentPiece(rotatedPiece);
    } else {
      // Try pushing it left or right
      if (isValidMove(rotatedPiece, { ...position, x: position.x - 1 }, grid)) {
        setPosition(prev => ({ ...prev, x: prev.x - 1 }));
        setCurrentPiece(rotatedPiece);
      } else if (isValidMove(rotatedPiece, { ...position, x: position.x + 1 }, grid)) {
        setPosition(prev => ({ ...prev, x: prev.x + 1 }));
        setCurrentPiece(rotatedPiece);
      }
    }
  }, [currentPiece, position, grid, isGameOver, isPaused, isValidMove]);

  const movePiece = useCallback((dx: number, dy: number) => {
    if (!currentPiece || isGameOver || isPaused) return false;

    const newPos = { x: position.x + dx, y: position.y + dy };
    if (isValidMove(currentPiece, newPos, grid)) {
      setPosition(newPos);
      return true;
    }

    if (dy > 0) {
      // Piece landed
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

      // Spawn next piece
      const nextPos = { x: Math.floor(COLS / 2) - 1, y: 0 };
      if (!isValidMove(nextPiece, nextPos, clearedGrid)) {
        setIsGameOver(true);
        if (score > highScore) {
          setHighScore(score);
          localStorage.setItem('prime-tetris-highscore', score.toString());
        }
      } else {
        setCurrentPiece(nextPiece);
        setPosition(nextPos);
        setNextPiece(getRandomPiece());
      }
      return false;
    }
    return false;
  }, [currentPiece, position, grid, isGameOver, isPaused, isValidMove, nextPiece, clearLines, score, highScore]);

  const hardDrop = useCallback(() => {
    if (!currentPiece || isGameOver || isPaused) return;
    let dy = 0;
    while (isValidMove(currentPiece, { x: position.x, y: position.y + dy + 1 }, grid)) {
      dy++;
    }
    movePiece(0, dy);
    movePiece(0, 1); // Trigger landing
  }, [currentPiece, position, grid, isGameOver, isPaused, isValidMove, movePiece]);

  useEffect(() => {
    if (isGameOver || isPaused) return;

    const dropSpeed = Math.max(100, 800 - (level - 1) * 100);
    timerRef.current = setInterval(() => {
      movePiece(0, 1);
    }, dropSpeed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isGameOver, isPaused, level, movePiece]);

  return {
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
    movePiece: (dx: number, dy: number) => movePiece(dx, dy),
    rotatePiece,
    hardDrop,
    setIsPaused: (p: boolean) => setIsPaused(p),
    resetGame,
  };
}
