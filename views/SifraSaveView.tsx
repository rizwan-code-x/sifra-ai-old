
import React, { useState, useMemo } from 'react';
import { MemoryLog, UserProfile } from '../types';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import { useLocalStorage } from '../hooks/useLocalStorage';
import TrashIcon from '../components/icons/TrashIcon';
import XMarkIcon from '../components/icons/XMarkIcon';

interface SifraSaveViewProps {
    userProfile: UserProfile;
    onClose: () => void;
}

const SifraSaveView: React.FC<SifraSaveViewProps> = ({ userProfile, onClose }) => {
    const memoryLogKey = `sifra_memory_log_${userProfile.userId}`;
    const [memoryLogs, setMemoryLogs] = useLocalStorage<MemoryLog[]>(memoryLogKey, []);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingLog, setEditingLog] = useState<MemoryLog | null>(null);
    const [editText, setEditText] = useState('');

    const filteredLogs = useMemo(() => {
        return memoryLogs
            .filter(log => log.content.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [memoryLogs, searchTerm]);

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this memory?')) {
            setMemoryLogs(logs => logs.filter(log => log.id !== id));
        }
    };

    const handleEdit = (log: MemoryLog) => {
        setEditingLog(log);
        setEditText(log.content);
    };

    const handleSaveEdit = () => {
        if (!editingLog) return;
        setMemoryLogs(logs => logs.map(log => log.id === editingLog.id ? { ...log, content: editText } : log));
        setEditingLog(null);
        setEditText('');
    };
    
    const handleShare = (content: string) => {
        if (navigator.share) {
            navigator.share({
                title: 'Sifra Memory',
                text: content,
            }).catch(() => {});
        } else {
            alert('Share feature is not supported on this browser.');
        }
    };

    return (
        <div className="h-full flex flex-col animate-fade-in-up">
            <header className="p-4 shadow-md bg-white/30 backdrop-blur-sm flex items-center z-10 sticky top-0">
                <button onClick={onClose} className="p-2 -m-2 rounded-full hover:bg-black/5 transition-colors mr-4">
                    <ArrowLeftIcon />
                </button>
                <h1 className="text-xl font-bold text-gray-800">Sifra Save - Memory Log</h1>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                <input
                    type="text"
                    placeholder="Search memories by keyword..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                />

                {filteredLogs.length > 0 ? (
                    <div className="space-y-3">
                        {filteredLogs.map(log => (
                            <div key={log.id} className="bg-white/70 p-4 rounded-lg shadow-sm">
                                <p className="text-sm text-gray-600 whitespace-pre-wrap">{log.content}</p>
                                <div className="mt-2 pt-2 border-t border-gray-200/80 flex justify-between items-center">
                                    <p className="text-xs text-gray-500">
                                        {new Date(log.date).toLocaleString()}
                                    </p>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(log)} className="text-xs font-semibold text-blue-600 hover:underline">Edit</button>
                                        <button onClick={() => handleShare(log.content)} className="text-xs font-semibold text-green-600 hover:underline">Share</button>
                                        <button onClick={() => handleDelete(log.id)} className="text-red-500 hover:text-red-700">
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-10">
                        <p className="text-4xl mb-2">💾</p>
                        <p className="font-semibold">No memories saved yet!</p>
                        <p>Ask Sifra to remember something for you, and it will appear here.</p>
                    </div>
                )}
            </main>
            
            {editingLog && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">Edit Memory</h2>
                            <button onClick={() => setEditingLog(null)}><XMarkIcon /></button>
                        </div>
                        <textarea
                            value={editText}
                            onChange={e => setEditText(e.target.value)}
                            className="w-full h-32 p-2 border rounded"
                        />
                        <button onClick={handleSaveEdit} className="mt-4 w-full bg-pink-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-pink-600">
                            Save Changes
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SifraSaveView;
