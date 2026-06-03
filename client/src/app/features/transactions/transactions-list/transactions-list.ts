import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  debounceTime,
  finalize,
  map,
  of,
  startWith,
  switchMap,
} from 'rxjs';

import { DailyItemsService } from '../../../core/items/daily-items.service';
import { DailyItem } from '../../../core/items/daily-item.models';
import { TransactionsService } from '../../../core/transactions/transactions.service';
import {
  CreateTransactionRequest,
  Transaction,
  UpdateTransactionRequest,
} from '../../../core/transactions/transaction.models';
import { AuthService } from '../../../core/auth/auth.service';
import { AdminService } from '../../../core/admin/admin.service';
import { UserSummary } from '../../../core/admin/admin.models';

@Component({
  selector: 'app-transactions-list',
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './transactions-list.html',
  styleUrl: './transactions-list.scss',
})
export class TransactionsList {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(TransactionsService);
  private readonly itemsService = inject(DailyItemsService);
  private readonly auth = inject(AuthService);
  private readonly admin = inject(AdminService);

  private readonly defaults = monthRange(new Date());
  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  protected readonly isAdmin = computed(() => this.auth.user()?.role === 'Admin');
  protected readonly currentUsername = computed(() => this.auth.user()?.username ?? '');

  // Items dropdown — load once.
  protected readonly items = toSignal(
    this.itemsService.getAll().pipe(catchError(() => of([] as DailyItem[]))),
    { initialValue: [] as DailyItem[] },
  );

  // Admin-only: list of users for the filter dropdown. Loaded lazily once.
  protected readonly users = toSignal(
    this.isAdmin()
      ? this.admin.getUsers().pipe(catchError(() => of([] as UserSummary[])))
      : of([] as UserSummary[]),
    { initialValue: [] as UserSummary[] },
  );

  protected readonly filterForm = this.fb.nonNullable.group({
    from: [this.defaults.from, [Validators.required]],
    to: [this.defaults.to, [Validators.required]],
    // Empty string = "all users" (admin only). Ignored for non-admins server-side.
    userId: [''],
  });

  protected readonly createForm = this.fb.nonNullable.group({
    dailyItemId: this.fb.control<number | null>(null, [Validators.required]),
    quantity: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0.001),
      Validators.max(1_000_000),
    ]),
    amount: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0),
      Validators.max(10_000_000),
    ]),
    transactionDate: [toIsoDate(new Date()), [Validators.required]],
    notes: this.fb.control<string | null>('', [Validators.maxLength(500)]),
  });

  protected readonly submitting = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly editingId = signal<string | null>(null);
  protected readonly deletingId = signal<string | null>(null);

  protected readonly state = toSignal(
    combineLatest([
      this.filterForm.valueChanges.pipe(startWith(this.filterForm.getRawValue())),
      this.refresh$,
    ]).pipe(
      debounceTime(250),
      switchMap(([{ from, to, userId }]) => {
        if (!from || !to || from > to) {
          return of({
            items: [] as Transaction[],
            loading: false,
            error: 'Invalid date range.' as string | null,
          });
        }
        return this.service.getRange(from, to, userId || null).pipe(
          map((items) => ({ items, loading: false, error: null as string | null })),
          catchError((err) =>
            of({
              items: [] as Transaction[],
              loading: false,
              error: (err?.error?.detail ?? err?.message ?? 'Failed to load transactions.') as
                | string
                | null,
            }),
          ),
          startWith({ items: [] as Transaction[], loading: true, error: null as string | null }),
        );
      }),
    ),
    {
      initialValue: {
        items: [] as Transaction[],
        loading: true,
        error: null as string | null,
      },
    },
  );

  constructor() {
    // Amount is user-entered. We don't auto-suggest from quantity.
  }

  protected onSubmit(): void {
    if (this.createForm.invalid || this.submitting()) {
      return;
    }
    this.submitting.set(true);
    this.formError.set(null);

    const v = this.createForm.getRawValue();
    const editing = this.editingId();

    const request$ = editing
      ? this.service.update(editing, {
          quantity: v.quantity!,
          amount: v.amount!,
          transactionDate: v.transactionDate,
          notes: v.notes?.trim() || null,
        } satisfies UpdateTransactionRequest)
      : this.service.create({
          dailyItemId: v.dailyItemId!,
          quantity: v.quantity!,
          amount: v.amount!,
          transactionDate: v.transactionDate,
          notes: v.notes?.trim() || null,
        } satisfies CreateTransactionRequest);

    request$.pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: () => {
        this.resetForm();
        this.refresh$.next();
      },
      error: (err) => {
        this.formError.set(err?.error?.detail ?? err?.message ?? 'Failed to save transaction.');
      },
    });
  }

  protected startEdit(t: Transaction): void {
    this.editingId.set(t.id);
    this.formError.set(null);
    this.createForm.setValue({
      dailyItemId: t.dailyItemId,
      quantity: t.quantity,
      amount: t.amount,
      transactionDate: t.transactionDate,
      notes: t.notes ?? '',
    });
    // Item cannot change on edit (API doesn't accept it on PUT).
    this.createForm.controls.dailyItemId.disable({ emitEvent: false });
  }

  protected cancelEdit(): void {
    this.resetForm();
  }

  protected onDelete(t: Transaction): void {
    if (this.deletingId() || this.submitting()) return;
    if (!confirm(`Delete this ${t.dailyItemName} transaction for ₹${t.amount}?`)) return;

    this.deletingId.set(t.id);
    this.formError.set(null);

    this.service
      .delete(t.id)
      .pipe(finalize(() => this.deletingId.set(null)))
      .subscribe({
        next: () => {
          // If we were editing this exact row, drop edit mode.
          if (this.editingId() === t.id) this.resetForm();
          this.refresh$.next();
        },
        error: (err) => {
          this.formError.set(err?.error?.detail ?? err?.message ?? 'Failed to delete transaction.');
        },
      });
  }

  private resetForm(): void {
    this.editingId.set(null);
    this.createForm.controls.dailyItemId.enable({ emitEvent: false });
    this.createForm.reset({
      dailyItemId: null,
      quantity: null,
      amount: null,
      transactionDate: toIsoDate(new Date()),
      notes: '',
    });
  }

  protected total(items: readonly Transaction[]): number {
    return items.reduce((sum, t) => sum + t.amount, 0);
  }
}

// Returns first and last day of the calendar month containing `d`, as YYYY-MM-DD.
function monthRange(d: Date): { from: string; to: string } {
  const y = d.getFullYear();
  const m = d.getMonth();
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);
  return { from: toIsoDate(first), to: toIsoDate(last) };
}

function toIsoDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
