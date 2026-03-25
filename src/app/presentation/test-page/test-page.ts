import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Imagelogo } from '../../assests/logo';
@Component({
  selector: 'app-test-page',
  standalone: true,
  imports: [CommonModule,  ],
  templateUrl: './test-page.html',
  
})
export class TestPage {
  logo:string = Imagelogo;
  progress:number = 60;
}
