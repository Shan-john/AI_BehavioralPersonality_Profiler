import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({providedIn:'root'})
 export class adminloginService{
  constructor(private http:HttpClient){}
 uri = `${environment.apiUrl}/user/login`;
 registerUri = `${environment.apiUrl}/user/register`;

  adminLogin(email: string, password: string) {
    const body = { email: email, password: password };
    return this.http.post(this.uri, body);
  }

  adminRegister(email: string, password: string) {
    const body = { email: email, password: password };
    return this.http.post(this.registerUri, body);
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('isAdminLoggedIn') === 'true';
  }

  logout() {
    localStorage.removeItem('isAdminLoggedIn');
  }
 }
