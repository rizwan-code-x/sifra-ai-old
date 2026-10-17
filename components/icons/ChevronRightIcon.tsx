
import React from 'react';

// Fix: Added className prop support to allow parent components to style the icon size and color
const ChevronRightIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5 text-gray-400" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
);

export default ChevronRightIcon;