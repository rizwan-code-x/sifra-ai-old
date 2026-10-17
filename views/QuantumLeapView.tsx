
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, View } from '../types';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import SparklesIcon from '../components/icons/SparklesIcon';
import BoltIcon from '../components/icons/BoltIcon';
import MicrophoneIcon from '../components/icons/MicrophoneIcon';
import ChatBubbleLeftRightIcon from '../components/icons/ChatBubbleLeftRightIcon';
import GlobeAltIcon from '../components/icons/GlobeAltIcon';
import ShieldCheckIcon from '../components/icons/ShieldCheckIcon';

interface QuantumLeapViewProps {
    userProfile: UserProfile;
    onClose: () => void;
    onNavigate: (view: View) => void;
}

const FeatureCard = ({ icon, title, desc, onClick, delay }: any) => (
    <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="group relative w-full p-6 rounded-[2.5rem] bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] transition-all text-left overflow-hidden"
    >
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                {React.cloneElement(icon, { className: "w-7 h-7" })}
            </div>
            <div className="flex-1">
                <h3 className="text-lg font-black italic tracking-tight text-white mb-1">{title}</h3>
                <p className="text-xs text-gray-400 font-medium leading-relaxed">{desc}</p>
            </div>
        </div>
    </motion.button>
);

const QuantumLeapView: React.FC<QuantumLeapViewProps> = ({ userProfile, onClose, onNavigate }) => {
    const [isBooting, setIsBooting] = React.useState(true);

    React.useEffect(() => {
        const timer = setTimeout(() => setIsBooting(false), 2500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="fixed inset-0 z-[500] bg-[#020617] text-white flex flex-col font-sans overflow-hidden">
            <AnimatePresence>
                {isBooting && (
                    <motion.div 
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[600] bg-[#020617] flex flex-col items-center justify-center p-12"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-cyan-500/20 blur-[100px] animate-pulse" />
                            <div className="w-24 h-24 relative z-10">
                                <svg viewBox="0 0 100 100" className="w-full h-full">
                                    <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" className="text-cyan-400" />
                                    <motion.path 
                                        d="M30 70 L50 20 L70 70 M40 55 L60 55" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth="6" 
                                        strokeLinecap="round" 
                                        className="text-cyan-400"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 1.5, ease: "easeInOut" }}
                                    />
                                </svg>
                            </div>
                        </motion.div>
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-center mt-12"
                        >
                            <h2 className="text-2xl font-black italic tracking-tighter uppercase mb-2">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Quantum Leap</span>
                            </h2>
                            <p className="text-[8px] font-black uppercase tracking-[0.6em] text-cyan-400/40">Synchronizing Matrix...</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-indigo-600/5 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-20%] w-[70%] h-[70%] bg-purple-600/5 blur-[150px] rounded-full" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.01)_0%,transparent_100%)]" />
            </div>

            {/* Header */}
            <header className="p-6 flex items-center justify-between relative z-20">
                <button 
                    onClick={onClose} 
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-90"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-400">Quantum Protocol</span>
                    </div>
                </div>
                <div className="w-10 h-10" />
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto premium-scroll relative z-10 px-8">
                <div className="max-w-xl mx-auto py-12">
                    {/* Hero */}
                    <div className="text-center mb-16 px-4">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest mb-8"
                        >
                            <SparklesIcon className="w-3.5 h-3.5" /> High-Performance Matrix
                        </motion.div>
                        <h1 className="text-5xl font-black italic tracking-tighter leading-[0.95] mb-6">
                            Quantum <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">Leap Evolution</span>
                        </h1>
                        <p className="text-sm text-gray-400 leading-relaxed max-w-sm mx-auto italic font-medium">
                            Step into the next dimension of neural assistance. Sifra Leap combines every protocol into a single, cohesive intelligence.
                        </p>
                    </div>

                    {/* Features Matrix */}
                    <div className="grid gap-4 mb-20">
                        <FeatureCard 
                            icon={<ChatBubbleLeftRightIcon />} 
                            title="Neural Cognition" 
                            desc="Real-time multi-threaded thinking for complex problem solving and deep analysis."
                            onClick={() => onNavigate(View.CHAT)}
                            delay={0.1}
                        />
                        <FeatureCard 
                            icon={<MicrophoneIcon />} 
                            title="Atmospheric Voice" 
                            desc="Experience 100% human-like conversation with deep emotional intelligence."
                            onClick={() => onNavigate(View.GALAXY_VOICE)}
                            delay={0.2}
                        />
                        <FeatureCard 
                            icon={<GlobeAltIcon />} 
                            title="Web Matrix 2.0" 
                            desc="Live data processing and verification across the global digital landscape."
                            onClick={() => onNavigate(View.SIFRA_BROWSER)}
                            delay={0.3}
                        />
                        <FeatureCard 
                            icon={<BoltIcon />} 
                            title="Pro Execution" 
                            desc="Autonomous task handling and creative generation with military precision."
                            onClick={() => onNavigate(View.SIFRA_PRO)}
                            delay={0.4}
                        />
                        <FeatureCard 
                            icon={<ShieldCheckIcon />} 
                            title="Vault Protocol" 
                            desc="Zero-trust architecture protecting every single neural data exchange."
                            onClick={() => onNavigate(View.SIFRA_SAVE)}
                            delay={0.5}
                        />
                    </div>

                    {/* Stats / Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-8 rounded-[2rem] bg-cyan-500/5 border border-cyan-500/10">
                            <h4 className="text-[10px] font-black uppercase text-cyan-400 tracking-widest mb-2">Sync Rate</h4>
                            <div className="text-3xl font-black italic tracking-tighter text-white">99.9<span className="text-xs text-cyan-400/60 ml-1">%</span></div>
                        </div>
                        <div className="p-8 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10">
                            <h4 className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-2">Latency</h4>
                            <div className="text-3xl font-black italic tracking-tighter text-white">12<span className="text-xs text-indigo-400/60 ml-1">ms</span></div>
                        </div>
                    </div>
                </div>
                <div className="pb-32" />
            </main>
        </div>
    );
};

export default QuantumLeapView;
