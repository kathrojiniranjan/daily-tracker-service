import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AdminSummary } from './admin.models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/admin`;

  getSummary(year: number, month: number): Observable<AdminSummary> {
    return this.http.get<AdminSummary>(`${this.baseUrl}/summary/${year}/${month}`);
  }
}
