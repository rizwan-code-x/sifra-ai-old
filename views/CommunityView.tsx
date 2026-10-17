import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, CommunityPost, CommunityComment } from '../types';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import HeartSparkleIcon from '../components/icons/HeartSparkleIcon';
import ChatBubbleLeftRightIcon from '../components/icons/ChatBubbleLeftRightIcon';
import ShareIcon from '../components/icons/ShareIcon';
import SendIcon from '../components/icons/SendIcon';
import Avatar from '../components/Avatar';

interface CommunityViewProps {
    userProfile: UserProfile;
    onClose: () => void;
    posts: CommunityPost[];
    onUpdatePosts: (posts: CommunityPost[]) => void;
}

const CommunityView: React.FC<CommunityViewProps> = ({ userProfile, onClose, posts, onUpdatePosts }) => {
    const [newPostContent, setNewPostContent] = useState('');
    const [activeTab, setActiveTab] = useState<'requests' | 'feed'>('requests');

    const handlePostSubmit = () => {
        if (!newPostContent.trim()) return;
        
        const newPost: CommunityPost = {
            id: Date.now().toString(),
            userId: userProfile.userId,
            userName: userProfile.nickname || userProfile.name || 'User',
            userAvatar: userProfile.avatar || undefined,
            content: newPostContent,
            timestamp: Date.now(),
            likes: 0,
            comments: [],
            type: activeTab === 'requests' ? 'request' : 'feedback'
        };

        onUpdatePosts([newPost, ...posts]);
        setNewPostContent('');
    };

    const handleLike = (postId: string) => {
        onUpdatePosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
    };

    const handleShare = async (post: CommunityPost) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Sifra Community Post',
                    text: post.content,
                    url: window.location.href
                });
            } catch (err) {
                // Ignore share cancellation
            }
        } else {
            // Fallback
            alert('Sharing not supported on this device/browser');
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col font-sans overflow-hidden">
            {/* Header */}
            <header className="relative z-10 px-4 py-4 flex items-center justify-between bg-black/50 backdrop-blur-xl border-b border-white/10">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                        <ArrowLeftIcon className="w-5 h-5 text-white" />
                    </button>
                    <div>
                        <h1 className="text-lg font-black text-white tracking-tighter uppercase italic">Sifra Social</h1>
                        <p className="text-[8px] font-black text-pink-500 uppercase tracking-[0.3em]">Community Hub</p>
                    </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 animate-pulse" />
            </header>

            {/* Tabs */}
            <div className="flex p-2 gap-2 bg-black/20 backdrop-blur-md sticky top-0 z-10">
                <button 
                    onClick={() => setActiveTab('requests')}
                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'requests' ? 'bg-pink-500 text-white shadow-lg scale-[1.02]' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}
                >
                    Requests
                </button>
                <button 
                    onClick={() => setActiveTab('feed')}
                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'feed' ? 'bg-white text-black shadow-lg scale-[1.02]' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}
                >
                    Feedback
                </button>
            </div>

            {/* Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 premium-scroll">
                {/* Create Post */}
                <div className="bg-zinc-900/80 border border-white/10 rounded-3xl p-4 backdrop-blur-md">
                    <div className="flex gap-3">
                        <Avatar src={userProfile.avatar} initials={userProfile.name} size="sm" />
                        <textarea 
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            placeholder={activeTab === 'requests' ? "What feature do you need?" : "Share your thoughts..."}
                            className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-zinc-600 resize-none h-20"
                        />
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                        <div className="flex gap-2">
                            {/* Attachments placeholder */}
                        </div>
                        <button 
                            onClick={handlePostSubmit}
                            disabled={!newPostContent.trim()}
                            className="px-4 py-2 rounded-full bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                        >
                            Post <SendIcon className="w-3 h-3" />
                        </button>
                    </div>
                </div>

                {/* Posts List */}
                <AnimatePresence>
                    {posts.filter(p => activeTab === 'feed' ? p.type === 'feedback' : p.type === 'request').map((post) => (
                        <motion.div 
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-zinc-900/50 border border-white/5 rounded-3xl p-5 backdrop-blur-sm"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <Avatar src={post.userAvatar} initials={post.userName} size="sm" />
                                    <div>
                                        <h3 className="text-sm font-bold text-white">{post.userName}</h3>
                                        <p className="text-[10px] text-zinc-500">{new Date(post.timestamp).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                {post.type === 'request' && (
                                    <span className="px-2 py-1 rounded-lg bg-pink-500/10 text-pink-500 text-[8px] font-black uppercase tracking-wider border border-pink-500/20">
                                        Request
                                    </span>
                                )}
                            </div>
                            
                            <p className="text-sm text-zinc-300 leading-relaxed mb-4">
                                {post.content}
                            </p>

                            <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                                <button 
                                    onClick={() => handleLike(post.id)}
                                    className="flex items-center gap-2 text-zinc-500 hover:text-pink-500 transition-colors group"
                                >
                                    <HeartSparkleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    <span className="text-xs font-bold">{post.likes}</span>
                                </button>
                                <button className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
                                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                                    <span className="text-xs font-bold">{post.comments.length}</span>
                                </button>
                                <button 
                                    onClick={() => handleShare(post)}
                                    className="flex items-center gap-2 text-zinc-500 hover:text-blue-500 transition-colors ml-auto"
                                >
                                    <ShareIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CommunityView;
