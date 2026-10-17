import React from 'react';
import { UserProfile } from '../types';
import VoiceAssistantView from './VoiceAssistantView';

const VoiceView: React.FC<{ userProfile: UserProfile; onClose: () => void; }> = ({ userProfile, onClose }) => {
    return <VoiceAssistantView userProfile={userProfile} onClose={onClose} />;
};

export default VoiceView;
