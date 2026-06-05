import { Component, computed, effect, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  finalize,
  map,
  of,
  startWith,
  switchMap,
} from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { DEFAULT_PAGE_SIZE } from '../../../core/common/paged-result';
import { DailyItemsService } from '../../../core/items/daily-items.service';
import {
  DailyItem,
  CreateDailyItemRequest,
  UpdateDailyItemRequest,
} from '../../../core/items/daily-item.models';
import { Pagination } from '../../../shared/pagination/pagination';

@Component({
  selector: 'app-items-list',
  imports: [ReactiveFormsModule, Pagination],
  templateUrl: './items-list.html',
  styleUrl: './items-list.scss',
})
export class ItemsList {
  private readonly itemsService = inject(DailyItemsService);
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  protected readonly isAdmin = computed(() => this.auth.user()?.role === 'Admin');

  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  protected readonly page = signal(1);
  protected readonly pageSize = signal<number>(DEFAULT_PAGE_SIZE);
  private readonly page$ = toObservable(this.page);
  private readonly pageSize$ = toObservable(this.pageSize);

  protected readonly state = toSignal(
    combineLatest([this.refresh$, this.page$, this.pageSize$]).pipe(
      switchMap(([, page, pageSize]) =>
        this.itemsService.getPaged(page, pageSize).pipe(
          map((res) => ({
            items: res.items,
            totalCount: res.totalCount,
            loading: false,
            error: null as string | null,
          })),
          catchError((err) =>
            of({
              items: [] as DailyItem[],
              totalCount: 0,
              loading: false,
              error: (err?.message ?? 'Failed to load items.') as string | null,
            }),
          ),
          startWith({
            items: [] as DailyItem[],
            totalCount: 0,
            loading: true,
            error: null as string | null,
          }),
        ),
      ),
    ),
    {
      initialValue: {
        items: [] as DailyItem[],
        totalCount: 0,
        loading: true,
        error: null as string | null,
      },
    },
  );

  protected readonly submitting = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly deletingId = signal<number | null>(null);
  protected readonly deleteError = signal<string | null>(null);
  protected readonly editingId = signal<number | null>(null);
  protected readonly savingId = signal<number | null>(null);
  protected readonly editError = signal<string | null>(null);

  protected onPageChange(p: number): void {
    this.page.set(p);
  }

  protected onPageSizeChange(s: number): void {
    this.pageSize.set(s);
    this.page.set(1);
  }

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(128)]],
    unit: ['', [Validators.maxLength(32)]],
    defaultPrice: this.fb.control<number | null>(null, {
      validators: [Validators.min(0), Validators.max(1_000_000)],
    }),
  });

  protected readonly editForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(128)]],
    unit: ['', [Validators.maxLength(32)]],
    defaultPrice: this.fb.control<number | null>(null, {
      validators: [Validators.min(0), Validators.max(1_000_000)],
    }),
  });

  constructor() {
    effect(() => {
      if (this.isAdmin()) {
        this.form.enable({ emitEvent: false });
      } else {
        this.form.disable({ emitEvent: false });
      }
    });
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.submitting()) {
      return;
    }
    this.submitting.set(true);
    this.formError.set(null);

    const v = this.form.getRawValue();
    const body: CreateDailyItemRequest = {
      name: v.name.trim(),
      unit: v.unit?.trim() || null,
      defaultPrice: v.defaultPrice ?? null,
    };

    this.itemsService
      .create(body)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.form.reset();
          this.refresh$.next();
        },
        error: (err) => {
          this.formError.set(err?.message ?? 'Failed to create item.');
        },
      });
  }

  protected onDelete(item: DailyItem): void {
    if (this.deletingId() !== null) {
      return;
    }
    const ok = window.confirm(`Delete "${item.name}"?`);
    if (!ok) {
      return;
    }
    this.deletingId.set(item.id);
    this.deleteError.set(null);

    this.itemsService
      .delete(item.id)
      .pipe(finalize(() => this.deletingId.set(null)))
      .subscribe({
        next: () => this.refresh$.next(),
        error: (err) => {
          this.deleteError.set(err?.message ?? 'Failed to delete item.');
        },
      });
  }

  protected startEdit(item: DailyItem): void {
    this.editError.set(null);
    this.editingId.set(item.id);
    this.editForm.reset({
      name: item.name,
      unit: item.unit ?? '',
      defaultPrice: item.defaultPrice,
    });
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
    this.editError.set(null);
  }

  protected saveEdit(item: DailyItem): void {
    if (this.editForm.invalid || this.savingId() !== null) {
      return;
    }
    const v = this.editForm.getRawValue();
    const body: UpdateDailyItemRequest = {
      name: v.name.trim(),
      unit: v.unit?.trim() || null,
      defaultPrice: v.defaultPrice ?? null,
    };

    this.savingId.set(item.id);
    this.editError.set(null);

    this.itemsService
      .update(item.id, body)
      .pipe(finalize(() => this.savingId.set(null)))
      .subscribe({
        next: () => {
          this.editingId.set(null);
          this.refresh$.next();
        },
        error: (err) => {
          this.editError.set(err?.error?.detail ?? err?.message ?? 'Failed to save item.');
        },
      });
  }
}
