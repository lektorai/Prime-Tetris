import React, { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, RotateCw, ChevronDown, ChevronsDown } from 'lucide-react';
import { Theme } from '../types/tetris';

interface ControlsProps {
  onMove: (dx: number, dy: number) => void;
  onRotate: () => void;
  onHardDrop: () => void;
  theme: Theme;
}

export const Controls: React.FC<ControlsProps> = ({ onMove, onRotate, onHardDrop, theme }) => {
  const isClassic = theme === 'classic';
  const isLight = theme === 'light';
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startRepeating = (action: () => void) => {
    if (intervalRef.current || timeoutRef.current) return;
    action();
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(action, 60); // Faster repeat
    }, 180);
  };

  const stopRepeating = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    return stopRepeating;
  }, []);

  const getBtnStyle = (primary = false) => {
    if (isClassic) return `bg-[#9bbc0f] border-2 border-[#0f380f] shadow-[2px_2px_0px_#0f380f] rounded-lg active:shadow-none active:translate-x-[1px] active:translate-y-[1px]`;
    if (isLight) return `bg-white border ${primary ? 'border-yellow-500 shadow-yellow-500/10' : 'border-gray-200'} shadow-md rounded-2xl active:bg-gray-100`;
    return `bg-[#1a1a1a] border ${primary ? 'border-yellow-500/50' : 'border-white/10'} shadow-xl rounded-2xl active:bg-white/5`;
  };

  const getLabelColor = (primary = false) => {
    if (isClassic) return "text-[#0f380f]";
    if (primary) return "text-yellow-500";
    if (isLight) return "text-gray-900 font-bold";
    return "text-white/80";
  };

  return (
    <div className="w-full flex items-center justify-between px-6 mb-8 max-w-md mx-auto">
      {/* Navigation Group (Left) */}
      <div className="flex gap-2">
        <button 
          onPointerDown={(e) => { e.preventDefault(); startRepeating(() => onMove(-1, 0)); }}
          onPointerUp={stopRepeating}
          onPointerCancel={stopRepeating}
          onPointerLeave={stopRepeating}
          className={`w-16 h-16 flex items-center justify-center ${getBtnStyle()}`}
        >
          <div className={getLabelColor()}><ChevronLeft size={32} /></div>
        </button>

        <button 
          onPointerDown={(e) => { e.preventDefault(); startRepeating(() => onMove(0, 1)); }}
          onPointerUp={stopRepeating}
          onPointerCancel={stopRepeating}
          onPointerLeave={stopRepeating}
          className={`w-16 h-16 flex items-center justify-center ${getBtnStyle()}`}
        >
          <div className={getLabelColor()}><ChevronDown size={32} /></div>
        </button>

        <button 
          onPointerDown={(e) => { e.preventDefault(); startRepeating(() => onMove(1, 0)); }}
          onPointerUp={stopRepeating}
          onPointerCancel={stopRepeating}
          onPointerLeave={stopRepeating}
          className={`w-16 h-16 flex items-center justify-center ${getBtnStyle()}`}
        >
          <div className={getLabelColor()}><ChevronRight size={32} /></div>
        </button>
      </div>

      {/* Action Group (Right) */}
      <div className="flex">
        <button 
          onPointerDown={(e) => { e.preventDefault(); onRotate(); }}
          className={`w-20 h-20 flex items-center justify-center ${getBtnStyle(true)}`}
        >
          <div className={isClassic ? 'text-[#0f380f]' : 'text-yellow-500'}>
            <RotateCw size={40} />
          </div>
        </button>
      </div>
    </div>
  );
};
