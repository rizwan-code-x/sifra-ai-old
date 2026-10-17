
import React, { useMemo, useState } from 'react';
import { UserProfile, Theme } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import ShieldCheckIcon from '../components/icons/ShieldCheckIcon';
import XMarkIcon from '../components/icons/XMarkIcon';
import BoltIcon from '../components/icons/BoltIcon';
import HeartSparkleIcon from '../components/icons/HeartSparkleIcon';
import SifraLogo from '../components/SifraLogo';
import { SifraCardLogo } from '../components/SifraBrandedIcons';

interface YourCardViewProps {
    userProfile: UserProfile;
    onClose: () => void;
    isDark: boolean;
    currentTheme: Theme;
}

// High-End International Chipset
const InternationalChipset = ({ style = "gold" }: { style?: 'gold' | 'silver' | 'platinum' }) => {
    const colors = {
        gold: "from-[#FDE68A] via-[#B45309] to-[#FDE68A]",
        silver: "from-[#E2E8F0] via-[#475569] to-[#E2E8F0]",
        platinum: "from-[#F1F5F9] via-[#94A3B8] to-[#F1F5F9]"
    };
    return (
        <div className={`w-14 h-11 rounded-xl bg-gradient-to-br ${colors[style]} p-[1.5px] shadow-lg relative overflow-hidden`}>
            <div className="w-full h-full rounded-[10px] bg-black/10 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute inset-0 opacity-30 grid grid-cols-4 grid-rows-3 gap-0.5 p-1">
                    {[...Array(12)].map((_, i) => <div key={i} className="border border-white/20" />)}
                </div>
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/20" />
                <div className="absolute top-0 left-1/2 w-[1px] h-full bg-white/20" />
            </div>
        </div>
    );
};

const DetailRow: React.FC<{ label: string; value: string; color?: string; disabled?: boolean }> = ({ label, value, color = "text-gray-800", disabled }) => (
    <div className={`flex justify-between items-center py-4 border-b border-gray-100 ${disabled ? 'opacity-40' : ''}`}>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</span>
        <span className={`text-sm font-black ${disabled ? 'text-gray-300 italic' : color}`}>{value}</span>
    </div>
);

const PaymentButton: React.FC<{ icon: string; name: string; onClick: () => void }> = ({ icon, name, onClick }) => (
    <button 
        onClick={onClick}
        className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all active:scale-95 group"
    >
        <span className="text-xl group-hover:scale-110 transition-transform">{icon}</span>
        <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{name}</span>
    </button>
);

const YourCardView: React.FC<YourCardViewProps> = ({ userProfile, onClose, isDark, currentTheme }) => {
    const [activePage, setActivePage] = useState(1);
    const [isFlipped, setIsFlipped] = useState(false);
    const [showComingSoon, setShowComingSoon] = useState(false);
    
    const isTierActive = activePage === 1;

    const issueDate = useMemo(() => new Date(userProfile.joinDate), [userProfile.joinDate]);
    const expiryDate = useMemo(() => {
        const d = new Date(issueDate);
        d.setFullYear(d.getFullYear() + 1);
        return d;
    }, [issueDate]);

    const formatDate = (date: Date) => date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const handleSwitchPage = (page: number) => {
        setIsFlipped(false);
        setActivePage(page);
    };

    return (
        <div className={`h-full w-full flex flex-col overflow-hidden animate-fade-in font-sans ${isDark ? 'bg-black' : 'bg-[#F9FAFB]'}`}>
            {/* Header */}
            <header className={`p-6 flex items-center justify-between backdrop-blur-md sticky top-0 z-20 border-b ${isDark ? 'bg-black/80 border-white/10' : 'bg-white/90 border-slate-200'}`}>
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className={`p-2 -ml-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-900'}`}>
                        <ArrowLeftIcon />
                    </button>
                    <h1 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Identity Hub</h1>
                </div>
                <div className={`px-4 py-1.5 rounded-full flex items-center gap-2 transition-colors ${
                    isTierActive 
                        ? (isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100') 
                        : (isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200')
                }`}>
                    <div className={`w-2 h-2 rounded-full ${isTierActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                    <span className={`text-[9px] font-black uppercase tracking-widest ${
                        isTierActive ? (isDark ? 'text-emerald-400' : 'text-emerald-700') : 'text-slate-500'
                    }`}>
                        {isTierActive ? 'Core Active' : 'Unsubscribed'}
                    </span>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8 pb-32">
                
                {/* 3D CARD COMPONENT */}
                <div className="perspective-1000 w-full py-4 flex items-center justify-center relative cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                    <motion.div 
                        initial={false}
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.8, type: "spring", stiffness: 200, damping: 20 }}
                        className="w-full max-w-[400px] aspect-[1.586/1] relative preserve-3d shadow-2xl rounded-[1.8rem] sm:rounded-[2.2rem]"
                    >
                        {/* FRONT FACE */}
                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={`front-${activePage}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className={`absolute inset-0 w-full h-full backface-hidden rounded-[1.8rem] sm:rounded-[2.2rem] p-6 sm:p-8 flex flex-col justify-between border border-white/10 overflow-hidden shadow-inner ${
                                    activePage === 1 
                                        ? 'bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-black' 
                                        : activePage === 2 
                                        ? 'bg-gradient-to-tr from-[#2E1065] via-[#4C1D95] to-[#7C3AED]'
                                        : 'bg-gradient-to-b from-[#111827] via-[#9F1239] to-[#4C0519]'
                                }`}
                            >
                                <div className="flex justify-between items-start relative z-10">
                                    <SifraCardLogo className="w-12 h-12 -ml-3 -mt-2" />
                                    <div className="text-right">
                                        <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] ${
                                            activePage === 1 ? 'text-sky-400' : activePage === 2 ? 'text-violet-300' : 'text-rose-200'
                                        }`}>
                                            {activePage === 1 ? 'T-XON Core' : activePage === 2 ? 'Quantum V3' : 'Premium Soul'}
                                        </span>
                                        <p className="text-[6px] sm:text-[7px] text-white/30 font-bold uppercase mt-1 tracking-widest">Global Protocol v2.9</p>
                                    </div>
                                </div>

                                <div className="relative z-10 flex items-center justify-between">
                                    <InternationalChipset style={activePage === 3 ? 'platinum' : activePage === 2 ? 'silver' : 'gold'} />
                                    {activePage === 3 && (
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-rose-400/30 flex items-center justify-center">
                                            <HeartSparkleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-rose-300" />
                                        </div>
                                    )}
                                </div>

                                <div className="relative z-10 flex flex-col gap-1">
                                    <div className="flex items-end justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[7px] sm:text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Authenticated Holder</span>
                                            <span className={`text-lg sm:text-xl font-bold tracking-tight uppercase leading-none ${activePage === 3 ? 'text-[#FDE68A]' : 'text-white'}`}>
                                                {userProfile.name || "Sifra Explorer"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                             <span className="text-[6px] sm:text-[7px] font-mono text-white/20 uppercase">SECURE LINK</span>
                                             <ShieldCheckIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${isTierActive ? 'text-emerald-400' : 'text-white/10'}`} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* BACK FACE */}
                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={`back-${activePage}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className={`absolute inset-0 w-full h-full backface-hidden rounded-[1.8rem] sm:rounded-[2.2rem] border overflow-hidden rotate-y-180 flex flex-col p-0 ${
                                    activePage === 1 
                                        ? 'bg-[#0F172A] border-white/5' 
                                        : activePage === 2 
                                        ? 'bg-gradient-to-bl from-[#1E1B4B] to-[#4C1D95] border-white/10'
                                        : 'bg-gradient-to-tr from-[#4C0519] to-[#831843] border-white/20 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]'
                                }`}
                            >
                                <div className={`w-full h-10 sm:h-12 mt-6 sm:mt-8 ${activePage === 3 ? 'bg-gradient-to-r from-black via-slate-900 to-black' : 'bg-black'}`} />
                                <div className="p-6 sm:p-8 flex flex-col flex-1">
                                    <div className={`w-full h-8 sm:h-10 rounded-lg border flex items-center px-4 mb-6 sm:mb-8 ${
                                        activePage === 1 ? 'bg-white/5 border-white/10' :
                                        activePage === 2 ? 'bg-white/10 border-white/20 shadow-inner' :
                                        'bg-black/40 border-[#FDE68A]/20'
                                    }`}>
                                        <span className={`text-[8px] sm:text-[9px] font-mono tracking-wider uppercase ${
                                            activePage === 3 ? 'text-[#FDE68A]/60' : 'text-white/40'
                                        }`}>
                                            {activePage === 1 ? 'S-Hybrid Core' : activePage === 2 ? 'Quantum Neural' : 'Soul Link Prime'} / UID-{userProfile.userId.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 sm:gap-8">
                                        <div>
                                            <p className={`text-[6px] sm:text-[7px] font-black uppercase tracking-[0.2em] mb-1 ${
                                                activePage === 3 ? 'text-[#FDE68A]/40' : 'text-white/30'
                                            }`}>Deployment Date</p>
                                            <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${isTierActive ? 'text-white' : 'text-white/10'}`}>
                                                {isTierActive ? formatDate(issueDate) : '---- -- --'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className={`text-[6px] sm:text-[7px] font-black uppercase tracking-[0.2em] mb-1 ${
                                                activePage === 3 ? 'text-[#FDE68A]/40' : 'text-white/30'
                                            }`}>Ceiling Date</p>
                                            <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${isTierActive ? (activePage === 3 ? 'text-[#FDE68A]' : 'text-rose-500') : 'text-white/10'}`}>
                                                {isTierActive ? formatDate(expiryDate) : '---- -- --'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-auto flex justify-between items-end">
                                        <div className="flex flex-col gap-1 sm:gap-2">
                                             <div className="flex gap-1">
                                                 <div className={`w-3 h-1 rounded-full ${activePage === 1 ? 'bg-sky-500' : activePage === 2 ? 'bg-violet-500' : 'bg-rose-500'}`} />
                                                 <div className="w-1 h-1 rounded-full bg-white/20" />
                                             </div>
                                             <p className="text-[5px] sm:text-[6px] text-white/20 uppercase max-w-[120px] sm:max-w-[140px] leading-relaxed">
                                                Digital identifier linked to Sifra node matrix. Multi-layer encryption active for neural sync.
                                             </p>
                                        </div>
                                        <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl p-1 sm:p-1.5 shadow-xl ${
                                            activePage === 3 ? 'bg-[#FDE68A]' : 'bg-white/90'
                                        }`}>
                                             <div className="w-full h-full grid grid-cols-4 grid-rows-4 gap-0.5 bg-black">
                                                 {[...Array(16)].map((_, i) => (
                                                     <div key={i} className={Math.random() > 0.4 ? (activePage === 3 ? "bg-[#FDE68A]" : "bg-white") : "bg-black"} />
                                                 ))}
                                             </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
                </div>

                <p className={`text-center text-[9px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-white/20' : 'text-slate-400'}`}>Tap Card to Inspect</p>

                <div className={`rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-sm border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center gap-4 mb-6 sm:mb-8">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-inner ${
                            activePage === 1 ? 'bg-emerald-50 text-emerald-600' :
                            activePage === 2 ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                             {activePage === 1 ? <ShieldCheckIcon /> : activePage === 2 ? <BoltIcon /> : <HeartSparkleIcon />}
                        </div>
                        <div>
                            <h3 className={`text-base sm:text-lg font-black leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {activePage === 1 ? 'Subscription Active' : activePage === 2 ? 'Quantum Leap' : 'Premium Plus'}
                            </h3>
                            <p className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest mt-1 ${
                                isTierActive ? 'text-emerald-500' : 'text-slate-300'
                            }`}>
                                {isTierActive ? 'Tier Fully Verified' : 'Locked Asset'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <DetailRow label="System Status" value={isTierActive ? "Verified Online" : "Inactive Node"} color={isTierActive ? "text-emerald-600" : (isDark ? "text-white/20" : "text-slate-400")} />
                        <DetailRow label="Asset Version" value={activePage === 1 ? "v2.8.4 Stable" : activePage === 2 ? "v3.0.0 Alpha" : "v5.1.0 Experimental"} color={isDark ? "text-white/70" : "text-slate-700"} />
                        <DetailRow label="Deployment" value={isTierActive ? formatDate(issueDate) : "Access Denied"} disabled={!isTierActive} />
                        <DetailRow label="End Validation" value={isTierActive ? formatDate(expiryDate) : "Access Denied"} disabled={!isTierActive} color="text-rose-500" />
                    </div>
                </div>

                <div className="flex justify-center gap-4 sm:gap-8">
                    {[1, 2, 3].map((num) => (
                        <button 
                            key={num}
                            onClick={() => handleSwitchPage(num)}
                            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center relative ${
                                activePage === num 
                                    ? (isDark ? 'bg-white text-black shadow-xl scale-110' : 'bg-slate-900 text-white shadow-xl scale-110')
                                    : (isDark ? 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50')
                            }`}
                        >
                            {num}
                        </button>
                    ))}
                </div>
            </main>

            {/* COMING SOON OVERLAY */}
            <AnimatePresence>
                {showComingSoon && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className={`${isDark ? 'bg-slate-900' : 'bg-white'} rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl`}
                        >
                            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-6">
                                <BoltIcon className="w-8 h-8 text-amber-500" />
                            </div>
                            <h2 className={`text-xl font-black tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Gateways Offline</h2>
                            <button onClick={() => setShowComingSoon(false)} className={`w-full py-4 rounded-2xl font-bold ${isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'}`}>Acknowledged</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .perspective-1000 { perspective: 1000px; }
                .preserve-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
            `}</style>
        </div>
    );
};

export default YourCardView;
