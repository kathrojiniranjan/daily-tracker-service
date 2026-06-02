import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith } from 'rxjs';

import { DailyItemsService } from '../../../core/items/daily-items.service';
import { DailyItem } from '../../../core/items/daily-item.models';

@Component({
  selector: 'app-items-list',
  imports: [],
  templateUrl: './items-list.html',
  styleUrl: './items-list.scss',
})
export class ItemsList {
  private readonly itemsService = inject(DailyItemsService);

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
}
