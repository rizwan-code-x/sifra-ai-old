import React, { useState, useRef, useEffect, useCallback } from 'react';
import { UserProfile, Message, Role, View } from '../types';
import { 
    Send, 
    ArrowLeft, 
    Sparkles, 
    Copy, 
    Check, 
    RefreshCw, 
    ThumbsUp, 
    ThumbsDown, 
    Volume2, 
    VolumeX, 
    Trash2, 
    Mic, 
    Paperclip, 
    X,
    Bot,
    User,
    Brain,
    Clock,
    Tag,
    ChevronRight,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    loadStoredContextSummary, 
    clearStoredContextSummary, 
    shouldAutoSummarize, 
    summarizeChatConversation, 
    ContextSummaryData 
} from '../services/chatMemoryService';

interface SifraChatViewProps {
    userProfile: UserProfile;
    chatHistory: Message[];
    setChatHistory: (history: Message[] | ((prev: Message[]) => Message[])) => void;
    onClose: () => void;
    onNavigate: (view: View) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    playAudio?: (text: string, messageId: string) => void;
    currentlyPlayingAudioId?: string | null;
    onSendMessage?: (text: string, imageData?: { data: string, mimeType: string }) => Promise<void>;
    onUserProfileChange?: (profile: UserProfile) => void;
}

const SUGGESTION_PROMPTS = [
    { title: 'Explain Quantum Computing', prompt: 'Explain quantum computing in simple terms with everyday examples.', tag: 'Science' },
    { title: 'Python Streaming Script', prompt: 'Write a modern Python script for asynchronous real-time WebSocket streaming.', tag: 'Coding' },
    { title: 'বাংলায় অনুপ্রেরণামূলক কথা', prompt: 'আমাকে আজকের দিনের জন্য অনুপ্রেরণামূলক ও সুন্দর কিছু কথা বাংলায় বলুন।', tag: 'বাংলা' },
    { title: 'Boost Daily Productivity', prompt: 'What are the top 3 high-impact systems for 10x personal productivity?', tag: 'Work' }
];

export const SifraChatView: React.FC<SifraChatViewProps> = ({
    userProfile,
    chatHistory,
    setChatHistory,
    onClose,
    onNavigate,
    isLoading,
    setIsLoading,
    playAudio,
    currentlyPlayingAudioId,
}) => {
    const [inputPrompt, setInputPrompt] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [reactions, setReactions] = useState<Record<string, 'up' | 'down'>>({});
    const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string; preview: string } | null>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamingText, setStreamingText] = useState('');

    // Persistent Context Summary State
    const [contextSummary, setContextSummary] = useState<ContextSummaryData | null>(() => 
        loadStoredContextSummary(userProfile?.id)
    );
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [copiedSummary, setCopiedSummary] = useState(false);
    const [summaryNotification, setSummaryNotification] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const abortCtrlRef = useRef<AbortController | null>(null);

    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, streamingText, isStreaming]);

    // Periodically summarizes long chat conversations and saves them to localStorage
    const triggerSummary = useCallback(async (messagesToSummarize: Message[], isManual: boolean = false) => {
        if (!messagesToSummarize || messagesToSummarize.length < 4 || isSummarizing) return;
        setIsSummarizing(true);
        try {
            const result = await summarizeChatConversation(
                messagesToSummarize, 
                contextSummary?.summary, 
                userProfile?.id
            );
            if (result) {
                setContextSummary(result);
                setSummaryNotification(
                    isManual ? 'Context summary manually updated.' : 'Context summary periodically consolidated.'
                );
                setTimeout(() => setSummaryNotification(null), 4000);
            }
        } catch (e) {
            console.error('Failed to summarize conversation:', e);
        } finally {
            setIsSummarizing(false);
        }
    }, [contextSummary?.summary, isSummarizing, userProfile?.id]);

    // Automatic periodic check: Trigger summarization when threshold is reached
    useEffect(() => {
        if (chatHistory.length >= 6 && !isSummarizing && !isLoading && !isStreaming) {
            const lastCount = contextSummary?.lastSummarizedMessageCount || 0;
            if (shouldAutoSummarize(chatHistory.length, lastCount, 6)) {
                triggerSummary(chatHistory, false);
            }
        }
    }, [chatHistory, isSummarizing, isLoading, isStreaming, contextSummary?.lastSummarizedMessageCount, triggerSummary]);

    // Copy text to clipboard helper
    const handleCopy = async (text: string, id: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (e) {
            console.error('Failed to copy text', e);
        }
    };

    // Image Upload Handler
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            setSelectedImage({
                data: base64,
                mimeType: file.type,
                preview: result
            });
        };
        reader.readAsDataURL(file);
    };

    // Send Message with dynamic SSE Streaming from /api/chat
    const handleSend = async (customPrompt?: string) => {
        const textToSend = (customPrompt || inputPrompt).trim();
        if ((!textToSend && !selectedImage) || isLoading || isStreaming) return;

        const userMsgId = `user-${Date.now()}`;
        const parts: any[] = [];
        if (textToSend) parts.push({ text: textToSend });
        if (selectedImage) {
            parts.push({
                inlineData: {
                    mimeType: selectedImage.mimeType,
                    data: selectedImage.data
                }
            });
        }

        const newUserMessage: Message = {
            messageId: userMsgId,
            role: Role.USER,
            parts
        };

        const updatedHistory = [...chatHistory, newUserMessage];
        setChatHistory(updatedHistory);
        setInputPrompt('');
        const activeImage = selectedImage;
        setSelectedImage(null);

        setIsLoading(true);
        setIsStreaming(true);
        setStreamingText('');

        abortCtrlRef.current = new AbortController();

        try {
            // Call the /api/chat streaming route
            const historyPayload = chatHistory.map(m => ({
                role: m.role === Role.USER ? 'user' : 'model',
                content: m.parts.map(p => p.text || '').join(' ')
            }));

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: textToSend,
                    history: historyPayload,
                    stream: true,
                    systemInstruction: `You are SIFRA AI, an ultra-modern, elite digital intelligence. Current user: ${userProfile?.name || 'Rizwan'}. Tone: crisp, sophisticated, insightful, and helpful. Always format responses cleanly with markdown.`
                }),
                signal: abortCtrlRef.current.signal
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let accumulatedReply = '';

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const dataStr = line.replace('data: ', '').trim();
                            if (dataStr === '[DONE]') continue;
                            try {
                                const parsed = JSON.parse(dataStr);
                                if (parsed.text) {
                                    accumulatedReply += parsed.text;
                                    setStreamingText(accumulatedReply);
                                }
                            } catch (e) {
                                // plain text or non-json chunk
                                if (dataStr && dataStr !== '[DONE]') {
                                    accumulatedReply += dataStr;
                                    setStreamingText(accumulatedReply);
                                }
                            }
                        }
                    }
                }
            }

            // Save completed message
            const finalAiText = accumulatedReply.trim() || 'I apologize, but I could not formulate a response.';
            const modelMsgId = `model-${Date.now()}`;
            const newModelMessage: Message = {
                messageId: modelMsgId,
                role: Role.MODEL,
                parts: [{ text: finalAiText }]
            };

            setChatHistory([...updatedHistory, newModelMessage]);
            setStreamingText('');
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                console.error('Chat error:', err);
                const errorMsgId = `err-${Date.now()}`;
                setChatHistory([
                    ...updatedHistory,
                    {
                        messageId: errorMsgId,
                        role: Role.MODEL,
                        parts: [{ text: 'আমি সংযোগ স্থাপনে সমস্যা অনুভব করছি। অনুগ্রহ করে আবার চেষ্টা করুন।' }]
                    }
                ]);
            }
        } finally {
            setIsLoading(false);
            setIsStreaming(false);
            setStreamingText('');
        }
    };

    // Regenerate last response
    const handleRegenerate = () => {
        if (chatHistory.length === 0 || isLoading || isStreaming) return;
        const lastUserMsg = [...chatHistory].reverse().find(m => m.role === Role.USER);
        if (lastUserMsg) {
            const promptText = lastUserMsg.parts.map(p => p.text || '').join(' ');
            // Remove last model message if present
            const pruned = chatHistory.filter((_, idx) => idx !== chatHistory.length - 1 || chatHistory[chatHistory.length - 1].role !== Role.MODEL);
            setChatHistory(pruned);
            handleSend(promptText);
        }
    };

    // Clear History
    const handleClearChat = () => {
        if (window.confirm('Do you want to reset and clear the current chat history?')) {
            setChatHistory([]);
            setStreamingText('');
        }
    };

    // Voice Read-aloud
    const handlePlayAudio = (text: string, id: string) => {
        if (playAudio) {
            playAudio(text, id);
        } else if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text.replace(/[*#_`~>]/g, ''));
            const isBn = /[\u0980-\u09FF]/.test(text);
            utterance.lang = isBn ? 'bn-BD' : 'en-US';
            utterance.rate = 1.0;
            window.speechSynthesis.speak(utterance);
        }
    };

    // Parse simple markdown formatting: bold, italic, inline code, bullet points
    const renderMarkdown = (content: string) => {
        const paragraphs = content.split('\n');
        return paragraphs.map((para, pIdx) => {
            if (!para.trim()) {
                return <div key={pIdx} className="h-2" />;
            }

            // Bullet list items
            if (para.startsWith('- ') || para.startsWith('* ')) {
                return (
                    <li key={pIdx} className="ml-4 list-disc text-sm leading-relaxed my-0.5">
                        {renderInlineFormatting(para.substring(2))}
                    </li>
                );
            }

            // Numbered list items
            const numMatch = para.match(/^(\d+)\.\s(.*)/);
            if (numMatch) {
                return (
                    <div key={pIdx} className="flex gap-2 text-sm leading-relaxed my-0.5">
                        <span className="font-bold text-cyan-400 shrink-0">{numMatch[1]}.</span>
                        <div>{renderInlineFormatting(numMatch[2])}</div>
                    </div>
                );
            }

            // Code block lines or quotes
            if (para.startsWith('> ')) {
                return (
                    <blockquote key={pIdx} className="border-l-2 border-cyan-400 pl-3 my-1.5 text-xs text-cyan-200/90 italic">
                        {renderInlineFormatting(para.substring(2))}
                    </blockquote>
                );
            }

            return (
                <p key={pIdx} className="text-sm leading-relaxed my-1">
                    {renderInlineFormatting(para)}
                </p>
            );
        });
    };

    // Inline formatting: **bold**, `code`, *italic*
    const renderInlineFormatting = (text: string) => {
        const parts: React.ReactNode[] = [];
        let remaining = text;
        let key = 0;

        while (remaining.length > 0) {
            // Bold **text**
            const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
            // Inline code `code`
            const codeMatch = remaining.match(/`([^`]+)`/);

            const matches = [
                boldMatch ? { type: 'bold', index: boldMatch.index!, match: boldMatch } : null,
                codeMatch ? { type: 'code', index: codeMatch.index!, match: codeMatch } : null,
            ].filter(Boolean).sort((a, b) => a!.index - b!.index);

            if (matches.length === 0) {
                parts.push(remaining);
                break;
            }

            const first = matches[0]!;
            if (first.index > 0) {
                parts.push(remaining.substring(0, first.index));
            }

            if (first.type === 'bold') {
                parts.push(
                    <strong key={key++} className="font-bold text-cyan-300">
                        {first.match[1]}
                    </strong>
                );
                remaining = remaining.substring(first.index + first.match[0].length);
            } else if (first.type === 'code') {
                parts.push(
                    <code key={key++} className="px-1.5 py-0.5 rounded-md bg-white/10 font-mono text-xs text-amber-300 border border-white/10">
                        {first.match[1]}
                    </code>
                );
                remaining = remaining.substring(first.index + first.match[0].length);
            }
        }

        return parts;
    };

    return (
        <div className="fixed inset-0 z-[250] flex flex-col font-sans bg-[#020617] text-white overflow-hidden select-none">
            {/* Background Ambient Glows (Glassmorphism Environment) */}
            <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[160px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[10%] w-[450px] h-[450px] bg-cyan-600/15 rounded-full blur-[150px] pointer-events-none" />

            {/* Top Navigation Bar */}
            <header className="px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-white/10 bg-[#020617]/70 backdrop-blur-2xl z-30 shrink-0">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/80 active:scale-95 hover:bg-white/10 transition-all shadow-sm"
                        title="ফিরে যান (Back)"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-2.5">
                        <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1.5px] shadow-sm">
                            <div className="w-full h-full rounded-full bg-[#070d24] flex items-center justify-center">
                                <Bot className="w-4 h-4 text-cyan-300" />
                            </div>
                            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-[#020617]" />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <h1 className="text-xs sm:text-sm font-black tracking-tight text-white">Sifra Chat</h1>
                                <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[8px] font-black uppercase tracking-wider border border-cyan-400/30">
                                    AI v2.5
                                </span>
                            </div>
                            <p className="text-[10px] text-white/40">Neural Conversational Intelligence</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Clear Chat Button */}
                    {chatHistory.length > 0 && (
                        <button
                            onClick={handleClearChat}
                            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                            title="Reset Chat"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}

                    {/* Galaxy Voice Shortcut */}
                    <button
                        onClick={() => onNavigate(View.GALAXY_VOICE)}
                        className="px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                        title="Voice Mode"
                    >
                        <Mic className="w-3 h-3" />
                        <span className="hidden sm:inline">Voice Assistant</span>
                    </button>
                </div>
            </header>

            {/* Main Chat Scroll Area */}
            <div className="flex-1 overflow-y-auto premium-scroll px-4 sm:px-6 py-4 flex flex-col gap-4 relative z-10">
                {/* Empty State / Welcome Screen with Suggestions */}
                {chatHistory.length === 0 && !isStreaming && (
                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="my-auto max-w-xl mx-auto w-full text-center flex flex-col items-center gap-4 py-8"
                    >
                        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-indigo-600/30 border border-cyan-400/30 flex items-center justify-center shadow-[0_0_35px_rgba(6,182,212,0.25)]">
                            <Sparkles className="w-8 h-8 text-cyan-300" />
                        </div>

                        <div>
                            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                                How can <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-400">Sifra AI</span> assist you?
                            </h2>
                            <p className="text-xs sm:text-sm text-white/50 mt-1 max-w-md mx-auto">
                                Ask questions, write complex code, explore ideas, or converse naturally in Bengali, English, and Hindi.
                            </p>
                        </div>

                        {/* Quick Prompts Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full mt-4 text-left">
                            {SUGGESTION_PROMPTS.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSend(item.prompt)}
                                    className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-400/40 transition-all flex flex-col gap-1 active:scale-[0.98] group shadow-sm text-left"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-white group-hover:text-cyan-200 transition-colors">
                                            {item.title}
                                        </span>
                                        <span className="text-[9px] font-black uppercase tracking-wider text-cyan-400/70 bg-cyan-400/10 px-1.5 py-0.5 rounded-full">
                                            {item.tag}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-white/40 line-clamp-1">{item.prompt}</p>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Render Conversation Messages */}
                {chatHistory.map((msg, index) => {
                    const isUser = msg.role === Role.USER;
                    const contentText = msg.parts.map(p => p.text || '').join(' ');
                    const imagePart = msg.parts.find(p => p.inlineData);

                    return (
                        <motion.div
                            key={msg.messageId || index}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`flex gap-3 max-w-2xl w-full ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
                        >
                            {/* AI Avatar for model messages */}
                            {!isUser && (
                                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1px] shrink-0 mt-0.5 shadow-sm">
                                    <div className="w-full h-full rounded-full bg-[#080e22] flex items-center justify-center">
                                        <Bot className="w-3.5 h-3.5 text-cyan-300" />
                                    </div>
                                </div>
                            )}

                            {/* Message Bubble Card */}
                            <div className={`flex flex-col gap-1.5 max-w-[85%] sm:max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                                <div
                                    className={`p-3.5 sm:p-4 rounded-3xl text-xs sm:text-sm leading-relaxed backdrop-blur-xl shadow-lg transition-all ${
                                        isUser
                                            ? 'bg-gradient-to-r from-cyan-600/30 to-indigo-600/40 border border-cyan-400/40 text-cyan-50 rounded-tr-sm'
                                            : 'bg-white/[0.04] border border-white/10 text-white/90 rounded-tl-sm hover:border-white/20'
                                    }`}
                                >
                                    {/* Image Attachment Preview */}
                                    {imagePart && (
                                        <div className="mb-2.5 rounded-2xl overflow-hidden border border-white/10 max-w-xs">
                                            <img
                                                src={`data:${imagePart.inlineData?.mimeType};base64,${imagePart.inlineData?.data}`}
                                                alt="Attachment"
                                                className="w-full h-auto max-h-48 object-cover"
                                            />
                                        </div>
                                    )}

                                    {/* Text Body */}
                                    {isUser ? (
                                        <p className="whitespace-pre-wrap">{contentText}</p>
                                    ) : (
                                        <div className="prose prose-invert max-w-none">
                                            {renderMarkdown(contentText)}
                                        </div>
                                    )}
                                </div>

                                {/* AI Action Bar (Copy, TTS, Feedback) */}
                                {!isUser && (
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 text-white/40 text-[10px]">
                                        {/* Copy Button */}
                                        <button
                                            onClick={() => handleCopy(contentText, msg.messageId)}
                                            className="p-1 hover:text-white rounded-lg hover:bg-white/5 transition-all"
                                            title="Copy message"
                                        >
                                            {copiedId === msg.messageId ? (
                                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                            ) : (
                                                <Copy className="w-3.5 h-3.5" />
                                            )}
                                        </button>

                                        {/* Voice Playback */}
                                        <button
                                            onClick={() => handlePlayAudio(contentText, msg.messageId)}
                                            className="p-1 hover:text-white rounded-lg hover:bg-white/5 transition-all"
                                            title="Read Aloud"
                                        >
                                            {currentlyPlayingAudioId === msg.messageId ? (
                                                <VolumeX className="w-3.5 h-3.5 text-cyan-300" />
                                            ) : (
                                                <Volume2 className="w-3.5 h-3.5" />
                                            )}
                                        </button>

                                        {/* Thumbs Up */}
                                        <button
                                            onClick={() => setReactions(prev => ({ ...prev, [msg.messageId]: 'up' }))}
                                            className={`p-1 rounded-lg hover:bg-white/5 transition-all ${
                                                reactions[msg.messageId] === 'up' ? 'text-emerald-400' : 'hover:text-white'
                                            }`}
                                            title="Good response"
                                        >
                                            <ThumbsUp className="w-3.5 h-3.5" />
                                        </button>

                                        {/* Thumbs Down */}
                                        <button
                                            onClick={() => setReactions(prev => ({ ...prev, [msg.messageId]: 'down' }))}
                                            className={`p-1 rounded-lg hover:bg-white/5 transition-all ${
                                                reactions[msg.messageId] === 'down' ? 'text-rose-400' : 'hover:text-white'
                                            }`}
                                            title="Poor response"
                                        >
                                            <ThumbsDown className="w-3.5 h-3.5" />
                                        </button>

                                        {/* Regenerate if last message */}
                                        {index === chatHistory.length - 1 && (
                                            <button
                                                onClick={handleRegenerate}
                                                className="p-1 hover:text-white rounded-lg hover:bg-white/5 transition-all ml-1"
                                                title="Regenerate response"
                                            >
                                                <RefreshCw className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* User Avatar */}
                            {isUser && (
                                <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-400/40 p-[1px] shrink-0 mt-0.5 shadow-sm flex items-center justify-center">
                                    <User className="w-3.5 h-3.5 text-cyan-300" />
                                </div>
                            )}
                        </motion.div>
                    );
                })}

                {/* 🌟 Real-Time Streaming Output Bubble 🌟 */}
                {isStreaming && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3 max-w-2xl w-full mr-auto justify-start"
                    >
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1px] shrink-0 mt-0.5 shadow-sm">
                            <div className="w-full h-full rounded-full bg-[#080e22] flex items-center justify-center">
                                <Bot className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5 max-w-[85%] sm:max-w-[80%] items-start">
                            <div className="p-3.5 sm:p-4 rounded-3xl text-xs sm:text-sm leading-relaxed backdrop-blur-xl shadow-lg bg-white/[0.04] border border-cyan-500/30 text-white/90 rounded-tl-sm">
                                {streamingText ? (
                                    <div className="prose prose-invert max-w-none">
                                        {renderMarkdown(streamingText)}
                                        <span className="inline-block w-1.5 h-3.5 ml-1 bg-cyan-400 animate-pulse align-middle" />
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-cyan-300 py-1">
                                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                                        <span className="text-xs font-semibold">Sifra AI চিন্তা করছে...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Bottom Input Area (Glassmorphism Dock) */}
            <footer className="p-3 sm:p-4 border-t border-white/10 bg-[#020617]/85 backdrop-blur-2xl z-30 shrink-0">
                <div className="max-w-2xl mx-auto flex flex-col gap-2">
                    {/* Image Attachment Preview Pill */}
                    <AnimatePresence>
                        {selectedImage && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="flex items-center gap-2 p-1.5 pl-2.5 rounded-2xl bg-white/5 border border-cyan-500/30 w-fit"
                            >
                                <img
                                    src={selectedImage.preview}
                                    alt="Selected"
                                    className="w-7 h-7 object-cover rounded-lg"
                                />
                                <span className="text-[11px] text-white/70">Image attached</span>
                                <button
                                    onClick={() => setSelectedImage(null)}
                                    className="p-1 rounded-full hover:bg-white/10 text-white/50 hover:text-white"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Input Form */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSend();
                        }}
                        className="flex items-center gap-2 bg-white/[0.04] border border-white/10 focus-within:border-cyan-400/50 rounded-2xl p-1.5 transition-all shadow-inner"
                    >
                        {/* Hidden File Input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                            className="hidden"
                        />

                        {/* Attach Image Button */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2.5 rounded-xl hover:bg-white/10 text-white/40 hover:text-white active:scale-95 transition-all"
                            title="Attach Image"
                        >
                            <Paperclip className="w-4 h-4" />
                        </button>

                        {/* Text Input */}
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputPrompt}
                            onChange={(e) => setInputPrompt(e.target.value)}
                            placeholder="Message Sifra AI..."
                            className="flex-1 bg-transparent py-2 px-1 text-xs sm:text-sm text-white placeholder:text-white/30 outline-none"
                            disabled={isLoading || isStreaming}
                        />

                        {/* Voice Assistant Shortcut */}
                        <button
                            type="button"
                            onClick={() => onNavigate(View.GALAXY_VOICE)}
                            className="p-2.5 rounded-xl hover:bg-white/10 text-white/40 hover:text-cyan-300 active:scale-95 transition-all"
                            title="Open Voice Assistant"
                        >
                            <Mic className="w-4 h-4" />
                        </button>

                        {/* Send Button */}
                        <button
                            type="submit"
                            disabled={(!inputPrompt.trim() && !selectedImage) || isLoading || isStreaming}
                            className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-bold flex items-center justify-center active:scale-95 disabled:opacity-30 disabled:scale-100 transition-all shadow-md shrink-0"
                            title="Send Message"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>

                    <div className="flex items-center justify-between px-1 text-[9px] text-white/30">
                        <span>Sifra AI may occasionally generate inaccurate information.</span>
                        <span>Gemini 2.5 Flash</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default SifraChatView;
