export interface AppActivity {
    id: string;
    view: string | number;
    title: string;
    subtitle: string;
    timestamp: number;
    payload?: any;
}

export const logAppActivity = (view: string | number, title: string, subtitle: string, payload?: any) => {
    try {
        const history: AppActivity[] = JSON.parse(localStorage.getItem('sifra_app_history') || '[]');
        // Don't log if it's identical to the very last one
        if (history.length > 0 && history[0].title === title && history[0].subtitle === subtitle) {
            return;
        }
        history.unshift({
            id: Date.now().toString(),
            view,
            title,
            subtitle,
            timestamp: Date.now(),
            payload
        });
        localStorage.setItem('sifra_app_history', JSON.stringify(history.slice(0, 100))); // Keep last 100
    } catch (e) {
        console.error('Failed to log activity', e);
    }
};

export const getAppHistory = (): AppActivity[] => {
    try {
        return JSON.parse(localStorage.getItem('sifra_app_history') || '[]');
    } catch (e) {
        return [];
    }
};

export const clearAppHistory = () => {
    localStorage.removeItem('sifra_app_history');
};
