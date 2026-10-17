
import React from 'react';

const BriefcaseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 .621-.504 1.125-1.125 1.125H4.875c-.621 0-1.125-.504-1.125-1.125v-4.25m16.5 0a2.25 2.25 0 0 0-1.883-2.212c-3.116-.534-6.333-.534-9.444 0-1.077.185-1.883 1.115-1.883 2.212m16.5 0V10.5m-16.5 3.65V10.5m16.5 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 10.5m4.5-8.25h9a2.25 2.25 0 0 1 2.25 2.25v1.5H5.25V4.5a2.25 2.25 0 0 1 2.25-2.25Z" />
    </svg>
);

export default BriefcaseIcon;
