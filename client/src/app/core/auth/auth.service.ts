import { Injectable, computed, signal } from '@angular/core';
import { AuthUser } from './auth-user.model';

const STORAGE_KEY = 'auth.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Private writable signal — only this service can change it.
  private readonly userSignal = signal<AuthUser | null>(loadFromStorage());

  // Public read-only views.
  readonly user = this.userSignal.asReadonly();
  readonly isLoggedIn = computed(() => this.user() !== null);

  /**
   * Stub login — pretends to call the API.
   * Accepts admin/Password123! or user/Password123! for now.
   * Real HTTP call comes in the next step.
   */
  async login(username: string, password: string): Promise<void> {
    await delay(400); // fake network latency

    const knownUsers: Record<string, string> = {
      admin: 'Admin',
      user: 'User',
      user2: 'User',
    };

    const role = knownUsers[username];
    if (!role || password !== 'Password123!') {
      throw new Error('Invalid username or password.');
    }

    const user: AuthUser = {
      username,
      role,
      token: 'fake-jwt-token-' + Date.now(),
      expiresAtUtc: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };

    this.userSignal.set(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  logout(): void {
    this.userSignal.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }
}

function loadFromStorage(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
