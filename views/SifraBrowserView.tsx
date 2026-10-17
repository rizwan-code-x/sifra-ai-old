import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, View } from '../types';
import { GoogleGenAI } from '@google/genai';
import { getActiveApiKey } from '../App';
import { logAppActivity } from '../utils/history';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import XMarkIcon from '../components/icons/XMarkIcon';
import SearchIcon from '../components/icons/SearchIcon';
import MicrophoneIcon from '../components/icons/MicrophoneIcon';
import ClockIcon from '../components/icons/ClockIcon';
import AdjustmentsHorizontalIcon from '../components/icons/AdjustmentsHorizontalIcon';
import SifraLoader, { NeuralShimmer } from '../components/SifraLoader';

const COLORS = ['#FFD700', '#A855F7', '#FACC15', '#22C55E', '#3B82F6']; // Gold, Purple, Yellow, Green, Blue

const SifraBrowserView: React.FC<{ userProfile: UserProfile; onClose: () => void; initialQuery?: string }> = ({ userProfile, onClose, initialQuery }) => {
    const [query, setQuery] = useState(initialQuery || '');
    const [isSearching, setIsSearching] = useState(false);
    const [aiSummary, setAiSummary] = useState('');
    const [view, setView] = useState<'home' | 'results' | 'history'>('home');
    const [history, setHistory] = useState<string[]>([]);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleSearch = async (customQuery?: string) => {
        const searchQuery = customQuery || query;
        if (!searchQuery.trim()) return;
        if (!isOnline) return;

        setQuery(searchQuery);
        setIsSearching(true);
        setView('results');
        setHistory(prev => Array.from(new Set([searchQuery, ...prev].slice(0, 20))));
        
        logAppActivity('Web Sphere / Neural Search', searchQuery, 'Search initiated from Browser', { searchQuery });
        
        try {
            const apiKey = getActiveApiKey();
            const ai = new GoogleGenAI({ apiKey: apiKey || '' });
            const response = await ai.models.generateContent({
                model: 'gemini-3.8-flash',
                contents: `Search Query: ${searchQuery}. Provide a highly professional, lightning-fast, and concise answer based on current information. 
                Identify the most important world or phrase and surround it with %%. 
                Identify the direct answer and surround it with ##.
                Bengali and English mixed response if possible.`,
                config: { tools: [{ googleSearch: {} }] }
            });
            
            let text = response.text || '';
            setAiSummary(text);
        } catch (err) { 
            setAiSummary("Neural interface error. Pulse-check your connection."); 
        } finally { 
            setIsSearching(false); 
        }
    };

    const speakSummary = () => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(aiSummary);
            window.speechSynthesis.speak(utterance);
        }
    };

    const sharePage = () => {
        if (navigator.share) {
            navigator.share({ title: 'Sifra Web Result', text: aiSummary, url: window.location.href }).catch(() => {});
        }
    };

    const deleteHistory = () => {
        setHistory([]);
    };

    const openIframe = (url: string) => {
        window.open(url, '_blank');
    };

    return (
        <div className="fixed inset-0 z-[250] bg-black flex flex-col font-sans overflow-hidden">
            {/* Neural Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_#1e1b4b_0%,_#000_100%)]" />
            </div>

            {/* Fixed Navigation Header - User requested no nav bar, but wants it fixed at top */}
            <div className="relative z-[400] flex flex-col items-center gap-6 pt-10 pb-8 px-6">
                <div className="flex items-center justify-center gap-2">
                    {"SIFRA".split("").map((char, i) => (
                        <span key={i} className="text-3xl font-black italic tracking-tighter" style={{ color: COLORS[i % COLORS.length] }}>
                            {char}
                        </span>
                    ))}
                    <div className="ml-2 px-2 py-0.5 rounded-md bg-white/10 border border-white/5 text-[6px] font-black uppercase tracking-[0.2em] text-white/40">
                        AI Neural Link
                    </div>
                </div>

                <form 
                    onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
                    className="w-full max-w-xl group relative"
                >
                    <div className="flex items-center bg-[#1A1B23]/80 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 px-8 py-5 shadow-[0_0_50px_rgba(0,0,0,0.5)] focus-within:ring-2 focus-within:ring-purple-500/30 transition-all">
                        <SearchIcon className="w-5 h-5 text-white/30 mr-4" />
                        <input 
                            type="text" 
                            value={query} 
                            onChange={e => setQuery(e.target.value)} 
                            placeholder="Quantum Neural Search..." 
                            className="flex-1 bg-transparent border-none outline-none text-white font-black uppercase tracking-widest text-[11px] placeholder:text-white/20"
                        />
                        <button type="button" className="p-2 -mr-4 rounded-xl hover:bg-white/5 transition-colors">
                            <MicrophoneIcon className="w-5 h-5 text-purple-400" />
                        </button>
                    </div>
                </form>
            </div>

            {/* Offline Alert */}
            {!isOnline && (
                <div className="px-6 py-2 bg-amber-500/20 backdrop-blur-md border-y border-amber-500/20 text-amber-500 text-[8px] font-black uppercase tracking-[0.5em] text-center">
                    Offline Mode: Search Limited to Local Neural Memory. Please establish internet link.
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto px-6 pb-24 relative z-[300] premium-scroll">
                <AnimatePresence mode="wait">
                    {view === 'home' ? (
                        <motion.div 
                            key="home"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-xl mx-auto py-10 space-y-12"
                        >
                            <div className="flex flex-wrap justify-center gap-3">
                                {["Weather", "Stock Market", "Neural GPT", "Sifra Vision", "Safe Vault"].map((tool, i) => (
                                    <button 
                                        key={tool}
                                        className="flex flex-col items-center gap-3 w-20 group"
                                    >
                                        <div className="w-16 h-16 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-white/10 group-hover:border-white/20 shadow-xl overflow-hidden relative">
                                            <div className="absolute inset-0 opacity-20" style={{ background: COLORS[i % COLORS.length] }} />
                                            <span className="text-[10px] font-black text-white">{tool[0]}</span>
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-white/40">{tool}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <ClockIcon className="w-4 h-4 text-purple-400" />
                                    <span className="text-[8px] font-black uppercase tracking-[0.5em] text-white/30">Historical Entries</span>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    {history.length > 0 ? history.map((h, i) => (
                                        <button 
                                            key={i}
                                            onClick={() => handleSearch(h)}
                                            className="px-6 py-4 bg-white/5 rounded-2xl border border-white/5 text-left text-[10px] font-black uppercase tracking-widest text-white/60 hover:bg-white/10 hover:text-white transition-all flex items-center justify-between"
                                        >
                                            {h}
                                            <ArrowLeftIcon className="w-3 h-3 rotate-180 opacity-40" />
                                        </button>
                                    )) : (
                                        <div className="p-8 text-center border-2 border-dashed border-white/5 rounded-3xl">
                                            <p className="text-[8px] font-black uppercase tracking-widest text-white/20">Empty Neural History</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="max-w-xl mx-auto py-6"
                        >
                            {isSearching ? (
                                <div className="space-y-6">
                                    <div className="flex flex-col items-center justify-center py-20 gap-6">
                                        <SifraLoader size="lg" />
                                        <p className="text-[8px] font-black uppercase tracking-[0.6em] text-white/40 animate-pulse">Extracting Knowledge From Matrix...</p>
                                    </div>
                                    <NeuralShimmer className="h-40" />
                                    <NeuralShimmer className="h-32" />
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {/* Smart Highlighted Result Card */}
                                    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
                                        
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="px-3 py-1 bg-purple-600 rounded-full text-[8px] font-black uppercase tracking-widest text-white">Sifra Insight</div>
                                            <div className="text-[8px] font-black uppercase tracking-widest text-white/20">Source: Neural Network</div>
                                        </div>

                                        <div className="text-white/90 text-sm leading-[1.8] font-medium">
                                            {aiSummary.split('\n').map((line, i) => {
                                                if (!line.trim()) return <br key={i} />;
                                                
                                                let content = line;
                                                // Highlighting logic
                                                const parts = content.split(/(##.*?##|%%.*?%%)/g);
                                                
                                                return (
                                                    <p key={i} className="mb-4 last:mb-0">
                                                        {parts.map((part, j) => {
                                                            if (part.startsWith('##')) {
                                                                return (
                                                                    <span key={j} className="bg-yellow-500/20 py-0.5 px-2 rounded-md font-semibold text-yellow-300 border border-yellow-500/30 shadow-[0_0_15px_rgba(250,204,21,0.1)] mx-1">
                                                                        {part.replace(/##/g, '')}
                                                                    </span>
                                                                );
                                                            }
                                                            if (part.startsWith('%%')) {
                                                                return (
                                                                    <span key={j} className="text-purple-300 font-semibold bg-purple-500/10 px-1 rounded mx-0.5 border border-purple-500/20">
                                                                        {part.replace(/%%/g, '')}
                                                                    </span>
                                                                );
                                                            }
                                                            return part;
                                                        })}
                                                    </p>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-4">
                                        <button 
                                            onClick={() => setView('home')}
                                            className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[8px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all flex items-center gap-3"
                                        >
                                            <ArrowLeftIcon className="w-3 h-3" />
                                            Back to Home
                                        </button>
                                        <button 
                                            onClick={() => window.print()}
                                            className="px-8 py-4 bg-purple-600 rounded-2xl text-[8px] font-black uppercase tracking-widest text-white shadow-xl hover:shadow-purple-500/20 active:scale-95 transition-all"
                                        >
                                            Export Transmission
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Background Controls Floating Header - Not a bar, just fixed buttons */}
            <div className="fixed bottom-10 left-10 z-[500]">
                <button 
                    onClick={onClose}
                    className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all backdrop-blur-xl"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
            </div>
            
            <div className="fixed bottom-10 right-10 z-[500]">
                <button 
                    onClick={() => setView('history')}
                    className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all backdrop-blur-xl"
                >
                    <ClockIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default SifraBrowserView;
