import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private baseUrl = `${environment.apiUrl}/user`;
  private reportUrl = `${environment.apiUrl}/report`;

  constructor(private http: HttpClient) {}

  getUserProfile(userId: number) {
    return this.http.get(`${this.baseUrl}/profile/${userId}`);
  }

  getReportByUserId(userId: number) {
    return this.http.get(`${this.reportUrl}/user/${userId}`);
  }
}
