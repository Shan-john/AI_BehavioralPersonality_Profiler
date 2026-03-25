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
constructor(private router: Router) {}
  login(){
    this.router.navigate(['/signup'])
  }

  navigat_to_warningpage(){
    this.router.navigate(['/home/warningpage'])
  }
}
