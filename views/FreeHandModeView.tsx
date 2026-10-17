
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserProfile, View, FreeHandModeSettings, SIFRA_ADVANCED_VOICES } from '../types';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import CheckIcon from '../components/icons/CheckIcon';
import SpeakerIcon from '../components/icons/SpeakerIcon';
import MicrophoneIcon from '../components/icons/MicrophoneIcon';
import BoltIcon from '../components/icons/BoltIcon';
import SparklesIcon from '../components/icons/SparklesIcon';
import { generateSampleSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';

interface FreeHandModeViewProps {
    userProfile: UserProfile;
    onClose: () => void;
    onUpdateProfile: (profile: UserProfile) => void;
}

const FreeHandModeView: React.FC<FreeHandModeViewProps> = ({ userProfile, onClose, onUpdateProfile }) => {
    const [settings, setSettings] = useState<FreeHandModeSettings>(userProfile.freeHandModeSettings || {
        isEnabled: false,
        wakeWordEnabled: true,
        listeningDuration: 3,
        sensitivity: 50,
        voiceId: 'Kore',
        responseStyle: 'polite',
        addressAs: 'Neutral'
    });

    const [isPlayingSample, setIsPlayingSample] = useState<string | null>(null);

    const updateSettings = (newSettings: Partial<FreeHandModeSettings>) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        onUpdateProfile({
            ...userProfile,
            freeHandModeSettings: updated
        });
    };

    const playVoiceSample = async (voiceId: string) => {
        if (isPlayingSample) return;
        setIsPlayingSample(voiceId);
        try {
            const audioData = await generateSampleSpeech(voiceId);
            if (audioData) {
                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(ctx.destination);
                source.onended = () => setIsPlayingSample(null);
                source.start();
            } else {
                setIsPlayingSample(null);
            }
        } catch (e) {
            console.error(e);
            setIsPlayingSample(null);
        }
    };

    return (
        <div className="h-full w-full bg-[#050505] text-white flex flex-col font-sans overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-12 pb-6 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-20">
                <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all active:scale-90">
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-black tracking-tighter italic">Free Hand Mode</h1>
                <div className="w-11" />
            </div>

            <div className="flex-1 overflow-y-auto premium-scroll px-6 py-8 space-y-10 pb-32">
                {/* Main Toggle */}
                <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-purple-700 shadow-2xl shadow-indigo-500/20 flex items-center justify-between">
                    <div className="space-y-1">
                        <h2 className="text-lg font-black tracking-tight">Voice Assistant</h2>
                        <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Master Control</p>
                    </div>
                    <button 
                        onClick={() => updateSettings({ isEnabled: !settings.isEnabled })}
                        className={`w-16 h-8 rounded-full p-1 transition-all duration-500 ${settings.isEnabled ? 'bg-white' : 'bg-black/20'}`}
                    >
                        <motion.div 
                            animate={{ x: settings.isEnabled ? 32 : 0 }}
                            className={`w-6 h-6 rounded-full shadow-lg ${settings.isEnabled ? 'bg-indigo-600' : 'bg-white'}`}
                        />
                    </button>
                </div>

                {/* Settings Grid */}
                <div className="grid grid-cols-1 gap-6">
                    {/* Wake Word */}
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-500/20 rounded-xl">
                                    <BoltIcon className="w-4 h-4 text-amber-500" />
                                </div>
                                <h3 className="font-black text-xs uppercase tracking-widest">Wake Word Detection</h3>
                            </div>
                            <button 
                                onClick={() => updateSettings({ wakeWordEnabled: !settings.wakeWordEnabled })}
                                className={`w-12 h-6 rounded-full p-1 transition-all ${settings.wakeWordEnabled ? 'bg-amber-500' : 'bg-white/10'}`}
                            >
                                <motion.div 
                                    animate={{ x: settings.wakeWordEnabled ? 24 : 0 }}
                                    className="w-4 h-4 rounded-full bg-white shadow-sm"
                                />
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                            When enabled, Sifra will listen for "Hey Sifra" or "Ok Sifra" to activate automatically.
                        </p>
                    </div>

                    {/* Listening Duration */}
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-cyan-500/20 rounded-xl">
                                <MicrophoneIcon className="w-4 h-4 text-cyan-500" />
                            </div>
                            <h3 className="font-black text-xs uppercase tracking-widest">Listening Window</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-2xl font-black italic tracking-tighter">{settings.listeningDuration}s</span>
                                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Duration</span>
                            </div>
                            <input 
                                type="range" 
                                min="1" 
                                max="10" 
                                value={settings.listeningDuration}
                                onChange={(e) => updateSettings({ listeningDuration: parseInt(e.target.value) })}
                                className="w-full accent-cyan-500 bg-white/10 h-1.5 rounded-full appearance-none"
                            />
                        </div>
                    </div>

                    {/* Sensitivity */}
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/20 rounded-xl">
                                <SparklesIcon className="w-4 h-4 text-emerald-500" />
                            </div>
                            <h3 className="font-black text-xs uppercase tracking-widest">Assistant Sensitivity</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-2xl font-black italic tracking-tighter">{settings.sensitivity}%</span>
                                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Level</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={settings.sensitivity}
                                onChange={(e) => updateSettings({ sensitivity: parseInt(e.target.value) })}
                                className="w-full accent-emerald-500 bg-white/10 h-1.5 rounded-full appearance-none"
                            />
                        </div>
                    </div>

                    {/* Address As */}
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                        <h3 className="font-black text-xs uppercase tracking-widest text-gray-400">Address Me As</h3>
                        <div className="flex gap-2">
                            {['Sir', 'Ma\'am', 'Neutral'].map((option) => (
                                <button
                                    key={option}
                                    onClick={() => updateSettings({ addressAs: option as any })}
                                    className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${settings.addressAs === option ? 'bg-white text-black border-white' : 'bg-white/5 text-gray-400 border-white/5 hover:border-white/20'}`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Voice Selection */}
                    <div className="space-y-4">
                        <h3 className="font-black text-xs uppercase tracking-widest text-gray-400 px-1">Voice Profile</h3>
                        <div className="grid grid-cols-1 gap-3">
                            {SIFRA_ADVANCED_VOICES.filter(v => ['Kore', 'Fenrir', 'Charon', 'Orus'].includes(v.id)).map((voice) => (
                                <div
                                    key={voice.id}
                                    onClick={() => updateSettings({ voiceId: voice.id })}
                                    className={`p-4 rounded-3xl border transition-all flex items-center justify-between group cursor-pointer ${settings.voiceId === voice.id ? 'bg-white/10 border-white/40' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${voice.gender === 'female' ? 'bg-pink-500/20 text-pink-500' : 'bg-blue-500/20 text-blue-500'}`}>
                                            <SpeakerIcon className="w-6 h-6" />
                                        </div>
                                        <div className="text-left">
                                            <h4 className="font-black text-sm tracking-tight">{voice.name}</h4>
                                            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{voice.gender} • Age {voice.ageGroup}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                playVoiceSample(voice.id);
                                            }}
                                            className={`p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all ${isPlayingSample === voice.id ? 'animate-pulse text-cyan-400' : 'text-gray-400'}`}
                                        >
                                            <SpeakerIcon className="w-4 h-4" />
                                        </button>
                                        {settings.voiceId === voice.id && (
                                            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                                                <CheckIcon className="w-3 h-3 text-black" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Privacy Footer */}
            <div className="p-6 bg-black/80 backdrop-blur-2xl border-t border-white/5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                    <SparklesIcon className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex-1">
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Privacy Protected</h4>
                    <p className="text-[8px] text-gray-500 font-medium">Sifra only listens when the wake word is detected.</p>
                </div>
            </div>
        </div>
    );
};

export default FreeHandModeView;
