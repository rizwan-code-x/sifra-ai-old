
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { UserProfile } from '../types';
import BoltIcon from '../components/icons/BoltIcon';
import SparklesIcon from '../components/icons/SparklesIcon';
import LockClosedIcon from '../components/icons/LockClosedIcon';
import XMarkIcon from '../components/icons/XMarkIcon';

interface LoginViewProps {
    onLoginSuccess: (user: UserProfile) => void;
    onAdminLogin: () => void;
    allUsers: UserProfile[];
    setAllUsers: (users: UserProfile[]) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onAdminLogin, allUsers, setAllUsers }) => {
    const [view, setView] = useState<'login' | 'register'>('login');
    const [showAdminPrompt, setShowAdminPrompt] = useState(false);
    const [adminPass, setAdminPass] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [info, setInfo] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

    const generateSifraId = (prefix: string = ''): string => {
        const digits = '0123456789';
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const suffix = `${digits[Math.floor(Math.random() * 10)]}${digits[Math.floor(Math.random() * 10)]}${letters[Math.floor(Math.random() * 26)]}${digits[Math.floor(Math.random() * 10)]}${digits[Math.floor(Math.random() * 10)]}`;
        return prefix ? `${prefix}-${suffix}` : suffix;
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const foundUser = allUsers.find(u => u.email?.toLowerCase() === email.toLowerCase() && u.name === name);
        if (foundUser) {
            onLoginSuccess(foundUser);
        } else {
            setInfo({ type: 'error', message: 'Neural link failed. Verify credentials.' });
        }
    };

    const handleAdminVerify = () => {
        if (adminPass === '8888') {
            setShowAdminPrompt(false);
            onAdminLogin();
        } else {
            alert("Matrix Access Denied: Incorrect Security Cipher.");
            setAdminPass('');
        }
    };

    const handleGuestEntry = () => {
        const guestUser: UserProfile = {
            name: 'Guest User',
            nickname: 'Guest',
            email: 'guest@sifra.local',
            avatar: null,
            themeId: 'default',
            sifraAvatarId: 'cute',
            saveHistory: false,
            userId: generateSifraId('GUEST'),
            joinDate: new Date().toISOString(),
            status: 'active',
            lastLogin: new Date().toISOString(),
            moodAmbienceEnabled: false,
        };
        onLoginSuccess(guestUser);
    };
    
    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        if (allUsers.some(u => u.email?.toLowerCase() === email.toLowerCase())) {
            setInfo({ type: 'error', message: 'Frequency already in use.' });
            return;
        }
        const newUser: UserProfile = {
            name: name.trim(),
            nickname: null,
            email: email.trim().toLowerCase(),
            avatar: null,
            themeId: 'default',
            sifraAvatarId: 'cute',
            saveHistory: true,
            userId: generateSifraId(),
            joinDate: new Date().toISOString(),
            status: 'active',
            lastLogin: new Date().toISOString(),
            moodAmbienceEnabled: false,
        };
        setAllUsers([...allUsers, newUser]);
        onLoginSuccess(newUser);
    };

    return (
        <div className="w-screen h-screen bg-gradient-to-br from-indigo-900 via-slate-900 to-black flex items-center justify-center p-4 font-sans selection:bg-cyan-500/30 overflow-hidden relative">
            
            {/* Background Particles Simulation */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.05)_0%,_transparent_70%)]" />
            </div>

            <div className="w-full max-w-md bg-white/5 backdrop-blur-3xl p-10 rounded-[3.5rem] border border-white/10 shadow-2xl transition-all duration-500 animate-fade-in-up relative overflow-hidden z-10">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <BoltIcon className="w-20 h-20 text-cyan-400" />
                </div>

                <div className="text-center mb-10">
                    <h1 className="text-5xl font-black text-white italic tracking-tighter mb-2">SIFRA</h1>
                    <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.6em]">Neural Engine v4.1</p>
                </div>

                {view === 'login' ? (
                    <div className="space-y-4">
                        <form onSubmit={handleLogin} className="space-y-4">
                            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Identity Name" className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-cyan-500 transition-all placeholder:text-white/20" required />
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Frequency (Email)" className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-cyan-500 transition-all placeholder:text-white/20" required />
                            <button type="submit" className="w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all">Link Session</button>
                        </form>

                        <div className="pt-2 flex flex-col gap-3">
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={handleGuestEntry}
                                    className="group py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all active:scale-95"
                                >
                                    <SparklesIcon className="w-4 h-4 text-cyan-400" />
                                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Guest</span>
                                </button>
                                <button 
                                    onClick={() => setShowAdminPrompt(true)}
                                    className="group py-4 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center gap-2 hover:bg-cyan-500/20 transition-all active:scale-95"
                                >
                                    <LockClosedIcon className="w-4 h-4 text-cyan-400" />
                                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Admin</span>
                                </button>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => setView('register')} 
                                className="text-[10px] text-white/40 font-bold uppercase tracking-[0.3em] hover:text-cyan-400 text-center transition-colors mt-2"
                            >
                                Initialize New Node
                            </button>
                        </div>
                    </div>
                ) : (
                     <form onSubmit={handleRegister} className="space-y-4">
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Select Identity" className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-cyan-500 transition-all placeholder:text-white/20" required />
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Neural Vector (Email)" className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-cyan-500 transition-all placeholder:text-white/20" required />
                        <button type="submit" className="w-full py-5 bg-cyan-500 text-black font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all">Deploy Node</button>
                        <button type="button" onClick={() => setView('login')} className="w-full text-center text-[10px] text-white/40 font-bold uppercase tracking-[0.3em] pt-4 hover:text-white transition-colors">Return to Handshake</button>
                    </form>
                )}
                
                {info && (
                    <p className={`text-[10px] text-center mt-6 font-bold uppercase tracking-widest ${info.type === 'error' ? 'text-rose-500' : 'text-emerald-400'}`}>
                        {info.message}
                    </p>
                )}
            </div>

            {/* Admin Password Modal */}
            <AnimatePresence>
                {showAdminPrompt && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative"
                        >
                            <button onClick={() => setShowAdminPrompt(false)} className="absolute top-6 right-6 text-white/20 hover:text-white"><XMarkIcon className="w-6 h-6" /></button>
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                                    <LockClosedIcon className="w-8 h-8 text-cyan-400" />
                                </div>
                                <h2 className="text-xl font-black text-white uppercase italic tracking-widest">Admin Cipher</h2>
                                <p className="text-[10px] text-white/30 uppercase mt-2">Enter override key to access console</p>
                            </div>
                            <input 
                                type="password" 
                                value={adminPass} 
                                onChange={e => setAdminPass(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAdminVerify()}
                                placeholder="••••"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-3xl text-center tracking-[0.5em] text-cyan-400 outline-none focus:border-cyan-500 mb-6"
                                maxLength={4}
                                autoFocus
                            />
                            <button onClick={handleAdminVerify} className="w-full py-5 bg-cyan-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all">Decrypt Access</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LoginView;
