'use client';

import { useState, useEffect, useRef } from 'react';
import { getMediaStream, stopMediaStream } from '@/lib/webrtc';

export const useMediaStream = (audio: boolean = true, video: boolean = true) => {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        const initializeStream = async () => {
            setIsLoading(true);
            try {
                const mediaStream = await getMediaStream(audio, video);
                streamRef.current = mediaStream;
                setStream(mediaStream);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to get media stream'));
                setStream(null);
            } finally {
                setIsLoading(false);
            }
        };

        initializeStream();

        return () => {
            if (streamRef.current) {
                stopMediaStream(streamRef.current);
            }
        };
    }, [audio, video]);

    const stopStream = () => {
        if (streamRef.current) {
            stopMediaStream(streamRef.current);
            streamRef.current = null;
            setStream(null);
        }
    };

    return { stream, error, isLoading, stopStream };
};
