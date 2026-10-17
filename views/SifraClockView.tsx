import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, AlarmNode } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import PlusCircleIcon from '../components/icons/PlusCircleIcon';
import ClockIcon from '../components/icons/ClockIcon';
import BellIcon from '../components/icons/BellIcon';
import PlayIcon from '../components/icons/PlayIcon';
import PauseIcon from '../components/icons/PauseIcon';
import StopIcon from '../components/icons/StopIcon';
import SparklesIcon from '../components/icons/SparklesIcon';
import TrashIcon from '../components/icons/TrashIcon';
import { MoreVertical, Settings, Palette, Music, X, RotateCcw, Calendar as CalIcon, ChevronDown } from 'lucide-react';
import SifraLiveLogo from '../components/SifraLiveLogo';

import { saveRingtone, getRingtones, deleteRingtone } from '../utils/idb';

type ClockTab = 'clock' | 'alarm' | 'timer' | 'stopwatch';
type ClockMode = 'DIGITAL' | 'PHYSICAL_PREMIUM';

const CLOCK_THEMES = [
    { id: 't1', name: 'Sunset Premium', bg: 'from-[#b31405] via-[#e54504] to-[#fdb025]', text: 'text-white', accent: 'text-white', bgCard: 'bg-white/10', border: 'border-white/20' },
    { id: 't2', name: 'Ocean Depth', bg: 'from-[#021f47] via-[#0f4b8f] to-[#43b0d1]', text: 'text-white', accent: 'text-white', bgCard: 'bg-white/10', border: 'border-white/20' }
];

const BUILT_IN_RINGTONES = [
  { id: 'al_1', name: 'Premium Alarm 1 (Sunrise)', isBuiltIn: true },
  { id: 'al_2', name: 'Premium Alarm 2 (Digital Pulse)', isBuiltIn: true },
  { id: 'al_3', name: 'Premium Alarm 3 (Chime Sequence)', isBuiltIn: true },
  { id: 'al_4', name: 'Premium Alarm 4 (Soft Marimba)', isBuiltIn: true },
  { id: 'al_5', name: 'Premium Alarm 5 (Zen Bells)', isBuiltIn: true },
  { id: 'al_6', name: 'Premium Alarm 6 (Crystal Wave)', isBuiltIn: true },
  { id: 'al_7', name: 'Premium Alarm 7 (Neon Sweep)', isBuiltIn: true },
  { id: 'al_8', name: 'Premium Alarm 8 (Deep Echo)', isBuiltIn: true },
  { id: 'al_9', name: 'Premium Alarm 9 (Starfall)', isBuiltIn: true },
  { id: 'al_10', name: 'Premium Alarm 10 (Awakening)', isBuiltIn: true },
  { id: 'tm_1', name: 'Timer 1 (Beep Beep Wakeup)', isBuiltIn: true },
  { id: 'tm_2', name: 'Timer 2 (Time Out)', isBuiltIn: true },
  { id: 'tm_3', name: 'Timer 3 (Session Complete)', isBuiltIn: true },
  { id: 'tm_4', name: 'Timer 4 (Forest Birds)', isBuiltIn: true },
  { id: 'tm_5', name: 'Timer 5 (Soft Alert)', isBuiltIn: true }
];

const playOsc = (ctx: AudioContext, type: OscillatorType, freq: number, dur: number, vol: number, attack = 0.05) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + attack);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
};

const getSifraSpeechMsg = (type: string, userName: string, label: string) => {
    const now = new Date();
    const hours = now.getHours();
    const mins = now.getMinutes();
    const strH = hours % 12 || 12;
    const preTime = mins > 0 ? '' : "o'clock";
    const ampmStr = hours < 12 ? "AM" : "PM";
    const namePart = userName ? userName : "User";
    const greeting = hours < 12 ? 'Good morning' : hours < 18 ? 'Good afternoon' : 'Good evening';

    if (type === 'morning') {
        return `${greeting} ${namePart}. It is ${strH} ${mins > 0 ? mins : ''} ${preTime} ${ampmStr}. This is Sifra. It is time to wake up as requested. Have a wonderful day.`;
    } else if (type === 'sleep') {
        return `Good night ${namePart}. It is ${strH} ${mins > 0 ? mins : ''} ${preTime} ${ampmStr}. It is time for you to sleep.`;
    } else {
        return `Hello ${namePart}. It is ${strH} ${mins > 0 ? mins : ''} ${preTime} ${ampmStr}. Your alarm for ${label || 'your task'} is ringing.`;
    }
};

let activeAudio: HTMLAudioElement | null = null;
let activeCtx: AudioContext | null = null;
let activeFallbackInterval: any = null;

const stopRingtonePlay = () => {
    if (activeAudio) {
        activeAudio.pause();
        activeAudio.src = "";
        activeAudio = null;
    }
    if (activeFallbackInterval) {
        clearInterval(activeFallbackInterval);
        activeFallbackInterval = null;
    }
    if (activeCtx) {
        activeCtx.close().catch(()=>{});
        activeCtx = null;
    }
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
};

const playRingtone = (id: string, allRingtones: any[], customData?: { userName: string, label: string }) => {
    stopRingtonePlay();

    if (customData) {
        setTimeout(() => {
            if('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                const now = new Date();
                const type = now.getHours() < 12 ? 'morning' : 'remind';
                const msg = getSifraSpeechMsg(type, customData.userName || "", customData.label || "");
                const u = new SpeechSynthesisUtterance(msg);
                u.lang = 'en-US'; 
                u.pitch = 1.1; // Female tone
                u.rate = 0.95;
                
                let voices = window.speechSynthesis.getVoices();
                const setVoiceAndSpeak = () => {
                    const sortedVoices = [...voices];
                    const bestVoice = sortedVoices.find(v => 
                        v.lang.startsWith('en') && 
                        (v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Google UK English Female'))
                    ) || sortedVoices.find(v => v.lang.startsWith('en'));
                    
                    if (bestVoice) u.voice = bestVoice;
                    window.speechSynthesis.speak(u);
                };

                if (voices.length > 0) {
                    setVoiceAndSpeak();
                } else {
                    window.speechSynthesis.onvoiceschanged = () => {
                        voices = window.speechSynthesis.getVoices();
                        setVoiceAndSpeak();
                    };
                }
            }
        }, 500);
    }

    const ring = allRingtones.find(r => r.id === id);
    if (ring && ring.dataUrl) {
        activeAudio = new Audio(ring.dataUrl);
        activeAudio.loop = true;
        activeAudio.volume = 0.6; // keep some headroom for TTS
        activeAudio.play().catch(console.error);
    } else {
        if (window.AudioContext || (window as any).webkitAudioContext) {
            activeCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const ctx = activeCtx!;
            
            const schedulePattern = () => {
                if (!activeCtx) return;
                
                if (id === 'al_1') { // Sunrise
                    playOsc(ctx, 'sine', 349.23, 0.4, 0.3, 0.2); // F4
                    setTimeout(() => activeCtx && playOsc(ctx, 'sine', 440.00, 0.4, 0.3, 0.2), 300); // A4
                    setTimeout(() => activeCtx && playOsc(ctx, 'sine', 523.25, 0.8, 0.3, 0.2), 600); // C5
                } else if (id === 'al_2') { // Digital Pulse
                    playOsc(ctx, 'square', 440, 0.1, 0.2, 0.01);
                    setTimeout(() => activeCtx && playOsc(ctx, 'square', 440, 0.1, 0.2, 0.01), 150);
                    setTimeout(() => activeCtx && playOsc(ctx, 'square', 440, 0.1, 0.2, 0.01), 300);
                } else if (id === 'al_3') { // Chime Sequence
                    playOsc(ctx, 'triangle', 587.33, 0.3, 0.3); // D5
                    setTimeout(() => activeCtx && playOsc(ctx, 'triangle', 659.25, 0.3, 0.3), 200); // E5
                    setTimeout(() => activeCtx && playOsc(ctx, 'triangle', 698.46, 0.3, 0.3), 400); // F5
                    setTimeout(() => activeCtx && playOsc(ctx, 'triangle', 783.99, 0.6, 0.3), 600); // G5
                } else if (id === 'al_4') { // Soft Marimba
                    playOsc(ctx, 'sine', 392.00, 0.2, 0.4, 0.01); // G4
                    setTimeout(() => activeCtx && playOsc(ctx, 'sine', 587.33, 0.2, 0.4, 0.01), 150); // D5
                    setTimeout(() => activeCtx && playOsc(ctx, 'sine', 783.99, 0.2, 0.4, 0.01), 300); // G5
                } else if (id === 'al_5') { // Zen Bells
                    playOsc(ctx, 'sine', 880.00, 1.2, 0.2, 0.1); 
                    setTimeout(() => activeCtx && playOsc(ctx, 'sine', 659.25, 1.2, 0.2, 0.1), 800); 
                } else if (id === 'al_6') { // Crystal Wave
                    playOsc(ctx, 'triangle', 1046.50, 0.3, 0.2, 0.05); // C6
                    setTimeout(() => activeCtx && playOsc(ctx, 'triangle', 783.99, 0.3, 0.2, 0.05), 200); // G5
                    setTimeout(() => activeCtx && playOsc(ctx, 'triangle', 659.25, 0.3, 0.2, 0.05), 400); // E5
                    setTimeout(() => activeCtx && playOsc(ctx, 'triangle', 523.25, 0.6, 0.2, 0.05), 600); // C5
                } else if (id === 'al_7') { // Neon Sweep
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(440, ctx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.3);
                    gain.gain.setValueAtTime(0, ctx.currentTime);
                    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.1);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
                    osc.connect(gain); gain.connect(ctx.destination);
                    osc.start(); osc.stop(ctx.currentTime + 0.4);
                } else if (id === 'al_8') { // Deep Echo
                    playOsc(ctx, 'sine', 261.63, 0.8, 0.4, 0.1); // C4
                    setTimeout(() => activeCtx && playOsc(ctx, 'sine', 130.81, 1.2, 0.5, 0.2), 400); // C3
                } else if (id === 'al_9') { // Starfall
                    playOsc(ctx, 'sine', 622.25, 0.4, 0.3, 0.1); // Eb5
                    setTimeout(() => activeCtx && playOsc(ctx, 'sine', 466.16, 0.4, 0.3, 0.1), 250); // Bb4
                    setTimeout(() => activeCtx && playOsc(ctx, 'sine', 392.00, 0.8, 0.3, 0.1), 500); // G4
                } else if (id === 'al_10') { // Awakening
                    playOsc(ctx, 'square', 440, 0.2, 0.05);
                    setTimeout(() => activeCtx && playOsc(ctx, 'square', 523.25, 0.2, 0.05), 200);
                    setTimeout(() => activeCtx && playOsc(ctx, 'square', 659.25, 0.2, 0.05), 400);
                    setTimeout(() => activeCtx && playOsc(ctx, 'square', 880, 0.4, 0.05), 600);
                } else if (id === 'tm_1') { // Beep Beep
                    playOsc(ctx, 'square', 880, 0.1, 0.1, 0.01);
                    setTimeout(() => activeCtx && playOsc(ctx, 'square', 880, 0.1, 0.1, 0.01), 150);
                } else if (id === 'tm_2') { // Time Out
                    playOsc(ctx, 'square', 1000, 0.2, 0.1, 0.01);
                    setTimeout(() => activeCtx && playOsc(ctx, 'square', 800, 0.4, 0.1, 0.01), 250);
                } else if (id === 'tm_3') { // Session Complete
                    playOsc(ctx, 'sine', 523.25, 0.2, 0.3);
                    setTimeout(() => activeCtx && playOsc(ctx, 'sine', 783.99, 0.2, 0.3), 200);
                    setTimeout(() => activeCtx && playOsc(ctx, 'sine', 1046.50, 0.6, 0.3), 400);
                } else if (id === 'tm_4') { // Forest Birds
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(2000, ctx.currentTime);
                    osc.frequency.linearRampToValueAtTime(3000, ctx.currentTime + 0.1);
                    osc.frequency.linearRampToValueAtTime(2000, ctx.currentTime + 0.2);
                    gain.gain.setValueAtTime(0, ctx.currentTime);
                    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
                    osc.connect(gain); gain.connect(ctx.destination);
                    osc.start(); osc.stop(ctx.currentTime + 0.2);
                } else if (id === 'tm_5') { // Soft Alert
                    playOsc(ctx, 'sine', 600, 0.8, 0.2, 0.2);
                } else {
                    // Fallback generic beep
                    playOsc(ctx, 'square', 600, 0.3, 0.1);
                }
            };
            
            schedulePattern();
            activeFallbackInterval = setInterval(schedulePattern, 1800); // Repeat every 1.8s
        }
    }
};

const SifraClockView: React.FC<{ userProfile: UserProfile; onClose: () => void }> = ({ userProfile, onClose }) => {
    const [activeTab, setActiveTab] = useState<ClockTab>('clock');
    const [time, setTime] = useState(new Date());
    const [alarms, setAlarms] = useLocalStorage<AlarmNode[]>(`sifra_alarms_v4_${userProfile.userId}`, []);
    
    // Config
    const [activeThemeId, setActiveThemeId] = useLocalStorage('sifra_clock_theme', 't1');
    const [defaultRingtoneId, setDefaultRingtoneId] = useLocalStorage<string>('sifra_clock_ringtone_v2', '');
    const clockTheme = CLOCK_THEMES.find(t => t.id === activeThemeId) || CLOCK_THEMES[0];
    
    const [customRingtones, setCustomRingtones] = useState<{id: string, name: string, dataUrl?: string, isBuiltIn?: boolean}[]>([]);
    
    useEffect(() => {
        getRingtones().then(dbRings => {
            setCustomRingtones([...BUILT_IN_RINGTONES, ...dbRings]);
        }).catch(console.error);
    }, []);
    
    // Modals
    const [showSettingsMenu, setShowSettingsMenu] = useState(false);
    const [showThemeModal, setShowThemeModal] = useState(false);
    
    const [showRingtoneModal, setShowRingtoneModal] = useState(false);
    const [ringtonePickerTarget, setRingtonePickerTarget] = useState<'global' | 'timer' | 'new_alarm' | null>(null);

    // Stopwatch logic
    const [swMode, setSwMode] = useLocalStorage<ClockMode>('sifra_sw_mode', 'DIGITAL');
    const [swTime, setSwTime] = useState(0);
    const [swRunning, setSwRunning] = useState(false);
    const [laps, setLaps] = useState<{ time: number; lap: number }[]>([]);
    const [oldTime, setOldTime] = useState(0);

    // Timer logic
    const [timerSettings, setTimerSettings] = useLocalStorage('sifra_timer_settings', { h: 0, m: 25, s: 0 });
    const [timerRingtoneId, setTimerRingtoneId] = useLocalStorage<string>('sifra_timer_ringtone_v2', '');
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const totalTimerSeconds = timerSettings.h * 3600 + timerSettings.m * 60 + timerSettings.s;
    const [timerCurrent, setTimerCurrent] = useState(totalTimerSeconds);
    const [showTimerSetup, setShowTimerSetup] = useState(false);

    // Fire state
    const [firingAlarm, setFiringAlarm] = useState<AlarmNode | null>(null);
    const [firingTimer, setFiringTimer] = useState(false);
    
    // New Alarm Modal Form
    const [showAlarmSetup, setShowAlarmSetup] = useState(false);
    const [newAlarmH, setNewAlarmH] = useState('08');
    const [newAlarmM, setNewAlarmM] = useState('30');
    const [newAlarmS, setNewAlarmS] = useState('00');
    const [newAlarmAmPm, setNewAlarmAmPm] = useState('AM');
    const [newAlarmLabel, setNewAlarmLabel] = useState('My Alarm');
    const [newAlarmDate, setNewAlarmDate] = useState('');
    const [newAlarmRingtoneId, setNewAlarmRingtoneId] = useState<string>('');
    const [showAdvancedAlarm, setShowAdvancedAlarm] = useState(false);

    useEffect(() => {
        return () => { stopRingtonePlay(); };
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            const Math_max = Math.max;
            const now = new Date();
            setTime(now);

            // Time Formatting "08:30:00 AM" exactly
            const h12 = now.getHours() % 12 || 12;
            const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
            const currTimeStr = `${h12.toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')} ${ampm}`;
            const dayStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')}`;

            const activeAlarm = alarms.find(a => {
                if (!a.enabled) return false;
                if (a.time !== currTimeStr) return false;
                if (a.date && a.date !== dayStr) return false;
                return true;
            });
            
            if (activeAlarm) {
                setFiringAlarm(activeAlarm);
                playRingtone(String(activeAlarm.ringtoneId !== undefined ? activeAlarm.ringtoneId : defaultRingtoneId), customRingtones, { userName: userProfile.name, label: activeAlarm.label || 'Alarm' });
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [alarms, defaultRingtoneId]);

    // Stopwatch Raf
    useEffect(() => {
        let raf: number;
        if (swRunning) {
            const start = performance.now();
            const step = () => {
                setSwTime(oldTime + (performance.now() - start));
                raf = requestAnimationFrame(step);
            };
            raf = requestAnimationFrame(step);
        }
        return () => cancelAnimationFrame(raf);
    }, [swRunning, oldTime]);

    // Timer Decrement
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTimerRunning && timerCurrent > 0) {
            interval = setInterval(() => setTimerCurrent(prev => prev - 1), 1000);
        } else if (isTimerRunning && timerCurrent <= 0) {
            setIsTimerRunning(false);
            setFiringTimer(true);
            playRingtone(timerRingtoneId, customRingtones, { userName: userProfile.name, label: 'Timer Completed' });
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, timerCurrent, timerRingtoneId, customRingtones, userProfile.name]);

    // Background Ticking for Stopwatch Tab
    useEffect(() => {
        let tickInterval: any;
        let localCtx: AudioContext | null = null;
        if ((activeTab === 'stopwatch' && swRunning) || (activeTab === 'timer' && isTimerRunning)) {
            try {
                const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                if (AudioContextClass) {
                    localCtx = new AudioContextClass();
                    tickInterval = setInterval(() => {
                        if (localCtx) {
                            if (activeTab === 'stopwatch') {
                                playOsc(localCtx, 'square', 1200, 0.01, 0.02, 0.001); // sharp tick
                            } else {
                                playOsc(localCtx, 'square', 900, 0.01, 0.02, 0.001); // slightly lower pitch for timer
                            }
                        }
                    }, 1000);
                }
            } catch (e) {
                console.error("AudioContext issue", e);
            }
        }
        return () => {
            if (tickInterval) clearInterval(tickInterval);
            if (localCtx) localCtx.close().catch(() => {});
        };
    }, [activeTab, swRunning, isTimerRunning]);

    useEffect(() => {
        if (!isTimerRunning) {
            setTimerCurrent(timerSettings.h * 3600 + timerSettings.m * 60 + timerSettings.s);
        }
    }, [timerSettings, isTimerRunning]);

    const handleDismiss = () => {
        setFiringAlarm(null);
        setFiringTimer(false);
        stopRingtonePlay();
    };

    const formatStopwatch = (ms: number) => {
        const m = Math.floor(ms / 60000);
        const s = Math.floor((ms % 60000) / 1000);
        const cs = Math.floor((ms % 1000) / 10);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
    };

    const renderTimer = () => {
        const pct = Math.max(0, Math.min(1, timerCurrent / Math.max(totalTimerSeconds, 1)));
        const dashOffset = 157.08 * (1 - pct);

        return (
            <div className="flex-1 flex flex-col items-center justify-center relative pb-24 overflow-hidden w-full max-w-sm mx-auto p-6">
                <button onClick={() => setShowTimerSetup(true)} className="absolute top-4 right-4 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-white/10 border border-white/20 text-white backdrop-blur-md active:scale-95 flex items-center gap-2 transition-all hover:bg-white/20">
                    <Settings className="w-4 h-4" /> Edit
                </button>
                
                <div className="relative w-64 h-64 flex items-center justify-center my-8">
                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-2xl">
                        <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="50" className="opacity-10 text-black" />
                        <circle cx="50" cy="50" r="25" fill="none" stroke="white" strokeWidth="50"
                            strokeDasharray="157.08"
                            strokeDashoffset={dashOffset}
                            className="transition-all duration-1000 ease-linear opacity-90" />
                    </svg>
                    <div className="z-10 flex flex-col items-center justify-center text-white drop-shadow-md">
                        <span className="text-4xl font-black font-mono tracking-tighter">
                            {Math.floor(timerCurrent / 3600).toString().padStart(2, '0')}:
                            {Math.floor((timerCurrent % 3600) / 60).toString().padStart(2, '0')}:
                            {(timerCurrent % 60).toString().padStart(2, '0')}
                        </span>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mt-1">Time Left</p>
                    </div>
                </div>

                <div className="flex items-center justify-center relative w-full px-8 mt-4 gap-6">
                    <button 
                        onClick={() => {
                            if (totalTimerSeconds === 0) return;
                            setIsTimerRunning(!isTimerRunning);
                        }}
                        className={`w-16 h-16 z-10 rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-all text-black ${isTimerRunning ? 'bg-amber-500 shadow-amber-500/30' : 'bg-white'}`}
                    >
                        {isTimerRunning ? <PauseIcon className="w-6 h-6 fill-current" /> : <PlayIcon className="w-6 h-6 fill-current ml-1" />}
                    </button>
                    <button 
                        onClick={() => { setIsTimerRunning(false); setTimerCurrent(totalTimerSeconds); }} 
                        className="w-12 h-12 flex flex-col items-center justify-center rounded-full bg-white/10 border border-white/20 text-white backdrop-blur-md active:scale-90 hover:bg-white/20 transition-all"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    };

    const renderStopwatch = () => {
        // Calculate dial properties based on swTime. Let's make one full revolution = 60 seconds (60000ms).
        const maxTime = 60000;
        const progress = (swTime % maxTime) / maxTime;
        const dashOffset = 282.74 * (1 - progress); // 2 * pi * r (where r=45) = 282.74
        
        return (
            <div className="flex-1 flex flex-col p-4 max-h-full overflow-hidden relative">
                <div className="flex justify-between items-center mb-0 shrink-0 px-2">
                    <h2 className="text-sm font-black tracking-widest text-white/50 uppercase drop-shadow-md">Stopwatch</h2>
                    <button onClick={() => onClose()} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 text-white/70 active:scale-95 transition-all">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex flex-row flex-1 pt-0 pb-6 px-0 gap-4 relative h-full">
                    <div className="flex-1 flex flex-col items-center">
                        <div className="w-56 h-56 relative flex items-center justify-center mb-4 shrink-0 mt-4">
                            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full -rotate-90">
                                {/* Outer dark ring for hours/segments */}
                                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="10" />
                                {/* Inner white dial */}
                                <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="10" 
                                    strokeDasharray="282.74" strokeDashoffset={dashOffset} className="transition-all duration-100 ease-linear" />
                                    
                                {/* Tick marks */}
                                {[...Array(60)].map((_, i) => (
                                    <line key={i} x1="50" y1="10" x2="50" y2={i % 5 === 0 ? "15" : "13"} 
                                        stroke={i % 5 === 0 ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.3)"} strokeWidth={i % 5 === 0 ? "1" : "0.5"} 
                                        transform={`rotate(${i * 6} 50 50)`} />
                                ))}
                            </svg>
                            <div className="z-10 bg-gradient-to-br from-[#c82200] to-[#ff7a00] w-[170px] h-[170px] rounded-full flex flex-col items-center justify-center shadow-inner border-[6px] border-white/10">
                                <span className="text-3xl font-black font-mono tracking-tighter text-white drop-shadow-lg">{formatStopwatch(swTime)}</span>
                            </div>
                        </div>

                        <div className="w-full flex-1 overflow-y-auto premium-scroll px-2 space-y-3 pb-8 max-h-[300px]">
                            {/* Active running lap (if any) or total */}
                            <div className="flex justify-between items-center bg-white/10 rounded-2xl p-5 border border-white/20 backdrop-blur-sm sticky top-0 z-10 shadow-lg">
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase font-black text-amber-500 mb-1">Lap {laps.length + 1}</span>
                                    <span className="font-mono font-bold text-2xl text-white drop-shadow-md">{laps.length > 0 ? formatStopwatch(swTime - laps[0].time) : formatStopwatch(swTime)}</span>
                                </div>
                                <span className="font-mono text-base text-white/70 font-semibold">{formatStopwatch(swTime)}</span>
                            </div>
                            
                            {laps.map((l, i) => (
                                <motion.div initial={{opacity:0, y: 10}} animate={{opacity:1, y:0}} key={`lap-${l.lap}-${i}`} className="flex justify-between items-center px-5 py-4 border-b border-white/5 bg-white/5 rounded-xl">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-black text-white/50 mb-1">Lap {l.lap}</span>
                                        <span className="font-mono font-bold text-xl text-white/90">{formatStopwatch(i === laps.length - 1 ? l.time : l.time - laps[i+1].time)}</span>
                                    </div>
                                    <span className="font-mono text-sm font-semibold text-white/50">{formatStopwatch(l.time)}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-6 shrink-0 h-full right-side-nav pl-4 pr-2">
                        <button 
                            onClick={() => { setSwTime(0); setLaps([]); setOldTime(0); setSwRunning(false); }}
                            className="w-14 h-14 rounded-full border border-rose-500/30 flex items-center justify-center text-rose-500 hover:bg-rose-500/10 transition-colors bg-[#020617] shadow-lg active:scale-95"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </button>

                        <button 
                            onClick={() => {
                                if (swRunning) setLaps([{ time: swTime, lap: laps.length + 1 }, ...laps]);
                            }}
                            disabled={!swRunning}
                            className={`w-14 h-14 rounded-full border flex items-center justify-center transition-colors shadow-lg font-bold text-[10px] uppercase tracking-widest ${swRunning ? 'text-white border-white/40 hover:bg-white/10 active:scale-95 bg-[#020617]' : 'text-white/20 border-white/10 bg-[#020617]/50'}`}
                        >
                            Lap
                        </button>
                        
                        <button 
                            onClick={() => {
                                if (swRunning) { setOldTime(swTime); setSwRunning(false); }
                                else { setSwRunning(true); }
                            }}
                            className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-all outline-none"
                        >
                            {swRunning ? <PauseIcon className="w-6 h-6 text-[#c82200] fill-current" /> : <PlayIcon className="w-6 h-6 text-[#c82200] fill-current ml-1" />}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderAlarms = () => (
        <div className="flex-1 p-6 space-y-4 overflow-y-auto premium-scroll pb-28 max-w-lg mx-auto w-full">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-white drop-shadow-md">Schedule</h2>
                </div>
                <button onClick={() => {
                    setNewAlarmH('08'); setNewAlarmM('30'); setNewAlarmS('00'); setNewAlarmAmPm('AM'); 
                    setShowAlarmSetup(true);
                }} className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center transition-all border border-white/20"><PlusCircleIcon className="w-5 h-5 text-white" /></button>
            </div>
            
            <div className="space-y-4">
                {alarms.length > 0 ? alarms.map(a => {
                    const matchedRingtone = customRingtones.find(r => r.id === (a.ringtoneId || defaultRingtoneId));
                    return (
                        <div key={a.id} className="p-5 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col shadow-lg relative overflow-hidden group">
                            {/* Inner glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <h4 className="text-xl font-bold tracking-tight text-white">{a.label || 'Alarm'}</h4>
                                <div className="flex gap-1">
                                    {/* Mock avatars like in the reference */}
                                    <div className="w-6 h-6 rounded-full bg-rose-500 border border-white/20 shadow-sm" />
                                    <div className="w-6 h-6 rounded-full bg-blue-500 border border-white/20 shadow-sm -ml-2" />
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-end relative z-10">
                                <div>
                                    <p className="text-xs text-white/60 mb-1">Start</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black font-mono text-white">{a.time.split(' ')[0]}</span>
                                        <span className="text-sm font-bold text-white/50">{a.time.substring(a.time.length-2)}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-white/60 mb-1">Type</p>
                                    <span className="text-lg font-bold text-white/90">{matchedRingtone?.name || 'Default'}</span>
                                </div>
                            </div>
                            
                            {/* Controls layer */}
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                <button onClick={() => setAlarms(alarms.map(ax => ax.id === a.id ? { ...ax, enabled: !ax.enabled } : ax))}
                                    className={`w-10 h-5 rounded-full relative transition-colors ${a.enabled ? 'bg-amber-500' : 'bg-black/40'}`}
                                >
                                    <div className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-300 ${a.enabled ? 'translate-x-[22px]' : 'translate-x-1'}`} />
                                </button>
                                <button onClick={() => setAlarms(alarms.filter(ax => ax.id !== a.id))} className="text-rose-400 hover:text-rose-300 transition-colors bg-black/40 rounded-full p-1">
                                     <TrashIcon className="w-3 h-3"/>
                                </button>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="py-20 text-center opacity-40 font-medium text-sm">No Schedule Planned</div>
                )}
            </div>
        </div>
    );

    const getRingtoneName = (id: string) => {
        const item = customRingtones.find(r => r.id === id);
        return item ? item.name : (id ? 'Unknown Ringtone' : 'Default Beep');
    };

    return (
        <div className={`fixed inset-0 z-[500] bg-gradient-to-br ${clockTheme.bg} ${clockTheme.text} flex flex-col font-sans overflow-hidden transition-colors duration-700`}>
            <header className="py-3 px-4 flex justify-between items-center relative z-20 backdrop-blur-md bg-black/10 border-b border-white/5">
                <button onClick={onClose} className={`p-2.5 rounded-xl border active:scale-90 transition-all ${clockTheme.bgCard} ${clockTheme.border}`}>
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black tracking-[0.3em] opacity-80 uppercase italic">Clock Apps</span>
                </div>
                <div className="relative">
                    <button onClick={() => setShowSettingsMenu(!showSettingsMenu)} className={`p-2.5 rounded-xl border active:scale-90 transition-all ${clockTheme.bgCard} ${clockTheme.border}`}>
                        <MoreVertical className="w-5 h-5 opacity-80" />
                    </button>
                    <AnimatePresence>
                        {showSettingsMenu && (
                            <motion.div 
                                key="settingsMenu"
                                initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                className={`absolute right-0 top-14 w-56 rounded-2xl ${clockTheme.bgCard} border ${clockTheme.border} p-2 shadow-2xl backdrop-blur-xl z-[600] flex flex-col gap-1`}
                            >
                                <button onClick={() => { setShowSettingsMenu(false); setShowThemeModal(true); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-left text-xs font-black uppercase tracking-wider">
                                    <Palette className="w-4 h-4" /> Select Theme
                                </button>
                                <button onClick={() => { setShowSettingsMenu(false); setRingtonePickerTarget('global'); setShowRingtoneModal(true); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-left text-xs font-black uppercase tracking-wider">
                                    <Music className="w-4 h-4" /> Ringtone Set
                                </button>
                                <div className="h-px bg-white/10 my-1 w-full" />
                                <button onClick={() => { 
                                    if(confirm('Are you sure you want to reset all clock settings and schedules?')) {
                                        localStorage.removeItem(`sifra_alarms_v4_${userProfile.userId}`);
                                        localStorage.removeItem('sifra_clock_theme');
                                        localStorage.removeItem('sifra_clock_ringtone_v2');
                                        localStorage.removeItem('sifra_timer_settings');
                                        localStorage.removeItem('sifra_timer_ringtone_v2');
                                        window.location.reload();
                                    }
                                }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-500/20 text-rose-500 transition-colors text-left text-xs font-black uppercase tracking-wider">
                                    <RotateCcw className="w-4 h-4" /> Factory Reset
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </header>

            <main className="flex-1 relative z-10 flex flex-col overflow-hidden w-full max-w-md mx-auto">
                <AnimatePresence mode="wait">
                    {activeTab === 'clock' && (
                        <motion.div key="clock" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col p-6 pb-24 overflow-y-auto premium-scroll">
                            <div className="w-full max-w-sm mx-auto flex flex-col min-h-full">
                                {/* Top minimal summary */}
                                <div className="mb-auto mt-4">
                                    <h1 className="text-xl font-bold tracking-tight text-white mb-2 drop-shadow-sm">
                                        Good {time.getHours() < 12 ? 'morning' : time.getHours() < 18 ? 'afternoon' : 'evening'}, <span className="text-white/80">{userProfile.name || 'User'}</span>
                                    </h1>
                                    <p className="text-sm font-medium text-white/70 leading-relaxed">
                                        You have <span className="inline-flex items-center gap-1 border border-white/20 bg-white/10 px-1.5 py-0.5 rounded-md mx-0.5"><CalIcon className="w-3.5 h-3.5"/> {alarms.length} tasks</span> planned, <span className="inline-flex items-center gap-1 border border-white/20 bg-white/10 px-1.5 py-0.5 rounded-md mx-0.5"><BellIcon className="w-3.5 h-3.5"/> {alarms.filter(a => a.enabled).length} active</span>.
                                    </p>
                                </div>
                                
                                {/* Center time */}
                                <div className="flex flex-col items-center justify-center py-16">
                                    <h2 className="text-8xl font-black tracking-tighter leading-none text-white drop-shadow-xl flex items-baseline">
                                        {time.getHours().toString().padStart(2, '0')}
                                        <span className="mx-1 text-white/50 font-light">:</span>
                                        {time.getMinutes().toString().padStart(2, '0')}
                                    </h2>
                                    <div className="mt-6 text-center space-y-1">
                                        <p className="text-lg font-bold uppercase tracking-widest text-white/80">{time.toLocaleDateString('en-US', { weekday: 'long' })}</p>
                                        <p className="text-sm font-medium text-white/50">{time.toLocaleDateString('en-US', { day: '2-digit', month: 'long' })}</p>
                                    </div>
                                </div>

                                {/* Bottom scrolling content area */}
                                <div className="mt-auto space-y-4">
                                     {alarms.filter(a => a.enabled).length > 0 ? (
                                          <div className="p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                                              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Up Next</p>
                                              <div className="flex justify-between items-end">
                                                  <span className="font-bold text-white/90 text-lg">{alarms.filter(a => a.enabled)[0].label || 'Alarm'}</span>
                                                  <span className="font-mono text-2xl font-black text-white">{alarms.filter(a => a.enabled)[0].time.split(' ')[0]}<span className="text-sm ml-1 text-white/50">{alarms.filter(a => a.enabled)[0].time.split(' ')[1]}</span></span>
                                              </div>
                                          </div>
                                     ) : (
                                         <div className="p-4 text-center opacity-40 font-medium text-sm border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm">
                                             Schedule is clear
                                         </div>
                                     )}

                                     <div className="mt-4 p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl relative overflow-hidden group">
                                         <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-600/5" />
                                         <div className="relative z-10 flex flex-col items-center text-center gap-3">
                                             <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                                 <SparklesIcon className="w-5 h-5 text-indigo-400" />
                                             </div>
                                             <p className="text-xs font-bold text-white/80 leading-relaxed">
                                                 Do you have a special task or day to plan? Tell me, I will connect with the calendar and manage the day and time for you.
                                             </p>
                                             <button onClick={() => alert("Sifra AI Calendar planning will be activated!")} className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 mt-2 px-6 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 active:scale-95 transition-all">
                                                 Plan with Sifra
                                             </button>
                                         </div>
                                     </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    {activeTab === 'stopwatch' && <motion.div key="sw" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">{renderStopwatch()}</motion.div>}
                    {activeTab === 'timer' && <motion.div key="timer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">{renderTimer()}</motion.div>}
                    {activeTab === 'alarm' && <motion.div key="alarm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">{renderAlarms()}</motion.div>}
                </AnimatePresence>
            </main>

            <footer className="absolute bottom-0 inset-x-0 h-24 flex items-center justify-center z-20 pb-6 px-6 bg-gradient-to-t from-black/80 to-transparent">
                <div className={`backdrop-blur-3xl border rounded-full flex items-center gap-3 p-2.5 shadow-2xl ${clockTheme.bgCard} ${clockTheme.border}`}>
                    {[
                        { id: 'alarm', icon: <BellIcon /> },
                        { id: 'clock', icon: <ClockIcon /> },
                        { id: 'stopwatch', icon: <StopIcon /> },
                        { id: 'timer', icon: <SparklesIcon /> }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as ClockTab)}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all bg-transparent active:scale-90 ${activeTab === tab.id ? 'bg-white text-black shadow-lg shadow-white/20' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}
                        >
                            {React.cloneElement(tab.icon as React.ReactElement, { className: "w-6 h-6 fill-current" })}
                        </button>
                    ))}
                </div>
            </footer>

            {/* Overlays / Modals */}
            <AnimatePresence>
                {showThemeModal && (
                    <motion.div key="themeModal" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 z-[600] bg-black/60 backdrop-blur-xl flex items-center justify-center p-6">
                        <div className="w-full max-w-sm bg-[#050505] border border-white/10 p-6 rounded-[2rem] shadow-2xl space-y-4">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black italic tracking-tighter text-white">Select Theme</h3>
                                <button onClick={() => setShowThemeModal(false)} className="p-2 bg-white/5 rounded-full"><X className="w-5 h-5" /></button>
                            </div>
                            {CLOCK_THEMES.map(t => (
                                <button key={t.id} onClick={() => { setActiveThemeId(t.id); setShowThemeModal(false); }} className={`w-full p-4 rounded-2xl border transition-all text-left flex justify-between items-center ${activeThemeId === t.id ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 bg-white/5'}`}>
                                    <span className="text-sm font-black uppercase tracking-wider text-white">{t.name}</span>
                                    {activeThemeId === t.id && <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {showRingtoneModal && (
                    <motion.div key="ringtoneModal" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 z-[600] bg-black/60 backdrop-blur-xl flex flex-col items-center justify-center p-4">
                        <div className="w-full max-w-md bg-[#080808] border border-white/10 p-6 rounded-[2rem] shadow-2xl flex flex-col h-[85vh]">
                            <div className="flex justify-between items-center mb-4 shrink-0">
                                <div>
                                    <h3 className="text-xl font-black italic tracking-tighter text-white">Custom Ringtones</h3>
                                    <p className="text-[10px] uppercase font-black tracking-widest text-white/40">Select Your Sound</p>
                                </div>
                                <button onClick={() => { stopRingtonePlay(); setShowRingtoneModal(false); }} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors"><X className="w-5 h-5" /></button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto space-y-4 premium-scroll pr-2 pb-6">
                                <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10 shrink-0">
                                    <div>
                                        <h4 className="text-sm font-black text-amber-500 uppercase tracking-widest">Import Sounds</h4>
                                        <p className="text-[10px] text-white/40">Add MP3, WAV</p>
                                    </div>
                                    <label className="p-3 bg-amber-500 text-black rounded-xl cursor-pointer text-xs font-black uppercase tracking-widest active:scale-95 transition-all">
                                        + File
                                        <input type="file" accept="audio/*" className="hidden" onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = async (ev) => {
                                                    const dataUrl = ev.target?.result as string;
                                                    const newId = `cr_${Date.now()}`;
                                                    await saveRingtone(newId, file.name, dataUrl);
                                                    const all = await getRingtones();
                                                    setCustomRingtones([...BUILT_IN_RINGTONES, ...all]);
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }} />
                                    </label>
                                </div>
                                
                                <div className="space-y-2">
                                    {customRingtones.length > 0 ? customRingtones.map((r) => {
                                        const isSelected = 
                                            (ringtonePickerTarget === 'global' && defaultRingtoneId === r.id) ||
                                            (ringtonePickerTarget === 'timer' && timerRingtoneId === r.id) ||
                                            (ringtonePickerTarget === 'new_alarm' && newAlarmRingtoneId === r.id);
                                        
                                        return (
                                            <div key={r.id} className={`w-full p-4 rounded-2xl border transition-all text-left flex justify-between items-center group ${isSelected ? 'border-amber-500 bg-amber-500/10' : 'border-white/5 bg-white/[0.02] hover:bg-white/10'}`}>
                                                <button 
                                                    onClick={() => { 
                                                        if(ringtonePickerTarget === 'global') setDefaultRingtoneId(r.id);
                                                        if(ringtonePickerTarget === 'timer') setTimerRingtoneId(r.id);
                                                        if(ringtonePickerTarget === 'new_alarm') setNewAlarmRingtoneId(r.id);
                                                        playRingtone(r.id, customRingtones, { userName: userProfile.name, label: 'Preview' }); 
                                                    }} 
                                                    className="flex-1 flex items-center overflow-hidden"
                                                >
                                                    <span className={`text-xs font-bold uppercase tracking-wider truncate max-w-xs ${isSelected ? 'text-amber-500' : 'text-white/80'}`}>{r.name}</span>
                                                    {isSelected ? <div className="ml-3 w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] shrink-0" /> : <PlayIcon className="ml-3 w-4 h-4 text-white/20 group-hover:text-amber-500 transition-colors shrink-0" />}
                                                </button>
                                                {!r.isBuiltIn && (
                                                    <button onClick={async () => {
                                                        await deleteRingtone(r.id);
                                                        setCustomRingtones([...BUILT_IN_RINGTONES, ...(await getRingtones())]);
                                                        if(defaultRingtoneId === r.id) setDefaultRingtoneId('');
                                                        if(timerRingtoneId === r.id) setTimerRingtoneId('');
                                                        if(newAlarmRingtoneId === r.id) setNewAlarmRingtoneId('');
                                                    }} className="ml-4 p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg active:scale-95 shrink-0">
                                                        <TrashIcon className="w-5 h-5"/>
                                                    </button>
                                                )}
                                            </div>
                                        )
                                    }) : (
                                        <div className="py-10 text-center opacity-30 italic text-xs uppercase tracking-widest border border-dashed border-white/20 rounded-2xl">
                                            No Ringtones Imported
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="mt-4 shrink-0">
                                <button onClick={() => { stopRingtonePlay(); setShowRingtoneModal(false); }} className="w-full py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-colors">Confirm Selection</button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {showTimerSetup && (
                    <motion.div key="timerSetup" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 z-[600] bg-black/60 backdrop-blur-xl flex items-center justify-center p-6">
                        <div className="w-full max-w-sm bg-[#080808] border border-white/10 p-8 rounded-[2rem] shadow-2xl">
                            <h3 className="text-xl font-black italic tracking-tighter text-white mb-2 text-center">Set Timer</h3>
                            <p className="text-[10px] text-white/40 uppercase font-black tracking-widest text-center mb-6">Customize Duration & Sound</p>
                            
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const fd = new FormData(e.currentTarget as HTMLFormElement);
                                setTimerSettings({
                                    h: Number(fd.get('hh') || 0),
                                    m: Number(fd.get('mm') || 0),
                                    s: Number(fd.get('ss') || 0)
                                });
                                setIsTimerRunning(false);
                                setShowTimerSetup(false);
                            }} className="space-y-6">
                                <div className="flex border border-white/10 rounded-xl bg-white/5 p-2 gap-2">
                                    <div className="flex-1 flex flex-col items-center">
                                        <select name="hh" defaultValue={timerSettings.h} className="w-full p-2 bg-transparent text-center text-2xl font-black font-mono text-white outline-none">
                                            {[...Array(100)].map((_,i) => <option key={i} value={i} className="bg-black text-sm">{String(i).padStart(2,'0')}</option>)}
                                        </select>
                                        <span className="text-[8px] uppercase font-black tracking-widest text-white/40">Hour</span>
                                    </div>
                                    <div className="flex-1 flex flex-col items-center border-l border-white/5">
                                        <select name="mm" defaultValue={timerSettings.m} className="w-full p-2 bg-transparent text-center text-2xl font-black font-mono text-white outline-none">
                                            {[...Array(60)].map((_,i) => <option key={i} value={i} className="bg-black text-sm">{String(i).padStart(2,'0')}</option>)}
                                        </select>
                                        <span className="text-[8px] uppercase font-black tracking-widest text-white/40">Min</span>
                                    </div>
                                    <div className="flex-1 flex flex-col items-center border-l border-white/5">
                                        <select name="ss" defaultValue={timerSettings.s} className="w-full p-2 bg-transparent text-center text-2xl font-black font-mono text-white outline-none">
                                            {[...Array(60)].map((_,i) => <option key={i} value={i} className="bg-black text-sm">{String(i).padStart(2,'0')}</option>)}
                                        </select>
                                        <span className="text-[8px] uppercase font-black tracking-widest text-white/40">Sec</span>
                                    </div>
                                </div>
                                
                                <button type="button" onClick={() => { setRingtonePickerTarget('timer'); setShowRingtoneModal(true); }} className="w-full p-4 rounded-xl border border-white/10 bg-white/5 flex justify-between items-center hover:bg-white/10 transition-colors">
                                    <div className="text-left">
                                        <span className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">When Timer Ends</span>
                                        <span className="text-sm font-bold text-white truncate max-w-[200px] block">{getRingtoneName(timerRingtoneId)}</span>
                                    </div>
                                    <Music className="w-4 h-4 text-amber-500" />
                                </button>

                                <div className="flex gap-4 pt-2">
                                    <button type="button" onClick={() => setShowTimerSetup(false)} className="flex-1 py-4 bg-white/5 rounded-xl font-black uppercase tracking-widest text-xs text-white/60">Cancel</button>
                                    <button type="submit" className="flex-1 py-4 bg-amber-500 text-black rounded-xl font-black uppercase tracking-widest text-xs">Save</button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}

                {showAlarmSetup && (
                    <motion.div key="alarmSetup" initial={{opacity:0, y: 20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:20}} className="absolute inset-0 z-[600] bg-[#050505] flex flex-col p-6">
                        <div className="flex justify-between items-center mb-8 shrink-0">
                            <div>
                                <h3 className="text-2xl font-black italic tracking-tighter text-white">New Alarm</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Configure Schedule</p>
                            </div>
                            <button onClick={() => setShowAlarmSetup(false)} className="p-3 bg-white/5 rounded-full hover:bg-white/10"><X className="w-5 h-5" /></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto space-y-6 premium-scroll pb-10">
                            {/* Time Picker */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2 mb-2 block">Set Time (Hr : Min : Sec)</label>
                                <div className="flex flex-col gap-2">
                                    <div className="flex border border-white/10 rounded-2xl bg-white/5 overflow-hidden p-2">
                                        <select value={newAlarmH} onChange={(e)=>setNewAlarmH(e.target.value)} className="flex-1 p-3 bg-transparent text-center text-3xl font-black font-mono text-white outline-none">
                                            {[...Array(12)].map((_,i) => <option key={i} value={String(i+1).padStart(2,'0')} className="bg-black text-lg">{String(i+1).padStart(2,'0')}</option>)}
                                        </select>
                                        <div className="w-[1px] bg-white/10" />
                                        <select value={newAlarmM} onChange={(e)=>setNewAlarmM(e.target.value)} className="flex-1 p-3 bg-transparent text-center text-3xl font-black font-mono text-white outline-none">
                                            {[...Array(60)].map((_,i) => <option key={i} value={String(i).padStart(2,'0')} className="bg-black text-lg">{String(i).padStart(2,'0')}</option>)}
                                        </select>
                                        <div className="w-[1px] bg-white/10" />
                                        <select value={newAlarmS} onChange={(e)=>setNewAlarmS(e.target.value)} className="flex-1 p-3 bg-transparent text-center text-3xl font-black font-mono text-white outline-none">
                                            {[...Array(60)].map((_,i) => <option key={i} value={String(i).padStart(2,'0')} className="bg-black text-lg">{String(i).padStart(2,'0')}</option>)}
                                        </select>
                                        <div className="w-[1px] bg-white/10" />
                                        <div className="flex flex-col w-12">
                                            <button type="button" onClick={() => setNewAlarmAmPm('AM')} className={`flex-1 text-[10px] font-black uppercase ${newAlarmAmPm === 'AM' ? 'bg-amber-500 text-black rounded-md' : 'text-white/40'}`}>AM</button>
                                            <button type="button" onClick={() => setNewAlarmAmPm('PM')} className={`flex-1 text-[10px] font-black uppercase ${newAlarmAmPm === 'PM' ? 'bg-amber-500 text-black rounded-md' : 'text-white/40'}`}>PM</button>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => setNewAlarmDate(new Date().toISOString().split('T')[0])} className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${newAlarmDate === new Date().toISOString().split('T')[0] ? 'bg-amber-500 text-black' : 'bg-white/5 text-white/60 border border-white/10'}`}>Today</button>
                                        <button type="button" onClick={() => {
                                            const tmrw = new Date();
                                            tmrw.setDate(tmrw.getDate() + 1);
                                            setNewAlarmDate(tmrw.toISOString().split('T')[0]);
                                        }} className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${newAlarmDate !== '' && newAlarmDate !== new Date().toISOString().split('T')[0] ? 'bg-amber-500 text-black' : 'bg-white/5 text-white/60 border border-white/10'}`}>Tomorrow</button>
                                    </div>
                                </div>
                            </div>

                            {/* Label */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2 mb-2 block">Reason / Label</label>
                                <input type="text" value={newAlarmLabel} onChange={(e)=>setNewAlarmLabel(e.target.value)} placeholder="What is this for?" className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white outline-none focus:border-amber-500 transition-colors" />
                            </div>

                            {/* Ringtone */}
                            <button type="button" onClick={() => { setRingtonePickerTarget('new_alarm'); setShowRingtoneModal(true); }} className="w-full p-4 rounded-xl border border-white/10 bg-white/5 flex justify-between items-center hover:bg-white/10 transition-colors text-left">
                                <div>
                                    <span className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Ringtone</span>
                                    <span className="text-sm font-bold text-white max-w-[220px] truncate block">{getRingtoneName(newAlarmRingtoneId)}</span>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-full">Change</span>
                            </button>

                            {/* Advanced Toggle */}
                            <div className="pt-2 border-t border-white/10">
                                <button type="button" onClick={() => setShowAdvancedAlarm(!showAdvancedAlarm)} className="w-full py-4 flex justify-between items-center text-white/60 hover:text-white transition-colors">
                                    <span className="text-[10px] font-black uppercase tracking-widest">Advanced Features</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedAlarm ? 'rotate-180' : ''}`} />
                                </button>
                                
                                <AnimatePresence>
                                    {showAdvancedAlarm && (
                                        <motion.div key="adv_alarm" initial={{opacity:0, height: 0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height: 0}} className="overflow-hidden">
                                            <div className="pt-2 pb-4">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2 mb-2 flex items-center gap-2">
                                                    Specific Date <span className="opacity-50">(Optional)</span>
                                                </label>
                                                <div className="relative">
                                                    <CalIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                                    <input type="date" value={newAlarmDate} onChange={(e)=>setNewAlarmDate(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white outline-none focus:border-amber-500 transition-colors [&::-webkit-calendar-picker-indicator]:invert" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4 shrink-0 border-t border-white/10">
                            <button type="button" onClick={() => setShowAlarmSetup(false)} className="flex-1 py-5 bg-white/5 rounded-2xl text-xs font-black uppercase tracking-widest text-white/60">Cancel</button>
                            <button type="button" onClick={() => {
                                const newTime = `${newAlarmH}:${newAlarmM}:${newAlarmS} ${newAlarmAmPm}`;
                                setAlarms([...alarms, { 
                                    id: `al-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
                                    time: newTime, 
                                    label: newAlarmLabel || 'Alarm', 
                                    enabled: true, 
                                    ringtoneId: newAlarmRingtoneId,
                                    date: newAlarmDate || undefined
                                }]);
                                setShowAlarmSetup(false);
                            }} className="flex-1 py-5 bg-amber-500 text-black rounded-2xl text-xs font-black uppercase tracking-widest">Create Alarm</button>
                        </div>
                    </motion.div>
                )}

                {(firingAlarm || firingTimer) && (
                    <motion.div key="firingOverlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 z-[700] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-8 overflow-hidden">
                        <motion.div initial={{scale:0.8, opacity:0}} animate={{scale:[1, 1.5, 1], opacity:[0.5, 0, 0.5]}} transition={{repeat:Infinity, duration:3, ease:"easeInOut"}} className="absolute inset-0 m-auto w-64 h-64 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
                        <motion.div initial={{scale:0.8, opacity:0}} animate={{scale:[1, 2, 1], opacity:[0.2, 0, 0.2]}} transition={{repeat:Infinity, duration:2, ease:"easeInOut", delay: 0.5}} className="absolute inset-0 m-auto w-96 h-96 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
                        
                        <motion.div initial={{scale: 0.9, y: 20}} animate={{scale:1, y: 0}} className="w-full max-w-sm p-10 bg-[#050505] rounded-[3rem] border border-white/10 shadow-[0_0_150px_rgba(245,158,11,0.15)] text-center flex flex-col items-center gap-6 relative z-10">
                            <motion.div animate={{ rotate: [0, -10, 10, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 1 }}>
                                <BellIcon className="w-20 h-20 text-amber-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]" />
                            </motion.div>
                            <div>
                                <h1 className="text-4xl font-black text-white italic tracking-tighter">
                                    {firingAlarm ? firingAlarm.time.split(' ')[0] : 'Time\'s Up'}
                                </h1>
                                <p className="text-[12px] font-black uppercase tracking-widest text-amber-500 mt-3 drop-shadow-md">
                                    {firingAlarm ? firingAlarm.label : 'Timer Completed'}
                                </p>
                            </div>
                            <button onClick={handleDismiss} className="mt-8 w-full py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest active:scale-95 transition-all text-sm shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                                Dismiss Alarm
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SifraClockView;
