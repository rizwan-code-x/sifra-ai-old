
import React from 'react';

const FolderIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-19.5 0A2.25 2.25 0 0 0 4.5 15h15a2.25 2.25 0 0 0 2.25-2.25m-19.5 0v.25A2.25 2.25 0 0 0 4.5 17.5h15a2.25 2.25 0 0 0 2.25-2.25V15m-19.5 0V7.5A2.25 2.25 0 0 1 4.5 5.25h5.053c.47 0 .926.186 1.263.517l2.17 2.131a.75.75 0 0 0 .513.202h6.251A2.25 2.25 0 0 1 21.75 10.5V15" />
    </svg>
);

export default FolderIcon;
