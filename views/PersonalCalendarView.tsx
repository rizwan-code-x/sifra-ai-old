import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, CalendarNote } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { parseNaturalLanguageEvent } from '../services/calendarAiService';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import PlusCircleIcon from '../components/icons/PlusCircleIcon';
import SparklesIcon from '../components/icons/SparklesIcon';
import XMarkIcon from '../components/icons/XMarkIcon';
import MicrophoneIcon from '../components/icons/MicrophoneIcon';
import { 
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Settings,
    Search,
    List,
    Grid,
    Trash2,
    Edit2
} from 'lucide-react';

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const THEMES = {
    dark: 'bg-[#050505] text-white',
    light: 'bg-gray-50 text-gray-900',
    system: 'bg-[#050505] text-white', // Simplified for now
    purple: 'bg-purple-950 text-purple-50',
    emerald: 'bg-emerald-950 text-emerald-50'
};

const PersonalCalendarView: React.FC<{ userProfile: UserProfile; onClose: () => void }> = ({ userProfile, onClose }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [events, setEvents] = useLocalStorage<CalendarNote[]>(`sifra_ai_calendar_v2_${userProfile.userId}`, []);
    const [viewMode, setViewMode] = useState<'grid' | 'horizontal'>('grid');
    const [theme, setTheme] = useLocalStorage<'dark' | 'light' | 'system' | 'purple' | 'emerald'>('sifra_calendar_theme', 'dark');
    const [showSettings, setShowSettings] = useState(false);
    
    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [aiInput, setAiInput] = useState('');
    const [isVoiceMode, setIsVoiceMode] = useState(false);
    const [isAiProcessing, setIsAiProcessing] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [editingEvent, setEditingEvent] = useState<CalendarNote | null>(null);

    const horizontalScrollRef = useRef<HTMLDivElement>(null);

    const daysInMonth = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const date = new Date(year, month, 1);
        const days = [];
        while (date.getMonth() === month) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    }, [currentDate]);

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        setShowModal(true);
        setSuggestions([]);
        setAiInput('');
        setIsVoiceMode(false);
        setEditingEvent(null);
    };

    const selectedDateEvents = useMemo(() => {
        if (!selectedDate) return [];
        const dateStr = selectedDate.toISOString().split('T')[0];
        return events.filter(e => e.date === dateStr).sort((a, b) => a.time.localeCompare(b.time));
    }, [selectedDate, events]);

    const handleConnectGoogle = () => {
        const query = encodeURIComponent("today's date and important events worldwide calendar");
        window.open(`https://www.google.com/search?q=${query}`, '_blank');
    };

    const handleAiInput = async () => {
        if (!aiInput.trim() || !selectedDate) return;
        setIsAiProcessing(true);
        try {
            const dateStr = selectedDate.toISOString().split('T')[0];
            const parsed = await parseNaturalLanguageEvent(aiInput, dateStr);
            
            if (parsed) {
                if (editingEvent) {
                    setEvents(prev => prev.map(e => e.id === editingEvent.id ? { ...e, ...parsed, date: dateStr } : e));
                    setEditingEvent(null);
                } else {
                    const newEvent: CalendarNote = {
                        id: Date.now().toString(),
                        date: dateStr,
                        time: parsed.time || '12:00',
                        title: parsed.title || aiInput,
                        content: parsed.content || '',
                        type: 'event',
                        isSpecial: false,
                        isFlexible: false,
                        priorityScore: 5,
                        energyLevel: 'medium',
                        isGhost: false
                    };
                    setEvents(prev => [...prev, newEvent]);
                }
                setAiInput('');
                
                // Generate suggestions based on input
                const keywords = aiInput.toLowerCase().split(' ');
                const newSuggestions = [
                    `Add reminder for ${parsed?.title || 'this'}`,
                    `Invite team to ${parsed?.title || 'this'}`,
                    `Prepare documents for ${parsed?.title || 'this'}`,
                    `Set location for ${parsed?.title || 'this'}`
                ];
                setSuggestions(newSuggestions);
            }
        } catch (error) {
            console.error("Failed to parse event:", error);
        } finally {
            setIsAiProcessing(false);
        }
    };

    const deleteEvent = (id: string) => {
        setEvents(prev => prev.filter(e => e.id !== id));
    };

    const themeClass = THEMES[theme] || THEMES.dark;

    return (
        <div className={`fixed inset-0 z-[100] flex flex-col font-sans transition-colors duration-500 ${themeClass}`}>
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b ${theme === 'light' ? 'border-gray-200' : 'border-white/10'}`}>
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className={`p-2 rounded-full ${theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-white/10'} transition-colors`}>
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5" />
                            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h2>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleConnectGoogle}
                        title="Search for Calendar Events Today"
                        className={`p-2 rounded-full ${theme === 'light' ? 'hover:bg-gray-200 text-blue-600' : 'hover:bg-white/10 text-blue-400'} transition-colors`}
                    >
                        <Search className="w-5 h-5" />
                    </button>
                    <button onClick={() => setViewMode(viewMode === 'grid' ? 'horizontal' : 'grid')} className={`p-2 rounded-full ${theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-white/10'} transition-colors`}>
                        {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
                    </button>
                    <div className="relative">
                        <button onClick={() => setShowSettings(!showSettings)} className={`p-2 rounded-full ${theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-white/10'} transition-colors`}>
                            <Settings className="w-5 h-5" />
                        </button>
                        <AnimatePresence>
                            {showSettings && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className={`absolute right-0 mt-2 w-48 rounded-xl shadow-xl border overflow-hidden z-50 ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#111] border-white/10'}`}
                                >
                                    {(['dark', 'light', 'system', 'purple', 'emerald'] as const).map(t => (
                                        <button 
                                            key={t}
                                            onClick={() => { setTheme(t); setShowSettings(false); }}
                                            className={`w-full text-left px-4 py-3 text-sm capitalize transition-colors ${theme === t ? 'bg-cyan-500/20 text-cyan-400' : (theme === 'light' ? 'hover:bg-gray-100 text-gray-800' : 'hover:bg-white/5 text-white')}`}
                                        >
                                            {t} Mode
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Calendar Body */}
            <div className="flex-1 overflow-hidden flex flex-col p-4">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className={`p-2 rounded-full ${theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-white/10'}`}>
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button onClick={() => setCurrentDate(new Date())} className={`px-4 py-1.5 rounded-full text-sm font-medium ${theme === 'light' ? 'bg-gray-200 text-gray-800' : 'bg-white/10 text-white'}`}>
                        Today
                    </button>
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className={`p-2 rounded-full ${theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-white/10'}`}>
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>

                {viewMode === 'grid' ? (
                    <div className="flex-1 grid grid-cols-7 gap-2 auto-rows-fr">
                        {DAYS_SHORT.map(day => (
                            <div key={day} className={`text-center text-xs font-bold uppercase tracking-wider py-2 ${theme === 'light' ? 'text-gray-500' : 'text-white/40'}`}>
                                {day}
                            </div>
                        ))}
                        
                        {/* Empty cells for start of month */}
                        {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() }).map((_, i) => (
                            <div key={`empty-${i}`} className={`rounded-xl ${theme === 'light' ? 'bg-gray-100/50' : 'bg-white/[0.01]'}`} />
                        ))}

                        {daysInMonth.map((date) => {
                            const dateStr = date.toISOString().split('T')[0];
                            const dayEvents = events.filter(e => e.date === dateStr);
                            const isToday = dateStr === new Date().toISOString().split('T')[0];

                            return (
                                <motion.button
                                    key={dateStr}
                                    whileHover={{ scale: 0.98 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleDateClick(date)}
                                    className={`relative p-2 rounded-xl flex flex-col items-center justify-start border transition-all ${
                                        isToday 
                                            ? 'border-cyan-500 bg-cyan-500/10' 
                                            : (theme === 'light' ? 'border-gray-200 bg-white hover:border-cyan-400' : 'border-white/5 bg-white/[0.02] hover:border-white/20')
                                    }`}
                                >
                                    <span className={`text-sm font-medium ${isToday ? 'text-cyan-500' : ''}`}>{date.getDate()}</span>
                                    {dayEvents.length > 0 && (
                                        <div className="mt-1 flex gap-1 flex-wrap justify-center">
                                            {dayEvents.slice(0, 3).map((_, i) => (
                                                <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                            ))}
                                            {dayEvents.length > 3 && <div className="w-1.5 h-1.5 rounded-full bg-white/40" />}
                                        </div>
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex-1 flex items-center overflow-x-auto premium-scroll pb-8 snap-x" ref={horizontalScrollRef}>
                        <div className="flex gap-4 px-4">
                            {daysInMonth.map((date) => {
                                const dateStr = date.toISOString().split('T')[0];
                                const dayEvents = events.filter(e => e.date === dateStr);
                                const isToday = dateStr === new Date().toISOString().split('T')[0];

                                return (
                                    <motion.button
                                        key={dateStr}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleDateClick(date)}
                                        className={`snap-center shrink-0 w-24 h-32 rounded-2xl flex flex-col items-center justify-center border transition-all ${
                                            isToday 
                                                ? 'border-cyan-500 bg-cyan-500/10' 
                                                : (theme === 'light' ? 'border-gray-200 bg-white hover:border-cyan-400' : 'border-white/5 bg-white/[0.02] hover:border-white/20')
                                        }`}
                                    >
                                        <span className={`text-xs uppercase tracking-widest mb-2 ${theme === 'light' ? 'text-gray-500' : 'text-white/40'}`}>{DAYS_SHORT[date.getDay()]}</span>
                                        <span className={`text-3xl font-light ${isToday ? 'text-cyan-500' : ''}`}>{date.getDate()}</span>
                                        {dayEvents.length > 0 && (
                                            <div className="mt-3 flex gap-1">
                                                {dayEvents.slice(0, 3).map((_, i) => (
                                                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                                ))}
                                            </div>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && selectedDate && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className={`w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] ${theme === 'light' ? 'bg-white text-gray-900' : 'bg-[#111] text-white border border-white/10'}`}
                        >
                            <div className={`p-6 border-b flex justify-between items-center ${theme === 'light' ? 'border-gray-200' : 'border-white/10'}`}>
                                <div>
                                    <h3 className="text-2xl font-bold">{selectedDate.getDate()} {MONTHS[selectedDate.getMonth()]}</h3>
                                    <p className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'text-white/50'}`}>{DAYS_SHORT[selectedDate.getDay()]}</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className={`p-2 rounded-full ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}>
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4 premium-scroll">
                                {selectedDateEvents.length === 0 ? (
                                    <div className={`text-center py-8 ${theme === 'light' ? 'text-gray-400' : 'text-white/30'}`}>
                                        <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>No tasks for this day.</p>
                                    </div>
                                ) : (
                                    selectedDateEvents.map(evt => (
                                        <div key={evt.id} className={`p-4 rounded-2xl border flex justify-between items-start group ${theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/10'}`}>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">{evt.time}</span>
                                                    <h4 className="font-semibold">{evt.title}</h4>
                                                </div>
                                                {evt.content && <p className={`text-sm mt-2 ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>{evt.content}</p>}
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => { setEditingEvent(evt); setAiInput(evt.title); }} className="p-2 rounded-lg hover:bg-blue-500/20 text-blue-500">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => deleteEvent(evt.id)} className="p-2 rounded-lg hover:bg-rose-500/20 text-rose-500">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className={`p-4 border-t ${theme === 'light' ? 'border-gray-200 bg-gray-50' : 'border-white/10 bg-white/[0.02]'}`}>
                                {suggestions.length > 0 && (
                                    <div className="flex gap-2 overflow-x-auto pb-3 premium-scroll">
                                        {suggestions.map((sug, i) => (
                                            <button key={i} onClick={() => setAiInput(sug)} className={`shrink-0 px-3 py-1.5 rounded-full text-xs border whitespace-nowrap ${theme === 'light' ? 'bg-white border-gray-200 text-gray-700' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}`}>
                                                {sug}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 relative">
                                        <input 
                                            type="text" 
                                            value={aiInput}
                                            onChange={e => setAiInput(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleAiInput()}
                                            placeholder={isVoiceMode ? "Listening..." : "Add task (e.g., Meeting at 3pm)"}
                                            className={`w-full pl-4 pr-12 py-3 rounded-2xl outline-none border transition-all ${theme === 'light' ? 'bg-white border-gray-300 focus:border-cyan-500' : 'bg-white/5 border-white/10 focus:border-cyan-500 text-white'}`}
                                        />
                                        <button 
                                            onClick={() => setIsVoiceMode(!isVoiceMode)}
                                            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-colors ${isVoiceMode ? 'bg-rose-500 text-white animate-pulse' : (theme === 'light' ? 'text-gray-400 hover:text-gray-600' : 'text-white/40 hover:text-white')}`}
                                        >
                                            <MicrophoneIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <button 
                                        onClick={handleAiInput}
                                        disabled={isAiProcessing || !aiInput.trim()}
                                        className="p-3 rounded-2xl bg-cyan-600 text-white hover:bg-cyan-500 disabled:opacity-50 transition-colors flex items-center justify-center"
                                    >
                                        {isAiProcessing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <PlusCircleIcon className="w-5 h-5" />}
                                    </button>
                                </div>
                                <div className="mt-3 flex justify-end items-center px-2">
                                    <span className="text-[10px] font-black tracking-widest uppercase text-white/30">AI Powered</span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PersonalCalendarView;
