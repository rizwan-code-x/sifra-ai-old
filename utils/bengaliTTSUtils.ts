/**
 * Bengali & Multilingual Text Pre-processing & SSML Formatting
 * Ensures authentic, sweet, standard colloquial Bengali (প্রমিত চলিত বাংলা) without regional distortion.
 */

// Common English terms into natural Bengali phonetics
const PHONETIC_MAP: Record<string, string> = {
  'online': 'অনলাইন',
  'offline': 'অফলাইন',
  'internet': 'ইন্টারনেট',
  'message': 'মেসেজ',
  'call': 'কল',
  'voice': 'ভয়েস',
  'settings': 'সেটিংস',
  'mobile': 'মোবাইল',
  'phone': 'ফোন',
  'app': 'অ্যাপ',
  'sifra': 'সিফরা',
  'riya': 'রিয়া',
  'ai': 'এআই',
  'smart': 'স্মার্ট',
  'assistant': 'অ্যাসিস্ট্যান্ট',
  'welcome': 'ওয়েলকাম',
  'hello': 'হ্যালো',
  'hi': 'হাই',
  'system': 'সিস্টেম',
  'profile': 'প্রোফাইল',
  'audio': 'অডিও',
  'battery': 'ব্যাটারি',
  'wifi': 'ওয়াইফাই',
  'bluetooth': 'ব্লুটুথ',
};

/**
 * Pre-processes Bengali text:
 * 1. Phonetically replaces common English loanwords into Bengali script
 * 2. Normalizes punctuation (dāṛi, comma, exclamation) for natural breath pauses
 * 3. Removes robotic markdown bullets, hashtags, and code fences
 */
export function formatBengaliForSpeech(rawText: string): string {
  if (!rawText) return '';

  let processed = rawText
    // Remove markdown symbols that cause robotic reading
    .replace(/[*#_`~>\[\]\(\)\{\}]/g, ' ')
    // Normalize English loanwords to Bengali script when context is Bengali
    .replace(/\b([a-zA-Z]+)\b/g, (match, word) => {
      const lower = word.toLowerCase();
      return PHONETIC_MAP[lower] || match;
    })
    // Ensure space after punctuation for natural prosody pauses
    .replace(/([।,?!;:])([^\s])/g, '$1 $2')
    // Normalize multiple spaces
    .replace(/\s+/g, ' ')
    .trim();

  return processed;
}

/**
 * Generates standards-compliant SSML with proper prosody rate (0.95x - 1.0x),
 * natural pitch (0st), and strategic break tags (<break time="250ms"/>).
 */
export function buildBengaliSSML(
  text: string,
  options: {
    locale?: 'bn-IN' | 'bn-BD';
    voiceName?: string;
    rate?: string;       // e.g. "0.95x" or "95%"
    pitch?: string;      // e.g. "+0st" or "0%"
    pauseMs?: number;    // default 250ms
  } = {}
): string {
  const {
    locale = 'bn-IN',
    voiceName = 'bn-IN-Neural2-A',
    rate = '0.96',
    pitch = '+0st',
    pauseMs = 260
  } = options;

  const formatted = formatBengaliForSpeech(text);

  // Split into clauses to inject micro-breaks for breath cadence
  const clauses = formatted.split(/([।?!,]+)/);
  let ssmlBody = '';

  for (let i = 0; i < clauses.length; i += 2) {
    const chunk = (clauses[i] || '').trim();
    const punct = (clauses[i + 1] || '').trim();

    if (!chunk) continue;

    ssmlBody += `<s>${chunk}${punct ? punct : '।'}</s>`;
    if (punct.includes('।') || punct.includes('?') || punct.includes('!')) {
      ssmlBody += `<break time="${pauseMs}ms"/>`;
    } else if (punct.includes(',')) {
      ssmlBody += `<break time="${Math.round(pauseMs * 0.6)}ms"/>`;
    }
  }

  return `
<speak version="1.1" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${locale}">
  <voice name="${voiceName}">
    <prosody rate="${rate}" pitch="${pitch}">
      ${ssmlBody || `<s>${formatted}</s>`}
    </prosody>
  </voice>
</speak>`.trim();
}
