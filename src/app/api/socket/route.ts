import { NextRequest } from 'next/server';
import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

interface GameRoom {
  id: string;
  players: Player[];
  gameState: GameState;
  currentPlayer: 'white' | 'black';
  status: 'waiting' | 'playing' | 'finished';
}

interface Player {
  id: string;
  name: string;
  color: 'white' | 'black';
  socketId: string;
}

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

const rooms = new Map<string, GameRoom>();

export async function GET(req: NextRequest) {
  const { Server } = await import('socket.io');
  const { createServer } = await import('http');
  
  if (!global.io) {
    const httpServer = createServer();
    global.io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    global.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      socket.on('create-room', (data: { playerName: string }) => {
        const roomId = Math.random().toString(36).substr(2, 9);
        const player: Player = {
          id: socket.id,
          name: data.playerName,
          color: 'white',
          socketId: socket.id
        };

        const room: GameRoom = {
          id: roomId,
          players: [player],
          gameState: initializeGameState(),
          currentPlayer: 'white',
          status: 'waiting'
        };

        rooms.set(roomId, room);
        socket.join(roomId);
        socket.emit('room-created', { roomId, player });
        console.log(`Room created: ${roomId}`);
      });

      socket.on('join-room', (data: { roomId: string; playerName: string }) => {
        const room = rooms.get(data.roomId);
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        if (room.players.length >= 2) {
          socket.emit('error', { message: 'Room is full' });
          return;
        }

        const player: Player = {
          id: socket.id,
          name: data.playerName,
          color: 'black',
          socketId: socket.id
        };

        room.players.push(player);
        room.status = 'playing';
        socket.join(data.roomId);
        socket.emit('room-joined', { room, player });
        socket.to(data.roomId).emit('player-joined', { player, room });
        console.log(`Player joined room: ${data.roomId}`);
      });

      socket.on('make-move', (data: { roomId: string; from: string; to: string }) => {
        const room = rooms.get(data.roomId);
        if (!room || room.status !== 'playing') return;

        const player = room.players.find(p => p.socketId === socket.id);
        if (!player || player.color !== room.currentPlayer) return;

        // Basic move validation (simplified)
        const moveResult = validateMove(room.gameState, data.from, data.to, player.color);
        if (!moveResult.valid) {
          socket.emit('move-error', { message: moveResult.error });
          return;
        }

        // Update game state
        updateGameState(room.gameState, data.from, data.to);
        room.currentPlayer = room.currentPlayer === 'white' ? 'black' : 'white';

        // Broadcast move to all players in room
        global.io.to(data.roomId).emit('move-made', {
          from: data.from,
          to: data.to,
          gameState: room.gameState,
          currentPlayer: room.currentPlayer
        });
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Handle player disconnection
        rooms.forEach((room, roomId) => {
          const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
          if (playerIndex !== -1) {
            room.players.splice(playerIndex, 1);
            if (room.players.length === 0) {
              rooms.delete(roomId);
            } else {
              global.io.to(roomId).emit('player-left', { room });
            }
          }
        });
      });
    });
  }

  return new Response('Socket.IO server initialized', { status: 200 });
}

function initializeGameState(): GameState {
  const board: (Piece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Initialize pawns
  for (let i = 0; i < 8; i++) {
    board[1][i] = { type: 'pawn', color: 'black' };
    board[6][i] = { type: 'pawn', color: 'white' };
  }

  // Initialize other pieces
  const pieceOrder: Piece['type'][] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  
  for (let i = 0; i < 8; i++) {
    board[0][i] = { type: pieceOrder[i], color: 'black' };
    board[7][i] = { type: pieceOrder[i], color: 'white' };
  }

  return {
    board,
    capturedPieces: { white: [], black: [] }
  };
}

function validateMove(gameState: GameState, from: string, to: string, playerColor: 'white' | 'black'): { valid: boolean; error?: string } {
  // Simplified validation - in a real app, you'd implement full chess rules
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

function updateGameState(gameState: GameState, from: string, to: string) {
  const fromPos = parsePosition(from);
  const toPos = parsePosition(to);
  
  if (!fromPos || !toPos) return;

  const piece = gameState.board[fromPos.row][fromPos.col];
  if (piece) {
    // Handle captured piece
    const capturedPiece = gameState.board[toPos.row][toPos.col];
    if (capturedPiece) {
      gameState.capturedPieces[capturedPiece.color].push(capturedPiece);
    }

    // Move piece
    gameState.board[toPos.row][toPos.col] = piece;
    gameState.board[fromPos.row][fromPos.col] = null;
    
    // Update last move
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

declare global {
  var io: SocketIOServer | undefined;
}
