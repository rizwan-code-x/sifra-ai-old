
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, View, THEMES } from '../types';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import ShieldCheckIcon from '../components/icons/ShieldCheckIcon';
import PlusCircleIcon from '../components/icons/PlusCircleIcon';
import CreditCardIcon from '../components/icons/CreditCardIcon';
import UserIcon from '../components/icons/UserIcon';
import BoltIcon from '../components/icons/BoltIcon';
import ChevronRightIcon from '../components/icons/ChevronRightIcon';
import XMarkIcon from '../components/icons/XMarkIcon';
import LockClosedIcon from '../components/icons/LockClosedIcon';
import BellIcon from '../components/icons/BellIcon';
import QuestionMarkCircleIcon from '../components/icons/QuestionMarkCircleIcon';
import GlobeAltIcon from '../components/icons/GlobeAltIcon';
import SendIcon from '../components/icons/SendIcon';
import { Mail, MapPin, MessageSquare, ShieldQuestion, Zap, User, Settings, Crown, LifeBuoy, Headset, Share2, Camera, CheckCircle2, X } from 'lucide-react';

interface AccountViewProps {
    userProfile: UserProfile;
    onNavigate: (view: View) => void;
    onClose: () => void;
    onUpdateProfile: (p: UserProfile) => void;
}

const SUPPORT_EMAIL = "neurax.help.assistant@gmail.com";
const SUPPORT_ADDRESS = "West Bengal, Murshidabad, Jalangi, 742303";

const PremiumSupportChat: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! You've connected to Sifra Priority Hub. How can we optimize your experience today?", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages([...messages, { id: Date.now(), text: input, sender: 'user' }]);
        setInput('');
        setTimeout(() => {
            setMessages(prev => [...prev, { id: Date.now() + 1, text: "Acknowledged. Your request is registered in the matrix. Rizwan's team will analyze this shortly.", sender: 'bot' }]);
        }, 1200);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 z-[300] bg-[#020617] border border-white/10 rounded-[3rem] shadow-2xl flex flex-col overflow-hidden"
        >
            <div className="p-6 flex items-center justify-between border-b border-white/5 bg-white/5">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Headset className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black italic uppercase tracking-wider">Priority Hub</h3>
                        <p className="text-[8px] font-black uppercase tracking-widest text-indigo-400/60">Real-time Assistance</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                    <XMarkIcon className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 premium-scroll">
                {messages.map(m => (
                    <motion.div 
                        key={m.id}
                        initial={{ opacity: 0, x: m.sender === 'bot' ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`max-w-[85%] p-4 rounded-[1.5rem] text-[11px] font-bold leading-relaxed ${m.sender === 'bot' ? 'bg-indigo-600 text-white self-start shadow-xl shadow-indigo-500/10' : 'bg-white/5 border border-white/10 text-white self-end text-right'}`}
                    >
                        {m.text}
                    </motion.div>
                ))}
            </div>

            <div className="p-6 bg-black/40 border-t border-white/5 flex gap-3">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-4 outline-none focus:border-indigo-500 transition-all text-[11px] font-bold"
                />
                <button onClick={handleSend} className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white active:scale-90 transition-transform">
                    <SendIcon className="w-5 h-5" />
                </button>
            </div>
        </motion.div>
    );
};

const BentoCard: React.FC<{ 
    icon: React.ReactNode, 
    title: string, 
    subtitle: string, 
    color: string, 
    onClick: () => void,
    className?: string
}> = ({ icon, title, subtitle, color, onClick, className = "" }) => (
    <button 
        onClick={onClick}
        className={`relative group overflow-hidden p-6 rounded-[2.5rem] border border-white/5 transition-all active:scale-[0.98] ${className} bg-white/[0.02] hover:bg-white/[0.05]`}
    >
        <div className={`absolute -top-12 -right-12 w-24 h-24 blur-[40px] opacity-20 rounded-full ${color}`} />
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-xl text-white ${color.replace('bg-', 'shadow-')}`}>
            <div className={`w-full h-full rounded-2xl flex items-center justify-center ${color}`}>
                {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6" })}
            </div>
        </div>
        <div className="text-left">
            <h4 className="text-sm font-black uppercase tracking-tighter italic mb-1">{title}</h4>
            <p className="text-[9px] font-black uppercase tracking-widest text-white/30">{subtitle}</p>
        </div>
        <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRightIcon className="w-4 h-4 text-white/40" />
        </div>
    </button>
);

const AccountView: React.FC<AccountViewProps> = ({ userProfile, onNavigate, onClose, onUpdateProfile }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(userProfile.name || '');
    const [showSupportChat, setShowSupportChat] = useState(false);
    const [showAddAsset, setShowAddAsset] = useState(false);

    // Complaint State
    const [complaintText, setComplaintText] = useState('');
    const [complaintStatus, setComplaintStatus] = useState<'idle' | 'sending'>('idle');
    const [referenceId, setReferenceId] = useState('');
    const [trackRefId, setTrackRefId] = useState('');
    
    const [showComplaintSuccessModal, setShowComplaintSuccessModal] = useState(false);
    const [showComplaintTimelineModal, setShowComplaintTimelineModal] = useState(false);

    const playSuccessSound = () => {
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextClass) return;
            const ctx = new AudioContextClass();
            // Upbeat "payment success" double chime
            const playOsc = (freq: number, start: number, dur: number) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
                gain.gain.setValueAtTime(0, ctx.currentTime + start);
                gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + start + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + start);
                osc.stop(ctx.currentTime + start + dur);
            };
            playOsc(659.25, 0, 0.2); // E5
            playOsc(1046.50, 0.15, 0.4); // C6
        } catch (e) {
            console.error(e);
        }
    };

    const handleSave = () => {
        onUpdateProfile({ ...userProfile, name: editName });
        setIsEditing(false);
    };

    const handleSendComplaint = () => {
        if (!complaintText.trim()) return;
        setComplaintStatus('sending');
        // Simulate sending
        setTimeout(() => {
            setComplaintStatus('idle');
            setReferenceId(`SIFRA-${Math.floor(Math.random() * 1000000)}`);
            setComplaintText('');
            setShowComplaintSuccessModal(true);
            playSuccessSound();
        }, 1500);
    };

    return (
        <div className="h-full w-full bg-[#020617] text-white flex flex-col font-sans relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-pink-600/10 blur-[120px] rounded-full" />
            </div>

            {/* Header */}
            <header className="relative z-10 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-90">
                        <ArrowLeftIcon />
                    </button>
                    <div>
                        <h1 className="text-lg font-black italic tracking-tighter uppercase leading-none">Security Node</h1>
                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-400 mt-1">Verified Identity</p>
                    </div>
                </div>
                <div className="relative group">
                    <button 
                        className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-90"
                    >
                        <div className="flex gap-1">
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                        </div>
                    </button>
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-12 w-40 bg-gray-900 border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden transform origin-top-right scale-95 group-hover:scale-100">
                        <button 
                            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                            className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/5 transition-colors border-b border-white/5"
                        >
                            {isEditing ? 'Save' : 'Edit'}
                        </button>
                        <button 
                            onClick={() => onNavigate(View.PROFILE)}
                            className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/5 transition-colors"
                        >
                            See Your Profile
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-6 pb-32 premium-scroll relative z-10 space-y-6">
                {/* Profile Identity Card */}
                <section className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 via-pink-500 to-purple-600 rounded-[2.5rem] blur-lg opacity-10 group-hover:opacity-25 transition-opacity duration-1000" />
                    <div className="relative bg-[#020617] border border-white/5 rounded-[2.2rem] p-6 flex flex-col items-center gap-5 backdrop-blur-3xl shadow-2xl">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-[1.4rem] p-0.5 bg-gradient-to-tr from-indigo-500 to-pink-500 shadow-xl">
                                <div className="w-full h-full rounded-[1.2rem] bg-[#020617] overflow-hidden p-0.5 relative group/avatar">
                                    <img 
                                        src={userProfile.avatar || `https://ui-avatars.com/api/?name=${userProfile.name}&background=020617&color=fff&bold=true&size=512`} 
                                        className="w-full h-full rounded-[1rem] object-cover"
                                        alt="Avatar"
                                    />
                                    {isEditing && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-[1rem] cursor-pointer hover:bg-black/40 transition-colors">
                                            <Camera className="w-5 h-5 text-white" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-lg border-2 border-[#020617] flex items-center justify-center shadow-lg">
                                <ShieldCheckIcon className="w-3 h-3 text-white" />
                            </div>
                        </div>

                        <div className="text-center space-y-0.5">
                            {isEditing ? (
                                <input 
                                    autoFocus
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    className="bg-white/5 border border-indigo-500/30 rounded-lg px-4 py-1.5 text-base font-black italic uppercase text-center outline-none focus:bg-white/10 transition-all w-full max-w-[180px]"
                                />
                            ) : (
                                <>
                                    <h2 className="text-lg font-black italic uppercase tracking-tighter text-white">
                                        {userProfile.name || 'Core Identity'}
                                    </h2>
                                    <p className="text-[7px] font-black uppercase tracking-[0.4em] text-white/20">Neural Level: Alpha Prime</p>
                                </>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/5 flex items-center gap-1.5">
                                <div className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse" />
                                <span className="text-[6px] font-black uppercase tracking-widest text-indigo-400">Sync Active</span>
                            </div>
                            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/5 flex items-center gap-1.5">
                                <span className="text-[6px] font-black uppercase tracking-widest text-emerald-400">SECURE: MATRIX</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Bento Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <BentoCard 
                        icon={<CreditCardIcon />}
                        title="Neural Card"
                        subtitle="Access Key"
                        color="bg-indigo-500"
                        onClick={() => onNavigate(View.YOUR_CARD)}
                        className="p-4 rounded-[1.5rem]"
                    />
                    <BentoCard 
                        icon={<ShieldCheckIcon />}
                        title="Identity Protocol"
                        subtitle="Level 4 SECURED"
                        color="bg-emerald-600"
                        onClick={() => onNavigate(View.SIFRA_IDENTITY)}
                        className="p-4 rounded-[1.5rem]"
                    />
                </div>

                {/* Credentials List */}
                <section className="bg-white/[0.01] border border-white/5 rounded-[1.8rem] overflow-hidden">
                    <div className="p-4 border-b border-white/5">
                        <h3 className="text-[7px] font-black uppercase tracking-[0.4em] text-white/20">Registry Data</h3>
                    </div>
                    <div className="divide-y divide-white/5">
                        <div className="p-4 flex items-center justify-between hover:bg-white/[0.01] transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="text-white/10 group-hover:text-white transition-colors"><Mail className="w-3.5 h-3.5" /></div>
                                <span className="text-[8px] font-black uppercase tracking-widest text-white/30">E-Mail</span>
                            </div>
                            {userProfile.email ? (
                                <span className="text-[9px] font-bold italic text-white/60">{userProfile.email}</span>
                            ) : (
                                <button className="text-[9px] font-bold italic text-indigo-400 hover:text-indigo-300 transition-colors">Add Email +</button>
                            )}
                        </div>
                        <div className="p-4 flex items-center justify-between hover:bg-white/[0.01] transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="text-white/10 group-hover:text-white transition-colors"><Zap className="w-3.5 h-3.5" /></div>
                                <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Neural ID</span>
                            </div>
                            <span className="text-[9px] font-bold italic text-white/60">{userProfile.userId || 'USER-UNVERIFIED'}</span>
                        </div>
                        <div className="p-4 flex items-center justify-between hover:bg-white/[0.01] transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="text-white/10 group-hover:text-white transition-colors"><Crown className="w-3.5 h-3.5" /></div>
                                <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Access Plan</span>
                            </div>
                            <span className="text-[9px] font-bold italic text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">কোনরকম প্ল্যান যুক্ত নেই</span>
                        </div>
                    </div>
                </section>

                {/* Customer Care */}
                <button 
                    onClick={() => setShowSupportChat(true)}
                    className="w-full p-6 rounded-[2rem] bg-gradient-to-r from-rose-600 to-pink-600 flex items-center justify-between active:scale-[0.98] transition-all group relative overflow-hidden shadow-xl"
                >
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-10 h-10 rounded-[1.2rem] bg-white/20 flex items-center justify-center">
                            <Headset className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                            <h4 className="text-[11px] font-black italic uppercase tracking-wider leading-none mb-1">Customer Care</h4>
                            <p className="text-[7px] font-black uppercase tracking-widest opacity-60">Sifra Support Desk</p>
                        </div>
                    </div>
                    <ChevronRightIcon className="w-4 h-4 text-white/40 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Quick Actions */}
                <section className="pb-10">
                    <div className="grid grid-cols-3 gap-4">
                        <button 
                            onClick={() => onNavigate(View.SETTINGS)}
                            className="flex flex-col items-center gap-2 p-3 bg-white/5 rounded-[1.5rem] border border-white/5 hover:bg-white/10 transition-all active:scale-95"
                        >
                            <Settings className="w-4 h-4 text-gray-400" />
                            <span className="text-[7px] font-black uppercase tracking-widest">Settings</span>
                        </button>
                        <button 
                            onClick={() => {}}
                            className="flex flex-col items-center gap-2 p-3 bg-white/5 rounded-[1.5rem] border border-white/5 opacity-60 cursor-default"
                        >
                            <Crown className="w-4 h-4 text-gray-400" />
                            <span className="text-[7px] font-black uppercase tracking-widest text-gray-400">কোনো প্ল্যান নেই</span>
                        </button>
                        <button 
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title: 'Sifra Virtual OS',
                                        text: 'Check out Sifra Virtual OS - amazing AI companion experience!',
                                        url: window.location.href,
                                    }).catch(() => {});
                                } else {
                                    alert('Sharing is not supported on this browser.');
                                }
                            }}
                            className="flex flex-col items-center gap-2 p-3 bg-white/5 rounded-[1.5rem] border border-white/5 hover:bg-white/10 transition-all active:scale-95"
                        >
                            <Share2 className="w-4 h-4 text-blue-400" />
                            <span className="text-[7px] font-black uppercase tracking-widest">Share</span>
                        </button>
                    </div>
                </section>
                {/* Complaint Section */}
                <section className="bg-white/[0.01] border border-white/5 rounded-[1.8rem] overflow-hidden p-5 flex flex-col gap-4 relative">
                    <div className="flex items-center gap-3 mb-2">
                        <MessageSquare className="w-4 h-4 text-rose-400" />
                        <div>
                            <h4 className="text-xs font-black uppercase tracking-wider text-white">Register Complaint</h4>
                            <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Max 50 Words</p>
                        </div>
                    </div>
                    
                    <textarea 
                        value={complaintText}
                        onChange={(e) => {
                            const words = e.target.value.trim().split(/\s+/).filter(Boolean);
                            if (words.length <= 50) setComplaintText(e.target.value);
                        }}
                        className="w-full bg-[#020617] border border-white/10 rounded-xl p-3 text-[11px] font-medium resize-none h-24 outline-none focus:border-rose-500/50 transition-colors"
                        placeholder="Describe your issue here..."
                        disabled={complaintStatus === 'sending'}
                    />
                    
                    <button 
                        onClick={handleSendComplaint}
                        disabled={complaintStatus === 'sending' || !complaintText.trim()}
                        className="w-full bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 text-[10px] font-black uppercase tracking-widest py-3 rounded-xl border border-rose-500/30 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {complaintStatus === 'sending' ? 'Sending...' : 'Send to Sifra Care'}
                    </button>

                    <div className="mt-4 pt-4 border-t border-white/5">
                        <h4 className="text-[9px] font-black uppercase tracking-wider text-white/60 mb-3">Track Existing Complaint</h4>
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                value={trackRefId}
                                onChange={(e) => setTrackRefId(e.target.value.toUpperCase())}
                                placeholder="Enter Reference ID"
                                className="flex-1 bg-[#020617] border border-white/10 rounded-lg px-3 py-2 text-[10px] uppercase outline-none focus:border-indigo-500/50"
                            />
                            <button 
                                onClick={() => {
                                    if(trackRefId) {
                                        setShowComplaintTimelineModal(true);
                                    }
                                }}
                                className="bg-white/10 hover:bg-white/20 px-4 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors"
                            >
                                Check
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Modals & Overlays */}
            <AnimatePresence>
                {showComplaintSuccessModal && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed inset-0 z-[800] bg-[#020617] flex flex-col justify-center items-center text-center p-8 overflow-hidden"
                    >
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-emerald-500/20 blur-[150px] rounded-full" />
                        </div>
                        <button 
                            onClick={() => setShowComplaintSuccessModal(false)}
                            className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all"
                        >
                            <X className="w-6 h-6 text-white/60" />
                        </button>

                        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: 'spring' }} className="mb-8">
                            <div className="w-32 h-32 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                                <CheckCircle2 className="w-16 h-16 text-emerald-400" />
                            </div>
                        </motion.div>

                        <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white mb-4">Request Received</h2>
                        <p className="text-sm font-medium text-white/70 max-w-sm leading-relaxed mb-12">
                            We are resolving your complaint very quickly. Your request has been securely logged into the Sifra matrix.
                        </p>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4 relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Reference Tag</p>
                            <div className="flex items-center justify-between bg-[#020617] rounded-xl p-4 border border-white/10">
                                <span className="font-mono font-bold text-lg text-emerald-400 select-all">{referenceId}</span>
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(referenceId);
                                        // Visual feedback could be added, but minimal is fine
                                    }}
                                    className="px-4 py-2 bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-500/30 transition-colors"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {showComplaintTimelineModal && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-[800] bg-[#020617] flex flex-col p-6 overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-8 z-10">
                            <div className="flex flex-col">
                                <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none text-white">Status Tracker</h1>
                                <p className="text-[10px] font-mono text-indigo-400 mt-1">{trackRefId}</p>
                            </div>
                            <button 
                                onClick={() => setShowComplaintTimelineModal(false)}
                                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all text-white/60"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto premium-scroll relative z-10 space-y-6 px-2">
                            {/* Auto Reply Banner */}
                            <div className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 mb-4">
                                <p className="text-xs font-bold text-emerald-400/90 leading-relaxed">
                                    Your issue is actively monitored. Automatic resolution replies standard within 4 working days.
                                </p>
                            </div>

                            <div className="pl-6 relative">
                                <div className="absolute top-4 bottom-4 left-6 w-[2px] bg-white/10" />

                                <div className="relative mb-8 pl-8 flex flex-col">
                                    <div className="absolute top-1 -left-2 w-4 h-4 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)] border-2 border-[#020617] flex items-center justify-center">
                                        <CheckCircle2 className="w-2.5 h-2.5 text-[#020617]" />
                                    </div>
                                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl w-full">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Interactive Revision</p>
                                        <p className="text-sm font-bold text-white mb-2">Final Confirmation Hub</p>
                                        <p className="text-[11px] font-medium text-white/60">Passed final interactive revision securely.</p>
                                    </div>
                                </div>

                                <div className="relative mb-8 pl-8 flex flex-col">
                                    <div className="absolute top-1 -left-2 w-4 h-4 bg-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.8)] border-2 border-[#020617] flex items-center justify-center">
                                        <div className="w-1 h-1 bg-[#020617] rounded-full" />
                                    </div>
                                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl w-full">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-1">Customer Care</p>
                                        <p className="text-sm font-bold text-white mb-2">Support Handled</p>
                                        <p className="text-[11px] font-medium text-white/60">Sifra Dedicated Team reviewed the logs.</p>
                                    </div>
                                </div>

                                <div className="relative mb-8 pl-8 flex flex-col">
                                    <div className="absolute top-1 -left-2 w-4 h-4 bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.8)] border-2 border-[#020617]" />
                                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl w-full">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-yellow-400 mb-1">Developer</p>
                                        <p className="text-sm font-bold text-white mb-2">Technical Review</p>
                                        <p className="text-[11px] font-medium text-white/60">Backend integration verified.</p>
                                    </div>
                                </div>

                                <div className="relative pl-8 flex flex-col">
                                    <div className="absolute top-1 -left-2 w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)] border-2 border-[#020617] flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full bg-opacity-80" />
                                    </div>
                                    <div className="bg-white/5 border border-blue-500/30 p-4 rounded-2xl w-full">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">CEO & Founder</p>
                                        <p className="text-sm font-bold text-white mb-2 flex items-center gap-2">Rizwan RR <span className="bg-blue-500 text-white rounded-full p-0.5"><CheckCircle2 className="w-3 h-3" /></span></p>
                                        <p className="text-[11px] font-medium text-white/60">Monitored directly by founders office.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
                {showSupportChat && <PremiumSupportChat onClose={() => setShowSupportChat(false)} />}
            </AnimatePresence>

            {/* Asset Adder Overlay Indicator */}
            <div className="absolute bottom-8 right-8 z-[100]">
                <button 
                    onClick={() => setShowAddAsset(!showAddAsset)}
                    className="w-16 h-16 rounded-[2rem] bg-indigo-600 shadow-2xl shadow-indigo-600/40 flex items-center justify-center text-white active:scale-90 transition-transform"
                >
                    <PlusCircleIcon className="w-8 h-8" />
                </button>
            </div>
        </div>
    );
};

export default AccountView;
