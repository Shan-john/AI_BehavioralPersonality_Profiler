import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Imagelogo } from '../../assests/logo';
   

@Component({
  selector: 'app-splash',
  imports: [ ],
  templateUrl: './splash.html',
})

export class Splash implements OnInit {

 constructor(private router: Router) {}
  logo:string = Imagelogo;


  ngOnInit(): void {
      let status = true;
    setTimeout(() => {
       if(status){
         this.router.navigate(['/home']);
       }else{
        this.router.navigate(['/signup'])
       }
     
    }, 5000);
  }
}
