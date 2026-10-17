
import React from 'react';
import { View } from '../types';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import BookmarkSquareIcon from '../components/icons/BookmarkSquareIcon';
import BookOpenIcon from '../components/icons/BookOpenIcon';

interface PrivateViewProps {
    onNavigate: (view: View) => void;
    onClose: () => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; onClick: () => void; }> = ({ icon, title, description, onClick }) => (
    <button
        onClick={onClick}
        className="w-full bg-white/70 p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all text-left flex items-start gap-4"
    >
        <div className="text-pink-500 mt-1">{icon}</div>
        <div>
            <h3 className="font-bold text-lg text-gray-800">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
        </div>
    </button>
);

const PrivateView: React.FC<PrivateViewProps> = ({ onNavigate, onClose }) => {
    return (
        <div className="h-full flex flex-col animate-fade-in-up">
            <header className="p-4 shadow-md bg-white/30 backdrop-blur-sm flex items-center z-10">
                <button onClick={onClose} className="p-2 -m-2 rounded-full hover:bg-black/5 transition-colors mr-4">
                    <ArrowLeftIcon />
                </button>
                <h1 className="text-xl font-bold text-gray-800">Private Space</h1>
            </header>
            
            <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 flex flex-col items-center justify-center">
                <div className="w-full max-w-lg space-y-4">
                    <FeatureCard
                        icon={<BookmarkSquareIcon />}
                        title="Sifra Save"
                        description="View things you've asked Sifra to remember. Your personal memory log, saved automatically."
                        onClick={() => onNavigate(View.SIFRA_SAVE)}
                    />
                    <FeatureCard
                        icon={<BookOpenIcon />}
                        title="Moner Dana (Private Diary)"
                        description="Your secure digital diary. Write down your thoughts, feelings, and memories."
                        onClick={() => onNavigate(View.MONER_DANA)}
                    />
                </div>
                 <p className="text-xs text-gray-500 mt-8 text-center max-w-sm">
                    This is your private area. All data here is stored only on your device and is not shared with anyone.
                </p>
            </main>
        </div>
    );
};

export default PrivateView;
