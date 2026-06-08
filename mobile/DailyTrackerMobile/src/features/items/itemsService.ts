import {
  CreateDailyItemRequest,
  DailyItem,
  PagedResult,
  UpdateDailyItemRequest,
  parityApiRoutes,
} from '../../api/contracts';
import { AuthService } from '../auth/authService';

export class ItemsService {
  private readonly baseUrl: string;

  constructor(
    private readonly auth: AuthService,
    options: { apiBaseUrl?: string } = {},
  ) {
    this.baseUrl = (options.apiBaseUrl ?? 'http://localhost:5088').replace(/\/$/, '');
  }

  async getPaged(page = 1, pageSize = 20): Promise<PagedResult<DailyItem>> {
    await this.auth.restoreSession();
    const token = this.auth.getSession()?.token;

    const response = await fetch(
      `${this.baseUrl}${parityApiRoutes.dailyItems}/paged?page=${page}&pageSize=${pageSize}`,
      {
        method: 'GET',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    );

    if (!response.ok) {
      const detail = await safeReadError(response);
      throw new Error(detail ?? `Failed to load items (HTTP ${response.status}).`);
    }

    return (await response.json()) as PagedResult<DailyItem>;
  }

  async create(body: CreateDailyItemRequest): Promise<DailyItem> {
    await this.auth.restoreSession();
    const token = this.auth.getSession()?.token;

    const response = await fetch(`${this.baseUrl}${parityApiRoutes.dailyItems}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const detail = await safeReadError(response);
      throw new Error(detail ?? `Failed to create item (HTTP ${response.status}).`);
    }

    return (await response.json()) as DailyItem;
  }

  async update(id: number, body: UpdateDailyItemRequest): Promise<DailyItem> {
    await this.auth.restoreSession();
    const token = this.auth.getSession()?.token;

    const response = await fetch(`${this.baseUrl}${parityApiRoutes.dailyItems}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const detail = await safeReadError(response);
      throw new Error(detail ?? `Failed to update item (HTTP ${response.status}).`);
    }

    return (await response.json()) as DailyItem;
  }

  async delete(id: number): Promise<void> {
    await this.auth.restoreSession();
    const token = this.auth.getSession()?.token;

    const response = await fetch(`${this.baseUrl}${parityApiRoutes.dailyItems}/${id}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const detail = await safeReadError(response);
      throw new Error(detail ?? `Failed to delete item (HTTP ${response.status}).`);
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
