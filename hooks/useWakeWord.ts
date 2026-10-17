import { useState, useEffect, useCallback, useRef } from 'react';

export const useWakeWord = (onWakeWordDetected: () => void, isEnabled: boolean = true) => {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    const startListening = useCallback(() => {
        if (!isEnabled) return;
        
        try {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (!SpeechRecognition) {
                console.warn("Speech recognition not supported in this browser.");
                return;
            }

            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            let shouldRestart = true;

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onresult = (event: any) => {
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    const transcript = event.results[i][0].transcript.toLowerCase().trim();
                    if (
                        transcript.includes('hey sifra') || 
                        transcript.includes('hello sifra') || 
                        transcript.includes('ok sifra')
                    ) {
                        // Stop this recognition instance to prevent multiple triggers
                        shouldRestart = false;
                        recognition.stop();
                        onWakeWordDetected();
                        break;
                    }
                }
            };

            recognition.onerror = (event: any) => {
                if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                    // Don't restart if permission denied
                    shouldRestart = false;
                    setIsListening(false);
                } else if (event.error === 'aborted') {
                    // Just suppress the console error for aborted, but allow restart if appropriate
                    setIsListening(false);
                } else {
                    console.error("Wake word recognition error:", event.error);
                }
            };

            recognition.onend = () => {
                setIsListening(false);
                // Automatically restart listening if still enabled
                if (isEnabled && shouldRestart) {
                    setTimeout(() => startListening(), 500);
                }
            };

            recognitionRef.current = recognition;
            recognition.start();
        } catch (error) {
            console.error("Failed to start wake word listener:", error);
        }
    }, [isEnabled, onWakeWordDetected]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.onend = null; // Prevent auto-restart
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, []);

    useEffect(() => {
        if (isEnabled) {
            startListening();
        } else {
            stopListening();
        }

        return () => {
            stopListening();
        };
    }, [isEnabled, startListening, stopListening]);

    return { isListening, startListening, stopListening };
};
