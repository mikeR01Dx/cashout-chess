'use client';

import { useState, useEffect } from 'react';
import GameLobby from '@/components/GameLobby';
import ChessBoard from '@/components/ChessBoard';
import { GameRoom, Player } from '@/types/game';

export default function Home() {
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Test API connection
    fetch('/api/socket')
      .then(() => {
        console.log('Connected to server');
        setIsConnected(true);
      })
      .catch(() => {
        console.log('Failed to connect to server');
        setIsConnected(false);
      });
  }, []);

  const handleRoomCreated = (room: GameRoom, player: Player) => {
    setCurrentRoom(room);
    setCurrentPlayer(player);
  };

  const handleRoomJoined = (room: GameRoom, player: Player) => {
    setCurrentRoom(room);
    setCurrentPlayer(player);
  };

  const handleMoveMade = (gameState: GameRoom['gameState'], currentPlayer: 'white' | 'black') => {
    if (currentRoom) {
      setCurrentRoom(prev => prev ? { ...prev, gameState, currentPlayer } : null);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Connecting to server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {!currentRoom ? (
        <GameLobby 
          onRoomCreated={handleRoomCreated}
          onRoomJoined={handleRoomJoined}
        />
      ) : (
        <ChessBoard 
          room={currentRoom} 
          currentPlayer={currentPlayer}
          onMoveMade={handleMoveMade}
        />
      )}
    </div>
  );
}
