import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { Splash } from './presentation/splash/splash';
 


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,  ],
  templateUrl: './app.html'
})
export class App {
  protected readonly title = signal('AI_BehavioralPersonality_Profiler');
  public showSplash = true;

  constructor() {
    setTimeout(() => {
      this.showSplash = false;
    }, 5000);
  }
}
