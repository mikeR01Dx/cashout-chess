'use client';

import { useState, useEffect } from 'react';
import { GameRoom, Player, Piece } from '@/types/game';
import { Crown, Shield, Sword, Zap, Star, Circle } from 'lucide-react';

interface ChessBoardProps {
  room: GameRoom;
  currentPlayer: Player | null;
  onMoveMade: (gameState: GameRoom['gameState'], currentPlayer: 'white' | 'black') => void;
}

const pieceIcons = {
  white: {
    king: <Crown className="w-6 h-6 text-white" />,
    queen: <Star className="w-6 h-6 text-white" />,
    rook: <Shield className="w-6 h-6 text-white" />,
    bishop: <Zap className="w-6 h-6 text-white" />,
    knight: <Sword className="w-6 h-6 text-white" />,
    pawn: <Circle className="w-5 h-5 text-white" />
  },
  black: {
    king: <Crown className="w-6 h-6 text-gray-800" />,
    queen: <Star className="w-6 h-6 text-gray-800" />,
    rook: <Shield className="w-6 h-6 text-gray-800" />,
    bishop: <Zap className="w-6 h-6 text-gray-800" />,
    knight: <Sword className="w-6 h-6 text-gray-800" />,
    pawn: <Circle className="w-5 h-5 text-gray-800" />
  }
};

export default function ChessBoard({ room, currentPlayer, onMoveMade }: ChessBoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [gameState, setGameState] = useState(room.gameState);

  const isMyTurn = currentPlayer?.color === room.currentPlayer;
  const opponent = room.players.find(p => p.id !== currentPlayer?.id);

  // Poll for game updates
  useEffect(() => {
    const pollGameState = async () => {
      try {
        const response = await fetch('/api/socket', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'get-room',
            data: { roomId: room.id }
          })
        });
        
        const result = await response.json();
        if (result.success && result.room) {
          setGameState(result.room.gameState);
          onMoveMade(result.room.gameState, result.room.currentPlayer);
        }
      } catch (err) {
        console.error('Failed to poll game state:', err);
      }
    };

    const interval = setInterval(pollGameState, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);
  }, [room.id, onMoveMade]);

  const handleSquareClick = async (position: string) => {
    if (!isMyTurn) return;

    const [col, row] = position.split('');
    const piece = gameState.board[8 - parseInt(row)][col.charCodeAt(0) - 'a'.charCodeAt(0)];

    if (selectedSquare) {
      if (selectedSquare === position) {
        setSelectedSquare(null);
        setPossibleMoves([]);
        return;
      }

      // Try to make a move
      try {
        const response = await fetch('/api/socket', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'make-move',
            data: {
              roomId: room.id,
              from: selectedSquare,
              to: position,
              playerColor: currentPlayer?.color
            }
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          setGameState(result.gameState);
          onMoveMade(result.gameState, result.currentPlayer);
        } else {
          console.error('Move failed:', result.error);
        }
      } catch (err) {
        console.error('Failed to make move:', err);
      }

      setSelectedSquare(null);
      setPossibleMoves([]);
    } else if (piece && piece.color === currentPlayer?.color) {
      setSelectedSquare(position);
      // In a real implementation, you'd calculate possible moves here
      setPossibleMoves([]);
    }
  };

  const getSquareColor = (row: number, col: number) => {
    return (row + col) % 2 === 0 ? 'bg-amber-100' : 'bg-amber-800';
  };

  const getPositionString = (row: number, col: number) => {
    return String.fromCharCode('a'.charCodeAt(0) + col) + (8 - row);
  };

  const renderPiece = (piece: Piece | null) => {
    if (!piece) return null;
    return pieceIcons[piece.color][piece.type];
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Room: {room.id}</h1>
              <p className="text-gray-600">
                {room.status === 'waiting' ? 'Waiting for opponent...' : 
                 room.status === 'playing' ? 'Game in progress' : 'Game finished'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Current turn:</p>
              <p className={`font-semibold ${room.currentPlayer === 'white' ? 'text-gray-800' : 'text-gray-600'}`}>
                {room.currentPlayer === 'white' ? 'White' : 'Black'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Chess Board */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="grid grid-cols-8 gap-0 w-fit mx-auto border-2 border-gray-800">
                {gameState.board.map((row, rowIndex) =>
                  row.map((piece, colIndex) => {
                    const position = getPositionString(rowIndex, colIndex);
                    const isSelected = selectedSquare === position;
                    const isPossibleMove = possibleMoves.includes(position);
                    
                    return (
                      <div
                        key={position}
                        className={`
                          w-16 h-16 flex items-center justify-center cursor-pointer relative
                          ${getSquareColor(rowIndex, colIndex)}
                          ${isSelected ? 'ring-4 ring-blue-500' : ''}
                          ${isPossibleMove ? 'ring-2 ring-green-500' : ''}
                          ${!isMyTurn ? 'cursor-not-allowed' : ''}
                        `}
                        onClick={() => handleSquareClick(position)}
                      >
                        {renderPiece(piece)}
                        <div className="absolute bottom-1 right-1 text-xs text-gray-600">
                          {position}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Game Info Sidebar */}
          <div className="w-full lg:w-80 space-y-4">
            {/* Players */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Players</h3>
              <div className="space-y-2">
                {room.players.map((player) => (
                  <div
                    key={player.id}
                    className={`p-3 rounded-md ${
                      player.id === currentPlayer?.id 
                        ? 'bg-blue-100 border-2 border-blue-300' 
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{player.name}</span>
                      <div className={`px-2 py-1 rounded text-xs font-semibold ${
                        player.color === 'white' 
                          ? 'bg-gray-200 text-gray-800' 
                          : 'bg-gray-800 text-white'
                      }`}>
                        {player.color}
                      </div>
                    </div>
                    {player.id === currentPlayer?.id && (
                      <p className="text-xs text-blue-600 mt-1">(You)</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Captured Pieces */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Captured Pieces</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-2">White captured:</p>
                  <div className="flex flex-wrap gap-1">
                    {gameState.capturedPieces.white.map((piece, index) => (
                      <div key={index} className="p-1 bg-gray-100 rounded">
                        {renderPiece(piece)}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Black captured:</p>
                  <div className="flex flex-wrap gap-1">
                    {gameState.capturedPieces.black.map((piece, index) => (
                      <div key={index} className="p-1 bg-gray-100 rounded">
                        {renderPiece(piece)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Game Status */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Game Status</h3>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Status:</span> {room.status}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Current turn:</span> {room.currentPlayer}
                </p>
                {!isMyTurn && (
                  <p className="text-sm text-orange-600">
                    Waiting for {opponent?.name || 'opponent'} to move...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
