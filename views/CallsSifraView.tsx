import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, PhoneCall, PhoneOff, PhoneIncoming, PhoneOutgoing, PhoneMissed,
  Video, VideoOff, Mic, MicOff, Volume2, VolumeX, Plus, Search, Trash2, 
  MoreVertical, Calendar, MapPin, MessageCircle, UserPlus, Camera, 
  RefreshCw, Grid, ChevronLeft, X, Sparkles, Check, Ear,
  Gamepad2, Music, Book, Languages, Camera as CameraIcon, Heart
} from 'lucide-react';
import { UserProfile } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

export interface CallRecord {
  id: string;
  contactName: string;
  avatar: string;
  date: string;
  timestamp: string;
  duration: string;
  durationSeconds: number;
  status: 'incoming' | 'outgoing' | 'missed';
  location: string;
  tagline?: string;
  notes?: string;
}

interface CallsSifraViewProps {
  userProfile: UserProfile;
  onClose: () => void;
}

// DTMF tone frequencies
const DTMF_FREQS: Record<string, [number, number]> = {
  '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
  '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
  '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
  '*': [941, 1209], '0': [941, 1336], '#': [941, 1477],
};

const INITIAL_CALL_HISTORY: CallRecord[] = [
  {
    id: 'call-1',
    contactName: 'SIFRA Neural AI',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    date: '22 January, 2026',
    timestamp: '11:30 AM',
    duration: '04:22',
    durationSeconds: 262,
    status: 'incoming',
    location: '1200 Neural Core, Cloud Gateway',
    tagline: 'HeartBeat / AI Live Voice Session'
  },
  {
    id: 'call-2',
    contactName: 'Riya Neural Companion',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    date: '20 January, 2026',
    timestamp: '09:15 PM',
    duration: '12:45',
    durationSeconds: 765,
    status: 'outgoing',
    location: 'Dhaka - Kolkata Quantum Node',
    tagline: 'Quantum Leap / Dual Mode Call'
  },
  {
    id: 'call-3',
    contactName: 'SIFRA Support Desk',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    date: '18 January, 2026',
    timestamp: '03:40 PM',
    duration: '00:00',
    durationSeconds: 0,
    status: 'missed',
    location: 'System Operation Center',
    tagline: 'Missed Call Alert'
  }
];

export const CallsSifraView: React.FC<CallsSifraViewProps> = ({ userProfile, onClose }) => {
  // Navigation State inside SIFRA Call: 'history' (Screen 1) | 'detail' (Screen 2) | 'activeCall' (Screen 3)
  const [screen, setScreen] = useState<'history' | 'detail' | 'activeCall'>('history');
  const [activeTab, setActiveTab] = useState<'history' | 'contacts'>('history');
  
  // Call History State
  const [callHistory, setCallHistory] = useLocalStorage<CallRecord[]>('sifra_call_history_v2', INITIAL_CALL_HISTORY);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<CallRecord | null>(INITIAL_CALL_HISTORY[0]);

  // Active Call State (Screen 3)
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState<boolean>(true);
  const [isVideoOn, setIsVideoOn] = useState<boolean>(true);
  const [isFrontCamera, setIsFrontCamera] = useState<boolean>(true);
  const [showKeypad, setShowKeypad] = useState<boolean>(false);
  const [dialedDigits, setDialedDigits] = useState<string>('');
  const [isNearEar, setIsNearEar] = useState<boolean>(false);
  const [proximitySupported, setProximitySupported] = useState<boolean>(false);
  const [callStatusText, setCallStatusText] = useState<string>('Connected');

  // Live Speech & Subtitle States - Empty initially as requested
  const [liveUserSubtitle, setLiveUserSubtitle] = useState<string>('');
  const [liveSifraSubtitle, setLiveSifraSubtitle] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Audio & Hardware Refs
  const userVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMicMutedRef = useRef<boolean>(false);
  const isSpeakerOnRef = useRef<boolean>(true);
  const isCallActiveRef = useRef<boolean>(false);

  // Keep refs in sync
  useEffect(() => {
    isMicMutedRef.current = isMicMuted;
  }, [isMicMuted]);

  useEffect(() => {
    isSpeakerOnRef.current = isSpeakerOn;
    if (activeAudioRef.current) {
      activeAudioRef.current.muted = !isSpeakerOn;
    }
  }, [isSpeakerOn]);

  // Format call duration as HH:MM:SS (matching reference '00:40:22')
  const formattedCallDuration = useMemo(() => {
    const hours = Math.floor(callDuration / 3600);
    const mins = Math.floor((callDuration % 3600) / 60);
    const secs = callDuration % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [callDuration]);

  // Proximity Sensor Integration
  useEffect(() => {
    let sensor: any = null;

    // Check for Generic Sensor API ProximitySensor
    if ('ProximitySensor' in window) {
      try {
        sensor = new (window as any).ProximitySensor();
        sensor.addEventListener('reading', () => {
          if (sensor.distance !== null) {
            // Under 5cm or near threshold
            const near = sensor.distance < 5 || sensor.near;
            setIsNearEar(Boolean(near));
          }
        });
        sensor.addEventListener('error', (err: any) => {
          console.warn('Proximity sensor error:', err);
        });
        sensor.start();
        setProximitySupported(true);
      } catch (e) {
        console.warn('ProximitySensor constructor failed:', e);
      }
    } else if ('onuserproximity' in window || 'ondeviceproximity' in window) {
      // Legacy user proximity event
      const handleUserProximity = (event: any) => {
        setIsNearEar(Boolean(event.near));
      };
      window.addEventListener('userproximity', handleUserProximity);
      setProximitySupported(true);
      return () => {
        window.removeEventListener('userproximity', handleUserProximity);
      };
    }

    return () => {
      if (sensor) {
        try { sensor.stop(); } catch (e) { /* ignore */ }
      }
    };
  }, []);

  // Web Audio DTMF Tone Generator
  const playDTMF = useCallback((key: string) => {
    const freqs = DTMF_FREQS[key];
    if (!freqs) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.value = freqs[0];
      osc2.frequency.value = freqs[1];

      gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.16);
      osc2.stop(ctx.currentTime + 0.16);
    } catch (e) {
      console.warn('DTMF audio error:', e);
    }
  }, []);

  // Synthesize and speak assistant reply in Bengali
  const speakSifraReply = useCallback(async (textToSpeak: string) => {
    if (!isCallActiveRef.current) return;

    // Interrupt any ongoing playback
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(true);
    setLiveSifraSubtitle(textToSpeak);

    try {
      const response = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSpeak,
          locale: 'bn-BD',
          voiceId: 'EXAVITQu4vr4xnSDxMaL' // SIFRA Female Voice
        })
      });

      if (response.ok && response.headers.get('Content-Type')?.includes('audio')) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        activeAudioRef.current = audio;
        audio.muted = !isSpeakerOnRef.current;

        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(url);
          // Restart listening after speaking
          if (isCallActiveRef.current && !isMicMutedRef.current && recognitionRef.current) {
            try { recognitionRef.current.start(); } catch (e) { /* ignore */ }
          }
        };

        audio.onerror = () => {
          fallbackSpeechSynthesis(textToSpeak);
        };

        await audio.play();
        return;
      } else {
        fallbackSpeechSynthesis(textToSpeak);
      }
    } catch (err) {
      console.warn('Backend TTS failed, using browser fallback:', err);
      fallbackSpeechSynthesis(textToSpeak);
    }
  }, []);

  const fallbackSpeechSynthesis = useCallback((text: string) => {
    if (!('speechSynthesis' in window) || !isCallActiveRef.current) {
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const bengaliVoice = voices.find(v => v.lang.startsWith('bn')) ||
      voices.find(v => v.lang.startsWith('hi')) ||
      voices.find(v => v.name.toLowerCase().includes('female'));
    
    if (bengaliVoice) utterance.voice = bengaliVoice;
    utterance.lang = 'bn-BD';
    utterance.rate = 0.98;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (isCallActiveRef.current && !isMicMutedRef.current && recognitionRef.current) {
        try { recognitionRef.current.start(); } catch (e) { /* ignore */ }
      }
    };
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  // Process user speech with Gemini API
  const handleUserSpeechTurn = useCallback(async (spokenText: string) => {
    const trimmed = spokenText.trim();
    if (!trimmed) return;

    setLiveUserSubtitle(trimmed);
    setCallStatusText('Thinking...');

    try {
      const res = await fetch('/api/voice/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: trimmed }],
          userName: userProfile.name || 'Rizwan',
          voiceProfileName: 'Sifra Sweet'
        })
      });

      const data = await res.json();
      const reply = data?.reply || 'আমি আপনার কথা স্পষ্ট শুনতে পাচ্ছি। অনুগ্রহ করে বলুন, আমি কী করতে পারি?';
      setCallStatusText('Speaking...');
      speakSifraReply(reply);
    } catch (err) {
      console.error('Gemini Voice error:', err);
      const fallback = 'সংযোগটি সাময়িক দুর্বল। আমি আপনার সাথেই আছি, অনুগ্রহ করে আবার বলুন।';
      speakSifraReply(fallback);
    }
  }, [userProfile, speakSifraReply]);

  // Start Live Call
  const startLiveCall = useCallback((contact: CallRecord) => {
    setSelectedContact(contact);
    setScreen('activeCall');
    setCallDuration(0);
    isCallActiveRef.current = true;
    setCallStatusText('Connecting...');
    setIsMicMuted(false);
    setIsSpeakerOn(true);
    setIsVideoOn(true);

    // Start Call Timer
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    callTimerRef.current = setInterval(() => {
      setCallDuration(d => d + 1);
    }, 1000);

    // Initialize Camera Stream for PiP
    navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
      .then(stream => {
        mediaStreamRef.current = stream;
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        console.warn('Camera/Mic permission warning:', err);
      });

    // Initialize Web Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'bn-IN';
      recognitionRef.current = recognition;

      recognition.onresult = (event: any) => {
        // Interruption handling
        if (isSpeaking) {
          if (activeAudioRef.current) activeAudioRef.current.pause();
          if ('speechSynthesis' in window) window.speechSynthesis.cancel();
          setIsSpeaking(false);
        }

        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (interim) {
          setLiveUserSubtitle(interim);
          setCallStatusText('Listening...');
        }

        if (final) {
          setLiveUserSubtitle(final);
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          handleUserSpeechTurn(final);
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error === 'no-speech') return;
        if (e.error === 'language-not-supported' && recognition.lang !== 'bn-IN') {
          recognition.lang = 'bn-IN';
          try { recognition.start(); } catch (err) {}
        }
      };

      recognition.onend = () => {
        if (isCallActiveRef.current && !isMicMutedRef.current) {
          try { recognition.start(); } catch (e) { /* ignore */ }
        }
      };

      try {
        recognition.start();
        setCallStatusText('Connected');
      } catch (e) {
        // ignore
      }
    }
  }, [userProfile, handleUserSpeechTurn, isSpeaking]);

  // End Call & Save Call Record to History
  const endCall = useCallback(() => {
    isCallActiveRef.current = false;
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    // Stop recognition
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onresult = null;
      try { recognitionRef.current.abort(); } catch (e) { /* ignore */ }
      recognitionRef.current = null;
    }

    // Stop audio
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // Stop camera/mic tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }

    // Record Call in History
    const endedDuration = callDuration;
    const mins = Math.floor(endedDuration / 60);
    const secs = endedDuration % 60;
    const durationFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    
    const newRecord: CallRecord = {
      id: `call-${Date.now()}`,
      contactName: selectedContact?.contactName || 'SIFRA Neural AI',
      avatar: selectedContact?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration: durationFormatted,
      durationSeconds: endedDuration,
      status: 'outgoing',
      location: selectedContact?.location || 'Neural Gateway Kolkata - Dhaka',
      tagline: 'Completed Live Call Session'
    };

    setCallHistory(prev => [newRecord, ...prev]);
    setScreen('history');
  }, [callDuration, selectedContact, setCallHistory]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      isCallActiveRef.current = false;
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Filter call history by search query
  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return callHistory;
    const q = searchQuery.toLowerCase();
    return callHistory.filter(c => 
      c.contactName.toLowerCase().includes(q) || 
      c.date.toLowerCase().includes(q) || 
      c.location.toLowerCase().includes(q)
    );
  }, [callHistory, searchQuery]);

  // Delete a call record
  const handleDeleteRecord = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCallHistory(prev => prev.filter(c => c.id !== id));
  };

  // Toggle Camera Front / Back
  const handleFlipCamera = () => {
    setIsFrontCamera(prev => !prev);
    // Restart camera with new facingMode if supported
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach(t => t.stop());
      navigator.mediaDevices?.getUserMedia({
        video: { facingMode: isFrontCamera ? 'environment' : 'user' },
        audio: true
      }).then(stream => {
        mediaStreamRef.current = stream;
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = stream;
        }
      }).catch(() => {});
    }
  };

  // =========================================================================
  // SCREEN 3: LIVE ACTIVE VIDEO / VOICE CALL SCREEN (Matching Reference Screen 3)
  // =========================================================================
  if (screen === 'activeCall') {
    return (
      <div className="fixed inset-0 z-[200] bg-black text-white flex flex-col justify-between overflow-hidden select-none font-sans">
        
        {/* Proximity Sensor Screen Blackout Overlay (Turns display off near ear when speaker is off) */}
        {isNearEar && !isSpeakerOn && (
          <div className="fixed inset-0 z-[300] bg-black flex flex-col items-center justify-center pointer-events-auto">
            <Ear className="w-10 h-10 text-white/20 animate-pulse mb-3" />
            <p className="text-white/40 text-xs font-medium tracking-wide">
              Display Off (Proximity Sensor Active)
            </p>
            <p className="text-white/20 text-[10px] mt-1">
              Audio routed to Earpiece • Move away to restore screen
            </p>
          </div>
        )}

        {/* Fullscreen Contact Avatar / Video Background */}
        <div className="absolute inset-0 z-0">
          <img
            src={selectedContact?.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=80"}
            alt={selectedContact?.contactName || "Contact"}
            className="w-full h-full object-cover object-center filter brightness-[0.92]"
          />
          {/* Subtle gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
        </div>

        {/* Top Floating Controls & Call Timer Header (Matching Reference Screen 3) */}
        <div className="relative z-20 flex items-start justify-between p-5 pt-8 safe-area-top">
          
          {/* Left: Contact Name & Live Status Duration */}
          <div className="flex flex-col">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight drop-shadow-md">
              {selectedContact?.contactName || 'SIFRA AI (শিপ্রা)'}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white shadow-xs">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span className="text-xs font-semibold tracking-wider font-mono">
                  {formattedCallDuration}
                </span>
              </div>
              <span className="text-[10px] text-white/70 bg-purple-900/50 backdrop-blur-md border border-purple-400/30 px-2 py-0.5 rounded-full">
                {callStatusText}
              </span>
            </div>
          </div>

          {/* Right: Picture-in-Picture (PiP) Inset User Camera Preview (Matching Reference) */}
          <div className="relative w-20 h-28 sm:w-24 sm:h-32 rounded-2xl overflow-hidden border-2 border-white/40 shadow-2xl bg-slate-900">
            {isVideoOn ? (
              <video
                ref={userVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-white/60">
                <VideoOff className="w-6 h-6 mb-1 text-white/40" />
                <span className="text-[9px]">Camera Off</span>
              </div>
            )}
            <div className="absolute bottom-1 right-1 px-1 rounded bg-black/60 text-[8px] text-white/80 font-mono">
              YOU
            </div>
          </div>

        </div>

        {/* Left Vertical Floating Action Dock (Matching Reference Screen 3) */}
        <div className="relative z-20 flex flex-col gap-3 ml-5 self-start">
          {/* Flip / Switch Camera Button */}
          <button
            onClick={handleFlipCamera}
            aria-label="Switch Camera"
            title="Switch Front/Back Camera"
            className="w-11 h-11 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-lg hover:bg-black/60 active:scale-95 transition-all"
          >
            <Camera className="w-5 h-5 text-white" />
          </button>

          {/* Add Caller / Personas Button */}
          <button
            onClick={() => alert('SIFRA Neural Conference: Multi-agent link enabled.')}
            aria-label="Add Caller"
            title="Add Participant / Persona"
            className="w-11 h-11 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-lg hover:bg-black/60 active:scale-95 transition-all"
          >
            <UserPlus className="w-5 h-5 text-white" />
          </button>

          {/* Keypad / Dialer Button */}
          <button
            onClick={() => setShowKeypad(prev => !prev)}
            aria-label="Open Keypad"
            title="Open DTMF Keypad"
            className={`w-11 h-11 rounded-2xl backdrop-blur-md border flex items-center justify-center shadow-lg active:scale-95 transition-all ${
              showKeypad ? 'bg-purple-600 text-white border-purple-400' : 'bg-black/40 border-white/20 text-white hover:bg-black/60'
            }`}
          >
            <Grid className="w-5 h-5" />
          </button>
        </div>

        {/* Live Conversation Subtitle Overlay (Bengali First - Only shows actual spoken words) */}
        <div className="relative z-20 mx-6 mb-4 flex flex-col items-center text-center">
          <div className="w-full max-w-md bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-xl space-y-1.5 min-h-[48px] flex flex-col justify-center">
            {liveUserSubtitle && (
              <p className="text-xs sm:text-sm text-purple-200">
                <span className="font-bold text-white">আপনি: </span>
                {liveUserSubtitle}
              </p>
            )}
            {liveSifraSubtitle && (
              <p className="text-xs sm:text-sm text-white font-medium leading-relaxed">
                <span className="font-bold text-pink-400">শিপ্রা: </span>
                {liveSifraSubtitle}
              </p>
            )}

            {isSpeaking && (
              <div className="flex items-center justify-center gap-1 pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
          </div>
        </div>

        {/* Floating Bottom Control Bar (Matching Reference Screen 3) */}
        <div className="relative z-20 pb-8 px-8 flex items-center justify-around max-w-sm mx-auto w-full safe-area-bottom">
          
          {/* 1. Camera Video Toggle */}
          <button
            onClick={() => setIsVideoOn(v => !v)}
            aria-label="Toggle Camera Video"
            className={`w-12 h-12 rounded-full backdrop-blur-xl border flex items-center justify-center shadow-lg active:scale-90 transition-all ${
              isVideoOn 
                ? 'bg-white/20 border-white/30 text-white hover:bg-white/30' 
                : 'bg-rose-500/80 border-rose-400 text-white'
            }`}
          >
            {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* 2. Speaker Output Toggle (Loudspeaker vs Earpiece) */}
          <button
            onClick={() => setIsSpeakerOn(s => !s)}
            aria-label="Toggle Speaker"
            title={isSpeakerOn ? "Loudspeaker Active" : "Earpiece Audio Active"}
            className={`w-12 h-12 rounded-full backdrop-blur-xl border flex items-center justify-center shadow-lg active:scale-90 transition-all ${
              isSpeakerOn 
                ? 'bg-white/20 border-white/30 text-white hover:bg-white/30' 
                : 'bg-amber-500/80 border-amber-400 text-white'
            }`}
          >
            {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <Ear className="w-5 h-5" />}
          </button>

          {/* 3. CENTER END CALL BUTTON: Large Circular Red Button (Matching Reference) */}
          <button
            onClick={endCall}
            aria-label="End Call"
            className="w-16 h-16 rounded-full bg-[#E11D48] hover:bg-rose-700 text-white flex items-center justify-center shadow-[0_10px_30px_rgba(225,29,72,0.5)] active:scale-90 transition-transform group"
          >
            <PhoneOff className="w-7 h-7 group-hover:rotate-12 transition-transform" />
          </button>

          {/* 4. Microphone Mute / Unmute */}
          <button
            onClick={() => {
              setIsMicMuted(m => {
                const next = !m;
                if (next && recognitionRef.current) {
                  try { recognitionRef.current.stop(); } catch (e) { /* ignore */ }
                } else if (!next && recognitionRef.current) {
                  try { recognitionRef.current.start(); } catch (e) { /* ignore */ }
                }
                return next;
              });
            }}
            aria-label="Toggle Microphone"
            className={`w-12 h-12 rounded-full backdrop-blur-xl border flex items-center justify-center shadow-lg active:scale-90 transition-all ${
              isMicMuted 
                ? 'bg-rose-500/80 border-rose-400 text-white' 
                : 'bg-white/20 border-white/30 text-white hover:bg-white/30'
            }`}
          >
            {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* 5. Filter / Visualizer Preset */}
          <button
            onClick={() => {
              // Simulate ear proximity for testing on laptops where hardware sensor is absent
              if (!proximitySupported) {
                setIsNearEar(n => !n);
              }
            }}
            title={proximitySupported ? "Hardware Proximity Active" : "Proximity Test (Ear Toggle)"}
            className={`w-12 h-12 rounded-full backdrop-blur-xl border flex items-center justify-center shadow-lg active:scale-90 transition-all ${
              isNearEar ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-white/20 border-white/30 text-white hover:bg-white/30'
            }`}
          >
            <Sparkles className="w-5 h-5" />
          </button>

        </div>

        {/* DTMF Keypad Slide-up Modal */}
        <AnimatePresence>
          {showKeypad && (
            <motion.div
              initial={{ opacity: 0, y: 150 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 150 }}
              className="absolute inset-x-4 bottom-24 z-40 bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 shadow-2xl max-w-sm mx-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-bold text-white/80 uppercase tracking-widest">DTMF Dialer</span>
                <span className="text-sm font-mono text-pink-400 font-bold">{dialedDigits || 'Tap Keys'}</span>
                <button onClick={() => setShowKeypad(false)} className="p-1 hover:bg-white/10 rounded-full text-white/60">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Keypad Grid 3x4 */}
              <div className="grid grid-cols-3 gap-3 pt-4">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((digit) => (
                  <button
                    key={digit}
                    onClick={() => {
                      playDTMF(digit);
                      setDialedDigits(d => d + digit);
                    }}
                    className="h-12 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-base flex flex-col items-center justify-center transition-all border border-white/5 shadow-xs"
                  >
                    <span>{digit}</span>
                  </button>
                ))}
              </div>

              {dialedDigits && (
                <button 
                  onClick={() => setDialedDigits('')}
                  className="w-full mt-3 py-1.5 text-xs text-white/50 hover:text-white transition-colors"
                >
                  Clear Digits
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    );
  }

  // =========================================================================
  // SCREEN 2: CONTACT PROFILE & CALL DETAIL SHEET (Matching Reference Screen 2)
  // =========================================================================
  if (screen === 'detail' && selectedContact) {
    return (
      <div className="fixed inset-0 z-[150] bg-gradient-to-b from-[#5c133a] via-[#480d2d] to-[#2e051c] text-white flex flex-col overflow-hidden select-none font-sans">
        
        {/* Upper Half: Full-bleed Portrait Image with Badges */}
        <div className="relative h-[48%] w-full overflow-hidden">
          <img
            src={selectedContact.avatar}
            alt={selectedContact.contactName}
            className="w-full h-full object-cover"
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#4c1233] via-transparent to-black/40" />

          {/* Top Back Button */}
          <button
            onClick={() => setScreen('history')}
            className="absolute top-6 left-5 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center active:scale-95 transition-all shadow-md"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          {/* Top-Right Location/Distance Badge (Matching Reference: '18.6 km away') */}
          <div className="absolute top-6 right-5 z-10 px-3.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-xs font-semibold text-white/90 shadow-md">
            18.6 km away
          </div>

          {/* Circular Match/AI Badge (Matching Reference: '85% Match') */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center gap-2 shadow-xl">
            <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 text-[9px] font-black flex items-center justify-center text-white">
              95%
            </span>
            <span className="text-xs font-bold text-white tracking-wide">SIFRA Match</span>
          </div>
        </div>

        {/* Lower Half: Plum Card Details (Matching Reference Screen 2) */}
        <div className="flex-1 bg-[#4c1233] rounded-t-[36px] -mt-6 relative z-10 p-6 flex flex-col justify-between overflow-y-auto no-scrollbar shadow-[0_-15px_40px_rgba(0,0,0,0.4)]">
          
          <div className="space-y-4">
            
            {/* Contact Header: Avatar, Name, ID, Phone & Message Icons */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <img
                  src={selectedContact.avatar}
                  alt={selectedContact.contactName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-pink-400/50 shadow-md"
                />
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    {selectedContact.contactName}
                  </h2>
                  <p className="text-xs text-pink-200/60 font-mono">
                    ID: 13459325 • Bengali AI
                  </p>
                </div>
              </div>

              {/* Action Icons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => startLiveCall(selectedContact)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white active:scale-95 transition-all"
                >
                  <Phone className="w-4 h-4 text-pink-300" />
                </button>
                <button
                  onClick={() => alert(`Starting SIFRA Chat session with ${selectedContact.contactName}...`)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white active:scale-95 transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-pink-300" />
                </button>
              </div>
            </div>

            {/* Description Section */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-pink-300/80 mb-1">
                Description
              </h3>
              <p className="text-xs text-white/80 leading-relaxed font-normal">
                A confident, warm-hearted AI companion who speaks fluent, natural Bengali. Always ready for thoughtful conversations, daily productivity, empathy, and inspiring insights... <span className="text-pink-400 font-semibold cursor-pointer">Read more</span>
              </p>
            </div>

            {/* Interest Chips (Matching Reference: Gaming, Music, Book, Language, Photography) */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-pink-300/80 mb-2">
                Interest
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Gaming', icon: <Gamepad2 className="w-3.5 h-3.5" /> },
                  { label: 'Music', icon: <Music className="w-3.5 h-3.5" /> },
                  { label: 'Book', icon: <Book className="w-3.5 h-3.5" /> },
                  { label: 'Language', icon: <Languages className="w-3.5 h-3.5" /> },
                  { label: 'Photography', icon: <CameraIcon className="w-3.5 h-3.5" /> },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs text-white/90"
                  >
                    <span className="text-pink-300">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Call History Stats with this Contact */}
            <div className="bg-black/20 rounded-2xl p-3 border border-white/5 flex items-center justify-around text-center">
              <div>
                <p className="text-[10px] text-white/50 uppercase">Total Calls</p>
                <p className="text-sm font-bold text-white">12 Sessions</p>
              </div>
              <div className="w-[1px] h-6 bg-white/10" />
              <div>
                <p className="text-[10px] text-white/50 uppercase">Total Talk Time</p>
                <p className="text-sm font-bold text-pink-300">48 mins</p>
              </div>
              <div className="w-[1px] h-6 bg-white/10" />
              <div>
                <p className="text-[10px] text-white/50 uppercase">Language</p>
                <p className="text-sm font-bold text-white">Bengali (বাংলা)</p>
              </div>
            </div>

          </div>

          {/* Bottom Call Action Button (Matching Reference: 'Follow' button) */}
          <div className="pt-4 pb-2">
            <button
              onClick={() => startLiveCall(selectedContact)}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white font-bold text-sm tracking-wide shadow-xl shadow-pink-600/30 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Start Live Voice Call</span>
            </button>
          </div>

        </div>

      </div>
    );
  }

  // =========================================================================
  // SCREEN 1: CALL HISTORY / MAIN SCREEN (Matching Reference Screen 1)
  // =========================================================================
  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-b from-[#5c133a] via-[#480d2d] to-[#2e051c] text-white flex flex-col justify-between overflow-hidden select-none font-sans">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Header: Back Button, Title ("Dating List" -> "SIFRA Call"), and Plus Button */}
      <header className="relative z-10 flex items-center justify-between px-5 pt-6 pb-2">
        <button
          onClick={() => {
            endCall();
            onClose();
          }}
          aria-label="Back to main app"
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-white active:scale-95 transition-all shadow-sm"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

        <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
          SIFRA Call
        </h1>

        <button
          onClick={() => {
            // Initiate fresh call with SIFRA
            if (INITIAL_CALL_HISTORY[0]) {
              startLiveCall(INITIAL_CALL_HISTORY[0]);
            }
          }}
          aria-label="Start New Call"
          title="New Live Call"
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-white active:scale-95 transition-all shadow-sm hover:bg-white/20"
        >
          <Plus className="w-5 h-5 text-white" />
        </button>
      </header>

      {/* Dual Tab Capsule Toggle (Replacing Schedule with Call History - Matching Reference) */}
      <div className="relative z-10 px-6 py-2">
        <div className="flex rounded-full bg-black/25 backdrop-blur-md p-1 border border-white/10 shadow-inner">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-purple-400/30 to-pink-500/40 text-white shadow-sm border border-white/15'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            Call History
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
              activeTab === 'contacts'
                ? 'bg-gradient-to-r from-purple-400/30 to-pink-500/40 text-white shadow-sm border border-white/15'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            AI Contacts
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative z-10 px-6 py-1">
        <div className="relative">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search call logs, dates, contacts..."
            className="w-full bg-white/10 border border-white/10 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-pink-400/50 backdrop-blur-md"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area: Call History Cards (Matching Reference Screen 1) */}
      <main className="relative z-10 flex-1 overflow-y-auto px-6 py-3 space-y-4 no-scrollbar">
        {activeTab === 'history' ? (
          filteredHistory.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-white/50 space-y-3">
              <PhoneOff className="w-12 h-12 text-white/20" />
              <p className="text-xs">কোনো কল রেকর্ড পাওয়া যায়নি।</p>
              <button
                onClick={() => startLiveCall(INITIAL_CALL_HISTORY[0])}
                className="px-4 py-2 rounded-full bg-pink-600/80 text-white text-xs font-semibold"
              >
                শিপ্রাকে কল করুন
              </button>
            </div>
          ) : (
            filteredHistory.map((call) => (
              <motion.div
                key={call.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#54163b]/90 backdrop-blur-xl border border-white/10 rounded-[28px] p-4 shadow-xl space-y-3 relative overflow-hidden"
              >
                {/* Date Header Row (Matching Reference: '22 January, 2026' with ⋮ Menu) */}
                <div className="flex items-center justify-between text-xs text-white/70 pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-pink-300" />
                    <span className="font-semibold">{call.date}</span>
                    <span className="text-[10px] text-white/40">• {call.timestamp}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Status Pill Indicator */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      call.status === 'incoming' 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : call.status === 'outgoing'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {call.status === 'incoming' && <PhoneIncoming className="w-2.5 h-2.5" />}
                      {call.status === 'outgoing' && <PhoneOutgoing className="w-2.5 h-2.5" />}
                      {call.status === 'missed' && <PhoneMissed className="w-2.5 h-2.5" />}
                      <span>{call.duration}</span>
                    </span>

                    <button
                      onClick={(e) => handleDeleteRecord(call.id, e)}
                      title="Delete call record"
                      className="p-1 hover:bg-white/10 rounded-full text-white/40 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Contact Row: Avatar, Name, Call & Message Icons (Matching Reference) */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={call.avatar}
                      alt={call.contactName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-pink-400/40 shadow-sm"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight">
                        {call.contactName}
                      </h3>
                      <p className="text-xs text-white/60">
                        {call.tagline || 'Neural Live Assistant'}
                      </p>
                    </div>
                  </div>

                  {/* Action Icons: Phone & Message */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startLiveCall(call)}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white active:scale-95 transition-all"
                    >
                      <Phone className="w-3.5 h-3.5 text-pink-300" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedContact(call);
                        setScreen('detail');
                      }}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white active:scale-95 transition-all"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-pink-300" />
                    </button>
                  </div>
                </div>

                {/* Location Row (Matching Reference: 'HeartBeat / 1200 Market St...') */}
                <div className="flex items-start gap-1.5 text-xs text-white/60 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-pink-400 shrink-0 mt-0.5" />
                  <span className="truncate">{call.location}</span>
                </div>

                {/* Two Pill Buttons: Detail and Accept/Call (Matching Reference Screen 1) */}
                <div className="flex items-center gap-3 pt-2">
                  {/* Detail Button */}
                  <button
                    onClick={() => {
                      setSelectedContact(call);
                      setScreen('detail');
                    }}
                    className="flex-1 py-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-white text-center active:scale-95 transition-all shadow-xs"
                  >
                    Detail
                  </button>

                  {/* Call Button (Accept/Call again) */}
                  <button
                    onClick={() => startLiveCall(call)}
                    className="flex-1 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-xs font-bold text-white text-center active:scale-95 transition-all shadow-md shadow-pink-500/20"
                  >
                    Call
                  </button>
                </div>

              </motion.div>
            ))
          )
        ) : (
          /* AI Contacts Directory Tab */
          <div className="space-y-3">
            {INITIAL_CALL_HISTORY.map((contact) => (
              <div
                key={contact.id}
                onClick={() => {
                  setSelectedContact(contact);
                  setScreen('detail');
                }}
                className="bg-[#54163b]/80 border border-white/10 rounded-2xl p-3 flex items-center justify-between hover:bg-[#54163b] cursor-pointer transition-all active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <img src={contact.avatar} alt={contact.contactName} className="w-11 h-11 rounded-full object-cover border border-pink-400/40" />
                  <div>
                    <h4 className="text-sm font-bold text-white">{contact.contactName}</h4>
                    <p className="text-xs text-white/60">{contact.tagline}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startLiveCall(contact);
                  }}
                  className="p-2.5 rounded-full bg-pink-500 text-white shadow-md active:scale-95"
                >
                  <Phone className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer Info Pill */}
      <footer className="relative z-10 px-6 pb-5 pt-1 text-center">
        <p className="text-[10px] text-white/40 uppercase tracking-widest">
          SIFRA Neural Call System • Real-Time Bengali Voice Link
        </p>
      </footer>

    </div>
  );
};

export default CallsSifraView;
