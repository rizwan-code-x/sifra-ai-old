
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DiaryEntry, UserProfile, DIARY_CATEGORIES } from '../types';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import TrashIcon from '../components/icons/TrashIcon';
import { useLocalStorage } from '../hooks/useLocalStorage';
import PaperClipIcon from '../components/icons/PaperClipIcon';
import MicrophoneIcon from '../components/icons/MicrophoneIcon';
import XMarkIcon from '../components/icons/XMarkIcon';

// Fix: Add SpeechRecognition types to the global scope to solve TypeScript errors.
declare global {
    interface SpeechRecognitionEvent extends Event {
        readonly resultIndex: number;
        readonly results: SpeechRecognitionResultList;
    }

    interface SpeechRecognitionResultList {
        readonly length: number;
        item(index: number): SpeechRecognitionResult;
        [index: number]: SpeechRecognitionResult;
    }

    interface SpeechRecognitionResult {
        readonly isFinal: boolean;
        readonly length: number;
        item(index: number): SpeechRecognitionAlternative;
        [index: number]: SpeechRecognitionAlternative;
    }

    interface SpeechRecognitionAlternative {
        readonly transcript: string;
        readonly confidence: number;
    }

    interface SpeechRecognitionErrorEvent extends Event {
        readonly error: string;
        readonly message: string;
    }

    interface SpeechRecognition extends EventTarget {
        continuous: boolean;
        grammars: any;
        interimResults: boolean;
        lang: string;
        maxAlternatives: number;
        onend: ((this: SpeechRecognition, ev: Event) => any) | null;
        onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
        onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
        onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
        start(): void;
        stop(): void;
    }

    var SpeechRecognition: {
        prototype: SpeechRecognition;
        new (): SpeechRecognition;
    };

    var webkitSpeechRecognition: {
        prototype: SpeechRecognition;
        new (): SpeechRecognition;
    };

    interface Window {
        SpeechRecognition: typeof SpeechRecognition;
        webkitSpeechRecognition: typeof webkitSpeechRecognition;
    }
}


interface DiaryEditorViewProps {
    userProfile: UserProfile;
    onClose: () => void;
    entryId: string | null;
}

const DiaryEditorView: React.FC<DiaryEditorViewProps> = ({ userProfile, onClose, entryId }) => {
    const diaryKey = `sifra_diary_entries_${userProfile.userId}`;
    const [entries, setEntries] = useLocalStorage<DiaryEntry[]>(diaryKey, []);
    
    const [id, setId] = useState<string>(entryId || `DIARY-${Date.now()}`);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [categoryId, setCategoryId] = useState<string>(DIARY_CATEGORIES[0].id);
    const [attachments, setAttachments] = useState<DiaryEntry['attachments']>([]);
    const [isNew, setIsNew] = useState(!entryId);

    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const contentRef = useRef(content); // Ref to hold the latest content for speech recognition

    useEffect(() => {
        contentRef.current = content;
    }, [content]);

    // Debounce timer for auto-saving
    // Fix: Use ReturnType<typeof setTimeout> instead of NodeJS.Timeout for browser compatibility.
    const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const autoSave = useCallback(() => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        debounceTimeoutRef.current = setTimeout(() => {
            if (!title.trim() && !content.trim()) return;
             setEntries(prev => {
                const newEntry = {
                    id,
                    date: prev.find(e => e.id === id)?.date || new Date().toISOString(),
                    title: title.trim() || 'Untitled Entry',
                    content: content.trim(),
                    categoryId,
                    attachments,
                };
                const existingIndex = prev.findIndex(e => e.id === id);
                if (existingIndex > -1) {
                    const updated = [...prev];
                    updated[existingIndex] = newEntry;
                    return updated;
                } else {
                    return [...prev, newEntry];
                }
            });
            if (isNew) setIsNew(false); // It's no longer new after the first save
        }, 1500);
    }, [id, title, content, categoryId, attachments, isNew, setEntries]);


    useEffect(() => {
        autoSave();
        return () => {
            if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
        }
    }, [title, content, categoryId, attachments, autoSave]);


    useEffect(() => {
        if (entryId) {
            const existingEntry = entries.find(e => e.id === entryId);
            if (existingEntry) {
                setTitle(existingEntry.title);
                setContent(existingEntry.content);
                setCategoryId(existingEntry.categoryId || DIARY_CATEGORIES[0].id);
                setAttachments(existingEntry.attachments || []);
            }
        }
    }, [entryId, entries]);

    useEffect(() => {
        // Ensure speech recognition is stopped when component unmounts
        return () => {
            recognitionRef.current?.stop();
        };
    }, []);

    const handleDelete = () => {
        if (entryId && window.confirm("Are you sure you want to delete this diary entry? This action cannot be undone.")) {
            setEntries(prev => prev.filter(entry => entry.id !== entryId));
            onClose();
        }
    };
    
    const handleShare = () => {
        if(navigator.share) {
            navigator.share({
                title: title,
                text: content,
            }).catch(() => {});
        } else {
            alert('Share feature is not supported on your browser.');
        }
    };

    const handleExport = () => {
        const textContent = `Title: ${title}\nDate: ${new Date().toLocaleString()}\n\n${content}`;
        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/ /g, '_')}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64 = e.target?.result as string;
                setAttachments(prev => [...(prev || []), { type: 'image', data: base64 }]);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev?.filter((_, i) => i !== index));
    };

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Speech recognition is not supported in your browser.');
            return;
        }
        
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US'; // Or 'bn-BD' for Bengali

        recognitionRef.current.onstart = () => setIsListening(true);
        recognitionRef.current.onend = () => setIsListening(false);
        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
            if (event.error === 'not-allowed') {
                alert('Microphone access was denied. Please allow microphone access in your browser settings to use this feature.');
            } else if (event.error !== 'aborted') {
                console.error('Speech recognition error:', event.error, event.message);
                alert(`A speech recognition error occurred: ${event.message || event.error}`);
            }
        };
        
        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript) {
                 setContent(prev => (prev ? prev + ' ' : '') + finalTranscript);
            }
        };

        recognitionRef.current.start();
    };

    return (
        <div className="h-full flex flex-col animate-fade-in-up">
            <header className="p-4 shadow-md bg-white/30 backdrop-blur-sm flex items-center justify-between z-10 sticky top-0">
                <div className="flex items-center">
                    <button onClick={onClose} className="p-2 -m-2 rounded-full hover:bg-black/5 transition-colors mr-4">
                        <ArrowLeftIcon />
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">{isNew ? 'New Entry' : 'Edit Entry'}</h1>
                </div>
                <div className="flex items-center gap-2">
                    {!isNew && (
                        <button onClick={handleDelete} title="Delete Entry" className="p-2 -m-2 text-red-500 hover:text-red-700">
                            <TrashIcon />
                        </button>
                    )}
                     <button onClick={handleShare} className="text-xs font-semibold text-blue-600 hover:underline">Share</button>
                     <button onClick={handleExport} className="text-xs font-semibold text-green-600 hover:underline">Export TXT</button>
                    <button onClick={onClose} className="px-4 py-2 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition-colors">
                        Done
                    </button>
                </div>
            </header>

            <main className="flex-1 flex flex-col p-4 md:p-6">
                <input
                    type="text"
                    placeholder="Entry Title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full p-3 text-2xl font-bold bg-transparent focus:outline-none border-b-2 border-gray-200 focus:border-pink-300"
                />
                 <div className="flex items-center gap-4 mt-2">
                    <label htmlFor="category-select" className="text-sm font-medium text-gray-600">Category:</label>
                    <select id="category-select" value={categoryId} onChange={e => setCategoryId(e.target.value)} className="p-1 border-gray-300 rounded-md bg-white/50 text-black">
                        {DIARY_CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                 </div>
                <textarea
                    placeholder="Write your thoughts..."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className="flex-1 w-full p-3 mt-4 bg-transparent text-lg resize-none focus:outline-none"
                />
                
                {attachments && attachments.length > 0 && (
                    <div className="mt-4 p-2 border-t">
                        <h4 className="text-sm font-semibold mb-2">Attachments:</h4>
                        <div className="flex flex-wrap gap-2">
                            {attachments.map((att, index) => (
                                <div key={index} className="relative">
                                    <img src={att.data} alt="attachment" className="w-20 h-20 object-cover rounded-md" />
                                    <button onClick={() => removeAttachment(index)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><XMarkIcon /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="p-2 border-t flex items-center gap-2">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} title="Attach Image" className="p-2 rounded-full hover:bg-gray-200"><PaperClipIcon /></button>
                    <button onClick={toggleListening} title="Voice to Text" className={`p-2 rounded-full hover:bg-gray-200 ${isListening ? 'bg-red-200 text-red-600' : ''}`}><MicrophoneIcon /></button>
                </div>
            </main>
        </div>
    );
};

export default DiaryEditorView;
