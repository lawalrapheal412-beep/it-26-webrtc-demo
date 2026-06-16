'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SimplePeer from 'simple-peer';
import { useSocket } from '@/hooks/useSocket';
import { useMediaStream } from '@/hooks/useMediaStream';
import { VideoGrid, ControlBar } from '@/app/components';
import { createPeerConnection, ICE_SERVERS } from '@/lib/webrtc';
import { Peer } from '@/types';

export default function Meeting() {
    const params = useParams();
    const router = useRouter();
    const roomCode = params.roomCode as string;

    const { socket, isConnected } = useSocket();
    const { stream: localStream, error: streamError } = useMediaStream();

    const [peers, setPeers] = useState<Peer[]>([]);
    const [micEnabled, setMicEnabled] = useState(true);
    const [cameraEnabled, setCameraEnabled] = useState(true);
    const peersRef = useRef<Map<string, SimplePeer.Instance>>(new Map());
    const userIdRef = useRef<string>('');

    // Verify meeting exists
    useEffect(() => {
        const verifyMeeting = async () => {
            try {
                const response = await fetch(`/api/meetings/${roomCode}`);
                if (!response.ok) {
                    router.push('/');
                }
            } catch (error) {
                console.error('Error verifying meeting:', error);
                router.push('/');
            }
        };

        verifyMeeting();
    }, [roomCode, router]);

    // Join room on socket connect
    useEffect(() => {
        if (!socket || !isConnected || !userIdRef.current) return;

        socket.emit('join-room', {
            roomCode,
            userId: userIdRef.current,
            userName: `User-${userIdRef.current.substring(0, 8)}`,
        });

        return () => {
            socket.emit('leave-room', { roomCode, userId: userIdRef.current });
        };
    }, [socket, isConnected, roomCode]);

    // Initialize user ID
    useEffect(() => {
        if (!userIdRef.current) {
            userIdRef.current = Math.random().toString(36).substring(2, 11);
        }
    }, []);

    // Handle peer list updates and create connections
    useEffect(() => {
        if (!socket || !localStream) return;

        const handlePeerList = (data: { peers: Peer[] }) => {
            const filteredPeers = data.peers.filter((p) => p.id !== userIdRef.current);
            setPeers(filteredPeers);

            // Create peer connections for new peers
            filteredPeers.forEach((peerData) => {
                if (!peersRef.current.has(peerData.id)) {
                    // Initiator is the one with lower ID (lexicographic order)
                    const isInitiator = userIdRef.current < peerData.id;

                    const peerInstance = createPeerConnection(isInitiator, localStream);

                    // Handle peer signal events
                    peerInstance.on('signal', (signalData) => {
                        socket.emit('signal', {
                            to: peerData.id,
                            from: userIdRef.current,
                            payload: signalData,
                        });
                    });

                    // Handle peer connection events
                    peerInstance.on('connect', () => {
                        console.log(`Connected to peer: ${peerData.id}`);
                    });

                    peerInstance.on('stream', (remoteStream) => {
                        // Update peer with stream
                        setPeers((prev) =>
                            prev.map((p) =>
                                p.id === peerData.id ? { ...p, stream: remoteStream } : p
                            )
                        );
                    });

                    peerInstance.on('error', (err) => {
                        console.error(`Peer error with ${peerData.id}:`, err);
                    });

                    peerInstance.on('close', () => {
                        peersRef.current.delete(peerData.id);
                        setPeers((prev) => prev.filter((p) => p.id !== peerData.id));
                    });

                    peersRef.current.set(peerData.id, peerInstance);
                }
            });

            // Clean up removed peers
            peersRef.current.forEach((peer, peerId) => {
                if (!filteredPeers.find((p) => p.id === peerId)) {
                    peer.destroy();
                    peersRef.current.delete(peerId);
                }
            });
        };

        const handleSignal = (data: any) => {
            const { from, payload } = data;
            const peer = peersRef.current.get(from);

            if (peer) {
                try {
                    peer.signal(payload);
                } catch (err) {
                    console.error(`Error signaling peer ${from}:`, err);
                }
            } else {
                console.warn(`Received signal from unknown peer: ${from}`);
            }
        };

        socket.on('peer-list', handlePeerList);
        socket.on('signal', handleSignal);

        return () => {
            socket.off('peer-list', handlePeerList);
            socket.off('signal', handleSignal);
        };
    }, [socket, localStream]);

    // Toggle microphone
    const handleMicToggle = useCallback((enabled: boolean) => {
        if (localStream) {
            localStream.getAudioTracks().forEach((track) => {
                track.enabled = enabled;
            });
        }
        setMicEnabled(enabled);
    }, [localStream]);

    // Toggle camera
    const handleCameraToggle = useCallback((enabled: boolean) => {
        if (localStream) {
            localStream.getVideoTracks().forEach((track) => {
                track.enabled = enabled;
            });
        }
        setCameraEnabled(enabled);
    }, [localStream]);

    // End call
    const handleEndCall = () => {
        peersRef.current.forEach((peer) => peer.destroy());
        peersRef.current.clear();
        router.push('/');
    };

    if (streamError) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-500 mb-2">Camera/Microphone Error</h1>
                    <p className="text-gray-400 mb-4">Please allow access to your camera and microphone</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-900 flex flex-col">
            {/* Status Bar */}
            <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-white">Meeting: {roomCode}</h1>
                        <p className="text-sm text-gray-400">
                            {isConnected ? '✓ Connected' : '○ Connecting...'}
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/')}
                        className="text-gray-400 hover:text-white"
                    >
                        ← Back
                    </button>
                </div>
            </div>

            {/* Video Area */}
            <div className="flex-1 p-4 overflow-hidden">
                {localStream ? (
                    <VideoGrid peers={peers} localStream={localStream} />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <p className="text-gray-400">Loading camera...</p>
                    </div>
                )}
            </div>

            {/* Control Bar */}
            <div className="bg-gray-800 border-t border-gray-700 p-4 flex justify-center">
                <ControlBar
                    onMicToggle={handleMicToggle}
                    onCameraToggle={handleCameraToggle}
                    onEndCall={handleEndCall}
                    isMicEnabled={micEnabled}
                    isCameraEnabled={cameraEnabled}
                />
            </div>
        </main>
    );
}
