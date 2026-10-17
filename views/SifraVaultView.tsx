
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import XMarkIcon from '../components/icons/XMarkIcon';
import LockClosedIcon from '../components/icons/LockClosedIcon';
import CameraIcon from '../components/icons/CameraIcon';
import VideoCameraIcon from '../components/icons/VideoCameraIcon';
import DocumentTextIcon from '../components/icons/DocumentTextIcon';
import SpeakerWaveIcon from '../components/icons/SpeakerWaveIcon';
import BookmarkSquareIcon from '../components/icons/BookmarkSquareIcon';
import ShieldCheckIcon from '../components/icons/ShieldCheckIcon';
import PlusCircleIcon from '../components/icons/PlusCircleIcon';
import AdjustmentsHorizontalIcon from '../components/icons/AdjustmentsHorizontalIcon';
import EllipsisVerticalIcon from '../components/icons/EllipsisVerticalIcon';
import ChevronRightIcon from '../components/icons/ChevronRightIcon';
import BoltIcon from '../components/icons/BoltIcon';
import TrashIcon from '../components/icons/TrashIcon';
import SparklesIcon from '../components/icons/SparklesIcon';

type VaultState = 'splash' | 'setup' | 'locked' | 'dashboard' | 'category' | 'settings';
type VaultCategory = 'Photos' | 'Videos' | 'Documents' | 'Audio' | 'Notes';
type LockType = 'PIN' | 'BIOMETRIC' | 'PATTERN';

interface VaultConfig {
    pin: string;
    fakePin: string;
    biometricEnabled: boolean;
    patternPoints: number[];
    autoLockMinutes: number;
    intruderSelfie: boolean;
    lastBackup: string;
}

const CATEGORIES: { name: VaultCategory, icon: React.ReactNode, color: string, count: number }[] = [
    { name: 'Photos', icon: <CameraIcon />, color: 'bg-cyan-500', count: 12 },
    { name: 'Videos', icon: <VideoCameraIcon />, color: 'bg-purple-500', count: 4 },
    { name: 'Documents', icon: <DocumentTextIcon />, color: 'bg-blue-500', count: 8 },
    { name: 'Audio', icon: <SpeakerWaveIcon />, color: 'bg-emerald-500', count: 15 },
    { name: 'Notes', icon: <BookmarkSquareIcon />, color: 'bg-amber-500', count: 22 },
];

const SifraVaultView: React.FC<{ userProfile: UserProfile; onClose: () => void }> = ({ userProfile, onClose }) => {
    const [config, setConfig] = useLocalStorage<VaultConfig>(`sifra_vault_cfg_${userProfile.userId}`, {
        pin: '',
        fakePin: '0000',
        biometricEnabled: true,
        patternPoints: [],
        autoLockMinutes: 5,
        intruderSelfie: false,
        lastBackup: 'Never'
    });

    const [view, setView] = useState<VaultState>('splash');
    const [lockType, setLockType] = useState<LockType>('PIN');
    const [selectedCat, setSelectedCat] = useState<VaultCategory | null>(null);
    const [pinInput, setPinInput] = useState('');
    const [isBiometricActive, setIsBiometricActive] = useState(false);
    const [isFakeVault, setIsFakeVault] = useState(false);
    const [shakeTrigger, setShakeTrigger] = useState(0);

    useEffect(() => {
        const t = setTimeout(() => {
            if (!config.pin) setView('setup');
            else setView('locked');
        }, 1500);
        return () => clearTimeout(t);
    }, [config.pin]);

    const handlePinEntry = (num: string) => {
        if (pinInput.length >= 4) return;
        const newPin = pinInput + num;
        setPinInput(newPin);

        if (newPin.length === 4) {
            setTimeout(() => {
                if (newPin === config.pin) {
                    setIsFakeVault(false);
                    setView('dashboard');
                    setPinInput('');
                } else if (newPin === config.fakePin) {
                    setIsFakeVault(true);
                    setView('dashboard');
                    setPinInput('');
                } else {
                    setShakeTrigger(prev => prev + 1);
                    setPinInput('');
                }
            }, 300);
        }
    };

    const handleUnlockBiometric = () => {
        if (!config.biometricEnabled) return;
        setIsBiometricActive(true);
        setTimeout(() => {
            setView('dashboard');
            setIsBiometricActive(false);
        }, 1500);
    };

    const renderSplash = () => (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center bg-[#05070A]"
        >
            <div className="relative">
                <motion.div 
                    animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-[-40px] bg-cyan-500/10 blur-[60px] rounded-full"
                />
                <LockClosedIcon className="w-24 h-24 text-cyan-400 relative z-10 drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]" />
            </div>
            <h1 className="mt-10 text-3xl font-black italic tracking-[0.3em] text-white uppercase">Sifra Vault</h1>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em] mt-3">Advanced Encryption Core</p>
        </motion.div>
    );

    const renderSetup = () => (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8 bg-[#05070A]"
        >
            <div className="w-20 h-20 bg-cyan-400/10 rounded-[2rem] flex items-center justify-center mb-8 border border-cyan-400/20 shadow-2xl">
                <ShieldCheckIcon className="w-10 h-10 text-cyan-400" />
            </div>
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter text-center">Setup Security</h2>
            <p className="text-white/40 text-sm text-center mt-3 mb-12 max-w-xs leading-relaxed">Choose a 4-digit Master PIN to protect your personal neural space.</p>
            
            <div className="flex gap-5 mb-14">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${pinInput.length > i ? 'bg-cyan-400 border-cyan-400 shadow-[0_0_15px_#22d3ee]' : 'border-white/10'}`} />
                ))}
            </div>

            <div className="grid grid-cols-3 gap-6 max-w-xs w-full">
                {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k, i) => (
                    <button 
                        key={i}
                        onClick={() => {
                            if (k === '⌫') setPinInput(p => p.slice(0, -1));
                            else if (k) {
                                const next = pinInput + k;
                                if (next.length <= 4) {
                                    setPinInput(next);
                                    if (next.length === 4) {
                                        setTimeout(() => {
                                            setConfig({ ...config, pin: next });
                                            setView('dashboard');
                                            setPinInput('');
                                        }, 300);
                                    }
                                }
                            }
                        }}
                        className={`aspect-square rounded-[1.8rem] flex items-center justify-center text-2xl font-black transition-all ${k ? 'bg-white/5 border border-white/5 active:bg-white/10 active:scale-90 text-white' : 'pointer-events-none'}`}
                    >
                        {k}
                    </button>
                ))}
            </div>
        </motion.div>
    );

    const renderLock = () => (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-between p-10 bg-[#05070A]"
        >
            <div className="pt-20 text-center space-y-4">
                <div className="w-20 h-20 bg-cyan-400/5 rounded-[2.2rem] flex items-center justify-center mx-auto border border-cyan-400/10 shadow-[0_0_50px_rgba(34,211,238,0.05)]">
                    <LockClosedIcon className="w-10 h-10 text-cyan-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase italic leading-none">Authorization</h2>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-2">Neural Node Locked</p>
                </div>
            </div>

            <motion.div 
                key={shakeTrigger}
                animate={shakeTrigger ? { x: [-12, 12, -12, 12, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="w-full flex flex-col items-center gap-10"
            >
                {lockType === 'BIOMETRIC' ? (
                    <div className="flex flex-col items-center gap-8">
                        <button 
                            onClick={handleUnlockBiometric}
                            className="relative w-40 h-40 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group active:scale-95 transition-all shadow-2xl"
                        >
                            <motion.div 
                                animate={isBiometricActive ? { scale: [1, 1.8], opacity: [1, 0] } : {}}
                                transition={{ duration: 1.5, repeat: isBiometricActive ? Infinity : 0 }}
                                className="absolute inset-0 bg-cyan-500/20 rounded-full blur-2xl"
                            />
                            <svg className={`w-20 h-20 ${isBiometricActive ? 'text-cyan-400' : 'text-white/20 group-hover:text-cyan-400'} transition-all duration-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.81 4.47c-.45-.45-1.19-.45-1.64 0s-.45 1.19 0 1.64l1.1 1.1c.45.45 1.19.45 1.64 0s.45-1.19 0-1.64l-1.1-1.1zM5.1 16.9l-1.1 1.1c-.45.45-.45 1.19 0 1.64s1.19.45 1.64 0l1.1-1.1c.45-.45.45-1.19 0-1.64s-1.19-.45-1.64 0zM21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                            </svg>
                        </button>
                        <span className="text-xs font-black text-cyan-400 uppercase tracking-[0.3em] animate-pulse">
                            {isBiometricActive ? 'Scanning Link...' : 'Tap for Biometric'}
                        </span>
                        <button onClick={() => setLockType('PIN')} className="text-[10px] font-black text-white/30 uppercase tracking-widest hover:text-white transition-colors">Use PIN Logic</button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center w-full">
                        <div className="flex gap-5 mb-14">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${pinInput.trim().length > i ? 'bg-cyan-400 border-cyan-400 shadow-[0_0_15px_#22d3ee]' : 'border-white/10'}`} />
                            ))}
                        </div>
                        <div className="grid grid-cols-3 gap-6 max-w-xs w-full mb-6">
                            {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k, i) => (
                                <button 
                                    key={i}
                                    onClick={() => {
                                        if (k === '⌫') setPinInput(p => p.slice(0, -1));
                                        else if (k) handlePinEntry(k);
                                    }}
                                    className={`aspect-square rounded-[1.8rem] flex items-center justify-center text-2xl font-black transition-all ${k ? 'bg-white/5 border border-white/5 active:bg-white/10 active:scale-90 text-white' : 'pointer-events-none'}`}
                                >
                                    {k}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setLockType('BIOMETRIC')} className="text-[10px] font-black text-white/30 uppercase tracking-widest hover:text-white transition-colors">Switch to Biometric</button>
                    </div>
                )}
            </motion.div>

            <div className="w-full pb-10 flex flex-col items-center gap-3">
                <div className="w-10 h-0.5 bg-white/10 rounded-full" />
                <p className="text-[8px] font-black text-white/10 uppercase tracking-[1em] text-center italic">SIFRA SECURITY PROTOCOL</p>
            </div>
        </motion.div>
    );

    const renderDashboard = () => (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col p-8 bg-[#05070A] overflow-y-auto premium-scroll"
        >
            <header className="flex justify-between items-start mb-12">
                <div>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-tight">Private File</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.4em]">Secure Node 017x</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setView('settings')} className="p-4 bg-white/5 rounded-[1.5rem] border border-white/10 text-white/60 active:scale-90 transition-all"><AdjustmentsHorizontalIcon className="w-6 h-6" /></button>
                    <button onClick={onClose} className="p-4 bg-white/5 rounded-[1.5rem] border border-white/10 text-white/60 active:scale-90 transition-all"><XMarkIcon className="w-6 h-6" /></button>
                </div>
            </header>

            <section className="mb-12">
                <div className="p-8 rounded-[3rem] bg-gradient-to-br from-indigo-900/40 via-black to-black border border-white/10 relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 blur-[80px] rounded-full group-hover:bg-cyan-500/20 transition-all duration-1000" />
                    <div className="relative z-10 space-y-6">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Encrypted Storage</p>
                                <h3 className="text-4xl font-black text-white tracking-tighter">{isFakeVault ? '0.0' : '2.4'} GB <span className="text-lg opacity-40">/ 128 GB</span></h3>
                            </div>
                            <SparklesIcon className="w-8 h-8 text-cyan-400 opacity-20" />
                        </div>
                        <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/5">
                            <motion.div initial={{ width: 0 }} animate={{ width: isFakeVault ? '0%' : '18%' }} transition={{ duration: 1, delay: 0.5 }} className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500" />
                        </div>
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">{isFakeVault ? 'Global View Mode' : 'Authentic Secure Mode Active'}</p>
                    </div>
                </div>
            </section>

            <div className="space-y-4">
                <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.5em] px-4 mb-2">Categories</h3>
                <div className="grid grid-cols-1 gap-4">
                    {CATEGORIES.map((cat, i) => (
                        <motion.button 
                            key={cat.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => { setSelectedCat(cat.name); setView('category'); }}
                            className="w-full p-6 rounded-[2.5rem] bg-white/[0.03] border border-white/5 flex items-center justify-between group hover:bg-white/5 transition-all relative overflow-hidden"
                        >
                            <div className="flex items-center gap-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl ${cat.color} group-hover:scale-110 transition-transform`}>
                                    {React.cloneElement(cat.icon as React.ReactElement, { className: "w-7 h-7" })}
                                </div>
                                <div className="text-left">
                                    <h4 className="text-lg font-black text-white tracking-tight">{cat.name}</h4>
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-0.5">{isFakeVault ? 0 : cat.count} Items Encrypted</p>
                                </div>
                            </div>
                            <div className="p-3 bg-white/5 rounded-full text-white/20 group-hover:text-white/60 transition-colors"><ChevronRightIcon className="w-5 h-5" /></div>
                        </motion.button>
                    ))}
                </div>
            </div>

            <div className="mt-12 p-10 rounded-[3rem] bg-white/5 border border-white/5 flex flex-col items-center text-center gap-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <ShieldCheckIcon className="w-8 h-8" />
                </div>
                <div>
                    <h4 className="text-xl font-black italic uppercase tracking-widest">End-to-End Encryption</h4>
                    <p className="text-sm text-white/30 mt-2 max-w-[250px] leading-relaxed font-medium">Your files are encrypted locally and never reach our servers in readable format.</p>
                </div>
                <button className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] underline">Learn more about Sifra-E2EE</button>
            </div>
            
            <div className="h-40 shrink-0" />
        </motion.div>
    );

    const renderCategoryView = () => (
        <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="flex-1 flex flex-col bg-[#05070A] h-full"
        >
            <header className="p-8 flex justify-between items-center border-b border-white/5 bg-[#05070A]/80 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center gap-6">
                    <button onClick={() => setView('dashboard')} className="p-3 bg-white/5 rounded-2xl active:scale-90 transition-all"><ArrowLeftIcon className="w-6 h-6" /></button>
                    <div>
                        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">{selectedCat}</h2>
                        <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] mt-1.5">Secure View Active</p>
                    </div>
                </div>
                <button className="p-3 bg-white/5 rounded-2xl"><PlusCircleIcon className="w-6 h-6 text-cyan-400" /></button>
            </header>

            <div className="flex-1 p-8 overflow-y-auto premium-scroll">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    {!isFakeVault && [...Array(CATEGORIES.find(c => c.name === selectedCat)?.count || 0)].map((_, i) => (
                        <motion.div 
                            key={i} 
                            initial={{ opacity: 0, scale: 0.9 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            transition={{ delay: i * 0.03 }}
                            className="aspect-square bg-white/5 rounded-[2rem] border border-white/5 relative group overflow-hidden shadow-lg"
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            {selectedCat === 'Photos' ? (
                                <img src={`https://picsum.photos/seed/vault-${i}/400`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                                    <div className="p-4 bg-white/5 rounded-2xl text-white/20 group-hover:text-cyan-400 transition-all">
                                         {React.cloneElement(CATEGORIES.find(c => c.name === selectedCat)?.icon as React.ReactElement, { className: "w-8 h-8" })}
                                    </div>
                                    <span className="text-[10px] font-bold text-white/10 group-hover:text-white/40 uppercase tracking-widest">Item {i + 1}</span>
                                </div>
                            )}
                            <div className="absolute top-4 right-4"><LockClosedIcon className="w-3.5 h-3.5 text-white/20" /></div>
                        </motion.div>
                    ))}
                </div>

                {(!isFakeVault && (CATEGORIES.find(c => c.name === selectedCat)?.count === 0)) || isFakeVault && (
                    <div className="flex flex-col items-center justify-center py-40 opacity-10 space-y-6">
                        <LockClosedIcon className="w-20 h-20" />
                        <p className="text-sm font-black uppercase tracking-[0.5em]">Neural Stack Empty</p>
                    </div>
                )}
            </div>

            <footer className="p-8 pb-12 flex justify-center bg-gradient-to-t from-black to-transparent">
                <button className="flex items-center gap-4 px-10 py-6 bg-white text-black rounded-[2.5rem] font-black uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all text-sm">
                    <PlusCircleIcon className="w-6 h-6" /> Import Files
                </button>
            </footer>
        </motion.div>
    );

    return (
        <div className="fixed inset-0 z-[250] bg-[#05070A] text-white flex flex-col font-sans overflow-hidden">
            {/* Ambient Background Layer */}
            <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.05)_0%,_transparent_50%)]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] contrast-150 brightness-150 mix-blend-screen" />
            </div>

            <AnimatePresence mode="wait">
                {view === 'splash' && renderSplash()}
                {view === 'setup' && renderSetup()}
                {view === 'locked' && renderLock()}
                {view === 'dashboard' && renderDashboard()}
                {view === 'category' && renderCategoryView()}
                {view === 'settings' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col p-8">
                         <header className="flex justify-between items-center mb-12">
                            <div className="flex items-center gap-6">
                                <button onClick={() => setView('dashboard')} className="p-3 bg-white/5 rounded-2xl"><ArrowLeftIcon className="w-6 h-6" /></button>
                                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Vault Protocol</h2>
                            </div>
                        </header>
                        <div className="space-y-4">
                            <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400"><BoltIcon className="w-5 h-5" /></div>
                                    <div>
                                        <p className="text-sm font-bold text-white uppercase tracking-tight">Biometric Link</p>
                                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Face / Fingerprint</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setConfig({...config, biometricEnabled: !config.biometricEnabled})}
                                    className={`w-12 h-6 rounded-full transition-all relative ${config.biometricEnabled ? 'bg-cyan-500' : 'bg-white/10'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${config.biometricEnabled ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>
                            <button onClick={() => { if(confirm("Purge vault matrix data?")) { setConfig({...config, pin: ''}); setView('setup'); } }} className="w-full p-6 bg-rose-500/10 border border-rose-500/20 rounded-[2rem] text-rose-500 font-black uppercase text-[10px] tracking-[0.4em] mt-10">Destroy Node Memory</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .premium-scroll::-webkit-scrollbar { display: none; }
                .premium-scroll { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default SifraVaultView;
