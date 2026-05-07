import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Payment, PaymentRequest, PaymentListResponse } from '../models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  getAll(params?: { page?: number; limit?: number; invoice?: string; paymentMethod?: string }): Observable<PaymentListResponse> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.limit) httpParams = httpParams.set('limit', params.limit);
    if (params?.invoice) httpParams = httpParams.set('invoice', params.invoice);
    if (params?.paymentMethod) httpParams = httpParams.set('paymentMethod', params.paymentMethod);
    return this.http.get<PaymentListResponse>(this.apiUrl, { params: httpParams });
  }

  getById(id: string): Observable<{ success: boolean; payment: Payment }> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(data: PaymentRequest): Observable<{ success: boolean; payment: Payment }> {
    return this.http.post<any>(this.apiUrl, data);
  }

  update(id: string, data: Partial<PaymentRequest>): Observable<{ success: boolean; payment: Payment }> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
