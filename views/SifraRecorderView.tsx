
import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, Recording, View } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import AdjustmentsHorizontalIcon from '../components/icons/AdjustmentsHorizontalIcon';
import MicrophoneIcon from '../components/icons/MicrophoneIcon';
import StopIcon from '../components/icons/StopIcon';
import PauseIcon from '../components/icons/PauseIcon';
import PlayIcon from '../components/icons/PlayIcon';
import BookmarkIcon from '../components/icons/BookmarkIcon';
import TrashIcon from '../components/icons/TrashIcon';
import ShareIcon from '../components/icons/ShareIcon';
import SparklesIcon from '../components/icons/SparklesIcon';
import BoltIcon from '../components/icons/BoltIcon';
import XMarkIcon from '../components/icons/XMarkIcon';
import SifraLogo from '../components/SifraLogo';

const COLORS = {
    bg: '#0E0E11',
    accent: '#4DA3FF',
    accentSecondary: '#8B5CF6',
    glass: 'rgba(255, 255, 255, 0.03)',
};

const RecordingCard = memo(({ recording, onPlay, onDelete, onShare }: { recording: Recording, onPlay: () => void, onDelete: () => void, onShare: () => void }) => (
    <motion.div 
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full bg-white/[0.03] border border-white/[0.05] rounded-[1.8rem] p-5 flex items-center gap-4 group hover:bg-white/[0.05] transition-colors"
    >
        <button onClick={onPlay} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white active:scale-90 transition-transform">
            <PlayIcon className="w-5 h-5 fill-current" />
        </button>
        <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-white truncate">{recording.name}</h4>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                    {Math.floor(recording.duration / 60)}:{(recording.duration % 60).toString().padStart(2, '0')}
                </span>
                <div className="w-1 h-1 rounded-full bg-white/10" />
                <span className="text-[10px] font-medium text-white/20">{recording.date}</span>
            </div>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onShare} className="p-2 text-white/40 hover:text-white"><ShareIcon className="w-4 h-4" /></button>
            <button onClick={onDelete} className="p-2 text-rose-500/40 hover:text-rose-500"><TrashIcon className="w-4 h-4" /></button>
        </div>
    </motion.div>
));

const SifraRecorderView: React.FC<{ userProfile: UserProfile; onClose: () => void }> = ({ userProfile, onClose }) => {
    const [state, setState] = useState<'idle' | 'recording' | 'paused' | 'saving' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [seconds, setSeconds] = useState(0);
    const [recordings, setRecordings] = useLocalStorage<Recording[]>(`sifra_recordings_${userProfile.userId}`, []);
    const [markers, setMarkers] = useState<number[]>([]);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<any>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number>();

    const formatTime = (s: number) => {
        const min = Math.floor(s / 60);
        const sec = s % 60;
        return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    const cleanupAudio = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    }, []);

    useEffect(() => cleanupAudio, [cleanupAudio]);

    const startRecording = async () => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setState('error');
                setErrorMessage("Browser Not Supported");
                return;
            }

            const preferredConstraints = { audio: true };
            const fallbackConstraints = { audio: true };

            try {
                streamRef.current = await navigator.mediaDevices.getUserMedia(preferredConstraints);
            } catch (initialErr) {
                console.warn("Initial mic link failed, trying fallback...", initialErr);
                streamRef.current = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
            }

            const stream = streamRef.current;
            if (!stream) throw new Error("Failed to acquire stream");

            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            analyserRef.current = analyser;

            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];

            recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
            recorder.onstop = () => saveRecording();

            recorder.start();
            setState('recording');
            setSeconds(0);
            setMarkers([]);
            
            timerRef.current = setInterval(() => setSeconds(prev => prev + 1), 1000);
            drawWaveform();
        } catch (err: any) {
            console.error("Mic Initialization Error:", err);
            setState('error');
            let msg = "Mic Error";
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                msg = "Access Restricted";
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                msg = "No Mic Found";
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                msg = "Mic Busy";
            }
            setErrorMessage(msg);
        }
    };

    const drawWaveform = () => {
        const canvas = canvasRef.current;
        if (!canvas || !analyserRef.current) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const render = () => {
            animationFrameRef.current = requestAnimationFrame(render);
            analyserRef.current!.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const width = canvas.width;
            const height = canvas.height;
            const barWidth = (width / bufferLength) * 2.5;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * height * 0.8;
                const gradient = ctx.createLinearGradient(0, height / 2 - barHeight / 2, 0, height / 2 + barHeight / 2);
                gradient.addColorStop(0, '#8B5CF6');
                gradient.addColorStop(1, '#4DA3FF');
                
                ctx.fillStyle = gradient;
                ctx.fillRect(x, height / 2 - barHeight / 2, barWidth - 2, barHeight);
                x += barWidth;
            }
        };
        render();
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
        cleanupAudio();
        setState('saving');
    };

    const togglePause = () => {
        if (state === 'recording') {
            mediaRecorderRef.current?.pause();
            clearInterval(timerRef.current);
            setState('paused');
        } else if (state === 'paused') {
            mediaRecorderRef.current?.resume();
            timerRef.current = setInterval(() => setSeconds(prev => prev + 1), 1000);
            setState('recording');
        }
    };

    const saveRecording = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const id = `SIFRA_REC_${Date.now()}`;
        const newRec: Recording = {
            id,
            name: `Session ${recordings.length + 1}`,
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
            duration: seconds,
            url,
            waveform: [] // In a real app, generate from audio data
        };
        setRecordings(prev => [newRec, ...prev]);
        setState('idle');
    };

    const handleDelete = (id: string) => setRecordings(prev => prev.filter(r => r.id !== id));
    const handlePlay = (url: string) => {
        const audio = new Audio(url);
        audio.play();
    };

    return (
        <div className="fixed inset-0 z-[250] bg-[#0E0E11] text-white flex flex-col font-sans overflow-hidden">
            {/* AMBIENT BACKGROUND */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />

            <header className="p-8 pb-4 flex items-center justify-between relative z-10">
                <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl border border-white/5 active:scale-90 transition-transform">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2">
                        <SifraLogo size="sm" showText={false} />
                        <h2 className="text-sm font-black tracking-[0.2em] uppercase italic">Record</h2>
                    </div>
                </div>
                <button className="p-3 bg-white/5 rounded-2xl border border-white/5 active:scale-90">
                    <AdjustmentsHorizontalIcon className="w-6 h-6 opacity-40" />
                </button>
            </header>

            <main className="flex-1 flex flex-col relative z-10 px-8">
                <AnimatePresence mode="wait">
                    {state === 'idle' || state === 'error' ? (
                        <motion.div 
                            key={state}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="flex-1 flex flex-col"
                        >
                            <div className="flex-1 flex flex-col items-center justify-center">
                                {state === 'error' ? (
                                    <div className="text-center">
                                        <div className="w-24 h-24 rounded-full bg-rose-500/20 flex items-center justify-center mb-6 mx-auto border border-rose-500/30">
                                            <XMarkIcon className="w-10 h-10 text-rose-500" />
                                        </div>
                                        <h3 className="text-lg font-black uppercase italic tracking-widest text-rose-400">Signal Blocked</h3>
                                        <p className="text-[10px] text-white/40 mt-2 uppercase tracking-widest">{errorMessage}</p>
                                        <button 
                                            onClick={() => { setState('idle'); setErrorMessage(null); }}
                                            className="mt-8 px-8 py-3 bg-white/10 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                                        >
                                            Retry Link
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <motion.button 
                                            onClick={startRecording}
                                            whileTap={{ scale: 0.9 }}
                                            className="w-48 h-48 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 p-1 shadow-[0_0_80px_rgba(77,163,255,0.15)] group relative"
                                        >
                                            <div className="w-full h-full rounded-full bg-[#0E0E11] flex items-center justify-center relative overflow-hidden">
                                                <motion.div 
                                                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                                    transition={{ duration: 3, repeat: Infinity }}
                                                    className="absolute inset-0 bg-blue-500/20 blur-xl"
                                                />
                                                <MicrophoneIcon className="w-16 h-16 text-white group-hover:scale-110 transition-transform" />
                                            </div>
                                        </motion.button>
                                        <p className="mt-10 text-[10px] font-black text-white/30 uppercase tracking-[0.5em] animate-pulse">Ready to Listen</p>
                                    </>
                                )}
                            </div>

                            <div className="pb-10 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Recent Logs</h3>
                                    <span className="text-[9px] font-bold text-blue-400 uppercase">{recordings.length} Nodes</span>
                                </div>
                                <div className="space-y-3 max-h-60 overflow-y-auto premium-scroll">
                                    {recordings.slice(0, 3).map(rec => (
                                        <RecordingCard key={rec.id} recording={rec} onPlay={() => handlePlay(rec.url)} onDelete={() => handleDelete(rec.id)} onShare={() => {}} />
                                    ))}
                                    {recordings.length === 0 && (
                                        <div className="p-10 border border-white/5 border-dashed rounded-[2rem] text-center opacity-20 italic text-xs">No active sequences found.</div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="active"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col py-10"
                        >
                            <div className="text-center space-y-2">
                                <p className="text-[11px] font-black text-blue-400 uppercase tracking-[0.5em]">{state === 'recording' ? 'Sampling...' : 'Paused'}</p>
                                <h1 className="text-7xl font-black font-mono tracking-tighter text-white/90">{formatTime(seconds)}</h1>
                            </div>

                            <div className="flex-1 my-10 relative bg-white/[0.02] rounded-[3rem] border border-white/[0.05] overflow-hidden flex items-center justify-center">
                                <canvas ref={canvasRef} width={600} height={200} className="w-full h-32 opacity-80" />
                                <div className="absolute inset-0 bg-gradient-to-r from-[#0E0E11] via-transparent to-[#0E0E11] pointer-events-none" />
                            </div>

                            <div className="grid grid-cols-3 gap-6 items-center">
                                <button onClick={() => setMarkers(m => [...m, seconds])} className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 active:scale-90 transition-transform">
                                    <BookmarkIcon className="w-6 h-6" />
                                </button>
                                
                                <div className="flex justify-center">
                                    <button onClick={stopRecording} className="w-24 h-24 rounded-full bg-rose-600 flex items-center justify-center shadow-xl shadow-rose-600/20 active:scale-90 transition-transform">
                                        <StopIcon className="w-8 h-8 fill-white" />
                                    </button>
                                </div>

                                <button onClick={togglePause} className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-90 transition-transform">
                                    {state === 'paused' ? <PlayIcon className="w-6 h-6 fill-white" /> : <PauseIcon className="w-6 h-6 fill-white" />}
                                </button>
                            </div>

                            <div className="mt-10 flex justify-center gap-2">
                                {markers.map((m, i) => (
                                    <div key={i} className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-[9px] font-black uppercase">Mark @ {formatTime(m)}</div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <footer className="p-8 flex justify-center opacity-10">
                <p className="text-[7px] font-black uppercase tracking-[1em]">Node SR-808 v1.0.4</p>
            </footer>
        </div>
    );
};

export default SifraRecorderView;
