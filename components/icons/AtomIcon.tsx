
import React from 'react';

const AtomIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 6.75a7.5 7.5 0 0 1 1.137 10.887M9.41 17.25a7.5 7.5 0 1 1 0-10.5M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.35 10.04a9 9 0 0 1-14.7 0M4.65 13.96a9 9 0 0 1 14.7 0" />
    </svg>
);

export default AtomIcon;
