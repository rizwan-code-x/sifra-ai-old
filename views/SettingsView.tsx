import React, { useState } from 'react';
import { View } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, Search, Bell, Shield, User, Lock, Smartphone, 
    Globe, Palette, Cpu, Volume2, Cloud, HelpCircle, Info, ChevronRight, 
    Check, Crown, Sparkles, Sliders, Trash2, Layers, Activity, Terminal, Key,
    UserCheck, RefreshCw, Moon, Eye, Zap, ShieldCheck
} from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface SettingsViewProps {
    onNavigate: (view: View) => void;
    onClose: () => void;
}

interface SettingItem {
    id: string;
    icon: React.ReactNode;
    label: string;
    description?: string;
    type: 'toggle' | 'link' | 'action';
    defaultValue?: boolean;
    targetView?: View;
    badge?: string;
}

interface SettingCategory {
    id: string;
    title: string;
    subtitle: string;
    items: SettingItem[];
}

const SettingsView: React.FC<SettingsViewProps> = ({ onNavigate, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [cacheCleaned, setCacheCleaned] = useState(false);

    // Persistent settings toggles
    const [settingsState, setSettingsState] = useLocalStorage<Record<string, boolean>>('sifra_app_settings_state_v1', {
        'sound_haptics': true,
        'push_notifications': true,
        'auto_cloud_sync': true,
        'offline_mode': false,
        'dark_matrix_theme': true,
        'glassmorphism_blur': true,
        'smooth_animations': true,
        'compact_density': false,
        'neural_engine': true,
        'web_search_grounding': true,
        'daily_tasks_reminder': true,
        'safe_ai_filter': true,
        'ceo_master_override': true
    });

    const toggleSetting = (id: string) => {
        setSettingsState(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleClearCache = () => {
        setCacheCleaned(true);
        setTimeout(() => setCacheCleaned(false), 2500);
    };

    const categories: SettingCategory[] = [
        {
            id: 'account',
            title: 'Account Settings',
            subtitle: 'Profile, security & subscription',
            items: [
                {
                    id: 'acc_profile',
                    icon: <User className="w-4 h-4 text-amber-400" />,
                    label: 'Profile Information',
                    description: 'Name, avatar & personal preferences',
                    type: 'link',
                    targetView: View.PROFILE
                },
                {
                    id: 'acc_security',
                    icon: <Lock className="w-4 h-4 text-amber-400" />,
                    label: 'Security & Identity',
                    description: 'Biometrics, PIN & neural link verification',
                    type: 'link',
                    targetView: View.SIFRA_IDENTITY
                },
                {
                    id: 'acc_plan',
                    icon: <Crown className="w-4 h-4 text-amber-400" />,
                    label: 'Subscription & Membership',
                    description: 'SIFRA PRO & Matrix perks',
                    type: 'link',
                    targetView: View.PLAN,
                    badge: 'PRO'
                },
                {
                    id: 'acc_switcher',
                    icon: <UserCheck className="w-4 h-4 text-amber-400" />,
                    label: 'Account Switcher',
                    description: 'Switch between personal and business workspaces',
                    type: 'link',
                    targetView: View.ACCOUNT_SWITCHER
                },
                {
                    id: 'acc_vault',
                    icon: <ShieldCheck className="w-4 h-4 text-amber-400" />,
                    label: 'SIFRA Vault & Cloud Sync',
                    description: 'Encrypted storage for memories and entries',
                    type: 'link',
                    targetView: View.SIFRA_VAULT
                }
            ]
        },
        {
            id: 'app',
            title: 'App Settings',
            subtitle: 'System audio, sync & storage',
            items: [
                {
                    id: 'sound_haptics',
                    icon: <Volume2 className="w-4 h-4 text-cyan-400" />,
                    label: 'Sound & Haptic Feedback',
                    description: 'Audio clicks and tactile vibrations on interaction',
                    type: 'toggle',
                    defaultValue: true
                },
                {
                    id: 'push_notifications',
                    icon: <Bell className="w-4 h-4 text-cyan-400" />,
                    label: 'Push & Status Notifications',
                    description: 'Alerts for scheduled tasks and AI updates',
                    type: 'toggle',
                    defaultValue: true
                },
                {
                    id: 'auto_cloud_sync',
                    icon: <Cloud className="w-4 h-4 text-cyan-400" />,
                    label: 'Auto Cloud Synchronization',
                    description: 'Seamlessly keep all devices in sync',
                    type: 'toggle',
                    defaultValue: true
                },
                {
                    id: 'cache_cleaner',
                    icon: <Trash2 className="w-4 h-4 text-cyan-400" />,
                    label: cacheCleaned ? 'Cache Cleaned Successfully!' : 'Clear Cache & Memory',
                    description: 'Free up local temporary media and prompt cache',
                    type: 'action'
                }
            ]
        },
        {
            id: 'ui_appearance',
            title: 'UI and Appearance',
            subtitle: 'Themes, typography & visual effects',
            items: [
                {
                    id: 'dark_matrix_theme',
                    icon: <Moon className="w-4 h-4 text-fuchsia-400" />,
                    label: 'Dark Neural Matrix Theme',
                    description: 'OLED pure black background with gold/neon accents',
                    type: 'toggle',
                    defaultValue: true
                },
                {
                    id: 'glassmorphism_blur',
                    icon: <Palette className="w-4 h-4 text-fuchsia-400" />,
                    label: 'Glassmorphism & Backdrop Blur',
                    description: 'Render translucent frosted-glass panels',
                    type: 'toggle',
                    defaultValue: true
                },
                {
                    id: 'smooth_animations',
                    icon: <Sparkles className="w-4 h-4 text-fuchsia-400" />,
                    label: 'Ultra Smooth 60FPS Animations',
                    description: 'Hardware accelerated UI transitions',
                    type: 'toggle',
                    defaultValue: true
                },
                {
                    id: 'compact_density',
                    icon: <Layers className="w-4 h-4 text-fuchsia-400" />,
                    label: 'Compact Layout Density',
                    description: 'Display more actions and information on screen',
                    type: 'toggle',
                    defaultValue: false
                }
            ]
        },
        {
            id: 'feature',
            title: 'Feature Settings',
            subtitle: 'AI intelligence & service configurations',
            items: [
                {
                    id: 'neural_engine',
                    icon: <Cpu className="w-4 h-4 text-emerald-400" />,
                    label: 'SIFRA Neural AI Engine',
                    description: 'Gemini 3.1 & multimodal processing pipeline',
                    type: 'toggle',
                    defaultValue: true
                },
                {
                    id: 'web_search_grounding',
                    icon: <Globe className="w-4 h-4 text-emerald-400" />,
                    label: 'Real-time Web Grounding',
                    description: 'Fetch live Google Search information for questions',
                    type: 'toggle',
                    defaultValue: true
                },
                {
                    id: 'daily_tasks_reminder',
                    icon: <Zap className="w-4 h-4 text-emerald-400" />,
                    label: 'Daily Tasks Automation',
                    description: 'Smart suggestions and habit tracking updates',
                    type: 'toggle',
                    defaultValue: true
                },
                {
                    id: 'safe_ai_filter',
                    icon: <Shield className="w-4 h-4 text-emerald-400" />,
                    label: 'Safe AI & Privacy Filter',
                    description: 'Strict privacy isolation and content safety verification',
                    type: 'toggle',
                    defaultValue: true
                }
            ]
        }
    ];

    const filteredCategories = categories.map(cat => ({
        ...cat,
        items: cat.items.filter(item => 
            item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
        )
    })).filter(cat => cat.items.length > 0);

    return (
        <div className="h-full w-full bg-[#050811] text-gray-100 flex flex-col font-sans relative overflow-hidden">
            {/* Ambient background glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[20%] left-[-15%] w-[450px] h-[450px] bg-indigo-500/5 blur-[140px] rounded-full" />
            </div>

            {/* Header */}
            <header className="px-5 py-4 flex items-center justify-between border-b border-white/10 bg-[#050811]/90 backdrop-blur-xl sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onClose} 
                        className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                        aria-label="Back"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black italic uppercase tracking-tighter text-white">Settings</h1>
                        <p className="text-[10px] text-gray-400 font-medium">System Configuration & Preferences</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        v2.4 Core
                    </span>
                </div>
            </header>

            {/* Search Input */}
            <div className="px-5 pt-4 pb-2 relative z-10">
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 focus-within:bg-white/10 focus-within:border-amber-500/40 transition-all shadow-inner">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search settings, controls, features..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-xs sm:text-sm w-full font-medium text-white placeholder-gray-500"
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="text-xs text-gray-400 hover:text-white px-1"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto px-5 pt-3 pb-36 premium-scroll relative z-10 space-y-6">
                {filteredCategories.length > 0 ? (
                    filteredCategories.map((category) => (
                        <section key={category.id} className="space-y-2">
                            <div className="flex items-baseline justify-between px-1">
                                <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-amber-400/90 drop-shadow-sm">
                                    {category.title}
                                </h2>
                                <span className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold">
                                    {category.subtitle}
                                </span>
                            </div>

                            <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md divide-y divide-white/5">
                                {category.items.map((item) => {
                                    const isToggle = item.type === 'toggle';
                                    const isChecked = isToggle ? (settingsState[item.id] ?? item.defaultValue ?? false) : false;

                                    return (
                                        <div 
                                            key={item.id} 
                                            onClick={() => {
                                                if (isToggle) {
                                                    toggleSetting(item.id);
                                                } else if (item.type === 'link' && item.targetView !== undefined) {
                                                    onNavigate(item.targetView);
                                                } else if (item.type === 'action' && item.id === 'cache_cleaner') {
                                                    handleClearCache();
                                                }
                                            }}
                                            className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-white/[0.04] transition-colors cursor-pointer group active:bg-white/[0.06]"
                                        >
                                            <div className="flex items-start gap-3.5 flex-1 min-w-0 pr-3">
                                                <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform shadow-sm">
                                                    {item.icon}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs sm:text-sm font-bold text-gray-100 group-hover:text-white transition-colors truncate">
                                                            {item.label}
                                                        </span>
                                                        {item.badge && (
                                                            <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                                                {item.badge}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {item.description && (
                                                        <p className="text-[10px] text-gray-400 font-medium leading-relaxed mt-0.5 truncate">
                                                            {item.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Control or chevron */}
                                            {isToggle ? (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleSetting(item.id);
                                                    }}
                                                    className={`w-11 h-6 rounded-full flex items-center px-1 transition-colors relative shrink-0 ${
                                                        isChecked ? 'bg-gradient-to-r from-amber-500 to-amber-600 shadow-md shadow-amber-500/20' : 'bg-gray-800 border border-white/10'
                                                    }`}
                                                    aria-label={item.label}
                                                >
                                                    <motion.div 
                                                        className="w-4 h-4 rounded-full bg-white shadow-md"
                                                        animate={{ x: isChecked ? 20 : 0 }}
                                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                    />
                                                </button>
                                            ) : item.type === 'action' ? (
                                                <button 
                                                    type="button"
                                                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                                                        cacheCleaned 
                                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                                            : 'bg-white/10 hover:bg-white/15 text-white border border-white/10 active:scale-95'
                                                    }`}
                                                >
                                                    {cacheCleaned ? 'Done' : 'Clear'}
                                                </button>
                                            ) : (
                                                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors shrink-0" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    ))
                ) : (
                    <div className="text-center py-16 opacity-50 flex flex-col items-center gap-3">
                        <Search className="w-8 h-8 text-gray-500" />
                        <p className="text-sm font-medium text-gray-400">No matching settings found</p>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* CEO PANEL (Placed at the bottom of the Settings page as requested) */}
                {/* ========================================================================= */}
                <section className="pt-4 border-t border-white/10">
                    <div className="relative rounded-3xl bg-gradient-to-br from-[#121026] via-[#090b14] to-[#1a1408] border-2 border-amber-500/40 p-5 sm:p-6 shadow-[0_0_30px_rgba(212,175,55,0.15)] overflow-hidden">
                        {/* Decorative metallic aura */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-36 h-36 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

                        {/* Top Badge & Header */}
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md">
                                    <Crown className="w-4 h-4 stroke-[2.5]" />
                                </div>
                                <div>
                                    <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-white flex items-center gap-1.5">
                                        CEO Panel
                                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    </h3>
                                    <p className="text-[9px] font-bold text-amber-400/90 uppercase tracking-widest">
                                        Executive Master Control Matrix
                                    </p>
                                </div>
                            </div>

                            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase tracking-wider shadow-sm">
                                Level 1 Root
                            </span>
                        </div>

                        {/* CEO Status Info Grid */}
                        <div className="grid grid-cols-2 gap-2.5 mb-4 relative z-10">
                            <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">Neural Matrix</span>
                                <span className="text-xs font-black text-emerald-400">99.98% Active</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">Executive Token</span>
                                <span className="text-xs font-black text-amber-400 font-mono">ROOT-MASTER</span>
                            </div>
                        </div>

                        {/* CEO Actions */}
                        <div className="flex flex-col gap-2 relative z-10">
                            <button
                                type="button"
                                onClick={() => onNavigate(View.ADMIN)}
                                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <Terminal className="w-4 h-4 stroke-[2.5]" />
                                <span>Open CEO Command Console</span>
                                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                            </button>

                            <div className="flex items-center justify-between px-2 pt-1">
                                <span className="text-[9px] text-gray-500 font-medium">SIFRA Executive OS Build • Authorized Personal Access Only</span>
                                <span className="text-[9px] text-amber-500/80 font-mono font-bold">NODE: SIFRA-01</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default SettingsView;
