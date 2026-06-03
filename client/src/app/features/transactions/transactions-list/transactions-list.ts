import { Component, inject, signal } from '@angular/core';
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
} from '../../../core/transactions/transaction.models';

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

  private readonly defaults = monthRange(new Date());
  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  // Items dropdown — load once.
  protected readonly items = toSignal(
    this.itemsService.getAll().pipe(catchError(() => of([] as DailyItem[]))),
    { initialValue: [] as DailyItem[] },
  );

  protected readonly filterForm = this.fb.nonNullable.group({
    from: [this.defaults.from, [Validators.required]],
    to: [this.defaults.to, [Validators.required]],
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

  protected readonly state = toSignal(
    combineLatest([
      this.filterForm.valueChanges.pipe(startWith(this.filterForm.getRawValue())),
      this.refresh$,
    ]).pipe(
      debounceTime(250),
      switchMap(([{ from, to }]) => {
        if (!from || !to || from > to) {
          return of({
            items: [] as Transaction[],
            loading: false,
            error: 'Invalid date range.' as string | null,
          });
        }
        return this.service.getRange(from, to).pipe(
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
    // Auto-suggest amount when item or quantity changes — user can still override.
    this.createForm.controls.dailyItemId.valueChanges.subscribe(() => this.suggestAmount());
    this.createForm.controls.quantity.valueChanges.subscribe(() => this.suggestAmount());
  }

  private suggestAmount(): void {
    const id = this.createForm.controls.dailyItemId.value;
    const qty = this.createForm.controls.quantity.value;
    const item = this.items().find((i) => i.id === id);
    if (!item || item.defaultPrice === null || !qty) {
      return;
    }
    const suggested = Number((item.defaultPrice * qty).toFixed(2));
    this.createForm.controls.amount.setValue(suggested, { emitEvent: false });
  }

  protected onSubmit(): void {
    if (this.createForm.invalid || this.submitting()) {
      return;
    }
    this.submitting.set(true);
    this.formError.set(null);

    const v = this.createForm.getRawValue();
    const body: CreateTransactionRequest = {
      dailyItemId: v.dailyItemId!,
      quantity: v.quantity!,
      amount: v.amount!,
      transactionDate: v.transactionDate,
      notes: v.notes?.trim() || null,
    };

    this.service
      .create(body)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.createForm.reset({
            dailyItemId: null,
            quantity: null,
            amount: null,
            transactionDate: toIsoDate(new Date()),
            notes: '',
          });
          this.refresh$.next();
        },
        error: (err) => {
          this.formError.set(
            err?.error?.detail ?? err?.message ?? 'Failed to create transaction.',
          );
        },
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
