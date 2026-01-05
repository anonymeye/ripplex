# Ripplex

A re-frame inspired state management library for TypeScript.

> **Status**: Currently in **v0.2.1** (pre-1.0). Core APIs are stable. See [@rplx/core README](../packages/ripplex/README.md#stability) for details.

## Packages

This is a monorepo containing the following packages:

- **`@rplx/core`** - Core state management library (framework-agnostic)
- **`@rplx/react`** - React bindings for Ripplex
- **`@rplx/angular`** - Angular bindings for Ripplex

## Structure

```
ripplex/
├── packages/
│   ├── ripplex/          # Core package (@rplx/core)
│   ├── ripplex-react/    # React bindings (@rplx/react)
│   └── ripplex-angular/  # Angular bindings (@rplx/angular)
├── examples/
│   ├── ripplex-react-example/       # Example React application
│   └── ripplex-angular-example/     # Example Angular application
└── package.json         # Root workspace configuration
```

## Getting Started

### Installation

```bash
# Core package (required)
npm install @rplx/core

# Framework bindings (choose one or both)
npm install @rplx/react      # For React
npm install @rplx/angular    # For Angular
```

### Core Usage

```typescript
import { createStore } from '@rplx/core'

const store = createStore({
  initialState: { count: 0 }
})

store.registerEvent('increment', (context, payload) => {
  return {
    db: { count: context.db.count + 1 }
  }
})

await store.dispatch('increment')
```

### React Usage

```tsx
import { createStore } from '@rplx/core'
import { StoreProvider, useStoreState, useDispatch } from '@rplx/react'

const store = createStore({ initialState: { count: 0 } })

function App() {
  return (
    <StoreProvider store={store}>
      <Counter />
    </StoreProvider>
  )
}

function Counter() {
  const state = useStoreState()
  const dispatch = useDispatch()
  
  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch('increment')}>
        Increment
      </button>
    </div>
  )
}
```

## Documentation

For detailed documentation, see the [docs](./docs/) directory:

- **[Store](./docs/store.md)** - Store creation, configuration, and state management
- **[Events](./docs/events.md)** - Event handlers, registration, and dispatching
- **[Effects](./docs/effects.md)** - Side effects, effect handlers, and built-in effects
- **[Interceptors](./docs/interceptors.md)** - Interceptor system and built-in interceptors
- **[Subscriptions](./docs/subscriptions.md)** - Subscription system for reactive state queries
- **[Error Handler](./docs/error-handler.md)** - Error handling and recovery
- **[Tracing](./docs/tracing.md)** - Event tracing and debugging

For package-specific documentation:
- [@rplx/core README](./packages/ripplex/README.md) - Core package API reference
- [@rplx/react README](./packages/ripplex-react/README.md) - React bindings
- [@rplx/angular README](./packages/ripplex-angular/README.md) - Angular bindings

## Development

This project uses npm workspaces. To work on the packages:

```bash
# Install all dependencies
npm install

# Build all packages
npm run build

# Run example app
cd examples/ripplex-react-example
npm run dev
```

## License

MIT

