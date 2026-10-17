
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuantumAnimationViewProps {
    onComplete: () => void;
}

const QuantumAnimationView: React.FC<QuantumAnimationViewProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0); // 0: beam, 1: ring, 2: emblem, 3: tap-wait, 4: ripple
    
    useEffect(() => {
        // Step 1: Beam Entry (0.7s)
        const t1 = setTimeout(() => setStep(1), 700);
        // Step 2: Ring Orbit (0.8s) -> Total 1.5s
        const t2 = setTimeout(() => setStep(2), 1500);
        // Step 3: Emblem Reveal (0.3s) -> Total 1.8s
        const t3 = setTimeout(() => setStep(3), 1800);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, []);

    const handleTap = () => {
        if (step === 3) {
            setStep(4);
            // Flash effect duration 0.4s + Name reveal 0.3s -> Wait approx 0.8s before complete
            setTimeout(() => {
                onComplete();
            }, 800);
        }
    };

    return (
        <div 
            className="fixed inset-0 z-[100] bg-[#0D0D16] flex flex-col items-center justify-center overflow-hidden cursor-pointer"
            onClick={handleTap}
        >
            {/* Step 1: Top Light Beam */}
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: step >= 1 ? '50%' : '50%', opacity: step === 0 ? [0, 1] : 0 }} // Fade out after step 0
                transition={{ duration: 0.7, ease: "linear" }}
                className="absolute top-0 w-2 bg-gradient-to-b from-transparent via-[#48D4FF] to-[#FAD76D] shadow-[0_0_20px_#48D4FF]"
            />

            {/* Container for Central Elements */}
            <div className="relative flex items-center justify-center">
                
                {/* Step 2: Circular Light Orbit */}
                {step >= 1 && step < 4 && (
                    <motion.svg 
                        width="200" height="200" viewBox="0 0 100 100"
                        className="absolute"
                        initial={{ rotate: 0, opacity: 0 }}
                        animate={{ rotate: 360, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "linear", repeat: Infinity }}
                    >
                        <circle cx="50" cy="50" r="45" stroke="#48D4FF" strokeWidth="1" fill="none" strokeDasharray="50 150" strokeLinecap="round" />
                        <circle cx="50" cy="50" r="45" stroke="#FAD76D" strokeWidth="2" fill="none" strokeDasharray="20 200" strokeDashoffset="-50" strokeLinecap="round" />
                    </motion.svg>
                )}

                {/* Step 3: Quantum Leaf Emblem */}
                <AnimatePresence>
                    {step >= 2 && step < 4 && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: [1, 1.15, 1], opacity: 1 }}
                            transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                            className="relative z-10 w-24 h-24 flex items-center justify-center"
                        >
                             {/* Stylized Leaf Icon */}
                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 21C12 21 3 14.5 3 8.5C3 5.46243 5.46243 3 8.5 3C10.5 3 12 4.5 12 4.5C12 4.5 13.5 3 15.5 3C18.5376 3 21 5.46243 21 8.5C21 14.5 12 21 12 21Z" stroke="#48D4FF" strokeWidth="1.5" className="drop-shadow-[0_0_10px_#48D4FF]" />
                                <path d="M12 5V21" stroke="#FAD76D" strokeWidth="1.5" strokeLinecap="round" className="drop-shadow-[0_0_5px_#FAD76D]" />
                                <path d="M12 12L7 9" stroke="#48D4FF" strokeWidth="1.5" strokeLinecap="round" />
                                <path d="M12 12L17 9" stroke="#48D4FF" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Ripple Effect (Step 4) */}
                {step === 4 && (
                    <motion.div
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ scale: 20, opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="absolute w-20 h-20 rounded-full bg-white z-20"
                    />
                )}
            </div>

            {/* Tap To Begin Text */}
            <AnimatePresence>
                {step === 3 && (
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute bottom-20 text-[#48D4FF] text-sm tracking-[0.3em] font-bold uppercase animate-pulse"
                    >
                        Tap to Begin
                    </motion.p>
                )}
            </AnimatePresence>

            {/* SIFRA Reveal (Step 4) */}
            <AnimatePresence>
                {step === 4 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.3 }}
                        className="absolute z-30"
                    >
                        <h1 className="text-5xl font-black text-white tracking-[0.4em]">SIFRA</h1>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default QuantumAnimationView;
