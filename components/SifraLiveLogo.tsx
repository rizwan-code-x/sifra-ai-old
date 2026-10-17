
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface SifraLiveLogoProps {
    size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'header';
    loop?: boolean;
    triggerKey?: any;
    showCrown?: boolean;
}

const SifraLiveLogo: React.FC<SifraLiveLogoProps> = ({ size = 'lg', loop = false, triggerKey, showCrown = false }) => {
    const sizeMap = {
        xxs: "h-6 w-6",
        xs: "h-12 w-12",
        sm: "h-24 w-24",
        md: "h-32 w-32",
        lg: "h-56 w-56",
        xl: "h-80 w-80",
        header: "h-9 w-9"
    };

    const [isAnimating, setIsAnimating] = useState(true);

    useEffect(() => {
        if (!loop) {
            setIsAnimating(true);
            const timer = setTimeout(() => setIsAnimating(false), 6000);
            return () => clearTimeout(timer);
        }
    }, [triggerKey, loop]);

    const ropesDrawTime = 1.2;
    const aiTagTime = 2.5;

    const uniqueId = React.useId().replace(/:/g, '');
    const gradId = `s_grad_${uniqueId}`;
    const goldId = `gold_grad_${uniqueId}`;

    return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} will-change-transform overflow-visible`}>
            <svg viewBox="0 0 200 200" className="relative z-10 w-full h-full drop-shadow-[0_0_40px_rgba(255,95,175,0.5)] will-change-transform overflow-visible">
                <defs>
                    <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FF5FAF" />
                        <stop offset="100%" stopColor="#FFD26E" />
                    </linearGradient>
                    <linearGradient id={goldId} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#D4AF37" />
                        <stop offset="50%" stopColor="#F9E27E" />
                        <stop offset="100%" stopColor="#B8860B" />
                    </linearGradient>
                </defs>

                {/* Light Speed Crown Assembly */}
                {showCrown && (
                    <motion.g
                        initial={{ y: -60, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 3.5, duration: 1, type: "spring", damping: 15 }}
                    >
                        <motion.path 
                            d="M60,60 L75,30 L100,50 L125,30 L140,60" 
                            fill="none" stroke="#fff" strokeWidth="2" opacity="0.5"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ delay: 4, duration: 0.8 }}
                        />
                        <motion.path 
                            d="M60,60 L140,60" 
                            stroke={`url(#${goldId})`} strokeWidth="4" strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ delay: 3.8, duration: 0.8 }}
                        />

                        {[60, 75, 100, 125, 140].map((x, i) => {
                            const y = i === 1 || i === 3 ? 30 : 50;
                            return (
                                <motion.circle 
                                    key={`star-${i}`}
                                    cx={x} cy={y} r="3" fill="#fff"
                                    animate={{ scale: [1, 2, 1], opacity: [0.6, 1, 0.6] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                                    className="drop-shadow-[0_0_10px_#fff]"
                                />
                            );
                        })}
                    </motion.g>
                )}

                {/* Animated Golden Ribbons */}
                <motion.path 
                    d="M20 130C40 100 80 160 180 100C160 80 140 40 140 70C140 100 160 120 120 130" 
                    stroke={`url(#${goldId})`} strokeWidth="4" fill="none" strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ delay: 0.8, duration: ropesDrawTime }}
                />
                <motion.path 
                    d="M30 140C60 120 100 130 160 110" 
                    stroke={`url(#${goldId})`} strokeWidth="6" fill="none" strokeLinecap="round" 
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ delay: 1.1, duration: ropesDrawTime }}
                />

                {/* The Core S */}
                <motion.text 
                    x="100" y="135" textAnchor="middle" 
                    style={{ 
                        fontFamily: 'serif', fontSize: '140px', fontWeight: '950', 
                        fill: `url(#${gradId})`, fontStyle: 'italic'
                    }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                >
                    S
                </motion.text>

                {/* Premium AI Tag */}
                <motion.g
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: aiTagTime, duration: 0.6 }}
                >
                    <rect x="135" y="85" width="28" height="14" rx="3" fill="#fff" />
                    <text 
                        x="149" y="95" textAnchor="middle" 
                        style={{ fontFamily: 'sans-serif', fontSize: '9px', fontWeight: '950', fill: '#FF5FAF' }}
                    >
                        AI
                    </text>
                </motion.g>
            </svg>
        </div>
    );
};

export default SifraLiveLogo;
