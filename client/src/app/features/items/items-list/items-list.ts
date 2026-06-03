import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BehaviorSubject, catchError, finalize, map, of, startWith, switchMap } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { DailyItemsService } from '../../../core/items/daily-items.service';
import { DailyItem, CreateDailyItemRequest } from '../../../core/items/daily-item.models';

@Component({
  selector: 'app-items-list',
  imports: [ReactiveFormsModule],
  templateUrl: './items-list.html',
  styleUrl: './items-list.scss',
})
export class ItemsList {
  private readonly itemsService = inject(DailyItemsService);
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  protected readonly isAdmin = computed(() => this.auth.user()?.role === 'Admin');

  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  protected readonly state = toSignal(
    this.refresh$.pipe(
      switchMap(() =>
        this.itemsService.getAll().pipe(
          map((items) => ({ items, loading: false, error: null as string | null })),
          catchError((err) =>
            of({
              items: [] as DailyItem[],
              loading: false,
              error: (err?.message ?? 'Failed to load items.') as string | null,
            }),
          ),
          startWith({ items: [] as DailyItem[], loading: true, error: null as string | null }),
        ),
      ),
    ),
    { requireSync: true },
  );

  protected readonly submitting = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly deletingId = signal<number | null>(null);
  protected readonly deleteError = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
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
}
