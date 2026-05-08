import { ComponentFixture, TestBed } from '@angular/core/testing';
import {HttpClient} from '@angular/common/http';
import { Adminlogin } from './adminlogin';
import { Injectable } from '@angular/core';
 @Injectable({providedIn:'root'})
 export class adminloginService{
  constructor(private http:HttpClient){}
 uri="http://localhost:5233/api/user/login";
  adminLogin(email: string, password: string) {
    const body = { email: email, password: password };
    return this.http.post(this.uri, body);
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('isAdminLoggedIn') === 'true';
  }

  logout() {
    localStorage.removeItem('isAdminLoggedIn');
  }
 }
