import {
  CreateTransactionRequest,
  MonthlySummary,
  PagedResult,
  Transaction,
  UpdateTransactionRequest,
  parityApiRoutes,
} from '../../api/contracts';
import { AuthService } from '../auth/authService';

export class TransactionsService {
  private readonly baseUrl: string;

  constructor(
    private readonly auth: AuthService,
    options: { apiBaseUrl?: string } = {},
  ) {
    this.baseUrl = (options.apiBaseUrl ?? 'http://localhost:5088').replace(/\/$/, '');
  }

  async getRangePaged(
    from: string,
    to: string,
    page = 1,
    pageSize = 20,
    userId?: string,
  ): Promise<PagedResult<Transaction>> {
    await this.auth.restoreSession();
    const token = this.auth.getSession()?.token;

    const query = new URLSearchParams({
      from,
      to,
      page: String(page),
      pageSize: String(pageSize),
    });
    if (userId) {
      query.set('userId', userId);
    }

    const response = await fetch(
      `${this.baseUrl}${parityApiRoutes.transactions}/paged?${query.toString()}`,
      {
        method: 'GET',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    );

    if (!response.ok) {
      const detail = await safeReadError(response);
      throw new Error(detail ?? `Failed to load transactions (HTTP ${response.status}).`);
    }

    return (await response.json()) as PagedResult<Transaction>;
  }

  async getRange(from: string, to: string, userId?: string): Promise<Transaction[]> {
    await this.auth.restoreSession();
    const token = this.auth.getSession()?.token;

    const query = new URLSearchParams({ from, to });
    if (userId) {
      query.set('userId', userId);
    }

    const response = await fetch(`${this.baseUrl}${parityApiRoutes.transactions}?${query.toString()}`, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const detail = await safeReadError(response);
      throw new Error(detail ?? `Failed to load transactions range (HTTP ${response.status}).`);
    }

    return (await response.json()) as Transaction[];
  }

  async create(body: CreateTransactionRequest): Promise<Transaction> {
    await this.auth.restoreSession();
    const token = this.auth.getSession()?.token;

    const response = await fetch(`${this.baseUrl}${parityApiRoutes.transactions}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const detail = await safeReadError(response);
      throw new Error(detail ?? `Failed to create transaction (HTTP ${response.status}).`);
    }

    return (await response.json()) as Transaction;
  }

  async update(id: string, body: UpdateTransactionRequest): Promise<Transaction> {
    await this.auth.restoreSession();
    const token = this.auth.getSession()?.token;

    const response = await fetch(`${this.baseUrl}${parityApiRoutes.transactions}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const detail = await safeReadError(response);
      throw new Error(detail ?? `Failed to update transaction (HTTP ${response.status}).`);
    }

    return (await response.json()) as Transaction;
  }

  async delete(id: string): Promise<void> {
    await this.auth.restoreSession();
    const token = this.auth.getSession()?.token;

    const response = await fetch(`${this.baseUrl}${parityApiRoutes.transactions}/${id}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const detail = await safeReadError(response);
      throw new Error(detail ?? `Failed to delete transaction (HTTP ${response.status}).`);
    }
  }

  async getMonthlySummary(year: number, month: number): Promise<MonthlySummary> {
    await this.auth.restoreSession();
    const token = this.auth.getSession()?.token;

    const response = await fetch(
      `${this.baseUrl}${parityApiRoutes.transactions}/summary/${year}/${month}`,
      {
        method: 'GET',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    );

    if (!response.ok) {
      const detail = await safeReadError(response);
      throw new Error(detail ?? `Failed to load monthly summary (HTTP ${response.status}).`);
    }

    return (await response.json()) as MonthlySummary;
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
