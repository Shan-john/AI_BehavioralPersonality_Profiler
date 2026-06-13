import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserModel } from '../../model/userModel';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SignUpService {
  private registerApiUrl = `${environment.apiUrl}/user/register`;
  private loginApiUrl = `${environment.apiUrl}/user/login`;

  constructor(private http: HttpClient) {}

  userRegister(email: string, password: string) {
    const body = { email: email, password: password };
    return this.http.post(this.registerApiUrl, body);
  }

  userLogin(email: string, password: string) {
    const body = { email: email, password: password };
    return this.http.post(this.loginApiUrl, body);
  }
}