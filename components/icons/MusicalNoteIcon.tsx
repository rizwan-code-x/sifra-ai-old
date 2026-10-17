

import React from 'react';

const MusicalNoteIcon: React.FC<{className?: string}> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9c0 .544 0 1.083.023 1.623A10.49 10.49 0 0 1 9 18c-2.39 0-4.584-.713-6.364-1.977m6.364-12.023l.023-.004c.16-.026.323-.046.49-.06A10.49 10.49 0 0 1 15 5.25c2.39 0 4.584.713 6.364 1.977M9 9l6-3.75" />
    </svg>
);

export default MusicalNoteIcon;
