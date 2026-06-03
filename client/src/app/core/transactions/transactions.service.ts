import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  CreateTransactionRequest,
  MonthlySummary,
  Transaction,
  UpdateTransactionRequest,
} from './transaction.models';

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/transactions`;

  getRange(from: string, to: string, userId?: string | null): Observable<Transaction[]> {
    let params = new HttpParams().set('from', from).set('to', to);
    if (userId) {
      params = params.set('userId', userId);
    }
    return this.http.get<Transaction[]>(this.baseUrl, { params });
  }

  getById(id: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.baseUrl}/${id}`);
  }

  getMonthlySummary(year: number, month: number): Observable<MonthlySummary> {
    return this.http.get<MonthlySummary>(`${this.baseUrl}/summary/${year}/${month}`);
  }

  create(body: CreateTransactionRequest): Observable<Transaction> {
    return this.http.post<Transaction>(this.baseUrl, body);
  }

  update(id: string, body: UpdateTransactionRequest): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.baseUrl}/${id}`, body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
