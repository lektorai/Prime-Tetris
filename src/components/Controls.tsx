import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, RotateCw, ChevronDown, ChevronsDown } from 'lucide-react';

interface ControlsProps {
  onMove: (dx: number, dy: number) => void;
  onRotate: () => void;
  onHardDrop: () => void;
}

export const Controls: React.FC<ControlsProps> = ({ onMove, onRotate, onHardDrop }) => {
  const btnBase = "relative group flex items-center justify-center transition-all active:scale-95 touch-manipulation";
  const glassEffect = "absolute inset-0 bg-[#1a1a1a] rounded-2xl border border-yellow-500/20 shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] group-active:bg-yellow-500/10";
  const goldLabel = "relative z-10 text-yellow-500/80 group-active:text-yellow-400 group-hover:text-yellow-400 transition-colors";
  
  return (
    <div className="w-full flex items-center justify-center gap-2 px-4">
      {/* Move Left */}
      <button 
        onClick={() => onMove(-1, 0)}
        className={`${btnBase} w-16 h-16`}
        aria-label="Move Left"
      >
        <div className={glassEffect} />
        <div className={goldLabel}><ChevronLeft size={32} /></div>
      </button>

      {/* Move Down */}
      <button 
        onClick={() => onMove(0, 1)}
        className={`${btnBase} w-16 h-16`}
        aria-label="Move Down"
      >
        <div className={glassEffect} />
        <div className={goldLabel}><ChevronDown size={32} /></div>
      </button>

      <button 
        onClick={() => onRotate()}
        className={`${btnBase} w-16 h-16 shadow-[0_0_20px_rgba(255,215,0,0.2)]`}
        aria-label="Rotate"
      >
        <div className={`${glassEffect} border-yellow-500`} />
        <div className={`${goldLabel} text-yellow-500`}><RotateCw size={32} /></div>
      </button>

      {/* Move Right */}
      <button 
        onClick={() => onMove(1, 0)}
        className={`${btnBase} w-16 h-16`}
        aria-label="Move Right"
      >
        <div className={glassEffect} />
        <div className={goldLabel}><ChevronRight size={32} /></div>
      </button>
    </div>
  );
};
