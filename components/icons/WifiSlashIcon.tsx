import React from 'react';

const WifiSlashIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12.006 18.25c-.201 0-.399-.04-.588-.12l-8.524-3.5a1.25 1.25 0 0 1-.418-2.072L6.113 9.49a9.752 9.752 0 0 1 11.774 0l3.637 3.068a1.25 1.25 0 0 1-.418 2.072l-8.524 3.5c-.189.08-.387.12-.588.12ZM2.25 2.25l19.5 19.5" />
    </svg>
);

export default WifiSlashIcon;
