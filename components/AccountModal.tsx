

import React from 'react';
import { UserProfile, APP_VERSION } from '../types';
import XMarkIcon from './icons/XMarkIcon';
import LogoutIcon from './icons/LogoutIcon';
import SwitchUserIcon from './icons/SwitchUserIcon';

interface AccountModalProps {
    userProfile: UserProfile;
    onClose: () => void;
    onSwitchAccount: () => void;
    onLogout: () => void;
}

const InfoRow: React.FC<{ label: string; value: string; }> = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-200/80">
        <span className="text-sm font-semibold text-gray-600">{label}:</span>
        <span className="text-sm text-gray-800 font-medium">{value}</span>
    </div>
);

const AccountModal: React.FC<AccountModalProps> = ({ userProfile, onClose, onSwitchAccount, onLogout }) => {
    return (
        <>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in" onClick={onClose}></div>
            <div className="fixed top-20 left-4 w-80 bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl z-50 animate-fade-in-down font-sans text-gray-800">
                <div className="p-4 border-b border-gray-200/80 flex items-center justify-between">
                    <h2 className="font-bold text-lg">Account Information</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <XMarkIcon />
                    </button>
                </div>
                
                <div className="p-4 space-y-1">
                     <InfoRow label="Name" value={userProfile.name || 'N/A'} />
                     <InfoRow label="E-mail ID" value={userProfile.email || 'N/A'} />
                     <InfoRow label="Account Status" value={userProfile.status.charAt(0).toUpperCase() + userProfile.status.slice(1)} />
                     <InfoRow label="Account Type" value="PRO (Free Access)" />
                     <InfoRow label="Account Version" value={APP_VERSION} />
                </div>

                <div className="p-4 border-t border-gray-200/80 space-y-2">
                     <button onClick={onSwitchAccount} className="w-full flex items-center justify-center gap-2 text-center py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-md">
                        <SwitchUserIcon /> Switch / Add Account
                    </button>
                    <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-2 px-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors text-sm">
                        <LogoutIcon /> LOG OUT
                    </button>
                </div>
            </div>
        </>
    );
};

export default AccountModal;
