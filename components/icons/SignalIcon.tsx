import React from 'react';

const SignalIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0 1.5 1.5 0 0 1 3 0ZM19.5 18.75a1.5 1.5 0 0 1-3 0 1.5 1.5 0 0 1 3 0ZM13.875 14.25a1.5 1.5 0 0 1-3 0 1.5 1.5 0 0 1 3 0ZM6.75 6.75a1.5 1.5 0 0 1-3 0 1.5 1.5 0 0 1 3 0ZM19.5 6.75a1.5 1.5 0 0 1-3 0 1.5 1.5 0 0 1 3 0ZM13.875 9.75a1.5 1.5 0 0 1-3 0 1.5 1.5 0 0 1 3 0Z" />
    </svg>
);

export default SignalIcon;
