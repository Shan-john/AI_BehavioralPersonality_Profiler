import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignUp } from './sign-up';
  import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class register {

  private registerApiUrl = 'http://localhost:5233/api/user/register'; // adjust if needed
  private loginApiUrl = 'http://localhost:5233/api/user/login'; // adjust if needed

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