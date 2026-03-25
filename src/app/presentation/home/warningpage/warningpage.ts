import { Component } from '@angular/core';
import { Imagelogo } from '../../../assests/logo';
import { Router } from '@angular/router';
 
@Component({
  selector: 'app-warningpage',
  imports: [],
  templateUrl: './warningpage.html',
})
export class Warningpage {
infoIcon  = Imagelogo

constructor(private router: Router) {}


go_back_dashboard(){
  this.router.navigate(['/home'])
}
go_to_testpage(   ){
  this.router.navigate(['/home/warningpage/testpage'])}
}
