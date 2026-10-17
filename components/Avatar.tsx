import React from 'react';

interface AvatarProps {
    src: string | null;
    initials?: string;
    isSifra?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ src, initials, isSifra = false }) => {
    const size = 'w-10 h-10';
    const baseClasses = `${size} rounded-full flex items-center justify-center font-bold text-white shadow-lg`;
    const userBg = 'bg-pink-400';
    const sifraBg = 'bg-purple-400';

    if (src) {
        return <img className={`${size} rounded-full shadow-lg object-cover`} src={src} alt="avatar" />;
    }

    const displayInitials = initials
        ? initials.trim().split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
        : '?';

    return (
        <div className={`${baseClasses} ${isSifra ? sifraBg : userBg}`}>
            {displayInitials}
        </div>
    );
};

export default Avatar;
