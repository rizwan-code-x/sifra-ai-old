
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '../types';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import SearchIcon from '../components/icons/SearchIcon';
import { SifraDatabaseLogo } from '../components/SifraBrandedIcons';
import CopyIcon from '../components/icons/CopyIcon';
import TrashIcon from '../components/icons/TrashIcon';

interface DataEntry {
    id: string;
    title: string;
    content: string;
    date: string;
    category: 'Assignment' | 'Private' | 'AI Log' | 'Code';
}

const DatabaseView: React.FC<{ userProfile: UserProfile; onClose: () => void }> = ({ userProfile, onClose }) => {
    const [search, setSearch] = useState("");
    const [entries, setEntries] = useState<DataEntry[]>([
        { id: '1', title: 'Personal Greeting Memo', content: 'The user prefers to be called by their neural handle. Link established.', date: '2024-05-01', category: 'AI Log' },
        { id: '2', title: 'Weekly Essay: AI Ethics', content: 'Artificial intelligence must coexist with human empathy to ensure a stable matrix...', date: '2024-05-02', category: 'Assignment' },
        { id: '3', title: 'Private Sync Key', content: 'A4-B9-C2-D8-E1-F0-G7-H3', date: '2024-05-03', category: 'Private' }
    ]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Encrypted data copied to clipboard.");
    };

    const filtered = entries.filter(e => e.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="fixed inset-0 z-[250] bg-black text-white flex flex-col font-sans overflow-hidden">
            {/* Database Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            
            <header className="px-8 pt-12 pb-6 flex justify-between items-center relative z-10 bg-black/40 backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl border border-white/10 active:scale-95 transition-transform">
                        <ArrowLeftIcon className="w-5 h-5 text-gray-400" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black tracking-tighter italic uppercase text-amber-500">NEURAL VAULT</h1>
                        <p className="text-[7px] font-black uppercase tracking-[0.4em] text-white/30">Secure Archive Matrix</p>
                    </div>
                </div>
                <SifraDatabaseLogo className="w-10 h-10 opacity-60" />
            </header>

            <div className="p-6 relative z-10 flex flex-col gap-6 flex-1 overflow-hidden">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-6 flex items-center text-amber-500/50">
                        <SearchIcon className="w-4 h-4" />
                    </div>
                    <input 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search matrix records..."
                        className="w-full bg-white/5 border border-white/10 rounded-[2rem] pl-14 pr-8 py-4 outline-none focus:border-amber-500/40 transition-all font-bold text-sm"
                    />
                </div>

                <div className="flex-1 overflow-y-auto premium-scroll space-y-4 pr-1">
                    {filtered.map((entry) => (
                        <motion.div 
                            key={entry.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-6 hover:border-amber-500/20 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-[7px] font-black uppercase tracking-widest text-amber-500/60 mb-2 block">{entry.category}</span>
                                    <h3 className="text-base font-black tracking-tight text-white/90">{entry.title}</h3>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleCopy(entry.content)} className="p-3 bg-white/5 rounded-2xl active:scale-90 transition-transform">
                                        <CopyIcon className="w-4 h-4 text-amber-500" />
                                    </button>
                                    <button className="p-3 bg-white/5 rounded-2xl active:scale-90 transition-transform">
                                        <TrashIcon className="w-4 h-4 text-red-500/40" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-xs font-bold text-white/40 leading-relaxed mb-4 line-clamp-3">
                                {entry.content}
                            </p>
                            <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-white/20">
                                <span>Record ID: {entry.id}S4</span>
                                <span>Sync: {entry.date}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <footer className="p-8 text-center bg-black/40 backdrop-blur-xl border-t border-white/5 relative z-10">
                <p className="text-[7px] font-black uppercase tracking-[0.8em] text-white/20">Encryption Protocol v2.5 Active</p>
            </footer>
        </div>
    );
};

export default DatabaseView;
