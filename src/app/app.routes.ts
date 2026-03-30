import { Routes } from '@angular/router';
 
import { Home } from './presentation/home/home';
import { Splash } from './presentation/splash/splash';
import { Component } from '@angular/core';
import { SignUp } from './presentation/sign-up/sign-up';
 
import { TestPage } from './presentation/test-page/test-page';

export const routes: Routes = [
     { path: '', component: Splash },
     { path: 'home', component:  Home },
     {path : 'signup',component:SignUp},
    
     {path: 'home/testpage',component:TestPage}
];
