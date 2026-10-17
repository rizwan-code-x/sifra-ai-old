import React from 'react';
import XMarkIcon from '../components/icons/XMarkIcon';

interface TermsViewProps {
    onClose: () => void;
    showAcceptButton: boolean;
    onAccept: () => void;
}

const TermsView: React.FC<TermsViewProps> = ({ onClose, showAcceptButton, onAccept }) => {
    return (
        <div className="fixed inset-0 bg-black/30 z-50 animate-fade-in font-sans p-4">
             <div className="max-w-md mx-auto bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg flex flex-col h-full text-gray-800">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h1 className="text-2xl font-bold">Terms & Conditions</h1>
                    {!showAcceptButton && (
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
                            <XMarkIcon />
                        </button>
                    )}
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 prose prose-sm max-w-none">
                    <h2 className="text-lg font-semibold">Welcome to Sifra!</h2>
                    <p>By using this application, you agree to the following terms and conditions. Please read them carefully.</p>
                    
                    <h3>1. App Usage</h3>
                    <p>Sifra is an AI assistant designed for friendly conversation. You agree not to use the app for any illegal or unauthorized purpose.</p>
                    
                    <h3>2. Microphone & Data Usage</h3>
                    <p>Sifra respects your privacy. The microphone is only used when the voice input feature is active, indicated by the on-screen visualizer. Voice data is streamed for processing and is not stored long-term without your consent.</p>
                    
                    <h3>3. Chat History & Storage</h3>
                    <p>Your chat transcripts are saved locally on your device to provide a continuous conversation experience. This feature can be disabled in the Settings. You have full control to export or delete your history at any time.</p>

                    <h3>4. Privacy Policy</h3>
                    <p>We are committed to protecting your privacy. No personal data or conversation history is shared with third parties. If a cloud sync feature is introduced, it will be strictly opt-in.</p>
                    
                    <h3>5. Contact</h3>
                    <p>If you have any questions, please contact our support team. Contact information is available in the 'About Sifra' section.</p>
                </div>

                {showAcceptButton && (
                    <div className="p-6 bg-white/90 backdrop-blur-sm border-t border-gray-200">
                        <p className="text-xs text-center text-gray-500 mb-2">Please review and accept the Terms & Conditions to continue.</p>
                        <button onClick={onAccept} className="w-full bg-pink-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-pink-600 transition-colors">
                            Accept & Continue
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TermsView;
