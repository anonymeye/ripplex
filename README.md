# Ripplex

A re-frame inspired state management library for TypeScript.

## Packages

This is a monorepo containing the following packages:

- **`@rplx/core`** - Core state management library (framework-agnostic)
- **`@rplx/react`** - React bindings for Ripplex
- **`@rplx/angular`** - Angular bindings for Ripplex

## Structure

```
ripplex/
├── packages/
│   ├── ripple/          # Core package (@rplx/core)
│   ├── ripple-react/    # React bindings (@rplx/react)
│   └── ripple-angular/  # Angular bindings (@rplx/angular)
├── examples/
│   ├── react-app/       # Example React application
│   └── angular-app/     # Example Angular application
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
  return [{ count: context.db.count + 1 }, {}]
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

## Development

This project uses npm workspaces. To work on the packages:

```bash
# Install all dependencies
npm install

# Build all packages
npm run build

# Run example app
cd examples/react-app
npm run dev
```

## License

MIT

