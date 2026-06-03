import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CreateDailyItemRequest, DailyItem, UpdateDailyItemRequest } from './daily-item.models';

@Injectable({ providedIn: 'root' })
export class DailyItemsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/dailyitems`;

  getAll(): Observable<DailyItem[]> {
    return this.http.get<DailyItem[]>(this.baseUrl);
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
