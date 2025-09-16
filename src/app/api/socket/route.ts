import { NextRequest, NextResponse } from 'next/server';

interface GameState {
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

interface Piece {
  type: 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
  color: 'white' | 'black';
  hasMoved?: boolean;
}

interface Room {
  id: string;
  players: Player[];
  gameState: GameState;
  currentPlayer: 'white' | 'black';
  status: 'waiting' | 'playing' | 'finished';
  createdAt: number;
}

interface Player {
  id: string;
  name: string;
  color: 'white' | 'black';
}

// Simple in-memory storage for demo purposes
// In production, you'd use a database like Redis or MongoDB
const rooms = new Map<string, Room>();

export async function GET() {
  return NextResponse.json({ 
    message: 'Chess API is running',
    rooms: Array.from(rooms.keys())
  });
}

export async function POST(req: NextRequest) {
  try {
    const { action, data } = await req.json();
    
    switch (action) {
      case 'create-room':
        const roomId = Math.random().toString(36).substr(2, 9);
        const room: Room = {
          id: roomId,
          players: [{
            id: data.playerId || Math.random().toString(36).substr(2, 9),
            name: data.playerName,
            color: 'white' as const
          }],
          gameState: initializeGameState(),
          currentPlayer: 'white' as const,
          status: 'waiting' as const,
          createdAt: Date.now()
        };
        rooms.set(roomId, room);
        return NextResponse.json({ success: true, room });

      case 'join-room':
        const existingRoom = rooms.get(data.roomId);
        if (!existingRoom) {
          return NextResponse.json({ success: false, error: 'Room not found' });
        }
        if (existingRoom.players.length >= 2) {
          return NextResponse.json({ success: false, error: 'Room is full' });
        }
        
        const newPlayer: Player = {
          id: data.playerId || Math.random().toString(36).substr(2, 9),
          name: data.playerName,
          color: 'black' as const
        };
        existingRoom.players.push(newPlayer);
        existingRoom.status = 'playing' as const;
        rooms.set(data.roomId, existingRoom);
        return NextResponse.json({ success: true, room: existingRoom });

      case 'make-move':
        const gameRoom = rooms.get(data.roomId);
        if (!gameRoom) {
          return NextResponse.json({ success: false, error: 'Room not found' });
        }
        
        // Simple move validation
        const moveResult = validateMove(gameRoom.gameState, data.from, data.to, data.playerColor);
        if (!moveResult.valid) {
          return NextResponse.json({ success: false, error: moveResult.error });
        }
        
        // Update game state
        updateGameState(gameRoom.gameState, data.from, data.to);
        gameRoom.currentPlayer = gameRoom.currentPlayer === 'white' ? 'black' : 'white';
        rooms.set(data.roomId, gameRoom);
        
        return NextResponse.json({ 
          success: true, 
          gameState: gameRoom.gameState,
          currentPlayer: gameRoom.currentPlayer
        });

      case 'get-room':
        const roomData = rooms.get(data.roomId);
        if (!roomData) {
          return NextResponse.json({ success: false, error: 'Room not found' });
        }
        return NextResponse.json({ success: true, room: roomData });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' });
    }
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' });
  }
}

function initializeGameState() {
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Initialize pawns
  for (let i = 0; i < 8; i++) {
    board[1][i] = { type: 'pawn', color: 'black' };
    board[6][i] = { type: 'pawn', color: 'white' };
  }

  // Initialize other pieces
  const pieceOrder = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  
  for (let i = 0; i < 8; i++) {
    board[0][i] = { type: pieceOrder[i], color: 'black' };
    board[7][i] = { type: pieceOrder[i], color: 'white' };
  }

  return {
    board,
    capturedPieces: { white: [], black: [] }
  };
}

function validateMove(gameState: GameState, from: string, to: string, playerColor: string): { valid: boolean; error?: string } {
  const fromPos = parsePosition(from);
  const toPos = parsePosition(to);
  
  if (!fromPos || !toPos) {
    return { valid: false, error: 'Invalid position' };
  }

  const piece = gameState.board[fromPos.row][fromPos.col];
  if (!piece || piece.color !== playerColor) {
    return { valid: false, error: 'Invalid piece' };
  }

  return { valid: true };
}

function updateGameState(gameState: GameState, from: string, to: string): void {
  const fromPos = parsePosition(from);
  const toPos = parsePosition(to);
  
  if (!fromPos || !toPos) return;

  const piece = gameState.board[fromPos.row][fromPos.col];
  if (piece) {
    const capturedPiece = gameState.board[toPos.row][toPos.col];
    if (capturedPiece) {
      gameState.capturedPieces[capturedPiece.color].push(capturedPiece);
    }

    gameState.board[toPos.row][toPos.col] = piece;
    gameState.board[fromPos.row][fromPos.col] = null;
    gameState.lastMove = { from, to, piece };
  }
}

function parsePosition(pos: string): { row: number; col: number } | null {
  if (pos.length !== 2) return null;
  const col = pos.charCodeAt(0) - 'a'.charCodeAt(0);
  const row = 8 - parseInt(pos[1]);
  if (col < 0 || col > 7 || row < 0 || row > 7) return null;
  return { row, col };
}
