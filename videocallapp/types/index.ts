export interface Meeting {
    id: string;
    roomCode: string;
    createdAt: Date;
}

export interface SignalMessage {
    type: 'offer' | 'answer' | 'ice-candidate';
    from: string;
    to?: string;
    payload?: any;
}

export interface Peer {
    id: string;
    name: string;
    stream?: MediaStream;
}

export interface SocketMessage {
    type: 'user-joined' | 'user-left' | 'signal' | 'peer-list' | 'error';
    payload?: any;
}
