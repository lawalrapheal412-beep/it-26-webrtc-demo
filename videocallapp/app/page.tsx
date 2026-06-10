'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generateRoomCode, copyToClipboard } from '@/lib/utils';

export default function Home() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [joinInput, setJoinInput] = useState('');

  const handleCreateMeeting = async () => {
    try {
      const response = await fetch('/api/meetings', { method: 'POST' });
      const contentType = response.headers.get('content-type') || '';
      const text = await response.text();
      console.log('DEBUG /api/meetings response', response.status, contentType, text);
      let data;
      if (contentType.includes('application/json')) {
        data = JSON.parse(text);
      } else {
        throw new Error(`Expected JSON from /api/meetings but got ${contentType}`);
      }

      if (data.success) {
        setRoomCode(data.meeting.roomCode);
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
    }
  };

  const handleCopyCode = async () => {
    if (roomCode) {
      const copied = await copyToClipboard(roomCode);
      if (copied) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleJoinMeeting = () => {
    if (joinInput.trim()) {
      router.push(`/meeting/${joinInput.toUpperCase()}`);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Video Call App</h1>
          <p className="text-gray-400">Connect with anyone, anywhere</p>
        </div>

        {/* Create Meeting Section */}
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">Start a Meeting</h2>

          {!roomCode ? (
            <button
              onClick={handleCreateMeeting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Create New Meeting
            </button>
          ) : (
            <div className="space-y-3">
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">Room Code</p>
                <p className="text-white text-2xl font-mono font-bold">{roomCode}</p>
              </div>

              <button
                onClick={handleCopyCode}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                {copied ? '✓ Copied!' : 'Copy Code'}
              </button>

              <button
                onClick={() => router.push(`/meeting/${roomCode}`)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Join Meeting
              </button>

              <button
                onClick={() => setRoomCode('')}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Create Another
              </button>
            </div>
          )}
        </div>

        {/* Join Meeting Section */}
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">Join a Meeting</h2>

          <div className="space-y-2">
            <input
              type="text"
              placeholder="Enter room code"
              value={joinInput}
              onChange={(e) => setJoinInput(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handleJoinMeeting()}
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />

            <button
              onClick={handleJoinMeeting}
              disabled={!joinInput.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Join Meeting
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
