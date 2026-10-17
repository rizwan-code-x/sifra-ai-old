

import React from 'react';
import XMarkIcon from '../components/icons/XMarkIcon';
import { APP_VERSION } from '../types';

interface AboutViewProps {
    onClose: () => void;
}

const AboutView: React.FC<AboutViewProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/30 z-50 animate-fade-in font-sans p-4">
             <div className="max-w-md mx-auto bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg flex flex-col h-full text-gray-800">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h1 className="text-2xl font-bold">About Sifra</h1>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
                        <XMarkIcon />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 prose prose-sm max-w-none">
                    <div className="text-center mb-6">
                        <p className="text-5xl">💖</p>
                        <h2 className="text-xl font-bold mt-2">Sifra - Your AI Friend</h2>
                        <p className="text-gray-500">Version {APP_VERSION}</p>
                    </div>

                    <p>Sifra is a sweet, emotional, and caring AI friend designed to provide a natural and human-like conversational experience in a mix of Bengali and English.</p>
                    
                    <h3 className="font-semibold">Creator's Note</h3>
                    <p className="bg-pink-50 p-3 rounded-lg border-l-4 border-pink-300">
                        <strong>Sifra is built by Rizwan.</strong> Rizwan provided the design, behaviour and core knowledge for this assistant. The app’s behavior, knowledge and personalization were designed and provided by Rizwan with love and care.
                    </p>

                    <h3 className="font-semibold">Key Features</h3>
                    <ul>
                        <li><strong>Natural Conversation:</strong> Chat with Sifra using text or real-time voice.</li>
                        <li><strong>Personalization:</strong> Customize Sifra's voice, avatar, and the app's theme.</li>
                        <li><strong>Chat History:</strong> View, export, and manage your conversation history.</li>
                        <li><strong>Galaxy Visualizer:</strong> An immersive audio visualizer for voice chats.</li>
                        <li><strong>Privacy First:</strong> Your data is stored locally, and you have full control over it.</li>
                    </ul>

                    <h3 className="font-semibold">Contact & Support</h3>
                    <p>For any support or inquiries, please contact us at: <a href="mailto:support@sifra.ai">support@sifra.ai</a> (placeholder).</p>
                    
                    <p className="text-xs text-center text-gray-400 mt-8">
                        Thank you for being a part of Sifra's journey!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AboutView;
