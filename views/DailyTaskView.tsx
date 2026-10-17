import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { 
    Menu, ArrowLeft, Copy, Plus, Star, Calendar as CalendarIcon, 
    X, ChevronDown, Check, Layers, BarChart2, HelpCircle, 
    Trash2, CheckCircle2, Clock, Sparkles
} from 'lucide-react';

export interface TaskItem {
    id: string;
    title: string;
    note?: string;
    completed: boolean;
    priority: 'low' | 'medium' | 'high' | 'critical';
    list: string;
    dueDate: string; // e.g. "Today", "Tomorrow", "2026-10-18"
    dueTime?: string; // e.g. "06:30", "09:00"
    starred?: boolean;
    createdAt: number;
}

interface DailyTaskViewProps {
    userProfile: UserProfile;
    onClose: () => void;
}

const DEFAULT_LISTS = ['Personal', 'Work', 'Shopping', 'Health', 'Learning', 'Creative'];

const INITIAL_TASKS: TaskItem[] = [
    {
        id: 'task-1',
        title: 'Market Run',
        note: 'Fresh fruits, vegetables, almond milk, and artisan sourdough',
        completed: false,
        priority: 'medium',
        list: 'Shopping',
        dueDate: 'Today',
        starred: false,
        createdAt: Date.now() - 7200000,
    },
    {
        id: 'task-2',
        title: 'Deep Work Session',
        note: 'Complete SIFRA neural core architecture documentation',
        completed: false,
        priority: 'high',
        list: 'Work',
        dueDate: 'Today',
        dueTime: '09:00',
        starred: false,
        createdAt: Date.now() - 3600000,
    },
    {
        id: 'task-3',
        title: 'Morning Routine',
        note: 'Hydration, 20 min meditation, light stretching, and matcha tea',
        completed: false,
        priority: 'high',
        list: 'Health',
        dueDate: 'Today',
        dueTime: '06:30',
        starred: true,
        createdAt: Date.now(),
    }
];

const DailyTaskView: React.FC<DailyTaskViewProps> = ({ userProfile, onClose }) => {
    const storageKey = `sifra_daily_tasks_${userProfile?.userId || 'guest'}`;
    const listsStorageKey = `sifra_daily_task_lists_${userProfile?.userId || 'guest'}`;

    const [tasks, setTasks] = useLocalStorage<TaskItem[]>(storageKey, INITIAL_TASKS);
    const [lists, setLists] = useLocalStorage<string[]>(listsStorageKey, DEFAULT_LISTS);

    // Navigation and View states
    const [selectedList, setSelectedList] = useState<string>('All Tasks');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

    // Modal states for Drawer items
    const [isManageListsOpen, setIsManageListsOpen] = useState(false);
    const [isStatisticsOpen, setIsStatisticsOpen] = useState(false);
    const [isKnowSifraOpen, setIsKnowSifraOpen] = useState(false);

    // New list input state
    const [newListName, setNewListName] = useState('');

    // Form states for New Task
    const [taskTitle, setTaskTitle] = useState('');
    const [taskNote, setTaskNote] = useState('');
    const [taskList, setTaskList] = useState('Personal');
    const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
    const [taskDueDate, setTaskDueDate] = useState('Today');
    const [taskDueTime, setTaskDueTime] = useState('');
    const [taskStarred, setTaskStarred] = useState(false);

    // Filtering tasks
    const filteredTasks = useMemo(() => {
        if (selectedList === 'All Tasks') return tasks;
        return tasks.filter(t => t.list.toLowerCase() === selectedList.toLowerCase());
    }, [tasks, selectedList]);

    const completedCount = tasks.filter(t => t.completed).length;
    const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

    const toggleTaskComplete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const toggleTaskStar = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setTasks(prev => prev.map(t => t.id === id ? { ...t, starred: !t.starred } : t));
    };

    const deleteTask = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    const handleCreateTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!taskTitle.trim()) return;

        const newTask: TaskItem = {
            id: `task-${Date.now()}`,
            title: taskTitle.trim(),
            note: taskNote.trim() || undefined,
            completed: false,
            priority: taskPriority,
            list: taskList,
            dueDate: taskDueDate || 'Today',
            dueTime: taskDueTime.trim() || undefined,
            starred: taskStarred,
            createdAt: Date.now()
        };

        setTasks(prev => [newTask, ...prev]);

        // Reset form
        setTaskTitle('');
        setTaskNote('');
        setTaskList('Personal');
        setTaskPriority('medium');
        setTaskDueDate('Today');
        setTaskDueTime('');
        setTaskStarred(false);
        setIsNewTaskOpen(false);
    };

    const handleAddList = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newListName.trim();
        if (!trimmed || lists.includes(trimmed)) return;
        setLists(prev => [...prev, trimmed]);
        setNewListName('');
    };

    const handleDeleteList = (listToDelete: string) => {
        setLists(prev => prev.filter(l => l !== listToDelete));
        if (selectedList === listToDelete) setSelectedList('All Tasks');
    };

    // Priority Dot color helper
    const getPriorityDotColor = (priority: TaskItem['priority']) => {
        switch (priority) {
            case 'critical':
            case 'high':
                return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]';
            case 'medium':
                return 'bg-[#E5B85C] shadow-[0_0_8px_rgba(229,184,92,0.5)]';
            case 'low':
            default:
                return 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]';
        }
    };

    return (
        <div className="h-full w-full max-h-screen overflow-hidden bg-[#060709] text-gray-100 flex flex-col font-sans relative select-none">
            {/* ========================================================================= */}
            {/* TOP BAR / HEADER (Matching Screenshot 2) */}
            {/* ========================================================================= */}
            <header className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-white/[0.06] bg-[#060709]/95 backdrop-blur-xl z-20">
                <div className="flex items-center gap-3.5">
                    {/* Hamburger Menu Icon */}
                    <button 
                        onClick={() => setIsDrawerOpen(true)}
                        className="p-1 -ml-1 text-gray-200 hover:text-white active:scale-90 transition-transform"
                        aria-label="Open Navigation Drawer"
                    >
                        <Menu className="w-6 h-6 stroke-[2]" />
                    </button>

                    {/* Back Arrow Icon */}
                    <button 
                        onClick={onClose}
                        className="p-1 text-gray-300 hover:text-white active:scale-90 transition-transform"
                        aria-label="Close Daily Tasks"
                    >
                        <ArrowLeft className="w-5 h-5 stroke-[2]" />
                    </button>

                    {/* Titles */}
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#C5A358] leading-none mb-1">
                            DAILY SIFRA
                        </span>
                        <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight leading-none">
                            {selectedList}
                        </h1>
                    </div>
                </div>

                {/* Right Stack / Copy / List icon */}
                <button 
                    onClick={() => setIsDrawerOpen(true)}
                    className="p-2 text-gray-400 hover:text-[#C5A358] active:scale-90 transition-all rounded-xl"
                    aria-label="View Lists"
                >
                    <Copy className="w-5 h-5 stroke-[1.8]" />
                </button>
            </header>

            {/* Sub-header text (Matching Screenshot 2) */}
            <div className="px-5 py-2.5 text-center bg-black/30 border-b border-white/[0.04]">
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#C5A358]/90">
                    PREVIEW — TAP + TO ADD YOUR FIRST TASK
                </p>
            </div>

            {/* ========================================================================= */}
            {/* TASK CARDS LIST (Matching Screenshot 2) */}
            {/* ========================================================================= */}
            <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3 pb-32 premium-scroll relative z-10">
                <AnimatePresence>
                    {filteredTasks.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-20 px-6 rounded-3xl bg-white/[0.02] border border-white/5 my-6 flex flex-col items-center justify-center gap-3"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-[#C5A358]/10 text-[#C5A358] flex items-center justify-center shadow-[0_0_20px_rgba(197,163,88,0.15)]">
                                <CheckCircle2 className="w-7 h-7" />
                            </div>
                            <h3 className="font-serif text-lg font-bold text-white">No tasks in {selectedList}</h3>
                            <p className="text-xs text-gray-400 max-w-xs">
                                Tap the gold + button below to create your first task with due date, priority, and notes.
                            </p>
                        </motion.div>
                    ) : (
                        filteredTasks.map((task) => (
                            <motion.div
                                key={task.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`group rounded-2xl p-4 transition-all duration-200 border ${
                                    task.completed 
                                        ? 'bg-[#0b0c10]/70 border-white/[0.04] opacity-50' 
                                        : 'bg-[#0D0D11] border-white/[0.08] hover:border-[#C5A358]/30 shadow-lg'
                                } flex items-center justify-between gap-3`}
                            >
                                {/* Left Checkbox Circle */}
                                <button
                                    onClick={(e) => toggleTaskComplete(task.id, e)}
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                        task.completed 
                                            ? 'bg-[#E5B85C] border-[#E5B85C] text-slate-950 shadow-[0_0_10px_rgba(229,184,92,0.4)]' 
                                            : 'border-white/25 hover:border-[#E5B85C] bg-transparent'
                                    }`}
                                    aria-label="Toggle Complete"
                                >
                                    {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </button>

                                {/* Task Details (Middle) */}
                                <div className="flex flex-col flex-1 min-w-0">
                                    <h3 className={`text-sm sm:text-base font-semibold tracking-tight transition-colors truncate ${
                                        task.completed ? 'line-through text-gray-500' : 'text-white'
                                    }`}>
                                        {task.title}
                                    </h3>

                                    {/* Task metadata row */}
                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                        {/* Priority Dot */}
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <span className={`w-2 h-2 rounded-full ${getPriorityDotColor(task.priority)}`} />
                                            <span className="text-[11px] font-medium text-gray-400 capitalize">
                                                {task.list}
                                            </span>
                                        </div>

                                        {/* Due Date & Time */}
                                        {(task.dueDate || task.dueTime) && (
                                            <div className="flex items-center gap-1.5 text-[11px] text-gray-400 shrink-0">
                                                <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                                                <span>
                                                    {task.dueDate}
                                                    {task.dueTime ? ` • ${task.dueTime}` : ''}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Optional Note snippet if present */}
                                    {task.note && (
                                        <p className="text-[10px] text-gray-500 mt-1 line-clamp-1 italic">
                                            {task.note}
                                        </p>
                                    )}
                                </div>

                                {/* Right Controls: Star & Delete */}
                                <div className="flex items-center gap-1 shrink-0">
                                    <button 
                                        onClick={(e) => toggleTaskStar(task.id, e)}
                                        className="p-1.5 text-gray-500 hover:text-[#F5D076] transition-colors"
                                        aria-label="Star Task"
                                    >
                                        {task.starred ? (
                                            <Star className="w-4 h-4 fill-[#F5D076] text-[#F5D076] drop-shadow-[0_0_6px_rgba(245,208,118,0.6)]" />
                                        ) : (
                                            <Star className="w-4 h-4 text-white/20 hover:text-white/60" />
                                        )}
                                    </button>

                                    <button 
                                        onClick={(e) => deleteTask(task.id, e)}
                                        className="p-1.5 text-gray-600 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                                        aria-label="Delete Task"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </main>

            {/* ========================================================================= */}
            {/* FLOATING ACTION BUTTON (+) (Matching Screenshot 2) */}
            {/* ========================================================================= */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setIsNewTaskOpen(true)}
                className="fixed bottom-7 right-6 z-30 w-14 h-14 rounded-full bg-gradient-to-br from-[#F5D076] to-[#D9A33E] text-slate-950 flex items-center justify-center shadow-[0_0_30px_rgba(245,208,118,0.5)] border border-[#FFE8A3]/40 cursor-pointer"
                aria-label="Create New Task"
            >
                <Plus className="w-7 h-7 stroke-[2.5] text-slate-950" />
            </motion.button>

            {/* ========================================================================= */}
            {/* NAVIGATION DRAWER (Matching Screenshot 1) */}
            {/* ========================================================================= */}
            <AnimatePresence>
                {isDrawerOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDrawerOpen(false)}
                            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40"
                        />

                        {/* Drawer Panel */}
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                            className="fixed top-0 bottom-0 left-0 w-[290px] sm:w-[320px] bg-[#07080B] border-r border-[#C5A358]/20 z-50 flex flex-col justify-between p-6 shadow-2xl overflow-y-auto premium-scroll"
                        >
                            {/* Drawer Top Section */}
                            <div className="space-y-6">
                                {/* Header / Daily Task with glowing icon */}
                                <div className="flex items-center gap-4 pt-2">
                                    <div className="w-12 h-12 rounded-2xl bg-[#F6ECC9] text-[#1E1908] flex items-center justify-center shadow-[0_0_30px_rgba(246,236,201,0.45)] border border-white/40 shrink-0">
                                        {/* 3 bullet checklist icon */}
                                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                            <line x1="9" y1="6" x2="20" y2="6" />
                                            <line x1="9" y1="12" x2="20" y2="12" />
                                            <line x1="9" y1="18" x2="20" y2="18" />
                                            <circle cx="4.5" cy="6" r="1.5" fill="currentColor" />
                                            <circle cx="4.5" cy="12" r="1.5" fill="currentColor" />
                                            <circle cx="4.5" cy="18" r="1.5" fill="currentColor" />
                                        </svg>
                                    </div>
                                    <div className="flex flex-col">
                                        <h2 className="font-serif text-2xl font-bold text-white tracking-tight leading-none">
                                            Daily Task
                                        </h2>
                                        <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#C5A358] mt-1">
                                            NEURAL MEMORY
                                        </span>
                                    </div>
                                </div>

                                {/* Progress: "X of Y Sync'd" & Percent */}
                                <div className="pt-2">
                                    <div className="flex items-center justify-between text-xs mb-2">
                                        <span className="text-gray-400 font-medium">
                                            {completedCount} of {tasks.length} Sync'd
                                        </span>
                                        <span className="font-bold text-[#C5A358]">
                                            {progressPercent}%
                                        </span>
                                    </div>
                                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-[#C5A358] to-[#F5D076] rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progressPercent}%` }}
                                            transition={{ duration: 0.4 }}
                                        />
                                    </div>
                                </div>

                                {/* Section: NEURAL VIEW */}
                                <div className="pt-4 border-t border-white/[0.06]">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C5A358] block mb-3">
                                        NEURAL VIEW
                                    </span>

                                    {/* All Tasks Nav item */}
                                    <button
                                        onClick={() => {
                                            setSelectedList('All Tasks');
                                            setIsDrawerOpen(false);
                                        }}
                                        className={`w-full p-3 rounded-xl flex items-center justify-between transition-all ${
                                            selectedList === 'All Tasks'
                                                ? 'bg-[#181610] border border-[#C5A358]/40 text-[#E5C170] shadow-sm'
                                                : 'text-gray-300 hover:bg-white/5 border border-transparent'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Copy className="w-4 h-4 text-[#C5A358]" />
                                            <span className="text-sm font-bold">All Tasks</span>
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2A2416] text-[#C5A358] border border-[#C5A358]/20">
                                            {tasks.length}
                                        </span>
                                    </button>

                                    {/* Categorized Lists */}
                                    <div className="space-y-1 mt-2">
                                        {lists.map(listName => {
                                            const count = tasks.filter(t => t.list.toLowerCase() === listName.toLowerCase()).length;
                                            const isSelected = selectedList === listName;

                                            return (
                                                <button
                                                    key={listName}
                                                    onClick={() => {
                                                        setSelectedList(listName);
                                                        setIsDrawerOpen(false);
                                                    }}
                                                    className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between transition-all text-xs ${
                                                        isSelected
                                                            ? 'bg-[#181610] text-[#E5C170] font-bold border border-[#C5A358]/30'
                                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                    }`}
                                                >
                                                    <span className="capitalize">{listName}</span>
                                                    <span className="text-[10px] text-gray-500 font-mono">
                                                        {count}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Drawer Bottom Options (Matching Screenshot 1) */}
                            <div className="pt-6 border-t border-white/[0.08] space-y-4">
                                {/* Manage Lists */}
                                <button
                                    onClick={() => {
                                        setIsDrawerOpen(false);
                                        setIsManageListsOpen(true);
                                    }}
                                    className="w-full flex items-center gap-3 text-gray-300 hover:text-white text-xs font-medium transition-colors"
                                >
                                    <Layers className="w-4 h-4 text-gray-400" />
                                    <span>Manage Lists</span>
                                </button>

                                {/* Statistics */}
                                <button
                                    onClick={() => {
                                        setIsDrawerOpen(false);
                                        setIsStatisticsOpen(true);
                                    }}
                                    className="w-full flex items-center gap-3 text-gray-300 hover:text-white text-xs font-medium transition-colors"
                                >
                                    <BarChart2 className="w-4 h-4 text-gray-400" />
                                    <span>Statistics</span>
                                </button>

                                {/* Know Sifra Daily Task */}
                                <button
                                    onClick={() => {
                                        setIsDrawerOpen(false);
                                        setIsKnowSifraOpen(true);
                                    }}
                                    className="w-full flex items-center gap-3 text-[#E5C170] hover:text-[#FADB8C] text-xs font-semibold transition-colors"
                                >
                                    <HelpCircle className="w-4 h-4 text-[#C5A358]" />
                                    <span>Know Sifra Daily Task</span>
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* ========================================================================= */}
            {/* NEW TASK MODAL / BOTTOM SHEET (Matching Screenshot 3) */}
            {/* ========================================================================= */}
            <AnimatePresence>
                {isNewTaskOpen && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4">
                        <motion.div
                            initial={{ opacity: 0, y: '100%' }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                            className="w-full max-w-lg bg-[#0F0F14] border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 sm:p-7 shadow-2xl max-h-[92vh] overflow-y-auto premium-scroll relative"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
                                <h2 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight">
                                    New Task
                                </h2>
                                <button
                                    onClick={() => setIsNewTaskOpen(false)}
                                    className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                                    aria-label="Close"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleCreateTask} className="space-y-4">
                                {/* TASK TITLE */}
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A358] block mb-2">
                                        TASK TITLE
                                    </label>
                                    <input
                                        type="text"
                                        value={taskTitle}
                                        onChange={(e) => setTaskTitle(e.target.value)}
                                        placeholder="What needs to be done?"
                                        required
                                        autoFocus
                                        className="w-full bg-[#16161D] border border-white/10 focus:border-[#C5A358] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors"
                                    />
                                </div>

                                {/* NOTE */}
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A358] block mb-2">
                                        NOTE
                                    </label>
                                    <textarea
                                        value={taskNote}
                                        onChange={(e) => setTaskNote(e.target.value)}
                                        placeholder="Add details..."
                                        rows={3}
                                        className="w-full bg-[#16161D] border border-white/10 focus:border-[#C5A358] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none resize-none transition-colors"
                                    />
                                </div>

                                {/* LIST & PRIORITY ROW */}
                                <div className="grid grid-cols-2 gap-3.5">
                                    {/* LIST */}
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A358] block mb-2">
                                            LIST
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={taskList}
                                                onChange={(e) => setTaskList(e.target.value)}
                                                className="w-full appearance-none bg-[#16161D] border border-white/10 focus:border-[#C5A358] rounded-xl px-4 py-3 text-sm text-white outline-none pr-9 transition-colors cursor-pointer capitalize"
                                            >
                                                {lists.map(l => (
                                                    <option key={l} value={l} className="bg-[#16161D] text-white">
                                                        {l}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* PRIORITY */}
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A358] block mb-2">
                                            PRIORITY
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={taskPriority}
                                                onChange={(e) => setTaskPriority(e.target.value as any)}
                                                className="w-full appearance-none bg-[#16161D] border border-white/10 focus:border-[#C5A358] rounded-xl px-4 py-3 text-sm text-white outline-none pr-9 transition-colors cursor-pointer capitalize"
                                            >
                                                <option value="low" className="bg-[#16161D] text-white">Low</option>
                                                <option value="medium" className="bg-[#16161D] text-white">Medium</option>
                                                <option value="high" className="bg-[#16161D] text-white">High</option>
                                                <option value="critical" className="bg-[#16161D] text-white">Critical</option>
                                            </select>
                                            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* DUE DATE & TIME ROW */}
                                <div className="grid grid-cols-2 gap-3.5">
                                    {/* DUE DATE */}
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A358] block mb-2">
                                            DUE DATE
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={taskDueDate}
                                                onChange={(e) => setTaskDueDate(e.target.value)}
                                                className="w-full appearance-none bg-[#16161D] border border-white/10 focus:border-[#C5A358] rounded-xl px-4 py-3 text-sm text-white outline-none pr-9 transition-colors cursor-pointer"
                                            >
                                                <option value="Today" className="bg-[#16161D] text-white">Today</option>
                                                <option value="Tomorrow" className="bg-[#16161D] text-white">Tomorrow</option>
                                                <option value="This Weekend" className="bg-[#16161D] text-white">This Weekend</option>
                                                <option value="Next Week" className="bg-[#16161D] text-white">Next Week</option>
                                                <option value="Someday" className="bg-[#16161D] text-white">Someday</option>
                                            </select>
                                            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* TIME */}
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A358] block mb-2">
                                            TIME
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={taskDueTime}
                                                onChange={(e) => setTaskDueTime(e.target.value)}
                                                className="w-full appearance-none bg-[#16161D] border border-white/10 focus:border-[#C5A358] rounded-xl px-4 py-3 text-sm text-white outline-none pr-9 transition-colors cursor-pointer"
                                            >
                                                <option value="" className="bg-[#16161D] text-white">None</option>
                                                <option value="06:30" className="bg-[#16161D] text-white">06:30 AM</option>
                                                <option value="09:00" className="bg-[#16161D] text-white">09:00 AM</option>
                                                <option value="12:00" className="bg-[#16161D] text-white">12:00 PM</option>
                                                <option value="14:00" className="bg-[#16161D] text-white">02:00 PM</option>
                                                <option value="18:00" className="bg-[#16161D] text-white">06:00 PM</option>
                                                <option value="21:00" className="bg-[#16161D] text-white">09:00 PM</option>
                                            </select>
                                            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* Star Toggle Option */}
                                <div className="pt-2 flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={() => setTaskStarred(!taskStarred)}
                                        className="flex items-center gap-2 text-xs font-medium text-gray-300 hover:text-white"
                                    >
                                        <Star className={`w-4 h-4 ${taskStarred ? 'fill-[#F5D076] text-[#F5D076]' : 'text-gray-500'}`} />
                                        <span>Mark as High Importance</span>
                                    </button>
                                </div>

                                {/* Create Task Button */}
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#F5D076] via-[#E5B85C] to-[#D4AF37] hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer"
                                    >
                                        Create Task
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ========================================================================= */}
            {/* MANAGE LISTS MODAL */}
            {/* ========================================================================= */}
            <AnimatePresence>
                {isManageListsOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md bg-[#0F0F14] border border-white/10 rounded-3xl p-6 shadow-2xl relative"
                        >
                            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
                                <div className="flex items-center gap-2.5">
                                    <Layers className="w-5 h-5 text-[#C5A358]" />
                                    <h3 className="font-serif text-lg font-bold text-white">Manage Lists</h3>
                                </div>
                                <button onClick={() => setIsManageListsOpen(false)} className="p-1.5 text-gray-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Add List Input */}
                            <form onSubmit={handleAddList} className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={newListName}
                                    onChange={(e) => setNewListName(e.target.value)}
                                    placeholder="New list name..."
                                    className="flex-1 bg-[#16161D] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 outline-none focus:border-[#C5A358]"
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2.5 rounded-xl bg-[#C5A358] text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95"
                                >
                                    Add
                                </button>
                            </form>

                            {/* Lists List */}
                            <div className="space-y-2 max-h-60 overflow-y-auto premium-scroll">
                                {lists.map((l) => (
                                    <div key={l} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-[#C5A358]" />
                                            <span className="text-sm font-semibold capitalize text-gray-200">{l}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-gray-500 font-mono">
                                                {tasks.filter(t => t.list.toLowerCase() === l.toLowerCase()).length} tasks
                                            </span>
                                            {lists.length > 1 && (
                                                <button
                                                    onClick={() => handleDeleteList(l)}
                                                    className="p-1 text-gray-500 hover:text-rose-400"
                                                    aria-label="Delete list"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ========================================================================= */}
            {/* STATISTICS MODAL */}
            {/* ========================================================================= */}
            <AnimatePresence>
                {isStatisticsOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md bg-[#0F0F14] border border-white/10 rounded-3xl p-6 shadow-2xl relative"
                        >
                            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
                                <div className="flex items-center gap-2.5">
                                    <BarChart2 className="w-5 h-5 text-[#C5A358]" />
                                    <h3 className="font-serif text-lg font-bold text-white">Daily Task Statistics</h3>
                                </div>
                                <button onClick={() => setIsStatisticsOpen(false)} className="p-1.5 text-gray-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="p-3.5 rounded-2xl bg-[#16161D] border border-white/5">
                                    <span className="text-[10px] uppercase font-bold text-[#C5A358] tracking-wider block">Sync Rate</span>
                                    <span className="text-2xl font-black text-white mt-1 block">{progressPercent}%</span>
                                    <span className="text-[10px] text-gray-400 font-medium">{completedCount} of {tasks.length} tasks completed</span>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-[#16161D] border border-white/5">
                                    <span className="text-[10px] uppercase font-bold text-[#C5A358] tracking-wider block">Active Tasks</span>
                                    <span className="text-2xl font-black text-amber-300 mt-1 block">{tasks.length - completedCount}</span>
                                    <span className="text-[10px] text-gray-400 font-medium">Pending completion</span>
                                </div>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">High Priority Tasks:</span>
                                    <span className="font-bold text-red-400">{tasks.filter(t => t.priority === 'high' || t.priority === 'critical').length}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Medium Priority Tasks:</span>
                                    <span className="font-bold text-[#E5B85C]">{tasks.filter(t => t.priority === 'medium').length}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Starred / Essential:</span>
                                    <span className="font-bold text-amber-300">{tasks.filter(t => t.starred).length}</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ========================================================================= */}
            {/* KNOW SIFRA DAILY TASK MODAL */}
            {/* ========================================================================= */}
            <AnimatePresence>
                {isKnowSifraOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md bg-[#0F0F14] border border-[#C5A358]/30 rounded-3xl p-6 shadow-2xl relative"
                        >
                            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
                                <div className="flex items-center gap-2.5">
                                    <HelpCircle className="w-5 h-5 text-[#C5A358]" />
                                    <h3 className="font-serif text-lg font-bold text-white">Know Sifra Daily Task</h3>
                                </div>
                                <button onClick={() => setIsKnowSifraOpen(false)} className="p-1.5 text-gray-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-3 text-xs text-gray-300 leading-relaxed">
                                <div className="p-3 rounded-2xl bg-[#C5A358]/10 border border-[#C5A358]/20 text-[#E5C170]">
                                    <p className="font-bold mb-1">Neural Memory & Flow</p>
                                    <p className="text-[11px] text-gray-300">
                                        SIFRA Daily Task is your personal neural scheduler, organizing your daily objectives with real-time sync, customizable lists, and priority telemetry.
                                    </p>
                                </div>
                                <ul className="space-y-2 text-[11px] text-gray-400 pt-1">
                                    <li className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#C5A358] mt-1 shrink-0" />
                                        <span>Tap the checkmark circle to mark tasks as completed and track progress.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#C5A358] mt-1 shrink-0" />
                                        <span>Tap the star icon on any card to mark it as high importance.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#C5A358] mt-1 shrink-0" />
                                        <span>Open the navigation drawer via the menu icon to switch lists, manage custom categories, and check task statistics.</span>
                                    </li>
                                </ul>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DailyTaskView;
