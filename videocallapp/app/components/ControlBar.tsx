'use client';

import { useEffect, useState } from 'react';

interface ControlBarProps {
    onMicToggle?: (enabled: boolean) => void;
    onCameraToggle?: (enabled: boolean) => void;
    onEndCall?: () => void;
    isMicEnabled?: boolean;
    isCameraEnabled?: boolean;
}

export const ControlBar = ({
    onMicToggle,
    onCameraToggle,
    onEndCall,
    isMicEnabled = true,
    isCameraEnabled = true,
}: ControlBarProps) => {
    const [micEnabled, setMicEnabled] = useState(isMicEnabled);
    const [cameraEnabled, setCameraEnabled] = useState(isCameraEnabled);

    const handleMicToggle = () => {
        const newState = !micEnabled;
        setMicEnabled(newState);
        onMicToggle?.(newState);
    };

    const handleCameraToggle = () => {
        const newState = !cameraEnabled;
        setCameraEnabled(newState);
        onCameraToggle?.(newState);
    };

    return (
        <div className="flex justify-center items-center gap-4 p-4 bg-gray-900 rounded-lg">
            <button
                onClick={handleMicToggle}
                className={`p-4 rounded-full transition-colors ${micEnabled
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-red-600 hover:bg-red-500'
                    }`}
                title={micEnabled ? 'Disable microphone' : 'Enable microphone'}
            >
                <span className="text-white text-2xl">🎤</span>
            </button>

            <button
                onClick={handleCameraToggle}
                className={`p-4 rounded-full transition-colors ${cameraEnabled
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-red-600 hover:bg-red-500'
                    }`}
                title={cameraEnabled ? 'Disable camera' : 'Enable camera'}
            >
                <span className="text-white text-2xl">📹</span>
            </button>

            <button
                onClick={onEndCall}
                className="p-4 rounded-full bg-red-600 hover:bg-red-500 transition-colors"
                title="End call"
            >
                <span className="text-white text-2xl">☎️</span>
            </button>
        </div>
    );
};
