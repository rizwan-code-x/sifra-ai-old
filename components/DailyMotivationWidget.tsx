import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Quote, RefreshCw, Copy, Check, Volume2, VolumeX } from 'lucide-react';

interface MotivationData {
  quote: string;
  author: string;
  category?: string;
  date?: string;
  fallback?: boolean;
}

const STORAGE_KEY = 'sifra_daily_motivation_cache';

export const DailyMotivationWidget: React.FC = () => {
  const [data, setData] = useState<MotivationData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const todayStr = new Date().toISOString().slice(0, 10);

  // Fetch motivation quote from Gemini endpoint
  const fetchMotivation = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const res = await fetch(`/api/daily-motivation${forceRefresh ? '?refresh=true' : ''}`);
      if (!res.ok) throw new Error('Network error');
      const json = await res.json();
      if (json && json.quote) {
        const item: MotivationData = {
          quote: json.quote,
          author: json.author || 'Unknown',
          category: json.category || 'Wisdom',
          date: json.date || todayStr,
        };
        setData(item);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(item));
        } catch (e) {}
      }
    } catch (err) {
      console.warn('Failed to fetch daily motivation:', err);
      // Fallback if network or server error
      if (!data) {
        const fallbackItem: MotivationData = {
          quote: "The future belongs to those who believe in the beauty of their dreams.",
          author: "Eleanor Roosevelt",
          category: "Vision",
          date: todayStr,
        };
        setData(fallbackItem);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [todayStr, data]);

  // Load from cache on mount if from today, otherwise fetch
  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as MotivationData;
        if (parsed && parsed.quote && parsed.date === todayStr) {
          setData(parsed);
          setIsLoading(false);
          return;
        }
      }
    } catch (e) {}

    fetchMotivation(false);
  }, [fetchMotivation, todayStr]);

  // Copy quote to clipboard
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!data) return;
    const textToCopy = `"${data.quote}" — ${data.author}`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Speak quote aloud using natural Web Speech synthesis
  const handleToggleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!data || !window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${data.quote}. By ${data.author}`);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices() || [];
    const engVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (engVoice) utterance.voice = engVoice;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="relative w-full rounded-2xl sm:rounded-3xl p-4 sm:p-5 overflow-hidden backdrop-blur-xl bg-white/30 dark:bg-slate-900/40 border border-white/40 dark:border-white/10 shadow-[0_8px_32px_0_rgba(212,175,55,0.06)] hover:shadow-[0_12px_40px_0_rgba(212,175,55,0.12)] transition-all duration-300 group"
    >
      {/* Subtle Glassmorphism Ambient Glow Backdrops */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-amber-400/20 via-orange-400/10 to-transparent blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
      <div className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-500/15 via-purple-500/10 to-transparent blur-2xl pointer-events-none" />

      {/* Background Decorative Quote Watermark */}
      <Quote className="absolute right-3 bottom-2 w-16 h-16 sm:w-20 sm:h-20 text-amber-500/5 dark:text-amber-400/[0.04] pointer-events-none -rotate-12 transition-transform duration-500 group-hover:scale-105" />

      <div className="relative z-10 flex flex-col gap-2.5">
        {/* Header Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-sm shadow-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[9px] font-black tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 dark:from-amber-400 dark:to-amber-200">
                Daily Motivation
              </span>
              <span className="hidden sm:inline-block text-[8px] font-bold text-gray-400 dark:text-gray-400 ml-1.5 opacity-70">
                • {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {data?.category && (
              <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-amber-500/10 dark:bg-amber-400/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                {data.category}
              </span>
            )}

            {/* Refresh Button */}
            <button
              onClick={() => fetchMotivation(true)}
              disabled={isRefreshing || isLoading}
              className="w-6 h-6 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-all active:scale-90 disabled:opacity-40"
              title="Get another quote"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-amber-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading-skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2 py-1"
            >
              <div className="h-4 bg-gray-200/60 dark:bg-white/10 rounded-md w-11/12 animate-pulse" />
              <div className="h-4 bg-gray-200/60 dark:bg-white/10 rounded-md w-3/4 animate-pulse" />
              <div className="h-3 bg-gray-200/40 dark:bg-white/5 rounded-md w-1/4 animate-pulse mt-1" />
            </motion.div>
          ) : data ? (
            <motion.div
              key={data.quote}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="space-y-1.5"
            >
              <p className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug tracking-normal italic drop-shadow-sm select-text">
                &ldquo;{data.quote}&rdquo;
              </p>
              
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-bold text-amber-700/80 dark:text-amber-400/90 tracking-wide select-text">
                  — {data.author}
                </span>

                {/* Micro Action Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleToggleSpeak}
                    className="p-1 rounded-md text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                    title={isSpeaking ? "Stop listening" : "Listen to quote"}
                  >
                    {isSpeaking ? (
                      <VolumeX className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={handleCopy}
                    className="p-1 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    title="Copy quote"
                  >
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default DailyMotivationWidget;
