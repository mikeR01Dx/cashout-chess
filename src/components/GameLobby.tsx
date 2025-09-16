'use client';

import { useState } from 'react';
import { Plus, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { GameRoom, Player } from '@/types/game';

interface GameLobbyProps {
  onRoomCreated: (room: GameRoom, player: Player) => void;
  onRoomJoined: (room: GameRoom, player: Player) => void;
}

export default function GameLobby({ onRoomCreated, onRoomJoined }: GameLobbyProps) {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCreateRoom = async () => {
    if (!playerName.trim()) return;
    
    setError('');
    setSuccess('');
    setIsCreating(true);
    
    try {
      const response = await fetch('/api/socket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-room',
          data: { playerName: playerName.trim() }
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSuccess('Room created successfully!');
        onRoomCreated(result.room, result.room.players[0]);
      } else {
        setError(result.error || 'Failed to create room');
      }
    } catch {
      setError('Failed to connect to server');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim() || !roomId.trim()) return;
    
    setError('');
    setSuccess('');
    setIsJoining(true);
    
    try {
      const response = await fetch('/api/socket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join-room',
          data: { 
            roomId: roomId.trim(), 
            playerName: playerName.trim() 
          }
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSuccess('Joined room successfully!');
        onRoomJoined(result.room, result.room.players[result.room.players.length - 1]);
      } else {
        setError(result.error || 'Failed to join room');
      }
    } catch {
      setError('Failed to connect to server');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Cashout Chess</h1>
          <p className="text-gray-600">Play chess with friends online</p>
        </div>

        <div className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-green-700 text-sm">{success}</span>
            </div>
          )}

          <div>
            <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your name"
              maxLength={20}
            />
          </div>

          <div className="space-y-4">
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Create New Game
              </h3>
              <button
                onClick={handleCreateRoom}
                disabled={!playerName.trim() || isCreating}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  'Create Room'
                )}
              </button>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <UserPlus className="w-5 h-5 mr-2" />
                Join Existing Game
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter room ID"
                  maxLength={9}
                />
                <button
                  onClick={handleJoinRoom}
                  disabled={!playerName.trim() || !roomId.trim() || isJoining}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isJoining ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Joining...
                    </>
                  ) : (
                    'Join Room'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Share the room ID with your friend to play together!</p>
        </div>
      </div>
    </div>
  );
}
