
import React, { useState, useEffect, memo } from 'react';
import { View, UserProfile, THEMES, AdminSettings } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import ClockIcon from '../components/icons/ClockIcon';
import TrashIcon from '../components/icons/XMarkIcon';
import { History, Target, ArrowRight, Activity, CalendarDays, ExternalLink, RefreshCw } from 'lucide-react';
import { AppActivity, getAppHistory, clearAppHistory } from '../utils/history';

interface SifraToolsViewProps {
    userProfile: UserProfile;
    onNavigate: (view: View, data?: any) => void;
    onClose: () => void;
    adminSettings: AdminSettings;
}

const SifraToolsView: React.FC<SifraToolsViewProps> = ({ userProfile, onNavigate, onClose }) => {
    const [historyList, setHistoryList] = useState<AppActivity[]>([]);
    const [selectedItem, setSelectedItem] = useState<AppActivity | null>(null);

    useEffect(() => {
        setHistoryList(getAppHistory());
    }, []);

    const handleClear = () => {
        if (window.confirm('Are you sure you want to clear all app history?')) {
            clearAppHistory();
            setHistoryList([]);
        }
    };

    const handleRestore = (item: AppActivity) => {
        let viewToNavigate: View;
        if (typeof item.view === 'number') {
            viewToNavigate = item.view;
        } else if (String(item.view).includes('Search') || String(item.view).includes('Web')) {
            viewToNavigate = View.SIFRA_BROWSER;
        } else {
            return; // Fallback
        }
        onNavigate(viewToNavigate, item.payload);
    };

    return (
        <div className="fixed inset-0 z-[200] flex flex-col font-sans overflow-hidden bg-[#0A0B10] text-[#E2E8F0]">
            <header className="relative z-10 px-6 py-4 flex items-center justify-between backdrop-blur-md border-b border-white/5 bg-[#12141C]/80">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 transition-all text-white/80">
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-600">App History</h1>
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Global Tracking Active
                        </p>
                    </div>
                </div>
                {historyList.length > 0 && (
                    <button onClick={handleClear} className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-all">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                )}
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-32 premium-scroll relative z-10">
                <AnimatePresence>
                    {selectedItem ? (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white/5 border border-yellow-500/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-3xl rounded-full" />
                            <button onClick={() => setSelectedItem(null)} className="text-yellow-500/70 hover:text-yellow-400 text-sm font-black tracking-widest uppercase flex items-center gap-2 mb-6">
                                <ArrowLeftIcon className="w-4 h-4" /> Back to List
                            </button>
                            <h2 className="text-2xl font-bold text-yellow-50 mb-2">{selectedItem.title}</h2>
                            <p className="text-gray-400 text-sm mb-6 pb-6 border-b border-white/5">{selectedItem.subtitle}</p>
                            
                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3 text-sm text-gray-300 bg-black/20 p-4 rounded-2xl border border-white/5">
                                    <CalendarDays className="w-5 h-5 text-yellow-500/50" />
                                    <span>Time: {new Date(selectedItem.timestamp).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-300 bg-black/20 p-4 rounded-2xl border border-white/5">
                                    <Target className="w-5 h-5 text-emerald-500/50" />
                                    <span>Target Module: {typeof selectedItem.view === 'number' ? View[selectedItem.view] : selectedItem.view}</span>
                                </div>
                            </div>
                            
                            <button
                                onClick={() => handleRestore(selectedItem)}
                                className="w-full relative group overflow-hidden bg-gradient-to-r from-yellow-600 to-amber-700 text-white rounded-2xl py-4 font-bold text-lg shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:shadow-[0_0_30px_rgba(217,119,6,0.5)] transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                <RefreshCw className="w-5 h-5" />
                                Resume Task / Open Module
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            </button>
                        </motion.div>
                    ) : historyList.length > 0 ? (
                        <div className="space-y-3">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/30 mb-4 px-2">Recent Activity Logs</h3>
                            {historyList.map((item, i) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => setSelectedItem(item)}
                                    className="group cursor-pointer bg-[#151822] hover:bg-[#1C202E] border border-white/5 hover:border-yellow-500/30 rounded-2xl p-4 flex gap-4 transition-all hover:shadow-lg hover:shadow-yellow-500/5"
                                >
                                    <div className="w-12 h-12 rounded-full bg-black/30 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-yellow-500/10 group-hover:text-yellow-400 group-hover:border-yellow-500/20 transition-all text-white/40">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <h4 className="text-white/90 font-semibold truncate group-hover:text-yellow-50">{item.title}</h4>
                                        <p className="text-white/40 text-xs truncate mt-0.5">{item.subtitle}</p>
                                    </div>
                                    <div className="flex flex-col items-end justify-center shrink-0">
                                        <span className="text-[10px] text-white/30 font-medium">
                                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                                        </span>
                                        <ArrowRight className="w-4 h-4 text-white/20 mt-1 group-hover:text-yellow-500/50 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-white/30 pt-20">
                            <ClockIcon className="w-16 h-16 mb-4 opacity-50" />
                            <p className="text-lg font-medium">No Activity Recorded</p>
                            <p className="text-sm mt-1">Your recent interactions will appear here.</p>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default SifraToolsView;
