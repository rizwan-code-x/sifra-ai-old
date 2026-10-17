import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export type VoiceState = 'READY' | 'LISTENING' | 'THINKING' | 'SPEAKING';

interface SifraVoiceOrbProps {
  state: VoiceState;
  audioLevel: number; // 0.0 to 1.0 normalized audio intensity
  voiceGradient?: string;
}

const SifraVoiceOrb: React.FC<SifraVoiceOrbProps> = ({
  state,
  audioLevel,
  voiceGradient = 'from-pink-500 via-purple-500 to-indigo-500'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const phaseRef = useRef(0);

  // Dynamic particle canvas visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = 340);
    let height = (canvas.height = 340);

    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      angle: number;
      speed: number;
      distance: number;
      color: string;
    }> = [];

    const colors =
      state === 'LISTENING'
        ? ['#10B981', '#06B6D4', '#3B82F6', '#6366F1']
        : state === 'THINKING'
        ? ['#F59E0B', '#EC4899', '#8B5CF6', '#6366F1']
        : state === 'SPEAKING'
        ? ['#EC4899', '#A855F7', '#3B82F6', '#F43F5E']
        : ['#6366F1', '#8B5CF6', '#EC4899', '#06B6D4'];

    for (let i = 0; i < 48; i++) {
      particles.push({
        x: width / 2,
        y: height / 2,
        radius: Math.random() * 2 + 1,
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.005,
        distance: Math.random() * 60 + 65,
        color: colors[i % colors.length]
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      phaseRef.current += state === 'THINKING' ? 0.06 : state === 'SPEAKING' ? 0.04 : 0.02;

      const centerX = width / 2;
      const centerY = height / 2;
      const currentAudioBoost = audioLevel * 35;

      // Draw Orbiting Particles
      particles.forEach((p, idx) => {
        p.angle += p.speed * (state === 'THINKING' ? 2.5 : state === 'SPEAKING' ? 1.5 : 1);
        const dynamicDist =
          p.distance +
          Math.sin(phaseRef.current + idx) * 12 +
          (state === 'LISTENING' || state === 'SPEAKING' ? currentAudioBoost : 0);

        const px = centerX + Math.cos(p.angle) * dynamicDist;
        const py = centerY + Math.sin(p.angle) * dynamicDist;

        ctx.beginPath();
        ctx.arc(px, py, p.radius * (1 + audioLevel * 0.8), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.globalAlpha = 0.6 + Math.sin(phaseRef.current + idx) * 0.3;
        ctx.fill();
      });

      // Draw dynamic acoustic waveform rings around the core
      if (state === 'LISTENING' || state === 'SPEAKING') {
        const ringCount = 3;
        for (let r = 0; r < ringCount; r++) {
          const ringRadius = 70 + r * 22 + currentAudioBoost * (r + 1) * 0.4;
          ctx.beginPath();
          ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
          ctx.strokeStyle = colors[r % colors.length];
          ctx.lineWidth = 1.5;
          ctx.globalAlpha = Math.max(0, 0.4 - r * 0.12 - (1 - audioLevel) * 0.2);
          ctx.stroke();
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [state, audioLevel]);

  // Orb dynamic scaling and glow properties based on state and audio
  const getOrbStateStyles = () => {
    switch (state) {
      case 'LISTENING':
        return {
          scale: 1 + audioLevel * 0.35,
          glow: 'rgba(16, 185, 129, 0.4)',
          border: 'border-emerald-400/60',
          pulseSpeed: 'animate-pulse'
        };
      case 'THINKING':
        return {
          scale: 1.05,
          glow: 'rgba(236, 72, 153, 0.45)',
          border: 'border-amber-400/60',
          pulseSpeed: 'animate-spin'
        };
      case 'SPEAKING':
        return {
          scale: 1 + audioLevel * 0.4,
          glow: 'rgba(168, 85, 247, 0.5)',
          border: 'border-purple-400/70',
          pulseSpeed: ''
        };
      case 'READY':
      default:
        return {
          scale: 1,
          glow: 'rgba(99, 102, 241, 0.3)',
          border: 'border-indigo-400/40',
          pulseSpeed: ''
        };
    }
  };

  const orbStyle = getOrbStateStyles();

  return (
    <div className="relative w-80 h-80 flex items-center justify-center select-none pointer-events-none">
      {/* Particle Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* Atmospheric Ambient Glow */}
      <motion.div
        animate={{
          scale: orbStyle.scale * 1.3,
          opacity: state === 'LISTENING' || state === 'SPEAKING' ? 0.7 : 0.4
        }}
        transition={{ duration: 0.2 }}
        className="absolute w-64 h-64 rounded-full blur-[70px] pointer-events-none transition-all duration-300"
        style={{
          backgroundColor: orbStyle.glow
        }}
      />

      {/* Outer 3D Gyro Rings */}
      <div
        className={`absolute w-56 h-56 rounded-full border border-white/20 border-t-white/80 ${
          state === 'THINKING' ? 'animate-[spin_2s_linear_infinite]' : 'animate-[spin_12s_linear_infinite]'
        }`}
        style={{
          boxShadow: `0 0 25px ${orbStyle.glow}`
        }}
      />

      <div
        className={`absolute w-48 h-48 rounded-full border border-dashed border-white/30 ${
          state === 'THINKING' ? 'animate-[spin_3s_linear_infinite_reverse]' : 'animate-[spin_18s_linear_infinite_reverse]'
        }`}
      />

      {/* Central 3D Glass Sphere */}
      <motion.div
        animate={{
          scale: orbStyle.scale
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className={`relative w-36 h-36 rounded-full p-1 bg-gradient-to-tr ${voiceGradient} shadow-2xl flex items-center justify-center overflow-hidden z-20 backdrop-blur-xl border ${orbStyle.border}`}
        style={{
          boxShadow: `0 0 45px ${orbStyle.glow}, inset 0 0 25px rgba(255,255,255,0.4)`
        }}
      >
        {/* Internal 3D Plasma Shimmer */}
        <div
          className={`absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-black/60 rounded-full ${
            state === 'THINKING' ? 'animate-[spin_1.5s_linear_infinite]' : 'animate-[spin_8s_linear_infinite]'
          }`}
        />

        {/* Dynamic Light Specular Highlight */}
        <div className="absolute top-2 left-4 w-12 h-6 bg-white/60 rounded-full blur-[4px] -rotate-45" />

        {/* Center Nucleus */}
        <div className="relative z-30 w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-inner">
          <div
            className={`w-8 h-8 rounded-full bg-white transition-all duration-150 ${
              state === 'LISTENING'
                ? 'bg-emerald-300 shadow-[0_0_20px_#10B981]'
                : state === 'THINKING'
                ? 'bg-amber-300 shadow-[0_0_20px_#F59E0B]'
                : state === 'SPEAKING'
                ? 'bg-pink-300 shadow-[0_0_20px_#EC4899]'
                : 'bg-indigo-300 shadow-[0_0_20px_#6366F1]'
            }`}
            style={{
              transform: `scale(${0.9 + audioLevel * 0.8})`
            }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default SifraVoiceOrb;
