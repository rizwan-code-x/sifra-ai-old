
import React from 'react';

const MapIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.446 1.972-1.479a.75.75 0 0 0 .254-.314l1.969-5.118a.75.75 0 0 0-.254-.314l-1.972-1.479a.75.75 0 0 0-.753 0L15 8.19l-4.473-1.677a.75.75 0 0 0-.753 0L3.028 12.02a.75.75 0 0 0-.254.314l-1.969 5.118a.75.75 0 0 0 .254.314l1.972 1.479a.75.75 0 0 0 .753 0L9 15.81l4.473 1.677a.75.75 0 0 0 .753 0L15.503 16.554Z" />
    </svg>
);

export default MapIcon;
