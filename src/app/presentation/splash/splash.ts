import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Imagelogo } from '../../assests/logo';
   import { SplashService } from './splashService';

@Component({
  selector: 'app-splash',
  imports: [ ],
  templateUrl: './splash.html',
})

export class Splash implements OnInit {

 constructor(private router: Router,private splashService: SplashService) {}
  logo:string = Imagelogo;

    status:boolean = false;
  ngOnInit(): void {
    const userIdStr = localStorage.getItem("id");
    const loginStatus = localStorage.getItem("loginStatus");

    if (userIdStr && userIdStr !== "undefined" && userIdStr !== "null" && loginStatus === "true") {
      const id = parseInt(userIdStr);
      if (!isNaN(id)) {
        this.status = true;
      } else {
        this.status = false;
        localStorage.removeItem("id");
        localStorage.setItem("loginStatus", "false");
      }
    } else {
      this.status = false;
    }
     
    setTimeout(() => {
       if(this.status){
         this.router.navigate(['/home']);
       }else{
        this.router.navigate(['/signup'])
       }
     
    }, 5000);
  }
}
