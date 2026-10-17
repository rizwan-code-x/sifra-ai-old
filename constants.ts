import { CommunityPost } from './types';

export const MOCK_POSTS: CommunityPost[] = [
    {
        id: '1',
        userId: 'admin',
        userName: 'Sifra Team',
        content: 'Welcome to the Sifra Community! Share your thoughts, request features, and connect with others here.',
        timestamp: Date.now(),
        likes: 124,
        comments: [],
        type: 'feedback'
    },
    {
        id: '2',
        userId: 'user2',
        userName: 'Alex M.',
        content: 'I need a feature to export my chat history to PDF. Is that possible?',
        timestamp: Date.now() - 3600000,
        likes: 45,
        comments: [],
        type: 'request'
    }
];
