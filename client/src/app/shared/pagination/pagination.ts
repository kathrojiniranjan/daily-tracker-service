import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { PAGE_SIZE_OPTIONS } from '../../core/common/paged-result';

/**
 * Stateless paginator: Prev / page X of Y / Next plus a page-size selector and
 * a "Showing A–B of N" label. Pure inputs/outputs so the parent owns the state.
 */
@Component({
  selector: 'app-pagination',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
})
export class Pagination {
  readonly page = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly totalCount = input.required<number>();
  readonly disabled = input<boolean>(false);

  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();

  protected readonly sizeOptions = PAGE_SIZE_OPTIONS;

  protected readonly totalPages = computed(() => {
    const size = this.pageSize();
    const total = this.totalCount();
    return size > 0 ? Math.max(1, Math.ceil(total / size)) : 1;
  });

  protected readonly rangeStart = computed(() =>
    this.totalCount() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1,
  );

  protected readonly rangeEnd = computed(() =>
    Math.min(this.page() * this.pageSize(), this.totalCount()),
  );

  protected readonly canPrev = computed(() => !this.disabled() && this.page() > 1);
  protected readonly canNext = computed(() => !this.disabled() && this.page() < this.totalPages());

  protected prev(): void {
    if (this.canPrev()) this.pageChange.emit(this.page() - 1);
  }

  protected next(): void {
    if (this.canNext()) this.pageChange.emit(this.page() + 1);
  }

  protected onSizeChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    if (Number.isFinite(value) && value > 0) this.pageSizeChange.emit(value);
  }
}
