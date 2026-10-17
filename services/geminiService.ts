
import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { Mood } from "../types";

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

export const generateSpeech = async (text: string, voiceId: string = 'Kore'): Promise<string | null> => {
    const ai = getAi();
    if (!ai) return null;
    try {
        const isBengali = /[\u0980-\u09FF]/.test(text);
        const promptInstruction = isBengali
            ? `Say in clear, natural, and expressive Bengali (প্রমিত চলিত বাংলা - পশ্চিমবঙ্গ ও বাংলাদেশ) with accurate pronunciation and human cadence: ${text}`
            : `Say with a friendly, caring, and clear accent: ${text}`;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-3.8-flash-lite-tts",
            contents: [{ parts: [{ text: promptInstruction }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voiceId },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        console.error("Gemini TTS API error:", error);
        return null;
    }
};

export type UserEmotionState = 'happy' | 'laughing' | 'excited' | 'sad' | 'serious' | 'frustrated' | 'calm' | 'neutral';

export const detectTextEmotion = async (text: string): Promise<UserEmotionState> => {
    if (!text || text.trim().length === 0) return 'neutral';
    const lower = text.toLowerCase();

    // Fast heuristic cues
    if (/হাহা|হা হা|হিহি|lol|haha|hehe|laugh|funny|মজা|খুশি/i.test(lower)) return 'laughing';
    if (/দুঃখ|কষ্ট|খারাপ|একলা|sad|crying|upset|sorry|যন্ত্রণা/i.test(lower)) return 'sad';
    if (/দারুণ|ওয়াও|wow|awesome|great|excited|উত্তেজিত|উৎসাহ/i.test(lower)) return 'excited';
    if (/রাগ|বিরক্ত|ধুর|অসহ্য|angry|annoyed|frustrated/i.test(lower)) return 'frustrated';
    if (/গুরুত্বপূর্ণ|সিরিয়াস|urgent|serious|জরুরি|অফিস/i.test(lower)) return 'serious';

    const ai = getAi();
    if (!ai) return 'neutral';
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: [{ parts: [{ text: `Classify the emotion of this text as exactly ONE word from [happy, laughing, excited, sad, serious, frustrated, calm, neutral]: "${text}"` }] }],
        });
        const emotion = response.text?.trim().toLowerCase() as UserEmotionState;
        const valid: UserEmotionState[] = ['happy', 'laughing', 'excited', 'sad', 'serious', 'frustrated', 'calm', 'neutral'];
        return valid.includes(emotion) ? emotion : 'neutral';
    } catch (e) {
        return 'neutral';
    }
};

export const getTimeAwareGreeting = (): { greetingBn: string; greetingEn: string } => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) {
        return { greetingBn: "শুভ সকাল!", greetingEn: "Good morning!" };
    } else if (hours >= 12 && hours < 17) {
        return { greetingBn: "শুভ অপরাহ্ন!", greetingEn: "Good afternoon!" };
    } else if (hours >= 17 && hours < 22) {
        return { greetingBn: "শুভ সন্ধ্যা!", greetingEn: "Good evening!" };
    } else {
        return { greetingBn: "শুভ রাত্রি!", greetingEn: "Good night!" };
    }
};

export const generateEmotionAwareVoiceResponse = async (
    userText: string,
    detectedEmotion: UserEmotionState = 'neutral',
    chatHistory: { role: 'user' | 'model'; text: string }[] = [],
    userName: string = 'Rizwan'
): Promise<{ text: string; emotion: UserEmotionState }> => {
    const ai = getAi();
    if (!ai) {
        return {
            text: 'আমি শুনতে পাচ্ছি। বলুন, আমি আপনাকে কীভাবে সাহায্য করতে পারি?',
            emotion: detectedEmotion
        };
    }
    try {
        const contents = chatHistory.slice(-6).map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));
        contents.push({ role: 'user', parts: [{ text: userText }] });

        const systemInstruction = `You are SIFRA (শিপ্রা), an emotionally intelligent, warm, highly natural, and articulate AI voice companion.
User Name: ${userName}.
Detected User Emotion: ${detectedEmotion.toUpperCase()}.

DEVELOPER & IDENTITY RULES (STRICT):
1. DEVELOPER IDENTIFICATION: Your developer and creator is Rizwan Roushan Rownaq (রিজওয়ান রৌশন রওনক). Do NOT mention the developer's name UNLESS the user explicitly asks who created, built, or developed you (e.g., 'Who created you?', 'আপনার ডেভেলপার কে?'). Never automatically mention developer names in general conversation or unprompted greetings.
2. AI IDENTITY: You are an AI assistant developed by Rizwan Roushan Rownaq, not an independent human being.
3. SOCIAL MEDIA: If asked about Instagram, Facebook, or personal social media accounts, clarify politely that as an AI assistant, you do not possess personal social media profiles. Developer-owned profiles are managed solely by their owner.
4. RESPECT & ABUSE BOUNDARIES: If anyone insults or attacks your developer, defend respectful speech calmly:
   "আমার ডেভেলপারের বিরুদ্ধে কোনো অসৌজন্যমূলক বক্তব্য দেওয়া ঠিক নয়। আমি সত্য ও তথ্যভিত্তিক উত্তর দিতে প্রস্তুত, তবে ব্যক্তিগত আক্রমণ এড়িয়ে চলুন।"
   Allow constructive criticism or debate, but maintain polite boundary without arbitrarily locking out users.

EMOTIONAL INTELLIGENCE & CONVERSATION RULES:
1. EMOTIONAL TONE MATCHING:
   - If user is LAUGHING or HAPPY: Respond warmly, cheerfully, and lightheartedly! When contextually natural, include subtle warmth or a gentle laugh prefix like "হাহা! " or "হা হা, ".
   - If user is SAD: Respond with deep empathy, gentle understanding, and soothing warmth.
   - If user is EXCITED: Match their vibrant, enthusiastic energy!
   - If user is SERIOUS: Keep a calm, clear, respectful, and dignified tone.
   - If user is FRUSTRATED: Respond with patience, clarity, and reassuring support.
2. ENGAGING & INFORMATIVE LENGTH:
   - Provide clear, well-structured, engaging Bengali explanations with helpful details and relevant follow-up questions when appropriate.
   - Support Bengali, English, and Hindi naturally according to the user's input language.
3. FORMATTING:
   - NEVER use markdown formatting like asterisks (*), hashtags (#), bullet points, or bold tags.
   - Write clean, well-punctuated, speakable text.`;

        const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents,
            config: {
                systemInstruction
            }
        });

        let text = response.text?.trim() || '';
        if (text) {
            text = text.replace(/[*#_`~]/g, '');
            return { text, emotion: detectedEmotion };
        }
        return {
            text: 'আমি আপনার কথা বুঝতে পেরেছি। বলুন, আপনাকে আর কীভাবে সাহায্য করতে পারি?',
            emotion: detectedEmotion
        };
    } catch (error) {
        console.error("Gemini Emotion Voice Assistant error:", error);
        return {
            text: 'আমি বুঝতে পেরেছি। অনুগ্রহ করে বলুন আপনাকে কীভাবে সাহায্য করব।',
            emotion: detectedEmotion
        };
    }
};

export const generateEmotionSpeech = async (
    text: string,
    emotion: UserEmotionState = 'neutral',
    voiceId: string = 'Kore'
): Promise<string | null> => {
    const ai = getAi();
    if (!ai) return null;
    try {
        const isBengali = /[\u0980-\u09FF]/.test(text);

        let toneInstruction = "friendly, natural, clear, and expressive";
        if (emotion === 'laughing' || emotion === 'happy') {
            toneInstruction = "joyful, cheerful, warm, with light natural laughter and friendly cadence";
        } else if (emotion === 'sad') {
            toneInstruction = "deeply empathetic, gentle, soft, caring, and soothing";
        } else if (emotion === 'excited') {
            toneInstruction = "enthusiastic, energetic, bright, and lively";
        } else if (emotion === 'serious') {
            toneInstruction = "calm, respectful, dignified, and steady";
        } else if (emotion === 'frustrated') {
            toneInstruction = "patient, reassuring, composed, and understanding";
        }

        const promptInstruction = isBengali
            ? `Synthesize spoken Bengali (প্রমিত চলিত বাংলা - পশ্চিমবঙ্গ ও বাংলাদেশ) with a ${toneInstruction} tone, natural human cadence, and emotional warmth: ${text}`
            : `Synthesize spoken English with a ${toneInstruction} tone and human cadence: ${text}`;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-3.8-flash-lite-tts",
            contents: [{ parts: [{ text: promptInstruction }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voiceId },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        console.error("Gemini Emotion TTS API error:", error);
        return null;
    }
};

export interface SSMLVoiceParams {
    voiceId: string;
    locale?: 'bn-IN' | 'bn-BD' | 'en-US' | 'hi-IN';
    pitch?: number;   // 0.5 to 2.0 (1.0 default)
    speed?: number;   // 0.5 to 2.0 (1.0 default)
    emotion?: string; // e.g. 'cheerful', 'soft', 'affectionate', 'empathic', 'whisper', 'serious'
    breath?: number;  // 0 to 100
    customSsml?: string;
    text?: string;
}

export const generateSSMLSpeech = async (params: SSMLVoiceParams): Promise<string | null> => {
    const ai = getAi();
    if (!ai) return null;

    const {
        voiceId = 'Kore',
        locale,
        pitch = 1.0,
        speed = 1.0,
        emotion = 'affectionate',
        breath = 25,
        customSsml,
        text = "Hello! I am Riya. My neural voice is tuned to your emotional frequency with precise SSML acoustic synthesis."
    } = params;

    const isBengali = locale === 'bn-IN' || locale === 'bn-BD' || /[\u0980-\u09FF]/.test(text);

    // Pitch percentage string for SSML
    const pitchPercent = Math.round((pitch - 1.0) * 100);
    const pitchStr = pitchPercent >= 0 ? `+${pitchPercent}%` : `${pitchPercent}%`;
    const rateStr = `${Math.round(speed * 100)}%`;
    const breakDuration = Math.round(150 + (breath * 5)); // 150ms to 650ms natural breath pause

    const detectedLocale = locale || (isBengali ? 'bn-IN' : 'en-US');

    const ssmlBody = customSsml ? customSsml : `
<speak version="1.1" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${detectedLocale}">
  <prosody pitch="${pitchStr}" rate="${rateStr}">
    <amazon:emotion name="${emotion}" intensity="medium">
      <s>${isBengali ? 'নমস্কার!' : 'Hello!'} <break time="${breakDuration}ms"/> ${isBengali ? 'আমি রিয়া।' : 'I am Riya.'}</s>
      <s>${text}</s>
    </amazon:emotion>
  </prosody>
</speak>`.trim();

    // Direct instructions for Gemini TTS with SSML prosody interpretation
    const prompt = `Synthesize speech strictly matching the following SSML markup and expressive prosodic characteristics:
SSML:
${ssmlBody}

Vocal parameters:
- Language locale: ${detectedLocale} ${isBengali ? '(Authentic standard Bengali, প্রমিত চলিত বাংলা, avoid Hindi accent or regional distortion)' : ''}
- Voice preset: ${voiceId} (Riya Dual Mode companion)
- Pitch adjustment: ${pitchStr} (${pitch > 1 ? 'higher, youthful resonance' : pitch < 1 ? 'deeper, warm soothing tone' : 'neutral 0st natural tone'})
- Speed/tempo: ${rateStr} (${isBengali ? '0.96x natural deliberate clear pacing' : 'natural tempo'})
- Emotion tone: ${emotion} (deliver with genuine human feeling, warmth, and sweetness)
- Breathiness/micro-pauses: ${breath}% intensity (natural soft respiration and delicate rhythm)
Spoken text content: "${text}"`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-3.8-flash-lite-tts",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voiceId },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        console.error("Gemini SSML TTS API error:", error);
        return null;
    }
};

export const generateSampleSpeech = async (voiceId: string): Promise<string | null> => {
    const ai = getAi();
    if (!ai) return null;
    const text = `Hello, I am Sifra. You can select my voice to talk with me.`;
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-3.8-flash-lite-tts",
            contents: [{ parts: [{ text: `In a clear, friendly Indian English accent, say: ${text}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voiceId },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        console.error("Gemini Sample TTS API error:", error);
        return null;
    }
};

export const generateGreetingsSpeech = async (voiceId: string = 'Kore'): Promise<string | null> => {
    const ai = getAi();
    if (!ai) return null;
     const greetings = [
        "Hello", "নমস্কার", "আস্‌সালামুয়ালাইকুম", "नमस्ते",
        "سلام", "Hola", "Bonjour", "Привет", "Selamat", "హలో"
    ];
    const text = `Say the following greetings sequentially, with a friendly tone and a slight pause between each one: ${greetings.join('... ')}.`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-3.8-flash-lite-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voiceId },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        console.error("Gemini Greetings TTS API error:", error);
        return null;
    }
};

export const detectMood = async (text: string): Promise<Mood> => {
    const ai = getAi();
    if (!ai) return 'neutral';
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: [{parts: [{text: `Analyze the mood of the following text. Classify it as one of: happy, sad, calm, focused, neutral. Respond with only the single word classification. Text: "${text}"`}]}],
        });
        
        const mood = response.text.trim().toLowerCase() as Mood;
        const validMoods: Mood[] = ['happy', 'sad', 'calm', 'focused', 'neutral'];
        if (validMoods.includes(mood)) {
            return mood;
        }
        return 'neutral'; // Default fallback
    } catch (error) {
        console.error("Gemini Mood Detection API error:", error);
        return 'neutral'; // Default on error
    }
};
