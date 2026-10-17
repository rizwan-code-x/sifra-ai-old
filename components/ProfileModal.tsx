
import React, { useState } from 'react';
import { UserProfile } from '../types';
import XMarkIcon from './icons/XMarkIcon';
import Avatar from './Avatar';
import CopyIcon from './icons/CopyIcon';
import TrashIcon from './icons/TrashIcon';
import LogoutIcon from './icons/LogoutIcon';

interface ProfileModalProps {
    userProfile: UserProfile;
    onClose: () => void;
    onManageAccount: () => void;
    onLogout: () => void;
    onClearAllData: () => void;
}

const DetailPopup: React.FC<{ title: string; content: React.ReactNode; onClose: () => void }> = ({ title, content, onClose }) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
            <div className="text-sm text-gray-600">{content}</div>
            <button onClick={onClose} className="mt-4 w-full bg-pink-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors">
                Close
            </button>
        </div>
    </div>
);

const ProfileModal: React.FC<ProfileModalProps> = ({ userProfile, onClose, onManageAccount, onLogout, onClearAllData }) => {
    const [copied, setCopied] = useState(false);
    const [detailPopup, setDetailPopup] = useState<{ title: string; content: React.ReactNode } | null>(null);

    const handleCopyId = () => {
        navigator.clipboard.writeText(userProfile.userId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const InfoRow: React.FC<{ label: string; value: string; detail?: React.ReactNode }> = ({ label, value, detail }) => (
        <div 
            className={`flex justify-between items-center py-2 ${detail ? 'cursor-pointer hover:bg-gray-100/50 -mx-2 px-2 rounded-md' : ''}`}
            onClick={detail ? () => setDetailPopup({ title: label, content: detail }) : undefined}
        >
            <span className="text-sm font-semibold text-gray-600">{label}:</span>
            <span className="text-sm text-gray-800 font-medium">{value}</span>
        </div>
    );

    return (
        <>
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in" onClick={onClose}></div>
        <div className="fixed top-20 right-4 w-80 bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl z-50 animate-fade-in-down font-sans text-gray-800">
            <div className="p-4 border-b border-gray-200/80 flex items-center justify-between">
                <h2 className="font-bold text-lg">My Profile</h2>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                    <XMarkIcon />
                </button>
            </div>
            
            <div className="p-4 flex flex-col items-center">
                <Avatar src={userProfile.avatar} initials={userProfile.name} />
                <h3 className="mt-2 font-bold text-xl">{userProfile.name}</h3>
                <p className="text-xs text-gray-500">{userProfile.email || 'No email provided'}</p>
            </div>

            <div className="px-4 pb-4 space-y-1">
                <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-semibold text-gray-600">User ID:</span>
                    <div className="flex items-center gap-2 bg-gray-100/80 rounded-full px-2 py-0.5">
                        <span className="text-xs text-gray-700 font-mono truncate">{userProfile.userId.toUpperCase()}</span>
                        <button onClick={handleCopyId} className="text-gray-500 hover:text-pink-500">
                            <CopyIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                {copied && <p className="text-xs text-green-600 text-right -mt-1">Copied!</p>}

                <InfoRow label="Join Date" value={new Date(userProfile.joinDate).toLocaleDateString()} />
                <InfoRow label="Account Status" value={userProfile.status.charAt(0).toUpperCase() + userProfile.status.slice(1)} />
                <InfoRow 
                    label="Account Plan" 
                    value="কোনরকম প্ল্যান যুক্ত নেই" 
                    detail={
                        <div>
                            <p>বর্তমানে কোনো সক্রিয় প্ল্যান যুক্ত নেই।</p>
                            <p className="mt-2 text-rose-500 font-semibold">কোনরকম প্ল্যান যুক্ত নেই</p>
                        </div>
                    }
                />
                <InfoRow label="Last Active" value={new Date(userProfile.lastLogin).toLocaleTimeString()} />
            </div>

            <div className="p-4 border-t border-gray-200/80 space-y-2">
                <button onClick={onManageAccount} className="w-full text-center py-2 px-4 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition-colors shadow-md">
                    Manage Account & Settings
                </button>
                <div className="flex gap-2">
                    <button onClick={onLogout} className="flex-1 flex items-center justify-center gap-1 py-2 px-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors text-sm">
                        <LogoutIcon /> Logout
                    </button>
                    <button onClick={onClearAllData} className="flex-1 flex items-center justify-center gap-1 py-2 px-2 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition-colors text-sm">
                        <TrashIcon /> Clear Data
                    </button>
                </div>
            </div>
        </div>
        
        {detailPopup && <DetailPopup title={detailPopup.title} content={detailPopup.content} onClose={() => setDetailPopup(null)} />}
        </>
    );
};

export default ProfileModal;
