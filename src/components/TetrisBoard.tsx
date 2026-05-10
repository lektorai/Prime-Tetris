import React from 'react';
import { motion } from 'motion/react';
import { COLS, ROWS, PIECES } from '../constants';
import { Piece, Position } from '../types/tetris';

interface TetrisBoardProps {
  grid: (string | null)[][];
  currentPiece: Piece | null;
  position: Position;
  backgroundImage: string | null;
  theme?: string;
}

interface CellProps {
  x: number;
  y: number;
  pieceType: string | null;
  isCurrentPiece: boolean;
  isGhost: boolean;
  backgroundImage: string | null;
  theme?: string;
}

const Cell = React.memo<CellProps>(({ 
  x, y, pieceType, isCurrentPiece, isGhost, backgroundImage, theme 
}) => {
  const isNeon = theme === 'neon';
  const isClassic = theme === 'classic';

  if (!pieceType && !isGhost) {
    return <div className="relative border-[0.1px] border-white/5" />;
  }

  const pieceColor = isCurrentPiece ? '#FBBF24' : (PIECES[pieceType as any]?.color || '#333');
  
  return (
    <div className={`relative border-[1px] ${isNeon ? 'border-pink-500/10' : 'border-white/5'} overflow-hidden`}>
      <div
        className={`absolute inset-0 rounded-[1px] transition-all duration-150 ${
          isCurrentPiece ? 'z-20' : isGhost ? 'z-5 opacity-30' : 'z-10'
        }`}
        style={{
          backgroundColor: isGhost ? 'transparent' : (backgroundImage && !isCurrentPiece ? 'transparent' : pieceColor),
          border: isGhost ? `1px dashed ${pieceColor}` : 'none',
          boxShadow: isCurrentPiece 
            ? `inset 1px 1px 2px rgba(255,255,255,0.4), inset -1px -1px 2px rgba(0,0,0,0.3), 0 0 10px ${pieceColor}`
            : !isGhost && !backgroundImage 
              ? `inset 1px 1px 2px rgba(255,255,255,0.2), inset -1px -1px 2px rgba(0,0,0,0.3)`
              : 'none',
        }}
      >
        {backgroundImage && !isCurrentPiece && !isGhost && (
          <div 
            className="absolute inset-0 bg-cover bg-no-repeat"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
              backgroundPosition: `${(x / (COLS - 1)) * 100}% ${(y / (ROWS - 1)) * 100}%`,
              filter: 'brightness(1.1) contrast(1.1)'
            }}
          />
        )}
        {/* Neon Effect Overlay */}
        {isNeon && !isGhost && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
        )}
      </div>
    </div>
  );
});

export const TetrisBoard: React.FC<TetrisBoardProps & { ghostPosition: Position | null; isShaking?: boolean }> = ({
  grid,
  currentPiece,
  position,
  ghostPosition,
  backgroundImage,
  theme,
  isShaking,
}) => {
  const cells = React.useMemo(() => {
    const result = [];
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        let pieceType = grid[y][x];
        let isCurrentPiece = false;
        let isGhost = false;

        if (currentPiece) {
          // Check current piece
          const localX = x - position.x;
          const localY = y - position.y;
          if (
            localX >= 0 && localX < currentPiece.shape[0].length &&
            localY >= 0 && localY < currentPiece.shape.length &&
            currentPiece.shape[localY][localX]
          ) {
            isCurrentPiece = true;
            pieceType = currentPiece.type;
          }

          // Check ghost piece
          if (!isCurrentPiece && ghostPosition) {
            const gx = x - ghostPosition.x;
            const gy = y - ghostPosition.y;
            if (
              gx >= 0 && gx < currentPiece.shape[0].length &&
              gy >= 0 && gy < currentPiece.shape.length &&
              currentPiece.shape[gy][gx]
            ) {
              isGhost = true;
              pieceType = currentPiece.type;
            }
          }
        }

        result.push(
          <Cell
            key={`${x}-${y}`}
            x={x}
            y={y}
            pieceType={pieceType}
            isCurrentPiece={isCurrentPiece}
            isGhost={isGhost}
            backgroundImage={backgroundImage}
            theme={theme}
          />
        );
      }
    }
    return result;
  }, [grid, currentPiece, position, ghostPosition, backgroundImage, theme]);

  return (
    <div className="relative flex-1 flex items-center justify-center w-full min-h-0 py-2">
      <motion.div 
        animate={isShaking ? {
          x: [0, -4, 4, -4, 4, 0],
          y: [0, 2, -2, 2, -2, 0]
        } : {}}
        transition={{ duration: 0.2 }}
        className={`relative bg-black border-2 rounded-lg overflow-hidden transition-all duration-500 ${
          theme === 'neon' ? 'border-pink-500/50 shadow-[0_0_50px_rgba(236,72,153,0.15)]' : 'border-white/10 shadow-2xl'
        }`}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
          width: 'min(92vw, calc((100dvh - 240px) * 0.5))',
          height: 'auto',
          aspectRatio: `${COLS}/${ROWS}`,
          maxHeight: '100%',
        }}
      >
        {cells}
      </motion.div>
    </div>
  );
};
