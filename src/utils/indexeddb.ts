// IndexedDB utilities for video caching

const DB_NAME = 'video2ascii_cache';
const DB_VERSION = 1;
const STORE_NAME = 'videos';

let dbInstance: IDBDatabase | null = null;

export async function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('[IndexedDB] Failed to open database:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      console.log('[IndexedDB] Database opened successfully');
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'videoId' });
        console.log('[IndexedDB] Object store created:', STORE_NAME);
      }
    };
  });
}

export async function getBlob(videoId: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(videoId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        if (result?.blob) {
          console.log('[IndexedDB] Cache hit:', videoId);
          resolve(result.blob);
        } else {
          console.log('[IndexedDB] Cache miss:', videoId);
          resolve(null);
        }
      };
    });
  } catch (error) {
    console.error('[IndexedDB] Error getting blob:', error);
    return null;
  }
}

export async function saveBlob(videoId: string, blob: Blob): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ videoId, blob });

      request.onerror = () => {
        console.error('[IndexedDB] Error saving blob:', request.error);
        reject(request.error);
      };
      request.onsuccess = () => {
        console.log('[IndexedDB] Blob saved:', videoId, `(${(blob.size / 1024 / 1024).toFixed(2)} MB)`);
        resolve(true);
      };
    });
  } catch (error) {
    console.error('[IndexedDB] Error saving blob:', error);
    return false;
  }
}

export async function deleteBlob(videoId: string): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(videoId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log('[IndexedDB] Blob deleted:', videoId);
        resolve(true);
      };
    });
  } catch (error) {
    console.error('[IndexedDB] Error deleting blob:', error);
    return false;
  }
}

export async function getAllKeys(): Promise<string[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAllKeys();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        resolve(request.result as string[]);
      };
    });
  } catch (error) {
    console.error('[IndexedDB] Error getting all keys:', error);
    return [];
  }
}

export async function getBlobSize(videoId: string): Promise<number> {
  try {
    const blob = await getBlob(videoId);
    return blob?.size ?? 0;
  } catch {
    return 0;
  }
}
