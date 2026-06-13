import { Routes } from '@angular/router';
 
import { Home } from './presentation/home/home';
import { Splash } from './presentation/splash/splash';
import { Component } from '@angular/core';
import { SignUp } from './presentation/sign-up/sign-up';
 
import { TestPage } from './presentation/test-page/test-page';
import { Settings } from './presentation/settings/settings';
import { Adminlogin } from './admin/adminlogin/adminlogin';
import { AdminHomepage } from './admin/admin-homepage/admin-homepage';
import { adminGuard } from './admin/admin.guard';
import { Report } from './admin/report/report';

export const routes: Routes = [
     { path: '', component: Splash },
     { path: 'home', component:  Home },
     {path : 'signup',component:SignUp},
     {path : 'admin/adminlogin',component:Adminlogin},
     {path: 'admin', redirectTo: 'admin/admin-homepage', pathMatch: 'full'},
     {path:'admin/admin-homepage',component:AdminHomepage, canActivate: [adminGuard]},
     {path:'admin/report/:id/:email', component: Report, canActivate: [adminGuard]},
     {path: 'home/testpage',component:TestPage},
     {path: 'home/settings',component:Settings}
];