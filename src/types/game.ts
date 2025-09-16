export interface GameRoom {
  id: string;
  players: Player[];
  gameState: GameState;
  currentPlayer: 'white' | 'black';
  status: 'waiting' | 'playing' | 'finished';
}

export interface Player {
  id: string;
  name: string;
  color: 'white' | 'black';
  socketId: string;
}

export interface GameState {
  board: (Piece | null)[][];
  capturedPieces: {
    white: Piece[];
    black: Piece[];
  };
  lastMove?: {
    from: string;
    to: string;
    piece: Piece;
  };
}

export interface Piece {
  type: 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
  color: 'white' | 'black';
  hasMoved?: boolean;
}

export interface Move {
  from: string;
  to: string;
  piece: Piece;
}
