import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { catchError, map, of, startWith } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { DailyItemsService } from '../../../core/items/daily-items.service';
import { DailyItem } from '../../../core/items/daily-item.models';

@Component({
  selector: 'app-items-list',
  imports: [],
  templateUrl: './items-list.html',
  styleUrl: './items-list.scss',
})
export class ItemsList {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly itemsService = inject(DailyItemsService);

  protected readonly user = this.auth.user;

  protected readonly state = toSignal(
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
    { requireSync: true },
  );

  protected async logout(): Promise<void> {
    this.auth.logout();
    await this.router.navigate(['/login']);
  }
}
