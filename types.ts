
export enum Role {
    USER = 'user',
    MODEL = 'model'
}

export interface Part {
    text?: string;
    inlineData?: {
        mimeType: string;
        data: string;
    };
}

export interface Message {
    messageId: string;
    role: Role;
    parts: Part[];
}

export enum AppFlow {
    SPLASH,
    LOGIN,
    MAIN_APP,
    ADMIN_DASHBOARD
}

export enum View {
    HOME, 
    CHAT,
    PROFILE,
    HISTORY,
    ADVANCED_SETTINGS,
    TERMS,
    ABOUT,
    HOW_TO_USE,
    ACCOUNT_SWITCHER,
    GREETINGS,
    LIBRARY,
    TUTOR,
    TRAVEL_GUIDE,
    CALLS_SIFRA,
    VOICE_ASSISTANT, 
    GALAXY_VOICE,   
    SIFRA_SAVE,
    MONER_DANA,
    DIARY_EDITOR,
    DUAL_MODE, 
    SIFRA_PRO, 
    SIFRA_PREMIUM_PLUS, 
    YOUR_CARD,
    ACCOUNT_DETAILS,
    MEET_SIFRA,
    SIFRA_TOOLS,
    PERSONAL_CALENDAR,
    SIFRA_CLOCK,
    SIFRA_RECORDER,
    SIFRA_CALCULATOR,
    SIFRA_MUSIC,
    SIFRA_BROWSER,
    PLAN,
    ADMIN,
    COMMUNITY,
    FREE_HAND_MODE,
    SHARE,
    USER_INSIGHTS,
    WALLET,
    QUANTUM_LEAP,
    SIFRA_IDENTITY,
    SIFRA_VAULT,
    TX_ON,
    DATABASE,
    POLICIES,
    SETTINGS,
    SIFRA_DAILY_TASK,
    VOICE_STUDIO,
    SIFRA_WEATHER,
    SIFRA_MAPS,
    PROJECTS
}

export interface ProjectItem {
    id: string;
    title: string;
    description: string;
    fileType: 'pdf' | 'doc' | 'sheet' | 'ppt' | 'code' | 'image' | 'audio' | 'report';
    fileName: string;
    fileSize: string;
    createdAt: string;
    updatedAt: string;
    category: 'documents' | 'pdfs' | 'spreadsheets' | 'presentations' | 'code' | 'images' | 'other';
    contentPreview: string;
    tags: string[];
    isFavorite?: boolean;
    downloadUrl?: string;
}

export interface CommunityPost {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    content: string;
    timestamp: number;
    likes: number;
    comments: CommunityComment[];
    type: 'request' | 'feedback';
}

export interface CommunityComment {
    id: string;
    userId: string;
    userName: string;
    content: string;
    timestamp: number;
}

export interface Plan {
    id: string;
    name: string;
    price: string;
    duration: string;
    features: string[];
    color: string;
    isPopular?: boolean;
}

export interface ApiKey {
    id: string;
    service: string;
    key: string;
    isActive: boolean;
    lastUsed?: number;
}

export interface AdminSettings {
    headerLighting: boolean;
    headerLightingType: number; // 0-6
    plans: Plan[];
    apiKeys: ApiKey[];
    featureFlags: Record<string, boolean>;
}

export type ClockStyleId = 'analog-basic' | 'digital-premium' | 'sifra-logo' | 'digital-space' | 'analog-multicolor';

export type EventType = 'event' | 'task' | 'meet';
export type EventStatus = 'accepted' | 'pending' | 'rejected';

export interface Participant {
    id: string;
    name: string;
    avatar?: string;
    status: EventStatus;
}

export interface CalendarNote {
    id: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    endTime?: string;
    title: string;
    content: string;
    type: EventType;
    isSpecial: boolean;
    color?: string; // Tailwind class like 'bg-indigo-500'
    reminderEnabled?: boolean;
    location?: string;
    meetingLink?: string;
    participants?: Participant[];
    repeat?: 'none' | 'daily' | 'weekly' | 'custom';
    isCompleted?: boolean;
    // AI Features
    isFlexible: boolean;
    priorityScore: number; // 0-10
    energyLevel: 'low' | 'medium' | 'high';
    linkedAssets?: { name: string; url: string; type: string }[];
    isGhost: boolean;
    travelTime?: number; // in minutes
    bufferZone?: number; // in minutes
}

// Added Quantum related interfaces
export interface QuantumProfile {
    id: string;
    isActivated: boolean;
    activatedAt: string;
    displayName: string;
    languages: string[];
    interests: string[];
    emotionalPersonality: string[];
    emotionalSensitivity: number;
    conversationDepth: 'shallow' | 'normal' | 'deep';
    behaviorRestrictions: { avoidSensitive: boolean; strictMoral: boolean };
    riyaVoicePreset: string;
    voicePitch: number; // 0.5 to 2.0 (default 1.0)
    voiceSpeed: number; // 0.5 to 2.0 (default 1.0)
    voiceEmotion?: 'neutral' | 'cheerful' | 'soft' | 'affectionate' | 'empathic' | 'whisper' | 'dramatic' | 'serious';
    voiceBreath?: number; // 0 to 100% (subtle pauses, breathiness)
    voiceEmphasis?: 'none' | 'moderate' | 'strong';
    relationshipMode: string;
    purpose: string[];
    usageFrequency: string;
    advancedPrefs: { memoryRetention: boolean; moodTracking: boolean; dailyGreetings: boolean };
    consentAudio: boolean;
    photoPrivacy: 'private' | 'public';
    voiceConsent: boolean;
    strikes: number;
    isSuspended: boolean;
    suspensionEndTime: string | null;
    isBanned: boolean;
    lastViolationDate: string | null;
    gender?: string;
}

export type QuantumVoice = any;
export type QuantumPersona = any;

// Added Pro related interfaces
export type ProModeId = string;
export interface ProSettings {
    activeModeId: ProModeId;
}

export interface FreeHandModeSettings {
    isEnabled: boolean;
    wakeWordEnabled: boolean;
    listeningDuration: number; // in seconds
    sensitivity: number; // 0-100
    voiceId: string;
    responseStyle: 'polite' | 'casual' | 'professional';
    addressAs: 'Sir' | 'Ma\'am' | 'Neutral';
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
}

export interface UserProfile {
    name: string | null;
    nickname: string | null;
    email?: string | null;
    phoneNumber?: string | null;
    location?: string | null;
    bio?: string | null;
    gender?: string | null;
    planId?: string | null;
    avatar: string | null; // base64 string
    themeId: string;
    sifraAvatarId: string;
    heroClockStyle?: ClockStyleId;
    saveHistory: boolean;
    userId: string;
    joinDate: string;
    status: 'active' | 'suspended';
    lastLogin: string;
    moodAmbienceEnabled: boolean;
    aiPersonality?: string;
    customInstructions?: string;
    quantumProfile?: QuantumProfile;
    sifraProSettings?: ProSettings;
    freeHandModeSettings?: FreeHandModeSettings;
    insights?: Record<string, string>;
    notifications?: Notification[];
    activeSystemVersionId?: string;
}

export type Mood = 'happy' | 'sad' | 'calm' | 'focused' | 'neutral';

export interface HabitStreak {
    id: string;
    name: string;
    completedDates: string[]; // YYYY-MM-DD
    color: string;
}

// Added Theme and SifraAvatar related constants and interfaces
export interface Theme {
    id: string;
    name: string;
    gradient: string;
    headerTextColor: string;
}

export const THEMES: Theme[] = [
    { id: 'default', name: 'Default Indigo', gradient: 'from-indigo-200 via-purple-200 to-indigo-300', headerTextColor: 'text-indigo-900' },
    { id: 'rose', name: 'Soft Rose', gradient: 'from-pink-100 via-rose-100 to-pink-200', headerTextColor: 'text-rose-900' },
    { id: 'sky', name: 'Crystal Sky', gradient: 'from-sky-100 via-blue-100 to-cyan-200', headerTextColor: 'text-blue-900' },
    { id: 'dark-matrix', name: 'Matrix Dark', gradient: 'from-slate-900 via-black to-slate-900', headerTextColor: 'text-emerald-400' },
];

export interface SifraAvatar {
    id: string;
    name: string;
    url: string;
}

export const SIFRA_AVATARS: SifraAvatar[] = [
    { id: 'cute', name: 'Cute Sifra', url: 'https://picsum.photos/seed/sifra-cute/200' },
    { id: 'pro', name: 'Pro Sifra', url: 'https://picsum.photos/seed/sifra-pro/200' },
    { id: 'galaxy', name: 'Galaxy Sifra', url: 'https://picsum.photos/seed/sifra-galaxy/200' },
    { id: 'queen', name: 'Queen Sifra', url: 'https://picsum.photos/seed/sifra-queen/200' },
];

// Added Voice related interfaces
export interface Voice {
    id: string;
    name: string;
}

export const SIFRA_VOICES: Voice[] = [
    { id: 'Kore', name: 'Kore (Default)' },
    { id: 'Charon', name: 'Charon (Pleasant)' },
    { id: 'Puck', name: 'Puck (Playful)' },
    { id: 'Fenrir', name: 'Fenrir (Deep)' },
];

export interface VoiceProfile {
    id: string;
    name: string;
    gender: 'female' | 'male';
    ageGroup: string;
    description: string;
}

export const SIFRA_ADVANCED_VOICES: VoiceProfile[] = [
    // Female Voices
    { id: 'Kore', name: 'Kore (Sweet)', gender: 'female', ageGroup: '15-18', description: 'Youthful, clean, and sweet cuckoo-like voice. Very polite and respectful.' },
    { id: 'Charon', name: 'Charon (Pleasant)', gender: 'female', ageGroup: '19-25', description: 'Smooth, pleasant, and professional voice.' },
    { id: 'Puck', name: 'Puck (Playful)', gender: 'female', ageGroup: '18-22', description: 'Energetic, playful, and high-pitched.' },
    { id: 'Zephyr', name: 'Zephyr (Professional)', gender: 'female', ageGroup: '26-30', description: 'Mature, professional, and warm tone.' },
    { id: 'Aoede', name: 'Aoede (Caring)', gender: 'female', ageGroup: '22-28', description: 'Soft, caring, and very respectful.' },
    
    // Male Voices
    { id: 'Fenrir', name: 'Fenrir (Deep)', gender: 'male', ageGroup: '30-40', description: 'Deep, calm, and authoritative.' },
    { id: 'Orus', name: 'Orus (Confident)', gender: 'male', ageGroup: '25-35', description: 'Formal, confident, and clear.' },
    { id: 'Algenib', name: 'Algenib (Smart)', gender: 'male', ageGroup: '20-30', description: 'Fast, smart, and helpful.' },
    { id: 'Enceladus', name: 'Enceladus (Strong)', gender: 'male', ageGroup: '28-35', description: 'Strong, steady, and respectful.' },
    { id: 'Iapetus', name: 'Iapetus (Bright)', gender: 'male', ageGroup: '18-25', description: 'Bright, cheerful, and polite.' },
];

// Added module specific interfaces
export interface TutorProfile {
    name: string;
    institute: string;
    board: string;
    studentType: 'beginner' | 'intermediate' | 'advanced';
    state: string;
    district: string;
}

export interface MemoryLog {
    id: string;
    content: string;
    date: string;
}

export interface DiaryEntry {
    id: string;
    date: string;
    title: string;
    content: string;
    categoryId?: string;
    attachments?: { type: 'image' | 'video' | 'audio', data: string }[];
}

export const DIARY_CATEGORIES = [
    { id: 'personal', name: 'Personal' },
    { id: 'work', name: 'Work' },
    { id: 'travel', name: 'Travel' },
    { id: 'ideas', name: 'Ideas' },
];

export interface AlarmNode {
    id: string;
    time: string;
    label: string;
    enabled: boolean;
    ringtoneId?: number;
    date?: string;
}

export interface WorldCity {
    id: string;
    name: string;
    region: string;
    timezone: string;
    offset: string;
}

export interface Recording {
    id: string;
    name: string;
    date: string;
    duration: number;
    url: string;
    waveform: number[];
}

export const APP_VERSION = "SIFRA 3.0";
