
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import CalendarIcon from '../components/icons/CalendarIcon';
import SunIcon from '../components/icons/SunIcon';

interface GreetingsViewProps {
    userProfile: UserProfile;
    onClose: () => void;
}

const GreetingsView: React.FC<GreetingsViewProps> = ({ userProfile, onClose }) => {
    const [isRobot, setIsRobot] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const hour = currentTime.getHours();
    const userName = (userProfile.nickname || userProfile.name || 'Explorer').split(' ')[0];

    // Determine Time Setting
    let timeMode: 'morning' | 'noon' | 'afternoon' | 'evening' | 'night' | 'midnight' = 'morning';
    if (hour >= 0 && hour < 5) timeMode = 'midnight';
    else if (hour >= 5 && hour < 11) timeMode = 'morning';
    else if (hour >= 11 && hour < 14) timeMode = 'noon';
    else if (hour >= 14 && hour < 17) timeMode = 'afternoon';
    else if (hour >= 17 && hour < 19) timeMode = 'evening';
    else if (hour >= 19 && hour <= 23) timeMode = 'night';

    // Theme Variables by Time
    const themes = {
        morning: {
            bg: 'bg-gradient-to-t from-orange-200 via-sky-200 to-sky-400',
            greeting: 'Good Morning',
            message: 'Wishing you a bright & productive day ahead!',
            textColor: 'text-gray-900',
            subText: 'text-gray-700'
        },
        noon: {
            bg: 'bg-gradient-to-t from-sky-300 via-sky-400 to-blue-500',
            greeting: 'Good Noon',
            message: 'Hope you are having a wonderful day!',
            textColor: 'text-white',
            subText: 'text-blue-100'
        },
        afternoon: {
            bg: 'bg-gradient-to-t from-yellow-200 via-blue-300 to-blue-500',
            greeting: 'Good Afternoon',
            message: 'Hope your afternoon is going smoothly!',
            textColor: 'text-white',
            subText: 'text-white/80'
        },
        evening: {
            bg: 'bg-gradient-to-t from-orange-500 via-pink-500 to-purple-600',
            greeting: 'Good Evening',
            message: 'Relax and enjoy your pleasant evening!',
            textColor: 'text-white',
            subText: 'text-orange-100'
        },
        night: {
            bg: 'bg-gradient-to-t from-indigo-900 via-purple-900 to-black',
            greeting: 'Good Night',
            message: 'Wishing you a calm and peaceful night!',
            textColor: 'text-white',
            subText: 'text-indigo-200'
        },
        midnight: {
            bg: 'bg-gradient-to-t from-slate-900 via-black to-black',
            greeting: 'Good Evening',
            message: 'Late night reflections with Sifra.',
            textColor: 'text-white',
            subText: 'text-slate-400'
        }
    };

    const currentTheme = themes[timeMode];

    // Images 
    // Beautiful Girl Portrait
    const GIRL_IMAGE = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80";
    // Robot Avatar
    const ROBOT_IMAGE = "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80";

    const isNightTime = timeMode === 'night' || timeMode === 'midnight';

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-50 ${currentTheme.bg} overflow-hidden font-sans flex flex-col`}
        >
            {/* Stars / Sun / Moon Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                {isNightTime && (
                    <>
                        <div className="absolute top-20 right-20 w-24 h-24 rounded-full bg-white/90 shadow-[0_0_60px_rgba(255,255,255,0.8)] filter blur-[2px]" />
                        {[...Array(30)].map((_, i) => (
                            <div 
                                key={i}
                                className="absolute bg-white rounded-full animate-pulse"
                                style={{
                                    top: `${Math.random() * 100}%`,
                                    left: `${Math.random() * 100}%`,
                                    width: `${Math.random() * 3 + 1}px`,
                                    height: `${Math.random() * 3 + 1}px`,
                                    animationDelay: `${Math.random() * 3}s`,
                                    animationDuration: `${Math.random() * 2 + 2}s`
                                }}
                            />
                        ))}
                    </>
                )}
                {(timeMode === 'morning' || timeMode === 'noon' || timeMode === 'afternoon') && (
                    <div className="absolute top-20 right-20 w-32 h-32 rounded-full bg-yellow-400/90 shadow-[0_0_80px_rgba(253,224,71,0.8)] filter blur-[4px]" />
                )}
                {(timeMode === 'evening') && (
                    <div className="absolute bottom-40 left-20 w-40 h-40 rounded-full bg-orange-500/90 shadow-[0_0_100px_rgba(249,115,22,0.8)] filter blur-[8px]" />
                )}
            </div>

            {/* Header */}
            <div className="relative z-20 flex justify-between items-start p-6">
                <button 
                    onClick={onClose}
                    className={`p-3 rounded-full backdrop-blur-md active:scale-90 transition-transform ${isNightTime ? 'bg-white/10 text-white' : 'bg-black/10 text-black'}`}
                >
                    <ArrowLeftIcon />
                </button>
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-start px-6 pt-10">
                <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-6"
                >
                    <h1 className={`text-2xl sm:text-3xl font-black ${currentTheme.textColor} tracking-tight drop-shadow-md`}>
                        {currentTheme.greeting}, {userName}
                    </h1>
                    <p className={`text-xs font-semibold mt-1 ${currentTheme.subText} opacity-90`}>
                        {currentTheme.message}
                    </p>
                    <p className={`text-[10px] sm:text-xs font-bold mt-1.5 uppercase tracking-[0.2em] ${currentTheme.subText}`}>
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Sifra
                    </p>
                </motion.div>

                {/* Avatar Toggle Area */}
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4, type: 'spring' }}
                    className="relative w-48 h-64 sm:w-56 sm:h-72 cursor-pointer group"
                    onClick={() => setIsRobot(!isRobot)}
                >
                    {/* Glowing Aura behind character */}
                    <div className={`absolute inset-0 rounded-[2.5rem] blur-2xl opacity-50 transition-colors duration-1000 ${isRobot ? 'bg-cyan-500' : 'bg-pink-500'}`} />
                    
                    <div className="absolute inset-0 rounded-[2rem] overflow-hidden border-2 border-white/20 shadow-2xl backdrop-blur-sm">
                        <AnimatePresence mode="wait">
                            {isRobot ? (
                                <motion.img 
                                    key="robot"
                                    initial={{ opacity: 0, scale: 1.1, rotateY: 90 }}
                                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, rotateY: -90 }}
                                    transition={{ duration: 0.6 }}
                                    src={ROBOT_IMAGE}
                                    alt="Sifra Robot"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <motion.img 
                                    key="girl"
                                    initial={{ opacity: 0, scale: 1.1, rotateY: 90 }}
                                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, rotateY: -90 }}
                                    transition={{ duration: 0.6 }}
                                    src={GIRL_IMAGE}
                                    alt="Sifra Girl"
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </AnimatePresence>
                    </div>

                    <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap shadow-xl transition-colors duration-500 ${isRobot ? 'bg-cyan-900/60' : 'bg-pink-600/60'}`}>
                        {isRobot ? 'Robot Matrix Active' : 'Sifra Persona Active'}
                    </div>
                </motion.div>

                {/* Info Cards (Calendar) */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="w-full max-w-sm mt-10 grid grid-cols-1 gap-4"
                >
                    {/* Calendar Card */}
                    <div className={`p-4 rounded-3xl backdrop-blur-xl border flex flex-col items-start gap-2 shadow-lg ${isNightTime ? 'bg-white/10 border-white/10 text-white' : 'bg-white/40 border-white/40 text-gray-900'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isNightTime ? 'bg-white/20' : 'bg-white/60'}`}>
                            <CalendarIcon className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Today</p>
                            <p className="text-sm font-black">{currentTime.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                        </div>
                    </div>
                </motion.div>
            </div>
            
            <style>{`
                @keyframes twinkle {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 1; transform: scale(1.2); }
                }
            `}</style>
        </motion.div>
    );
};

export default GreetingsView;
