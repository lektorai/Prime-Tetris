export type PieceType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';
export type GameMode = 'standard' | 'puzzle';
export type Language = 'ru' | 'en';
export type Theme = 'dark' | 'light' | 'neon' | 'classic';

export interface Piece {
  type: PieceType;
  shape: number[][];
  color: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  grid: (string | null)[][];
  currentPiece: Piece | null;
  position: Position;
  nextPiece: Piece;
  score: number;
  lines: number;
  level: number;
  isGameOver: boolean;
  isPaused: boolean;
  gameMode: GameMode;
}
