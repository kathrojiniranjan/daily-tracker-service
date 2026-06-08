import {
  AuthSession,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  parityApiRoutes,
} from "../../api/contracts";
import {
  SessionStorageAdapter,
  createDefaultSessionStorage,
} from "./sessionStorage";
import {
  ReactNativeAsyncStorageLike,
  createReactNativeAsyncStorageAdapter,
} from "./asyncStorageAdapter";

export const SESSION_KEY = "dailyTracker.auth.session";

export interface AuthServiceOptions {
  apiBaseUrl?: string;
  storage?: SessionStorageAdapter;
}

export function createReactNativeAuthService(
  asyncStorage: ReactNativeAsyncStorageLike,
  options: Omit<AuthServiceOptions, "storage"> = {},
): AuthService {
  return new AuthService({
    ...options,
    storage: createReactNativeAsyncStorageAdapter(asyncStorage),
  });
}

export class AuthService {
  private readonly baseUrl: string;
  private readonly storage?: SessionStorageAdapter;
  private session: AuthSession | null = null;

  constructor(options: AuthServiceOptions = {}) {
    this.baseUrl = (options.apiBaseUrl ?? "http://localhost:5088").replace(
      /\/$/,
      "",
    );
    this.storage = options.storage ?? createDefaultSessionStorage();
  }

  async login(body: LoginRequest): Promise<AuthSession> {
    const response = await this.postJson<LoginResponse>(
      parityApiRoutes.authLogin,
      body,
    );
    return this.persist(response);
  }

  async register(body: RegisterRequest): Promise<AuthSession> {
    const response = await this.postJson<LoginResponse>(
      parityApiRoutes.authRegister,
      body,
    );
    return this.persist(response);
  }

  getSession(): AuthSession | null {
    return this.session;
  }

  async restoreSession(): Promise<AuthSession | null> {
    if (this.storage) {
      const raw = await this.storage.getItem(SESSION_KEY);
      this.session = safeParseSession(raw);
      if (this.isSessionExpired(this.session)) {
        await this.logout();
      }
      return this.session;
    }

    this.session = null;
    return null;
  }

  async logout(): Promise<void> {
    this.session = null;
    if (this.storage) {
      await this.storage.removeItem(SESSION_KEY);
    }
  }

  isLoggedIn(): boolean {
    return !this.isSessionExpired(this.session);
  }

  private isSessionExpired(session: AuthSession | null): boolean {
    if (!session) {
      return true;
    }
    const exp = Date.parse(session.expiresAtUtc);
    return Number.isNaN(exp) || exp <= Date.now();
  }

  private async persist(response: LoginResponse): Promise<AuthSession> {
    const session: AuthSession = {
      username: response.username,
      role: response.role,
      token: response.accessToken,
      expiresAtUtc: response.expiresAtUtc,
    };

    this.session = session;
    if (this.storage) {
      await this.storage.setItem(SESSION_KEY, JSON.stringify(session));
    }
    return session;
  }

  private async postJson<TResponse>(
    path: string,
    body: LoginRequest | RegisterRequest,
  ): Promise<TResponse> {
    const httpResponse = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!httpResponse.ok) {
      const detail = await safeReadError(httpResponse);
      throw new Error(
        detail ?? `Auth request failed (HTTP ${httpResponse.status})`,
      );
    }

    return (await httpResponse.json()) as TResponse;
  }
}

async function safeReadError(response: Response): Promise<string | null> {
  try {
    const payload = (await response.json()) as {
      detail?: string;
      title?: string;
      message?: string;
    };
    return payload.detail ?? payload.title ?? payload.message ?? null;
  } catch {
    return null;
  }
}

function safeParseSession(raw: string | null): AuthSession | null {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}
