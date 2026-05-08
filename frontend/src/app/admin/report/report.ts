import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdminHomepageService } from '../admin-homepage/admin-homepageService';

@Component({
  selector: 'app-report',
  imports: [],
  templateUrl: './report.html',
})
export class Report implements OnInit {

  users = signal<any[]>([]);
report: string = '';
email:string = '';
id:string = '';
constructor(private route: ActivatedRoute, private adminService: AdminHomepageService) {}
ngOnInit() {

  this.report = decodeURIComponent(
    this.route.snapshot.paramMap.get('report') || ''
  );

  this.email = decodeURIComponent(
    this.route.snapshot.paramMap.get('email') || ''
  );

  this.id = decodeURIComponent(
    this.route.snapshot.paramMap.get('id') || ''
  );

  // this.adminService.getAllUsers().subscribe((res: any) => {
  //   this.users.set(res.filter((u: any) => u.report && u.report.length > 0));
  // });
  // const filteredUsers = this.users().filter(
  //   (user: any) => user.email !== 'admin@gmail.com'
  // );

  
  //  this.users.set(filteredUsers);
}
 
}
