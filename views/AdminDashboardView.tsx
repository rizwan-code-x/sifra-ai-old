
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, APP_VERSION, AdminSettings, View, CommunityPost } from '../types';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import XMarkIcon from '../components/icons/XMarkIcon';
import ShieldCheckIcon from '../components/icons/ShieldCheckIcon';
import BoltIcon from '../components/icons/BoltIcon';
import TrashIcon from '../components/icons/TrashIcon';
import GlobeAltIcon from '../components/icons/GlobeAltIcon';
import UsersIcon from '../components/icons/UsersIcon';
import ChatBubbleLeftRightIcon from '../components/icons/ChatBubbleLeftRightIcon';
import SparklesIcon from '../components/icons/SparklesIcon';
import LogoutIcon from '../components/icons/LogoutIcon';
import BellIcon from '../components/icons/BellIcon';
import ChevronRightIcon from '../components/icons/ChevronRightIcon';
import AdjustmentsHorizontalIcon from '../components/icons/AdjustmentsHorizontalIcon';
import CodeBracketIcon from '../components/icons/CodeBracketIcon';
import LockClosedIcon from '../components/icons/LockClosedIcon';
import { useLocalStorage } from '../hooks/useLocalStorage';

type AdminTab = 'overview' | 'features' | 'users' | 'analytics' | 'settings' | 'logs' | 'apiKeys' | 'complaints';

interface Feature {
    id: string;
    name: string;
    category: 'Assistant' | 'Utilities' | 'AI Tools' | 'Social' | 'Integrations';
    description: string;
    viewId?: View;
}

const DETECTED_FEATURES: Feature[] = [
    { id: 'chat', name: 'Sifra Chat', category: 'Assistant', description: 'Neural matrix chat interface', viewId: View.CHAT },
    { id: 'voice', name: 'Galaxy Voice', category: 'Assistant', description: 'Gemini-like voice interaction', viewId: View.GALAXY_VOICE },
    { id: 'tutor', name: 'AI Tutor', category: 'Assistant', description: 'Educational assistance module', viewId: View.TUTOR },
    { id: 'travel', name: 'Travel Guide', category: 'Assistant', description: 'AI-powered travel planning', viewId: View.TRAVEL_GUIDE },
    { id: 'calls', name: 'Calls Sifra', category: 'Assistant', description: 'Voice call simulation', viewId: View.CALLS_SIFRA },
    { id: 'calc', name: 'Calculator', category: 'Utilities', description: 'Advanced mathematical tool', viewId: View.SIFRA_CALCULATOR },
    { id: 'cal', name: 'Calendar', category: 'Utilities', description: 'Personal event management', viewId: View.PERSONAL_CALENDAR },
    { id: 'clock', name: 'Sifra Clock', category: 'Utilities', description: 'World clock and alarms', viewId: View.SIFRA_CLOCK },
    { id: 'rec', name: 'Recorder', category: 'Utilities', description: 'Neural voice recorder', viewId: View.SIFRA_RECORDER },
    { id: 'music', name: 'Music Player', category: 'Utilities', description: 'Atmospheric audio player', viewId: View.SIFRA_MUSIC },
    { id: 'browser', name: 'Sifra Browser', category: 'Utilities', description: 'Secure web exploration', viewId: View.SIFRA_BROWSER },
    { id: 'dual', name: 'Dual Mode', category: 'AI Tools', description: 'Multi-personality AI toggle', viewId: View.DUAL_MODE },
    { id: 'moner', name: 'Moner Dana', category: 'AI Tools', description: 'Emotional intelligence module', viewId: View.MONER_DANA },
    { id: 'diary', name: 'Diary Editor', category: 'AI Tools', description: 'AI-enhanced journaling', viewId: View.DIARY_EDITOR },
    { id: 'pro', name: 'Sifra Pro', category: 'AI Tools', description: 'Premium feature set', viewId: View.SIFRA_PRO },
    { id: 'community', name: 'Community', category: 'Social', description: 'User interaction hub', viewId: View.COMMUNITY },
    { id: 'share', name: 'Share App', category: 'Social', description: 'App sharing and rewards', viewId: View.SHARE },
    { id: 'insights', name: 'User Insights', category: 'Social', description: 'Deep user profiling', viewId: View.USER_INSIGHTS },
    { id: 'gemini', name: 'Gemini API', category: 'Integrations', description: 'Core LLM integration' },
];

interface AdminDashboardProps {
    onClose: () => void;
    adminSettings: AdminSettings;
    onUpdateSettings: (settings: AdminSettings) => void;
    allUsers: UserProfile[];
    onUpdateUsers: (users: UserProfile[]) => void;
    communityPosts: CommunityPost[];
    onUpdatePosts: (posts: CommunityPost[]) => void;
}

const AdminDashboardView: React.FC<AdminDashboardProps> = ({ 
    onClose, 
    adminSettings, 
    onUpdateSettings,
    allUsers,
    onUpdateUsers,
    communityPosts,
    onUpdatePosts
}) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSidebar, setShowSidebar] = useState(true);
    const [selectedUserForInsights, setSelectedUserForInsights] = useState<UserProfile | null>(null);
    const [systemLogs] = useState(() => [
        { id: 1, msg: "Neural Matrix Online", time: "00:00", type: "system" },
        { id: 2, msg: "Security Decryption Handshake [OK]", time: "00:02", type: "auth" },
        { id: 3, msg: `Carrying ${allUsers.length} active node identities`, time: "00:05", type: "sync" },
        { id: 4, msg: "Feature Matrix Scanned: 18 modules detected", time: "00:06", type: "scan" },
    ]);

    const stats = useMemo(() => [
        { label: 'Total Users', value: allUsers.length, icon: <UsersIcon />, color: 'text-cyan-400', gradient: 'from-cyan-500/10' },
        { label: 'Active Modules', value: Object.values(adminSettings.featureFlags || {}).filter(v => v !== false).length, icon: <BoltIcon />, color: 'text-emerald-400', gradient: 'from-emerald-500/10' },
        { label: 'System Health', value: '99.9%', icon: <GlobeAltIcon />, color: 'text-amber-400', gradient: 'from-amber-500/10' },
        { label: 'Security Status', value: 'Shielded', icon: <ShieldCheckIcon />, color: 'text-indigo-400', gradient: 'from-indigo-500/10' },
    ], [allUsers.length, adminSettings.featureFlags]);

    const toggleFeature = (featureId: string) => {
        const currentFlags = { ...(adminSettings.featureFlags || {}) };
        currentFlags[featureId] = currentFlags[featureId] === false ? true : false;
        onUpdateSettings({ ...adminSettings, featureFlags: currentFlags });
    };

    const toggleUserStatus = (userId: string) => {
        const updated = allUsers.map(u => u.userId === userId ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u);
        onUpdateUsers(updated);
    };

    const purgeUser = (userId: string) => {
        if (confirm("PURGE COMMAND: This will permanently remove this carrier node from the matrix. Proceed?")) {
            const updated = allUsers.filter(u => u.userId !== userId);
            onUpdateUsers(updated);
        }
    };

    const deletePost = (postId: string) => {
        if (confirm("DELETE COMMAND: Remove this transmission from the community hub?")) {
            const updated = communityPosts.filter(p => p.id !== postId);
            onUpdatePosts(updated);
        }
    };

    const renderOverview = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className={`p-5 rounded-2xl bg-gradient-to-br ${s.gradient} to-transparent border border-white/10 backdrop-blur-3xl hover:border-white/20 transition-all group`}
                    >
                        <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 ${s.color} group-hover:scale-110 transition-transform`}>
                            {React.cloneElement(s.icon as React.ReactElement, { className: "w-5 h-5" })}
                        </div>
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">{s.label}</p>
                        <h4 className="text-xl font-black text-white tracking-tight">{s.value}</h4>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6">System Logs</h3>
                    <div className="space-y-4">
                        {systemLogs.map(log => (
                            <div key={log.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 group">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                                    <p className="text-[11px] font-medium text-white/70 group-hover:text-cyan-400 transition-colors">{log.msg}</p>
                                </div>
                                <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">[{log.time}]</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6">Recent Activity</h3>
                    <div className="space-y-4">
                         {[
                            { title: 'New Carrier Deployed', time: '2m ago', icon: <UsersIcon />, color: 'text-indigo-400' },
                            { title: 'Module Updated', time: '15m ago', icon: <BoltIcon />, color: 'text-emerald-400' },
                            { title: 'Security Scan', time: '1h ago', icon: <ShieldCheckIcon />, color: 'text-amber-400' },
                         ].map((act, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                                <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${act.color}`}>
                                    {React.cloneElement(act.icon as React.ReactElement, { className: "w-4 h-4" })}
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-white">{act.title}</p>
                                    <p className="text-[8px] text-white/40 uppercase">{act.time}</p>
                                </div>
                            </div>
                         ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderFeatures = () => {
        const categories = Array.from(new Set(DETECTED_FEATURES.map(f => f.category)));
        
        return (
            <div className="space-y-8 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-white italic uppercase tracking-tight">Module Matrix</h3>
                        <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest">Enable or disable core application modules</p>
                    </div>
                    <button className="px-5 py-2.5 bg-cyan-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all">Add Module</button>
                </div>

                {categories.map(cat => (
                    <div key={cat} className="space-y-4">
                        <h4 className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.3em] ml-1">{cat}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {DETECTED_FEATURES.filter(f => f.category === cat).map(feature => (
                                <div key={feature.id} className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-3xl flex flex-col justify-between group hover:border-white/20 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60 group-hover:text-white transition-colors">
                                            <SparklesIcon className="w-5 h-5" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[8px] font-black uppercase tracking-widest ${adminSettings.featureFlags?.[feature.id] !== false ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {adminSettings.featureFlags?.[feature.id] !== false ? 'Active' : 'Off'}
                                            </span>
                                            <button 
                                                onClick={() => toggleFeature(feature.id)}
                                                className={`w-10 h-5 rounded-full relative transition-all ${adminSettings.featureFlags?.[feature.id] !== false ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}
                                            >
                                                <div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${adminSettings.featureFlags?.[feature.id] !== false ? 'right-1 bg-emerald-500' : 'left-1 bg-rose-500'}`} />
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="text-sm font-black text-white italic tracking-tight">{feature.name}</h5>
                                        <p className="text-[10px] text-white/40 mt-1 leading-relaxed">{feature.description}</p>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                                        <button className="text-[8px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">Config</button>
                                        <button className="text-[8px] font-black uppercase tracking-widest text-rose-500/40 hover:text-rose-500 transition-colors">Remove</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderUsers = () => (
        <div className="space-y-6 animate-fade-in h-full flex flex-col">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tight">Carrier Matrix</h3>
                    <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest">Manage individual carrier nodes</p>
                </div>
                <div className="relative w-full sm:w-64">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                    <input 
                        type="text" 
                        placeholder="Search Identity..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-[11px] text-white outline-none focus:border-cyan-500 transition-all w-full"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col">
                <div className="overflow-x-auto overflow-y-auto premium-scroll flex-1">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead className="bg-white/5 sticky top-0 z-10 backdrop-blur-md">
                            <tr className="text-[8px] font-black text-white/40 uppercase tracking-widest">
                                <th className="px-6 py-4">Identity</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Deployment</th>
                                <th className="px-6 py-4 text-right">Commands</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {allUsers.filter(u => u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.userId.includes(searchQuery)).map(user => (
                                <tr key={user.userId} className="group hover:bg-white/[0.04] transition-all">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 p-0.5">
                                                {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-lg object-cover" /> : <div className="w-full h-full rounded-lg flex items-center justify-center font-black text-cyan-400 bg-cyan-400/10 text-[10px]">?</div>}
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black text-white">{user.name}</p>
                                                <p className="text-[8px] font-mono text-white/30 uppercase">ID: {user.userId.slice(0, 8)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1 h-1 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${user.status === 'active' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {user.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-[10px] font-bold text-white/40">{new Date(user.joinDate).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {user.insights && Object.keys(user.insights).length > 0 && (
                                                <button 
                                                    onClick={() => setSelectedUserForInsights(user)} 
                                                    className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 hover:text-indigo-300 transition-all border border-indigo-500/20"
                                                    title="View Insights"
                                                >
                                                    <SparklesIcon className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => toggleUserStatus(user.userId)} 
                                                className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-white transition-all border border-white/5"
                                            >
                                                <BoltIcon className="w-3.5 h-3.5" />
                                            </button>
                                            <button 
                                                onClick={() => purgeUser(user.userId)} 
                                                className="p-2 bg-rose-500/10 rounded-lg text-rose-500/40 hover:text-rose-500 transition-all border border-rose-500/20"
                                            >
                                                <TrashIcon className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderAnalytics = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tight">Neural Analytics</h3>
                    <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest">System performance and engagement</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest">24H</button>
                    <button className="px-4 py-2 bg-cyan-600/20 border border-cyan-500/40 text-cyan-400 rounded-lg text-[9px] font-black uppercase tracking-widest">7D</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-6 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <h4 className="text-xs font-black text-white uppercase tracking-widest">Interaction Volume</h4>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500" /><span className="text-[8px] font-black uppercase text-white/40">Chat</span></div>
                            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /><span className="text-[8px] font-black uppercase text-white/40">Voice</span></div>
                        </div>
                    </div>
                    <div className="flex-1 flex items-end gap-1.5 h-48">
                        {[40, 65, 45, 90, 75, 55, 85, 60, 95, 70, 50, 80].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                                <div className="w-full bg-cyan-500/20 rounded-t-md relative group-hover:bg-cyan-500/40 transition-all" style={{ height: `${h}%` }}>
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-cyan-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">{h}k</div>
                                </div>
                                <span className="text-[7px] font-black text-white/20 uppercase">M{i+1}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10">
                    <h4 className="text-xs font-black text-white uppercase tracking-widest mb-8">Distribution</h4>
                    <div className="space-y-6">
                        {[
                            { label: 'Sifra Pro', value: 65, color: 'bg-cyan-500' },
                            { label: 'Free Tier', value: 25, color: 'bg-indigo-500' },
                            { label: 'Admin Nodes', value: 10, color: 'bg-emerald-500' },
                        ].map((item, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black text-white italic">{item.label}</span>
                                    <span className="text-[10px] font-black text-white/40">{item.value}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.value}%` }}
                                        className={`h-full ${item.color}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSettings = () => (
        <div className="max-w-xl space-y-8 animate-fade-in">
            <div className="space-y-1">
                <h3 className="text-xl font-black text-white italic uppercase tracking-tight">System Config</h3>
                <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest">Global application parameters</p>
            </div>

            <div className="space-y-4">
                {[
                    { title: 'Neural Broadcast', desc: 'Global notification message', action: 'Edit' },
                    { title: 'Maintenance Mode', desc: 'Suspend all carrier nodes', toggle: true },
                    { title: 'API Key Matrix', desc: 'Manage Gemini and external keys', action: 'Manage' },
                ].map((item, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-black text-white italic">{item.title}</h4>
                            <p className="text-[10px] text-white/40">{item.desc}</p>
                        </div>
                        {item.action ? (
                            <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">{item.action}</button>
                        ) : (
                            <button className="w-10 h-5 rounded-full bg-rose-500/20 relative">
                                <div className="absolute top-1 left-1 w-3 h-3 rounded-full bg-rose-500" />
                            </button>
                        )}
                    </div>
                ))}

                <div className="pt-8">
                    <button 
                        onClick={() => {
                            if (confirm("NUCLEAR COMMAND: This will factory reset SIFRA. Proceed?")) {
                                localStorage.clear();
                                window.location.reload();
                            }
                        }}
                        className="w-full py-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-[0.3em] rounded-xl hover:bg-rose-500/20 transition-all active:scale-95"
                    >
                        Execute Neural Wipe
                    </button>
                </div>
            </div>
        </div>
    );

    const renderLogs = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tight">Transmissions</h3>
                    <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest">Moderation queue for global user communications</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {communityPosts.map(post => (
                    <div key={post.id} className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 flex items-start gap-6 group hover:bg-white/[0.05] transition-all">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0">
                            <img src={post.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.userName}`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-black text-white italic">{post.userName}</h4>
                                    <p className="text-[8px] font-mono text-white/30 uppercase">{new Date(post.timestamp).toLocaleString()}</p>
                                </div>
                                <button 
                                    onClick={() => deletePost(post.id)}
                                    className="p-2 bg-rose-500/10 rounded-lg text-rose-500/40 hover:text-rose-500 transition-all border border-rose-500/20"
                                >
                                    <TrashIcon className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <p className="text-[11px] text-white/70 leading-relaxed">{post.content}</p>
                            {post.image && (
                                <div className="w-full max-w-sm rounded-xl overflow-hidden border border-white/10">
                                    <img src={post.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                </div>
                            )}
                            <div className="flex gap-4 pt-1">
                                <div className="flex items-center gap-1.5 text-[9px] font-black text-white/30 uppercase tracking-widest">
                                    <SparklesIcon className="w-2.5 h-2.5" /> {post.likes}
                                </div>
                                <div className="flex items-center gap-1.5 text-[9px] font-black text-white/30 uppercase tracking-widest">
                                    <ChatBubbleLeftRightIcon className="w-2.5 h-2.5" /> {post.comments.length}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderApiKeys = () => {
        const predefinedServices = [
            { id: 'voice', name: '1. Voice Assistant API', description: 'Used for Galaxy Voice and free-hand voice mode.' },
            { id: 'chat', name: '2. Chat Assistant API', description: 'Used for Sifra Chat and general AI responses.' },
            { id: 'search', name: '3. Search API', description: 'Used for Sifra Browser web searches.' },
            { id: 'calendar', name: '4. Calendar API', description: 'Used to fetch holidays and festivals in the Calendar.' },
        ];

        const addKey = (serviceId: string, key: string) => {
            if (!key.trim()) return;
            const updatedKeys = [...adminSettings.apiKeys.filter(k => k.service !== serviceId), {
                id: Date.now().toString(),
                service: serviceId,
                key: key,
                isActive: true,
            }];
            onUpdateSettings({ ...adminSettings, apiKeys: updatedKeys });
        };

        const deleteKey = (serviceId: string) => {
            const updatedKeys = adminSettings.apiKeys.filter(k => k.service !== serviceId);
            onUpdateSettings({ ...adminSettings, apiKeys: updatedKeys });
        };

        return (
            <div className="space-y-6 animate-fade-in h-full flex flex-col">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-white italic uppercase tracking-tight">API Matrix</h3>
                        <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest">Manage external service keys</p>
                    </div>
                </div>

                <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/10 space-y-5 overflow-y-auto premium-scroll">
                    <div className="space-y-4">
                        {predefinedServices.map(service => {
                            const existingKey = adminSettings.apiKeys.find(k => k.service === service.id);
                            return (
                                <div key={service.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 mt-1">
                                            <LockClosedIcon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-white">{service.name}</h4>
                                            <p className="text-[9px] text-white/40 mt-0.5 max-w-xs leading-relaxed">{service.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                                        {existingKey ? (
                                            <>
                                                <div className="bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-[11px] text-white/50 font-mono w-full sm:w-48 text-center">
                                                    {existingKey.key.substring(0, 5)}...{existingKey.key.substring(existingKey.key.length - 4)}
                                                </div>
                                                <button 
                                                    onClick={() => deleteKey(service.id)}
                                                    className="w-full sm:w-auto px-4 py-2 bg-rose-500/10 rounded-xl text-rose-500/80 hover:text-rose-500 transition-all border border-rose-500/20 text-[10px] font-black uppercase tracking-widest"
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        ) : (
                                            <form 
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    const input = e.currentTarget.elements.namedItem('apiKey') as HTMLInputElement;
                                                    addKey(service.id, input.value);
                                                }}
                                                className="flex w-full sm:w-auto gap-2"
                                            >
                                                <input 
                                                    name="apiKey"
                                                    type="password" 
                                                    placeholder="Enter API Key..." 
                                                    className="bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-[11px] text-white outline-none focus:border-cyan-500 transition-all w-full sm:w-48"
                                                />
                                                <button type="submit" className="px-4 py-2 bg-cyan-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all whitespace-nowrap">
                                                    Add
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    const renderComplaints = () => {
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-black uppercase tracking-tighter italic text-cyan-400">User Complaints</h2>
                    <p className="text-xs text-white/50 tracking-wider">Manage tickets and reply.</p>
                </div>

                <div className="bg-[#050505] border border-white/5 rounded-2xl overflow-hidden p-6">
                    <div className="divide-y divide-white/5 flex flex-col gap-4">
                        <div className="flex flex-col gap-3 p-4 bg-white/[0.02] rounded-xl border border-white/5">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-sm font-bold text-white leading-none">REF-109432</h4>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">User: John Doe</p>
                                </div>
                                <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Open</span>
                            </div>
                            <p className="text-xs text-white/80 leading-relaxed bg-[#020202] py-2 px-3 rounded-lg border border-white/5">
                                I am facing issues with the notification bar, it doesn't show new messages sometimes.
                            </p>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Developer Reply..." 
                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] outline-none focus:border-cyan-500 transition-colors"
                                />
                                <button className="bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-cyan-600/30 transition-colors">
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[2000] bg-[#020202] text-white flex font-sans selection:bg-cyan-500/30 overflow-hidden">
            {/* Sidebar */}
            <aside className={`fixed md:relative z-[2001] h-full bg-[#080808] border-r border-white/5 transition-all duration-300 flex flex-col ${showSidebar ? 'w-64' : 'w-0 md:w-20'} overflow-hidden`}>
                <div className="p-6 flex items-center gap-3 border-b border-white/5 h-16 shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <ShieldCheckIcon className="w-4 h-4 text-white" />
                    </div>
                    {showSidebar && <span className="font-black italic tracking-tighter text-sm">SIFRA CORE</span>}
                </div>

                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto premium-scroll">
                    {[
                        { id: 'overview', label: 'Overview', icon: <GlobeAltIcon /> },
                        { id: 'features', label: 'Modules', icon: <BoltIcon /> },
                        { id: 'users', label: 'Carriers', icon: <UsersIcon /> },
                        { id: 'complaints', label: 'Complaints', icon: <ChatBubbleLeftRightIcon /> },
                        { id: 'analytics', label: 'Analytics', icon: <SparklesIcon /> },
                        { id: 'logs', label: 'Transmissions', icon: <CodeBracketIcon /> },
                        { id: 'settings', label: 'Config', icon: <AdjustmentsHorizontalIcon /> },
                        { id: 'apiKeys', label: 'API Matrix', icon: <LockClosedIcon /> },
                    ].map(item => (
                        <button 
                            key={item.id}
                            onClick={() => setActiveTab(item.id as AdminTab)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative overflow-hidden ${activeTab === item.id ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.05)]' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                        >
                            <div className={`shrink-0 transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                                {React.cloneElement(item.icon as React.ReactElement, { className: "w-4 h-4" })}
                            </div>
                            {showSidebar && <span className="text-[10px] font-black uppercase tracking-wider">{item.label}</span>}
                            {activeTab === item.id && (
                                <motion.div 
                                    layoutId="sidebarGlow"
                                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent pointer-events-none"
                                />
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5 space-y-2">
                    <button onClick={onClose} className="w-full flex items-center gap-3 px-3 py-2.5 text-rose-500/60 hover:text-rose-500 hover:bg-rose-500/5 transition-all rounded-xl">
                        <LogoutIcon className="w-4 h-4" />
                        {showSidebar && <span className="text-[11px] font-bold uppercase tracking-wider">Exit Matrix</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative z-10 bg-[#020202]">
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-[#050505]/80 backdrop-blur-2xl sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setShowSidebar(!showSidebar)}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors group"
                            title="Toggle Sidebar"
                        >
                            <div className="flex flex-col gap-1">
                                <div className="w-4 h-0.5 bg-cyan-500 group-hover:w-5 transition-all" />
                                <div className="w-4 h-0.5 bg-white/60" />
                                <div className="w-4 h-0.5 bg-white/60 group-hover:w-3 transition-all" />
                            </div>
                        </button>
                        <div className="h-4 w-[1px] bg-white/10" />
                        
                        {/* Browser-like Address Bar */}
                        <div className="hidden lg:flex items-center gap-2 px-4 py-1.5 bg-white/[0.03] border border-white/10 rounded-full w-96 group hover:border-cyan-500/30 transition-all">
                            <LockClosedIcon className="w-3 h-3 text-emerald-500" />
                            <span className="text-[9px] font-mono text-white/30 tracking-tighter truncate">sifra://matrix.core/overseer/{activeTab}</span>
                        </div>

                        <div className="h-4 w-[1px] bg-white/10 hidden lg:block" />
                        
                        <button 
                            onClick={() => activeTab === 'overview' ? onClose() : setActiveTab('overview')}
                            className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 rounded-lg transition-all text-white/60 hover:text-white"
                        >
                            <ArrowLeftIcon className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
                        </button>

                        <div className="h-4 w-[1px] bg-white/10" />
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400/80 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]">{activeTab}</h2>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-cyan-500/5 border border-cyan-500/10 rounded-full">
                            <div className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_#22d3ee]" />
                            <span className="text-[8px] font-black text-cyan-400/60 uppercase tracking-widest">Overseer v2.4</span>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-rose-500/10 rounded-lg text-white/20 hover:text-rose-500 transition-all">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto premium-scroll p-6 md:p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="max-w-7xl mx-auto"
                        >
                            {activeTab === 'overview' && renderOverview()}
                            {activeTab === 'features' && renderFeatures()}
                            {activeTab === 'users' && renderUsers()}
                            {activeTab === 'complaints' && renderComplaints()}
                            {activeTab === 'analytics' && renderAnalytics()}
                            {activeTab === 'logs' && renderLogs()}
                            {activeTab === 'settings' && renderSettings()}
                            {activeTab === 'apiKeys' && renderApiKeys()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* User Insights Modal */}
            <AnimatePresence>
                {selectedUserForInsights && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        className="fixed inset-0 z-[3000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            exit={{ scale: 0.95, opacity: 0 }} 
                            className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <div className="flex items-center gap-3">
                                    <SparklesIcon className="w-5 h-5 text-indigo-400" />
                                    <h3 className="text-lg font-black uppercase tracking-widest">User Insights: {selectedUserForInsights.name}</h3>
                                </div>
                                <button onClick={() => setSelectedUserForInsights(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <XMarkIcon className="w-5 h-5 text-white/60" />
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto premium-scroll flex-1 space-y-6">
                                {/* Send Notification Section */}
                                <div className="bg-cyan-500/10 p-4 rounded-2xl border border-cyan-500/20 mb-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-3">Send Notification to User</h4>
                                    <form 
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            const form = e.target as HTMLFormElement;
                                            const title = (form.elements.namedItem('title') as HTMLInputElement).value;
                                            const message = (form.elements.namedItem('message') as HTMLTextAreaElement).value;
                                            if (title && message) {
                                                const newNotification = {
                                                    id: `notif-${Date.now()}`,
                                                    title,
                                                    message,
                                                    timestamp: Date.now(),
                                                    read: false
                                                };
                                                const updatedUser = {
                                                    ...selectedUserForInsights,
                                                    notifications: [newNotification, ...(selectedUserForInsights.notifications || [])]
                                                };
                                                const updatedUsers = allUsers.map(u => u.userId === updatedUser.userId ? updatedUser : u);
                                                onUpdateUsers(updatedUsers);
                                                setSelectedUserForInsights(updatedUser);
                                                form.reset();
                                                alert("Notification sent successfully!");
                                            }
                                        }}
                                        className="space-y-3"
                                    >
                                        <input 
                                            name="title"
                                            type="text" 
                                            placeholder="Notification Title" 
                                            required
                                            className="w-full bg-black/20 border border-cyan-500/20 rounded-xl p-3 text-sm text-white outline-none focus:border-cyan-500 transition-colors placeholder:text-white/20"
                                        />
                                        <textarea 
                                            name="message"
                                            placeholder="Message content..." 
                                            required
                                            className="w-full h-24 bg-black/20 border border-cyan-500/20 rounded-xl p-3 text-sm text-white outline-none focus:border-cyan-500 transition-colors resize-none placeholder:text-white/20"
                                        />
                                        <button type="submit" className="w-full py-3 bg-cyan-600 text-white rounded-xl font-bold text-sm hover:bg-cyan-500 transition-colors">
                                            Send Notification
                                        </button>
                                    </form>
                                </div>

                                {selectedUserForInsights.insights && Object.keys(selectedUserForInsights.insights).length > 0 ? (
                                    Object.entries(selectedUserForInsights.insights).map(([key, value]) => (
                                        <div key={key} className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">{key}</p>
                                            <p className="text-sm text-white/80 leading-relaxed">{value}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-white/40 py-10 font-black uppercase tracking-widest text-sm">
                                        No insights available for this user.
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .premium-scroll::-webkit-scrollbar { width: 4px; }
                .premium-scroll::-webkit-scrollbar-track { background: transparent; }
                .premium-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                .premium-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
            `}</style>
        </div>
    );
};

export default AdminDashboardView;

// Local Mini Icons
const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
);
