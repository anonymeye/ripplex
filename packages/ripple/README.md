# @rplx/core

A re-frame inspired state management library for TypeScript.

## Installation

```bash
npm install @rplx/core
```

## Usage

```typescript
import { createStore } from '@rplx/core'

// Define your state
interface AppState {
  count: number
}

// Define your coeffects (optional)
interface AppCoeffects {
  uuid: string
  now: Date
}

// Create store with coeffect providers
const store = createStore<AppState, AppCoeffects>({
  initialState: { count: 0 },
  coeffects: {
    uuid: () => crypto.randomUUID(),
    now: () => new Date()
  }
})

// Register event handlers - fully type-safe!
store.registerEvent('increment', (context, payload) => {
  // context.db is AppState
  // context.uuid is string
  // context.now is Date
  return [
    { count: context.db.count + 1 },
    {} // no effects
  ]
})

// Dispatch events
await store.dispatch('increment')

// Get state
const state = store.getState()
```

## Core Concepts

### Events
Events are dispatched to trigger state changes. Each event has a handler that receives the current state (via context) and a payload, and returns a new state and effects.

### Coeffects (Context)
Coeffects are the **inputs** to event handlers. Define your coeffect types and provide functions to compute them:

```typescript
interface MyCoeffects {
  uuid: string
  now: Date
}

const store = createStore<AppState, MyCoeffects>({
  initialState,
  coeffects: {
    uuid: () => crypto.randomUUID(),
    now: () => new Date()
  }
})

// Handlers get type-safe access
store.registerEvent('create', (context, data) => {
  const { db, uuid, now } = context  // ✅ Fully typed!
  return [newState, effects]
})
```

**Benefits:**
- ✅ Full type safety
- ✅ Easy to test (mock coeffect providers)
- ✅ Lazy evaluation

### Effects
Effects are side effects that can be triggered by event handlers. Common effects include:
- `dispatch` - Dispatch another event
- `dispatch-n` - Dispatch multiple events
- Custom effects (HTTP requests, localStorage, etc.)

### Interceptors
Interceptors wrap event handlers to add cross-cutting concerns. They have `:before` and `:after` phases that run in opposite order (like middleware):

```typescript
import { path, debug } from '@rplx/core'

store.registerEventWithInterceptors(
  'update-todo',
  [path(['todos']), debug()],
  handler
)
```

## API

### `createStore<State, Cofx>(config)`

Factory function to create a store instance. Generic over State and Coeffects.

**Parameters:**
- `config.initialState` - Initial application state
- `config.coeffects` - Optional coeffect providers
- `config.tracing` - Optional tracing configuration

**Returns:** A store instance with the following methods:
- `registerEventDb<Payload>(eventKey, handler, interceptors?)` - Register an event handler that returns state
- `registerEvent<Payload>(eventKey, handler, interceptors?)` - Register an event handler that returns effects
- `registerEffect<Config>(effectType, handler)` - Register an effect handler
- `dispatch<Payload>(eventKey, payload)` - Dispatch an event
- `getState()` - Get current state
- `flush()` - Flush event queue (for testing)
- `registerSubscription(key, config)` - Register a subscription
- `subscribe(key, params, callback)` - Subscribe to state changes
- `query(key, params)` - Query a subscription once

## License

MIT

