
import React from 'react';

interface SifraLogoProps {
    className?: string;
    showText?: boolean;
    variant?: 'light' | 'dark';
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SifraLogo: React.FC<SifraLogoProps> = ({ className = "", showText = true, variant = 'light', size = 'md' }) => {
    const sizeClasses = {
        sm: "h-8",
        md: "h-12",
        lg: "h-24",
        xl: "h-40"
    };

    const textColor = variant === 'light' ? 'white' : '#1a1a1a';
    const subTextColor = variant === 'light' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.4)';

    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <svg 
                viewBox="0 0 200 200" 
                className={`${sizeClasses[size]} w-auto drop-shadow-2xl`}
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient id="s_gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FF5FAF" />
                        <stop offset="100%" stopColor="#FFD26E" />
                    </linearGradient>
                    <linearGradient id="ribbon_gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#D4AF37" />
                        <stop offset="50%" stopColor="#F9E27E" />
                        <stop offset="100%" stopColor="#B8860B" />
                    </linearGradient>
                </defs>

                {/* Golden Ribbon Swoosh */}
                <path 
                    d="M20 130C40 100 80 160 180 100C160 80 140 40 140 70C140 100 160 120 120 130" 
                    stroke="url(#ribbon_gradient)" 
                    strokeWidth="4" 
                    strokeLinecap="round"
                    className="opacity-80"
                />
                <path 
                    d="M30 140C60 120 100 130 160 110" 
                    stroke="url(#ribbon_gradient)" 
                    strokeWidth="6" 
                    strokeLinecap="round" 
                />

                {/* Stylized "S" */}
                <text 
                    x="100" 
                    y="135" 
                    textAnchor="middle" 
                    style={{ 
                        fontFamily: 'serif', 
                        fontSize: '140px', 
                        fontWeight: '900', 
                        fill: 'url(#s_gradient)',
                        fontStyle: 'italic'
                    }}
                >
                    S
                </text>

                {/* "AI" Tag */}
                <rect x="135" y="85" width="28" height="14" rx="2" fill="white" className="shadow-sm" />
                <text 
                    x="149" 
                    y="96" 
                    textAnchor="middle" 
                    style={{ 
                        fontFamily: 'sans-serif', 
                        fontSize: '9px', 
                        fontWeight: '900', 
                        fill: '#FF5FAF'
                    }}
                >
                    AI
                </text>
            </svg>

            {showText && (
                <div className="mt-2 text-center">
                    <h2 
                        className="text-2xl font-black tracking-[0.2em] italic uppercase"
                        style={{ 
                            background: 'linear-gradient(to right, #FF5FAF, #FFD26E)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        Sifra AI
                    </h2>
                    <p 
                        className="text-[7px] font-bold tracking-[0.5em] uppercase opacity-70 mt-1"
                        style={{ color: textColor }}
                    >
                        Your Personal Assistant
                    </p>
                </div>
            )}
        </div>
    );
};

export default SifraLogo;
