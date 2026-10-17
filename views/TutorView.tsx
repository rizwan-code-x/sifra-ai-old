
import React, { useState, useEffect, useRef } from 'react';
import { Message, Role, UserProfile, TutorProfile, SIFRA_AVATARS } from '../types';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import { GoogleGenAI, Chat } from '@google/genai';
import Avatar from '../components/Avatar';
import { useLocalStorage } from '../hooks/useLocalStorage';
import XMarkIcon from '../components/icons/XMarkIcon';

interface TutorViewProps {
    userProfile: UserProfile;
    onClose: () => void;
}

const TutorProfileForm: React.FC<{ onSubmit: (profile: TutorProfile) => void; onSkip: () => void; }> = ({ onSubmit, onSkip }) => {
    const [formData, setFormData] = useState<TutorProfile>({
        name: '', institute: '', board: '', studentType: 'intermediate', state: '', district: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="absolute inset-0 bg-black/30 z-20 flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md animate-fade-in-up">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Create Your Tutor Profile</h2>
                <p className="text-sm text-gray-600 mb-4">This helps Sifra personalize the learning experience for you.</p>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto p-1">
                    <input name="name" onChange={handleChange} placeholder="Your Name" required className="w-full p-2 border rounded bg-white text-black" />
                    <input name="institute" onChange={handleChange} placeholder="Institute Name" required className="w-full p-2 border rounded bg-white text-black" />
                    <input name="board" onChange={handleChange} placeholder="Board (e.g., WBCHSE, CBSE)" required className="w-full p-2 border rounded bg-white text-black" />
                    <select name="studentType" onChange={handleChange} value={formData.studentType} className="w-full p-2 border rounded bg-white text-black">
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                    <input name="state" onChange={handleChange} placeholder="State" required className="w-full p-2 border rounded bg-white text-black" />
                    <input name="district" onChange={handleChange} placeholder="District" required className="w-full p-2 border rounded bg-white text-black" />
                </div>
                <div className="flex gap-2 mt-4">
                    <button type="button" onClick={onSkip} className="flex-1 py-2 px-4 bg-gray-200 rounded-lg hover:bg-gray-300 font-semibold">Skip for Now</button>
                    <button type="submit" className="flex-1 py-2 px-4 bg-pink-500 text-white rounded-lg hover:bg-pink-600 font-semibold">Save Profile</button>
                </div>
            </form>
        </div>
    );
};


const TutorView: React.FC<TutorViewProps> = ({ userProfile, onClose }) => {
    const [tutorProfile, setTutorProfile] = useLocalStorage<TutorProfile | null>(`sifra_tutor_profile_${userProfile.userId}`, null);
    const [chatHistory, setChatHistory] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showProfileForm, setShowProfileForm] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const sifraAvatar = SIFRA_AVATARS.find(a => a.id === userProfile?.sifraAvatarId) || SIFRA_AVATARS[0];

    useEffect(() => {
        if (!tutorProfile) {
            setShowProfileForm(true);
        } else if (chatHistory.length === 0) {
            setChatHistory([{ messageId: `tutor-initial-${Date.now()}`, role: Role.MODEL, parts: [{ text: `Hello ${tutorProfile.name}! I'm Sifra, your personal tutor. How can I help you with your studies today?` }] }]);
        }
    }, [tutorProfile, chatHistory.length]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory, isLoading]);

    const getSystemInstruction = (): string => {
        if (tutorProfile) {
            return `You are Sifra, a friendly, patient AI tutor. You are teaching ${tutorProfile.name}, a student from ${tutorProfile.institute} under the ${tutorProfile.board} board, who is at an ${tutorProfile.studentType} level. When asked a question:
- Provide a short explanation (2-4 sentences).
- Provide a simple example.
- Provide one practice question and its answer.
- Offer to explain it in a simpler way if the user seems confused.
Your tone must be supportive, clear, and concise. All communication should be in a chat style.`;
        }
        return "You are Sifra, a helpful AI Tutor. Ask the user about their studies.";
    };

    const handleSendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;
        const userMessage: Message = { messageId: `tutor-user-${Date.now()}`, role: Role.USER, parts: [{ text }] };
        const currentChatHistory = [...chatHistory, userMessage];
        setChatHistory(currentChatHistory);
        setIsLoading(true);

        try {
            // Fix: Initializing GoogleGenAI right before use to ensure up-to-date API key from environment as per requirements.
            const ai = new GoogleGenAI({ apiKey: (process.env.API_KEY || process.env.GEMINI_API_KEY as string) });
            if (ai && ai.chats && !chatRef.current) {
                const systemInstruction = getSystemInstruction();
                chatRef.current = ai.chats.create({ 
                    model: 'gemini-3.8-flash', 
                    history: chatHistory.map(({role, parts}) => ({role, parts})), 
                    config: { systemInstruction } 
                });
            }
            if (!chatRef.current) {
                throw new Error("Chat not initialized");
            }
            const stream = await chatRef.current.sendMessageStream({ message: text });

            let fullText = '';
            const modelMessageId = `tutor-model-${Date.now()}`;
            const placeholderMessage: Message = { messageId: modelMessageId, role: Role.MODEL, parts: [{ text: '' }] };
            setChatHistory([...currentChatHistory, placeholderMessage]);

            for await (const chunk of stream) {
                fullText += chunk.text || '';
                setChatHistory(prev =>
                    prev.map(msg =>
                        msg.messageId === modelMessageId
                            ? { ...msg, parts: [{ text: fullText }] }
                            : msg
                    )
                );
            }
        } catch (error) {
            console.error("Error in TutorView:", error);
            const errorMessage: Message = { messageId: `tutor-error-${Date.now()}`, role: Role.MODEL, parts: [{ text: "I encountered an error. Please try again." }] };
            setChatHistory([...currentChatHistory, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col animate-fade-in-up relative">
            <header className="p-4 shadow-md bg-white/30 backdrop-blur-sm flex items-center justify-between z-10">
                <div className="flex items-center">
                    <button onClick={onClose} className="p-2 -m-2 rounded-full hover:bg-black/5 transition-colors mr-4">
                        <ArrowLeftIcon />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">AI Tutor</h1>
                        <p className="text-xs text-gray-600">{tutorProfile?.board || 'Personalized Learning'}</p>
                    </div>
                </div>
                <button onClick={() => setShowProfileForm(true)} className="text-sm font-semibold text-pink-600 hover:underline">
                    Tutor Profile
                </button>
            </header>

            {showProfileForm && (
                <TutorProfileForm 
                    onSubmit={(profile) => { setTutorProfile(profile); setShowProfileForm(false); }} 
                    onSkip={() => setShowProfileForm(false)}
                />
            )}
            
            <div className="h-full flex flex-col p-2 md:p-4 gap-2 md:gap-4 flex-1">
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-4 px-2 scroll-smooth">
                    {chatHistory.map((msg, index) => (
                        <ChatMessage
                            key={msg.messageId || index}
                            message={msg}
                            isPlayingAudio={false}
                            onReplayAudio={() => {}} // No audio in tutor
                            userAvatar={userProfile?.avatar || null}
                            userName={userProfile?.name || null}
                            sifraAvatarUrl={sifraAvatar.url}
                            isLoading={isLoading}
                            isLastMessage={index === chatHistory.length - 1}
                        />
                    ))}
                </div>

                <div className="p-2">
                    <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading || !tutorProfile} onVoiceClick={() => alert('Voice mode coming soon to Tutor!')} />
                </div>
            </div>
        </div>
    );
};

export default TutorView;
