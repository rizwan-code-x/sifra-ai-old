
import React from 'react';
import { View } from '../types';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import PlusCircleIcon from '../components/icons/PlusCircleIcon';
import BookOpenIcon from '../components/icons/BookOpenIcon';
import UserIcon from '../components/icons/UserIcon';
import MusicalNoteIcon from '../components/icons/MusicalNoteIcon';
import AcademicCapIcon from '../components/icons/AcademicCapIcon';
import GlobeAltIcon from '../components/icons/GlobeAltIcon';
import LogoutIcon from '../components/icons/LogoutIcon';
import ChevronRightIcon from '../components/icons/ChevronRightIcon';

interface AdvancedSettingsViewProps {
    onNavigate: (view: View) => void;
    onClose: () => void;
    onNewChat: () => void;
    onLogout: () => void;
}

const SettingsItem: React.FC<{ icon: React.ReactNode; title: string; subtitle: string; onClick: () => void }> = ({ icon, title, subtitle, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center p-3 rounded-xl transition-colors duration-200 bg-white/70 hover:bg-white text-left shadow-sm border border-gray-100">
        <div className="mr-3 text-pink-500">{React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}</div>
        <div className="flex-1">
            <p className="text-sm font-bold text-gray-800">{title}</p>
            <p className="text-[10px] text-gray-500">{subtitle}</p>
        </div>
        <ChevronRightIcon className="w-4 h-4 text-gray-400" />
    </button>
);

const AdvancedSettingsView: React.FC<AdvancedSettingsViewProps> = ({ onNavigate, onClose, onNewChat, onLogout }) => {
    return (
        <div className="h-full flex flex-col animate-fade-in-up bg-gray-50">
            <header className="px-4 py-3 shadow-sm bg-white/50 backdrop-blur-md flex items-center z-10 border-b border-gray-100">
                <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-black/5 transition-colors mr-2">
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <h1 className="text-sm font-black text-gray-800 uppercase tracking-tight">Advanced Settings</h1>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="space-y-2">
                    <SettingsItem icon={<PlusCircleIcon />} title="New Chat" subtitle="Start a fresh conversation" onClick={onNewChat} />
                    <SettingsItem icon={<BookOpenIcon />} title="History" subtitle="View your past conversations" onClick={() => onNavigate(View.HISTORY)} />
                    <SettingsItem icon={<UserIcon />} title="Profile & Settings" subtitle="Customize your and Sifra's profile" onClick={() => onNavigate(View.PROFILE)} />
                </div>
                
                <div className="pt-2">
                    <h2 className="px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Features</h2>
                    <div className="space-y-2">
                        <SettingsItem icon={<AcademicCapIcon />} title="Library / Tutor" subtitle="Access AI Tutor and other tools" onClick={() => onNavigate(View.LIBRARY)} />
                        <SettingsItem icon={<GlobeAltIcon />} title="Travel Guide" subtitle="Get travel info from your AI guide" onClick={() => onNavigate(View.TRAVEL_GUIDE)} />
                    </div>
                </div>

                <div className="pt-2">
                    <h2 className="px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Account</h2>
                     <div className="space-y-2">
                        <SettingsItem icon={<LogoutIcon />} title="Logout" subtitle="Sign out from your account" onClick={onLogout} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdvancedSettingsView;
