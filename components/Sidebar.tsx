
import React from 'react';
import { View, UserProfile } from '../types';
import Avatar from './Avatar';
import PlusCircleIcon from './icons/PlusCircleIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import UserIcon from './icons/UserIcon';
import AcademicCapIcon from './icons/AcademicCapIcon';
import GlobeAltIcon from './icons/GlobeAltIcon';
import LogoutIcon from './icons/LogoutIcon';
import XMarkIcon from './icons/XMarkIcon';
import PhoneIcon from './icons/PhoneIcon';
import SparklesIcon from './icons/SparklesIcon';
import HomeIcon from './icons/HomeIcon';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (view: View) => void;
    onLogout: () => void;
    onNewChat: () => void;
    userProfile: UserProfile;
}

const NavItem: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void, disabled?: boolean, isPremium?: boolean }> = ({ icon, label, onClick, disabled = false, isPremium = false }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center w-full p-3 text-sm font-medium rounded-lg transition-colors duration-200 ${disabled ? 'text-gray-400 cursor-not-allowed' : isPremium ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-900 hover:from-purple-200 hover:to-pink-200' : 'text-gray-700 hover:bg-pink-100/50'}`}
    >
        <div className={`w-6 h-6 mr-3 ${isPremium ? 'text-purple-600' : ''}`}>{icon}</div>
        <span>{label}</span>
        {isPremium && <span className="ml-auto text-[10px] bg-purple-600 text-white px-1.5 py-0.5 rounded-full font-bold">PRO</span>}
    </button>
);

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onNavigate, onLogout, onNewChat, userProfile }) => {
    const handleNavigation = (view: View) => {
        onNavigate(view);
        onClose();
    };

    return (
        <>
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-white/80 backdrop-blur-lg shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200/80 flex justify-between items-center">
                         <h2 className="font-bold text-lg text-gray-800">Sifra Menu</h2>
                         <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <XMarkIcon />
                        </button>
                    </div>

                    {/* Profile */}
                    <div className="p-4 flex items-center gap-3 border-b border-gray-200/80">
                        <Avatar src={userProfile.avatar} initials={userProfile.name} />
                        <div>
                            <p className="font-bold text-gray-800">{userProfile.name}</p>
                            <p className="text-xs text-gray-500">PRO User</p>
                        </div>
                    </div>
                    
                    {/* Navigation */}
                    <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                        <NavItem icon={<HomeIcon />} label="Home" onClick={() => handleNavigation(View.HOME)} />
                        <NavItem icon={<SparklesIcon />} label="Quantum Teap" onClick={() => handleNavigation(View.DUAL_MODE)} isPremium />
                        <hr className="my-2 border-gray-200/80" />
                        <NavItem icon={<PlusCircleIcon />} label="New Chat" onClick={() => {}} disabled />
                        <NavItem icon={<BookOpenIcon />} label="History" onClick={() => handleNavigation(View.HISTORY)} />
                        <NavItem icon={<AcademicCapIcon />} label="Projects Library" onClick={() => handleNavigation(View.PROJECTS)} />
                        <NavItem icon={<SparklesIcon />} label="Free Hand Mode" onClick={() => handleNavigation(View.FREE_HAND_MODE)} />
                        <NavItem icon={<UserIcon />} label="Profile & Settings" onClick={() => handleNavigation(View.PROFILE)} />
                        <hr className="my-2 border-gray-200/80" />
                        <NavItem icon={<PhoneIcon />} label="Calls Sifra (Voice)" onClick={() => handleNavigation(View.GALAXY_VOICE)} />
                        <NavItem icon={<AcademicCapIcon />} label="Library & History" onClick={() => handleNavigation(View.LIBRARY)} />
                        <NavItem icon={<GlobeAltIcon />} label="Travel Guide" onClick={() => handleNavigation(View.TRAVEL_GUIDE)} />
                    </nav>

                    {/* Footer */}
                    <div className="p-2 border-t border-gray-200/80">
                        <NavItem icon={<LogoutIcon />} label="Logout" onClick={onLogout} />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
