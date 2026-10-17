export const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('SifraClockDB', 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (e: any) => {
            const db: IDBDatabase = e.target.result;
            if (!db.objectStoreNames.contains('ringtones')) {
                db.createObjectStore('ringtones', { keyPath: 'id' });
            }
        };
    });
};

export const saveRingtone = async (id: string, name: string, dataUrl: string) => {
    const db = await initDB();
    const tx = db.transaction('ringtones', 'readwrite');
    tx.objectStore('ringtones').put({ id, name, dataUrl });
    return new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
    });
};

export const getRingtones = async (): Promise<{id: string, name: string, dataUrl: string}[]> => {
    const db = await initDB();
    const tx = db.transaction('ringtones', 'readonly');
    const store = tx.objectStore('ringtones');
    const request = store.getAll();
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const deleteRingtone = async (id: string) => {
    const db = await initDB();
    const tx = db.transaction('ringtones', 'readwrite');
    tx.objectStore('ringtones').delete(id);
    return new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
    });
};
