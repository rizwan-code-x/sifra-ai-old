
import React, { memo } from 'react';
import { View, UserProfile, THEMES, AdminSettings } from '../types';
import { motion } from 'framer-motion';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import MapIcon from '../components/icons/MapIcon';
import MusicalNoteIcon from '../components/icons/MusicalNoteIcon';
import PhoneArrowUpRightIcon from '../components/icons/PhoneArrowUpRightIcon';
import CalculatorIcon from '../components/icons/CalculatorIcon';
import ClockIcon from '../components/icons/ClockIcon';
import GlobeAltIcon from '../components/icons/GlobeAltIcon';
import MicrophoneIcon from '../components/icons/MicrophoneIcon';
import AcademicCapIcon from '../components/icons/AcademicCapIcon';
import BookmarkSquareIcon from '../components/icons/BookmarkSquareIcon';
import BookOpenIcon from '../components/icons/BookOpenIcon';
import CalendarIcon from '../components/icons/CalendarIcon';
import SparklesIcon from '../components/icons/SparklesIcon';

import { 
    SifraBrowserLogo, 
    SifraClockLogo, 
    SifraCalendarLogo, 
    SifraCalculatorLogo,
    SifraLibraryLogo,
    SifraDatabaseLogo
} from '../components/SifraBrandedIcons';

interface LibraryViewProps {
    userProfile: UserProfile;
    onNavigate: (view: View) => void;
    onClose: () => void;
    adminSettings: AdminSettings;
}

const SNAPPY_SPRING = { type: "spring", stiffness: 600, damping: 35, mass: 0.8 };

const AppCard = memo(({ app, index, onClick }: { app: any, index: number, onClick: () => void }) => (
    <motion.button
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: index * 0.04, ...SNAPPY_SPRING }}
        whileTap={{ scale: 0.94 }}
        onClick={onClick}
        className="relative group overflow-hidden rounded-[2rem] p-4 flex flex-col items-center gap-3 text-center transition-all bg-transparent border-none active:scale-95"
    >
        <div className="relative">
            <div className="absolute inset-0 bg-amber-500/10 blur-xl opacity-0 group-hover:opacity-40 transition-opacity" />
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center relative overflow-hidden transition-all shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-200/5 to-amber-500/10 opacity-30 group-hover:opacity-50" />
                <div className="relative z-10 transition-all duration-500 group-hover:scale-110 drop-shadow-[0_2px_4px_rgba(212,175,55,0.4)]">
                    {app.brandedIcon ? app.brandedIcon : React.cloneElement(app.icon as React.ReactElement, { 
                        className: "w-8 h-8 text-amber-500/80"
                    })}
                </div>
            </div>
        </div>

        <div className="relative z-10 w-full">
            <h3 className="text-[10px] font-black tracking-tight uppercase truncate text-gray-900 drop-shadow-sm">{app.label}</h3>
            <p className="text-[6px] font-black uppercase tracking-[0.2em] mt-0.5 text-amber-600/60">{app.category}</p>
        </div>
    </motion.button>
));

const LibraryView: React.FC<LibraryViewProps> = ({ userProfile, onNavigate, onClose, adminSettings }) => {
    const isDark = userProfile.themeId === 'dark-matrix';
    const isEnabled = (id: string) => adminSettings?.featureFlags?.[id] !== false;

    const apps = [
        { id: 'projects', label: 'Projects', category: 'Deliverables', brandedIcon: <SifraLibraryLogo className="w-8 h-8" />, view: View.PROJECTS },
        { id: 'travel', label: 'Travel Guide', category: 'Explorer', icon: <MapIcon />, view: View.TRAVEL_GUIDE },
        { id: 'calls', label: 'Call Sifra', category: 'Nerve Link', icon: <PhoneArrowUpRightIcon />, view: View.CALLS_SIFRA },
        { id: 'music', label: 'Music', category: 'Audio Hub', icon: <MusicalNoteIcon />, view: View.SIFRA_MUSIC },
        { id: 'calc', label: 'Calc', category: 'Logic', brandedIcon: <SifraCalculatorLogo className="w-8 h-8" />, view: View.SIFRA_CALCULATOR },
        { id: 'clock', label: 'Clock', category: 'Temporal', brandedIcon: <SifraClockLogo className="w-8 h-8" />, view: View.SIFRA_CLOCK },
        { id: 'browser', label: 'Web', category: 'Sphere', brandedIcon: <SifraBrowserLogo className="w-8 h-8" />, view: View.SIFRA_BROWSER },
        { id: 'recorder', label: 'Recorder', category: 'Capture', icon: <MicrophoneIcon />, view: View.SIFRA_RECORDER },
        { id: 'tutor', label: 'Tutor', category: 'Learn', icon: <AcademicCapIcon />, view: View.TUTOR },
        { id: 'save', label: 'Vault', category: 'Memory', icon: <BookmarkSquareIcon />, view: View.SIFRA_SAVE },
        { id: 'diary', label: 'Moner Dana', category: 'Private', icon: <BookOpenIcon />, view: View.MONER_DANA },
        { id: 'cal', label: 'Calendar', category: 'Schedule', brandedIcon: <SifraCalendarLogo className="w-8 h-8" />, view: View.PERSONAL_CALENDAR },
        { id: 'db', label: 'Database', category: 'Registry', brandedIcon: <SifraDatabaseLogo className="w-8 h-8" />, view: View.DATABASE },
    ];

    return (
        <div className={`fixed inset-0 z-[200] flex flex-col font-sans overflow-hidden ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            
            <header className={`relative z-10 px-6 py-6 flex items-center justify-between backdrop-blur-sm border-b ${isDark ? 'border-white/5' : 'border-black/5'}`}>
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className={`p-2.5 rounded-2xl border active:scale-90 transition-all ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-black/5 text-gray-900'}`}>
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className={`text-xl font-black tracking-tight leading-tight uppercase italic ${isDark ? 'text-white' : 'text-gray-900'}`}>Library & History</h1>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <SparklesIcon className="w-2.5 h-2.5 text-amber-500" />
                            <p className="text-[7px] font-black uppercase tracking-[0.3em] text-gray-400">All Modules Active</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 pb-32 premium-scroll relative z-10">
                <div className="grid grid-cols-3 gap-3">
                    {apps.map((app, i) => (
                        <AppCard 
                            key={app.id}
                            app={app}
                            index={i}
                            onClick={() => onNavigate(app.view)}
                        />
                    ))}
                </div>

                <div className={`mt-8 p-6 rounded-[2rem] text-center border overflow-hidden relative group ${
                    isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-black/5 shadow-sm'
                }`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <SparklesIcon className={`w-8 h-8 mx-auto mb-3 ${isDark ? 'text-indigo-400/50' : 'text-indigo-500/50'}`} />
                    <h2 className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-gray-900'}`}>Sifra Core Ecosystem</h2>
                    <p className={`text-[7px] font-bold uppercase tracking-[0.2em] mt-1.5 opacity-40 ${isDark ? 'text-white' : 'text-gray-600'}`}>
                        Integrated intelligence across all modules
                    </p>
                </div>
            </main>

            <div className={`fixed bottom-0 left-0 w-full h-24 pointer-events-none bg-gradient-to-t ${isDark ? 'from-black to-transparent' : 'from-gray-50 to-transparent'}`} />
        </div>
    );
};

export default LibraryView;
