'use client';

import { useParams, useRouter } from 'next/navigation';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useEffect, useRef } from 'react';
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, Copy, CheckCircle
} from 'lucide-react';
import { useState } from 'react';

function VideoTile({
  stream,
  label,
  muted = false,
  isVideoOff = false,
}: {
  stream: MediaStream | null;
  label: string;
  muted?: boolean;
  isVideoOff?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative w-full h-full bg-slate-800 rounded-2xl overflow-hidden flex items-center justify-center">
      {isVideoOff || !stream ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-slate-600 flex items-center justify-center text-3xl font-bold text-white">
            {label.charAt(0).toUpperCase()}
          </div>
          <span className="text-slate-400 text-sm">Camera off</span>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          className="w-full h-full object-cover"
        />
      )}
      <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-white text-xs font-medium">
        {label}
      </div>
    </div>
  );
}

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const [copied, setCopied] = useState(false);

  const {
    localStream,
    remoteStream,
    connected,
    isMuted,
    isVideoOff,
    toggleAudio,
    toggleVideo,
  } = useWebRTC(roomId);

  const handleCopy = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = () => {
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
          <span className="text-slate-300 text-sm">
            {connected ? 'Connected' : 'Waiting for someone to join...'}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-2 rounded-lg transition"
        >
          {copied ? <CheckCircle size={14} className="text-green-400" /> : <Copy size={14} />}
          {copied ? 'Copied!' : `Room: ${roomId}`}
        </button>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <VideoTile
          stream={localStream}
          label="You"
          muted={true}
          isVideoOff={isVideoOff}
        />
        <VideoTile
          stream={remoteStream}
          label="Guest"
          isVideoOff={false}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 py-6 border-t border-slate-800">
        <button
          onClick={toggleAudio}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition active:scale-95 ${
            isMuted
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-slate-700 hover:bg-slate-600'
          }`}
        >
          {isMuted ? <MicOff size={22} className="text-white" /> : <Mic size={22} className="text-white" />}
        </button>

        <button
          onClick={handleLeave}
          className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition active:scale-95"
        >
          <PhoneOff size={24} className="text-white" />
        </button>

        <button
          onClick={toggleVideo}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition active:scale-95 ${
            isVideoOff
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-slate-700 hover:bg-slate-600'
          }`}
        >
          {isVideoOff ? <VideoOff size={22} className="text-white" /> : <Video size={22} className="text-white" />}
        </button>
      </div>
    </main>
  );
}