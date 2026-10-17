
import React, { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '../types';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import MusicalNoteIcon from '../components/icons/MusicalNoteIcon';
import PlayIcon from '../components/icons/PlayIcon';
import PauseIcon from '../components/icons/PauseIcon';
import ChevronDownIcon from '../components/icons/ChevronDownIcon';
import ShareIcon from '../components/icons/ShareIcon';
import TrashIcon from '../components/icons/TrashIcon';
import PencilIcon from '../components/icons/PencilIcon';
import SifraLiveLogo from '../components/SifraLiveLogo';
import { useGlobalAudio, Track } from '../utils/globalAudioState';

const SifraMusicView: React.FC<{ userProfile: UserProfile; onClose: () => void }> = ({ userProfile, onClose }) => {
    const [isIntroing, setIsIntroing] = useState(true);
    const [view, setView] = useState<'library' | 'player'>('library');
    const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');

    const { 
        tracks, 
        currentTrack, 
        isPlaying, 
        progress, 
        playTrack, 
        togglePlay, 
        seek, 
        skip,
        next, 
        prev, 
        updateTracks,
        audioData
    } = useGlobalAudio();

    useEffect(() => {
        const timer = setTimeout(() => setIsIntroing(false), 2500);
        return () => clearTimeout(timer);
    }, []);

    const handleFileSelect = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'audio/*';
        input.multiple = true;
        input.onchange = (e: any) => {
            const files = Array.from(e.target.files) as File[];
            const newTracks = files.map(f => ({
                id: Math.random().toString(36).substr(2, 9),
                title: f.name.split('.')[0],
                artist: 'Local Device',
                url: URL.createObjectURL(f)
            }));
            updateTracks([...tracks, ...newTracks]);
        };
        input.click();
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        seek(parseFloat(e.target.value));
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentTrack?.id === id && isPlaying) {
            togglePlay();
        }
        updateTracks(tracks.filter(t => t.id !== id));
    };

    const handleRename = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const track = tracks.find(t => t.id === id);
        if (track) {
            setEditingTrackId(id);
            setEditTitle(track.title);
        }
    };

    const saveRename = () => {
        updateTracks(tracks.map(t => t.id === editingTrackId ? { ...t, title: editTitle } : t));
        setEditingTrackId(null);
    };

    const handleShare = (track: Track, e: React.MouseEvent) => {
        e.stopPropagation();
        if (navigator.share) {
            navigator.share({
                title: track.title,
                text: `Checking out this song on Sifra App: ${track.title}`,
                url: window.location.href
            }).catch(() => {});
        } else {
            alert(`Sharing track: ${track.title}`);
        }
    };

    if (isIntroing) {
        return (
            <div className="fixed inset-0 z-[500] bg-black flex flex-col items-center justify-center space-y-8">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    <SifraLiveLogo size="xl" />
                </motion.div>
                <div className="flex flex-col items-center gap-2">
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center gap-3 text-white"
                    >
                        <MusicalNoteIcon className="w-6 h-6 text-indigo-500 animate-bounce" />
                        <h1 className="text-2xl font-black italic tracking-tighter">SIFRA MUSIC</h1>
                    </motion.div>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        transition={{ delay: 1 }}
                        className="text-[8px] font-black uppercase tracking-[0.6em] text-white"
                    >
                        Synchronizing Neural Audio
                    </motion.p>
                </div>
            </div>
        );
    }

    const renderPlayer = () => (
        <motion.div 
            initial={{ y: '100%' }} 
            animate={{ y: 0 }} 
            exit={{ y: '100%' }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[300] bg-zinc-950 flex flex-col text-white"
        >
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />
            
            <header className="px-8 pt-12 pb-6 flex justify-between items-center relative z-10">
                <button onClick={() => setView('library')} className="p-3 bg-white/5 rounded-2xl active:scale-90 transition-transform">
                    <ChevronDownIcon className="w-6 h-6" />
                </button>
                <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Now Playing</p>
                    <p className="text-[6px] font-bold text-indigo-500 uppercase tracking-widest mt-1">Sifra Neural Sync</p>
                </div>
                <button onClick={() => handleShare(currentTrack!, null as any)} className="p-3 bg-white/5 rounded-2xl active:scale-90 transition-transform">
                    <ShareIcon className="w-6 h-6" />
                </button>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-8 space-y-16 relative z-10">
                {/* Revolving Circle Interface */}
                <div className="relative w-80 h-80 flex items-center justify-center">
                    {/* Outer Orbit */}
                    <motion.div 
                        animate={isPlaying ? { rotate: 360 } : {}} 
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border border-white/5"
                    />
                    
                    {/* Animated Progress Ring */}
                    <svg 
                        className="absolute inset-0 w-80 h-80 -rotate-90 cursor-pointer"
                        onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left - 160;
                            const y = e.clientY - rect.top - 160;
                            let angle = Math.atan2(y, x) * (180 / Math.PI);
                            angle = angle + 90; // adjust for rotation
                            if (angle < 0) angle += 360;
                            const pct = (angle / 360) * 100;
                            seek(pct);
                        }}
                    >
                        <circle
                            cx="160"
                            cy="160"
                            r="156"
                            fill="transparent"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="24"
                        />
                        <motion.circle
                            cx="160"
                            cy="160"
                            r="156"
                            fill="transparent"
                            stroke="url(#music-grad)"
                            strokeWidth="4"
                            strokeDasharray="980"
                            strokeDashoffset={980 - (980 * progress) / 100}
                            strokeLinecap="round"
                            className="pointer-events-none"
                        />
                        <defs>
                            <linearGradient id="music-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="100%" stopColor="#d946ef" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Central Branding Hub */}
                    <div className="relative w-48 h-48 rounded-full bg-zinc-900 border border-white/10 shadow-2xl flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-600/10" />
                        <div className="relative z-10 scale-75">
                            <SifraLiveLogo />
                        </div>
                        {/* Audio Waveform Viz */}
                        <div className="absolute bottom-6 flex gap-1.5 pointer-events-none items-end h-16">
                            {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                                // Maps 0-6 to specific frequencies and scale them
                                const dataIdx = i * 2; 
                                const val = audioData && audioData.length > dataIdx ? audioData[dataIdx] : 0;
                                const height = isPlaying ? Math.max(8, (val / 255) * 48) : 8;
                                return (
                                    <motion.div 
                                        key={i} 
                                        animate={{ height }}
                                        transition={{ type: "spring", bounce: 0, duration: 0.1 }}
                                        className="w-1.5 bg-indigo-500 rounded-full opacity-80" 
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Track Info Below Circle */}
                <div className="text-center space-y-2">
                    <motion.h3 
                        key={currentTrack?.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-black tracking-tighter"
                    >
                        {currentTrack?.title}
                    </motion.h3>
                    <p className="text-xs font-bold text-indigo-500 uppercase tracking-[0.3em] opacity-60">Sifra Verified Audio</p>
                </div>
            </main>

            <footer className="px-8 pb-16 space-y-12 relative z-10">
                {/* Manual Seek Progress */}
                <div className="w-full flex items-center gap-4">
                    <span className="text-[10px] font-black text-white/20 w-8">0:00</span>
                    <div className="flex-1 relative h-1.5 flex items-center group">
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={progress} 
                            onChange={handleSeek} 
                            className="absolute inset-0 w-full h-full bg-white/5 rounded-full appearance-none accent-indigo-500 cursor-pointer overflow-hidden"
                        />
                    </div>
                    <span className="text-[10px] font-black text-white/20 w-8">End</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                         <button onClick={(e) => handleRename(currentTrack!.id, e)} className="p-4 bg-white/5 rounded-2xl active:scale-90 transition-transform"><PencilIcon className="w-5 h-5 text-indigo-400" /></button>
                         <button onClick={(e) => handleDelete(currentTrack!.id, e)} className="p-4 bg-white/5 rounded-2xl active:scale-90 transition-transform"><TrashIcon className="w-5 h-5 text-red-500/60" /></button>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <button onClick={() => skip(-10)} className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 active:scale-90 transition-all font-mono text-sm font-bold opacity-60 hover:opacity-100">
                            -10s
                        </button>
                        <button 
                            onClick={togglePlay}
                            className="w-24 h-24 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.2)] active:scale-95 transition-all"
                        >
                            {isPlaying ? <PauseIcon className="w-10 h-10 fill-current" /> : <PlayIcon className="w-10 h-10 fill-current translate-x-1" />}
                        </button>
                        <button onClick={() => skip(10)} className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 active:scale-90 transition-all font-mono text-sm font-bold opacity-60 hover:opacity-100">
                            +10s
                        </button>
                    </div>

                    <div className="w-24" /> {/* Spacer */}
                </div>
            </footer>
        </motion.div>
    );

    return (
        <div className="fixed inset-0 z-[250] bg-black text-white flex flex-col font-sans overflow-hidden">
            {/* Library Grid View */}
            <div className="flex-1 flex flex-col p-6 space-y-8 overflow-hidden h-full relative z-10">
                <header className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl active:scale-90"><ArrowLeftIcon className="w-5 h-5" /></button>
                        <div>
                            <h1 className="text-xl font-black italic tracking-tighter">MUSIC VAULT</h1>
                            <p className="text-[8px] font-black uppercase tracking-widest text-[#B45CFF]">Local Index</p>
                        </div>
                    </div>
                    <button onClick={handleFileSelect} className="px-5 py-2.5 bg-indigo-600 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-transform">Add Music</button>
                </header>

                <div className="flex-1 overflow-y-auto premium-scroll space-y-3">
                    {tracks.map((t, i) => (
                        <div 
                            key={t.id} 
                            onClick={() => { 
                                playTrack(t, tracks);
                                setView('player'); 
                            }} 
                            className="w-full flex items-center justify-between p-4 rounded-3xl bg-white/[0.03] border border-white/5 group active:bg-white/10 transition-all cursor-pointer"
                        >
                            <div className="flex items-center gap-5 text-left">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                    <MusicalNoteIcon className="w-6 h-6" />
                                </div>
                                <div className="max-w-[150px]">
                                    {editingTrackId === t.id ? (
                                        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                            <input 
                                                autoFocus
                                                value={editTitle} 
                                                onChange={e => setEditTitle(e.target.value)}
                                                onBlur={saveRename}
                                                onKeyDown={e => e.key === 'Enter' && saveRename()}
                                                className="bg-zinc-800 text-xs p-1 rounded outline-none"
                                            />
                                        </div>
                                    ) : (
                                        <h4 className="text-sm font-black tracking-tight truncate">{t.title}</h4>
                                    )}
                                    <p className="text-[8px] opacity-40 uppercase tracking-widest mt-0.5">{t.artist}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => handleRename(t.id, e)} className="p-2 hover:text-indigo-400"><PencilIcon className="w-3.5 h-3.5" /></button>
                                <button onClick={(e) => handleShare(t, e)} className="p-2 hover:text-white"><ShareIcon className="w-3.5 h-3.5" /></button>
                                <button onClick={(e) => handleDelete(t.id, e)} className="p-2 hover:text-red-500"><TrashIcon className="w-3.5 h-3.5" /></button>
                            </div>
                        </div>
                    ))}
                    {tracks.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-20 px-8 text-center">
                            <MusicalNoteIcon className="w-12 h-12" />
                            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Vault is empty. Add modules from device files.</p>
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {view === 'player' && renderPlayer()}
            </AnimatePresence>

            {/* Background Grain */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-20 pointer-events-none" />
        </div>
    );
};

export default SifraMusicView;
