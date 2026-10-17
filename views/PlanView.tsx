import React from 'react';
import { motion } from 'framer-motion';
import { UserProfile, THEMES, AdminSettings } from '../types';
import CrownIcon from '../components/icons/CrownIcon';
import BoltIcon from '../components/icons/BoltIcon';
import DiamondIcon from '../components/icons/DiamondIcon';
import SparklesIcon from '../components/icons/SparklesIcon';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import CheckIcon from '../components/icons/CheckIcon';
import { SifraPlanLogo } from '../components/SifraBrandedIcons';

interface PlanViewProps {
    userProfile: UserProfile;
    onClose: () => void;
    adminSettings?: AdminSettings;
}

const PlanView: React.FC<PlanViewProps> = ({ userProfile, onClose, adminSettings }) => {
    const currentTheme = THEMES.find(t => t.id === userProfile.themeId) || THEMES[0];
    const isDark = userProfile.themeId === 'dark-matrix';
    const plans = adminSettings?.plans || [];

    return (
        <div className={`h-full w-full overflow-hidden relative flex flex-col bg-gradient-to-br ${currentTheme.gradient} ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {/* Live Background Animation */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 180, 270, 360],
                        opacity: [0.1, 0.3, 0.1]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className={`absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-[120px] ${isDark ? 'bg-purple-600/30' : 'bg-purple-400/20'}`}
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        rotate: [360, 270, 180, 90, 0],
                        opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className={`absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full blur-[120px] ${isDark ? 'bg-indigo-600/30' : 'bg-indigo-400/20'}`}
                />
            </div>

            <header className={`relative z-10 px-4 py-3 flex items-center justify-between backdrop-blur-md border-b border-black/5 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                <button onClick={onClose} className={`p-2 rounded-full border active:scale-95 transition-transform ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/50 border-black/5'}`}>
                    <ArrowLeftIcon className="w-4 h-4" />
                </button>
                <div className="text-center">
                    <h1 className="text-sm font-black tracking-widest uppercase italic">Recharge</h1>
                </div>
                <div className="w-8" />
            </header>

            <main className="flex-1 overflow-y-auto px-4 pb-32 premium-scroll relative z-10">
                {/* Hero Banner */}
                <div className="mt-4 mb-6 relative rounded-3xl overflow-hidden h-40 flex items-center justify-center shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600" />
                    <div className="relative z-10 text-center text-white">
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-2">
                            <SifraPlanLogo className="w-10 h-10" />
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-tighter">Sifra Premium</h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Unlock Full Potential</p>
                    </div>
                </div>

                {/* Plans Grid */}
                <div className="space-y-4">
                    <div className={`p-8 rounded-3xl text-center border ${isDark ? 'bg-zinc-900/60 border-white/10' : 'bg-white border-black/5 shadow-sm'}`}>
                        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-4">
                            <DiamondIcon className="w-8 h-8" />
                        </div>
                        <span className="inline-block px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-widest text-rose-400 bg-rose-500/10 border border-rose-500/30 mb-2">
                            কোনরকম প্ল্যান যুক্ত নেই
                        </span>
                        <h3 className={`text-xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                            কোনো সক্রিয় প্ল্যান নেই
                        </h3>
                        <p className={`text-xs font-medium max-w-sm mx-auto leading-relaxed ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>
                            বর্তমানে আপনার অ্যাকাউন্টের সাথে কোনো প্ল্যান যুক্ত নেই এবং নতুন কোনো পেইড প্ল্যান উপলব্ধ নেই।
                        </p>
                    </div>
                </div>
                
                <div className="h-20" />
            </main>
        </div>
    );
};

export default PlanView;
