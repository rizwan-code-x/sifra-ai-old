
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const CalendarRibbonAnimation: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    useEffect(() => {
        const timer = setTimeout(onComplete, 2500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] bg-[#020617] flex items-center justify-center overflow-hidden"
        >
            <svg width="100%" height="100%" className="absolute inset-0">
                <motion.path
                    d="M-100,200 Q400,100 800,400 T1500,200"
                    fill="none"
                    stroke="rgba(255, 95, 175, 0.4)"
                    strokeWidth="80"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: [0, 1, 0], x: [0, 200] }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                />
                <motion.path
                    d="M-100,500 Q300,600 700,300 T1500,500"
                    fill="none"
                    stroke="rgba(59, 183, 255, 0.3)"
                    strokeWidth="100"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: [0, 1, 0], x: [0, -100] }}
                    transition={{ duration: 2.2, ease: "easeInOut", delay: 0.2 }}
                />
            </svg>
            
            <div className="relative z-10 text-center">
                <motion.h2 
                    initial={{ scale: 0.8, opacity: 0, letterSpacing: "1em" }}
                    animate={{ scale: 1, opacity: 1, letterSpacing: "0.2em" }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="text-4xl font-black text-white italic uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]"
                >
                    Sifra Calendar
                </motion.h2>
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: 200 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="h-1 bg-gradient-to-r from-pink-500 via-white to-blue-500 mx-auto mt-4 rounded-full"
                />
            </div>

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.1)_0%,_transparent_70%)] animate-pulse" />
        </motion.div>
    );
};

export default CalendarRibbonAnimation;
