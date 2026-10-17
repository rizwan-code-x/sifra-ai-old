import React from 'react';
import { UserProfile } from '../types';
import VoiceAssistantView from './VoiceAssistantView';

export interface GalaxyVoiceViewProps {
  userProfile: UserProfile;
  onClose: () => void;
}

const GalaxyVoiceView: React.FC<GalaxyVoiceViewProps> = ({ userProfile, onClose }) => {
  return <VoiceAssistantView userProfile={userProfile} onClose={onClose} />;
};

export default GalaxyVoiceView;
