
import React from 'react';

const UsersIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-2.123-7.674 4.125 4.125 0 0 0-4.122 4.122v2.132ZM9 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-2.123-7.674 4.125 4.125 0 0 0-4.122 4.122v2.132ZM4.5 18.75V10.5M4.5 18.75a2.25 2.25 0 0 1-2.25-2.25v-6.75M4.5 18.75h3M2.25 9.75a2.25 2.25 0 0 1 2.25-2.25h15a2.25 2.25 0 0 1 2.25 2.25m-19.5 0v.25a2.25 2.25 0 0 0 2.25 2.25h15a2.25 2.25 0 0 0 2.25-2.25V9.75m-19.5 0V7.5A2.25 2.25 0 0 1 4.5 5.25h5.053c.47 0 .926.186 1.263.517l2.17 2.131a.75.75 0 0 0 .513.202h6.251A2.25 2.25 0 0 1 21.75 10.5V15" />
    </svg>
);

export default UsersIcon;
