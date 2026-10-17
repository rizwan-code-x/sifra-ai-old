import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '../types';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import { ExternalLink, Copy, Check, Globe, Share2, Sparkles, ShieldCheck } from 'lucide-react';

interface SifraShareViewProps {
    userProfile?: UserProfile;
    onUpdateProfile?: (profile: any) => void;
    onClose: () => void;
}

interface ProjectLink {
    id: number;
    name: string;
    url: string;
    badge: string;
    gradient: string;
    borderGlow: string;
}

const PROJECT_LINKS: ProjectLink[] = [
    {
        id: 1,
        name: "Rexlify",
        url: "https://rexlify.netlify.app",
        badge: "Official Main",
        gradient: "from-amber-500 to-orange-600",
        borderGlow: "group-hover:border-amber-500/50"
    },
    {
        id: 2,
        name: "Neurax.ai.studio",
        url: "https://neurax.ai.studio",
        badge: "AI Studio",
        gradient: "from-indigo-600 to-purple-600",
        borderGlow: "group-hover:border-indigo-500/50"
    },
    {
        id: 3,
        name: "Noorax.ai.studio",
        url: "https://noorax.ai.studio",
        badge: "AI Studio",
        gradient: "from-cyan-500 to-blue-600",
        borderGlow: "group-hover:border-cyan-500/50"
    },
    {
        id: 4,
        name: "Phvegetables.ai.studio",
        url: "https://phvegetables.ai.studio",
        badge: "AI Studio",
        gradient: "from-emerald-500 to-teal-600",
        borderGlow: "group-hover:border-emerald-500/50"
    },
    {
        id: 5,
        name: "Sifrar.ai.studio",
        url: "https://sifrar.ai.studio",
        badge: "AI Studio",
        gradient: "from-pink-500 to-rose-600",
        borderGlow: "group-hover:border-pink-500/50"
    },
    {
        id: 6,
        name: "Rexlify Mini",
        url: "https://sites.google.com/view/rexlifymini/home",
        badge: "Google Site",
        gradient: "from-violet-500 to-fuchsia-600",
        borderGlow: "group-hover:border-violet-500/50"
    },
    {
        id: 7,
        name: "RizwanRR",
        url: "https://sites.google.com/view/rizwanrr/home",
        badge: "Founder Hub",
        gradient: "from-blue-600 to-indigo-700",
        borderGlow: "group-hover:border-blue-500/50"
    }
];

const SifraShareView: React.FC<SifraShareViewProps> = ({ onClose }) => {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = (url: string, index: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(url);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="fixed inset-0 z-[200] bg-[#020617] text-white flex flex-col font-sans overflow-hidden">
            {/* Ambient High-Tech Glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-15%] right-[-10%] w-[550px] h-[550px] bg-indigo-600/15 blur-[140px] rounded-full" />
                <div className="absolute bottom-[-15%] left-[-10%] w-[550px] h-[550px] bg-purple-600/15 blur-[140px] rounded-full" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:100%_4px] opacity-30" />
            </div>

            {/* Top Navigation Bar */}
            <header className="px-6 py-4 flex items-center justify-between relative z-20 bg-[#020617]/70 backdrop-blur-2xl border-b border-white/5">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onClose}
                        className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all text-white/80 hover:text-white"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-lg font-black tracking-wider uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-purple-200 leading-tight">
                            Projects & Platforms
                        </h1>
                        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-indigo-400">
                            Verified Ecosystem Links
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[9px] font-black uppercase tracking-wider">7 Links</span>
                </div>
            </header>

            {/* Line-by-Line Professional Links List */}
            <main className="flex-1 overflow-y-auto px-4 md:px-8 pb-32 pt-6 premium-scroll relative z-10">
                <div className="max-w-2xl mx-auto space-y-3.5">
                    {PROJECT_LINKS.map((item, idx) => (
                        <a
                            key={item.id}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`group relative flex items-center justify-between p-4 md:p-5 rounded-[1.8rem] bg-white/[0.03] backdrop-blur-2xl border border-white/10 ${item.borderGlow} hover:bg-white/[0.07] transition-all duration-200 active:scale-[0.99] shadow-lg`}
                        >
                            {/* Left Side: Number, Name & Badge */}
                            <div className="flex items-center gap-4 min-w-0 pr-3">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-md shrink-0 bg-gradient-to-br ${item.gradient}`}>
                                    {item.id}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <h3 className="text-base font-black italic tracking-tight text-white group-hover:text-amber-300 transition-colors truncate">
                                            {item.name}
                                        </h3>
                                        <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider bg-white/5 border border-white/10 text-white/60">
                                            {item.badge}
                                        </span>
                                    </div>
                                    <p className="text-[10px] font-mono text-indigo-300/70 truncate mt-0.5 select-all">
                                        {item.url}
                                    </p>
                                </div>
                            </div>

                            {/* Right Side: Copy & Open Actions */}
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={(e) => handleCopy(item.url, idx, e)}
                                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-colors border border-white/5"
                                    title="Copy Link"
                                >
                                    {copiedIndex === idx ? (
                                        <Check className="w-4 h-4 text-emerald-400" />
                                    ) : (
                                        <Copy className="w-4 h-4" />
                                    )}
                                </button>
                                <div className={`p-2.5 rounded-xl text-white shadow-md transition-transform group-hover:scale-110 bg-gradient-to-r ${item.gradient}`}>
                                    <ExternalLink className="w-4 h-4" />
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default SifraShareView;
