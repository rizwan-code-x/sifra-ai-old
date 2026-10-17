
import React, { useEffect, useState } from 'react';
import SifraLogo from '../components/SifraLogo';

interface SplashViewProps {
  onComplete: () => void;
}

const SplashView: React.FC<SplashViewProps> = ({ onComplete }) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const contentTimer = setTimeout(() => setShowContent(true), 500);
    const completeTimer = setTimeout(onComplete, 4500);

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="w-screen h-screen bg-[#0D0D16] flex items-center justify-center overflow-hidden">
        <div className={`transition-all duration-1000 transform ${showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <SifraLogo size="xl" showText={true} />
            
            {/* Animated Loading Bar */}
            <div className="mt-12 w-48 h-1 bg-white/5 rounded-full overflow-hidden mx-auto">
                <div className="h-full bg-gradient-to-r from-[#FF5FAF] to-[#FFD26E] animate-loading-bar" />
            </div>
        </div>

        {/* Ambient background pulse */}
        <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(circle_at_center,_#FF5FAF_0%,_transparent_70%)] animate-pulse" />

        <style>{`
            @keyframes loading-bar {
                0% { width: 0%; transform: translateX(-100%); }
                50% { width: 50%; transform: translateX(50%); }
                100% { width: 100%; transform: translateX(200%); }
            }
            .animate-loading-bar {
                animation: loading-bar 2s infinite linear;
            }
        `}</style>
    </div>
  );
};

export default SplashView;
