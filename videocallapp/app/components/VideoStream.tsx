'use client';

import { useEffect, useRef } from 'react';

interface VideoStreamProps {
    stream?: MediaStream;
    muted?: boolean;
    autoPlay?: boolean;
    className?: string;
    label?: string;
}

export const VideoStream = ({
    stream,
    muted = true,
    autoPlay = true,
    className = 'w-full h-full bg-black rounded-lg object-cover',
    label,
}: VideoStreamProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }

        return () => {
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        };
    }, [stream]);

    return (
        <div className="relative w-full h-full">
            <video
                ref={videoRef}
                autoPlay={autoPlay}
                muted={muted}
                playsInline
                className={className}
            />
            {label && (
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-3 py-1 rounded-md text-sm">
                    {label}
                </div>
            )}
        </div>
    );
};
