import React from 'react';
import { COLS, ROWS, PIECES } from '../constants';
import { Piece, Position } from '../types/tetris';

interface TetrisBoardProps {
  grid: (string | null)[][];
  currentPiece: Piece | null;
  position: Position;
  backgroundImage: string | null;
}

export const TetrisBoard: React.FC<TetrisBoardProps> = ({
  grid,
  currentPiece,
  position,
  backgroundImage,
}) => {
  // We use a container that occupies space reliably
  return (
    <div className="relative flex-1 flex items-center justify-center w-full min-h-0">
      {/* The Board Grid */}
      <div 
        className="relative bg-black/40 border-2 border-yellow-900/40 rounded-lg overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.9)]"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
          width: 'min(98vw, calc((100vh - 240px) * 0.55))',
          height: 'auto',
          aspectRatio: `${COLS}/${ROWS}`,
        }}
      >
        {grid.map((row, y) =>
          row.map((cell, x) => {
            let isCurrentPiece = false;
            let pieceType = cell;

            if (currentPiece) {
              const localX = x - position.x;
              const localY = y - position.y;
              if (
                localX >= 0 &&
                localX < currentPiece.shape[0].length &&
                localY >= 0 &&
                localY < currentPiece.shape.length &&
                currentPiece.shape[localY][localX]
              ) {
                isCurrentPiece = true;
                pieceType = currentPiece.type;
              }
            }

            return (
              <div
                key={`${x}-${y}`}
                className="relative w-full h-full p-[0.3px]"
              >
                <div className={`w-full h-full rounded-[0.5px] overflow-hidden ${isCurrentPiece ? 'shadow-[0_0_12px_rgba(255,215,0,0.7)] z-20 relative scale-x-[1.02] scale-y-[1.02]' : 'z-10'}`}>
                  {isCurrentPiece ? (
                    <div className="w-full h-full bg-gradient-to-br from-yellow-100 via-yellow-400 to-yellow-800 border-[0.3px] border-white/60 shine-effect" />
                  ) : pieceType ? (
                    <div className="w-full h-full relative">
                      <div 
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `url(${backgroundImage})`,
                          backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
                          backgroundPosition: `${(x / (COLS - 1)) * 100}% ${(y / (ROWS - 1)) * 100}%`,
                          backgroundRepeat: 'no-repeat',
                          filter: 'sepia(0.5) saturate(2) contrast(1.2) brightness(1.1)'
                        }}
                      />
                      <div className="absolute inset-0 bg-yellow-900/10 mix-blend-overlay" />
                      <div className="absolute inset-0 border-[0.2px] border-black/40" />
                    </div>
                  ) : (
                    <div className="w-full h-full border-[0.1px] border-white/[0.05]" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
