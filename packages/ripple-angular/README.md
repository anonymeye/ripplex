# @ripple/angular

Angular bindings for Ripple state management library using Angular Signals.

## Installation

```bash
npm install @ripple/angular @ripple/core
```

## Usage

### 1. Setup Store Provider

In your `main.ts` or module:

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRippleStore } from '@ripple/angular';
import { createStore } from '@ripple/core';
import { AppComponent } from './app.component';

const store = createStore<AppState>({
  initialState: { /* ... */ }
});

bootstrapApplication(AppComponent, {
  providers: [
    provideRippleStore(store)
  ]
});
```

### 2. Use in Components

```typescript
import { Component, computed } from '@angular/core';
import { injectStoreState, injectDispatch } from '@ripple/angular';

@Component({
  selector: 'app-counter',
  template: `
    <div>
      <p>Count: {{ count() }}</p>
      <button (click)="increment()">Increment</button>
    </div>
  `
})
export class CounterComponent {
  private dispatch = injectDispatch();
  private state = injectStoreState<AppState>();
  
  count = computed(() => this.state().counter.count);
  
  increment() {
    this.dispatch('counter/increment');
  }
}
```

## API

### `provideRippleStore<State>(store: StoreAPI<State>)`

Provider function to configure the Ripple store for dependency injection. The store should be created using `createStore()` from `@ripple/core`.

### `injectStoreState<State>()`

Returns a signal containing the current store state.

### `injectDispatch()`

Returns the dispatch function to send events to the store.

### `RippleStoreService<State>`

The underlying service that wraps the store. You can inject this directly if needed.

