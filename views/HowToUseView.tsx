import React from 'react';
import XMarkIcon from '../components/icons/XMarkIcon';

interface HowToUseViewProps {
    onClose: () => void;
}

const HowToUseView: React.FC<HowToUseViewProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/30 z-50 animate-fade-in font-sans p-4">
            <div className="max-w-md mx-auto bg-gradient-to-br from-purple-50 via-pink-50 to-white backdrop-blur-lg rounded-2xl shadow-lg flex flex-col h-full text-gray-800">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h1 className="text-2xl font-bold">How to Use Sifra</h1>
                     <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
                        <XMarkIcon />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 prose prose-sm max-w-none">
                    <h3 className="font-semibold text-lg">🎙️ Voice Activation:</h3>
                    <p>
                        Tap the microphone icon to start a voice conversation. I'll be listening for your voice.
                        You can say things like:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>“Play a song on YouTube”</li>
                        <li>“Turn on flashlight” (Feature coming soon!)</li>
                        <li>“Send message to &lt;name&gt;” (Feature coming soon!)</li>
                        <li>“Explain this meaning”</li>
                        <li>“Search on Google for…”</li>
                    </ul>

                    <h3 className="font-semibold text-lg mt-4">💬 Text Chat:</h3>
                    <p>
                        Just type in the chat box! I'll understand and reply in our usual mix of Bengali and English.
                    </p>

                    <h3 className="font-semibold text-lg mt-4">📸 Profile:</h3>
                    <p>
                        In the profile section, you can change your name, nickname, and profile picture. You can also customize my look and voice to your liking!
                    </p>
                    
                    <h3 className="font-semibold text-lg mt-4">🕵️ Privacy Tips:</h3>
                    <p>
                        Your privacy is important. I store your conversation data locally on your device. You can delete your entire chat history anytime from "Profile & Settings → Chat History".
                    </p>
                </div>

                <div className="p-6 bg-white/90 backdrop-blur-sm border-t border-gray-200">
                    <button onClick={onClose} className="w-full bg-pink-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-pink-600 transition-colors">
                        Got it ✅
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HowToUseView;
