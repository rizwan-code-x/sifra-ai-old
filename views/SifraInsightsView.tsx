import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '../types';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import { Globe, ExternalLink, Sparkles, Copy, Check, Star, Layers, ShieldCheck, Compass } from 'lucide-react';

interface SifraInsightsViewProps {
    userProfile?: UserProfile;
    onUpdateProfile?: (profile: UserProfile) => void;
    onClose: () => void;
}

interface WebAppItem {
    id: number;
    title: string;
    url: string;
    description: string;
    category: string;
    isPrimary?: boolean;
    badge: string;
    gradient: string;
}

const WEBSITES_LIST: WebAppItem[] = [
    {
        id: 1,
        title: "Rexlify",
        url: "https://rexlify.netlify.app",
        description: "Our primary and central official platform. The core epicenter of all services, products, and digital innovations.",
        category: "Primary Hub",
        isPrimary: true,
        badge: "Official Main Site",
        gradient: "from-amber-500 via-orange-500 to-rose-600"
    },
    {
        id: 2,
        title: "Neurax AI",
        url: "https://neurax.ai.studio",
        description: "Advanced neural intelligence research, cognitive computing algorithms, and next-generation AI models.",
        category: "AI Studio",
        badge: "Neural AI Research",
        gradient: "from-indigo-600 to-purple-600"
    },
    {
        id: 3,
        title: "Noorax AI",
        url: "https://noorax.ai.studio",
        description: "Next-generation intelligent workspace, productive tools, and enterprise workflow solutions.",
        category: "AI Studio",
        badge: "Smart Workspace",
        gradient: "from-cyan-500 to-blue-600"
    },
    {
        id: 4,
        title: "Phvegetables",
        url: "https://phvegetables.ai.studio",
        description: "Smart agricultural technology platform, organic produce tracking, and precision supply chain.",
        category: "Agri Tech",
        badge: "Smart Agriculture",
        gradient: "from-emerald-500 to-teal-600"
    },
    {
        id: 5,
        title: "Sifrar AI",
        url: "https://sifrar.ai.studio",
        description: "Sifra Virtual Operating System, robotic intelligence assistant, and neural core portal.",
        category: "Virtual OS",
        badge: "Robotic AI Portal",
        gradient: "from-pink-500 to-rose-600"
    },
    {
        id: 6,
        title: "Rexlify Mini",
        url: "https://sites.google.com/view/rexlifymini/home",
        description: "Fast-access lightweight mobile portal and instant entry point to the Rexlify ecosystem.",
        category: "Google Site",
        badge: "Mini Hub",
        gradient: "from-violet-500 to-fuchsia-600"
    },
    {
        id: 7,
        title: "Rizwan RR Official",
        url: "https://sites.google.com/view/rizwanrr/home",
        description: "Official portfolio, executive projects, innovations, and community portal of Founder Rizwan RR.",
        category: "Founder Portal",
        badge: "Founder Portfolio",
        gradient: "from-blue-600 via-indigo-600 to-purple-700"
    }
];

const SifraInsightsView: React.FC<SifraInsightsViewProps> = ({ onClose }) => {
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

    const handleCopy = (url: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(url);
        setCopiedUrl(url);
        setTimeout(() => setCopiedUrl(null), 2000);
    };

    const handleOpenSite = (url: string) => {
        try {
            window.open(url, '_blank', 'noopener,noreferrer');
        } catch (e) {
            window.location.href = url;
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-[#020617] text-white flex flex-col font-sans overflow-hidden">
            {/* Background Glows */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 blur-[140px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-pink-600/10 blur-[140px] rounded-full" />
            </div>

            {/* Header */}
            <header className="px-6 py-4 flex items-center justify-between relative z-20 bg-[#020617]/60 backdrop-blur-2xl border-b border-white/5">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onClose} 
                        className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all text-white/80 hover:text-white"
                        title="Back"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-lg font-black tracking-wider uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-amber-200">
                            Visit Our Websites
                        </h1>
                        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-indigo-400">
                            Official Ecosystem & Platforms
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10">
                    <Compass className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[9px] font-black uppercase tracking-wider text-white/70">
                        {WEBSITES_LIST.length} Platforms
                    </span>
                </div>
            </header>

            {/* Main Content List */}
            <main className="flex-1 overflow-y-auto px-4 md:px-8 pb-32 pt-6 premium-scroll relative z-10">
                <div className="max-w-4xl mx-auto space-y-6">

                    {/* Top Hero Banner */}
                    <div className="relative rounded-[2.5rem] p-6 md:p-8 bg-gradient-to-br from-indigo-950/60 via-purple-950/30 to-black border border-indigo-500/20 overflow-hidden shadow-2xl">
                        <div className="flex flex-col md:flex-row items-center gap-6 justify-between relative z-10">
                            <div className="space-y-2 text-center md:text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[9px] font-black uppercase tracking-widest">
                                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Rexlify Ecosystem
                                </div>
                                <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase text-white">
                                    Official Platforms & Web Apps
                                </h2>
                                <p className="text-xs text-white/60 font-medium max-w-xl leading-relaxed">
                                    Browse our verified digital network below. Tap any card to directly launch the website in your browser.
                                </p>
                            </div>
                            <div className="w-16 h-16 rounded-3xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                                <Globe className="w-8 h-8" />
                            </div>
                        </div>
                    </div>

                    {/* Websites Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {WEBSITES_LIST.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => handleOpenSite(item.url)}
                                className={`group relative rounded-[2rem] p-5 md:p-6 border transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-2xl flex flex-col justify-between gap-4 ${
                                    item.isPrimary
                                        ? 'bg-gradient-to-br from-amber-500/10 via-purple-950/20 to-black border-amber-500/40 hover:border-amber-500 shadow-xl md:col-span-2'
                                        : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                                } active:scale-[0.99]`}
                            >
                                {/* Glow Accent */}
                                <div className={`absolute -top-16 -right-16 w-32 h-32 blur-3xl opacity-20 rounded-full bg-gradient-to-br ${item.gradient}`} />

                                <div>
                                    {/* Header info */}
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-base shadow-lg bg-gradient-to-br ${item.gradient}`}>
                                                {item.id}
                                            </div>
                                            <div>
                                                <h3 className="text-base font-black italic uppercase tracking-tight text-white group-hover:text-amber-300 transition-colors">
                                                    {item.title}
                                                </h3>
                                                <span className="text-[8px] font-black uppercase tracking-widest text-white/40">
                                                    {item.category}
                                                </span>
                                            </div>
                                        </div>

                                        <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                            item.isPrimary 
                                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm' 
                                                : 'bg-white/5 text-white/60 border-white/10'
                                        }`}>
                                            {item.badge}
                                        </span>
                                    </div>

                                    {/* Description */}
                                    <p className="text-[11px] text-white/70 font-medium leading-relaxed mb-4">
                                        {item.description}
                                    </p>

                                    {/* URL preview container */}
                                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-black/50 border border-white/5">
                                        <span className="text-[10px] font-mono text-indigo-300 truncate select-all">
                                            {item.url}
                                        </span>
                                        <button
                                            onClick={(e) => handleCopy(item.url, e)}
                                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors shrink-0"
                                            title="Copy Link"
                                        >
                                            {copiedUrl === item.url ? (
                                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                            ) : (
                                                <Copy className="w-3.5 h-3.5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Action button */}
                                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider group-hover:text-white/60 transition-colors">
                                        Open Website
                                    </span>
                                    <div className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-md transition-all group-hover:scale-105 bg-gradient-to-r ${item.gradient}`}>
                                        <span>Visit Now</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </main>
        </div>
    );
};

export default SifraInsightsView;
