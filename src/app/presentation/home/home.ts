import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Imagelogo } from '../../assests/logo';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
})
export class Home {
  logo:string = Imagelogo;
  public homename = "parayilhome";
   logininfo:String | null= localStorage.getItem("loginStatus");
constructor(private router: Router) {}
  login(){
    this.router.navigate(['/signup'])
  }
  logout(){
    localStorage.setItem("loginStatus","false")
    this.router.navigate(['/signup'])
  }
   
  go_back_dashboard(){
  this.router.navigate(['/home'])
}
go_to_testpage(   ){
  this.router.navigate(['/home/testpage'])}
}
