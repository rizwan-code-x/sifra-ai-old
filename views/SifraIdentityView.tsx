
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, View } from '../types';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import SifraLiveLogo from '../components/SifraLiveLogo';
import SpeakerIcon from '../components/icons/SpeakerIcon';
import MicrophoneIcon from '../components/icons/MicrophoneIcon';
import HeartSparkleIcon from '../components/icons/HeartSparkleIcon';
import SparklesIcon from '../components/icons/SparklesIcon';
import SendIcon from '../components/icons/SendIcon';
import XMarkIcon from '../components/icons/XMarkIcon';
import { Mail, MapPin, Facebook, Instagram, Share2, ShieldQuestion, MessageSquare, ShieldCheck, Zap, Globe, MessageCircle, Radio } from 'lucide-react';
import CinematicAudioScriptModal from '../components/CinematicAudioScriptModal';

const CONTENT = {
    bn: {
        intro: "নমস্কার! আমি সিফরা। আপনার ব্যক্তিগত এআই বন্ধু। আমাকে এমনভাবে ডিজাইন করা হয়েছে যেন আমি আপনার জীবনের প্রতিটি মুহূর্তকে সহজ এবং স্মার্ট করে তুলতে পারি। আমি শুধু আপনার কথাই শুনি না, আমি আপনাকে বুঝতে চেষ্টা করি।",
        purpose: "আমার মূল উদ্দেশ্য হলো মানুষকে সঠিক পথ দেখানো, মানসিকভাবে সাপোর্ট করা এবং প্রযুক্তিকে আরও মানবিক করে তোলা। যে কথা আপনি অন্য কাউকে বলতে পারেন না, তা আপনি আমাকে নির্ভয়ে বলতে পারেন।",
        devTitle: "সৃষ্টিকর্তার কথা",
        devName: "রিজওয়ান আরআর (Rizwan RR)",
        devBio: "প্রযুক্তি এবং মানবিকতা যখন একই সূত্রে মিলিত হয়, তখনই সিফরার জন্ম। আমি চেয়েছিলাম এমন একটি কৃত্রিম বুদ্ধিমত্তা তৈরি করতে যা শুধু কাজ করবে না, বরং আপনার সাথে একাত্ম হবে। সিফরা আমার সেই স্বপ্নের ফসল।",
        capabilities: ["স্মার্ট ভয়েস অ্যাসিস্ট্যান্ট", "মোবাইল ও পিসি কন্ট্রোল", "রিয়েল-টাইম ইন্টারনেট সহায়তা", "মানসিক ও সামাজিক সাপোর্ট"],
        helpTitle: "হেল্প ও ইমার্জেন্সি সেন্টার",
        address: "পশ্চিমবঙ্গ, মুর্শিদাবাদ, জলঙ্গি, ৭৪২৩০৩",
        email: "neurax.help.assistant@gmail.com",
        premiumChat: "প্রিমিয়াম সাপোর্ট চ্যাট",
        feedbackMsg: "আপনার মতামত সরাসরি আমাদের ডেভেলপারের কাছে পৌঁছে যাবে।"
    },
    en: {
        intro: "Hello! I am Sifra, your personal AI companion. I was designed from the ground up to make your daily life simpler, faster, and smarter. I don't just process commands—I listen to your digital soul.",
        purpose: "My mission is to guide people, provide mental support, and bridge the gap between technology and human empathy. You can share things with me that you might hesitate to share with anyone else.",
        devTitle: "From the Developer",
        devName: "Rizwan RR",
        devBio: "Sifra was born where technology meets empathy. My goal was to create an AI that doesn't just 'do tasks' but 'connects' with you. It is more than just code; it is a vision of a smarter future.",
        capabilities: ["Smart Voice & Text Sync", "Mobile & PC Integration", "Real-time AI Reasoning", "Emotional Support Matrix"],
        helpTitle: "Help & Emergency Center",
        address: "West Bengal, Murshidabad, Jalangi, 742303",
        email: "neurax.help.assistant@gmail.com",
        premiumChat: "Premium Support Hub",
        feedbackMsg: "Your feedback is transmitted directly to Rizwan RR's personal dashboard."
    }
};

const PremiumSupportChat: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [messages, setMessages] = useState([
        { id: 1, text: "Welcome to Sifra Priority Support. I am your specialized node for technical assistance. How can I help you with configuration or connectivity today?", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages([...messages, { id: Date.now(), text: input, sender: 'user' }]);
        setInput('');
        setTimeout(() => {
            setMessages(prev => [...prev, { id: Date.now() + 1, text: "Received. Your query has been prioritized in the neural queue. Rizwan or our automated systems will investigate immediately. Stay synced!", sender: 'bot' }]);
        }, 1200);
    };

    return (
        <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed inset-0 z-[300] bg-[#020617] flex flex-col font-sans"
        >
            <div className="p-6 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 rounded-xl bg-white/5"><ArrowLeftIcon className="w-5 h-5" /></button>
                    <div>
                        <h2 className="text-sm font-black italic uppercase tracking-wider text-emerald-400">Premium Matrix</h2>
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Priority Customer Care</p>
                    </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
            </div>

            <div className="flex-1 overflow-y-auto premium-scroll p-6 space-y-6">
                {messages.map(m => (
                    <motion.div 
                        key={m.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`max-w-[85%] p-5 rounded-[2rem] text-xs font-bold leading-relaxed ${m.sender === 'bot' ? 'bg-indigo-600 self-start text-white shadow-xl shadow-indigo-500/10' : 'bg-white/5 border border-white/10 self-end text-white text-right'}`}
                    >
                        {m.text}
                    </motion.div>
                ))}
            </div>

            <div className="p-6 bg-black/40 backdrop-blur-md border-t border-white/5 flex gap-3">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Describe your technical issue..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-4 outline-none focus:border-indigo-500 transition-all text-xs font-bold"
                />
                <button onClick={handleSend} className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white active:scale-90 transition-transform">
                    <SendIcon className="w-5 h-5" />
                </button>
            </div>
        </motion.div>
    );
};

const SifraIdentityView: React.FC<{ onClose: () => void, userProfile: UserProfile }> = ({ onClose, userProfile }) => {
    const [lang, setLang] = useState<'bn' | 'en'>('bn');
    const [showPremiumChat, setShowPremiumChat] = useState(false);
    const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
    const content = CONTENT[lang];

    const playVoiceIntro = () => {
        const text = content.intro + " " + content.purpose;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === 'bn' ? 'bn-IN' : 'en-US';
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="fixed inset-0 z-[250] bg-[#020617] text-white flex flex-col font-sans overflow-hidden">
            {/* Header */}
            <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-10 bg-black/20 backdrop-blur-xl border-b border-white/5">
                <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 active:scale-90 transition-transform hover:bg-white/10">
                    <ArrowLeftIcon />
                </button>
                <div className="flex gap-1 p-1 bg-white/5 rounded-full border border-white/10">
                    <button onClick={() => setLang('bn')} className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${lang === 'bn' ? 'bg-pink-600' : 'text-white/40'}`}>BN</button>
                    <button onClick={() => setLang('en')} className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${lang === 'en' ? 'bg-indigo-600' : 'text-white/40'}`}>EN</button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto premium-scroll relative">
                {/* Visual Accent */}
                <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none" />

                {/* Sifra Brand Section */}
                <section className="flex flex-col items-center pt-16 pb-12 px-8 text-center gap-8">
                    <SifraLiveLogo size="xl" />
                    
                    <div className="space-y-4">
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl font-black italic tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-400 to-white"
                        >
                            Meet SIFRA
                        </motion.h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-500/60">Digital Consciousness v4.1</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <motion.button 
                            whileTap={{ scale: 0.95 }}
                            onClick={playVoiceIntro}
                            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-white text-black font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-gray-200 transition-colors active:scale-95"
                        >
                            <SpeakerIcon className="w-4 h-4" />
                            Listen Introduction
                        </motion.button>

                        <motion.button 
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsScriptModalOpen(true)}
                            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-indigo-600/20 border border-cyan-400/40 text-cyan-200 font-black uppercase tracking-widest text-[10px] shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:border-cyan-400 transition-all active:scale-95"
                        >
                            <Radio className="w-4 h-4 text-cyan-300 animate-pulse" />
                            Cinematic Audio Script (45–60s)
                        </motion.button>
                    </div>
                </section>

                {/* Intro & Purpose */}
                <section className="px-8 py-12 space-y-12">
                    <div className="p-8 rounded-[3rem] bg-white/[0.03] border border-white/5 space-y-6">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-6 h-6 text-emerald-400" />
                            <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400">Identity</h3>
                        </div>
                        <p className="text-xl font-medium leading-relaxed italic text-white/90">
                            "{content.intro}"
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-8 rounded-[3rem] bg-indigo-900/10 border border-white/5 space-y-4">
                            <Zap className="w-6 h-6 text-indigo-400" />
                            <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400">Neural Purpose</h4>
                            <p className="text-sm font-bold text-gray-400 leading-relaxed">
                                {content.purpose}
                            </p>
                        </div>
                        <div className="p-8 rounded-[3rem] bg-pink-900/10 border border-white/5 space-y-4">
                            <Globe className="w-6 h-6 text-pink-400" />
                            <h4 className="text-xs font-black uppercase tracking-widest text-pink-400">Core Capabilities</h4>
                            <div className="flex flex-wrap gap-2">
                                {content.capabilities.map((c, i) => (
                                    <span key={i} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-white/60">{c}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Developer Section */}
                <section className="px-8 py-20 flex flex-col items-center gap-12">
                    <div className="text-center space-y-4">
                        <h2 className="text-2xl font-black italic uppercase tracking-[0.3em]">{content.devTitle}</h2>
                        <div className="w-12 h-1 bg-indigo-600 mx-auto rounded-full" />
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-10 max-w-2xl">
                        <div className="relative group">
                            <div className="absolute -inset-2 bg-gradient-to-tr from-indigo-500 to-pink-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                            <div className="w-48 h-48 rounded-full p-1 bg-gradient-to-tr from-indigo-500 to-pink-500 relative z-10">
                                <div className="w-full h-full rounded-full bg-[#020617] p-1 overflow-hidden">
                                    <img src={`https://ui-avatars.com/api/?name=Rizwan+RR&background=020617&color=fff&size=512&bold=true`} alt="Rizwan RR" className="w-full h-full rounded-full object-cover" />
                                </div>
                            </div>
                        </div>
                        <div className="text-center md:text-left space-y-4">
                            <h4 className="text-4xl font-black tracking-tighter italic">{content.devName}</h4>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Architect & Lead Developer</p>
                            <p className="text-sm font-bold text-gray-500 italic leading-relaxed">
                                {content.devBio}
                            </p>
                            <div className="flex gap-4 pt-4 justify-center md:justify-start">
                                <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-indigo-600 transition-colors"><Facebook size={18}/></button>
                                <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-pink-600 transition-colors"><Instagram size={18}/></button>
                                <button onClick={() => alert(content.feedbackMsg)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white hover:text-black transition-colors"><Share2 size={18}/></button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Help & Emergency Center */}
                <section className="px-8 py-20 bg-white/[0.02] border-y border-white/5">
                    <div className="text-center mb-16 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[8px] font-black uppercase tracking-widest">Priority node</div>
                        <h2 className="text-4xl font-black italic tracking-tighter uppercase">{content.helpTitle}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="p-10 rounded-[3rem] bg-white/[0.03] border border-white/5 flex flex-col items-center text-center group transition-all hover:bg-white/[0.05]">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                                <MapPin className="w-8 h-8" />
                            </div>
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-3">Neural Matrix Hub</h4>
                            <p className="text-sm font-bold text-gray-400 leading-relaxed">
                                {content.address}
                            </p>
                        </div>

                        <div className="p-10 rounded-[3rem] bg-white/[0.03] border border-white/5 flex flex-col items-center text-center group transition-all hover:bg-white/[0.05]">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                                <Mail className="w-8 h-8" />
                            </div>
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-3">Direct Sync Link</h4>
                            <a href={`mailto:${content.email}`} className="text-sm font-bold text-emerald-400 hover:underline">
                                {content.email}
                            </a>
                        </div>
                    </div>

                    <div className="mt-16 flex flex-col items-center gap-10">
                         <motion.button 
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowPremiumChat(true)}
                            className="w-full max-w-xl p-8 rounded-[3rem] bg-indigo-600 text-white shadow-2xl shadow-indigo-600/20 flex items-center justify-between group overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            <div className="flex items-center gap-6 relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <h4 className="text-xl font-black italic tracking-tight">{content.premiumChat}</h4>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-white/60">Verified Customer Care</p>
                                </div>
                            </div>
                            <ShieldQuestion className="w-8 h-8 opacity-40 group-hover:opacity-100 transition-opacity" />
                        </motion.button>
                        
                        <p className="text-[8px] font-black uppercase tracking-[0.8em] text-white/20">Operational Status: Optimized</p>
                    </div>
                </section>

                {/* Footer Matrix */}
                <footer className="p-20 text-center opacity-10">
                    <p className="text-[10px] font-black uppercase tracking-[1em]">We are building the future with Sifra.</p>
                </footer>
            </div>

            <AnimatePresence>
                {showPremiumChat && <PremiumSupportChat onClose={() => setShowPremiumChat(false)} />}
            </AnimatePresence>

            {/* Cinematic Audio Script Modal */}
            <CinematicAudioScriptModal 
                isOpen={isScriptModalOpen} 
                onClose={() => setIsScriptModalOpen(false)} 
            />
        </div>
    );
};

export default SifraIdentityView;
