import React, { useState, useEffect, useMemo } from 'react';
import { Message, View } from '../types';
import { getAppHistory, clearAppHistory, AppActivity } from '../utils/history';
import { 
  Trash2, Download, ChevronLeft, Calendar, History as HistoryIcon, 
  Clock, MessageSquare, X, Activity, Search, Sparkles, ArrowRight,
  RotateCcw, Compass, ArrowUpDown, Filter, Eye, User, Bot, Tag, CheckCircle
} from 'lucide-react';

interface HistoryViewProps {
  chatHistory: Message[];
  setChatHistory: (history: Message[]) => void;
  onClose: () => void;
  onNavigate?: (view: View) => void;
}

export interface SavedSession {
  id: number;
  timestamp: string;
  title?: string;
  messages: Message[];
  taskContext?: {
    view: View;
    moduleName: string;
  };
  tags?: string[];
}

const DEFAULT_SAVED_SESSIONS: SavedSession[] = [
  {
    id: 101,
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    title: 'Bengali Neural Speech Synthesis Query',
    taskContext: { view: View.VOICE_ASSISTANT, moduleName: 'Live Voice Assistant' },
    tags: ['Bengali Voice', 'Speech Quality', 'AI Assistant'],
    messages: [
      {
        messageId: 'msg-1',
        role: 'user' as any,
        parts: [{ text: 'SIFRA, please explain Bengali neural TTS voice processing in detail.' }]
      },
      {
        messageId: 'msg-2',
        role: 'model' as any,
        parts: [{ text: 'অবশ্যই! শিপ্রা লাইভ ভয়েস অ্যাসিস্ট্যান্ট উচ্চমানের প্রমিত বাংলা (West Bengal & Bangladeshi) শব্দ উচ্চারণ ও আবেগীয় স্বর পরিবর্তন সমর্থন করে।' }]
      }
    ]
  },
  {
    id: 102,
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    title: 'Kolkata & Dhaka Travel Itinerary',
    taskContext: { view: View.TRAVEL_GUIDE, moduleName: 'Travel Guide' },
    tags: ['Travel', 'Kolkata', 'Dhaka'],
    messages: [
      {
        messageId: 'msg-3',
        role: 'user' as any,
        parts: [{ text: 'Show me top attractions in Kolkata and Dhaka with travel duration.' }]
      },
      {
        messageId: 'msg-4',
        role: 'model' as any,
        parts: [{ text: 'Kolkata attractions include Victoria Memorial and Howrah Bridge. In Dhaka, visit Ahsan Manzil and Lalbagh Fort.' }]
      }
    ]
  },
  {
    id: 103,
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
    title: 'Moner Dana Diary Reflection',
    taskContext: { view: View.MONER_DANA, moduleName: 'Moner Dana Private Journal' },
    tags: ['Personal', 'Diary', 'Reflection'],
    messages: [
      {
        messageId: 'msg-5',
        role: 'user' as any,
        parts: [{ text: 'I am feeling reflective today about AI advancements in Bengali language.' }]
      },
      {
        messageId: 'msg-6',
        role: 'model' as any,
        parts: [{ text: 'It is wonderful to reflect on technological growth. Your journal entry is safely preserved in Moner Dana.' }]
      }
    ]
  }
];

export const HistoryView: React.FC<HistoryViewProps> = ({ 
  chatHistory, 
  setChatHistory, 
  onClose,
  onNavigate 
}) => {
  const [activeTab, setActiveTab] = useState<'chats' | 'activity'>('chats');
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [appActivities, setAppActivities] = useState<AppActivity[]>([]);
  const [selectedSession, setSelectedSession] = useState<SavedSession | null>(null);
  
  // Search, Filter, and Sorting state
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'messages' | 'title'>('newest');
  const [restoredToast, setRestoredToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sifra_saved_chats');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSavedSessions(parsed.length > 0 ? parsed : DEFAULT_SAVED_SESSIONS);
      } else {
        setSavedSessions(DEFAULT_SAVED_SESSIONS);
        localStorage.setItem('sifra_saved_chats', JSON.stringify(DEFAULT_SAVED_SESSIONS));
      }
    } catch (e) {
      console.error('Failed to load saved chats:', e);
      setSavedSessions(DEFAULT_SAVED_SESSIONS);
    }
    setAppActivities(getAppHistory());
  }, []);

  // Save sessions back to localStorage whenever changed
  const saveSessionsToStorage = (updated: SavedSession[]) => {
    setSavedSessions(updated);
    try {
      localStorage.setItem('sifra_saved_chats', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to persist sessions:', e);
    }
  };

  const exportHistory = (format: 'txt' | 'json', sessionToExport: Message[]) => {
    let content = '';
    const filename = `sifra-chat-history-${new Date().toISOString()}.${format}`;

    if (format === 'json') {
      content = JSON.stringify(sessionToExport, null, 2);
    } else {
      content = sessionToExport.map(msg => `${String(msg.role).toUpperCase()}: ${msg.parts[0]?.text || ''}`).join('\n\n');
    }

    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteServerSession = (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm('Delete this saved chat session?')) {
      const updated = savedSessions.filter(s => s.id !== id);
      saveSessionsToStorage(updated);
      if (selectedSession?.id === id) setSelectedSession(null);
    }
  };

  const handleDeleteAllChats = () => {
    if (window.confirm('Are you sure you want to completely clear all saved chat history?')) {
      saveSessionsToStorage([]);
      setChatHistory([]);
      setSelectedSession(null);
    }
  };

  const handleClearActivity = () => {
    if (window.confirm('Clear all app activity logs?')) {
      clearAppHistory();
      setAppActivities([]);
    }
  };

  // RESTORE SESSION & TASK STATE CONTEXT
  const restoreSession = (session: SavedSession, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm('Restore this conversation session and task context?')) {
      setChatHistory(session.messages);
      const moduleName = session.taskContext?.moduleName || 'Neural Chat';
      setRestoredToast(`Restored context: ${moduleName}`);
      
      setTimeout(() => {
        setRestoredToast(null);
        if (session.taskContext?.view && onNavigate) {
          onNavigate(session.taskContext.view);
        } else {
          onClose();
        }
      }, 1000);
    }
  };

  // Filtered & Sorted Sessions
  const filteredSessions = useMemo(() => {
    return savedSessions
      .filter(session => {
        const query = searchFilter.toLowerCase().trim();
        const userSnippet = session.messages.find(m => String(m.role) === 'user')?.parts[0]?.text || '';
        const botSnippet = session.messages.find(m => String(m.role) === 'model')?.parts[0]?.text || '';
        const title = session.title || userSnippet || 'Neural Chat Session';

        const matchesSearch =
          !query ||
          title.toLowerCase().includes(query) ||
          userSnippet.toLowerCase().includes(query) ||
          botSnippet.toLowerCase().includes(query) ||
          (session.tags && session.tags.some(t => t.toLowerCase().includes(query))) ||
          (session.taskContext && session.taskContext.moduleName.toLowerCase().includes(query));

        const matchesCategory =
          categoryFilter === 'all' ||
          (categoryFilter === 'chat' && (!session.taskContext || session.taskContext.view === View.CHAT)) ||
          (categoryFilter === 'voice' && session.taskContext?.view === View.VOICE_ASSISTANT) ||
          (categoryFilter === 'modules' && session.taskContext && session.taskContext.view !== View.CHAT);

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        if (sortBy === 'oldest') return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        if (sortBy === 'messages') return b.messages.length - a.messages.length;
        if (sortBy === 'title') {
          const titleA = a.title || a.messages[0]?.parts[0]?.text || '';
          const titleB = b.title || b.messages[0]?.parts[0]?.text || '';
          return titleA.localeCompare(titleB);
        }
        return 0;
      });
  }, [savedSessions, searchFilter, categoryFilter, sortBy]);

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    return appActivities.filter(item => 
      !searchFilter.trim() || 
      item.title?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.subtitle?.toLowerCase().includes(searchFilter.toLowerCase())
    );
  }, [appActivities, searchFilter]);

  return (
    <div className="h-full w-full flex flex-col font-sans overflow-hidden bg-[#0A0B10] text-[#E2E8F0] select-none">
      
      {/* Toast Banner for Context Restoration */}
      {restoredToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-emerald-500 text-slate-950 font-black text-xs rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle size={16} /> <span>{restoredToast}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="p-4 border-b border-white/10 bg-[#12141C]/90 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={selectedSession ? () => setSelectedSession(null) : onClose} 
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all active:scale-95 border border-white/10"
            aria-label="Back"
          >
            {selectedSession ? <ChevronLeft size={18} /> : <X size={18} />}
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-600 uppercase">
              {selectedSession ? 'Conversation Context' : 'SIFRA History & Snippets'}
            </h1>
            <p className="text-[10px] text-white/40 font-medium">
              {selectedSession ? 'Message archive playback & restoration' : 'Conversation snippets, task contexts & activity logs'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {!selectedSession && (
          <div className="flex items-center gap-2">
            {activeTab === 'activity' && appActivities.length > 0 && (
              <button 
                onClick={handleClearActivity}
                className="text-red-400 hover:text-red-300 text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all active:scale-95"
              >
                <Trash2 size={13} /> <span>Clear Log</span>
              </button>
            )}
            {activeTab === 'chats' && savedSessions.length > 0 && (
              <button 
                onClick={handleDeleteAllChats}
                className="text-red-400 hover:text-red-300 text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all active:scale-95"
              >
                <Trash2 size={13} /> <span>Clear All</span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* Tabs, Search & Filters */}
      {!selectedSession && (
        <div className="p-3 sm:px-6 bg-[#0E1017] border-b border-white/5 space-y-3 shrink-0">
          
          {/* Main Tab Switcher */}
          <div className="flex items-center gap-2 bg-black/40 p-1 rounded-2xl border border-white/5 max-w-md mx-auto">
            <button
              onClick={() => setActiveTab('chats')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'chats' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-white/50 hover:text-white'
              }`}
            >
              <MessageSquare size={14} />
              <span>Conversation Archive ({savedSessions.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'activity' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-white/50 hover:text-white'
              }`}
            >
              <Activity size={14} />
              <span>App Activity ({appActivities.length})</span>
            </button>
          </div>

          {/* Search, Sorting & Category Filters */}
          <div className="flex flex-col sm:flex-row gap-2 items-center justify-between max-w-3xl mx-auto">
            
            {/* Search Input Box */}
            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search history snippets & tasks..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-amber-500/60 transition-all"
              />
              {searchFilter && (
                <button
                  onClick={() => setSearchFilter('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Sorting & Categories */}
            {activeTab === 'chats' && (
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'chat', label: 'Chat' },
                    { id: 'voice', label: 'Voice' },
                    { id: 'modules', label: 'Modules' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryFilter(cat.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                        categoryFilter === cat.id
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                          : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="bg-black/60 border border-white/10 rounded-xl px-2.5 py-1 text-[11px] text-amber-300 font-bold focus:outline-none"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="messages">Most Msgs</option>
                  <option value="title">Title A-Z</option>
                </select>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto p-4 sm:px-6 space-y-3 pb-24">
        
        {/* Selected Session Context Detailed View */}
        {selectedSession ? (
          <div className="space-y-4 max-w-3xl mx-auto">
            
            {/* Session Metadata Card */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1">
                  Task Context: {selectedSession.taskContext?.moduleName || 'Neural Chat'}
                </span>
                <h3 className="text-sm font-bold text-white">
                  {selectedSession.title || selectedSession.messages[0]?.parts[0]?.text || 'Chat Session'}
                </h3>
                <p className="text-[10px] text-white/40 font-mono mt-0.5">
                  {new Date(selectedSession.timestamp).toLocaleString()} • {selectedSession.messages.length} messages
                </p>
              </div>

              <button
                onClick={(e) => restoreSession(selectedSession, e)}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <RotateCcw size={14} /> Restore Session & Task State
              </button>
            </div>

            {/* Conversation Messages */}
            <div className="space-y-3">
              {selectedSession.messages.map((msg, index) => {
                const isUser = String(msg.role) === 'user';
                return (
                  <div key={index} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-1.5 text-[10px] text-white/40 font-mono mb-1 px-1">
                      {isUser ? (
                        <><span>You</span> <User size={11} className="text-amber-400" /></>
                      ) : (
                        <><Bot size={11} className="text-amber-400" /> <span>SIFRA Assistant</span></>
                      )}
                    </div>
                    <div className={`max-w-[88%] sm:max-w-lg p-3.5 rounded-2xl ${
                      isUser 
                        ? 'bg-amber-500/20 border border-amber-500/30 text-amber-100 rounded-tr-sm' 
                        : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-sm'
                    }`}>
                      <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                        {msg.parts[0]?.text || ''}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : activeTab === 'chats' ? (
          
          /* Tab 1: Conversation Snippets & Restorable Sessions */
          <div className="space-y-3 max-w-3xl mx-auto">
            
            {/* Active Session Badge */}
            {chatHistory.length > 0 && (
              <div 
                onClick={onClose}
                className="group bg-gradient-to-r from-emerald-950/40 via-emerald-900/20 to-emerald-800/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-emerald-400/60 transition-all shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-emerald-300 font-bold text-xs sm:text-sm">Active Live Conversation</h3>
                    <p className="text-emerald-400/60 text-[11px] mt-0.5">{chatHistory.length} messages currently in buffer</p>
                  </div>
                </div>
                <button className="px-3.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold transition-all">
                  Resume
                </button>
              </div>
            )}

            {filteredSessions.length === 0 && chatHistory.length === 0 ? (
              <div className="text-center text-white/40 py-16 flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-3">
                  <HistoryIcon size={22} className="text-white/30" />
                </div>
                <p className="text-sm font-bold text-white/70">No Saved Conversations Found</p>
                <p className="text-xs text-white/40 mt-1 max-w-xs">
                  Your chat and voice interactions will automatically record snippets and task states here.
                </p>
              </div>
            ) : (
              filteredSessions.map((session) => {
                const userMsg = session.messages.find(m => String(m.role) === 'user')?.parts[0]?.text || '';
                const botMsg = session.messages.find(m => String(m.role) === 'model')?.parts[0]?.text || '';
                const moduleName = session.taskContext?.moduleName || 'Neural Chat';

                return (
                  <div 
                    key={session.id} 
                    onClick={() => setSelectedSession(session)}
                    className="bg-white/5 border border-white/10 hover:border-amber-500/40 rounded-2xl p-4 flex flex-col gap-2.5 hover:bg-white/[0.07] transition-all cursor-pointer group shadow-lg"
                  >
                    {/* Header Row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 uppercase tracking-wider">
                          {moduleName}
                        </span>
                        <span className="text-[10px] text-white/40 font-mono">
                          {session.messages.length} messages
                        </span>
                      </div>
                      <span className="text-[10px] text-white/40 font-mono">
                        {new Date(session.timestamp).toLocaleDateString()} {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="text-white font-bold text-xs sm:text-sm group-hover:text-amber-300 transition-colors">
                      {session.title || userMsg.substring(0, 50) || 'Neural Session'}
                    </h4>

                    {/* CONVERSATION SNIPPETS */}
                    <div className="space-y-1.5 bg-black/40 p-2.5 rounded-xl border border-white/5 text-xs">
                      {userMsg && (
                        <p className="text-amber-200/80 line-clamp-1 flex items-center gap-1.5 font-sans">
                          <User size={12} className="text-amber-400 shrink-0" />
                          <span className="truncate">{userMsg}</span>
                        </p>
                      )}
                      {botMsg && (
                        <p className="text-gray-300/80 line-clamp-2 flex items-start gap-1.5 font-sans leading-relaxed">
                          <Bot size={12} className="text-amber-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{botMsg}</span>
                        </p>
                      )}
                    </div>

                    {/* Footer Controls & Restore Action */}
                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      <div className="flex gap-1">
                        {session.tags?.map((t, i) => (
                          <span key={i} className="text-white/30 font-mono">#{t}</span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => restoreSession(session, e)} 
                          className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
                          title="Restore conversation & task state"
                        >
                          <RotateCcw size={12} /> Restore Context
                        </button>
                        <button 
                          onClick={(e) => handleDeleteServerSession(session.id, e)} 
                          className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete session"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        ) : (

          /* Tab 2: App Activity Logs */
          <div className="space-y-2.5 max-w-3xl mx-auto">
            {filteredActivities.length === 0 ? (
              <div className="text-center text-white/40 py-16 flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-3">
                  <Activity size={22} className="text-amber-400/50" />
                </div>
                <p className="text-sm font-bold text-white/70">No Activity Recorded</p>
                <p className="text-xs text-white/40 mt-1 max-w-xs">
                  Your feature navigation, searches, and daily actions will automatically appear here.
                </p>
              </div>
            ) : (
              filteredActivities.map((act) => (
                <div 
                  key={act.id} 
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                      <Sparkles size={16} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate leading-tight">
                        {act.title}
                      </h4>
                      <p className="text-[11px] text-white/50 truncate mt-0.5">
                        {act.subtitle}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-white/40 font-mono shrink-0">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>

        )}

      </div>

      {/* Export Controls for Selected Session */}
      {selectedSession && (
        <div className="bg-[#12141C]/90 backdrop-blur-md p-3 sm:p-4 border-t border-white/10 flex gap-3 z-20 shrink-0">
          <button 
            onClick={() => exportHistory('txt', selectedSession.messages)} 
            className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-2.5 px-4 rounded-xl transition-colors text-xs flex justify-center items-center gap-2 border border-white/10 active:scale-98"
          >
            <Download size={14} /> Export TXT
          </button>
          <button 
            onClick={() => exportHistory('json', selectedSession.messages)} 
            className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-2.5 px-4 rounded-xl transition-colors text-xs flex justify-center items-center gap-2 border border-white/10 active:scale-98"
          >
            <Download size={14} /> Export JSON
          </button>
        </div>
      )}

    </div>
  );
};

export default HistoryView;
