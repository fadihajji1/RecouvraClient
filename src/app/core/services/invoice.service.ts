import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Invoice, InvoiceRequest, InvoiceListResponse } from '../models/invoice.model';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private apiUrl = `${environment.apiUrl}/invoices`;

  constructor(private http: HttpClient) {}

  getAll(params?: { page?: number; limit?: number; status?: string; client?: string }): Observable<InvoiceListResponse> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.limit) httpParams = httpParams.set('limit', params.limit);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.client) httpParams = httpParams.set('client', params.client);
    return this.http.get<InvoiceListResponse>(this.apiUrl, { params: httpParams });
  }

  getById(id: string): Observable<{ success: boolean; invoice: Invoice }> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(data: InvoiceRequest): Observable<{ success: boolean; invoice: Invoice }> {
    return this.http.post<any>(this.apiUrl, data);
  }

  update(id: string, data: Partial<InvoiceRequest>): Observable<{ success: boolean; invoice: Invoice }> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  updateStatus(id: string, status: string): Observable<{ success: boolean; invoice: Invoice }> {
    return this.http.put<any>(`${this.apiUrl}/${id}/status`, { status });
  }

  delete(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
