import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PagedResult } from '../common/paged-result';
import { CreateDailyItemRequest, DailyItem, UpdateDailyItemRequest } from './daily-item.models';

@Injectable({ providedIn: 'root' })
export class DailyItemsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/dailyitems`;

  /** Unpaged — used by the transactions item picker (needs the whole list). */
  getAll(): Observable<DailyItem[]> {
    return this.http.get<DailyItem[]>(this.baseUrl);
  }

  /** Paged — used by the items management page. */
  getPaged(page = 1, pageSize = 500): Observable<PagedResult<DailyItem>> {
    const params = new HttpParams().set('page', String(page)).set('pageSize', String(pageSize));
    return this.http.get<PagedResult<DailyItem>>(`${this.baseUrl}/paged`, { params });
  }

  create(body: CreateDailyItemRequest): Observable<DailyItem> {
    return this.http.post<DailyItem>(this.baseUrl, body);
  }

  update(id: number, body: UpdateDailyItemRequest): Observable<DailyItem> {
    return this.http.put<DailyItem>(`${this.baseUrl}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
