# Angular Example App

This example demonstrates how to use Ripplex state management with Angular using Signals.

## Features

- **Counter Component**: Simple synchronous state updates
- **Todo List Component**: Complex state management with arrays and filtering
- **Async Example Component**: Async operations with effects

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the packages:
```bash
npm run build --workspace=@rplx/core
npm run build --workspace=@rplx/angular
```

3. Start the development server:
```bash
cd examples/angular-app
npm start
```

## Usage

The app uses Angular Signals to reactively update components when the store state changes.

### Example Component

```typescript
import { Component, computed } from '@angular/core';
import { injectStoreState, injectDispatch } from '@rplx/angular';

@Component({
  selector: 'app-example',
  standalone: true,
  template: `<p>Count: {{ count() }}</p>`
})
export class ExampleComponent {
  private state = injectStoreState<AppState>();
  private dispatch = injectDispatch();
  
  count = computed(() => this.state().counter.count);
  
  increment() {
    this.dispatch('counter/increment');
  }
}
```

## Architecture

- **Store Setup**: `src/store/` contains the store configuration, events, and effects
- **Components**: `src/app/components/` contains example components
- **Signals Integration**: State is exposed as Angular Signals for reactive updates

