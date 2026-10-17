
import React from 'react';
import { motion } from 'framer-motion';
import { UserProfile } from '../types';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import ShieldCheckIcon from '../components/icons/ShieldCheckIcon';
import IdentificationIcon from '../components/icons/IdentificationIcon';

const PoliciesView: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-[500] bg-white text-gray-900 flex flex-col font-sans overflow-hidden">
            <header className="px-8 pt-12 pb-6 flex items-center gap-6 relative z-10 border-b border-black/5">
                <button onClick={onClose} className="p-3 bg-black/5 rounded-2xl active:scale-90 transition-transform text-gray-800">
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">LEGAL CENTER</h1>
                    <p className="text-[7px] font-black uppercase tracking-[0.4em] text-gray-400 mt-1">Sifra OS Matrix Protocols</p>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-8 space-y-12 premium-scroll">
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <IdentificationIcon className="w-6 h-6 text-indigo-600" />
                        <h2 className="text-lg font-black uppercase tracking-tight">Terms of Synchronisation</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="p-6 bg-gray-50 rounded-[2rem] border border-black/[0.03]">
                            <p className="text-xs font-bold text-gray-600 leading-relaxed uppercase tracking-tighter mb-2">1. User Identity</p>
                            <p className="text-sm font-medium text-gray-800 leading-relaxed">
                                By using Sifra, you consent to a neural link for professional assistance. Any data shared is processed within the Matrix to enhance your experience.
                            </p>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-[2rem] border border-black/[0.03]">
                            <p className="text-xs font-bold text-gray-600 leading-relaxed uppercase tracking-tighter mb-2">2. Digital Conduct</p>
                            <p className="text-sm font-medium text-gray-800 leading-relaxed">
                                Illegal activities, neural hacking, or attempts to bypass Sifra's ethical core will result in immediate termination of the Matrix link.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <ShieldCheckIcon className="w-6 h-6 text-emerald-600" />
                        <h2 className="text-lg font-black uppercase tracking-tight">Privacy Matrix Policy</h2>
                    </div>
                    <div className="p-8 bg-zinc-950 text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] rounded-full" />
                        <p className="text-sm font-medium leading-relaxed opacity-80 mb-6">
                            Your privacy is our core directive. We encrypt every pixel and text string generated within the Sifra Ecosystem.
                        </p>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
                                <span className="text-xs font-bold opacity-60 uppercase tracking-widest">End-to-End Encryption Active</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
                                <span className="text-xs font-bold opacity-60 uppercase tracking-widest">Zero-Log Neural Access</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
                                <span className="text-xs font-bold opacity-60 uppercase tracking-widest">Founder Ownership Protocols</span>
                            </li>
                        </ul>
                    </div>
                </section>

                <footer className="pt-8 pb-12 text-center">
                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.5em]">Updated May 2024 • Build @RizwanRR</p>
                </footer>
            </main>
        </div>
    );
};

export default PoliciesView;
