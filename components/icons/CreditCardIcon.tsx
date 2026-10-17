import React from 'react';

const CreditCardIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M2.25 5.25a3 3 0 013-3h13.5a3 3 0 013 3V18.75a3 3 0 01-3 3H5.25a3 3 0 01-3-3V5.25zm1.5 0a1.5 1.5 0 011.5-1.5h13.5a1.5 1.5 0 011.5 1.5v1.5H3.75V5.25zm0 4.5h16.5v9a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-9z" clipRule="evenodd" />
    </svg>
);

export default CreditCardIcon;
