import { ComponentFixture, TestBed } from '@angular/core/testing';
import {HttpClient} from '@angular/common/http';
import { Adminlogin } from './adminlogin';
import { Injectable } from '@angular/core';
 @Injectable({providedIn:'root'})
 export class adminloginService{
  constructor(private http:HttpClient){}
 uri="http://localhost:5233/api/user/login";
 registerUri="http://localhost:5233/api/user/register";

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
