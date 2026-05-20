import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private baseUrl = 'http://localhost:5233/api/user';

  constructor(private http: HttpClient) {}

  getUserProfile(userId: number) {
    return this.http.get(`${this.baseUrl}/profile/${userId}`);
  }
}
