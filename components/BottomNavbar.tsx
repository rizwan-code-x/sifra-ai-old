
import React from 'react';
import { motion } from 'framer-motion';
import { View } from '../types';
import HomeIcon from './icons/HomeIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import ClockIcon from './icons/ClockIcon';
import AdjustmentsHorizontalIcon from './icons/AdjustmentsHorizontalIcon';

interface BottomNavbarProps {
    currentView: View;
    onNavigate: (view: View) => void;
}

const BottomNavbar: React.FC<BottomNavbarProps> = ({ currentView, onNavigate }) => {
    const navItems = [
        { id: View.HOME, label: 'HOME', icon: <HomeIcon /> },
        { id: View.SIFRA_DAILY_TASK, label: 'DAILY TASKS', icon: <CheckCircleIcon /> },
        { id: View.HISTORY, label: 'HISTORY', icon: <ClockIcon /> },
        { id: View.SETTINGS, label: 'SETTINGS', icon: <AdjustmentsHorizontalIcon /> },
    ];

    return (
        <nav className="fixed bottom-4 left-4 right-4 bg-black/40 backdrop-blur-xl border border-white/10 px-2 py-2 z-50 flex justify-around items-center rounded-3xl shadow-2xl safe-area-bottom">
            {navItems.map((item) => {
                const isActive = currentView === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`flex flex-col items-center gap-0.5 transition-all duration-300 ${
                            isActive ? 'text-white scale-105' : 'text-white/30 hover:text-white/50'
                        }`}
                    >
                        <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-white/10' : ''}`}>
                            {React.cloneElement(item.icon as React.ReactElement, { 
                                className: `w-5 h-5 ${isActive ? 'text-white' : 'text-white/30'}` 
                            })}
                        </div>
                        <span className="text-[8px] font-black tracking-widest uppercase">{item.label}</span>
                        {isActive && (
                            <motion.div
                                layoutId="nav-active-dot"
                                className="w-1 h-1 bg-white rounded-full mt-0.5"
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                        )}
                    </button>
                );
            })}
        </nav>
    );
};

export default BottomNavbar;
