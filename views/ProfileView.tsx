import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, SIFRA_VOICES, SIFRA_AVATARS, THEMES, View } from '../types';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import Avatar from '../components/Avatar';
import BookOpenIcon from '../components/icons/BookOpenIcon';
import LogoutIcon from '../components/icons/LogoutIcon';
import TrashIcon from '../components/icons/TrashIcon';
import AdjustmentsHorizontalIcon from '../components/icons/AdjustmentsHorizontalIcon';
import SparklesIcon from '../components/icons/SparklesIcon';
import ShieldCheckIcon from '../components/icons/ShieldCheckIcon';
import SpeakerWaveIcon from '../components/icons/SpeakerWaveIcon';
import CheckIcon from '../components/icons/CheckIcon';
import BoltIcon from '../components/icons/BoltIcon';
import { Camera, Upload, Trash2, Mail, Phone, MapPin, User, FileText, CheckCircle2, Image as ImageIcon } from 'lucide-react';

interface ProfileViewProps {
    userProfile: UserProfile;
    onUserProfileChange: (newProfile: UserProfile) => void;
    sifraVoice: string;
    onSifraVoiceChange: (voiceId: string) => void;
    onClose: () => void;
    onNavigate: (view: View) => void;
    onLogout: () => void;
    onClearAllData: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({
    userProfile,
    onUserProfileChange,
    sifraVoice,
    onSifraVoiceChange,
    onClose,
    onNavigate,
    onLogout,
    onClearAllData
}) => {
    const [name, setName] = useState(userProfile.name || 'Rizwan');
    const [nickname, setNickname] = useState(userProfile.nickname || 'Rizwan');
    const [email, setEmail] = useState(userProfile.email || 'rizwanroushan0@gmail.com');
    const [phoneNumber, setPhoneNumber] = useState(userProfile.phoneNumber || '');
    const [location, setLocation] = useState(userProfile.location || '');
    const [bio, setBio] = useState(userProfile.bio || '');
    const [gender, setGender] = useState(userProfile.gender || 'Not Specified');
    const [avatar, setAvatar] = useState<string | null>(userProfile.avatar || null);
    const [themeId, setThemeId] = useState(userProfile.themeId);
    const [sifraAvatarId, setSifraAvatarId] = useState(userProfile.sifraAvatarId);
    const [saveHistory, setSaveHistory] = useState(userProfile.saveHistory ?? true);
    
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = () => {
        const updatedProfile: UserProfile = {
            ...userProfile,
            name: name.trim() || 'Rizwan',
            nickname: nickname.trim() || 'Rizwan',
            email: email.trim(),
            phoneNumber: phoneNumber.trim(),
            location: location.trim(),
            bio: bio.trim(),
            gender: gender,
            avatar: avatar,
            themeId,
            sifraAvatarId,
            saveHistory
        };
        onUserProfileChange(updatedProfile);
        setShowSaveSuccess(true);
        setTimeout(() => {
            setShowSaveSuccess(false);
            onClose();
        }, 1200);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setAvatar(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = () => {
        setAvatar(null);
    };

    return (
        <div className="h-full w-full overflow-hidden flex flex-col relative bg-[#030712] text-white font-sans">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-indigo-600/10 blur-[130px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[60%] bg-pink-600/10 blur-[120px] rounded-full" />
            </div>

            {/* Header */}
            <header className="relative z-20 px-6 py-4 flex items-center justify-between bg-black/40 backdrop-blur-2xl border-b border-white/5">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="w-11 h-11 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all text-white/80 hover:text-white">
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-lg font-black tracking-wider uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-gray-300">
                            প্রোফাইল স্টুডিও
                        </h1>
                        <p className="text-[8px] font-black tracking-[0.3em] uppercase text-indigo-400">Profile & Identity Setup</p>
                    </div>
                </div>
                <button 
                    onClick={handleSave} 
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:brightness-110 transition-all active:scale-95 shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                >
                    <CheckIcon className="w-4 h-4" /> Save
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto px-4 md:px-8 pb-32 premium-scroll relative z-10">
                <div className="max-w-4xl mx-auto pt-6 pb-12 flex flex-col gap-6">

                    {/* SECTION 1: PROMINENT PHOTO UPLOAD STUDIO */}
                    <div className="relative rounded-[2.5rem] p-6 md:p-8 bg-gradient-to-br from-[#0c0f1d] via-[#12162a] to-[#080a14] border-2 border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.15)] overflow-hidden">
                        {/* Ambient Top Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-center text-center">
                            
                            {/* Prominent Section Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 mb-5">
                                <Camera className="w-4 h-4 text-indigo-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">
                                    প্রোফাইল ফটো আপলোড এলাকা (Photo Studio)
                                </span>
                            </div>

                            {/* Large Prominent Avatar Display */}
                            <div className="relative group my-2">
                                <div className="w-40 h-40 md:w-48 md:h-48 rounded-[2.8rem] p-1.5 bg-gradient-to-tr from-indigo-500 via-pink-500 to-amber-400 shadow-[0_0_50px_rgba(99,102,241,0.35)] relative">
                                    <div className="w-full h-full rounded-[2.5rem] bg-[#080b14] overflow-hidden flex items-center justify-center relative">
                                        {avatar ? (
                                            <img src={avatar} className="w-full h-full object-cover" alt="Profile Avatar" />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-4 text-white/40">
                                                <ImageIcon className="w-16 h-16 stroke-[1.2] text-indigo-400/60 mb-2" />
                                                <span className="text-[9px] font-bold uppercase tracking-wider text-white/50">কোনো ছবি নেই</span>
                                            </div>
                                        )}
                                        
                                        {/* Hover Overlay */}
                                        <div 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer backdrop-blur-xs gap-1"
                                        >
                                            <Upload className="w-6 h-6 text-white" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-white">ছবি পরিবর্তন</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="absolute -bottom-2 -right-2 w-11 h-11 bg-emerald-500 rounded-2xl border-2 border-black flex items-center justify-center shadow-lg text-white">
                                    <ShieldCheckIcon className="w-5 h-5" />
                                </div>
                            </div>

                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                accept="image/*" 
                                className="hidden" 
                            />

                            {/* Prominent Action Buttons */}
                            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-xs font-black uppercase tracking-wider hover:brightness-110 active:scale-95 shadow-xl transition-all"
                                >
                                    <Upload className="w-4 h-4" />
                                    {avatar ? 'অন্য ছবি আপলোড করুন' : 'একটি ছবি আপলোড করুন (Upload Photo)'}
                                </button>
                                {avatar && (
                                    <button 
                                        onClick={handleRemovePhoto}
                                        className="flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-black uppercase tracking-wider hover:bg-rose-500/20 active:scale-95 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        ছবি সরান
                                    </button>
                                )}
                            </div>

                            <p className="text-[11px] text-white/50 font-medium mt-3 max-w-sm">
                                আপনার ফোন বা গ্যালারি থেকে যেকোনো স্পষ্ট ছবি নির্বাচন করে আপলোড করতে পারবেন।
                            </p>
                        </div>
                    </div>

                    {/* SECTION 2: CLEARLY SEPARATED USER NAME & DETAILS FORM */}
                    <div className="relative rounded-[2.5rem] p-6 md:p-8 bg-[#0a0d18] border border-white/10 shadow-2xl space-y-6">
                        {/* Section Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black uppercase tracking-wider text-white">ব্যবহারকারীর সম্পূর্ণ তথ্য</h3>
                                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">User Details & Information</p>
                                </div>
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 text-indigo-300 border border-white/10">
                                Verified Node
                            </span>
                        </div>

                        {/* Input Fields Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Full Name */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-300 flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5 text-indigo-400" /> সম্পূর্ণ নাম (Full Name)
                                </label>
                                <input 
                                    type="text"
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    placeholder="আপনার নাম লিখুন..."
                                    className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3.5 text-sm font-bold text-white focus:border-indigo-500 outline-none transition-colors" 
                                />
                            </div>

                            {/* Nickname / Alias */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-300 flex items-center gap-1.5">
                                    <SparklesIcon className="w-3.5 h-3.5 text-indigo-400" /> ডাকনাম (Nickname / Alias)
                                </label>
                                <input 
                                    type="text"
                                    value={nickname} 
                                    onChange={(e) => setNickname(e.target.value)} 
                                    placeholder="আপনার ডাকনাম..."
                                    className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3.5 text-sm font-bold text-white focus:border-indigo-500 outline-none transition-colors" 
                                />
                            </div>

                            {/* Email Address */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-300 flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5 text-indigo-400" /> ইমেইল ঠিকানা (Email Address)
                                </label>
                                <input 
                                    type="email"
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    placeholder="example@gmail.com"
                                    className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3.5 text-sm font-bold text-white focus:border-indigo-500 outline-none transition-colors" 
                                />
                            </div>

                            {/* Phone Number */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-300 flex items-center gap-1.5">
                                    <Phone className="w-3.5 h-3.5 text-indigo-400" /> ফোন নম্বর (Phone Number)
                                </label>
                                <input 
                                    type="tel"
                                    value={phoneNumber} 
                                    onChange={(e) => setPhoneNumber(e.target.value)} 
                                    placeholder="+880 / +91..."
                                    className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3.5 text-sm font-bold text-white focus:border-indigo-500 outline-none transition-colors" 
                                />
                            </div>

                            {/* Location */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-300 flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-indigo-400" /> ঠিকানা / অবস্থান (Location)
                                </label>
                                <input 
                                    type="text"
                                    value={location} 
                                    onChange={(e) => setLocation(e.target.value)} 
                                    placeholder="আপনার শহর বা জেলা..."
                                    className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3.5 text-sm font-bold text-white focus:border-indigo-500 outline-none transition-colors" 
                                />
                            </div>

                            {/* Gender */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-300 flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5 text-indigo-400" /> লিঙ্গ (Gender)
                                </label>
                                <select 
                                    value={gender} 
                                    onChange={(e) => setGender(e.target.value)}
                                    className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3.5 text-sm font-bold text-white focus:border-indigo-500 outline-none transition-colors"
                                >
                                    <option value="Not Specified">Not Specified</option>
                                    <option value="Male">Male (পুরুষ)</option>
                                    <option value="Female">Female (মহিলা)</option>
                                    <option value="Other">Other (অন্যান্য)</option>
                                </select>
                            </div>

                            {/* Bio / About */}
                            <div className="md:col-span-2 space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-300 flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5 text-indigo-400" /> বায়ো / নিজের সম্পর্কে (About You)
                                </label>
                                <textarea 
                                    rows={3}
                                    value={bio} 
                                    onChange={(e) => setBio(e.target.value)} 
                                    placeholder="আপনার সম্পর্কে কিছু লিখুন..."
                                    className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-sm font-medium text-white focus:border-indigo-500 outline-none transition-colors resize-none" 
                                />
                            </div>
                        </div>

                        {/* Save Trigger Button */}
                        <div className="pt-4 border-t border-white/5 flex justify-end">
                            <button 
                                onClick={handleSave}
                                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 shadow-xl transition-all"
                            >
                                পরিবর্তন সংরক্ষণ করুন (Save Details)
                            </button>
                        </div>
                    </div>

                    {/* Personas (Voice & Avatar Selection) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Audio Persona */}
                        <div className="p-6 rounded-[2.5rem] bg-[#0a0d18] border border-white/10">
                            <div className="flex items-center gap-3 mb-6">
                                <SpeakerWaveIcon className="w-5 h-5 text-indigo-400" />
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest">Audio Matrix</h3>
                                    <p className="text-[8px] font-bold text-indigo-400/70 uppercase tracking-widest">Voice Modulation</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {SIFRA_VOICES.map(voice => (
                                    <button 
                                        key={voice.id} 
                                        onClick={() => onSifraVoiceChange(voice.id)}
                                        className={`px-4 py-3 rounded-xl border text-left flex justify-between items-center transition-all ${sifraVoice === voice.id ? 'bg-indigo-500/20 border-indigo-500/50 text-white' : 'bg-black/50 border-white/5 text-white/50 hover:border-white/20'}`}
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-widest">{voice.name}</span>
                                        {sifraVoice === voice.id && <CheckIcon className="w-4 h-4 text-indigo-400" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Visual Persona */}
                        <div className="p-6 rounded-[2.5rem] bg-[#0a0d18] border border-white/10">
                            <div className="flex items-center gap-3 mb-6">
                                <SparklesIcon className="w-5 h-5 text-rose-400" />
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest">Visual Matrix</h3>
                                    <p className="text-[8px] font-bold text-rose-400/70 uppercase tracking-widest">Hologram Selection</p>
                                </div>
                            </div>
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x">
                                {SIFRA_AVATARS.map(item => (
                                    <button 
                                        key={item.id} 
                                        onClick={() => setSifraAvatarId(item.id)}
                                        className={`shrink-0 snap-center flex flex-col items-center gap-3 p-3 rounded-2xl border transition-all ${sifraAvatarId === item.id ? 'border-rose-500/50 bg-rose-500/10 scale-100' : 'border-white/5 bg-black/50 opacity-50 scale-90 hover:opacity-100'}`}
                                    >
                                        <Avatar src={item.url} isSifra size="md" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-center">{item.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Theme & System Tasks */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Theme Sandbox */}
                        <div className="p-6 rounded-[2.5rem] bg-[#0a0d18] border border-white/10">
                            <div className="flex items-center gap-3 mb-6">
                                <AdjustmentsHorizontalIcon className="w-5 h-5 text-emerald-400" />
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest">Environment</h3>
                                    <p className="text-[8px] font-bold text-emerald-400/70 uppercase tracking-widest">Core Themes</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                                {THEMES.map(theme => (
                                    <button 
                                        key={theme.id} 
                                        onClick={() => setThemeId(theme.id)}
                                        className={`aspect-square rounded-xl transition-all relative overflow-hidden border-2 ${themeId === theme.id ? 'border-emerald-500 scale-105 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* System Tasks */}
                        <div className="p-6 rounded-[2.5rem] bg-[#0a0d18] border border-white/10 flex justify-between flex-col">
                            <div className="flex items-center gap-3 mb-6">
                                <BoltIcon className="w-5 h-5 text-cyan-400" />
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest">System Tasks</h3>
                                    <p className="text-[8px] font-bold text-cyan-400/70 uppercase tracking-widest">Maintenance & Logs</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <button onClick={() => onNavigate(View.HISTORY)} className="w-full flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-cyan-500/30 transition-all font-black text-[9px] uppercase tracking-widest text-center">
                                    <BookOpenIcon className="w-4 h-4 text-cyan-400" /> Archive
                                </button>
                                <button onClick={onLogout} className="w-full flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 transition-all font-black text-[9px] uppercase tracking-widest text-orange-400 text-center">
                                    <LogoutIcon className="w-4 h-4" /> Disconnect
                                </button>
                                <button onClick={onClearAllData} className="w-full flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all font-black text-[9px] uppercase tracking-widest text-red-500 text-center">
                                    <TrashIcon className="w-4 h-4" /> Hard Reset
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            {/* Save Success Toast */}
            <AnimatePresence>
                {showSaveSuccess && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[400] px-6 py-4 rounded-2xl bg-emerald-500 text-black font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-[0_0_40px_rgba(16,185,129,0.5)]"
                    >
                        <CheckCircle2 className="w-5 h-5 text-black" />
                        প্রোফাইল সফলভাবে আপডেট করা হয়েছে!
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfileView;
