
import React, { useState } from 'react';
import { Message, Role } from '../types';
import Avatar from './Avatar';
import { Play, Square, Share2, RefreshCw, Edit3, MoreHorizontal, Download, Star, Loader2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SifraLiveLogo from './SifraLiveLogo';

interface ChatMessageProps {
    message: Message;
    isPlayingAudio: boolean;
    onReplayAudio: (text: string, messageId: string) => void;
    userAvatar: string | null;
    userName: string | null;
    sifraAvatarUrl: string;
    isLoading: boolean;
    isLastMessage: boolean;
    onSendMessage?: (text: string) => void;
}

const renderParsedText = (text: string) => {
    // We split by <<YELLOW>>...<</YELLOW>> and <<BLUE>>...<</BLUE>>
    const regex = /<<(YELLOW|BLUE)>>(.*?)<\/\1>>/gs;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            elements.push(<span key={lastIndex}>{text.substring(lastIndex, match.index)}</span>);
        }
        const isYellow = match[1] === 'YELLOW';
        elements.push(
            <span key={match.index} className={`font-bold ${isYellow ? 'text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20' : 'text-blue-600 bg-blue-500/10 px-1.5 py-0.5 rounded-md border border-blue-500/20'}`}>
                {match[2]}
            </span>
        );
        lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
        elements.push(<span key={lastIndex}>{text.substring(lastIndex)}</span>);
    }
    return elements;
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isPlayingAudio, onReplayAudio, userAvatar, userName, sifraAvatarUrl, isLoading, isLastMessage, onSendMessage }) => {
    const isModel = message.role === Role.MODEL;
    const [showMenu, setShowMenu] = useState(false);
    const [isPreloading, setIsPreloading] = useState(false);
    const [showReloadPrompt, setShowReloadPrompt] = useState(false);
    const [reloadReason, setReloadReason] = useState('');
    const [editMode, setEditMode] = useState(false);
    
    // User asked for purple background and black text, with smaller and professional font weight
    const messageBg = isModel ? 'bg-purple-200 shadow-md border border-purple-300/50' : 'bg-white shadow-sm border border-gray-100';
    const textColor = isModel ? 'text-gray-800 font-normal leading-[1.6]' : 'text-gray-800 font-medium';
    const alignment = isModel ? 'justify-start' : 'justify-end';
    const borderRadius = isModel ? 'rounded-[2rem] rounded-tl-xl' : 'rounded-[2rem] rounded-tr-xl';
    
    // Thinking indicator for empty model responses
    const showThinkingIndicator = isModel && isLoading && isLastMessage && (!message.parts[0]?.text || message.parts[0].text.length === 0);
    const showTypingCursor = isModel && isLoading && isLastMessage && (message.parts[0]?.text && message.parts[0].text.length > 0);

    const handleVoiceClick = () => {
        if (isPlayingAudio) {
             onReplayAudio('STOP_AUDIO', message.messageId); 
        } else {
             setIsPreloading(true);
             setTimeout(() => {
                 setIsPreloading(false);
                 const text = message.parts.find(p => p.text)?.text || '';
                 onReplayAudio(text, message.messageId);
             }, 5000);
        }
    };

    const handleShare = async () => {
        const text = message.parts.find(p => p.text)?.text || '';
        if (navigator.share) {
            try {
                await navigator.share({ title: 'Sifra Chat', text: text });
            } catch (err) {}
        }
    };

    const handleReloadSend = () => {
        if (reloadReason.trim() && onSendMessage) {
            onSendMessage(`RELOAD CONTEXT: ${reloadReason.trim()}`);
            setShowReloadPrompt(false);
            setReloadReason('');
        }
    };
    
    const handleDownloadAudio = async () => {
        // Mock download by fetching blob (in reality we use TTS logic)
        alert('Downloading voice...');
        setShowMenu(false);
    };

    return (
        <motion.div
            layout
            initial={{ 
                opacity: 0, 
                y: 18, 
                x: isModel ? -14 : 14,
                scale: 0.98 
            }}
            animate={{ 
                opacity: 1, 
                y: 0, 
                x: 0,
                scale: 1 
            }}
            transition={{ 
                type: "spring",
                damping: 25,
                stiffness: 350,
                mass: 0.7,
                opacity: { duration: 0.32, ease: "easeOut" }
            }}
            className={`flex ${alignment} w-full`}
        >
            <div className={`flex flex-col gap-2 max-w-[90%] md:max-w-2xl ${isModel ? 'items-start' : 'items-end'}`}>
                 <div className={`flex items-end gap-3 ${isModel ? 'flex-row' : 'flex-row-reverse'}`}>
                     {isModel ? (
                        <div className="mb-2">
                             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-black to-[#201040] shadow-[0_0_10px_purple] flex items-center justify-center relative p-1 border border-white/10">
                                 <SifraLiveLogo size="sm" loop={true} />
                                 <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_#34d399]" />
                             </div>
                        </div>
                     ) : (
                        <div className="mb-2"><Avatar src={userAvatar} initials={userName || 'U'} /></div>
                     )}
                     
                     <div className="flex flex-col relative group">
                        {isModel && message.parts.some(p => p.text) && (
                            <div className="flex items-center gap-2 mb-1.5 ml-2">
                                <button
                                    onClick={handleVoiceClick}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-full transition-all"
                                >
                                    {isPreloading ? (
                                        <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                                    ) : isPlayingAudio ? (
                                        <Square className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
                                    ) : (
                                        <Play className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
                                    )}
                                    <span className="text-[9px] font-black uppercase tracking-widest text-indigo-300">
                                        {isPreloading ? 'Loading Node...' : isPlayingAudio ? 'Playing' : 'Audio Read'}
                                    </span>
                                </button>
                                {isPreloading && <div className="text-[8px] font-black tracking-widest uppercase text-pink-400 animate-pulse">Max Bandwidth Use</div>}
                            </div>
                        )}

                        <div className={`leading-relaxed p-5 ${messageBg} ${borderRadius} shadow-lg relative min-w-[120px]`}>
                            {message.parts.map((part, pIdx) => (
                                <React.Fragment key={pIdx}>
                                    {part.inlineData && (
                                        <div className="mb-3">
                                            <img 
                                                src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`} 
                                                alt="Sent content" 
                                                className="max-w-full rounded-2xl shadow-sm border border-black/10"
                                            />
                                        </div>
                                    )}
                                    {part.text && (
                                        <div className={`text-[13px] ${textColor} whitespace-pre-wrap space-y-3`}>
                                            {isModel ? renderParsedText(part.text) : part.text}
                                            {showTypingCursor && pIdx === message.parts.length - 1 && (
                                                <span className="inline-block w-1.5 h-4 bg-purple-600 ml-1.5 animate-pulse rounded-full"></span>
                                            )}
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                            {showThinkingIndicator && (
                                 <div className="flex items-center gap-1.5 py-1">
                                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            )}
                        </div>

                        {/* Bottom Actions for Model */}
                        {isModel && !showThinkingIndicator && !showTypingCursor && (
                            <div className="flex flex-col mt-2 ml-2 gap-2">
                                <div className="flex items-center gap-2">
                                    <button onClick={handleShare} className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/50 hover:text-white transition-all">
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setShowReloadPrompt(!showReloadPrompt)} className={`p-2 rounded-full border transition-all ${showReloadPrompt ? 'bg-white/10 border-white/20 text-white' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'}`}>
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setEditMode(true)} className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/50 hover:text-white transition-all relative">
                                        <Edit3 className="w-4 h-4" />
                                        {editMode && (
                                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-[9px] text-white font-bold rounded shadow-xl whitespace-nowrap text-xs">
                                                Coming soon
                                            </span>
                                        )}
                                    </button>
                                    
                                    <div className="relative">
                                        <button 
                                            onClick={() => setShowMenu(!showMenu)}
                                            className={`p-2 rounded-full border transition-all ${showMenu ? 'bg-white/10 border-white/20 text-white' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'}`}
                                        >
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>

                                        <AnimatePresence>
                                            {showMenu && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                                    className="absolute left-0 bottom-full mb-2 w-48 bg-[#1A1B23] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                                                >
                                                    <div className="p-1">
                                                        <button onClick={handleDownloadAudio} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-colors text-xs font-bold">
                                                            <Download className="w-4 h-4 text-indigo-400" />
                                                            Download Voice
                                                        </button>
                                                        <div className="h-px bg-white/5 my-1 mx-2" />
                                                        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-colors text-xs font-bold">
                                                            <Star className="w-4 h-4 text-amber-400" />
                                                            Rate Quality
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                                
                                <AnimatePresence>
                                    {showReloadPrompt && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="flex border border-white/10 bg-black/40 rounded-2xl p-1 mt-1 max-w-sm backdrop-blur-md">
                                                <input 
                                                    type="text"
                                                    value={reloadReason}
                                                    onChange={e => setReloadReason(e.target.value)}
                                                    placeholder="কেমন পারপাসে চাই? (৫০ শব্দের মধ্যে)"
                                                    className="flex-1 bg-transparent px-3 py-2 outline-none text-xs text-white"
                                                    maxLength={300}
                                                    onKeyDown={e => e.key === 'Enter' && handleReloadSend()}
                                                />
                                                <button onClick={handleReloadSend} className="px-3 py-2 bg-indigo-500 rounded-xl text-white hover:bg-indigo-600 transition-colors">
                                                    <Send className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                     </div>
                 </div>
            </div>
        </motion.div>
    );
};

export default React.memo(ChatMessage);