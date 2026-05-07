import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RecoveryAction, RecoveryActionRequest, RecoveryActionListResponse } from '../models/recovery-action.model';

@Injectable({ providedIn: 'root' })
export class RecoveryActionService {
  private apiUrl = `${environment.apiUrl}/recovery-actions`;

  constructor(private http: HttpClient) {}

  getAll(params?: { page?: number; limit?: number; invoice?: string; status?: string }): Observable<RecoveryActionListResponse> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.limit) httpParams = httpParams.set('limit', params.limit);
    if (params?.invoice) httpParams = httpParams.set('invoice', params.invoice);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    return this.http.get<RecoveryActionListResponse>(this.apiUrl, { params: httpParams });
  }

  getById(id: string): Observable<{ success: boolean; action: RecoveryAction }> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(data: RecoveryActionRequest): Observable<{ success: boolean; action: RecoveryAction }> {
    return this.http.post<any>(this.apiUrl, data);
  }

  update(id: string, data: Partial<RecoveryActionRequest>): Observable<{ success: boolean; action: RecoveryAction }> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
