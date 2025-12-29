# @ripple/react

React bindings for Ripple state management library.

## Installation

```bash
npm install @ripple/core @ripple/react
```

## Usage

```tsx
import { createStore } from '@ripple/core'
import { StoreProvider, useStoreState, useDispatch } from '@ripple/react'

// Create your store
const store = createStore({
  initialState: { count: 0 }
})

// Wrap your app with StoreProvider
function App() {
  return (
    <StoreProvider store={store}>
      <Counter />
    </StoreProvider>
  )
}

// Use hooks in components
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

## API

### `StoreProvider`

Provider component that makes the store available to all child components.

**Props:**
- `store: StoreAPI<State>` - The store instance (created with `createStore()`)
- `children: ReactNode` - Child components

### `useStoreState<State>()`

Hook that subscribes to store state changes and returns the current state. Component will re-render when state changes.

**Returns:** `State` - The current store state

### `useDispatch<Payload>()`

Hook that returns a memoized dispatch function for dispatching events.

**Returns:** `(eventKey: string, payload?: Payload) => Promise<void>`

### `useStore<State>()`

Hook that returns the store instance directly.

**Returns:** `StoreAPI<State>` - The store instance (created with `createStore()`)

