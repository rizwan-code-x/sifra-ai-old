
import React from 'react';

const CloudIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 0-7.5h-.75a6.75 6.75 0 0 0-13.5 0H3.75A1.5 1.5 0 0 0 2.25 13.5V15Z" />
    </svg>
);

export default CloudIcon;
