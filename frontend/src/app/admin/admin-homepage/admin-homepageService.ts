import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminHomepageService {
  apiurl = `${environment.apiUrl}/user/all`;
  reportUrl = `${environment.apiUrl}/report`;

  constructor(private http: HttpClient) {}

  getAllUsers() {
    return this.http.get(this.apiurl);
  }

  getReportByUserId(userId: number) {
    return this.http.get(`${this.reportUrl}/user/${userId}`);
  }
}