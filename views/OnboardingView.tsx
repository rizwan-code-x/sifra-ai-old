
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface OnboardingViewProps {
  onOnboardingComplete: (newUser: UserProfile) => void;
}

const OnboardingView: React.FC<OnboardingViewProps> = ({ onOnboardingComplete }) => {
  const [name, setName] = useState('');
  const [showInput, setShowInput] = useState(false);

  const generateSifraId = (): string => {
    const digits = '0123456789';
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const n1 = digits[Math.floor(Math.random() * 10)];
    const n2 = digits[Math.floor(Math.random() * 10)];
    const l = letters[Math.floor(Math.random() * 26)];
    const n3 = digits[Math.floor(Math.random() * 10)];
    const n4 = digits[Math.floor(Math.random() * 10)];
    return `${n1}${n2}${l}${n3}${n4}`;
  };

  const handleConfirm = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      alert("Please enter your name.");
      return;
    }

    const newUser: UserProfile = {
      name: trimmedName,
      nickname: null,
      avatar: null,
      themeId: 'default',
      sifraAvatarId: 'cute',
      saveHistory: true,
      userId: generateSifraId(),
      joinDate: new Date().toISOString(),
      status: 'active',
      lastLogin: new Date().toISOString(),
      moodAmbienceEnabled: false,
    };

    onOnboardingComplete(newUser);
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-300 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md text-center bg-white/50 backdrop-blur-lg p-8 rounded-2xl shadow-xl transition-all duration-500">
        {!showInput ? (
          <div className="animate-fade-in">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome to Sifra</h1>
            <p className="text-gray-600 mb-8">Your personal AI friend is ready to chat. Let's get started!</p>
            <button
              onClick={() => setShowInput(true)}
              className="px-8 py-3 bg-pink-500 text-white font-bold rounded-full shadow-lg hover:bg-pink-600 transition-transform transform hover:scale-105"
            >
              Start
            </button>
          </div>
        ) : (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">What should I call you?</h2>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
              placeholder="Enter your name here..."
              className="w-full p-3 border border-gray-300 rounded-xl text-center shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
              autoFocus
            />
            <button
              onClick={handleConfirm}
              disabled={!name.trim()}
              className="mt-4 w-full px-8 py-3 bg-pink-500 text-white font-bold rounded-xl shadow-lg hover:bg-pink-600 transition-colors disabled:bg-pink-300 disabled:cursor-not-allowed"
            >
              Confirm
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingView;
