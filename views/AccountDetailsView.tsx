
import React, { useMemo, useState } from 'react';
import { UserProfile, View, THEMES } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import ShieldCheckIcon from '../components/icons/ShieldCheckIcon';
import XMarkIcon from '../components/icons/XMarkIcon';
import SparklesIcon from '../components/icons/SparklesIcon';
import BoltIcon from '../components/icons/BoltIcon';
import HeartSparkleIcon from '../components/icons/HeartSparkleIcon';
import ChevronRightIcon from '../components/icons/ChevronRightIcon';
import DiamondIcon from '../components/icons/DiamondIcon';

interface AccountDetailsViewProps {
    userProfile: UserProfile;
    onClose: () => void;
    onNavigate: (view: View) => void;
}

// Futuristic Glass Card Component
const NeonGlassCard: React.FC<{ children: React.ReactNode; className?: string; color?: string; isDark?: boolean }> = ({ children, className = "", color = "rgba(59, 130, 246, 0.5)", isDark = true }) => (
    <div className={`relative overflow-hidden rounded-[2.5rem] backdrop-blur-2xl border shadow-[0_8px_32px_rgba(0,0,0,0.1)] ${isDark ? 'bg-white/5 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]' : 'bg-white/80 border-black/5 shadow-sm'} ${className}`}>
        <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent`} />
        <div className="absolute -inset-[100%] opacity-20 pointer-events-none" style={{ background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)`, transform: 'scale(0.5)' }} />
        {children}
    </div>
);

const IntelligenceModule: React.FC<{ 
    name: string; 
    isActive: boolean; 
    icon: React.ReactNode; 
    color: string;
    isDark: boolean;
    onClick: () => void 
}> = ({ name, isActive, icon, color, isDark, onClick }) => (
    <motion.button 
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="w-full relative group"
    >
        <div className={`absolute inset-0 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${color}`} />
        <div className={`relative flex items-center justify-between p-5 rounded-[2rem] border backdrop-blur-xl transition-all ${isDark ? 'bg-white/5 border-white/10 group-hover:bg-white/10' : 'bg-white/80 border-black/5 group-hover:bg-white shadow-sm'}`}>
            <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden ${isActive ? color : (isDark ? 'bg-slate-800' : 'bg-gray-100')}`}>
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {React.cloneElement(icon as React.ReactElement, { className: "w-7 h-7 text-white" })}
                </div>
                <div className="text-left">
                    <h4 className={`text-lg font-black tracking-tight leading-tight ${isDark ? 'text-white' : 'text-gray-800'}`}>{name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'}`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-emerald-400' : 'text-rose-500'}`}>
                            {isActive ? 'Module Active' : 'Offline / Encrypted'}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-end gap-1">
                <ChevronRightIcon className={`transition-colors ${isDark ? 'text-white/20 group-hover:text-white/60' : 'text-gray-300 group-hover:text-gray-600'}`} />
                {!isActive && <span className={`text-[8px] font-black uppercase tracking-tighter ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Activation Required</span>}
            </div>
        </div>
    </motion.button>
);

const AccountDetailsView: React.FC<AccountDetailsViewProps> = ({ userProfile, onClose, onNavigate }) => {
    const [selectedTier, setSelectedTier] = useState<string | null>(null);
    const [showComingSoon, setShowComingSoon] = useState(false);

    const currentTheme = THEMES.find(t => t.id === userProfile.themeId) || THEMES[0];
    const isDark = userProfile.themeId === 'dark-matrix';

    const issueDate = useMemo(() => new Date(userProfile.joinDate), [userProfile.joinDate]);
    const expiryDate = useMemo(() => {
        const d = new Date(issueDate);
        d.setFullYear(d.getFullYear() + 1);
        return d;
    }, [issueDate]);

    const formatDate = (date: Date) => date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const TIERS = [
        { id: 'txon', name: 'SIFRA T-XON CORE', icon: <SparklesIcon />, active: true, version: 'v2.8.4 Stable', color: 'bg-gradient-to-br from-sky-400 to-indigo-600' },
        { id: 'quantum', name: 'QUANTUM LEAP V3', icon: <BoltIcon />, active: false, version: 'v3.0.0 Alpha', color: 'bg-gradient-to-br from-purple-500 to-violet-800' },
        { id: 'soul', name: 'PREMIUM SOUL LINK', icon: <HeartSparkleIcon />, active: false, version: 'v5.1.0 Experimental', color: 'bg-gradient-to-br from-rose-500 to-pink-700' },
    ];

    const currentTierData = TIERS.find(t => t.id === selectedTier);

    return (
        <div className={`h-full flex flex-col animate-fade-in font-sans overflow-hidden bg-gradient-to-br ${currentTheme.gradient} ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none">
                <div className={`absolute top-[-10%] right-[-10%] w-[60%] h-[50%] blur-[120px] rounded-full ${isDark ? 'bg-indigo-600/20' : 'bg-indigo-400/20'}`} />
                <div className={`absolute bottom-[-5%] left-[-10%] w-[50%] h-[50%] blur-[100px] rounded-full ${isDark ? 'bg-rose-600/10' : 'bg-pink-400/20'}`} />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 brightness-50" />
            </div>

            {/* Futuristic Header */}
            <header className={`p-8 flex items-center justify-between relative z-10 backdrop-blur-md border-b border-black/5 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                <div className="flex items-center gap-6">
                    <button 
                        onClick={onClose} 
                        className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all active:scale-90 shadow-inner ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/50 border-black/5 hover:bg-white'}`}
                    >
                        <ArrowLeftIcon />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter uppercase italic leading-none">Security Center</h1>
                        <p className={`text-[10px] font-black uppercase tracking-[0.4em] mt-1.5 flex items-center gap-2 ${isDark ? 'text-indigo-400' : 'text-pink-500'}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Session Encrypted
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className={`text-[8px] font-black uppercase tracking-widest ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Auth Level</span>
                    <span className="text-sm font-black">Tier 01 Master</span>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 space-y-12 pb-32 relative z-10">
                
                {/* PILOT IDENTITY SECTION */}
                <section className="space-y-6">
                    <div className="flex items-center gap-6 p-2">
                        <div className="relative group">
                            <div className={`absolute -inset-1 rounded-[2.5rem] blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt ${isDark ? 'bg-gradient-to-tr from-pink-500 via-indigo-500 to-sky-400' : 'bg-gradient-to-tr from-pink-400 via-rose-400 to-orange-400'}`}></div>
                            <div className={`relative w-24 h-24 rounded-[2.2rem] p-1 border ${isDark ? 'bg-black border-white/20' : 'bg-white border-black/5 shadow-md'}`}>
                                <img 
                                    src={userProfile.avatar || `https://ui-avatars.com/api/?name=${userProfile.name}&background=0D0D12&color=fff&bold=true`} 
                                    className="w-full h-full rounded-[1.8rem] object-cover bg-[#0D0D12]"
                                    alt="pilot"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h2 className={`text-3xl font-black tracking-tighter uppercase ${isDark ? 'text-white' : 'text-gray-800'}`}>{userProfile.name}</h2>
                            <div className="flex flex-col gap-0.5">
                                <span className={`text-[10px] font-mono tracking-widest uppercase opacity-70 italic ${isDark ? 'text-indigo-300' : 'text-pink-500'}`}>Verified Neural Carrier</span>
                                <span className={`text-xs font-mono tracking-tighter mt-1 px-2 py-0.5 rounded-lg border self-start ${isDark ? 'text-white/40 bg-white/5 border-white/5' : 'text-gray-500 bg-white border-black/5 shadow-sm'}`}>
                                    UID: {userProfile.userId.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <NeonGlassCard className="p-5" color="rgba(59, 130, 246, 0.3)" isDark={isDark}>
                            <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Join Vector</p>
                            <p className="text-lg font-black tracking-tighter">{formatDate(issueDate)}</p>
                        </NeonGlassCard>
                        <NeonGlassCard className="p-5" color="rgba(244, 63, 94, 0.3)" isDark={isDark}>
                            <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Status</p>
                            <div className="flex items-center gap-2">
                                <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
                                <p className="text-lg font-black tracking-tighter uppercase italic">Confirmed</p>
                            </div>
                        </NeonGlassCard>
                    </div>
                </section>

                {/* PLAN STATUS SECTION */}
                <section className="space-y-4">
                    <div className="flex items-end justify-between px-2">
                        <h3 className={`text-xs font-black uppercase tracking-[0.4em] ${isDark ? 'text-indigo-400' : 'text-pink-500'}`}>প্ল্যান স্ট্যাটাস / Plan Status</h3>
                    </div>
                    
                    <div className={`p-6 rounded-[2.5rem] border backdrop-blur-xl flex flex-col items-center text-center gap-4 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/80 border-black/5'}`}>
                        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.15)]">
                            <DiamondIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <span className="inline-block px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-widest text-rose-400 bg-rose-500/10 border border-rose-500/30 mb-2">
                                কোনো প্ল্যান যুক্ত নেই
                            </span>
                            <h4 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-800'}`}>কোনরকম প্ল্যান যুক্ত নেই</h4>
                            <p className={`text-xs font-medium max-w-sm mt-1 leading-relaxed ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                                বর্তমানে আপনার এই অ্যাকাউন্টে কোনো সক্রিয় সাবস্ক্রিপশন বা পেইড প্ল্যান যুক্ত নেই।
                            </p>
                        </div>
                    </div>
                </section>

                <div className="text-center py-6">
                    <p className={`text-[10px] font-black uppercase tracking-[0.8em] ${isDark ? 'text-white/10' : 'text-gray-300'}`}>S-Hybrid Virtual Core v3.0</p>
                </div>

            </main>

            {/* PREMIUM DATA MODAL */}
            <AnimatePresence>
                {selectedTier && currentTierData && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
                    >
                        <motion.div 
                            initial={{ scale: 0.8, y: 100, rotateX: 20 }}
                            animate={{ scale: 1, y: 0, rotateX: 0 }}
                            exit={{ scale: 0.8, y: 100, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="w-full max-w-md overflow-hidden relative"
                        >
                            <NeonGlassCard className="p-10 border-white/20" color={currentTierData.active ? "rgba(52, 211, 153, 0.4)" : "rgba(244, 63, 94, 0.4)"} isDark={isDark}>
                                <div className="flex justify-between items-start mb-8">
                                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl relative ${currentTierData.color}`}>
                                        <div className="absolute inset-0 bg-white/20 mix-blend-overlay" />
                                        {React.cloneElement(currentTierData.icon as React.ReactElement, { className: "w-10 h-10 text-white" })}
                                    </div>
                                    <button 
                                        onClick={() => setSelectedTier(null)} 
                                        className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-gray-50 border-black/5 hover:bg-gray-100'}`}
                                    >
                                        <XMarkIcon className={`w-5 h-5 ${isDark ? 'text-white/60' : 'text-gray-400'}`} />
                                    </button>
                                </div>

                                <div className="space-y-2 mb-10">
                                    <h3 className={`text-3xl font-black tracking-tighter uppercase italic ${isDark ? 'text-white' : 'text-gray-800'}`}>{currentTierData.name}</h3>
                                    <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${currentTierData.active ? 'text-emerald-400' : 'text-rose-500'}`}>
                                        {currentTierData.active ? 'System Fully Synchronized' : 'Access Restricted / Locked'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-2 mb-10">
                                    {[
                                        { label: 'Layer Protocol', value: currentTierData.version },
                                        { label: 'Deployment Date', value: currentTierData.active ? formatDate(issueDate) : 'SIGNAL BLOCKED' },
                                        { label: 'Ceiling Date', value: currentTierData.active ? formatDate(expiryDate) : 'SIGNAL BLOCKED', color: currentTierData.active ? 'text-rose-400' : '' },
                                        { label: 'Auth Node', value: 'S-Hybrid Master 01', color: isDark ? 'text-indigo-400' : 'text-pink-500' }
                                    ].map((item, i) => (
                                        <div key={i} className={`flex justify-between items-center py-4 border-b px-2 ${isDark ? 'border-white/5' : 'border-black/5'}`}>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/20' : 'text-gray-400'}`}>{item.label}</span>
                                            <span className={`text-xs font-black uppercase tracking-widest ${item.color || (isDark ? 'text-white' : 'text-gray-800')}`}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>

                                {currentTierData.active ? (
                                    <button 
                                        onClick={() => { setSelectedTier(null); onNavigate(View.YOUR_CARD); }}
                                        className={`group relative w-full py-6 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.3em] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-xl ${isDark ? 'bg-white text-black shadow-[0_20px_50px_rgba(255,255,255,0.1)]' : 'bg-pink-500 text-white shadow-pink-500/20'}`}
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-3">
                                            Open Security Card <ChevronRightIcon className="w-4 h-4" />
                                        </span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => setShowComingSoon(true)}
                                        className="w-full py-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.3em] shadow-xl hover:shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                                    >
                                        <BoltIcon className="w-4 h-4" /> Initialize Activation
                                    </button>
                                )}
                            </NeonGlassCard>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* COMING SOON OVERLAY */}
            <AnimatePresence>
                {showComingSoon && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 50, rotate: -2 }}
                            animate={{ scale: 1, y: 0, rotate: 0 }}
                            exit={{ scale: 0.9, y: 50, opacity: 0 }}
                            className={`rounded-[3rem] p-12 max-w-sm w-full text-center shadow-2xl border ${isDark ? 'bg-slate-900 border-indigo-500/20 shadow-[0_0_100px_rgba(99,102,241,0.2)]' : 'bg-white border-black/5'}`}
                        >
                            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border ${isDark ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-pink-50/50 border-pink-100'}`}>
                                <SparklesIcon className={`w-10 h-10 ${isDark ? 'text-indigo-400' : 'text-pink-500'}`} />
                            </div>
                            <h2 className={`text-3xl font-black tracking-tighter uppercase italic mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Transmission Delayed</h2>
                            <p className={`text-sm font-medium leading-relaxed mb-12 uppercase tracking-wider ${isDark ? 'text-indigo-200/50' : 'text-gray-400'}`}>
                                Payment gateways and subscription matrix are currently out of sync for your regional node. Synchronization expected soon.
                            </p>
                            <button 
                                onClick={() => setShowComingSoon(false)}
                                className={`w-full py-6 rounded-2xl font-black uppercase tracking-widest transition-colors shadow-2xl ${isDark ? 'bg-white text-black hover:bg-indigo-50' : 'bg-pink-500 text-white hover:bg-pink-600'}`}
                            >
                                Acknowledged
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AccountDetailsView;
