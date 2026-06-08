export interface SessionStorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export function createInMemorySessionStorage(): SessionStorageAdapter {
  const map = new Map<string, string>();

  return {
    async getItem(key: string): Promise<string | null> {
      return map.get(key) ?? null;
    },
    async setItem(key: string, value: string): Promise<void> {
      map.set(key, value);
    },
    async removeItem(key: string): Promise<void> {
      map.delete(key);
    },
  };
}

export function createWebLocalStorageAdapter(): SessionStorageAdapter | null {
  const storage = getWebLocalStorage();
  if (!storage) {
    return null;
  }

  return {
    async getItem(key: string): Promise<string | null> {
      return storage.getItem(key);
    },
    async setItem(key: string, value: string): Promise<void> {
      storage.setItem(key, value);
    },
    async removeItem(key: string): Promise<void> {
      storage.removeItem(key);
    },
  };
}

export function createDefaultSessionStorage(): SessionStorageAdapter {
  return createWebLocalStorageAdapter() ?? createInMemorySessionStorage();
}

function getWebLocalStorage(): Storage | null {
  if (typeof globalThis === "undefined" || !("localStorage" in globalThis)) {
    return null;
  }

  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}
