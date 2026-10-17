
import React from 'react';
import { motion } from 'framer-motion';
import XMarkIcon from './icons/XMarkIcon';
import SparklesIcon from './icons/SparklesIcon';
import BoltIcon from './icons/BoltIcon';
import UserIcon from './icons/UserIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import HeartSparkleIcon from './icons/HeartSparkleIcon';
import CrownIcon from './icons/CrownIcon';
import DiamondIcon from './icons/DiamondIcon';
import AtomIcon from './icons/AtomIcon';

interface VersionSelectorProps {
    onClose: () => void;
    onSelectQuantum: () => void;
    onSelectPro: () => void;
    onSelectFree: () => void;
    onSelectPremiumPlus: () => void;
}

const VersionCard: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    onClick: () => void;
    isActive?: boolean;
    isPremiumPlus?: boolean;
    isPro?: boolean;
}> = ({ title, description, icon, color, onClick, isActive, isPremiumPlus, isPro }) => (
    <button 
        onClick={onClick}
        className={`w-full p-5 rounded-2xl flex items-center gap-5 transition-all duration-500 group border text-left overflow-hidden relative shadow-sm ${isActive ? 'bg-white shadow-xl border-transparent scale-[1.02]' : 'bg-white/50 hover:bg-white border-white/30 hover:shadow-lg hover:scale-[1.01]'} ${isPremiumPlus ? 'ring-2 ring-pink-500/50' : ''}`}
    >
        {/* Animated background glow for premium cards */}
        {(isPremiumPlus || isPro) && (
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 ${color}`} />
        )}
        
        {/* Icon Container */}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl ${color} group-hover:rotate-6 transition-all duration-500 relative z-10 overflow-hidden`}>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
            <div className="scale-110 group-hover:scale-125 transition-transform duration-500">
                {icon}
            </div>
        </div>

        {/* Text Content */}
        <div className="flex-1 relative z-10">
            <h3 className={`font-black text-lg tracking-tight ${isPremiumPlus ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600' : (isPro ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600' : 'text-gray-900')}`}>{title}</h3>
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed mt-0.5 opacity-80">{description}</p>
        </div>

        {/* Status Indicators */}
        {isActive ? (
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse relative z-10 ring-4 ring-green-100" />
        ) : (
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                <CheckCircleIcon className={`w-6 h-6 ${isPremiumPlus ? 'text-pink-500' : 'text-gray-300'}`} />
            </div>
        )}
    </button>
);

const VersionSelector: React.FC<VersionSelectorProps> = ({ onClose, onSelectQuantum, onSelectPro, onSelectFree, onSelectPremiumPlus }) => {
    return (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 font-sans">
            <motion.div 
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] p-8 border border-white/50 max-h-[90vh] overflow-y-auto relative"
            >
                {/* Header Decoration */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-gray-100 rounded-full mt-3" />

                <div className="flex justify-between items-start mb-10">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Sifra Ecosystem</h2>
                        <p className="text-sm text-gray-500 font-medium mt-1">Select your intelligence layer</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-3 bg-gray-100 text-gray-500 rounded-2xl hover:bg-gray-200 transition-all active:scale-90"
                    >
                        <XMarkIcon />
                    </button>
                </div>

                <div className="space-y-5">
                    {/* Option 4: Sifra Premium Plus */}
                    <VersionCard 
                        title="Sifra Premium Plus"
                        description="The ultimate soulmate experience. Deeply personal interaction."
                        icon={<HeartSparkleIcon className="w-8 h-8" />}
                        color="bg-gradient-to-br from-[#FF2D55] via-[#FF375F] to-[#FF4F7B]"
                        onClick={() => { onSelectPremiumPlus(); onClose(); }}
                        isPremiumPlus={true}
                    />

                    {/* Option 3: SIFRA PRO */}
                    <VersionCard 
                        title="SIFRA PRO 3.0"
                        description="Personal Pro-Assessment Mode. Performance & Precision."
                        icon={<CrownIcon className="w-8 h-8" />}
                        color="bg-gradient-to-br from-[#FF9500] via-[#FFAC33] to-[#FFCC00]"
                        onClick={() => { onSelectPro(); onClose(); }}
                        isPro={true}
                    />

                    {/* Option 2: Quantum Leap */}
                    <VersionCard 
                        title="Quantum Leap"
                        description="Multi-threaded consciousness. Advanced Persona Lab."
                        icon={<AtomIcon className="w-8 h-8" />}
                        color="bg-gradient-to-br from-[#5856D6] via-[#AF52DE] to-[#CC73E1]"
                        onClick={() => { onSelectQuantum(); onClose(); }}
                    />

                    {/* Option 1: SIFRA T-XON */}
                    <VersionCard 
                        title="SIFRA T-XON"
                        description="Standard intelligent companion. Efficient & Reliable."
                        icon={<SparklesIcon className="w-8 h-8" />}
                        color="bg-gradient-to-br from-[#007AFF] via-[#34AADC] to-[#4CD964]"
                        onClick={() => { onSelectFree(); onClose(); }}
                    />
                </div>

                <div className="mt-10 text-center">
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        Hybrid Engine v3.14.0
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default VersionSelector;
