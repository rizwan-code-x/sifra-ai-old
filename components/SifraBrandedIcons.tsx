
import React from 'react';
import { motion } from 'framer-motion';

const SifraIconContainer: React.FC<{ children: React.ReactNode; color?: string; className?: string }> = ({ children, className }) => (
    <div className={`relative flex items-center justify-center ${className}`}>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            <defs>
                <linearGradient id="sifra-gold-icon" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FDE68A" />
                    <stop offset="50%" stopColor="#D4AF37" />
                    <stop offset="100%" stopColor="#92400E" />
                </linearGradient>
                <linearGradient id="sifra-pink-icon" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#D4AF37" />
                    <stop offset="100%" stopColor="#FDE68A" />
                </linearGradient>
            </defs>
        </svg>
        {children}
    </div>
);

export const SifraMainLogo = ({ className = "w-12 h-12", showText = false }) => (
    <div className={`flex items-center gap-3 ${className}`}>
        <SifraIconContainer className="w-full h-full">
            <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="48" fill="none" stroke="url(#sifra-gold-icon)" strokeWidth="1" opacity="0.2" />
                <motion.path 
                    d="M30 70 L50 20 L70 70 M40 55 L60 55" 
                    fill="none" stroke="url(#sifra-gold-icon)" strokeWidth="8" strokeLinecap="round" 
                />
                <motion.path 
                    d="M30 70 L50 20 L70 70 M40 55 L60 55" 
                    fill="none" stroke="url(#sifra-pink-icon)" strokeWidth="4" strokeLinecap="round" opacity="0.6"
                />
            </svg>
        </SifraIconContainer>
        {showText && (
            <div className="flex flex-col">
                <span className="text-xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-500 to-amber-700 uppercase">Sifra</span>
            </div>
        )}
    </div>
);

export const SifraLibraryLogo = ({ className = "w-6 h-6" }) => (
    <SifraIconContainer className={className}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M20 30 L50 15 L80 30 L80 70 L50 85 L20 70 Z" fill="none" stroke="url(#sifra-gold-icon)" strokeWidth="4" />
            <path d="M50 15 L50 85 M20 30 L50 45 L80 30" fill="none" stroke="url(#sifra-gold-icon)" strokeWidth="2" opacity="0.5" />
            <text x="50" y="65" textAnchor="middle" style={{ fontSize: '10px', fontWeight: '950', fill: 'url(#sifra-gold-icon)', fontFamily: 'sans-serif', letterSpacing: '0.1em' }}>LIBRARY</text>
            <text x="50" y="52" textAnchor="middle" style={{ fontSize: '18px', fontWeight: '950', fill: 'url(#sifra-pink-icon)', fontFamily: 'serif', fontStyle: 'italic' }}>S</text>
        </svg>
    </SifraIconContainer>
);

export const SifraBrowserLogo = ({ className = "w-6 h-6" }) => (
    <SifraIconContainer className={className}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.1" />
            <motion.path 
                d="M50 5 L50 95 M5 50 L95 50" 
                stroke="url(#sifra-gold-icon)" strokeWidth="1" opacity="0.3"
            />
            <motion.path 
                d="M50 15 A35 35 0 0 1 50 85 A35 35 0 0 1 50 15" 
                fill="none" stroke="url(#sifra-pink-icon)" strokeWidth="6" strokeLinecap="round"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
            <text x="50" y="58" textAnchor="middle" style={{ fontSize: '24px', fontWeight: '950', fill: 'url(#sifra-gold-icon)', fontFamily: 'serif', fontStyle: 'italic' }}>S</text>
        </svg>
    </SifraIconContainer>
);

export const SifraClockLogo = ({ className = "w-6 h-6" }) => (
    <SifraIconContainer className={className}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="40" stroke="url(#sifra-gold-icon)" strokeWidth="4" fill="none" />
            <motion.line 
                x1="50" y1="50" x2="50" y2="25" 
                stroke="url(#sifra-pink-icon)" strokeWidth="4" strokeLinecap="round"
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            />
            <motion.line 
                x1="50" y1="50" x2="70" y2="50" 
                stroke="url(#sifra-gold-icon)" strokeWidth="3" strokeLinecap="round"
                animate={{ rotate: 360 }}
                transition={{ duration: 3600, repeat: Infinity, ease: "linear" }}
            />
            <circle cx="50" cy="50" r="4" fill="#D4AF37" />
        </svg>
    </SifraIconContainer>
);

export const SifraCalendarLogo = ({ className = "w-6 h-6" }) => (
    <SifraIconContainer className={className}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
            <rect x="15" y="20" width="70" height="65" rx="8" stroke="url(#sifra-gold-icon)" strokeWidth="4" fill="none" />
            <line x1="15" y1="40" x2="85" y2="40" stroke="url(#sifra-gold-icon)" strokeWidth="4" />
            <rect x="30" y="10" width="4" height="20" rx="2" fill="url(#sifra-pink-icon)" />
            <rect x="66" y="10" width="4" height="20" rx="2" fill="url(#sifra-pink-icon)" />
            <text x="50" y="72" textAnchor="middle" style={{ fontSize: '20px', fontWeight: '950', fill: 'url(#sifra-pink-icon)', fontFamily: 'sans-serif' }}>{new Date().getDate()}</text>
        </svg>
    </SifraIconContainer>
);

export const SifraCalculatorLogo = ({ className = "w-6 h-6" }) => (
    <SifraIconContainer className={className}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M20 20 L80 20 L80 80 L20 80 Z" stroke="url(#sifra-gold-icon)" strokeWidth="4" fill="none" rx="8" />
            <rect x="35" y="35" width="10" height="2" fill="url(#sifra-pink-icon)" />
            <path d="M55 35 L65 35 M60 30 L60 40" stroke="url(#sifra-pink-icon)" strokeWidth="2" />
            <rect x="35" y="55" width="10" height="10" fill="url(#sifra-gold-icon)" opacity="0.5" />
            <path d="M55 58 L65 58 M55 62 L65 62" stroke="url(#sifra-pink-icon)" strokeWidth="2" />
        </svg>
    </SifraIconContainer>
);

export const SifraCardLogo = ({ className = "w-6 h-6" }) => (
    <SifraIconContainer className={className}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
            <rect x="10" y="25" width="80" height="50" rx="6" stroke="url(#sifra-gold-icon)" strokeWidth="4" fill="none" />
            <rect x="10" y="35" width="80" height="12" fill="url(#sifra-gold-icon)" opacity="0.3" />
            <rect x="20" y="55" width="15" height="10" rx="2" fill="url(#sifra-pink-icon)" />
            <text x="80" y="65" textAnchor="end" style={{ fontSize: '10px', fontWeight: '950', fill: 'url(#sifra-gold-icon)', fontFamily: 'serif', fontStyle: 'italic' }}>SIFRA</text>
        </svg>
    </SifraIconContainer>
);

export const SifraDatabaseLogo = ({ className = "w-6 h-6" }) => (
    <SifraIconContainer className={className}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
            <rect x="20" y="20" width="60" height="20" rx="4" stroke="url(#sifra-gold-icon)" strokeWidth="3" fill="none" />
            <rect x="20" y="45" width="60" height="20" rx="4" stroke="url(#sifra-gold-icon)" strokeWidth="3" fill="none" />
            <rect x="20" y="70" width="60" height="20" rx="4" stroke="url(#sifra-gold-icon)" strokeWidth="3" fill="none" />
            <circle cx="30" cy="30" r="2" fill="url(#sifra-pink-icon)" />
            <circle cx="30" cy="55" r="2" fill="url(#sifra-pink-icon)" />
            <circle cx="30" cy="80" r="2" fill="url(#sifra-pink-icon)" />
        </svg>
    </SifraIconContainer>
);

export const SifraPlanLogo = ({ className = "w-6 h-6" }) => (
    <SifraIconContainer className={className}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
            <motion.path 
                d="M50 10 L60 40 L90 40 L65 60 L75 90 L50 70 L25 90 L35 60 L10 40 L40 40 Z" 
                stroke="url(#sifra-gold-icon)" strokeWidth="4" fill="none"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
            />
            <circle cx="50" cy="50" r="10" fill="url(#sifra-pink-icon)" />
        </svg>
    </SifraIconContainer>
);

export const SifraWeatherLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
    <SifraIconContainer className={className}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Sun rays & disc */}
            <circle cx="45" cy="40" r="16" stroke="url(#sifra-gold-icon)" strokeWidth="3.5" fill="none" opacity="0.9" />
            <motion.g
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                style={{ transformOrigin: "45px 40px" }}
            >
                <line x1="45" y1="16" x2="45" y2="22" stroke="url(#sifra-pink-icon)" strokeWidth="3" strokeLinecap="round" />
                <line x1="45" y1="58" x2="45" y2="64" stroke="url(#sifra-pink-icon)" strokeWidth="3" strokeLinecap="round" />
                <line x1="21" y1="40" x2="27" y2="40" stroke="url(#sifra-pink-icon)" strokeWidth="3" strokeLinecap="round" />
                <line x1="63" y1="40" x2="69" y2="40" stroke="url(#sifra-pink-icon)" strokeWidth="3" strokeLinecap="round" />
                <line x1="28" y1="23" x2="32" y2="27" stroke="url(#sifra-gold-icon)" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="58" y1="53" x2="62" y2="57" stroke="url(#sifra-gold-icon)" strokeWidth="2.5" strokeLinecap="round" />
            </motion.g>
            {/* Stylized Cloud */}
            <path 
                d="M32 72 L68 72 C76 72 82 66 82 58 C82 51 76 46 70 46 C69 36 60 29 49 29 C40 29 33 34 30 42 C23 43 18 49 18 56 C18 65 24 72 32 72 Z" 
                fill="none" 
                stroke="url(#sifra-gold-icon)" 
                strokeWidth="4" 
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path 
                d="M40 78 L38 84 M52 78 L50 84 M64 78 L62 84" 
                stroke="url(#sifra-pink-icon)" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
            />
        </svg>
    </SifraIconContainer>
);

export const SifraMapsLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
    <SifraIconContainer className={className}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Folded Map Shape */}
            <path 
                d="M18 28 L38 18 L62 28 L82 18 L82 72 L62 82 L38 72 L18 82 Z" 
                stroke="url(#sifra-gold-icon)" 
                strokeWidth="3.5" 
                fill="none" 
                strokeLinejoin="round" 
            />
            {/* Folds */}
            <line x1="38" y1="18" x2="38" y2="72" stroke="url(#sifra-gold-icon)" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />
            <line x1="62" y1="28" x2="62" y2="82" stroke="url(#sifra-gold-icon)" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />
            {/* Location Pin */}
            <g transform="translate(42, 32)">
                <path 
                    d="M8 0 C3.6 0 0 3.6 0 8 C0 14 8 22 8 22 C8 22 16 14 16 8 C16 3.6 12.4 0 8 0 Z" 
                    fill="url(#sifra-pink-icon)" 
                    stroke="url(#sifra-gold-icon)" 
                    strokeWidth="1.5" 
                />
                <circle cx="8" cy="8" r="3" fill="#0b0f19" />
            </g>
        </svg>
    </SifraIconContainer>
);

export const SifraLawLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
    <SifraIconContainer className={className}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Central Pillar & Base */}
            <line x1="50" y1="20" x2="50" y2="80" stroke="url(#sifra-gold-icon)" strokeWidth="4" strokeLinecap="round" />
            <line x1="30" y1="80" x2="70" y2="80" stroke="url(#sifra-gold-icon)" strokeWidth="4" strokeLinecap="round" />
            {/* Crossbeam */}
            <line x1="22" y1="30" x2="78" y2="30" stroke="url(#sifra-gold-icon)" strokeWidth="4" strokeLinecap="round" />
            <circle cx="50" cy="20" r="4" fill="url(#sifra-pink-icon)" />
            {/* Left Pan */}
            <line x1="24" y1="30" x2="16" y2="52" stroke="url(#sifra-gold-icon)" strokeWidth="2" opacity="0.8" />
            <line x1="24" y1="30" x2="32" y2="52" stroke="url(#sifra-gold-icon)" strokeWidth="2" opacity="0.8" />
            <path d="M12 52 C12 60 36 60 36 52 Z" fill="none" stroke="url(#sifra-pink-icon)" strokeWidth="3" />
            {/* Right Pan */}
            <line x1="76" y1="30" x2="68" y2="52" stroke="url(#sifra-gold-icon)" strokeWidth="2" opacity="0.8" />
            <line x1="76" y1="30" x2="84" y2="52" stroke="url(#sifra-gold-icon)" strokeWidth="2" opacity="0.8" />
            <path d="M64 52 C64 60 88 60 88 52 Z" fill="none" stroke="url(#sifra-pink-icon)" strokeWidth="3" />
        </svg>
    </SifraIconContainer>
);
