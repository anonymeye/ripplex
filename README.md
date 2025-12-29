# Ripple

A re-frame inspired state management library for TypeScript.

## Packages

This is a monorepo containing the following packages:

- **`@ripple/core`** - Core state management library (framework-agnostic)
- **`@ripple/react`** - React bindings for Ripple
- **`@ripple/angular`** - Angular bindings for Ripple

## Structure

```
ripple/
├── packages/
│   ├── ripple/          # Core package (@ripple/core)
│   ├── ripple-react/    # React bindings (@ripple/react)
│   └── ripple-angular/  # Angular bindings (@ripple/angular)
├── examples/
│   ├── react-app/       # Example React application
│   └── angular-app/     # Example Angular application
└── package.json         # Root workspace configuration
```

## Getting Started

### Installation

```bash
# Core package (required)
npm install @ripple/core

# Framework bindings (choose one or both)
npm install @ripple/react      # For React
npm install @ripple/angular    # For Angular
```

### Core Usage

```typescript
import { createStore } from '@ripple/core'

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
import { createStore } from '@ripple/core'
import { StoreProvider, useStoreState, useDispatch } from '@ripple/react'

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

