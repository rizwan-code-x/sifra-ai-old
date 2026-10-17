import { Message, Role } from '../types';

export interface ContextSummaryData {
    summary: string;
    lastSummarizedMessageCount: number;
    lastSummarizedTimestamp: number;
    topics?: string[];
}

const STORAGE_PREFIX = 'sifra_chat_context_summary_';

/**
 * Returns the storage key for a user's context summary
 */
export const getContextSummaryStorageKey = (userId?: string): string => {
    return `${STORAGE_PREFIX}${userId || 'default'}`;
};

/**
 * Load the persistent context summary from localStorage
 */
export const loadStoredContextSummary = (userId?: string): ContextSummaryData | null => {
    try {
        const key = getContextSummaryStorageKey(userId);
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.summary === 'string' && parsed.summary.trim()) {
            return parsed;
        }
        return null;
    } catch (e) {
        console.warn('Failed to load context summary from localStorage:', e);
        return null;
    }
};

/**
 * Save the context summary to localStorage
 */
export const persistContextSummary = (data: ContextSummaryData, userId?: string): void => {
    try {
        const key = getContextSummaryStorageKey(userId);
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.warn('Failed to save context summary to localStorage:', e);
    }
};

/**
 * Clear the context summary from localStorage
 */
export const clearStoredContextSummary = (userId?: string): void => {
    try {
        const key = getContextSummaryStorageKey(userId);
        localStorage.removeItem(key);
    } catch (e) {}
};

/**
 * Determines whether a conversation should trigger an automatic periodic summary.
 * Default: triggers when messageCount >= 6, and at least 6 new messages have elapsed
 * since the previous summary.
 */
export const shouldAutoSummarize = (
    currentCount: number,
    lastSummarizedCount: number,
    intervalThreshold: number = 6
): boolean => {
    if (currentCount < intervalThreshold) return false;
    return (currentCount - lastSummarizedCount) >= intervalThreshold;
};

/**
 * Requests a new context summary from the backend endpoint `/api/chat/summarize`
 * and updates localStorage.
 */
export const summarizeChatConversation = async (
    messages: Message[],
    previousSummary?: string,
    userId?: string
): Promise<ContextSummaryData | null> => {
    if (!messages || messages.length === 0) return null;

    try {
        const payloadMessages = messages.map(m => ({
            role: m.role === Role.USER ? 'user' : 'model',
            content: m.parts.map(p => p.text || '').join(' ')
        }));

        const response = await fetch('/api/chat/summarize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: payloadMessages,
                previousSummary: previousSummary || ''
            })
        });

        const contentType = response.headers.get('content-type') || '';
        if (!response.ok || !contentType.includes('application/json')) {
            throw new Error(`Summary API responded with status ${response.status} (${contentType})`);
        }

        const data = await response.json();
        if (data && data.summary) {
            const result: ContextSummaryData = {
                summary: data.summary,
                lastSummarizedMessageCount: messages.length,
                lastSummarizedTimestamp: data.timestamp || Date.now(),
                topics: Array.isArray(data.topics) ? data.topics : []
            };

            // Save to localStorage
            persistContextSummary(result, userId);
            return result;
        }
        return null;
    } catch (error) {
        console.error('Error generating conversation summary:', error);
        return null;
    }
};
