import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AdminSummary, UserSummary } from './admin.models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/admin`;

  getSummary(year: number, month: number): Observable<AdminSummary> {
    return this.http.get<AdminSummary>(`${this.baseUrl}/summary/${year}/${month}`);
  }

  getUsers(): Observable<UserSummary[]> {
    return this.http.get<UserSummary[]>(`${this.baseUrl}/users`);
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
