import { SessionStorageAdapter } from "./sessionStorage";

export interface ReactNativeAsyncStorageLike {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export function createReactNativeAsyncStorageAdapter(
  asyncStorage: ReactNativeAsyncStorageLike,
): SessionStorageAdapter {
  return {
    async getItem(key: string): Promise<string | null> {
      return asyncStorage.getItem(key);
    },
    async setItem(key: string, value: string): Promise<void> {
      await asyncStorage.setItem(key, value);
    },
    async removeItem(key: string): Promise<void> {
      await asyncStorage.removeItem(key);
    },
  };
}
