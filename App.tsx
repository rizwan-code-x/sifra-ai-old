import ProjectsView from './views/ProjectsView';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { AppFlow, View, UserProfile, THEMES, SIFRA_AVATARS, Message, Role, Mood, AdminSettings, CommunityPost } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { AnimatePresence, motion } from 'framer-motion';
import { MOCK_POSTS } from './constants';

// Import Services & Utils
import { generateSpeech } from './services/geminiService';
import { decode, decodeAudioData } from './utils/audioUtils';

// Import Views
import SplashView from './views/SplashView';
import HomeView from './views/HomeView';
import ProfileView from './views/ProfileView';
import ProfileModal from './components/ProfileModal';
import HistoryView from './views/HistoryView';
import GalaxyVoiceView from './views/GalaxyVoiceView';
import YourCardView from './views/YourCardView';
import AccountDetailsView from './views/AccountDetailsView';
import MeetSifraView from './views/MeetSifraView';
import GreetingsView from './views/GreetingsView';
import SifraToolsView from './views/SifraToolsView';
import PersonalCalendarView from './views/PersonalCalendarView';
import SifraClockView from './views/SifraClockView';
import SifraRecorderView from './views/SifraRecorderView';
import SifraCalculatorView from './views/SifraCalculatorView';
import SifraMusicView from './views/SifraMusicView';
import SifraBrowserView from './views/SifraBrowserView';
import SifraShareView from './views/SifraShareView';
import SifraInsightsView from './views/SifraInsightsView';
import SifraIdentityView from './views/SifraIdentityView';
import SifraChatView from './views/SifraChatView';
import DualModeView from './views/DualModeView';
import MonerDanaView from './views/MonerDanaView';
import SifraSaveView from './views/SifraSaveView';
import QuantumLeapView from './views/QuantumLeapView';
import DiaryEditorView from './views/DiaryEditorView';
import TutorView from './views/TutorView';
import TravelGuideView from './views/TravelGuideView';
import LibraryView from './views/LibraryView';
import TXOnView from './views/TXOnView';
import DatabaseView from './views/DatabaseView';
import PoliciesView from './views/PoliciesView';
import CallsSifraView from './views/CallsSifraView';
import PlanView from './views/PlanView';
import AccountView from './views/AccountView';
import SettingsView from './views/SettingsView';
import CommunityView from './views/CommunityView';
import VoiceAssistantView from './views/VoiceAssistantView';
import FreeHandModeView from './views/FreeHandModeView';
import SifraVaultView from './views/SifraVaultView';
import VoiceStudioView from './views/VoiceStudioView';
import DailyTaskView from './views/DailyTaskView';
import WeatherView from './views/WeatherView';
import MapsView from './views/MapsView';

// Import Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import ArrowLeftIcon from './components/icons/ArrowLeftIcon';
import Avatar from './components/Avatar';
import SifraQueenAnimation from './components/SifraQueenAnimation';
import BottomNavbar from './components/BottomNavbar';
import SifraLoader from './components/SifraLoader';
import SignalIcon from './components/icons/SignalIcon';
import WifiSlashIcon from './components/icons/WifiSlashIcon';

// Import Hooks
import { useWakeWord } from './hooks/useWakeWord';

import { logAppActivity } from './utils/history';

export const getActiveApiKey = (): string | undefined => {
    let apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    try {
        const adminSettingsStr = localStorage.getItem('sifra_admin_settings');
        if (adminSettingsStr) {
            const adminSettings = JSON.parse(adminSettingsStr);
            const activeKey = adminSettings.apiKeys?.find((k: any) => k.isActive)?.key;
            if (activeKey) {
                apiKey = activeKey;
            }
        }
    } catch (e) {}
    return apiKey;
};

const DEFAULT_USER: UserProfile = {
    userId: 'SIFRA-01',
    name: 'Rizwan',
    nickname: 'Rizwan',
    email: 'rizwanroushan0@gmail.com',
    phoneNumber: '',
    location: '',
    bio: '',
    gender: 'Not Specified',
    avatar: null,
    themeId: 'dark-matrix',
    sifraAvatarId: 'cute',
    saveHistory: true,
    joinDate: new Date().toISOString(),
    status: 'active',
    lastLogin: new Date().toISOString(),
    moodAmbienceEnabled: true,
    planId: null
};

const App: React.FC = () => {
    const [allUsers, setAllUsers] = useLocalStorage<UserProfile[]>('sifra_all_users', [DEFAULT_USER]);
    const [currentUser, setCurrentUser] = useLocalStorage<UserProfile | null>('sifra_current_user', DEFAULT_USER);
    
    const [adminSettings, setAdminSettings] = useLocalStorage<AdminSettings>('sifra_admin_settings', {
        headerLighting: true,
        headerLightingType: 0,
        plans: [],
        apiKeys: [],
        featureFlags: {}
    });

    const [communityPosts, setCommunityPosts] = useLocalStorage<CommunityPost[]>('sifra_community_posts', MOCK_POSTS);

    const [appFlow, setAppFlow] = useState<AppFlow>(AppFlow.SPLASH);
    const [currentView, setCurrentView] = useState<View>(View.HOME);
    const [viewHistory, setViewHistory] = useState<View[]>([]);
    const [activeDiaryEntryId, setActiveDiaryEntryId] = useState<string | null>(null);
    const [browserInitialQuery, setBrowserInitialQuery] = useState<string | null>(null);
    const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);
    const lastScrollY = useRef(0);
    
    const [chatHistory, setChatHistory] = useLocalStorage<Message[]>(`sifra_chat_history_${currentUser?.userId || ''}`, []);
    const [sifraVoice, setSifraVoice] = useLocalStorage<string>(`sifra_voice_${currentUser?.userId || ''}`, 'Kore');

    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isQueenLockdown, setIsQueenLockdown] = useState(false);
    const theme = THEMES.find(t => t.id === currentUser?.themeId) || THEMES[3];
    const isDark = theme.id === 'dark-matrix';
    const [currentMood, setCurrentMood] = useState<Mood>('neutral');
    const [currentlyPlayingAudioId, setCurrentlyPlayingAudioId] = useState<string | null>(null);
    const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
    const [isAppActive, setIsAppActive] = useState(true);
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        if (!currentUser) {
            setCurrentUser(DEFAULT_USER);
        }
    }, [currentUser, setCurrentUser]);

    useEffect(() => {
        const handleVisibility = () => {
            setIsAppActive(!document.hidden);
        };
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        document.addEventListener("visibilitychange", handleVisibility);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibility);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Voice and Chat assistant features are completely deactivated as requested
    useWakeWord(() => {
        // Deactivated
    }, false);

    const handleSplashComplete = useCallback(() => {
        setAppFlow(AppFlow.MAIN_APP);
        setCurrentView(View.HOME);
    }, []);

    const chatRef = useRef<Chat | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            setViewHistory(prev => {
                if (prev.length > 0) {
                    const newHistory = [...prev];
                    const previousView = newHistory.pop()!;
                    setCurrentView(previousView);
                    return newHistory;
                } else {
                    setCurrentView(View.HOME);
                    return [];
                }
            });
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const handleNavigation = (view: View, params: any = null) => {
        if (view === currentView) return;

        if (view === View.DIARY_EDITOR) setActiveDiaryEntryId(params?.entryId || null);
        if (view === View.SIFRA_BROWSER) setBrowserInitialQuery(params?.searchQuery || null);
        
        // Log to Global App History for main modules
        if (
            [View.SIFRA_MUSIC, View.SIFRA_CALCULATOR, View.SIFRA_CLOCK, View.SIFRA_RECORDER, 
             View.SIFRA_BROWSER, View.TRAVEL_GUIDE, View.TX_ON, View.LIBRARY, View.DATABASE, 
             View.POLICIES, View.DIARY_EDITOR, View.DUAL_MODE, View.MONER_DANA,
             View.TUTOR, View.QUANTUM_LEAP, View.SIFRA_VAULT, View.VOICE_ASSISTANT, View.GALAXY_VOICE, View.CALLS_SIFRA].includes(view)
        ) {
            logAppActivity(
                view, 
                `Accessed ${View[view]?.replace(/_/g, ' ')}`, 
                'Navigated to feature module',
                params
            );
        }
        
        setViewHistory(prev => [...prev, currentView]);
        window.history.pushState({ view }, '', '');
        setCurrentView(view);
    };

    const handleBack = () => {
        if (viewHistory.length > 0) {
            window.history.back();
        } else if (currentView !== View.HOME) {
            setCurrentView(View.HOME);
            setViewHistory([]);
        } else {
            // Already at home, let the browser handle it (e.g. exit app)
            window.history.back();
        }
    };
    
    const handleLogout = () => {
        setCurrentUser(DEFAULT_USER);
        setChatHistory([]);
        setCurrentView(View.HOME);
    };

    const handleDeviceAction = (action: string, payload?: any) => {
        console.log(`Device Action Triggered: ${action}`, payload);
        // Simulate device action
        switch (action) {
            case 'WIFI_ON':
                alert("Simulating: Turning WiFi ON");
                break;
            case 'WIFI_OFF':
                alert("Simulating: Turning WiFi OFF");
                break;
            case 'FLASHLIGHT_ON':
                alert("Simulating: Turning Flashlight ON");
                break;
            case 'FLASHLIGHT_OFF':
                alert("Simulating: Turning Flashlight OFF");
                break;
            case 'OPEN_APP':
                alert(`Simulating: Opening App - ${payload}`);
                break;
            case 'BLUETOOTH_ON':
                alert("Simulating: Turning Bluetooth ON");
                break;
            case 'BLUETOOTH_OFF':
                alert("Simulating: Turning Bluetooth OFF");
                break;
            case 'SET_BRIGHTNESS':
                alert(`Simulating: Setting Brightness to ${payload}%`);
                break;
            case 'SET_VOLUME':
                alert(`Simulating: Setting Volume to ${payload}%`);
                break;
            case 'MAKE_CALL':
                alert(`Simulating: Making call to ${payload}`);
                break;
            case 'SEND_MESSAGE':
                alert(`Simulating: Sending message to ${payload}`);
                break;
            case 'OPEN_SETTINGS':
                alert("Simulating: Opening Settings");
                break;
            default:
                console.log("Unhandled action:", action);
        }
    };

    const handleUserProfileChange = (newProfile: UserProfile) => {
        setCurrentUser(newProfile);
        setAllUsers(users => users.map(u => u.userId === newProfile.userId ? newProfile : u));
    };

    useEffect(() => {
        if (currentView !== View.CHAT && audioSourceRef.current) {
            try { audioSourceRef.current.stop(); } catch(e) {}
            setCurrentlyPlayingAudioId(null);
            audioSourceRef.current = null;
        }
    }, [currentView]);

    const playAudio = useCallback(async (text: string, messageId: string) => {
        if (audioSourceRef.current) {
            try { audioSourceRef.current.stop(); } catch(e) {}
            audioSourceRef.current = null;
        }
        if (text === 'STOP_AUDIO') {
            setCurrentlyPlayingAudioId(null);
            return;
        }
        setCurrentlyPlayingAudioId(messageId);
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            const audioData = await generateSpeech(text, sifraVoice);
            if (audioData && audioContextRef.current) {
                const audioBuffer = await decodeAudioData(decode(audioData), audioContextRef.current, 24000, 1);
                const source = audioContextRef.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContextRef.current.destination);
                source.start();
                audioSourceRef.current = source;
                source.onended = () => { if (audioSourceRef.current === source) setCurrentlyPlayingAudioId(null); };
            }
        } catch (error) { setCurrentlyPlayingAudioId(null); }
    }, [sifraVoice]);

    useEffect(() => {
        if (chatHistory.length === 0) {
            chatRef.current = null;
        }
    }, [chatHistory]);

    const handleSendMessage = async (text: string, imageData?: { data: string, mimeType: string }) => {
        if ((!text.trim() && !imageData) || isLoading || !currentUser) return;
        
        const apiKey = getActiveApiKey();
        if (!apiKey) {
            setChatHistory([...chatHistory, { messageId: `err-${Date.now()}`, role: Role.MODEL, parts: [{ text: "API key is missing. Please configure it in the Admin Panel." }] }]);
            return;
        }

        const parts = [];
        if (text.trim()) parts.push({ text });
        if (imageData) parts.push({ inlineData: imageData });
        const userMessage: Message = { messageId: `msg-user-${Date.now()}`, role: Role.USER, parts };
        const currentChatHistory = [...chatHistory, userMessage];
        
        const modelMessageId = `msg-model-${Date.now()}`;
        let preliminaryText = "";
        
        if (text.trim().length > 20 || imageData) {
            preliminaryText = "আপনার প্রশ্নটি বিশ্লেষণ করছি... একটি সঠিক এবং গভীর উত্তর দেওয়ার জন্য একটু সময় নিচ্ছি।";
            currentChatHistory.push({ messageId: modelMessageId, role: Role.MODEL, parts: [{ text: preliminaryText }] });
        }
        
        setChatHistory([...currentChatHistory]);
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey });
            if (!chatRef.current) {
                // Determine starting history for API (excluding the preliminary message we just pushed)
                const apiHistory = chatHistory.map(({role, parts}) => ({role, parts}));
                chatRef.current = ai.chats.create({ 
                    model: 'gemini-3.1-pro-preview', 
                    history: apiHistory,
                    config: { 
                        tools: [{ googleSearch: {} }],
                        systemInstruction: "You are SIFRA AI, a highly advanced, professional neural assistant. " +
                        "Your task: When answering, FIRST analyze the core of the topic beautifully and express it in your own clear, engaging way. " +
                        "Keep the main explanation short, simple, and very easy to understand. " +
                        "If the user asks a complex question, use search to provide an up-to-date and better answer quickly. " +
                        "CRITICAL FORMATTING RULES: " +
                        "1. Do not use markdown like * or #. Do not use bold/italic formatting. " +
                        "2. Wrap the primary core one-word answer or main keyword in exactly <<YELLOW>>keyword<</YELLOW>>. " +
                        "3. Wrap the most important key points or highlights in exactly <<BLUE>>point<</BLUE>>. " +
                        "AT THE VERY END of your short explanation, ALWAYS ask the user directly: 'Shall I explain this better?' or 'Would you like to know more details?'. " +
                        "If the user says yes, then provide the full, deep technical or comprehensive explanation."
                    } 
                });
            }
            
            // Send the new message
            const stream = await chatRef.current.sendMessageStream({ message: parts.length === 1 && parts[0].text ? parts[0].text : parts });
            
            let fullText = '';
            // If we didn't push a preliminary message, we need to push an empty one now
            if (!preliminaryText) {
                setChatHistory([...chatHistory, userMessage, { messageId: modelMessageId, role: Role.MODEL, parts: [{ text: '' }] }]);
            }
            
            for await (const chunk of stream) {
                fullText += chunk.text || '';
                setChatHistory(prev => prev.map(msg => msg.messageId === modelMessageId ? { ...msg, parts: [{ text: fullText }] } : msg));
            }
        } catch (error) {
            console.error("Chat error:", error);
            setChatHistory(prev => {
                const filtered = prev.filter(m => m.messageId !== modelMessageId);
                return [...filtered, { messageId: `err-${Date.now()}`, role: Role.MODEL, parts: [{ text: "Error connecting to neural link. Please try again." }] }];
            });
        } finally { setIsLoading(false); }
    };

    const isFullScreenActive = [
        View.SIFRA_CALCULATOR, View.PERSONAL_CALENDAR, View.SIFRA_CLOCK, View.SIFRA_RECORDER,
        View.GALAXY_VOICE, View.VOICE_ASSISTANT, View.DUAL_MODE, View.VOICE_STUDIO, View.SIFRA_PREMIUM_PLUS,
        View.MONER_DANA, View.SIFRA_SAVE, View.DIARY_EDITOR, View.MEET_SIFRA,
        View.QUANTUM_LEAP,
        View.SIFRA_IDENTITY,
        View.SIFRA_VAULT,
        View.TUTOR, View.TRAVEL_GUIDE, View.CALLS_SIFRA, View.LIBRARY,
        View.SIFRA_MUSIC, View.SIFRA_BROWSER,
        View.PROFILE, View.ACCOUNT_DETAILS, View.SIFRA_TOOLS, View.PLAN, View.ADMIN, View.COMMUNITY,
        View.CHAT, View.YOUR_CARD, View.GREETINGS,
        View.SHARE, View.USER_INSIGHTS, View.SIFRA_WEATHER, View.SIFRA_MAPS, View.HISTORY, View.PROJECTS
    ].includes(currentView);

    const renderMainView = () => {
        if (!currentUser) return null;
        const sifraAvatar = SIFRA_AVATARS.find(a => a.id === currentUser.sifraAvatarId) || SIFRA_AVATARS[0];
        
        return (
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={currentView}
                    initial={{ opacity: 0, x: 5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -5 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="h-full w-full overflow-hidden gpu-layer"
                >
                    {(() => {
                        switch (currentView) {
                            case View.HOME: return <HomeView userProfile={currentUser} onNavigate={handleNavigation} onUserProfileChange={handleUserProfileChange} adminSettings={adminSettings} />;
                            case View.PROFILE: return <ProfileView userProfile={currentUser} onUserProfileChange={handleUserProfileChange} sifraVoice={sifraVoice} onSifraVoiceChange={setSifraVoice} onClose={handleBack} onNavigate={handleNavigation} onLogout={handleLogout} onClearAllData={() => {}} />;
                            case View.PROJECTS: return <ProjectsView userProfile={currentUser} onClose={handleBack} onNavigate={handleNavigation} />;
                            case View.HISTORY: return <HistoryView chatHistory={chatHistory} setChatHistory={setChatHistory} onClose={handleBack} onNavigate={handleNavigation} />;
                            case View.VOICE_ASSISTANT: 
                            case View.GALAXY_VOICE: 
                                return <VoiceAssistantView userProfile={currentUser} onClose={handleBack} onAction={handleDeviceAction} />;
                            case View.LIBRARY: return <LibraryView userProfile={currentUser} onNavigate={handleNavigation} onClose={handleBack} adminSettings={adminSettings} />;
                            case View.TX_ON: return <TXOnView userProfile={currentUser} onClose={handleBack} />;
                            case View.DATABASE: return <DatabaseView userProfile={currentUser} onClose={handleBack} />;
                            case View.POLICIES: return <PoliciesView onClose={handleBack} />;
                            case View.PERSONAL_CALENDAR: return <PersonalCalendarView userProfile={currentUser} onClose={handleBack} />;
                            case View.SIFRA_CLOCK: return <SifraClockView userProfile={currentUser} onClose={handleBack} />;
                            case View.SIFRA_RECORDER: return <SifraRecorderView userProfile={currentUser} onClose={handleBack} />;
                            case View.SIFRA_CALCULATOR: return <SifraCalculatorView userProfile={currentUser} onClose={handleBack} />;
                            case View.SIFRA_MUSIC: return <SifraMusicView userProfile={currentUser} onClose={handleBack} />;
                            case View.SIFRA_BROWSER: return <SifraBrowserView userProfile={currentUser} onClose={handleBack} initialQuery={browserInitialQuery || undefined} />;
                            case View.SHARE: return <SifraShareView userProfile={currentUser} onUpdateProfile={handleUserProfileChange} onClose={handleBack} />;
                            case View.USER_INSIGHTS: return <SifraInsightsView userProfile={currentUser} onUpdateProfile={handleUserProfileChange} onClose={handleBack} />;
                            case View.DUAL_MODE: return <DualModeView userProfile={currentUser} onUpdateProfile={handleUserProfileChange} onClose={handleBack} />;
                            case View.VOICE_STUDIO: return <VoiceStudioView userProfile={currentUser} onUpdateProfile={handleUserProfileChange} onClose={handleBack} />;
                            case View.MONER_DANA: return <MonerDanaView userProfile={currentUser} onClose={handleBack} onNavigate={handleNavigation} />;
                            case View.SIFRA_DAILY_TASK: return <DailyTaskView userProfile={currentUser} onClose={handleBack} />;
                            case View.SIFRA_SAVE: return <SifraSaveView userProfile={currentUser} onClose={handleBack} />;
                            case View.SIFRA_VAULT: return <SifraVaultView userProfile={currentUser} onClose={handleBack} />;
                            case View.QUANTUM_LEAP: return <QuantumLeapView userProfile={currentUser} onClose={handleBack} onNavigate={handleNavigation} />;
                            case View.DIARY_EDITOR: return <DiaryEditorView userProfile={currentUser} onClose={handleBack} entryId={activeDiaryEntryId} />;
                            case View.TUTOR: return <TutorView userProfile={currentUser} onClose={handleBack} />;
                            case View.TRAVEL_GUIDE: return <TravelGuideView userProfile={currentUser} onClose={handleBack} />;
                            case View.CALLS_SIFRA: return <CallsSifraView userProfile={currentUser} onClose={handleBack} />;
                            case View.SIFRA_WEATHER: return <WeatherView userProfile={currentUser} onClose={handleBack} onNavigate={handleNavigation} />;
                            case View.SIFRA_MAPS: return <MapsView userProfile={currentUser} onClose={handleBack} onNavigate={handleNavigation} />;
                            case View.ACCOUNT_DETAILS: return <AccountView userProfile={currentUser} onNavigate={handleNavigation} onClose={handleBack} onUpdateProfile={handleUserProfileChange} />;
                            case View.SETTINGS: return <SettingsView onNavigate={handleNavigation} onClose={handleBack} />;
                            case View.YOUR_CARD: return <YourCardView userProfile={currentUser} onClose={handleBack} isDark={isDark} currentTheme={theme} />;
                            case View.PLAN: return <PlanView userProfile={currentUser} onClose={handleBack} adminSettings={adminSettings} />;
                            case View.COMMUNITY: return <CommunityView userProfile={currentUser} onClose={handleBack} posts={communityPosts} onUpdatePosts={setCommunityPosts} />;
                            case View.MEET_SIFRA: return <MeetSifraView onClose={handleBack} onNavigate={handleNavigation} />;
                            case View.SIFRA_TOOLS: return <SifraToolsView userProfile={currentUser} onNavigate={handleNavigation} onClose={handleBack} adminSettings={adminSettings} />;
                            case View.SIFRA_IDENTITY: return <SifraIdentityView onClose={handleBack} userProfile={currentUser} />;
                            case View.FREE_HAND_MODE: return <FreeHandModeView userProfile={currentUser} onClose={handleBack} onUpdateProfile={handleUserProfileChange} />;
                            case View.GREETINGS: return <GreetingsView userProfile={currentUser} onClose={handleBack} />;
                            case View.CHAT: return (
                                <SifraChatView 
                                    userProfile={currentUser} 
                                    chatHistory={chatHistory} 
                                    setChatHistory={setChatHistory} 
                                    onClose={handleBack} 
                                    onNavigate={handleNavigation} 
                                    isLoading={isLoading} 
                                    setIsLoading={setIsLoading} 
                                    playAudio={playAudio} 
                                    currentlyPlayingAudioId={currentlyPlayingAudioId} 
                                    onSendMessage={handleSendMessage}
                                    onUserProfileChange={handleUserProfileChange}
                                />
                            );
                            default:
                                return (
                                    <div className="h-full flex flex-col bg-white premium-scroll">
                                        <header className="p-4 flex items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                                             <div className="flex items-center gap-4">
                                                <button onClick={handleBack} className="p-2 -ml-2 rounded-full active:bg-black/5"><ArrowLeftIcon /></button>
                                                <h1 className="text-lg font-bold">Neural Chat</h1>
                                             </div>
                                             {sifraAvatar && <Avatar src={sifraAvatar.url} isSifra />}
                                        </header>
                                        <div className="flex-1 overflow-y-auto space-y-4 p-4 premium-scroll">
                                            {chatHistory.map((msg, idx) => (
                                                <ChatMessage key={msg.messageId || idx} message={msg} isPlayingAudio={currentlyPlayingAudioId === msg.messageId} onReplayAudio={playAudio} userAvatar={currentUser?.avatar || null} userName={currentUser?.name || null} sifraAvatarUrl={sifraAvatar.url} isLoading={isLoading} isLastMessage={idx === chatHistory.length - 1} />
                                            ))}
                                        </div>
                                        <div className="p-4 bg-white/80 backdrop-blur-md border-t border-gray-50"><ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} onVoiceClick={() => handleNavigation(View.GALAXY_VOICE)} /></div>
                                    </div>
                                );
                        }
                    })()}
                </motion.div>
            </AnimatePresence>
        );
    };
    
    if (appFlow === AppFlow.SPLASH) return <SplashView onComplete={handleSplashComplete} />;

    return (
        <main className={`w-screen h-screen font-sans bg-gradient-to-br ${theme.gradient} flex flex-col overflow-hidden relative selection:bg-pink-500/20`}>
             <AnimatePresence>
                {isQueenLockdown && <SifraQueenAnimation onComplete={() => setIsQueenLockdown(false)} />}
             </AnimatePresence>
             <AnimatePresence>
                {!isOnline && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl flex items-center gap-3"
                    >
                        <WifiSlashIcon className="w-5 h-5 text-rose-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Neural Sink Offline</span>
                    </motion.div>
                )}
             </AnimatePresence>

              <motion.div animate={{ opacity: isQueenLockdown ? 0 : 1 }} className="flex-1 flex flex-col h-full overflow-hidden gpu-layer">
                {!isFullScreenActive && currentUser && !isSidebarOpen && (
                    <Header 
                        userName={currentUser.nickname || currentUser.name} 
                        onProfileClick={() => setIsProfileModalOpen(true)} 
                        onMenuClick={() => setIsSidebarOpen(true)} 
                        onLogoClick={() => handleNavigation(View.GALAXY_VOICE)} 
                        onPlusClick={() => handleNavigation(View.COMMUNITY)}
                        theme={theme} 
                        moodAmbienceEnabled={currentUser.moodAmbienceEnabled} 
                        currentMood={currentMood}
                        adminSettings={adminSettings}
                        userProfile={currentUser}
                        onUpdateUserProfile={handleUserProfileChange}
                        onNavigate={handleNavigation}
                    />
                )}
                {!isFullScreenActive && currentUser && (
                    <Sidebar 
                        isOpen={isSidebarOpen} 
                        onClose={() => setIsSidebarOpen(false)} 
                        onNavigate={(v) => { handleNavigation(v); setIsSidebarOpen(false); }} 
                        onLogout={handleLogout} 
                        onNewChat={() => { setChatHistory([]); setIsSidebarOpen(false); }} 
                        userProfile={currentUser} 
                    />
                )}
                <div className="flex-1 overflow-hidden relative h-full">
                    {renderMainView()}
                </div>
                <AnimatePresence>
                    {!isFullScreenActive && currentUser && !isSidebarOpen && (
                        <motion.div
                            initial={{ y: 80, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 80, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
                        >
                            <div className="pointer-events-auto">
                                <BottomNavbar currentView={currentView} onNavigate={handleNavigation} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
             </motion.div>
             <AnimatePresence>
                {isProfileModalOpen && currentUser && (
                    <ProfileModal 
                        userProfile={currentUser} 
                        onClose={() => setIsProfileModalOpen(false)} 
                        onManageAccount={() => {
                            setIsProfileModalOpen(false);
                            handleNavigation(View.PROFILE);
                        }}
                        onLogout={handleLogout}
                        onClearAllData={() => {
                            localStorage.clear();
                            window.location.reload();
                        }}
                    />
                )}
             </AnimatePresence>
             <AnimatePresence>
                {isVoiceAssistantOpen && currentUser && (
                    <VoiceAssistantView 
                        userProfile={currentUser} 
                        onClose={() => setIsVoiceAssistantOpen(false)} 
                        onAction={handleDeviceAction}
                    />
                )}
             </AnimatePresence>
        </main>
    );
};

export default App;
