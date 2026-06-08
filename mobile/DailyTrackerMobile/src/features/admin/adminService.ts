import {
  AdminSummary,
  AssignRoleRequest,
  ChangePasswordRequest,
  PagedResult,
  UserSummary,
  parityApiRoutes,
} from '../../api/contracts';
import { AuthService } from '../auth/authService';

export class AdminService {
  private readonly baseUrl: string;

  constructor(
    private readonly auth: AuthService,
    options: { apiBaseUrl?: string } = {},
  ) {
    this.baseUrl = (options.apiBaseUrl ?? 'http://localhost:5088').replace(/\/$/, '');
  }

  async getSummary(year: number, month: number): Promise<AdminSummary> {
    await this.auth.restoreSession();
    const token = this.auth.getSession()?.token;

    const response = await fetch(`${this.baseUrl}${parityApiRoutes.admin}/summary/${year}/${month}`, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const detail = await safeReadError(response);
      throw new Error(detail ?? `Failed to load admin summary (HTTP ${response.status}).`);
    }

    return (await response.json()) as AdminSummary;
  }

  async getUsers(page = 1, pageSize = 20): Promise<PagedResult<UserSummary>> {
    await this.auth.restoreSession();
    const token = this.auth.getSession()?.token;

    const query = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });

    const response = await fetch(`${this.baseUrl}${parityApiRoutes.admin}/users?${query.toString()}`, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const detail = await safeReadError(response);
      throw new Error(detail ?? `Failed to load users (HTTP ${response.status}).`);
    }

    return (await response.json()) as PagedResult<UserSummary>;
  }

  async assignRole(userId: string, role: string): Promise<void> {
    const body: AssignRoleRequest = { role };
    await this.putNoContent(`${this.baseUrl}${parityApiRoutes.admin}/users/${userId}/role`, body);
  }

  async changePassword(userId: string, newPassword: string): Promise<void> {
    const body: ChangePasswordRequest = { newPassword };
    await this.putNoContent(`${this.baseUrl}${parityApiRoutes.admin}/users/${userId}/password`, body);
  }

  async deleteUser(userId: string): Promise<void> {
    await this.auth.restoreSession();
    const token = this.auth.getSession()?.token;
    const response = await fetch(`${this.baseUrl}${parityApiRoutes.admin}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const detail = await safeReadError(response);
      throw new Error(detail ?? `Failed to delete user (HTTP ${response.status}).`);
    }
  }

  private async putNoContent(url: string, body: AssignRoleRequest | ChangePasswordRequest): Promise<void> {
    await this.auth.restoreSession();
    const token = this.auth.getSession()?.token;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const detail = await safeReadError(response);
      throw new Error(detail ?? `Request failed (HTTP ${response.status}).`);
    }
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
