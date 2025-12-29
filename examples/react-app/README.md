# Ripple Store - React Example

This is a React example application demonstrating how to use the Ripple Store state management library.

## Overview

The Ripple Store is a re-frame inspired state management library for TypeScript. This example shows how to integrate it with React using custom hooks.

## Features Demonstrated

### 1. Counter Component
- Simple synchronous state updates
- Basic event dispatching
- State reading with `useStoreState`

### 2. TodoList Component
- Complex state management with arrays
- Filtering and conditional rendering
- Multiple event handlers working together
- Demonstrates UUID generation from context

### 3. AsyncExample Component
- Async operations using effects
- Loading states
- Error handling
- Custom effect handlers (HTTP requests)

## Project Structure

```
src/
├── hooks/              # React integration layer
│   ├── StoreContext.tsx    # Store provider and context
│   ├── useStoreState.ts   # Hook to subscribe to state
│   ├── useDispatch.ts     # Hook to dispatch events
│   └── index.ts
├── store/              # Store configuration
│   ├── types.ts            # TypeScript types
│   ├── events.ts           # Event handlers
│   ├── effects.ts          # Effect handlers
│   └── store.ts            # Store instance
├── components/          # Example components
│   ├── Counter.tsx
│   ├── TodoList.tsx
│   └── AsyncExample.tsx
├── App.tsx             # Main app component
└── main.tsx            # Entry point
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
cd examples/react-app
npm install
```

### Development

```bash
npm run dev
```

This will start the Vite development server. Open your browser to the URL shown in the terminal (typically `http://localhost:5173`).

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## How It Works

### 1. Store Setup

The store is created with an initial state and configured with event and effect handlers:

```typescript
import { Store } from '@ripple/core'
import { store } from './store/store'
```

### 2. Provider Setup

Wrap your app with the `StoreProvider`:

```typescript
<StoreProvider store={store}>
  <App />
</StoreProvider>
```

### 3. Using Hooks

#### Reading State

```typescript
import { useStoreState } from './hooks'

function MyComponent() {
  const state = useStoreState<AppState>()
  return <div>Count: {state.counter.count}</div>
}
```

#### Dispatching Events

```typescript
import { useDispatch } from './hooks'
import { counterEvents } from './store/events'

function MyComponent() {
  const dispatch = useDispatch()
  
  const handleClick = () => {
    dispatch(counterEvents.increment)
  }
  
  return <button onClick={handleClick}>Increment</button>
}
```

## Key Concepts

### Events
Events are dispatched to trigger state changes. Event handlers receive a context (with current state, UUID generator, etc.) and a payload, and return a new state and effects.

### Effects
Effects are side effects that can be triggered by event handlers. Built-in effects include:
- `dispatch`: Dispatch another event (optionally with delay)
- `dispatch-n`: Dispatch multiple events sequentially

Custom effects can be registered, such as:
- `http-request`: Make HTTP requests
- `local-storage`: Interact with localStorage

### State Updates
State updates are batched using `requestAnimationFrame` to optimize React re-renders.

## Testing Scenarios

This example demonstrates:

1. **Synchronous Updates**: Counter increment/decrement
2. **Complex State**: Todo list with filtering
3. **Async Operations**: HTTP requests with loading states
4. **Event Chaining**: Effects that dispatch other events
5. **Multiple Subscribers**: Multiple components reading the same state

## Notes

- The store processes events sequentially in a queue
- State changes are batched for performance
- Effects can be async and can dispatch other events
- The store supports custom context providers (UUID, random) for testing

