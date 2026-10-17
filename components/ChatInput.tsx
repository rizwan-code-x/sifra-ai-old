
import React, { useState, useRef, useEffect } from 'react';
import MicrophoneIcon from './icons/MicrophoneIcon';
import SendIcon from './icons/SendIcon';
import PlusCircleIcon from './icons/PlusCircleIcon';
import ChevronUpIcon from './icons/ChevronUpIcon';
import XMarkIcon from './icons/XMarkIcon';
import SparklesIcon from './icons/SparklesIcon';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Image as ImageIcon, FolderOpen, Brain, Zap, Search, Save } from 'lucide-react';

interface ChatInputProps {
    onSendMessage: (text: string, imageData?: { data: string, mimeType: string }) => void;
    isLoading: boolean;
    onVoiceClick: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, onVoiceClick }) => {
    const [text, setText] = useState('');
    const [selectedImage, setSelectedImage] = useState<{ data: string, mimeType: string } | null>(null);
    const [showPlusMenu, setShowPlusMenu] = useState(false);
    
    // Neural States
    const [mode, setMode] = useState<'thinking' | 'pro' | 'research'>('pro');
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
        }
    }, [text]);

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if ((text.trim() || selectedImage) && !isLoading) {
            onSendMessage(text, selectedImage || undefined);
            setText('');
            setSelectedImage(null);
            if (textareaRef.current) textareaRef.current.style.height = 'auto';
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = (event.target?.result as string).split(',')[1];
                setSelectedImage({
                    data: base64,
                    mimeType: file.type
                });
                setShowPlusMenu(false);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const handleSaveMenu = () => {
        setShowPlusMenu(false);
        // Additional logic if needed for mode selection
    };

    return (
        <div className="flex flex-col gap-3 relative">
            <AnimatePresence>
                {selectedImage && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="flex items-center gap-2 p-2 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 self-start relative"
                    >
                        <img 
                            src={`data:${selectedImage.mimeType};base64,${selectedImage.data}`} 
                            alt="Preview" 
                            className="w-16 h-16 object-cover rounded-xl shadow-lg border border-white/20"
                        />
                        <button 
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                        >
                            <XMarkIcon className="w-3" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative flex flex-col bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-2 shadow-2xl transition-all focus-within:ring-2 focus-within:ring-purple-500/50">
                <div className="flex items-end gap-2 pr-1">
                    {/* Tool Toggle Button */}
                    <button
                        type="button"
                        onClick={() => setShowPlusMenu(!showPlusMenu)}
                        className={`p-3 rounded-full transition-all active:scale-95 ${showPlusMenu ? 'bg-indigo-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                    >
                        <motion.div animate={{ rotate: showPlusMenu ? 135 : 0 }}>
                            <PlusCircleIcon className="w-6 h-6" />
                        </motion.div>
                    </button>

                    <textarea
                        ref={textareaRef}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }}
                        placeholder={mode === 'thinking' ? "Thinking..." : mode === 'research' ? "Researching..." : "Neural Link Input..."}
                        className="flex-1 p-3 bg-transparent text-white placeholder-white/30 text-sm font-medium focus:outline-none resize-none min-h-[48px] max-h-[200px] scrollbar-hide"
                        rows={1}
                        disabled={isLoading}
                    />

                    <button
                        type="button"
                        onClick={() => handleSubmit()}
                        disabled={isLoading || (!text.trim() && !selectedImage)}
                        className={`p-3 rounded-full transition-all active:scale-90 shadow-lg ${isLoading || (!text.trim() && !selectedImage) ? 'bg-white/10 text-white/20' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:shadow-purple-500/20 shadow-xl'}`}
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <SendIcon className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {/* PLUS MENU WINDOW */}
                <AnimatePresence>
                    {showPlusMenu && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute bottom-full left-0 mb-6 w-72 bg-[#0F1117] border border-white/10 rounded-[2.5rem] shadow-[0_32px_64px_rgba(0,0,0,0.8)] overflow-hidden z-[100]"
                        >
                            <div className="p-6 space-y-6">
                                {/* Media Section */}
                                <div>
                                    <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 mb-4 px-2">Neural Input</h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button onClick={() => {}} className="flex flex-col items-center gap-2 p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group">
                                            <Camera className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                                            <span className="text-[7px] font-black uppercase tracking-widest text-white/60">Photo</span>
                                        </button>
                                        <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-2 p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group">
                                            <ImageIcon className="w-5 h-5 text-pink-400 group-hover:scale-110 transition-transform" />
                                            <span className="text-[7px] font-black uppercase tracking-widest text-white/60">Gallery</span>
                                        </button>
                                        <button onClick={() => {}} className="flex flex-col items-center gap-2 p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group">
                                            <FolderOpen className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                                            <span className="text-[7px] font-black uppercase tracking-widest text-white/60">Folder</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Modes Section */}
                                <div>
                                    <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 mb-4 px-2">Matrix Modes</h3>
                                    <div className="space-y-2">
                                        <button 
                                            onClick={() => setMode('thinking')}
                                            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${mode === 'thinking' ? 'bg-indigo-500/20 border-indigo-500 text-white' : 'bg-white/5 border-white/5 text-white/40'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Brain className="w-4 h-4" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Thinking Mode</span>
                                            </div>
                                            {mode === 'thinking' && <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />}
                                        </button>
                                        <button 
                                            onClick={() => setMode('pro')}
                                            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${mode === 'pro' ? 'bg-purple-500/20 border-purple-500 text-white' : 'bg-white/5 border-white/5 text-white/40'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Zap className="w-4 h-4" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Neural Pro</span>
                                            </div>
                                            {mode === 'pro' && <div className="w-1 h-1 rounded-full bg-purple-500 animate-pulse" />}
                                        </button>
                                        <button 
                                            onClick={() => setMode('research')}
                                            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${mode === 'research' ? 'bg-emerald-500/20 border-emerald-500 text-white' : 'bg-white/5 border-white/5 text-white/40'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Search className="w-4 h-4" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Research Matrix</span>
                                            </div>
                                            {mode === 'research' && <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={handleSaveMenu}
                                className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all"
                            >
                                <Save className="w-4 h-4" />
                                Secure Settings
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageSelect} 
                    accept="image/*" 
                    className="hidden" 
                />
            </div>
        </div>
    );
};


export default ChatInput;