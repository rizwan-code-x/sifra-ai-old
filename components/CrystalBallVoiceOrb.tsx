import React from 'react';
import { motion } from 'framer-motion';

export type VoiceState = 'READY' | 'LISTENING' | 'THINKING' | 'SPEAKING';

interface CrystalBallVoiceOrbProps {
  state: VoiceState;
  audioLevel: number; // 0.0 to 1.0
  voiceId?: string;
  isMicActive?: boolean;
  onClick?: () => void;
}

export const CrystalBallVoiceOrb: React.FC<CrystalBallVoiceOrbProps> = ({
  state,
  audioLevel,
  onClick,
}) => {
  // Fluid responsiveness factor
  const fluidPower = Math.min(1.5, Math.max(0.1, audioLevel * 1.8));
  const isInteracting = state === 'LISTENING' || state === 'SPEAKING';

  return (
    <div 
      onClick={onClick}
      className="relative flex items-center justify-center select-none cursor-pointer group"
      title="ট্যাপ করে কথা বলুন বা থামান"
    >
      {/* 1. Deep Atmospheric Blue Radiance around the Glass */}
      <motion.div
        animate={{
          scale: isInteracting ? [1, 1.15 + fluidPower * 0.15, 1] : [1, 1.04, 1],
          opacity: state === 'LISTENING' ? [0.6, 0.9, 0.6] : state === 'SPEAKING' ? [0.7, 1.0, 0.7] : [0.4, 0.55, 0.4],
        }}
        transition={{
          duration: state === 'SPEAKING' ? 1.6 : state === 'LISTENING' ? 2.0 : 3.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full blur-[75px] pointer-events-none transition-all duration-700"
        style={{
          background: state === 'SPEAKING'
            ? 'radial-gradient(circle, rgba(14, 165, 233, 0.8) 0%, rgba(37, 99, 235, 0.4) 50%, transparent 70%)'
            : state === 'LISTENING'
            ? 'radial-gradient(circle, rgba(6, 182, 212, 0.85) 0%, rgba(2, 132, 199, 0.4) 50%, transparent 70%)'
            : state === 'THINKING'
            ? 'radial-gradient(circle, rgba(99, 102, 241, 0.8) 0%, rgba(147, 51, 234, 0.4) 50%, transparent 70%)'
            : 'radial-gradient(circle, rgba(2, 132, 199, 0.5) 0%, rgba(30, 58, 138, 0.3) 50%, transparent 70%)',
        }}
      />

      {/* 2. Glass Pedestal Glow Shadow */}
      <div className="absolute -bottom-10 w-44 h-8 bg-cyan-500/20 rounded-full blur-xl pointer-events-none" />

      {/* 3. The Crystal Ball - Sphere Shell */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full p-[2.5px] shadow-[0_0_60px_rgba(6,182,212,0.35),_inset_0_0_30px_rgba(6,182,212,0.2)] flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]">
        
        {/* Crystal Glass Specular Ring Edge */}
        <div className="absolute inset-0 rounded-full border-[1.5px] border-cyan-300/40 z-30 pointer-events-none shadow-[inset_0_0_20px_rgba(255,255,255,0.4)]" />
        
        {/* Ultra-clear Crystal Rim Vignette */}
        <div className="absolute inset-0 rounded-full pointer-events-none z-30 shadow-[inset_0_0_40px_rgba(2,6,23,0.9),_inset_0_0_15px_rgba(56,189,248,0.5)]" />

        {/* 4. Inside the Sphere: Organic Chemical Liquid Fluid */}
        <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center z-10 bg-[#020b1e]">
          
          {/* Deep Viscous Fluid Backdrop */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#03112c] via-[#052147] to-[#01091b] opacity-90" />

          {/* Chemical Vortex Layer 1 - Deep Blue Fluid Swirl */}
          <motion.div
            animate={{
              borderRadius: [
                '42% 58% 70% 30% / 45% 45% 55% 55%',
                '58% 42% 35% 65% / 55% 60% 40% 45%',
                '50% 50% 60% 40% / 40% 50% 50% 60%',
                '42% 58% 70% 30% / 45% 45% 55% 55%',
              ],
              rotate: [0, 180, 360],
              scale: isInteracting
                ? [0.95, 1.08 + fluidPower * 0.15, 0.95]
                : [0.94, 1.02, 0.94],
              x: isInteracting ? [-8, 8, -8] : [-3, 3, -3],
              y: isInteracting ? [6, -6, 6] : [2, -2, 2],
            }}
            transition={{
              borderRadius: { duration: state === 'SPEAKING' ? 3.5 : 5.5, repeat: Infinity, ease: 'easeInOut' },
              rotate: { duration: state === 'SPEAKING' ? 8 : 16, repeat: Infinity, ease: 'linear' },
              scale: { duration: state === 'SPEAKING' ? 1.4 : 2.8, repeat: Infinity, ease: 'easeInOut' },
              x: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' },
              y: { duration: 2.7, repeat: Infinity, ease: 'easeInOut' },
            }}
            className="absolute w-52 h-52 sm:w-60 sm:h-60 opacity-80 blur-[14px] mix-blend-screen"
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 40%, #1d4ed8 100%)',
            }}
          />

          {/* Chemical Vortex Layer 2 - Fast Sloshing Cyan Fluid Surges */}
          <motion.div
            animate={{
              borderRadius: [
                '60% 40% 45% 55% / 50% 35% 65% 50%',
                '35% 65% 60% 40% / 60% 55% 45% 40%',
                '55% 45% 35% 65% / 45% 65% 35% 55%',
                '60% 40% 45% 55% / 50% 35% 65% 50%',
              ],
              rotate: [360, 180, 0],
              scale: isInteracting
                ? [1, 1.15 + fluidPower * 0.2, 0.96]
                : [0.98, 1.04, 0.98],
              x: isInteracting ? [10, -10, 10] : [4, -4, 4],
              y: isInteracting ? [-8, 8, -8] : [-2, 2, -2],
            }}
            transition={{
              borderRadius: { duration: state === 'SPEAKING' ? 2.8 : 4.8, repeat: Infinity, ease: 'easeInOut' },
              rotate: { duration: state === 'SPEAKING' ? 7 : 13, repeat: Infinity, ease: 'linear' },
              scale: { duration: state === 'SPEAKING' ? 1.2 : 2.4, repeat: Infinity, ease: 'easeInOut' },
              x: { duration: 2.9, repeat: Infinity, ease: 'easeInOut' },
              y: { duration: 3.4, repeat: Infinity, ease: 'easeInOut' },
            }}
            className="absolute w-44 h-44 sm:w-52 sm:h-52 opacity-85 blur-[10px] mix-blend-screen"
            style={{
              background: 'linear-gradient(225deg, #38bdf8 0%, #06b6d4 50%, #2563eb 100%)',
            }}
          />

          {/* Chemical Layer 3 - Luminous Bioluminescent Core Fluid */}
          <motion.div
            animate={{
              scale: isInteracting
                ? [0.9, 1.25 + fluidPower * 0.25, 0.9]
                : [0.95, 1.08, 0.95],
              opacity: isInteracting ? [0.75, 1.0, 0.75] : [0.65, 0.85, 0.65],
            }}
            transition={{
              duration: state === 'SPEAKING' ? 1.1 : state === 'LISTENING' ? 1.5 : 2.6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full blur-[8px] z-10"
            style={{
              background: 'radial-gradient(circle, #ffffff 0%, #67e8f9 35%, #0284c7 70%, transparent 100%)',
              boxShadow: '0 0 35px rgba(56, 189, 248, 0.9)',
            }}
          />

          {/* Morphing Chemical Droplets / Bubbles drifting inside fluid */}
          {[
            { x: -32, y: -28, size: 14, delay: 0 },
            { x: 38, y: -22, size: 16, delay: 0.4 },
            { x: -25, y: 34, size: 15, delay: 0.9 },
            { x: 30, y: 32, size: 12, delay: 1.3 },
            { x: 0, y: -40, size: 10, delay: 0.7 },
          ].map((bubble, i) => (
            <motion.div
              key={i}
              animate={{
                x: [bubble.x, bubble.x + (i % 2 === 0 ? 18 : -18), bubble.x],
                y: [bubble.y, bubble.y + (i % 2 === 0 ? -16 : 16), bubble.y],
                scale: isInteracting ? [1, 1.35 + fluidPower * 0.2, 1] : [1, 1.1, 1],
                opacity: [0.45, 0.85, 0.45],
              }}
              transition={{
                duration: 2.8 + i * 0.6,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: bubble.delay,
              }}
              className="absolute rounded-full blur-[1.5px] pointer-events-none z-10"
              style={{
                width: bubble.size,
                height: bubble.size,
                background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #38bdf8 60%, #0284c7 100%)',
                boxShadow: '0 0 10px rgba(56, 189, 248, 0.7)',
              }}
            />
          ))}

          {/* Real-time Chemical Shockwave Ripple on Speech */}
          {isInteracting && (
            <motion.div
              initial={{ scale: 0.3, opacity: 0.9 }}
              animate={{
                scale: [0.3, 1.4],
                opacity: [0.8, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeOut',
              }}
              className="absolute w-40 h-40 rounded-full border border-cyan-300/70 pointer-events-none z-10"
            />
          )}

          {/* 5. Realistic Glass Specular Highlights on the Crystal Sphere */}
          {/* Main Top-Left Crescent Glass Highlight */}
          <div
            className="absolute -top-4 -left-4 w-44 h-32 rounded-full pointer-events-none z-20 opacity-80 transform -rotate-45"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.3) 35%, transparent 70%)',
            }}
          />

          {/* Sharp Pinpoint Sparkle on Glass Apex */}
          <div className="absolute top-7 left-9 w-5 h-2.5 rounded-full bg-white/95 blur-[0.8px] transform -rotate-30 pointer-events-none z-20 shadow-[0_0_8px_#ffffff]" />

          {/* Secondary Soft Rim Refraction (Bottom-Right) */}
          <div
            className="absolute -bottom-5 -right-5 w-40 h-28 rounded-full pointer-events-none z-20 opacity-40 transform -rotate-45"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.9) 0%, rgba(14, 165, 233, 0.3) 45%, transparent 75%)',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CrystalBallVoiceOrb;
