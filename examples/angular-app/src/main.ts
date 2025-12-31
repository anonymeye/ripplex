import { bootstrapApplication } from '@angular/platform-browser';
import { provideRippleStore } from '@rplx/angular';
import { AppComponent } from './app/app.component';
import { store } from './store/store';
import { StoreAPI } from '@rplx/core';
import { AppState } from './store/types';

// Bootstrap the Angular application with Ripple store
// Type assertion needed until @rplx/angular package is rebuilt with updated types
// After rebuilding the package, this assertion can be removed
bootstrapApplication(AppComponent, {
  providers: [
    provideRippleStore(store as unknown as StoreAPI<AppState>)
  ]
}).catch(err => console.error(err));

