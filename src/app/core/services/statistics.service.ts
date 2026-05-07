import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StatisticsService {
  private apiUrl = `${environment.apiUrl}/statistics`;

  constructor(private http: HttpClient) {}

  getStatistics(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getMonthlyStatistics(year?: number): Observable<any> {
    const url = year ? `${this.apiUrl}/monthly?year=${year}` : `${this.apiUrl}/monthly`;
    return this.http.get<any>(url);
  }
}
