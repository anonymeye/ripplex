# @rplx/core

A re-frame inspired state management library for TypeScript.

> **Status**: Currently in **v0.2.1** (pre-1.0). The core API is stable, but some advanced features may change before v1.0. See [Stability](#stability) section below.

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
  return {
    db: { count: context.db.count + 1 }
  }
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
  return {
    db: newState,  // Update state
    // ... other effects
  }
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

store.registerEvent('update-todo', handler, [
  path(['todos']),
  debug()
])
```

## Stability

This package is currently at **v0.2.1** (pre-1.0). The following applies:

### ✅ Stable APIs (unlikely to change)
- `createStore()` factory function
- `registerEvent()` / `registerEventDb()` - Event registration
- `dispatch()` - Event dispatching
- `getState()` - State access
- `registerEffect()` - Effect registration
- `registerSubscription()` / `subscribe()` / `query()` - Subscription system
- Core interceptor utilities: `path()`, `debug()`, `after()`, `injectCofx()`, `validate()`
- Error handling via `registerErrorHandler()`

### ⚠️ May Change (before v1.0)
- Tracing API (`registerTraceCallback()`, `removeTraceCallback()`) - may be refined
- Advanced subscription features - API may be adjusted based on feedback
- Some internal type exports (marked as "for advanced use cases")

### 🚫 Internal/Testing Only (do not use in production)
- `__scheduler` config option - For testing only, subject to change or removal
- `flush()` - Primarily for testing, but safe to use if needed
- Internal module paths - Always import from `@rplx/core` root, never from internal paths

## API

### `createStore<State, Cofx>(config)`

Factory function to create a store instance. Generic over State and Coeffects.

**Parameters:**
- `config.initialState` - Initial application state
- `config.coeffects` - Optional coeffect providers
- `config.tracing` - Optional tracing configuration
- `config.errorHandler` - Optional error handler configuration
- `config.onStateChange` - Optional callback for framework integration

**Returns:** A store instance with the following methods:
- `registerEventDb<Payload>(eventKey, handler, interceptors?)` - Register an event handler that returns state
- `registerEvent<Payload>(eventKey, handler, interceptors?)` - Register an event handler that returns effects
- `deregisterEvent(eventKey)` - Remove an event handler
- `registerEffect<Config>(effectType, handler)` - Register an effect handler
- `dispatch<Payload>(eventKey, payload)` - Dispatch an event
- `getState()` - Get current state
- `flush()` - Flush event queue (primarily for testing)
- `getInterceptors(eventKey)` - Get interceptors for an event (for inspection)
- `registerErrorHandler(handler, config?)` - Register error handler
- `registerSubscription(key, config)` - Register a subscription
- `subscribe(key, params, callback)` - Subscribe to state changes (returns unsubscribe function)
- `query(key, params)` - Query a subscription once
- `getSubscription(key, params)` - Get subscription instance (advanced)
- `registerTraceCallback(key, callback)` - Register tracing callback
- `removeTraceCallback(key)` - Remove tracing callback

## Version History

### v0.2.1
- Fixed deadlock issues in dispatch effects
- Improved error handling and state management in interceptors
- Added comprehensive test coverage

### Upcoming v1.0
- No breaking changes planned, but API may be refined based on community feedback
- Tracing API may receive improvements

## License

MIT

