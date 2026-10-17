import React, { useState, useEffect, useRef } from 'react';
import BellIcon from './icons/BellIcon';
import { UserProfile } from '../types';
import { Bell, Sparkles, CheckCircle2 } from 'lucide-react';

interface NotificationItemProps {
    userProfile?: UserProfile;
    onUpdateUserProfile?: (profile: UserProfile) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ userProfile, onUpdateUserProfile }) => {
    const [showModal, setShowModal] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowModal(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const handleToggleModal = () => {
        const newShowModal = !showModal;
        setShowModal(newShowModal);

        if (newShowModal && userProfile && userProfile.notifications && onUpdateUserProfile) {
            const hasUnread = userProfile.notifications.some(n => !n.read);
            if (hasUnread) {
                const updatedNotifications = userProfile.notifications.map(n => ({ ...n, read: true }));
                onUpdateUserProfile({ ...userProfile, notifications: updatedNotifications });
            }
        }
    };

    const unreadCount = userProfile?.notifications?.filter(n => !n.read).length || 0;
    const hasPersonalNotifications = userProfile?.notifications && userProfile.notifications.length > 0;

    return (
        <div className="relative" ref={wrapperRef}>
            <button 
                onClick={handleToggleModal}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-all active:scale-95 relative"
                aria-label="Toggle notifications"
            >
                <div className="text-yellow-400">
                    <Bell className="w-4.5 h-4.5" />
                </div>
                {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white border border-white">
                        {unreadCount}
                    </div>
                )}
            </button>
            
            {showModal && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-[#0d0f18]/95 backdrop-blur-2xl rounded-2xl shadow-2xl p-4 z-50 border border-white/10 max-h-80 overflow-y-auto premium-scroll text-white">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                        <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4 text-yellow-400" />
                            <h3 className="text-xs font-black uppercase tracking-wider text-white">
                                নোটিফিকেশন (Notifications)
                            </h3>
                        </div>
                        <span className="text-[8px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                            Inbox
                        </span>
                    </div>
                    
                    <div className="space-y-2.5">
                        {hasPersonalNotifications && userProfile.notifications!.map(notif => (
                            <div key={notif.id} className={`p-3 rounded-xl border ${notif.read ? 'bg-white/5 border-white/5' : 'bg-indigo-500/10 border-indigo-500/30'}`}>
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="text-[11px] font-bold text-white">{notif.title}</h4>
                                </div>
                                <p className="text-[10px] text-white/60 leading-relaxed">{notif.message}</p>
                            </div>
                        ))}
                        
                        <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                <h4 className="text-[11px] font-bold text-amber-300">স্বাগতম (Welcome to Sifra)</h4>
                            </div>
                            <p className="text-[10px] text-white/60 leading-relaxed">
                                Sifra ভার্চুয়াল সিস্টেমে আপনাকে স্বাগতম। আপনার সকল নোটিফিকেশন ও আপডেট এখানে দেখা যাবে।
                            </p>
                        </div>
                        
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                            <div className="flex items-center gap-2 mb-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <h4 className="text-[11px] font-bold text-emerald-300">সিস্টেম আপডেট</h4>
                            </div>
                            <p className="text-[10px] text-emerald-200/70 leading-relaxed">
                                প্রোফাইল ছবি আপলোড এবং সকল অফিসিয়াল ওয়েবসাইট লিঙ্ক পেজ সফলভাবে যুক্ত করা হয়েছে।
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationItem;
