
import React, { useState, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, View } from '../types';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import MicrophoneIcon from '../components/icons/MicrophoneIcon';
import CameraIcon from '../components/icons/CameraIcon';
import SendIcon from '../components/icons/SendIcon';
import CalculatorIcon from '../components/icons/CalculatorIcon';
import GlobeAltIcon from '../components/icons/GlobeAltIcon';
import SparklesIcon from '../components/icons/SparklesIcon';
import ClockIcon from '../components/icons/ClockIcon';
import TrashIcon from '../components/icons/TrashIcon';
import SifraLogo from '../components/SifraLogo';
import { GoogleGenAI } from '@google/genai';

type CalcTab = 'calculator' | 'ai' | 'history';
type CalcMode = 'basic' | 'advanced' | 'easy';

const SifraCalculatorView: React.FC<{ userProfile: UserProfile; onClose: () => void }> = ({ userProfile, onClose }) => {
    const [activeTab, setActiveTab] = useState<CalcTab>('calculator');
    const [input, setInput] = useState('');
    const [result, setResult] = useState('');
    const [history, setHistory] = useState<{ expression: string; res: string; date: string }[]>([]);
    
    // AI State
    const [aiQuery, setAiQuery] = useState('');
    const [aiResponse, setAiResponse] = useState<{ result: string, explanation: string } | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);

    const handlePress = (val: string) => {
        if (val === 'AC') { setInput(''); setResult(''); return; }
        if (val === '⌫') { 
            if (result) { setResult(''); setInput(''); }
            else setInput(prev => prev.slice(0, -1)); 
            return; 
        }
        if (val === '=') {
            if (!input) return;
            try {
                const evalStr = input.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
                const res = new Function(`return ${evalStr}`)().toString();
                const formattedRes = String(Math.round(Number(res) * 100000000) / 100000000);
                setResult(formattedRes);
                setHistory([{ expression: input, res: formattedRes, date: new Date().toLocaleTimeString() }, ...history]);
            } catch (e) {
                setResult('Error');
            }
            return;
        }
        
        if (result) {
            if (['+', '−', '×', '÷', '%'].includes(val)) {
                setInput(result + val);
                setResult('');
            } else {
                setInput(val);
                setResult('');
            }
            return;
        }
        
        setInput(prev => prev + val);
    };

    const handleAiAsk = async () => {
        if (!aiQuery.trim()) return;
        setIsAiLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: (process.env.API_KEY || process.env.GEMINI_API_KEY as string) });
            const response = await ai.models.generateContent({
                model: 'gemini-3.8-flash',
                contents: `Calculate this: "${aiQuery}". Provide the answer in the same language as the input. First, provide the numerical result, then explain the steps clearly.`,
                config: {
                    systemInstruction: "You are a precise calculator assistant. Always provide the answer first in the same language as the user's input, then a clear, step-by-step explanation in that same language."
                }
            });
            
            const text = response.text || '';
            // Extract result and explanation
            const resultMatch = text.match(/[\d.]+/);
            const result = resultMatch ? resultMatch[0] : 'Calculated';
            
            setAiResponse({ result: result, explanation: text });
            setHistory([{ expression: aiQuery, res: result, date: new Date().toLocaleTimeString() }, ...history]);
        } catch (e) {
            setAiResponse({ result: 'Sync Error', explanation: 'Please try simpler numbers.' });
        } finally {
            setIsAiLoading(false);
        }
    };

    const renderCalculator = () => {
        const buttons = [
            ['AC', '⌫', '%', '÷'],
            ['7', '8', '9', '×'],
            ['4', '5', '6', '−'],
            ['1', '2', '3', '+'],
            ['0', '.', '=']
        ];

        return (
            <div className="flex-1 flex flex-col p-4 sm:p-6 gap-4 overflow-hidden h-full">
                <div className="flex-1 flex flex-col justify-end items-end p-8 bg-white/[0.03] rounded-[3rem] border border-white/10 overflow-hidden min-h-[40%] shadow-2xl">
                    <div className="text-3xl text-white/40 font-mono tracking-tighter mb-6 break-all w-full text-right opacity-60">{input || '0'}</div>
                    <div className="text-7xl sm:text-8xl font-black text-white font-mono tracking-tighter transition-all break-all w-full text-right leading-none drop-shadow-lg">
                        {result ? result : input || '0'}
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-4 flex-none pb-6 sm:pb-10 h-[50%]">
                    {buttons.flat().map((btn, index) => (
                        <motion.button
                            key={index}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => btn && handlePress(btn)}
                            className={`rounded-[2rem] flex items-center justify-center text-2xl font-bold transition-all ${
                                !btn ? 'invisible' :
                                btn === '=' ? 'bg-[#FF9500] text-white shadow-[0_0_20px_rgba(255,149,0,0.4)] col-span-2' :
                                ['÷', '×', '−', '+'].includes(btn) ? 'bg-[#FF9500] text-white' :
                                ['AC', '⌫', '%'].includes(btn) ? 'bg-[#A5A5A5] text-black' : 'bg-[#333333] text-white'
                            }`}
                        >
                            {btn}
                        </motion.button>
                    ))}
                </div>
            </div>
        );
    };

    const renderAiTab = () => (
        <div className="flex-1 flex flex-col p-6 sm:p-8 space-y-4 overflow-hidden h-full">
            <div className="flex flex-col items-center gap-2 flex-none py-2">
                <SifraLogo size="sm" showText={false} />
                <h2 className="text-xl font-black italic uppercase tracking-tighter">Sifra AI Matrix</h2>
                <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em] text-center italic">What should I calculate?</p>
            </div>

            <div className="flex-1 flex flex-col justify-center gap-4">
                {aiResponse ? (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-8 bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 rounded-[2.5rem] space-y-3">
                        <h3 className="text-6xl font-black text-white font-mono">{aiResponse.result}</h3>
                        <div className="text-sm text-white/70 italic space-y-2">
                            {aiResponse.explanation.split('\n').map((line, i) => (
                                <p key={i}>{line}</p>
                            ))}
                        </div>
                        <button onClick={() => setAiResponse(null)} className="text-[10px] font-black text-[#8B5CF6] uppercase tracking-widest pt-4">New Calculation</button>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        <textarea 
                            value={aiQuery} onChange={e => setAiQuery(e.target.value)}
                            placeholder="Example: 'Calculate 5000 taka to USD'"
                            className="w-full h-40 bg-white/5 border border-white/10 rounded-3xl p-6 text-white outline-none focus:border-[#8B5CF6] transition-all resize-none text-sm"
                        />
                        <div className="flex gap-2">
                            <button className="flex-1 h-14 bg-white/5 rounded-2xl flex items-center justify-center gap-2 text-white/40"><MicrophoneIcon className="w-5 h-5" /> Voice</button>
                            <button onClick={handleAiAsk} disabled={isAiLoading || !aiQuery.trim()} className="w-16 h-16 bg-[#8B5CF6] rounded-2xl flex items-center justify-center text-white shadow-xl disabled:opacity-30">
                                {isAiLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <SendIcon />}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const renderHistory = () => (
        <div className="flex-1 flex flex-col p-6 sm:p-8 space-y-6 overflow-hidden h-full">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Session Logs</h2>
                <button onClick={() => setHistory([])} className="text-rose-500/40 hover:text-rose-500"><TrashIcon className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto premium-scroll space-y-3 pb-4">
                {history.map((h, i) => (
                    <div key={i} className="p-5 bg-white/[0.03] border border-white/5 rounded-[1.8rem] flex justify-between items-center">
                        <div className="text-left overflow-hidden mr-2">
                            <p className="text-[8px] text-white/30 font-bold uppercase mb-0.5">{h.date}</p>
                            <h4 className="text-xs font-medium text-white/60 truncate">{h.expression}</h4>
                        </div>
                        <div className="text-right flex-none"><span className="text-lg font-black text-[#4DA3FF] font-mono">{h.res}</span></div>
                    </div>
                ))}
                {history.length === 0 && <div className="p-20 text-center opacity-20 italic text-xs">Empty Matrix</div>}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[250] bg-[#0E0E11] text-white flex flex-col font-sans overflow-hidden">
            <header className="px-4 pt-4 pb-2 flex items-center justify-between relative z-10">
                <button onClick={onClose} className="p-2 bg-white/5 rounded-xl border border-white/5 active:scale-90 transition-transform">
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1 bg-white/5 rounded-full p-0.5 border border-white/10">
                    {[
                        { id: 'calculator', icon: <CalculatorIcon /> },
                        { id: 'ai', icon: <SparklesIcon /> },
                        { id: 'history', icon: <ClockIcon /> }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as CalcTab)}
                            className={`h-8 px-3 rounded-full flex items-center justify-center transition-all ${activeTab === tab.id ? 'bg-white text-black shadow-xl' : 'text-white/30 hover:text-white'}`}
                        >
                            {React.cloneElement(tab.icon as React.ReactElement, { className: "w-3.5 h-3.5" })}
                        </button>
                    ))}
                </div>
                <div className="w-10" />
            </header>

            <main className="flex-1 relative z-10 overflow-hidden">
                <AnimatePresence mode="wait">
                    {activeTab === 'calculator' && <div key="calc" className="h-full">{renderCalculator()}</div>}
                    {activeTab === 'ai' && <div key="ai" className="h-full">{renderAiTab()}</div>}
                    {activeTab === 'history' && <div key="hist" className="h-full">{renderHistory()}</div>}
                </AnimatePresence>
            </main>
            <div className="absolute bottom-1 left-0 w-full flex justify-center opacity-5 pointer-events-none">
                <p className="text-[6px] font-black uppercase tracking-[1em]">SIFRA NEURAL MATRIX v4.2</p>
            </div>
        </div>
    );
};

export default SifraCalculatorView;
