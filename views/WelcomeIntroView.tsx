
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface WelcomeIntroViewProps {
    userName: string;
    onComplete: () => void;
}

const WelcomeIntroView: React.FC<WelcomeIntroViewProps> = ({ userName, onComplete }) => {
    
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 1800); // 1.8 seconds transition
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[100] bg-[#0D0D16] flex flex-col items-center justify-center overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1a1a2e] via-[#0D0D16] to-black opacity-80" />
            
            <div className="relative z-10 text-center w-full">
                {/* Greeting Text */}
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-4xl md:text-5xl font-bold text-white mb-6"
                >
                    Welcome Back, <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#48D4FF] to-[#FAD76D]">
                        {userName}
                    </span>
                </motion.h1>

                {/* Signature Ribbon Light Flow */}
                <div className="relative w-full h-2 overflow-hidden mt-4">
                     <div className="absolute inset-0 bg-white/5"></div>
                     <motion.div 
                        className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-[#48D4FF] to-transparent"
                        animate={{ left: ["-33%", "100%"] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        style={{ filter: "blur(4px)" }}
                     />
                     <motion.div 
                        className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-[#FAD76D] to-transparent"
                        animate={{ left: ["-25%", "100%"] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                        style={{ filter: "blur(2px)", opacity: 0.7 }}
                     />
                </div>
            </div>

            {/* Bottom Particles */}
            <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[#48D4FF]/10 to-transparent pointer-events-none" />
        </div>
    );
};

export default WelcomeIntroView;
