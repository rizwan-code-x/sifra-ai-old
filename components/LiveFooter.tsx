
import React, { useRef, useEffect } from 'react';
import { useAudioVisualizer } from '../hooks/useAudioVisualizer';
import XMarkIcon from './icons/XMarkIcon';

interface LiveFooterProps {
    status: string;
    inputTranscript: string;
    outputTranscript: string;
    onStop: () => void;
    analyserNode: AnalyserNode | null;
}

const LiveFooter: React.FC<LiveFooterProps> = ({ status, inputTranscript, outputTranscript, onStop, analyserNode }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useAudioVisualizer(canvasRef, analyserNode, true, outputTranscript.length > 0);

    useEffect(() => {
        const canvas = canvasRef.current;
        const resizeCanvas = () => {
            if (canvas) {
                const container = canvas.parentElement;
                if (container) {
                    canvas.width = container.clientWidth;
                    canvas.height = container.clientHeight;
                }
            }
        };
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        return () => window.removeEventListener('resize', resizeCanvas);
    }, []);


    return (
        <div className="relative h-40 w-full flex flex-col items-center justify-center text-center p-4 rounded-lg overflow-hidden bg-gray-900/50">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-50" />
            <div className="z-10 w-full">
                <p className="text-sm text-pink-300 absolute top-2 left-4">{status}</p>
                
                <div className="text-white font-medium truncate w-full px-4">
                    <span className="text-gray-400">You: </span>{inputTranscript}
                </div>
                <div className="text-white font-semibold text-lg truncate w-full px-4">
                   <span className="text-purple-300">Sifra: </span>{outputTranscript}
                </div>

                <button 
                    onClick={onStop}
                    className="absolute bottom-4 right-4 flex items-center justify-center w-12 h-12 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                    aria-label="Stop listening"
                >
                    <XMarkIcon />
                </button>
            </div>
        </div>
    );
};

export default LiveFooter;
