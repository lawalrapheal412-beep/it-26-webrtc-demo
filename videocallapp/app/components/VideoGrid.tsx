'use client';

import { Peer } from '@/types';
import { VideoStream } from './VideoStream';

interface VideoGridProps {
    peers: Peer[];
    localStream?: MediaStream;
    localName?: string;
}

export const VideoGrid = ({ peers, localStream, localName = 'You' }: VideoGridProps) => {
    const totalVideos = peers.length + (localStream ? 1 : 0);

    const getGridClass = () => {
        if (totalVideos === 1) return 'grid-cols-1';
        if (totalVideos === 2) return 'grid-cols-2';
        if (totalVideos <= 4) return 'grid-cols-2';
        return 'grid-cols-3';
    };

    return (
        <div className={`grid ${getGridClass()} gap-4 w-full h-full`}>
            {localStream && (
                <div className="w-full h-full rounded-lg overflow-hidden">
                    <VideoStream stream={localStream} label={localName} />
                </div>
            )}
            {peers.map((peer) => (
                <div key={peer.id} className="w-full h-full rounded-lg overflow-hidden">
                    <VideoStream stream={peer.stream} label={peer.name} />
                </div>
            ))}
        </div>
    );
};
