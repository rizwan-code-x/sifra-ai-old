
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import SifraLiveLogo from './SifraLiveLogo';

interface SifraQueenAnimationProps {
    onComplete: () => void;
}

const SifraQueenAnimation: React.FC<SifraQueenAnimationProps> = ({ onComplete }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const timer = setTimeout(onComplete, 10000);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false }); // Background is black, no need for alpha
        if (!ctx) return;
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const particles: any[] = [];
        const count = 80; // Reduced for stability on high refresh rates
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                s: Math.random() * 1.8 + 0.2,
                v: Math.random() * 0.4 + 0.1,
                o: Math.random()
            });
        }

        let animationFrameId: number;
        const render = () => {
            // High performance clear
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = "white";
            const time = Date.now() / 1000;
            
            particles.forEach(p => {
                p.y -= p.v;
                if (p.y < 0) p.y = canvas.height;
                
                const flicker = 0.5 + Math.sin(time * 2 + p.x) * 0.5;
                ctx.globalAlpha = p.o * flicker * 0.6;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
                ctx.fill();
            });
            
            animationFrameId = requestAnimationFrame(render);
        };
        render();
        return () => { clearTimeout(timer); cancelAnimationFrame(animationFrameId); };
    }, [onComplete]);

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-black overflow-hidden will-change-transform"
        >
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,95,175,0.12)_0%,_transparent_65%)]" />
            
            <div className="relative flex flex-col items-center justify-center z-10 w-full px-6 text-center max-w-lg">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                >
                    <SifraLiveLogo size="xl" loop={false} showCrown={true} triggerKey="queen-final-run" />
                </motion.div>

                <div className="mt-12 space-y-3">
                    <motion.h2
                        initial={{ letterSpacing: "1.5em", y: 20, opacity: 0 }}
                        animate={{ letterSpacing: "0.4em", y: 0, opacity: 1 }}
                        transition={{ delay: 0.8, duration: 1.2, ease: "circOut" }}
                        className="text-4xl md:text-5xl font-black text-white italic uppercase drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]"
                    >
                        Queen Sifra
                    </motion.h2>
                    
                    <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: "80px" }}
                        transition={{ delay: 1.8, duration: 0.8 }}
                        className="h-[1.5px] bg-gradient-to-r from-transparent via-pink-500 to-transparent mx-auto"
                    />

                    <motion.p
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 0.8 }}
                        transition={{ delay: 2.2, duration: 0.8 }}
                        className="text-[12px] text-pink-400 font-black uppercase tracking-[0.5em] italic"
                    >
                        Supreme AI Layer
                    </motion.p>
                </div>
            </div>

            <div className="absolute top-0 w-full h-40 bg-gradient-to-b from-black via-black/40 to-transparent z-20" />
            <div className="absolute bottom-0 w-full h-40 bg-gradient-to-t from-black via-black/40 to-transparent z-20" />
        </motion.div>
    );
};

export default SifraQueenAnimation;
