import SimplePeer from 'simple-peer';
import { SignalMessage } from '@/types';

export const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

export const createPeerConnection = (
    initiator: boolean,
    stream: MediaStream
): SimplePeer.Instance => {
    const peer = new SimplePeer({
        initiator,
        trickleIce: true,
        stream,
        config: ICE_SERVERS,
    });

    return peer;
};

export const handlePeerSignal = (
    peer: SimplePeer.Instance,
    data: any,
    from: string,
    onSignal: (message: SignalMessage) => void
) => {
    peer.on('signal', (signalData) => {
        onSignal({
            type: 'offer' in signalData ? 'offer' : 'answer' in signalData ? 'answer' : 'ice-candidate',
            from,
            payload: signalData,
        });
    });
};

export const getMediaStream = async (
    audio: boolean = true,
    video: boolean = true
): Promise<MediaStream> => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio,
            video: video
                ? {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                }
                : false,
        });
        return stream;
    } catch (error) {
        console.error('Error accessing media devices:', error);
        throw error;
    }
};

export const stopMediaStream = (stream: MediaStream) => {
    stream.getTracks().forEach((track) => {
        track.stop();
    });
};
