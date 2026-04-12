import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminHomepageService } from './admin-homepageService';
import { UserModel } from '../../model/userModel';
import { adminloginService } from '../adminlogin/adminloginservice';

@Component({
  selector: 'app-admin-homepage',
  imports: [CommonModule],
  templateUrl: './admin-homepage.html',
})
export class AdminHomepage implements OnInit {
  users = signal<UserModel[]>([]);
  
  constructor(
    private router: Router, 
    private adminHomepageService: AdminHomepageService,
    private adminLoginService: adminloginService
  ) {}

  ngOnInit() : void {
  // Check if actually logged in (extra safety if accessed directly)
  if (!this.adminLoginService.isLoggedIn()) {
    this.router.navigate(['/admin/adminlogin']);
    return;
  }
   this.adminHomepageService.getAllUsers().subscribe((res: any) => {
  // ✅ Signal set for reactivity in Zoneless mode
  const filteredUsers = res.filter(
    (user: any) => user.email !== 'admin@gmail.com'
  );
  this.users.set(filteredUsers);

  console.log(this.users());
})
}


openReport( report:string,email:string,id:string){
  this.router.navigate(['/admin/report',encodeURIComponent(report),encodeURIComponent(email),encodeURIComponent(id)]);
   
}

logout() {
  this.adminLoginService.logout();
  this.router.navigate(['/admin/adminlogin']);
}
}
