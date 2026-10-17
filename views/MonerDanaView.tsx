import React, { useState, useMemo, useRef, useEffect } from 'react';
import { UserProfile, View } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, Search, Plus, Pin, PinOff, Archive, Trash2, 
    RotateCcw, CheckSquare, Square, Image as ImageIcon, Palette, 
    Tag, Bell, Check, MoreVertical, Grid, List, X, Menu, 
    Clock, Sparkles, FolderArchive, HelpCircle, Edit3, Heart
} from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface MonerDanaViewProps {
    userProfile: UserProfile;
    onClose: () => void;
    onNavigate: (view: View, params?: any) => void;
}

export interface ChecklistItem {
    id: string;
    text: string;
    done: boolean;
}

export interface KeepNote {
    id: string;
    title: string;
    content: string;
    checklist: ChecklistItem[];
    isChecklist: boolean;
    color: string;
    labels: string[];
    images: string[];
    pinned: boolean;
    archived: boolean;
    inTrash: boolean;
    reminder?: string;
    createdAt: number;
    updatedAt: number;
}

const COLOR_PALETTE: { id: string; name: string; bgClass: string; borderClass: string; hex: string }[] = [
    { id: 'default', name: 'Default', bgClass: 'bg-[#18181b]', borderClass: 'border-zinc-800', hex: '#18181b' },
    { id: 'coral', name: 'Coral', bgClass: 'bg-[#481d1d]', borderClass: 'border-red-500/40', hex: '#481d1d' },
    { id: 'peach', name: 'Peach', bgClass: 'bg-[#4a2b16]', borderClass: 'border-orange-500/40', hex: '#4a2b16' },
    { id: 'sand', name: 'Sand', bgClass: 'bg-[#463d14]', borderClass: 'border-amber-500/40', hex: '#463d14' },
    { id: 'mint', name: 'Mint', bgClass: 'bg-[#143a35]', borderClass: 'border-teal-500/40', hex: '#143a35' },
    { id: 'sage', name: 'Sage', bgClass: 'bg-[#1b3d22]', borderClass: 'border-emerald-500/40', hex: '#1b3d22' },
    { id: 'fog', name: 'Fog', bgClass: 'bg-[#173646]', borderClass: 'border-cyan-500/40', hex: '#173646' },
    { id: 'storm', name: 'Storm', bgClass: 'bg-[#1a2d48]', borderClass: 'border-blue-500/40', hex: '#1a2d48' },
    { id: 'dusk', name: 'Dusk', bgClass: 'bg-[#311f44]', borderClass: 'border-purple-500/40', hex: '#311f44' },
    { id: 'blossom', name: 'Blossom', bgClass: 'bg-[#441a34]', borderClass: 'border-pink-500/40', hex: '#441a34' },
    { id: 'clay', name: 'Clay', bgClass: 'bg-[#382619]', borderClass: 'border-yellow-700/40', hex: '#382619' },
];

const PRESET_LABELS = ['Personal', 'Ideas (ধারণা)', 'Reflections', 'Travel', 'Daily Goals', 'SIFRA'];

const INITIAL_NOTES: KeepNote[] = [
    {
        id: 'note-1',
        title: 'মনের কথা ও অনুপ্রেরণা',
        content: '“প্রতিটি নতুন দিন একটি নতুন সুযোগ নিয়ে আসে। মনের ডানা মেলে উড়তে শেখো, ভয়কে পিছনে ফেলে স্বপ্নের পথে এগিয়ে চলো।”',
        checklist: [],
        isChecklist: false,
        color: 'peach',
        labels: ['Reflections', 'Personal'],
        images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'],
        pinned: true,
        archived: false,
        inTrash: false,
        reminder: 'Tomorrow, 8:00 AM',
        createdAt: Date.now() - 86400000,
        updatedAt: Date.now() - 86400000,
    },
    {
        id: 'note-2',
        title: 'Weekly Mindfulness Checklist',
        content: '',
        checklist: [
            { id: 'c-1', text: 'Morning 15 min silent breathing & gratitude', done: true },
            { id: 'c-2', text: 'Hydration: drink 3 liters of fresh water daily', done: true },
            { id: 'c-3', text: 'Read 20 pages of philosophical literature', done: false },
            { id: 'c-4', text: 'Evening walking in nature without phone', done: false },
        ],
        isChecklist: true,
        color: 'mint',
        labels: ['Daily Goals'],
        images: [],
        pinned: true,
        archived: false,
        inTrash: false,
        createdAt: Date.now() - 43200000,
        updatedAt: Date.now() - 43200000,
    },
    {
        id: 'note-3',
        title: 'Next Travel Vision: Darjeeling & Hills',
        content: 'পাহাড়ের কুয়াশা, কাঞ্চনজঙ্ঘার সোনালী সূর্যোদয় এবং গরম দার্জিলিং চায়ের কাপ। মনের প্রশান্তির জন্য এই যাত্রাটি খুব দরকার।',
        checklist: [],
        isChecklist: false,
        color: 'sand',
        labels: ['Travel', 'Ideas (ধারণা)'],
        images: ['https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80'],
        pinned: false,
        archived: false,
        inTrash: false,
        createdAt: Date.now() - 10000000,
        updatedAt: Date.now() - 10000000,
    },
    {
        id: 'note-4',
        title: 'SIFRA AI Innovations',
        content: 'Neural synthesis with real-time streaming, multilingual travel dossiers, and smart Google Keep note persistence.',
        checklist: [],
        isChecklist: false,
        color: 'dusk',
        labels: ['SIFRA'],
        images: [],
        pinned: false,
        archived: false,
        inTrash: false,
        createdAt: Date.now() - 5000000,
        updatedAt: Date.now() - 5000000,
    }
];

type KeepFolder = 'notes' | 'reminders' | 'archive' | 'trash';

const MonerDanaView: React.FC<MonerDanaViewProps> = ({ userProfile, onClose }) => {
    const storageKey = `sifra_keep_notes_${userProfile.userId || 'guest'}`;
    const labelsStorageKey = `sifra_keep_labels_${userProfile.userId || 'guest'}`;

    const [notes, setNotes] = useLocalStorage<KeepNote[]>(storageKey, INITIAL_NOTES);
    const [allLabels, setAllLabels] = useLocalStorage<string[]>(labelsStorageKey, PRESET_LABELS);

    // Navigation and View states
    const [currentFolder, setCurrentFolder] = useState<KeepFolder>('notes');
    const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Active Note Modal / Editor State
    const [editingNote, setEditingNote] = useState<KeepNote | null>(null);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [activeColorPickerNoteId, setActiveColorPickerNoteId] = useState<string | null>(null);

    // File input ref for images
    const imageInputRef = useRef<HTMLInputElement>(null);

    // Form states for current editing note
    const [formTitle, setFormTitle] = useState('');
    const [formContent, setFormContent] = useState('');
    const [formChecklist, setFormChecklist] = useState<ChecklistItem[]>([]);
    const [formIsChecklist, setFormIsChecklist] = useState(false);
    const [formColor, setFormColor] = useState('default');
    const [formLabels, setFormLabels] = useState<string[]>([]);
    const [formImages, setFormImages] = useState<string[]>([]);
    const [formPinned, setFormPinned] = useState(false);
    const [formReminder, setFormReminder] = useState<string | undefined>(undefined);
    const [newChecklistText, setNewChecklistText] = useState('');

    // Open note in editor
    const openNoteEditor = (note: KeepNote) => {
        setEditingNote(note);
        setIsCreatingNew(false);
        setFormTitle(note.title);
        setFormContent(note.content);
        setFormChecklist(note.checklist || []);
        setFormIsChecklist(note.isChecklist || false);
        setFormColor(note.color || 'default');
        setFormLabels(note.labels || []);
        setFormImages(note.images || []);
        setFormPinned(note.pinned || false);
        setFormReminder(note.reminder);
    };

    // Open new note
    const startNewNote = (asChecklist = false) => {
        setEditingNote(null);
        setIsCreatingNew(true);
        setFormTitle('');
        setFormContent('');
        setFormChecklist(asChecklist ? [{ id: `item-${Date.now()}`, text: '', done: false }] : []);
        setFormIsChecklist(asChecklist);
        setFormColor('default');
        setFormLabels(selectedLabel ? [selectedLabel] : []);
        setFormImages([]);
        setFormPinned(false);
        setFormReminder(undefined);
        setNewChecklistText('');
    };

    // Save note
    const saveCurrentNote = () => {
        if (!formTitle.trim() && !formContent.trim() && formChecklist.length === 0 && formImages.length === 0) {
            // Nothing to save
            setIsCreatingNew(false);
            setEditingNote(null);
            return;
        }

        const validChecklist = formChecklist.filter(item => item.text.trim().length > 0);

        if (isCreatingNew) {
            const newNote: KeepNote = {
                id: `keep-${Date.now()}`,
                title: formTitle.trim(),
                content: formContent.trim(),
                checklist: validChecklist,
                isChecklist: formIsChecklist,
                color: formColor,
                labels: formLabels,
                images: formImages,
                pinned: formPinned,
                archived: false,
                inTrash: false,
                reminder: formReminder,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };
            setNotes(prev => [newNote, ...prev]);
        } else if (editingNote) {
            setNotes(prev => prev.map(n => n.id === editingNote.id ? {
                ...n,
                title: formTitle.trim(),
                content: formContent.trim(),
                checklist: validChecklist,
                isChecklist: formIsChecklist,
                color: formColor,
                labels: formLabels,
                images: formImages,
                pinned: formPinned,
                reminder: formReminder,
                updatedAt: Date.now(),
            } : n));
        }

        setIsCreatingNew(false);
        setEditingNote(null);
    };

    // Note actions
    const togglePin = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
    };

    const toggleArchive = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setNotes(prev => prev.map(n => n.id === id ? { ...n, archived: !n.archived, inTrash: false } : n));
        if (editingNote?.id === id) setEditingNote(null);
    };

    const moveToTrash = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setNotes(prev => prev.map(n => n.id === id ? { ...n, inTrash: true, pinned: false } : n));
        if (editingNote?.id === id) setEditingNote(null);
    };

    const restoreFromTrash = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setNotes(prev => prev.map(n => n.id === id ? { ...n, inTrash: false } : n));
    };

    const deleteForever = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (window.confirm('Delete note permanently?')) {
            setNotes(prev => prev.filter(n => n.id !== id));
        }
    };

    const emptyTrash = () => {
        if (window.confirm('Empty trash permanently? All deleted notes will be lost.')) {
            setNotes(prev => prev.filter(n => !n.inTrash));
        }
    };

    const setNoteColor = (id: string, colorId: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setNotes(prev => prev.map(n => n.id === id ? { ...n, color: colorId } : n));
        setActiveColorPickerNoteId(null);
    };

    const toggleChecklistItem = (noteId: string, itemId: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setNotes(prev => prev.map(n => {
            if (n.id !== noteId) return n;
            return {
                ...n,
                checklist: n.checklist.map(item => item.id === itemId ? { ...item, done: !item.done } : item)
            };
        }));
    };

    // Image upload handler
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            setFormImages(prev => [...prev, dataUrl]);
        };
        reader.readAsDataURL(file);
    };

    // Filtered Notes computation
    const filteredNotes = useMemo(() => {
        let base = notes;

        if (currentFolder === 'trash') {
            base = base.filter(n => n.inTrash);
        } else if (currentFolder === 'archive') {
            base = base.filter(n => n.archived && !n.inTrash);
        } else if (currentFolder === 'reminders') {
            base = base.filter(n => !n.inTrash && !n.archived && Boolean(n.reminder));
        } else {
            // Notes folder
            base = base.filter(n => !n.inTrash && !n.archived);
        }

        // Label filter
        if (selectedLabel) {
            base = base.filter(n => n.labels && n.labels.includes(selectedLabel));
        }

        // Search query
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            base = base.filter(n => 
                n.title.toLowerCase().includes(q) ||
                n.content.toLowerCase().includes(q) ||
                n.labels.some(l => l.toLowerCase().includes(q)) ||
                n.checklist.some(c => c.text.toLowerCase().includes(q))
            );
        }

        return base;
    }, [notes, currentFolder, selectedLabel, searchQuery]);

    const pinnedNotes = useMemo(() => filteredNotes.filter(n => n.pinned), [filteredNotes]);
    const otherNotes = useMemo(() => filteredNotes.filter(n => !n.pinned), [filteredNotes]);

    // Color helper
    const getColorTheme = (colorId: string) => {
        return COLOR_PALETTE.find(c => c.id === colorId) || COLOR_PALETTE[0];
    };

    return (
        <div className="h-full w-full max-h-screen overflow-hidden bg-[#0a0a0d] text-zinc-100 flex flex-col font-sans select-none relative">
            {/* Hidden file input for image upload */}
            <input 
                type="file" 
                ref={imageInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
            />

            {/* ========================================================================= */}
            {/* GOOGLE KEEP STYLE TOP BAR */}
            {/* ========================================================================= */}
            <header className="px-4 py-3 bg-[#0e0e13]/90 backdrop-blur-xl border-b border-white/[0.08] flex items-center justify-between gap-3 sticky top-0 z-30 shadow-md">
                <div className="flex items-center gap-2">
                    {/* Drawer Hamburger Menu */}
                    <button 
                        onClick={() => setIsDrawerOpen(true)}
                        className="p-2 text-zinc-300 hover:text-white rounded-full hover:bg-white/10 active:scale-95 transition-all"
                        aria-label="Open Navigation Drawer"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    {/* Back Arrow to SIFRA */}
                    <button 
                        onClick={onClose}
                        className="p-2 text-zinc-300 hover:text-white rounded-full hover:bg-white/10 active:scale-95 transition-all"
                        aria-label="Back to SIFRA"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    {/* Title branding */}
                    <div className="flex items-center gap-1.5 ml-1">
                        <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                        <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-none">
                            {currentFolder === 'trash' ? 'Trash' : currentFolder === 'archive' ? 'Archive' : currentFolder === 'reminders' ? 'Reminders' : selectedLabel || 'মনের ডানা'}
                        </h1>
                    </div>
                </div>

                {/* Right controls: Layout switch & Clear trash */}
                <div className="flex items-center gap-1">
                    {currentFolder === 'trash' && notes.some(n => n.inTrash) && (
                        <button
                            onClick={emptyTrash}
                            className="px-3 py-1 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 rounded-full border border-rose-500/20"
                        >
                            Empty Trash
                        </button>
                    )}

                    <button
                        onClick={() => setLayoutMode(layoutMode === 'grid' ? 'list' : 'grid')}
                        className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 active:scale-90 transition-all"
                        aria-label="Toggle Layout Mode"
                    >
                        {layoutMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
                    </button>
                </div>
            </header>

            {/* ========================================================================= */}
            {/* SEARCH BAR (Google Keep signature search pill) */}
            {/* ========================================================================= */}
            <div className="px-4 pt-3 pb-1">
                <div className="flex items-center gap-3 bg-[#18181f] border border-white/10 rounded-full px-4 py-2.5 focus-within:border-amber-400/50 shadow-inner transition-all">
                    <Search className="w-4 h-4 text-zinc-400 shrink-0" />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search your notes, thoughts & memories..." 
                        className="bg-transparent border-none outline-none text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 w-full font-medium"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="text-xs text-zinc-400 hover:text-white">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Active Label indicator if label selected */}
            {selectedLabel && (
                <div className="px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-pink-400" />
                        <span className="text-xs font-bold text-pink-300">Label: {selectedLabel}</span>
                    </div>
                    <button 
                        onClick={() => setSelectedLabel(null)}
                        className="text-[11px] text-zinc-400 hover:text-white underline"
                    >
                        Clear filter
                    </button>
                </div>
            )}

            {/* ========================================================================= */}
            {/* NOTES GRID / LIST CONTENT */}
            {/* ========================================================================= */}
            <main className="flex-1 overflow-y-auto px-4 py-3 pb-32 premium-scroll space-y-6">
                {filteredNotes.length === 0 ? (
                    <div className="text-center py-24 flex flex-col items-center justify-center gap-3 opacity-60">
                        {currentFolder === 'trash' ? (
                            <>
                                <Trash2 className="w-12 h-12 text-zinc-500" />
                                <p className="text-sm font-semibold text-zinc-400">No notes in Trash</p>
                            </>
                        ) : currentFolder === 'archive' ? (
                            <>
                                <Archive className="w-12 h-12 text-zinc-500" />
                                <p className="text-sm font-semibold text-zinc-400">Your archived notes appear here</p>
                            </>
                        ) : currentFolder === 'reminders' ? (
                            <>
                                <Bell className="w-12 h-12 text-zinc-500" />
                                <p className="text-sm font-semibold text-zinc-400">Notes with upcoming reminders appear here</p>
                            </>
                        ) : (
                            <>
                                <Edit3 className="w-12 h-12 text-amber-500/80" />
                                <p className="text-sm font-bold text-zinc-300">মনের ডানা — আপনার অনুভূতি ও নোটবুক</p>
                                <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
                                    নিচের বার থেকে নোট লিখুন অথবা চেকলিস্ট তৈরি করুন
                                </p>
                            </>
                        )}
                    </div>
                ) : (
                    <>
                        {/* PINNED SECTION */}
                        {pinnedNotes.length > 0 && currentFolder === 'notes' && (
                            <section className="space-y-2.5">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 block px-1">
                                    PINNED ({pinnedNotes.length})
                                </span>
                                <div className={layoutMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'space-y-3'}>
                                    {pinnedNotes.map(note => renderNoteCard(note))}
                                </div>
                            </section>
                        )}

                        {/* OTHERS SECTION */}
                        {otherNotes.length > 0 && (
                            <section className="space-y-2.5">
                                {pinnedNotes.length > 0 && currentFolder === 'notes' && (
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 block px-1 pt-2">
                                        OTHERS
                                    </span>
                                )}
                                <div className={layoutMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'space-y-3'}>
                                    {otherNotes.map(note => renderNoteCard(note))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </main>

            {/* ========================================================================= */}
            {/* GOOGLE KEEP SIGNATURE BOTTOM QUICK BAR */}
            {/* ========================================================================= */}
            {currentFolder === 'notes' && (
                <div className="fixed bottom-4 left-4 right-4 z-20 max-w-lg mx-auto">
                    <div 
                        onClick={() => startNewNote(false)}
                        className="bg-[#1e1e26] border border-white/15 rounded-full px-5 py-3 shadow-[0_10px_35px_rgba(0,0,0,0.6)] flex items-center justify-between cursor-pointer hover:border-amber-400/40 transition-all active:scale-[0.99]"
                    >
                        <span className="text-xs sm:text-sm font-medium text-zinc-400">
                            Take a note...
                        </span>

                        <div className="flex items-center gap-2 text-zinc-300">
                            {/* New Checklist Button */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    startNewNote(true);
                                }}
                                className="p-1.5 rounded-full hover:bg-white/10 hover:text-white transition-colors"
                                title="New Checklist"
                                aria-label="New Checklist"
                            >
                                <CheckSquare className="w-5 h-5" />
                            </button>

                            {/* New Image Note Button */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    startNewNote(false);
                                    setTimeout(() => imageInputRef.current?.click(), 100);
                                }}
                                className="p-1.5 rounded-full hover:bg-white/10 hover:text-white transition-colors"
                                title="New Image Note"
                                aria-label="New Image Note"
                            >
                                <ImageIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* NAVIGATION DRAWER (Google Keep Sidebar) */}
            {/* ========================================================================= */}
            <AnimatePresence>
                {isDrawerOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDrawerOpen(false)}
                            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                            className="fixed top-0 bottom-0 left-0 w-[280px] bg-[#121218] border-r border-white/10 z-50 flex flex-col justify-between p-5 shadow-2xl overflow-y-auto premium-scroll"
                        >
                            <div className="space-y-6">
                                {/* Branding */}
                                <div className="flex items-center gap-3 pt-2 px-1">
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
                                        <Heart className="w-5 h-5 fill-white" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-base text-white tracking-tight">মনের ডানা</h2>
                                        <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">Keep Notes Hub</p>
                                    </div>
                                </div>

                                {/* Main Folders */}
                                <nav className="space-y-1">
                                    <button
                                        onClick={() => {
                                            setCurrentFolder('notes');
                                            setSelectedLabel(null);
                                            setIsDrawerOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-full text-xs font-bold transition-all ${
                                            currentFolder === 'notes' && !selectedLabel ? 'bg-amber-400/15 text-amber-300' : 'text-zinc-300 hover:bg-white/5'
                                        }`}
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        <span>Notes</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setCurrentFolder('reminders');
                                            setSelectedLabel(null);
                                            setIsDrawerOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-full text-xs font-bold transition-all ${
                                            currentFolder === 'reminders' ? 'bg-amber-400/15 text-amber-300' : 'text-zinc-300 hover:bg-white/5'
                                        }`}
                                    >
                                        <Bell className="w-4 h-4" />
                                        <span>Reminders</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setCurrentFolder('archive');
                                            setSelectedLabel(null);
                                            setIsDrawerOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-full text-xs font-bold transition-all ${
                                            currentFolder === 'archive' ? 'bg-amber-400/15 text-amber-300' : 'text-zinc-300 hover:bg-white/5'
                                        }`}
                                    >
                                        <FolderArchive className="w-4 h-4" />
                                        <span>Archive</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setCurrentFolder('trash');
                                            setSelectedLabel(null);
                                            setIsDrawerOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-full text-xs font-bold transition-all ${
                                            currentFolder === 'trash' ? 'bg-amber-400/15 text-amber-300' : 'text-zinc-300 hover:bg-white/5'
                                        }`}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span>Trash</span>
                                    </button>
                                </nav>

                                {/* Labels Section */}
                                <div className="pt-4 border-t border-white/10">
                                    <div className="flex items-center justify-between px-3 mb-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">LABELS</span>
                                    </div>
                                    <div className="space-y-1">
                                        {allLabels.map(label => (
                                            <button
                                                key={label}
                                                onClick={() => {
                                                    setSelectedLabel(label);
                                                    setCurrentFolder('notes');
                                                    setIsDrawerOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-full text-xs transition-all ${
                                                    selectedLabel === label ? 'bg-pink-500/20 text-pink-300 font-bold' : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                                                }`}
                                            >
                                                <Tag className="w-3.5 h-3.5" />
                                                <span className="truncate">{label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Drawer Footer */}
                            <div className="pt-4 border-t border-white/10 text-center">
                                <span className="text-[10px] text-zinc-500 font-medium">SIFRA Virtual Keep v2.5</span>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* ========================================================================= */}
            {/* FULL NOTE EDITOR MODAL / BOTTOM SHEET */}
            {/* ========================================================================= */}
            <AnimatePresence>
                {(editingNote || isCreatingNew) && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4">
                        <motion.div
                            initial={{ opacity: 0, y: '100%' }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                            className={`w-full max-w-lg ${getColorTheme(formColor).bgClass} border ${getColorTheme(formColor).borderClass} rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto premium-scroll flex flex-col justify-between`}
                        >
                            <div>
                                {/* Top Modal Actions */}
                                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                                    <button
                                        type="button"
                                        onClick={saveCurrentNote}
                                        className="p-1.5 -ml-1 text-zinc-300 hover:text-white rounded-full hover:bg-white/10"
                                        aria-label="Back"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>

                                    <div className="flex items-center gap-2">
                                        {/* Pin Toggle */}
                                        <button
                                            type="button"
                                            onClick={() => setFormPinned(!formPinned)}
                                            className={`p-2 rounded-full transition-colors ${formPinned ? 'text-amber-400 bg-amber-400/20' : 'text-zinc-400 hover:text-white'}`}
                                            title={formPinned ? 'Unpin' : 'Pin note'}
                                        >
                                            <Pin className="w-4 h-4" />
                                        </button>

                                        {/* Reminder */}
                                        <button
                                            type="button"
                                            onClick={() => setFormReminder(formReminder ? undefined : 'Tomorrow, 8:00 AM')}
                                            className={`p-2 rounded-full transition-colors ${formReminder ? 'text-amber-400 bg-amber-400/20' : 'text-zinc-400 hover:text-white'}`}
                                            title="Add reminder"
                                        >
                                            <Bell className="w-4 h-4" />
                                        </button>

                                        {/* Archive button */}
                                        {editingNote && (
                                            <button
                                                type="button"
                                                onClick={() => toggleArchive(editingNote.id)}
                                                className="p-2 text-zinc-400 hover:text-white rounded-full"
                                                title="Archive note"
                                            >
                                                <Archive className="w-4 h-4" />
                                            </button>
                                        )}

                                        {/* Delete button */}
                                        {editingNote && (
                                            <button
                                                type="button"
                                                onClick={() => moveToTrash(editingNote.id)}
                                                className="p-2 text-zinc-400 hover:text-rose-400 rounded-full"
                                                title="Delete note"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Image Preview if attached */}
                                {formImages.length > 0 && (
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        {formImages.map((img, idx) => (
                                            <div key={idx} className="relative rounded-xl overflow-hidden group">
                                                <img src={img} alt="Note media" className="w-full h-32 object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => setFormImages(prev => prev.filter((_, i) => i !== idx))}
                                                    className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Reminder badge if active */}
                                {formReminder && (
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-3 border border-amber-500/30">
                                        <Clock className="w-3 h-3" />
                                        <span>{formReminder}</span>
                                        <button onClick={() => setFormReminder(undefined)} className="ml-1 text-amber-400 hover:text-white">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}

                                {/* Title Input */}
                                <input
                                    type="text"
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    placeholder="Title"
                                    className="w-full bg-transparent border-none outline-none font-bold text-lg sm:text-xl text-white placeholder-zinc-500 mb-2"
                                />

                                {/* Note Body or Checklist */}
                                {!formIsChecklist ? (
                                    <textarea
                                        value={formContent}
                                        onChange={(e) => setFormContent(e.target.value)}
                                        placeholder="Note..."
                                        rows={8}
                                        className="w-full bg-transparent border-none outline-none text-sm text-zinc-200 placeholder-zinc-500 resize-none leading-relaxed"
                                    />
                                ) : (
                                    <div className="space-y-2 mb-4">
                                        {formChecklist.map((item, idx) => (
                                            <div key={item.id} className="flex items-center gap-2.5">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setFormChecklist(prev => prev.map((c, i) => i === idx ? { ...c, done: !c.done } : c));
                                                    }}
                                                    className="text-zinc-400 hover:text-white"
                                                >
                                                    {item.done ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4" />}
                                                </button>
                                                <input
                                                    type="text"
                                                    value={item.text}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setFormChecklist(prev => prev.map((c, i) => i === idx ? { ...c, text: val } : c));
                                                    }}
                                                    className={`w-full bg-transparent border-none outline-none text-sm ${item.done ? 'line-through text-zinc-500' : 'text-zinc-200'}`}
                                                    placeholder="List item..."
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setFormChecklist(prev => prev.filter((_, i) => i !== idx))}
                                                    className="text-zinc-500 hover:text-rose-400"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}

                                        {/* Add Checklist Item Row */}
                                        <div className="flex items-center gap-2 pt-1">
                                            <Plus className="w-4 h-4 text-zinc-400" />
                                            <input
                                                type="text"
                                                value={newChecklistText}
                                                onChange={(e) => setNewChecklistText(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && newChecklistText.trim()) {
                                                        e.preventDefault();
                                                        setFormChecklist(prev => [...prev, { id: `item-${Date.now()}`, text: newChecklistText.trim(), done: false }]);
                                                        setNewChecklistText('');
                                                    }
                                                }}
                                                placeholder="List item (press Enter to add)"
                                                className="w-full bg-transparent border-none outline-none text-sm text-zinc-200 placeholder-zinc-500"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Labels Pill Row */}
                                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/10">
                                    {allLabels.map(label => {
                                        const isSelected = formLabels.includes(label);
                                        return (
                                            <button
                                                key={label}
                                                type="button"
                                                onClick={() => {
                                                    setFormLabels(prev => isSelected ? prev.filter(l => l !== label) : [...prev, label]);
                                                }}
                                                className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                                                    isSelected ? 'bg-pink-500/20 text-pink-300 border-pink-500/40' : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
                                                }`}
                                            >
                                                #{label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Bottom Toolbar inside Modal (Color Palette, Checklist Toggle, Image add, Close) */}
                            <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-4">
                                <div className="flex items-center gap-2">
                                    {/* Color palette selector */}
                                    <div className="flex items-center gap-1.5 overflow-x-auto max-w-[200px] scrollbar-hide py-1">
                                        {COLOR_PALETTE.map(c => (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() => setFormColor(c.id)}
                                                className={`w-6 h-6 rounded-full shrink-0 border-2 transition-transform ${
                                                    formColor === c.id ? 'scale-110 border-white shadow-md' : 'border-white/20 hover:scale-105'
                                                }`}
                                                style={{ backgroundColor: c.hex }}
                                                title={c.name}
                                            />
                                        ))}
                                    </div>

                                    {/* Checklist Toggle */}
                                    <button
                                        type="button"
                                        onClick={() => setFormIsChecklist(!formIsChecklist)}
                                        className={`p-2 rounded-full transition-colors ${formIsChecklist ? 'text-amber-400 bg-white/10' : 'text-zinc-400 hover:text-white'}`}
                                        title={formIsChecklist ? 'Switch to text' : 'Add checkboxes'}
                                    >
                                        <CheckSquare className="w-4 h-4" />
                                    </button>

                                    {/* Attach Image */}
                                    <button
                                        type="button"
                                        onClick={() => imageInputRef.current?.click()}
                                        className="p-2 text-zinc-400 hover:text-white rounded-full transition-colors"
                                        title="Attach image"
                                    >
                                        <ImageIcon className="w-4 h-4" />
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={saveCurrentNote}
                                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider active:scale-95 transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );

    // Sub-component: Render individual note card in Grid/List
    function renderNoteCard(note: KeepNote) {
        const theme = getColorTheme(note.color);

        return (
            <motion.div
                key={note.id}
                layout
                onClick={() => {
                    if (currentFolder === 'trash') {
                        // In trash, prompt restore or delete
                        return;
                    }
                    openNoteEditor(note);
                }}
                className={`rounded-2xl p-4 transition-all duration-200 border ${theme.bgClass} ${theme.borderClass} shadow-md hover:shadow-xl cursor-pointer group relative flex flex-col justify-between`}
            >
                <div>
                    {/* Image if attached */}
                    {note.images && note.images.length > 0 && (
                        <div className="rounded-xl overflow-hidden mb-3 -mx-1 -mt-1 max-h-40">
                            <img src={note.images[0]} alt={note.title} className="w-full h-full object-cover" />
                        </div>
                    )}

                    {/* Header Row: Title & Pin */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                        {note.title && (
                            <h3 className="font-bold text-sm sm:text-base text-zinc-100 tracking-tight leading-snug line-clamp-2">
                                {note.title}
                            </h3>
                        )}
                        {currentFolder === 'notes' && (
                            <button
                                onClick={(e) => togglePin(note.id, e)}
                                className={`p-1 text-zinc-400 hover:text-white shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${note.pinned ? '!opacity-100 text-amber-400' : ''}`}
                                title={note.pinned ? 'Unpin' : 'Pin note'}
                            >
                                <Pin className={`w-3.5 h-3.5 ${note.pinned ? 'fill-amber-400' : ''}`} />
                            </button>
                        )}
                    </div>

                    {/* Note Content / Checklist Preview */}
                    {!note.isChecklist ? (
                        note.content && (
                            <p className="text-xs sm:text-[13px] text-zinc-300/90 leading-relaxed line-clamp-6 whitespace-pre-wrap">
                                {note.content}
                            </p>
                        )
                    ) : (
                        <div className="space-y-1.5 my-1">
                            {note.checklist.slice(0, 5).map(item => (
                                <div 
                                    key={item.id} 
                                    onClick={(e) => toggleChecklistItem(note.id, item.id, e)}
                                    className="flex items-center gap-2 text-xs"
                                >
                                    {item.done ? (
                                        <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    ) : (
                                        <Square className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                    )}
                                    <span className={`truncate ${item.done ? 'line-through text-zinc-500' : 'text-zinc-300'}`}>
                                        {item.text}
                                    </span>
                                </div>
                            ))}
                            {note.checklist.length > 5 && (
                                <span className="text-[10px] text-zinc-500 font-bold block pt-0.5">
                                    +{note.checklist.length - 5} more items
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Metadata & Badges */}
                <div className="mt-3 pt-2 border-t border-white/5 space-y-2">
                    {/* Reminder & Labels */}
                    <div className="flex flex-wrap items-center gap-1.5">
                        {note.reminder && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                                <Clock className="w-2.5 h-2.5" />
                                <span className="truncate max-w-[90px]">{note.reminder}</span>
                            </span>
                        )}
                        {note.labels && note.labels.map(l => (
                            <span key={l} className="px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 text-[9px] font-medium">
                                #{l}
                            </span>
                        ))}
                    </div>

                    {/* Hover Action Toolbar */}
                    <div className="flex items-center justify-between text-zinc-400 pt-1">
                        <span className="text-[9px] text-zinc-500">
                            {new Date(note.updatedAt || note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>

                        <div className="flex items-center gap-1">
                            {currentFolder === 'trash' ? (
                                <>
                                    <button
                                        onClick={(e) => restoreFromTrash(note.id, e)}
                                        className="p-1 hover:text-emerald-400"
                                        title="Restore"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => deleteForever(note.id, e)}
                                        className="p-1 hover:text-rose-400"
                                        title="Delete forever"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={(e) => toggleArchive(note.id, e)}
                                        className="p-1 hover:text-white"
                                        title={note.archived ? 'Unarchive' : 'Archive'}
                                    >
                                        <Archive className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => moveToTrash(note.id, e)}
                                        className="p-1 hover:text-rose-400"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }
};

export default MonerDanaView;