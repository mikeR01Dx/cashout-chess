'use client';

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import GameLobby from '@/components/GameLobby';
import ChessBoard from '@/components/ChessBoard';
import { GameRoom, Player } from '@/types/game';

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:3000', {
      path: '/api/socket'
    });
    
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('room-created', (data: { roomId: string; player: Player }) => {
      setCurrentPlayer(data.player);
      // Create a temporary room object for the creator
      const tempRoom: GameRoom = {
        id: data.roomId,
        players: [data.player],
        gameState: {
          board: Array(8).fill(null).map(() => Array(8).fill(null)),
          capturedPieces: { white: [], black: [] }
        },
        currentPlayer: 'white',
        status: 'waiting'
      };
      setCurrentRoom(tempRoom);
    });

    newSocket.on('room-joined', (data: { room: GameRoom; player: Player }) => {
      setCurrentRoom(data.room);
      setCurrentPlayer(data.player);
    });

    newSocket.on('player-joined', (data: { player: Player; room: GameRoom }) => {
      setCurrentRoom(data.room);
    });

    newSocket.on('move-made', (data: { from: string; to: string; gameState: any; currentPlayer: string }) => {
      if (currentRoom) {
        setCurrentRoom(prev => prev ? { ...prev, gameState: data.gameState, currentPlayer: data.currentPlayer as 'white' | 'black' } : null);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

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
        <GameLobby socket={socket} />
      ) : (
        <ChessBoard 
          socket={socket} 
          room={currentRoom} 
          currentPlayer={currentPlayer}
        />
      )}
    </div>
  );
}
