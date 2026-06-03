import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, map, of, startWith } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { TransactionsService } from '../../core/transactions/transactions.service';
import { MonthlySummary, Transaction } from '../../core/transactions/transaction.models';
import { AdminService } from '../../core/admin/admin.service';
import { AdminSummary } from '../../core/admin/admin.models';

interface SummaryState {
  data: MonthlySummary | null;
  loading: boolean;
  error: string | null;
}

interface RecentState {
  items: Transaction[];
  loading: boolean;
  error: string | null;
}

interface MonthlyState {
  items: Transaction[];
  loading: boolean;
  error: string | null;
}

interface ChartBar {
  name: string;
  total: number;
  pct: number;
}

interface AdminState {
  data: AdminSummary | null;
  loading: boolean;
  error: string | null;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [DatePipe, DecimalPipe, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly auth = inject(AuthService);
  private readonly transactions = inject(TransactionsService);
  private readonly admin = inject(AdminService);

  protected readonly user = this.auth.user;
  protected readonly isAdmin = computed(() => this.user()?.role === 'Admin');

  protected readonly greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Hello';
  });

  private readonly now = new Date();
  protected readonly currentMonthLabel = this.now.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  protected readonly summary = toSignal<SummaryState>(
    this.transactions.getMonthlySummary(this.now.getFullYear(), this.now.getMonth() + 1).pipe(
      map((data): SummaryState => ({ data, loading: false, error: null })),
      catchError((err: { error?: { message?: string } }) =>
        of<SummaryState>({
          data: null,
          loading: false,
          error: err?.error?.message ?? 'Could not load summary',
        }),
      ),
      startWith<SummaryState>({ data: null, loading: true, error: null }),
    ),
    { requireSync: true },
  );

  protected readonly recent = toSignal<RecentState>(
    this.transactions.getRange(this.rangeFrom(), this.toIsoDate(this.now)).pipe(
      map(
        (items): RecentState => ({
          items: this.onlyMine(items)
            .sort((a, b) => b.transactionDate.localeCompare(a.transactionDate))
            .slice(0, 5),
          loading: false,
          error: null,
        }),
      ),
      catchError((err: { error?: { message?: string } }) =>
        of<RecentState>({
          items: [],
          loading: false,
          error: err?.error?.message ?? 'Could not load recent activity',
        }),
      ),
      startWith<RecentState>({ items: [], loading: true, error: null }),
    ),
    { requireSync: true },
  );

  protected readonly monthly = toSignal<MonthlyState>(
    this.transactions.getRange(this.monthStart(), this.toIsoDate(this.now)).pipe(
      map((items): MonthlyState => ({ items: this.onlyMine(items), loading: false, error: null })),
      catchError((err: { error?: { message?: string } }) =>
        of<MonthlyState>({
          items: [],
          loading: false,
          error: err?.error?.message ?? 'Could not load chart',
        }),
      ),
      startWith<MonthlyState>({ items: [], loading: true, error: null }),
    ),
    { requireSync: true },
  );

  protected readonly adminSummary = toSignal<AdminState>(
    this.user()?.role === 'Admin'
      ? this.admin.getSummary(this.now.getFullYear(), this.now.getMonth() + 1).pipe(
          map((data): AdminState => ({ data, loading: false, error: null })),
          catchError((err: { error?: { message?: string } }) =>
            of<AdminState>({
              data: null,
              loading: false,
              error: err?.error?.message ?? 'Could not load admin summary',
            }),
          ),
          startWith<AdminState>({ data: null, loading: true, error: null }),
        )
      : of<AdminState>({ data: null, loading: false, error: null }),
    { requireSync: true },
  );

  protected readonly chart = computed<ChartBar[]>(() => {
    const items = this.monthly().items;
    if (items.length === 0) return [];

    const totals = new Map<string, number>();
    for (const t of items) {
      totals.set(t.dailyItemName, (totals.get(t.dailyItemName) ?? 0) + t.amount);
    }

    const sorted = [...totals.entries()]
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const max = sorted[0]?.total ?? 1;
    return sorted.map((s) => ({ ...s, pct: (s.total / max) * 100 }));
  });

  private monthStart(): string {
    return this.toIsoDate(new Date(this.now.getFullYear(), this.now.getMonth(), 1));
  }

  // Admin's GET /transactions returns every user's rows. The personal cards
  // (recent activity, chart) should only show the admin's own — filter by
  // the username we already get back. Non-admins get unfiltered = their own.
  private onlyMine(items: readonly Transaction[]): Transaction[] {
    if (!this.isAdmin()) return [...items];
    const me = this.user()?.username;
    return items.filter((t) => t.username === me);
  }

  private rangeFrom(): string {
    const d = new Date(this.now.getFullYear(), this.now.getMonth() - 1, this.now.getDate());
    return this.toIsoDate(d);
  }

  private toIsoDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
