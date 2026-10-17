
import React from 'react';
import { UserProfile } from '../types';
import XMarkIcon from '../components/icons/XMarkIcon';
import Avatar from '../components/Avatar';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';

interface AccountSwitcherViewProps {
    allUsers: UserProfile[];
    currentUser: UserProfile;
    onSwitchUser: (userId: string) => void;
    onAddNewUser: () => void;
    onClose: () => void;
}

const AccountSwitcherView: React.FC<AccountSwitcherViewProps> = ({ allUsers, currentUser, onSwitchUser, onAddNewUser, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/30 z-50 animate-fade-in font-sans">
            <div className="max-w-md mx-auto bg-white/90 backdrop-blur-lg rounded-t-2xl shadow-lg text-gray-800 h-full flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h1 className="text-2xl font-bold">Switch Account</h1>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
                        <XMarkIcon />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                    <h2 className="text-sm font-semibold text-gray-500 mb-2">Select an account to continue</h2>
                    {allUsers.map(user => (
                        <button 
                            key={user.userId} 
                            onClick={() => onSwitchUser(user.userId)}
                            className="w-full flex items-center p-3 bg-white/70 rounded-lg hover:bg-white transition-colors shadow-sm text-left"
                        >
                            <Avatar src={user.avatar} initials={user.name} />
                            <div className="ml-4 flex-1">
                                <p className="font-semibold">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.email || user.userId}</p>
                            </div>
                            {currentUser.userId === user.userId && (
                                <div className="text-green-500">
                                    <CheckCircleIcon />
                                    <span className="sr-only">Current Account</span>
                                </div>
                            )}
                        </button>
                    ))}
                     {allUsers.length === 0 && (
                        <p className="text-center text-gray-500 py-4">No other accounts found.</p>
                    )}
                </div>

                <div className="p-6 bg-white/90 backdrop-blur-sm border-t border-gray-200">
                    <button 
                        onClick={onAddNewUser}
                        className="w-full bg-pink-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-pink-600 transition-colors shadow-lg"
                    >
                        + Add or Log In to Another Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccountSwitcherView;
