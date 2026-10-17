
import { GoogleGenAI, Type } from "@google/genai";
import { CalendarNote } from "../types";

const getAi = () => {
    let apiKey = process.env.API_KEY;
    try {
        const adminSettingsStr = localStorage.getItem('sifra_admin_settings');
        if (adminSettingsStr) {
            const adminSettings = JSON.parse(adminSettingsStr);
            const activeKey = adminSettings.apiKeys?.find((k: any) => k.isActive)?.key;
            if (activeKey) {
                apiKey = activeKey;
            }
        }
    } catch (e) {}
    
    if (!apiKey) {
        return null;
    }
    return new GoogleGenAI({ apiKey });
};

export const parseNaturalLanguageEvent = async (text: string, referenceDate?: string): Promise<Partial<CalendarNote> | null> => {
    const ai = getAi();
    if (!ai) return null;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: [{
                parts: [{
                    text: `Parse the following natural language text into a structured calendar event JSON. 
                    Text: "${text}"
                    Reference Date (for relative terms like "today", "tomorrow"): ${referenceDate || new Date().toISOString()}
                    Current System Time: ${new Date().toISOString()}
                    
                    Rules:
                    - isFlexible: true if it's a routine task (gym, reading, meditation), false if it's a specific meeting or interview.
                    - priorityScore: 1-10 (10 being most critical).
                    - energyLevel: 'low', 'medium', or 'high' based on the cognitive load of the task.
                    - isGhost: false by default unless specified as a private block.
                    `
                }]
            }],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        content: { type: Type.STRING },
                        date: { type: Type.STRING, description: "YYYY-MM-DD" },
                        time: { type: Type.STRING, description: "HH:mm" },
                        endTime: { type: Type.STRING, description: "HH:mm" },
                        isFlexible: { type: Type.BOOLEAN },
                        priorityScore: { type: Type.INTEGER },
                        energyLevel: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
                        location: { type: Type.STRING },
                        isGhost: { type: Type.BOOLEAN }
                    },
                    required: ["title", "date", "time", "isFlexible", "priorityScore", "energyLevel"]
                }
            }
        });

        return JSON.parse(response.text);
    } catch (error) {
        console.error("NLP Parsing Error:", error);
        return null;
    }
};

export const resolveConflicts = (events: CalendarNote[], newEvent: CalendarNote): { updatedEvents: CalendarNote[], notifications: string[] } => {
    const updatedEvents = [...events];
    const notifications: string[] = [];

    // Simple conflict detection logic
    const newStart = new Date(`${newEvent.date}T${newEvent.time}`).getTime();
    const newEnd = newEvent.endTime 
        ? new Date(`${newEvent.date}T${newEvent.endTime}`).getTime()
        : newStart + 30 * 60 * 1000; // Default 30 mins

    const conflicts = updatedEvents.filter(e => {
        if (e.id === newEvent.id) return false;
        const eStart = new Date(`${e.date}T${e.time}`).getTime();
        const eEnd = e.endTime 
            ? new Date(`${e.date}T${e.endTime}`).getTime()
            : eStart + 30 * 60 * 1000;
        
        return (newStart < eEnd && newEnd > eStart);
    });

    if (conflicts.length > 0) {
        conflicts.forEach(conflict => {
            if (conflict.isFlexible && newEvent.priorityScore > conflict.priorityScore) {
                // Reschedule conflict
                const originalTime = conflict.time;
                // Move to 1 hour later for simplicity in this demo logic
                const conflictDate = new Date(`${conflict.date}T${conflict.time}`);
                conflictDate.setHours(conflictDate.getHours() + 1);
                
                const newTime = conflictDate.toTimeString().slice(0, 5);
                conflict.time = newTime;
                
                notifications.push(`Rescheduled "${conflict.title}" from ${originalTime} to ${newTime} due to conflict with higher priority "${newEvent.title}".`);
            }
        });
    }

    return { updatedEvents, notifications };
};

export const getMorningBriefing = async (events: CalendarNote[]): Promise<string> => {
    const ai = getAi();
    if (!ai) return "No AI connection for briefing.";

    const today = new Date().toISOString().split('T')[0];
    const todayEvents = events.filter(e => e.date === today);

    if (todayEvents.length === 0) return "You have a clear schedule today. Enjoy your time!";

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: [{
                parts: [{
                    text: `Generate a concise, motivating "Morning Briefing" for the following calendar events today. 
                    Mention any flexible tasks that might be moved if needed.
                    Events: ${JSON.stringify(todayEvents)}`
                }]
            }]
        });
        return response.text;
    } catch (error) {
        return "Failed to generate briefing.";
    }
};

export const checkTraffic = async (location: string): Promise<{ status: 'light' | 'moderate' | 'heavy', delay: number }> => {
    // Simulate Google Maps Traffic API
    const statuses: ('light' | 'moderate' | 'heavy')[] = ['light', 'moderate', 'heavy'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const delay = status === 'heavy' ? 20 : (status === 'moderate' ? 10 : 0);
    return { status, delay };
};

export const retrieveRelevantDocs = (title: string): { name: string, url: string, type: string }[] => {
    // Simulate semantic search in local storage
    try {
        const filesStr = localStorage.getItem('sifra_files');
        if (!filesStr) return [];
        const files = JSON.parse(filesStr);
        
        // Simple keyword match for "semantic" simulation
        const keywords = title.toLowerCase().split(' ');
        return files
            .filter((f: any) => keywords.some(k => f.name.toLowerCase().includes(k)))
            .slice(0, 3)
            .map((f: any) => ({ name: f.name, url: f.url || '#', type: f.type || 'file' }));
    } catch (e) {
        return [];
    }
};
