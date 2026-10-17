
import React, { memo, useState, useRef } from 'react';
import { UserProfile, View, AdminSettings, ClockStyleId } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import SparklesIcon from '../components/icons/SparklesIcon';
import BoltIcon from '../components/icons/BoltIcon';
import MicrophoneIcon from '../components/icons/MicrophoneIcon';
import ChatBubbleLeftRightIcon from '../components/icons/ChatBubbleLeftRightIcon';
import CubeTransparentIcon from '../components/icons/CubeTransparentIcon';
import GlobeAltIcon from '../components/icons/GlobeAltIcon';
import BookOpenIcon from '../components/icons/BookOpenIcon';
import ArrowRightIcon from '../components/icons/ArrowRightIcon';
import ChevronRightIcon from '../components/icons/ChevronRightIcon';
import CalendarIcon from '../components/icons/CalendarIcon';
import ClockIcon from '../components/icons/ClockIcon';
import UserIcon from '../components/icons/UserIcon';
import CalculatorIcon from '../components/icons/CalculatorIcon';
import LockClosedIcon from '../components/icons/LockClosedIcon';
import SearchIcon from '../components/icons/SearchIcon';
import ShareIcon from '../components/icons/ShareIcon';
import DocumentTextIcon from '../components/icons/DocumentTextIcon';
import PlayIcon from '../components/icons/PlayIcon';
import PauseIcon from '../components/icons/PauseIcon';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';
import MapIcon from '../components/icons/MapIcon';
import HeartSparkleIcon from '../components/icons/HeartSparkleIcon';
import SifraLiveLogo from '../components/SifraLiveLogo';
import SifraClock from '../components/SifraClock';
import { useGlobalAudio } from '../utils/globalAudioState';
import CinematicAudioScriptModal from '../components/CinematicAudioScriptModal';
import { 
    SifraBrowserLogo, 
    SifraClockLogo, 
    SifraCalendarLogo, 
    SifraCalculatorLogo, 
    SifraCardLogo, 
    SifraPlanLogo,
    SifraLibraryLogo,
    SifraMainLogo,
    SifraWeatherLogo,
    SifraMapsLogo,
    SifraLawLogo
} from '../components/SifraBrandedIcons';

interface HomeViewProps {
    userProfile: UserProfile;
    onNavigate: (view: View) => void;
    onUserProfileChange: (profile: UserProfile) => void;
    adminSettings: AdminSettings;
}

const SMOOTH_SPRING = { type: "spring", stiffness: 450, damping: 40, mass: 1 };
const STAGGER_DELAY = 0.03;

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: STAGGER_DELAY } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: SMOOTH_SPRING }
};

const COLORS = ['#FFD700', '#A855F7', '#FACC15', '#22C55E', '#3B82F6'];

const ActionBox = memo(({ icon, title, subtitle, color, onClick }: { icon: React.ReactNode, title: string, subtitle: string, color: string, onClick: () => void }) => (
    <motion.button 
        variants={itemVariants}
        whileTap={{ scale: 0.94 }}
        onClick={onClick}
        className="relative group w-full h-16 sm:h-18 rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between text-left shadow-sm backdrop-blur-xl border border-white/10 bg-white/5 overflow-hidden gpu-layer active:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-100"
    >
        <div className={`absolute inset-0 opacity-0 group-active:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${color.replace('bg-gradient-to-br ', '')} blur-xl`} />
        <div className={`absolute -right-2 -bottom-2 w-14 h-14 rounded-full blur-[20px] opacity-10 ${color} pointer-events-none`} />
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white shadow-md ${color} relative z-10`}>
            {React.cloneElement(icon as React.ReactElement, { className: "w-3.5 h-3.5" })}
        </div>
        <div className="relative z-10">
            <h3 className="font-black text-gray-900 text-[10px] tracking-tight">{title}</h3>
            <p className="text-[6px] font-black text-gray-400 uppercase tracking-widest">{subtitle}</p>
        </div>
    </motion.button>
));

const UtilityModule = memo(({ icon, label, onClick, color, subtitle }: { icon: React.ReactNode, label: string, onClick: () => void, color: string, subtitle: string }) => (
    <motion.button 
        variants={itemVariants}
        whileTap={{ scale: 0.94 }}
        onClick={onClick}
        className="group relative flex flex-col items-center justify-center gap-1.5 p-1 bg-transparent border-none rounded-2xl transition-all active:scale-90"
    >
        <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center relative overflow-hidden transition-all group-hover:scale-105 shadow-[0_0_12px_rgba(212,175,55,0.12)]`}>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-200/10 to-amber-500/10 opacity-40 group-hover:opacity-60" />
            <div className="relative z-10 transition-colors duration-500 drop-shadow-[0_2px_4px_rgba(212,175,55,0.4)]">
                {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6 sm:w-7 sm:h-7" })}
            </div>
        </div>
        <div className="text-center">
            <h4 className="text-[9px] font-black text-gray-900 uppercase tracking-tighter drop-shadow-sm">{label}</h4>
            <p className="text-[5px] font-black text-amber-600/60 uppercase tracking-widest mt-0.5">{subtitle}</p>
        </div>
    </motion.button>
));

const PremiumModule = memo(({ icon, label, onClick, subtitle }: { icon: React.ReactNode, label: string, onClick: () => void, subtitle: string }) => (
    <motion.button 
        variants={itemVariants}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="flex-1 min-w-[65px] h-18 sm:h-20 rounded-2xl bg-transparent border-none flex flex-col items-center justify-center gap-1.5 relative overflow-hidden group shrink-0 active:scale-95 transition-all"
    >
        <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center relative transition-transform duration-300 group-hover:scale-105 shadow-[0_0_15px_rgba(212,175,55,0.12)]`}>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-100/5 to-amber-400/10 opacity-30" />
            <div className="relative z-10 drop-shadow-[0_2px_5px_rgba(212,175,55,0.5)]">
                {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6" })}
            </div>
        </div>
        <div className="text-center">
            <span className="text-[9px] font-black text-gray-900 uppercase tracking-tighter block">{label}</span>
            <span className="text-[5px] font-black text-amber-500/60 uppercase tracking-widest">{subtitle}</span>
        </div>
    </motion.button>
));

const ModeCard = memo(({ title, subtitle, color, onClick }: { title: string, subtitle: string, color: string, onClick: () => void }) => (
    <motion.button 
        variants={itemVariants}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="min-w-[120px] h-24 rounded-[1.5rem] p-4 flex flex-col justify-between relative overflow-hidden group border border-white/10 bg-black/5 backdrop-blur-md shadow-sm snap-center shrink-0"
    >
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-10 group-hover:opacity-20 transition-opacity`} />
        <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg mb-2`}>
            <BoltIcon className="w-3 h-3" />
        </div>
        <div className="text-left relative z-10">
            <h3 className="text-xs font-black text-gray-900 leading-tight tracking-tight">{title}</h3>
            <p className="text-[6px] font-black text-gray-500 uppercase tracking-widest mt-0.5">{subtitle}</p>
        </div>
    </motion.button>
));

const HomeView: React.FC<HomeViewProps> = ({ userProfile, onNavigate, adminSettings, onUserProfileChange }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showClockSelection, setShowClockSelection] = useState(false);
    const [showScriptModal, setShowScriptModal] = useState(false);
    const holdTimerRef = useRef<NodeJS.Timeout | null>(null);

    const { 
        currentTrack, 
        isPlaying, 
        progress, 
        togglePlay, 
        seek, 
        skip 
    } = useGlobalAudio();

    const isEnabled = (id: string) => adminSettings?.featureFlags?.[id] !== false;
    const userName = (userProfile.name && userProfile.name !== 'User' && userProfile.name !== 'Guest' ? userProfile.name : 'Rizwan').split(' ')[0];
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            onNavigate(View.SIFRA_BROWSER, { searchQuery });
        }
    };

    const handleClockHoldStart = () => {
        if (currentTrack) return;
        holdTimerRef.current = setTimeout(() => {
            setShowClockSelection(true);
            if (navigator.vibrate) navigator.vibrate(50);
        }, 1000); // 1s as requested
    };

    const handleClockHoldEnd = () => {
        if (holdTimerRef.current) {
            clearTimeout(holdTimerRef.current);
            holdTimerRef.current = null;
        }
    };

    const clockStyles: { id: ClockStyleId, label: string }[] = [
        { id: 'analog-basic', label: 'Classic Analog' },
        { id: 'digital-premium', label: 'Premium Gold' },
        { id: 'sifra-logo', label: 'Sifra Emblem' },
        { id: 'digital-space', label: 'Neural Space' },
        { id: 'analog-multicolor', label: 'Multicolor Pro' },
    ];

    const currentClockStyle = userProfile.heroClockStyle || 'analog-basic';

    return (
        <div 
            className="h-full w-full overflow-y-auto premium-scroll px-4 sm:px-6 pt-4 sm:pt-6 pb-32 flex flex-col gap-4 sm:gap-6 font-sans"
        >
            {/* Greeting Header */}
            <div className="flex flex-col gap-0.5 relative px-1">
                <p className="text-[9px] font-black uppercase tracking-[0.35em] text-amber-500/80 mb-0.5 drop-shadow-sm">{greeting}</p>
                <h1 className="relative z-10 text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-tight group">
                    Welcome, <br/>
                    <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600">
                        {userName}
                    </span>
                </h1>
            </div>

            <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-3 sm:gap-4">
                {/* Hero Feature / Mini Player */}
                <motion.div
                    variants={itemVariants}
                    onPointerDown={handleClockHoldStart}
                    onPointerUp={handleClockHoldEnd}
                    onPointerLeave={handleClockHoldEnd}
                    className="relative w-full h-26 sm:h-28 rounded-3xl bg-[#0F172A] border border-white/5 shadow-xl overflow-hidden flex items-center p-5 sm:p-6 justify-between group select-none"
                    onClick={() => {
                        if (currentTrack) {
                            onNavigate(View.SIFRA_MUSIC);
                        } else {
                            onNavigate(View.MEET_SIFRA);
                        }
                    }}
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                    
                    {currentTrack ? (
                        <div className="flex items-center justify-between w-full relative z-10">
                            <div className="flex flex-col">
                                <span className="text-[6px] font-black uppercase tracking-widest text-[#B45CFF]">Now Playing</span>
                                <h3 className="text-xl font-black text-white tracking-tighter truncate max-w-[120px] leading-tight mt-1">{currentTrack.title}</h3>
                                {/* Mini Skip / Play Controls */}
                                <div className="flex items-center gap-3 mt-2" onClick={e => e.stopPropagation()}>
                                    <button onClick={() => skip(-10)} className="w-6 h-6 flex items-center justify-center rounded-full bg-white/10 text-white active:scale-90 transition-all font-mono text-[8px] font-bold">
                                        -10
                                    </button>
                                    <button onClick={togglePlay} className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center active:scale-90 transition-all">
                                        {isPlaying ? <PauseIcon className="w-4 h-4 fill-current" /> : <PlayIcon className="w-4 h-4 fill-current ml-0.5" />}
                                    </button>
                                    <button onClick={() => skip(10)} className="w-6 h-6 flex items-center justify-center rounded-full bg-white/10 text-white active:scale-90 transition-all font-mono text-[8px] font-bold">
                                        +10
                                    </button>
                                </div>
                            </div>
                            
                            <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                                {/* Seeking Progress Circle */}
                                <svg 
                                    className="absolute inset-0 w-20 h-20 -rotate-90 cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const x = e.clientX - rect.left - 40;
                                        const y = e.clientY - rect.top - 40;
                                        let angle = Math.atan2(y, x) * (180 / Math.PI);
                                        angle = angle + 90; 
                                        if (angle < 0) angle += 360;
                                        seek((angle / 360) * 100);
                                    }}
                                >
                                    <circle cx="40" cy="40" r="36" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                                    <circle cx="40" cy="40" r="36" fill="transparent" stroke="#B45CFF" strokeWidth="3"
                                        strokeDasharray="226" strokeDashoffset={226 - (226 * progress) / 100} strokeLinecap="round" className="pointer-events-none" />
                                </svg>
                                
                                {/* Logo in center */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none scale-50">
                                    <SifraLiveLogo />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="relative z-10">
                                <h2 className="text-xl font-black text-white tracking-tighter italic leading-tight mt-1">Discover Sifra</h2>
                                <div className="flex items-center gap-2 mt-2">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onNavigate(View.MEET_SIFRA);
                                        }}
                                        className="text-[6px] font-black text-indigo-400/80 uppercase tracking-widest flex items-center gap-1 hover:translate-x-1 hover:text-indigo-400 transition-all active:scale-95 py-1"
                                    >
                                        Meet SIFRA <ArrowRightIcon className="w-2.5 h-2.5" />
                                    </button>
                                </div>
                            </div>
                            <div className="relative pointer-events-none">
                                <SifraClock styleId={currentClockStyle} size="md" integrated />
                            </div>
                        </>
                    )}

                    {/* Clock Selection Overlay - Redesigned as Seamless Matrix */}
                    <AnimatePresence>
                        {showClockSelection && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute inset-0 z-50 bg-[#0F172A]/95 backdrop-blur-xl flex flex-col justify-center"
                                onClick={(e) => { e.stopPropagation(); setShowClockSelection(false); }}
                            >
                                <div className="px-8 mb-4 flex justify-between items-center">
                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Select Sync Face</span>
                                    <span className="text-[8px] text-white/30 uppercase tracking-widest">Hold to switch</span>
                                </div>
                                <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide px-8 items-center snap-x snap-mandatory">
                                    {clockStyles.map(s => (
                                        <div 
                                            key={s.id} 
                                            className={`flex flex-col items-center gap-4 shrink-0 transition-all snap-center ${currentClockStyle === s.id ? 'scale-110' : 'opacity-30 scale-90'}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onUserProfileChange({ ...userProfile, heroClockStyle: s.id });
                                                setShowClockSelection(false);
                                            }}
                                        >
                                            <SifraClock styleId={s.id} size="lg" integrated />
                                            <span className={`text-[8px] font-black uppercase tracking-widest ${currentClockStyle === s.id ? 'text-indigo-400' : 'text-white/40'}`}>
                                                {s.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Search Bar Section */}
                <motion.div 
                    variants={itemVariants}
                    className="relative w-full group space-y-3"
                >
                    <form 
                        onSubmit={handleSearchSubmit}
                        className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl p-1 backdrop-blur-2xl shadow-lg focus-within:border-indigo-500/50 transition-all"
                    >
                        <div className="flex-1 flex items-center px-3 gap-3">
                            <SearchIcon className="w-4 h-4 text-gray-400" />
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search with Sifra..."
                                className="text-xs font-bold text-gray-800 w-full py-2 bg-transparent outline-none placeholder:text-gray-400"
                            />
                        </div>
                        <button 
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onNavigate(View.GALAXY_VOICE);
                            }}
                            className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg transition-transform active:scale-95 hover:brightness-110"
                        >
                            <MicrophoneIcon className="w-4 h-4 text-white" />
                        </button>
                    </form>
                    
                    {/* Search Suggestions */}
                    <div className="flex flex-wrap gap-2 px-1">
                        {["News", "Sifra AI", "Jokes"].map((s, i) => (
                            <button 
                                key={i}
                                onClick={() => {
                                    setSearchQuery(s);
                                    onNavigate(View.SIFRA_BROWSER, { searchQuery: s });
                                }}
                                className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-gray-400 hover:text-indigo-400 transition-colors"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Primary Interaction Boxes */}
                <div className="grid grid-cols-2 gap-3">
                    {isEnabled('chat') && <ActionBox title="Sifra Chat" subtitle="Neural Matrix AI" icon={<ChatBubbleLeftRightIcon />} color="bg-gradient-to-br from-pink-500/80 to-rose-600/80" onClick={() => onNavigate(View.CHAT)} />}
                    {isEnabled('voice') && <ActionBox title="Galaxy Voice" subtitle="Live Neural AI" icon={<MicrophoneIcon />} color="bg-gradient-to-br from-indigo-500/80 to-purple-600/80" onClick={() => onNavigate(View.GALAXY_VOICE)} />}
                </div>

                {/* System Modes Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <SparklesIcon className="w-3 h-3 text-amber-500" />
                        <h3 className="text-[8px] font-black text-gray-400 uppercase tracking-widest">System Modes</h3>
                    </div>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                        {/* 1. SIFRA Project */}
                        <motion.button 
                            variants={itemVariants}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {}}
                            className="h-18 sm:h-20 rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between relative overflow-hidden group border border-amber-500/30 bg-black/5 backdrop-blur-md shadow-sm transition-all text-left opacity-90 cursor-default"
                        >
                            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-amber-500 text-[6px] font-black text-slate-950 uppercase tracking-tighter shadow-sm">PRO</div>
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-10" />
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md mb-1">
                                <BoltIcon className="w-3 h-3" />
                            </div>
                            <div className="text-left relative z-10">
                                <h3 className="text-[10px] font-black text-gray-900 leading-tight tracking-tight uppercase">SIFRA Project</h3>
                                <p className="text-[6px] font-black text-amber-600 uppercase tracking-widest mt-0.5">Neural AI Studio</p>
                            </div>
                        </motion.button>

                        {/* 2. Quantum Leap & Dual Mode */}
                        <motion.button 
                            variants={itemVariants}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onNavigate(View.DUAL_MODE)}
                            className="h-18 sm:h-20 rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between relative overflow-hidden group border border-cyan-500/30 bg-black/5 backdrop-blur-md shadow-sm transition-all text-left active:scale-95"
                        >
                            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-cyan-500/80 text-[5px] font-black text-slate-950 uppercase tracking-tighter shadow-sm">DUAL MODE</div>
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-10" />
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md mb-1">
                                <SparklesIcon className="w-3 h-3" />
                            </div>
                            <div className="text-left relative z-10">
                                <h3 className="text-[10px] font-black text-gray-900 leading-tight tracking-tight uppercase">Quantum Leap</h3>
                                <p className="text-[6px] font-black text-cyan-600 uppercase tracking-widest mt-0.5">Riya AI Companion</p>
                            </div>
                        </motion.button>

                        {/* 3. Library */}
                        <motion.button 
                            variants={itemVariants}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onNavigate(View.LIBRARY)}
                            className="h-18 sm:h-20 rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between relative overflow-hidden group border border-zinc-800 bg-black/5 backdrop-blur-md shadow-sm active:scale-95 transition-all"
                        >
                            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-black text-[5px] font-black text-white uppercase tracking-tighter shadow-sm">PREMIUM</div>
                            <div className="absolute inset-0 bg-gradient-to-br from-zinc-500/5 to-transparent opacity-10" />
                            <div className="w-6 h-6 flex items-center justify-center mb-1 mix-blend-luminosity opacity-70">
                                <SifraLibraryLogo className="w-8 h-8" />
                            </div>
                            <div className="text-left relative z-10">
                                <h3 className="text-[10px] font-black text-gray-900 leading-tight tracking-tight uppercase opacity-80">Library</h3>
                                <p className="text-[6px] font-black text-gray-500 uppercase tracking-widest mt-0.5">Matrix Ecosystem</p>
                            </div>
                        </motion.button>

                        {/* 4. SIFRA Core OS */}
                        <motion.button 
                            variants={itemVariants}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onNavigate(View.VOICE_STUDIO)}
                            className="h-18 sm:h-20 rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between relative overflow-hidden group border border-pink-500/30 bg-black/5 backdrop-blur-md shadow-sm active:scale-95 transition-all"
                        >
                            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-pink-500/90 text-[6px] font-black text-white uppercase tracking-tighter shadow-sm">PRO</div>
                            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-10" />
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md mb-1">
                                <MicrophoneIcon className="w-3 h-3" />
                            </div>
                            <div className="text-left relative z-10">
                                <h3 className="text-[10px] font-black text-gray-900 leading-tight tracking-tight uppercase">SIFRA Core OS</h3>
                                <p className="text-[6px] font-black text-pink-600 uppercase tracking-widest mt-0.5">Pitch, Speed, Emotion, Breath</p>
                            </div>
                        </motion.button>

                    </div>

                </div>
            </motion.div>

            {/* System Ecology Section (Utility) */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-[8px] font-black text-amber-600/40 uppercase tracking-widest">Sifra Essentials</h3>
                    <div className="h-[1px] flex-1 mx-3 bg-amber-500/10" />
                </div>
                <div className="grid grid-cols-4 gap-2">
                    <UtilityModule label="Browser" subtitle="Sifra Net" icon={<SifraBrowserLogo />} color="from-amber-200 to-amber-500" onClick={() => onNavigate(View.SIFRA_BROWSER)} />
                    <UtilityModule label="Calculator" subtitle="Sifra Logic" icon={<SifraCalculatorLogo />} color="from-amber-200 to-amber-500" onClick={() => onNavigate(View.SIFRA_CALCULATOR)} />
                    <UtilityModule label="Calendar" subtitle="Sifra Sync" icon={<SifraCalendarLogo />} color="from-amber-200 to-amber-500" onClick={() => onNavigate(View.PERSONAL_CALENDAR)} />
                    <UtilityModule label="Clock" subtitle="Sifra Time" icon={<SifraClockLogo />} color="from-amber-200 to-amber-500" onClick={() => onNavigate(View.SIFRA_CLOCK)} />
                    <UtilityModule label="Weather" subtitle="Sifra Sky" icon={<SifraWeatherLogo />} color="from-amber-200 to-amber-500" onClick={() => onNavigate(View.SIFRA_WEATHER)} />
                    <UtilityModule label="Maps" subtitle="Sifra Earth" icon={<SifraMapsLogo />} color="from-amber-200 to-amber-500" onClick={() => onNavigate(View.SIFRA_MAPS)} />
                    <UtilityModule label="Law For You" subtitle="Sifra Legal" icon={<SifraLawLogo />} color="from-amber-200 to-amber-500" onClick={() => {}} />
                </div>
            </div>

            {/* Premium Hub Section */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-[8px] font-black text-amber-600/40 uppercase tracking-widest">Premium Assets</h3>
                    <div className="h-[1px] flex-1 mx-3 bg-amber-500/10" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <PremiumModule label="Account" subtitle="Identity" onClick={() => onNavigate(View.ACCOUNT_DETAILS)} icon={<UserIcon />} />
                    <PremiumModule label="Benefits" subtitle="Premiums" onClick={() => onNavigate(View.PLAN)} icon={<SifraPlanLogo />} />
                    <PremiumModule label="Wallet" subtitle="Cards" onClick={() => onNavigate(View.YOUR_CARD)} icon={<SifraCardLogo />} />
                </div>
            </div>

            {/* Quick Modules: Daily Task, Travel Guide, Moner Dana */}
            <div className="flex gap-2 mt-4 px-1">
                {/* 1. Daily Task */}
                <div 
                    role="button"
                    tabIndex={0}
                    onClick={() => onNavigate(View.SIFRA_DAILY_TASK)}
                    className="flex-1 relative h-20 sm:h-22 rounded-[20px] bg-gradient-to-br from-fuchsia-500/15 via-pink-500/10 to-orange-500/15 border border-fuchsia-500/30 backdrop-blur-md shadow-sm overflow-hidden transition-all active:scale-95 hover:shadow-md cursor-pointer flex flex-col justify-between p-2.5 group"
                >
                    <div className="flex items-center justify-between w-full">
                        <div className="w-6 h-6 rounded-lg bg-fuchsia-500/20 text-fuchsia-600 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                            <CheckCircleIcon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[6px] font-black uppercase tracking-widest text-fuchsia-700/80 bg-fuchsia-500/15 px-1.5 py-0.5 rounded-full border border-fuchsia-500/20">
                            TASK
                        </span>
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-[11px] sm:text-xs font-black tracking-tight text-gray-900 leading-tight">Daily Task</span>
                        <span className="text-[7.5px] font-bold text-fuchsia-600/90 tracking-wide mt-0.5">দৈনিক কাজ</span>
                    </div>
                </div>

                {/* 2. SIFRA Explorer */}
                <div 
                    role="button"
                    tabIndex={0}
                    onClick={() => onNavigate(View.TRAVEL_GUIDE)}
                    className="flex-1 relative h-20 sm:h-22 rounded-[20px] bg-gradient-to-br from-orange-500/15 via-amber-500/10 to-rose-500/15 border border-orange-500/30 backdrop-blur-md shadow-sm overflow-hidden transition-all active:scale-95 hover:shadow-md cursor-pointer flex flex-col justify-between p-2.5 group"
                >
                    <div className="flex items-center justify-between w-full">
                        <div className="w-6 h-6 rounded-lg bg-orange-500/20 text-[#E66A23] flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                            <MapIcon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[6px] font-black uppercase tracking-widest text-orange-700/80 bg-orange-500/15 px-1.5 py-0.5 rounded-full border border-orange-500/20">
                            VOYAGE
                        </span>
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-[11px] sm:text-xs font-black tracking-tight text-gray-900 leading-tight">SIFRA Explorer</span>
                        <span className="text-[7.5px] font-bold text-orange-600/90 tracking-wide mt-0.5">ভ্রমণ ও এআই গাইড</span>
                    </div>
                </div>

                {/* 3. Moner Dana */}
                <div 
                    role="button"
                    tabIndex={0}
                    onClick={() => onNavigate(View.MONER_DANA)}
                    className="flex-1 relative h-20 sm:h-22 rounded-[20px] bg-gradient-to-br from-lime-500/15 via-emerald-500/10 to-teal-500/15 border border-emerald-500/30 backdrop-blur-md shadow-sm overflow-hidden transition-all active:scale-95 hover:shadow-md cursor-pointer flex flex-col justify-between p-2.5 group"
                >
                    <div className="flex items-center justify-between w-full">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-600 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                            <HeartSparkleIcon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[6px] font-black uppercase tracking-widest text-emerald-700/80 bg-emerald-500/15 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                            DIARY
                        </span>
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-[11px] sm:text-xs font-black tracking-tight text-gray-900 leading-tight">Moner Dana</span>
                        <span className="text-[7.5px] font-bold text-emerald-600/90 tracking-wide mt-0.5">মনের ডানা</span>
                    </div>
                </div>
            </div>

            {/* New Apps Section */}
            <div className="flex flex-col gap-3 mt-2">
                <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick={() => onNavigate(View.SHARE)}
                        className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl active:scale-95 transition-transform"
                    >
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500">
                            <ShareIcon className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                            <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-800">Sifra Share</h4>
                            <p className="text-[8px] font-bold text-gray-500">Neural Network</p>
                        </div>
                    </button>
                    
                    <button 
                        onClick={() => onNavigate(View.USER_INSIGHTS)}
                        className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-2xl active:scale-95 transition-transform"
                    >
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                            <GlobeAltIcon className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                            <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-800">Visit Our Website</h4>
                            <p className="text-[8px] font-bold text-gray-500">Official Platforms & Ecosystem</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Cinematic Audio Script Modal */}
            <CinematicAudioScriptModal 
                isOpen={showScriptModal} 
                onClose={() => setShowScriptModal(false)} 
            />
        </div>
    );
};

export default HomeView;
