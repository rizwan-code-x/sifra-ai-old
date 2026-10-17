import React from 'react';
import { Theme, Mood, AdminSettings, UserProfile, View } from '../types';
import SifraLiveLogo from './SifraLiveLogo';
import { PlusIcon, StarIcon, UserIcon, Menu } from 'lucide-react';
import NotificationItem from './NotificationItem';

interface HeaderProps {
    userName: string | null;
    onProfileClick: () => void;
    onMenuClick: () => void;
    onVersionClick?: () => void;
    onLogoClick?: () => void;
    onPlusClick?: () => void;
    theme: Theme;
    moodAmbienceEnabled?: boolean;
    currentMood?: Mood;
    adminSettings?: AdminSettings;
    userProfile?: UserProfile;
    onUpdateUserProfile?: (profile: UserProfile) => void;
    onNavigate?: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ userName, onProfileClick, onMenuClick, onLogoClick, onPlusClick, userProfile, onUpdateUserProfile }) => {
    const activeVersionId = userProfile?.activeSystemVersionId || 'v4-gold';

    const getVersionInfo = (id: string) => {
        switch(id) {
            case 'v4-gold': return { label: 'SIFRA CORE', color: 'text-[#fbbc04]' };
            case 'v5-neural': return { label: 'V5.0 NEURAL', color: 'text-purple-500' };
            case 'v-premium': return { label: 'V-PREMIUM', color: 'text-pink-500' };
            default: return { label: 'SIFRA CORE', color: 'text-[#fbbc04]' };
        }
    };

    const versionInfo = getVersionInfo(activeVersionId);

    return (
        <header className="px-4 py-3 bg-transparent flex justify-between items-center z-50 sticky top-0 h-[64px] w-full max-w-screen-2xl mx-auto">
            {/* Left Section - Menu, Logo & Version Indicator (Static, not opening popup) */}
            <div className="flex items-center gap-1">
                 <button onClick={onMenuClick} className="p-2 transition-all active:scale-95 flex items-center justify-center">
                    <Menu className="w-6 h-6 text-[#1a1f36] opacity-80 stroke-[1.5]" />
                </button>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={onLogoClick}
                        className="flex items-center group relative cursor-pointer active:scale-95 transition-transform"
                    >
                        <SifraLiveLogo size="header" loop={false} />
                    </button>

                    <div 
                        className="flex items-center gap-1.5 select-none text-left" 
                    >
                        <StarIcon className={`w-3.5 h-3.5 ${activeVersionId === 'v-premium' ? 'text-pink-500' : 'text-[#fbbc04]'} fill-current stroke-[1]`} />
                        <span className={`tracking-widest uppercase ${versionInfo.color} font-black text-[11px]`}>
                            {versionInfo.label}
                        </span>
                    </div>
                </div>
            </div>
            
            {/* Right Section */}
            <div className="flex items-center gap-2.5">
                 <button 
                    onClick={onPlusClick}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-transparent hover:bg-black/5 transition-all active:scale-95 group" 
                    aria-label="Add"
                 >
                    <PlusIcon className="w-4.5 h-4.5 text-gray-900 group-hover:scale-110 transition-transform" />
                 </button>

                 <div className="relative z-[200]">
                    <NotificationItem userProfile={userProfile} onUpdateUserProfile={onUpdateUserProfile} />
                 </div>

                 <button 
                    onClick={onProfileClick} 
                    className="flex items-center justify-center w-9 h-9 bg-transparent hover:bg-black/5 transition-all rounded-full active:scale-95 group" 
                    aria-label="Open Profile"
                 >
                     <UserIcon className="w-4.5 h-4.5 text-gray-900 group-hover:scale-110 transition-transform" />
                </button>
            </div>
        </header>
    );
};

export default Header;
