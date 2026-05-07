import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Client, ClientRequest } from '../models/client.model';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private apiUrl = `${environment.apiUrl}/clients`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<{ success: boolean; count: number; clients: Client[] }> {
    return this.http.get<any>(this.apiUrl);
  }

  getById(id: string): Observable<{ success: boolean; client: Client }> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(data: ClientRequest): Observable<{ success: boolean; client: Client }> {
    return this.http.post<any>(this.apiUrl, data);
  }

  update(id: string, data: Partial<ClientRequest>): Observable<{ success: boolean; client: Client }> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
