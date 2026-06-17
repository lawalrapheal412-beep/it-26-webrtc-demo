export interface Meeting {
    id: string;
    roomCode: string;
    createdAt: Date;
}

export interface SignalMessage {
    type: 'offer' | 'answer' | 'ice-candidate';
    from: string;
    to?: string;
    payload?: unknown;
}

export interface Peer {
    id: string;
    name: string;
    stream?: MediaStream;
}

export interface SocketMessage {
    type: 'user-joined' | 'user-left' | 'signal' | 'peer-list' | 'error';
    payload?: unknown;
}
console.log("WebRTC setup started");
