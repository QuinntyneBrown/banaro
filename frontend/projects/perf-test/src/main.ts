import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { Renderer } from './renderer';

bootstrapApplication(Renderer, { providers: [provideRouter([])] }).catch((err) => {
  window.__perfError = String(err);
  document.body.dataset['perfStatus'] = 'error';
});
