/**
 * TTL Cache utility for storing data with time-to-live
 * Supports IndexedDB for offline persistence with localStorage fallback
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class CacheService {
  private dbName = 'agri_assist_cache';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.warn('⚠️ IndexedDB not available, using localStorage fallback');
        resolve();
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
      };
    });
  }

  async set<T>(key: string, data: T, ttl: number = 10 * 60 * 1000): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl
    };

    try {
      if (this.db) {
        await new Promise((resolve, reject) => {
          const transaction = this.db!.transaction(['cache'], 'readwrite');
          const store = transaction.objectStore('cache');
          const request = store.put({ key, ...entry });
          request.onsuccess = () => resolve(undefined);
          request.onerror = () => reject(request.error);
        });
      } else {
        // Fallback to localStorage
        localStorage.setItem(key, JSON.stringify(entry));
      }
    } catch (error) {
      console.error('❌ Cache set error:', error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      let entry: CacheEntry<T> | null = null;

      if (this.db) {
        entry = await new Promise((resolve, reject) => {
          const transaction = this.db!.transaction(['cache'], 'readonly');
          const store = transaction.objectStore('cache');
          const request = store.get(key);
          request.onsuccess = () => resolve(request.result || null);
          request.onerror = () => reject(request.error);
        });
      } else {
        // Fallback to localStorage
        const stored = localStorage.getItem(key);
        if (stored) {
          entry = JSON.parse(stored);
        }
      }

      if (!entry) return null;

      // Check if entry is still valid
      const age = Date.now() - entry.timestamp;
      if (age > entry.ttl) {
        await this.delete(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('❌ Cache get error:', error);
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      if (this.db) {
        await new Promise((resolve, reject) => {
          const transaction = this.db!.transaction(['cache'], 'readwrite');
          const store = transaction.objectStore('cache');
          const request = store.delete(key);
          request.onsuccess = () => resolve(undefined);
          request.onerror = () => reject(request.error);
        });
      } else {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('❌ Cache delete error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      if (this.db) {
        await new Promise((resolve, reject) => {
          const transaction = this.db!.transaction(['cache'], 'readwrite');
          const store = transaction.objectStore('cache');
          const request = store.clear();
          request.onsuccess = () => resolve(undefined);
          request.onerror = () => reject(request.error);
        });
      } else {
        // Clear only cache-related items
        Object.keys(localStorage)
          .filter(key => key.startsWith('weather_') || key.startsWith('pest_'))
          .forEach(key => localStorage.removeItem(key));
      }
    } catch (error) {
      console.error('❌ Cache clear error:', error);
    }
  }
}

export const cacheService = new CacheService();

// Initialize cache on load
cacheService.initialize().catch(console.error);
