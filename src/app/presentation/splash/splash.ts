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
       let getProfile = this.splashService.getProfile(parseInt(localStorage.getItem("id")!));
       if(getProfile){
         this.status = localStorage.getItem("loginStatus")=="true";
       }
     else{
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
