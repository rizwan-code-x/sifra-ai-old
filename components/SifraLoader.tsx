
import React from 'react';
import { motion } from 'framer-motion';

const SifraLoader: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
    const dimensions = {
        sm: 'w-8 h-8',
        md: 'w-16 h-16',
        lg: 'w-32 h-32'
    };

    const colors = [
        '#FFD700', // Golden
        '#A855F7', // Purple
        '#FACC15', // Yellow
        '#22C55E', // Green
        '#3B82F6'  // Blue
    ];

    return (
        <div className={`relative ${dimensions[size]} flex items-center justify-center`}>
            {colors.map((color, index) => (
                <motion.div
                    key={index}
                    className="absolute inset-0 rounded-full border-2"
                    style={{ borderColor: color, opacity: 0.6 }}
                    animate={{
                        rotate: 360,
                        scale: [1, 1.2, 0.8, 1],
                        borderRadius: ["50%", "40%", "50%"],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: index * 0.2,
                        ease: "easeInOut"
                    }}
                />
            ))}
            <motion.div 
                className="absolute w-2 h-2 rounded-full bg-white shadow-[0_0_15px_#fff]"
                animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
        </div>
    );
};

export const NeuralShimmer: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <div className={`relative overflow-hidden bg-white/5 border border-white/10 rounded-2xl ${className}`}>
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{
                    x: ['-100%', '100%']
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />
            <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 bg-white/10 rounded-full" />
                <div className="h-4 w-1/2 bg-white/10 rounded-full" />
            </div>
        </div>
    );
};

export default SifraLoader;
