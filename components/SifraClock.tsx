
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClockStyleId } from '../types';
import SifraLiveLogo from './SifraLiveLogo';

interface SifraClockProps {
    styleId?: ClockStyleId;
    size?: 'sm' | 'md' | 'lg';
    onClick?: () => void;
    integrated?: boolean; // New prop to blend into parent
}

const SifraClock: React.FC<SifraClockProps> = ({ styleId = 'analog-basic', size = 'md', onClick, integrated = false }) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    const isNight = hours >= 18 || hours < 6;

    const hourDeg = (hours % 12) * 30 + minutes * 0.5;
    const minDeg = minutes * 6;
    const secDeg = seconds * 6;

    const sizeClass = size === 'sm' ? 'w-24 h-24' : size === 'md' ? 'w-32 h-32' : 'w-44 h-44';
    const containerBase = `relative overflow-hidden flex items-center justify-center select-none transition-all active:scale-95 cursor-pointer ${integrated ? 'bg-transparent shadow-none border-none' : 'rounded-[2.5rem] shadow-[0_15px_35px_rgba(0,0,0,0.15)] border border-white/20'}`;

    if (styleId === 'digital-premium') {
        return (
            <div onClick={onClick} className={`${containerBase} ${sizeClass} ${integrated ? '' : 'bg-[#1a0b2e]'}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15),transparent_80%)]" />
                {!integrated && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />}
                
                <div className="flex flex-col items-center justify-center relative z-10">
                    <div className="flex items-center gap-1.5">
                        <div className="relative">
                            <span className="text-5xl font-black text-white leading-none tracking-tighter drop-shadow-[0_0_12px_rgba(168,85,247,0.6)]">
                                {hours.toString().padStart(2, '0')}
                            </span>
                            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent mt-1 opacity-80" />
                        </div>
                        <span className="text-3xl font-black text-purple-400 animate-pulse">:</span>
                        <div className="relative">
                            <span className="text-5xl font-black text-white leading-none tracking-tighter drop-shadow-[0_0_12px_rgba(168,85,247,0.6)]">
                                {minutes.toString().padStart(2, '0')}
                            </span>
                            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent mt-1 opacity-80" />
                        </div>
                    </div>
                </div>
                <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_15px_#eab308]" />
            </div>
        );
    }

    if (styleId === 'sifra-logo') {
        return (
            <div onClick={onClick} className={`${containerBase} ${sizeClass} ${integrated ? '' : 'bg-white shadow-inner'}`}>
                {!integrated && <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50/50 via-white to-yellow-50/50" />}
                <div className="absolute top-0 right-0 w-8 h-8 bg-yellow-400/20 blur-xl rounded-full" />
                <SifraLiveLogo size={size === 'sm' ? 'xs' : 'md'} loop showCrown />
            </div>
        );
    }

    if (styleId === 'digital-space') {
        return (
            <div onClick={onClick} className={`${containerBase} ${sizeClass} ${integrated ? '' : 'bg-slate-950'}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.15),transparent_70%)]" />
                <div className="flex flex-col items-center justify-center relative z-10 gap-3">
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 tracking-tighter italic">
                            {(hours % 12 || 12).toString().padStart(2, '0')}
                        </span>
                        <span className="text-xl font-black text-white px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 uppercase tracking-widest text-[8px]">
                            {hours >= 12 ? 'PM' : 'AM'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
                        <span className="text-xl font-black text-white italic tracking-tighter">
                            {minutes.toString().padStart(2, '0')}
                        </span>
                        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                    </div>
                </div>
            </div>
        );
    }

    if (styleId === 'analog-multicolor') {
        const hourDegMulti = (hours % 12) * 30 + minutes * 0.5;
        const minDegMulti = minutes * 6;
        const secDegMulti = seconds * 6;

        return (
            <div onClick={onClick} className={`${containerBase} ${sizeClass} ${integrated ? '' : 'bg-[#020617]'}`}>
                {!integrated && (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-transparent to-yellow-900/20" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(168,85,247,0.2),transparent_60%)]" />
                    </>
                )}
                
                {/* HD Ticks with Gold - NO NUMBERS */}
                {[...Array(12)].map((_, i) => (
                    <div key={i} className="absolute w-full h-full" style={{ transform: `rotate(${i * 30}deg)` }}>
                        <div className={`w-3 h-[1.5px] absolute right-4 top-1/2 -translate-y-1/2 rounded-full ${i % 3 === 0 ? 'bg-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.8)]' : 'bg-white/20'}`} />
                    </div>
                ))}

                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                        animate={{ rotate: hourDegMulti }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="absolute w-1.5 h-[24%] bg-gradient-to-t from-purple-600 to-indigo-400 rounded-full origin-bottom bottom-1/2 shadow-xl border-r border-white/10"
                    />
                    <motion.div 
                        animate={{ rotate: minDegMulti }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="absolute w-1 h-[34%] bg-gradient-to-t from-slate-200 to-white rounded-full origin-bottom bottom-1/2 shadow-xl"
                    />
                    <motion.div 
                        animate={{ rotate: secDegMulti }}
                        transition={{ type: 'linear', duration: 1 }}
                        className="absolute w-[0.8px] h-[40%] bg-yellow-400 rounded-full origin-bottom bottom-1/2 z-10 shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                    />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 z-20 shadow-lg border-2 border-white/20" />
                </div>
            </div>
        );
    }

    // Default: ANALOG BASIC WITH FULL NUMBERS (1-12)
    return (
        <div onClick={onClick} className={`${containerBase} ${sizeClass} ${integrated ? '' : isNight ? 'bg-[#0F172A]' : 'bg-white'}`}>
            {/* Full Numbers 1-12 */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                <div 
                    key={num} 
                    className={`absolute font-black text-[9px] ${integrated ? 'text-white/40' : (isNight ? 'text-slate-400' : 'text-slate-900')}`}
                    style={{ 
                        transform: `rotate(${num * 30}deg) translateY(-${size === 'sm' ? '35' : (size === 'lg' ? '70' : '50')}px) rotate(-${num * 30}deg)`,
                    }}
                >
                    {num}
                </div>
            ))}

            <div className="flex flex-col items-center justify-center relative z-10 scale-75 opacity-20">
                <SifraLiveLogo size="xxs" loop={false} />
            </div>

            {/* Hands */}
            <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                    animate={{ rotate: hourDeg }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className={`absolute w-1 h-[25%] rounded-full origin-bottom bottom-1/2 ${integrated ? 'bg-white' : (isNight ? 'bg-white' : 'bg-slate-800')}`}
                />
                <motion.div 
                    animate={{ rotate: minDeg }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className={`absolute w-0.5 h-[35%] rounded-full origin-bottom bottom-1/2 ${integrated ? 'bg-white/60' : (isNight ? 'bg-slate-400' : 'bg-slate-600')}`}
                />
                <motion.div 
                    animate={{ rotate: secDeg }}
                    transition={{ type: 'linear', duration: 1 }}
                    className="absolute w-[0.5px] h-[40%] bg-rose-500 rounded-full origin-bottom bottom-1/2 z-10"
                />
                <div className={`w-1.5 h-1.5 rounded-full z-20 ${integrated ? 'bg-white' : (isNight ? 'bg-white' : 'bg-slate-900')}`} />
            </div>
        </div>
    );
};

export default SifraClock;
