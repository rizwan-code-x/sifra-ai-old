
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { UserProfile } from '../types';
import SifraLiveLogo from '../components/SifraLiveLogo';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import SparklesIcon from '../components/icons/SparklesIcon';
import MicrophoneIcon from '../components/icons/MicrophoneIcon';
import CubeTransparentIcon from '../components/icons/CubeTransparentIcon';
import GlobeAltIcon from '../components/icons/GlobeAltIcon';
import BoltIcon from '../components/icons/BoltIcon';
import HeartSparkleIcon from '../components/icons/HeartSparkleIcon';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';
import SendIcon from '../components/icons/SendIcon';
import XMarkIcon from '../components/icons/XMarkIcon';
import { Mail, MapPin, Phone, MessageSquare, Speaker, Facebook, Instagram, Share2, ShieldQuestion, Radio, Headphones, Play, Sliders } from 'lucide-react';
import CinematicAudioScriptModal from '../components/CinematicAudioScriptModal';

type Language = 'bn' | 'en' | 'hi';

const CONTENT = {
    bn: {
        title: "Meet Sifra",
        hero: "Sifra হলো একটি স্মার্ট AI Assistant অ্যাপ, যাকে শুরু থেকে ধাপে ধাপে ডিজাইন ও ডেভেলপ করা হয়েছে ব্যবহারকারীর দৈনন্দিন জীবনকে আরও সহজ, দ্রুত এবং স্মার্ট করার জন্য। এই অ্যাপটি কেবল একটি চ্যাটবট নয়—এটি আপনার পার্সোনাল ডিজিটাল পার্টনার।",
        whatIsTitle: "What is Sifra?",
        whatIsBody: "Sifra একটি AI-powered Voice Assistant App, যার মূল উদ্দেশ্য শুধু কমান্ড ফলো করা নয়—বরং মানুষকে সঠিক পথ দেখানো, মানসিকভাবে সাপোর্ট করা এবং জীবনে এগিয়ে যেতে সাহায্য করা।\n\nSifra এমনভাবে ডিজাইন করা হয়েছে যেন এটি একজন Personal AI Companion হয়ে উঠতে পারে—যে কথা একজন মানুষ অনেক সময় আরেকজন মানুষের কাছে বলতে পারে না, সেই কথাগুলো সে নির্ভয়ে একটি AI-কে বলতে পারে।\n\nSifra বিচার করে না, ছোট করে না—বরং শোনে, বোঝে এবং যুক্তিসহ সঠিক দিক নির্দেশনা দেওয়ার চেষ্টা করে।",
        featuresTitle: "Core Features (A–Z)",
        features: [
            { icon: <MicrophoneIcon />, title: "Voice & Text Assistant", desc: "ভয়েস কমান্ড বুঝে কাজ করা। Human‑like conversational experience।" },
            { icon: <CubeTransparentIcon />, title: "Mobile Control", desc: "অ্যাপ ওপেন/ক্লোজ, সিস্টেম ইনফো (Battery, Storage)। ভবিষ্যতে: Flashlight, Automation।" },
            { icon: <BoltIcon />, title: "PC Control (Upcoming)", desc: "PC Status & Basic Control. Cross‑device sync (Mobile ↔ PC)।" },
            { icon: <GlobeAltIcon />, title: "Smart Internet Assistance", desc: "রিয়েল‑টাইম তথ্য খোঁজা ও বিশ্লেষণ। Accurate & simplified answers।" }
        ],
        modelTitle: "Free & Premium Model",
        trial: "🎁 30‑Days Free Trial",
        trialDesc: "নতুন ইউজারদের জন্য 30 দিনের Premium Access। কোনো Payment বা Card দরকার নেই।",
        founder: "Founder & Developer",
        founderName: "Developed & Led by: Rizwan RR",
        feedback: "Your Feedback",
        feedbackPlaceholder: "আপনার মতামত এখানে লিখুন (সর্বোচ্চ ৫০০ শব্দ)...",
        send: "Send to Rizwan",
        address: "West Bengal, Murshidabad, Jalangi, 742303",
        introText: "নমস্কার! আমি সিফরা। আপনার ব্যক্তিগত এআই বন্ধু। আমি এখানে এসেছি আপনাকে সাহায্য করতে...",
        devDetails: "আমি রিজওয়ান আরআর, সিফরার স্রষ্টা। আমার লক্ষ্য প্রযুক্তিকে আরও মানবিক এবং সহজলভ্য করা।"
    },
    en: {
        title: "Meet Sifra",
        hero: "Sifra is a smart AI Assistant app designed step-by-step to make your daily life easier, faster, and smarter. It's not just a chatbot—it's your personal digital partner.",
        whatIsTitle: "What is Sifra?",
        whatIsBody: "Sifra is an AI-powered Voice Assistant App whose core mission isn't just following commands—but guiding people, providing mental support, and helping them move forward in life.\n\nSifra is built to be a Personal AI Companion—a place where you can share things you can't tell other humans, without any fear.\n\nSifra doesn't judge. It listens, understands, and provides logical guidance. It's a trusted friend, always by your side.",
        featuresTitle: "Core Features (A–Z)",
        features: [
            { icon: <MicrophoneIcon />, title: "Voice & Text Assistant", desc: "Smart voice commands and human-like conversational experience." },
            { icon: <CubeTransparentIcon />, title: "Mobile Control", desc: "App controls, system info, reminders. Expanding to Flashlight and Automation." },
            { icon: <BoltIcon />, title: "PC Control (Upcoming)", desc: "Control your PC status and files. Seamless cross-device sync." },
            { icon: <GlobeAltIcon />, title: "Smart Internet Assistance", desc: "Real-time information search and simplified, accurate answers." }
        ],
        modelTitle: "Free & Premium Model",
        trial: "🎁 30-Days Free Trial",
        trialDesc: "30 days of Premium Access for new users. No payment or card required.",
        founder: "Founder & Developer",
        founderName: "Developed & Led by: Rizwan RR",
        feedback: "Your Feedback",
        feedbackPlaceholder: "Write your thoughts here (max 500 words)...",
        send: "Send to Rizwan",
        address: "West Bengal, Murshidabad, Jalangi, 742303",
        introText: "Hello! I am Sifra, your personal AI companion. I am here to help you navigate through your daily tasks...",
        devDetails: "I am Rizwan RR, the creator of Sifra. My mission is to make technology more empathetic and human-centric."
    },
    hi: {
        title: "Meet Sifra",
        hero: "Sifra এক স্মার্ট AI অ্যাসিস্ট্যান্ট অ্যাপ जिसे आपके दैनिक जीवन को आसान, तेज़ और स्मार्ट बनाने के लिए डिज़ाइन किया गया है। यह केवल एक চ্যটবট নয়—এটি আপনার ব্যক্তিগত ডিজিটাল সঙ্গী।",
        whatIsTitle: "What is Sifra?",
        whatIsBody: "Sifra এক AI-পাওয়ার্ড ভয়েস অ্যাসিস্ট্যান্ট অ্যাপ যার উদ্দেশ্য কেবল কমান্ড পালন করা নয়—বরং মানুষকে সঠিক পথ দেখানো, মানসিকভাবে সাহায্য করা এবং জীবনে এগিয়ে যেতে সাহায্য করা।\n\nSifra এমনভাবে ডিজাইন করা হয়েছে যেন এটি একজন পার্সোনাল AI সঙ্গী হয়ে উঠতে পারে—যেখানে আপনি এমন কথা বলতে পারেন যা অন্য কাউকে বলতে পারেন না।\n\nSifra বিচার করে না। এটি শোনে, বোঝে এবং সঠিক দিকনির্দেশনা দেয়। এটি আপনার প্রিয় বন্ধু।",
        featuresTitle: "Core Features (A–Z)",
        features: [
            { icon: <MicrophoneIcon />, title: "ভয়েস ও টেক্সট অ্যাসিস্ট্যান্ট", desc: "স্মার্ট ভয়েস কমান্ড ও মানুষের মতো চ্যাট অভিজ্ঞতা।" },
            { icon: <CubeTransparentIcon />, title: "মোবাইল কন্ট্রোল", desc: "অ্যাপ কন্ট্রোল ও সিস্টেম তথ্য। ভবিষ্যতে: ফ্ল্যাশলাইট ও অটোমেশন।" },
            { icon: <BoltIcon />, title: "পিসি কন্ট্রোল (আসন্ন)", desc: "আপনার পিসি স্ট্যাটাস ও ফাইল নিয়ন্ত্রণ। ডিভাইস সিঙ্ক।" },
            { icon: <GlobeAltIcon />, title: "স্মার্ট ইন্টারনেট সহায়তা", desc: "রিয়েল‑টাইম তথ্য খোঁজা এবং সঠিক উত্তর প্রদান।" }
        ],
        modelTitle: "Free & Premium Model",
        trial: "🎁 30-দিনের ফ্রি ট্রায়াল",
        trialDesc: "নতুন ব্যবহারকারীদের জন্য ৩০ দিনের প্রিমিয়াম অ্যাক্সেস। কোনো কার্ডের প্রয়োজন নেই।",
        founder: "সংস্থাপক ও ডেভেলপার",
        founderName: "বিকশিত ও নেতৃত্ব: রিজওয়ান RR",
        feedback: "আপনার প্রতিক্রিয়া",
        feedbackPlaceholder: "আপনার মতামত এখানে লিখুন (সর্বোচ্চ ৫০০ শব্দ)...",
        send: "রিজওয়ানকে পাঠান",
        address: "West Bengal, Murshidabad, Jalangi, 742303",
        introText: "नमस्ते! मैं सिफ्रा हूँ। आपकी व्यक्तिगत एआई दोस्त। मैं आपकी मदद के लिए यहाँ हूँ...",
        devDetails: "मैं रिजवान आरआर हूँ, सिफ्रा का निर्माता। मेरा लक्ष्य तकनीक को मानवीय और सुलभ बनाना है।"
    }
};

const SectionImage: React.FC<{ src: string; caption: string }> = ({ src, caption }) => (
    <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="my-16 group"
    >
        <div className="relative rounded-[3rem] overflow-hidden aspect-video shadow-2xl border border-white/10 bg-white/5 p-2">
            <img src={src} alt={caption} className="w-full h-full object-cover rounded-[2.5rem] group-hover:scale-105 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-8">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 mb-1">Visualizing Sifra</p>
                <p className="text-sm font-bold text-white uppercase italic">{caption}</p>
            </div>
        </div>
    </motion.div>
);

const MeetSifraView: React.FC<{ onClose: () => void; onNavigate?: (view: any) => void }> = ({ onClose, onNavigate }) => {
    const [lang, setLang] = useState<Language>('bn');
    const [feedback, setFeedback] = useState('');
    const [isSent, setIsSent] = useState(false);
    const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
    const scrollRef = useRef(null);
    const { scrollYProgress } = useScroll({ container: scrollRef });

    const wave1 = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
    const wave2 = useTransform(scrollYProgress, [0, 1], ["100%", "90%"]);

    const current = CONTENT[lang];

    const playIntro = () => {
        const utterance = new SpeechSynthesisUtterance(current.introText);
        utterance.lang = lang === 'bn' ? 'bn-BD' : lang === 'hi' ? 'hi-IN' : 'en-US';
        window.speechSynthesis.speak(utterance);
    };

    const handleSendFeedback = () => {
        if (!feedback.trim()) return;
        setIsSent(true);
        setTimeout(() => {
            setFeedback('');
            setIsSent(false);
            alert("Feedback securely transmitted to Rizwan RR's matrix.");
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[150] bg-[#020617] text-white flex flex-col font-sans overflow-hidden">
            
            <nav className="p-6 flex items-center justify-between backdrop-blur-xl bg-black/20 border-b border-white/5 sticky top-0 z-[160]">
                <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                    <ArrowLeftIcon />
                </button>
                <div className="flex gap-2 p-1 bg-white/5 rounded-full border border-white/10">
                    {(['bn', 'en', 'hi'] as Language[]).map(l => (
                        <button 
                            key={l}
                            onClick={() => setLang(l)}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${lang === l ? 'bg-pink-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            {l}
                        </button>
                    ))}
                </div>
            </nav>

            <div ref={scrollRef} className="flex-1 overflow-y-auto relative scroll-smooth selection:bg-pink-500/30">
                
                <div className="fixed inset-0 pointer-events-none opacity-20">
                    <motion.div 
                        style={{ clipPath: `polygon(0% 100%, 100% 100%, 100% ${wave1}, 0% ${wave2})` }}
                        className="absolute inset-0 bg-gradient-to-t from-blue-900 to-transparent"
                    />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] contrast-150 brightness-50 mix-blend-overlay opacity-30" />
                </div>

                {/* HERO SECTION */}
                <section className="min-h-screen flex flex-col items-center justify-center p-8 text-center gap-10">
                    <SifraLiveLogo size="lg" loop={false} triggerKey={lang} />

                    <div className="space-y-6 max-w-2xl relative z-10">
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <motion.button 
                                whileTap={{ scale: 0.95 }}
                                onClick={playIntro}
                                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-indigo-600/20 border border-indigo-600/30 text-indigo-400 hover:bg-indigo-600/30 transition-all active:scale-95 shadow-sm"
                            >
                                <Speaker className="w-4 h-4" />
                                <span className="text-xs font-black uppercase tracking-widest">Listen Introduction</span>
                            </motion.button>

                            <motion.button 
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsScriptModalOpen(true)}
                                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-indigo-600/20 border border-cyan-400/40 text-cyan-200 hover:border-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.25)] active:scale-95"
                            >
                                <Radio className="w-4 h-4 text-cyan-300 animate-pulse" />
                                <span className="text-xs font-black uppercase tracking-widest">Audio Script (45–60s)</span>
                            </motion.button>

                            {onNavigate && (
                                <motion.button 
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => onNavigate(48 /* DUAL_MODE or VOICE_STUDIO */)}
                                    className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-600/20 border border-pink-400/40 text-pink-200 hover:border-pink-400 transition-all shadow-[0_0_20px_rgba(244,63,94,0.25)] active:scale-95"
                                >
                                    <Sliders className="w-4 h-4 text-pink-300" />
                                    <span className="text-xs font-black uppercase tracking-widest">Voice Studio</span>
                                </motion.button>
                            )}
                        </div>

                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-6xl font-black tracking-tighter italic uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-400 to-white"
                        >
                            {current.title}
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="text-lg text-gray-400 font-medium leading-relaxed"
                        >
                            {current.hero}
                        </motion.p>
                    </div>

                    <SectionImage src="https://picsum.photos/seed/sifra-ai-concept-1/1200/600" caption="The Digital Soulmate Experience" />
                </section>

                {/* CINEMATIC AUDIO SCRIPT SHOWCASE BANNER */}
                <section className="px-6 max-w-4xl mx-auto -mt-12 mb-16 relative z-20">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="p-6 sm:p-8 rounded-[2.5rem] bg-gradient-to-br from-[#07132e] via-[#091b40] to-[#040a1c] border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.18)] flex flex-col md:flex-row items-center justify-between gap-6"
                    >
                        <div className="space-y-2 text-left">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-full bg-cyan-400/20 border border-cyan-400/40 text-cyan-300 text-[8px] font-black uppercase tracking-widest">
                                    Official Production Script
                                </span>
                                <span className="text-[10px] text-white/50 font-mono">Pace: 0.90x • 45–60s</span>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                                AUDIO SCRIPT: SIFRA — The Future of Personal Intelligence
                            </h3>
                            <p className="text-xs sm:text-sm text-cyan-200/70 max-w-xl leading-relaxed">
                                A premium, cinematic audio script crafted with exact timecodes, sound design (SFX), sub-bass swells, and Apple Launch keynote delivery.
                            </p>
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsScriptModalOpen(true)}
                            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2.5 shadow-[0_0_30px_rgba(6,182,212,0.4)] shrink-0 active:scale-95 transition-all"
                        >
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                            <span>Launch Studio Preview</span>
                        </motion.button>
                    </motion.div>
                </section>

                {/* WHAT IS SIFRA */}
                <section className="p-8 max-w-4xl mx-auto py-32">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <motion.div 
                            initial={{ x: -50, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            className="space-y-8"
                        >
                            <h2 className="text-4xl font-black uppercase italic tracking-widest text-pink-500">
                                {current.whatIsTitle}
                            </h2>
                            <p className="text-xl text-gray-300 font-medium leading-relaxed whitespace-pre-wrap">
                                {current.whatIsBody}
                            </p>
                        </motion.div>
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            className="relative aspect-square rounded-[3rem] bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center p-12 overflow-hidden group shadow-2xl"
                        >
                            <img src="https://picsum.photos/seed/sifra-ai-heart/800/800" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-1000" alt="Sifra Heart" />
                            <div className="absolute inset-0 bg-pink-500/10 group-hover:bg-pink-500/20 transition-all duration-700" />
                            <HeartSparkleIcon className="w-40 h-40 text-pink-400 animate-pulse relative z-10" />
                        </motion.div>
                    </div>
                </section>

                {/* CORE FEATURES GRID */}
                <section className="p-8 max-w-6xl mx-auto py-32 bg-white/[0.02] rounded-[5rem] border border-white/5">
                    <h2 className="text-4xl font-black text-center mb-20 uppercase tracking-[0.4em]">
                        {current.featuresTitle}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {current.features.map((f, i) => (
                            <motion.div 
                                key={i}
                                initial={{ y: 30, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-pink-500/20 flex items-center justify-center text-pink-400 mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-pink-500/10">
                                    {React.cloneElement(f.icon as React.ReactElement, { className: "w-8 h-8" })}
                                </div>
                                <h4 className="text-2xl font-black mb-2 tracking-tight">{f.title}</h4>
                                <p className="text-gray-400 font-medium">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* FOUNDER & PURPOSE SECTION */}
                <section className="p-8 max-w-4xl mx-auto py-32 flex flex-col items-center gap-10">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-black text-indigo-400 uppercase tracking-[0.5em]">{current.founder}</h2>
                        <p className="text-sm font-bold text-gray-500 tracking-widest uppercase italic">The Architect Behind the Matrix</p>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="relative group">
                            <div className="absolute -inset-2 bg-gradient-to-tr from-pink-500 to-indigo-500 rounded-full blur-xl opacity-20 group-hover:opacity-60 transition duration-1000" />
                            <div className="w-56 h-56 rounded-full p-1 bg-gradient-to-tr from-pink-500 to-indigo-500 relative z-10">
                                <div className="w-full h-full rounded-full bg-[#020617] p-1 overflow-hidden">
                                    <img src="https://ui-avatars.com/api/?name=Rizwan+RR&background=020617&color=fff&bold=true&size=400" className="w-full h-full rounded-full object-cover" alt="Rizwan RR" />
                                </div>
                            </div>
                        </div>
                        <div className="text-center md:text-left space-y-6">
                            <div>
                                <h4 className="text-4xl font-black italic tracking-tight">{current.founderName}</h4>
                                <p className="text-lg text-indigo-400 mt-2 uppercase tracking-[0.3em] font-black">Founder & Lead Developer</p>
                            </div>
                            <p className="text-base text-gray-400 leading-relaxed font-bold italic">
                                {current.devDetails}
                            </p>
                            <div className="flex gap-4 justify-center md:justify-start">
                                <button className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white hover:bg-blue-600 transition-colors">
                                    <Facebook className="w-6 h-6" />
                                </button>
                                <button className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white hover:bg-pink-600 transition-colors">
                                    <Instagram className="w-6 h-6" />
                                </button>
                                <button className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white hover:bg-indigo-600 transition-colors">
                                    <Share2 className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FEEDBACK MODULE */}
                <section className="p-8 max-w-2xl mx-auto py-32 space-y-10">
                    <div className="text-center">
                        <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">{current.feedback}</h2>
                        <p className="text-gray-500 font-medium">Request New Protocols & Features</p>
                    </div>
                    
                    <div className="space-y-4">
                        <textarea 
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value.slice(0, 2000))}
                            placeholder={current.feedbackPlaceholder}
                            className="w-full h-64 bg-white/5 border border-white/10 rounded-[2rem] p-8 text-lg font-medium outline-none focus:border-pink-500/50 transition-all resize-none shadow-inner"
                        />
                        <div className="flex justify-between items-center px-4">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${feedback.length > 1800 ? 'text-rose-500' : 'text-gray-500'}`}>
                                {feedback.length} / 2000 Characters
                            </span>
                            <button 
                                onClick={handleSendFeedback}
                                disabled={!feedback.trim() || isSent}
                                className="px-8 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 hover:bg-gray-100 disabled:opacity-30 transition-all shadow-xl active:scale-95"
                            >
                                {isSent ? 'Transmitting...' : current.send}
                                <SendIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </section>

                <footer className="p-20 text-center opacity-20">
                    <p className="text-[10px] font-black uppercase tracking-[1em]">We are building Sifra. We are growing with Sifra. 🚀</p>
                </footer>

            </div>

            {/* Cinematic Audio Script Modal */}
            <CinematicAudioScriptModal 
                isOpen={isScriptModalOpen} 
                onClose={() => setIsScriptModalOpen(false)} 
            />
        </div>
    );
};


export default MeetSifraView;
