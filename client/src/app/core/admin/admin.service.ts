import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PagedResult } from '../common/paged-result';
import { AdminSummary, UserSummary } from './admin.models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/admin`;

  getSummary(year: number, month: number): Observable<AdminSummary> {
    return this.http.get<AdminSummary>(`${this.baseUrl}/summary/${year}/${month}`);
  }

  /** Paged listing. Defaults match the backend (page 1, large pageSize) so
   *  callers that don't care about pagination still get every row. */
  getUsers(page = 1, pageSize = 500): Observable<PagedResult<UserSummary>> {
    const params = new HttpParams().set('page', String(page)).set('pageSize', String(pageSize));
    return this.http.get<PagedResult<UserSummary>>(`${this.baseUrl}/users`, { params });
  }

  assignRole(userId: string, role: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/users/${userId}/role`, { role });
  }

  changePassword(userId: string, newPassword: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/users/${userId}/password`, { newPassword });
  }

  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/${userId}`);
  }
}
