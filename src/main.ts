import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

window.addEventListener('error', (event) => {
  document.body.innerHTML += `<div style="color:red; padding:20px; z-index:9999; position:absolute; top:0; background:white;"><h3>Global Error</h3><pre>${event.error?.stack || event.message}</pre></div>`;
});

bootstrapApplication(App, appConfig).catch((err) => {
  document.body.innerHTML = `<div style="color:red; padding:20px;"><h3>Bootstrap Error</h3><pre>${err.stack || err}</pre></div>`;
});
