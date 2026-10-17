
import React from 'react';
import { motion } from 'framer-motion';

interface QuantumInputProps {
    label?: string;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    icon?: React.ReactNode;
    type?: string;
    isDark?: boolean;
}

const QuantumInput: React.FC<QuantumInputProps> = ({ label, value, onChange, placeholder, icon, type = 'text', isDark = false }) => {
    return (
        <div className="flex flex-col gap-2 w-full group">
            {label && <label className={`text-[8px] font-black uppercase tracking-[0.4em] ml-2 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{label}</label>}
            <motion.div 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`relative overflow-hidden rounded-2xl border backdrop-blur-3xl p-1 transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/80 border-black/5 shadow-sm'} group-focus-within:border-indigo-500/50 group-focus-within:shadow-[0_0_30px_rgba(99,102,241,0.1)]`}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                <div className="relative flex items-center gap-3 px-4 py-3">
                    {icon && (
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'bg-white/5 text-white/40' : 'bg-black/5 text-black/40'} group-focus-within:text-indigo-400`}>
                            {React.cloneElement(icon as React.ReactElement, { className: "w-4 h-4" })}
                        </div>
                    )}
                    <input 
                        type={type}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className={`flex-1 bg-transparent border-none outline-none text-sm font-bold ${isDark ? 'text-white placeholder:text-white/20' : 'text-gray-800 placeholder:text-gray-400'}`}
                    />
                </div>
                
                {/* 3D VFX Edge */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" />
            </motion.div>
        </div>
    );
};

export default QuantumInput;
