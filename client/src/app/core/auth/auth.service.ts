import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { AuthUser } from './auth-user.model';
import { LoginRequest, LoginResponse } from './auth.models';
import { environment } from '../../../environments/environment';

const STORAGE_KEY = 'auth.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/auth`;

  // Private writable signal — only this service can change it.
  private readonly userSignal = signal<AuthUser | null>(loadFromStorage());

  // Public read-only views.
  readonly user = this.userSignal.asReadonly();
  readonly isLoggedIn = computed(() => this.user() !== null);

  async login(username: string, password: string): Promise<void> {
    const body: LoginRequest = { username, password };
    try {
      const response = await firstValueFrom(
        this.http.post<LoginResponse>(`${this.baseUrl}/login`, body),
      );
      this.persist(response);
    } catch (err) {
      throw new Error(extractErrorMessage(err, 'Invalid username or password.'));
    }
  }

  logout(): void {
    this.userSignal.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  private persist(response: LoginResponse): void {
    const user: AuthUser = {
      username: response.username,
      role: response.role,
      token: response.accessToken,
      expiresAtUtc: response.expiresAtUtc,
    };
    this.userSignal.set(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
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

function extractErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse) {
    // ASP.NET ProblemDetails: { title, detail, status, ... }
    const body = err.error as { detail?: string; title?: string; message?: string } | null;
    return body?.detail ?? body?.title ?? body?.message ?? `${fallback} (HTTP ${err.status})`;
  }
  return fallback;
}
