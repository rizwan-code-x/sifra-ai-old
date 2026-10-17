
import React, { useState, useCallback, useRef } from 'react';
import { SIFRA_ADVANCED_VOICES, VoiceProfile } from '../types';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import SpeakerIcon from '../components/icons/SpeakerIcon';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';
import { generateSampleSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';

interface SifraVoiceViewProps {
    currentVoiceId: string;
    onSelectVoice: (voiceId: string) => void;
    onClose: () => void;
}

const SifraVoiceView: React.FC<SifraVoiceViewProps> = ({ currentVoiceId, onSelectVoice, onClose }) => {
    const [previewingId, setPreviewingId] = useState<string | null>(null);
    const [loadingSampleId, setLoadingSampleId] = useState<string | null>(null);
    const [audioSamples, setAudioSamples] = useState<Map<string, AudioBuffer>>(new Map());
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

    const stopPreview = useCallback(() => {
        if (audioSourceRef.current) {
            audioSourceRef.current.stop();
            audioSourceRef.current.onended = null;
            audioSourceRef.current = null;
        }
        setPreviewingId(null);
    }, []);

    const playSample = useCallback((buffer: AudioBuffer) => {
        if (!audioContextRef.current) return;
        try {
            const audioContext = audioContextRef.current;
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start();
            audioSourceRef.current = source;
            source.onended = () => {
                if (audioSourceRef.current === source) {
                    setPreviewingId(null);
                    audioSourceRef.current = null;
                }
            };
        } catch (error) {
            console.error("Error previewing audio:", String(error));
            setPreviewingId(null);
        }
    }, []);

    const handlePreview = useCallback(async (voiceId: string) => {
        if (loadingSampleId) return; // Don't allow new previews while one is loading
        if (previewingId === voiceId) {
            stopPreview();
            return;
        }
        stopPreview();
        setPreviewingId(voiceId);

        const cachedBuffer = audioSamples.get(voiceId);
        if (cachedBuffer) {
            playSample(cachedBuffer);
            return;
        }

        setLoadingSampleId(voiceId);
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            const audioData = await generateSampleSpeech(voiceId);
            if (audioData && audioContextRef.current) {
                const newBuffer = await decodeAudioData(decode(audioData), audioContextRef.current, 24000, 1);
                setAudioSamples(prev => new Map(prev).set(voiceId, newBuffer));
                playSample(newBuffer);
            } else {
                setPreviewingId(null);
            }
        } catch (error) {
            console.error(`Failed to load sample for voice ID ${voiceId}:`, String(error));
            setPreviewingId(null);
        } finally {
            setLoadingSampleId(null);
        }
    }, [loadingSampleId, previewingId, stopPreview, audioSamples, playSample]);

    const handleSelect = (voiceId: string) => {
        onSelectVoice(voiceId);
    };

    const renderVoiceList = (gender: 'female' | 'male') => (
        SIFRA_ADVANCED_VOICES.filter(v => v.gender === gender).map(voice => {
            const isLoading = loadingSampleId === voice.id;
            const isPlaying = previewingId === voice.id;
            return (
                <div key={voice.id} className="bg-white/70 p-4 rounded-lg shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-gray-800">{voice.name}</h3>
                        <p className="text-xs text-gray-500 mb-1">{voice.ageGroup} years old</p>
                        <p className="text-sm text-gray-600">{voice.description}</p>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={() => handlePreview(voice.id)}
                            disabled={isLoading}
                            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors text-sm disabled:opacity-50 disabled:cursor-wait"
                        >
                            <SpeakerIcon isPlaying={isPlaying && !isLoading} /> 
                            {isLoading ? 'Loading...' : (isPlaying ? 'Playing...' : 'Preview')}
                        </button>
                        <button
                            onClick={() => handleSelect(voice.id)}
                            disabled={currentVoiceId === voice.id}
                            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition-colors text-sm disabled:bg-pink-300 disabled:cursor-not-allowed"
                        >
                            {currentVoiceId === voice.id && <CheckCircleIcon />} Select
                        </button>
                    </div>
                </div>
            );
        })
    );

    return (
        <div className="h-full flex flex-col animate-fade-in-up">
            <header className="p-4 shadow-md bg-white/30 backdrop-blur-sm flex items-center z-10">
                <button onClick={onClose} className="p-2 -m-2 rounded-full hover:bg-black/5 transition-colors mr-4">
                    <ArrowLeftIcon />
                </button>
                <h1 className="text-xl font-bold text-gray-800">Sifra's Voice World</h1>
            </header>
            
            <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                <div>
                    <h2 className="text-lg font-semibold text-pink-600 mb-2">Female Voices (6)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {renderVoiceList('female')}
                    </div>
                </div>
                 <div>
                    <h2 className="text-lg font-semibold text-blue-600 mb-2">Male Voices (4)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {renderVoiceList('male')}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SifraVoiceView;
