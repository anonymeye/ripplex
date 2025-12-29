import { StoreProvider } from '@ripple/react'
import { store } from './store/store'
import { Counter, TodoList, AsyncExample, ErrorTest, TraceViewer } from './components'
import './App.css'

function App() {
  return (
    <StoreProvider store={store as any}>
      <div className="App">
        <header className="App-header">
          <h1>Ripple Store - React Example</h1>
          <p>A re-frame inspired state management library for TypeScript</p>
        </header>

        <main className="App-main">
          <Counter />
          <TodoList />
          <AsyncExample />
          <ErrorTest />
        </main>

        <footer className="App-footer">
          <p>
            This example demonstrates the Ripple Store working with React, including:
          </p>
          <ul>
            <li>Simple synchronous state updates (Counter)</li>
            <li>Complex state management with arrays and filtering (TodoList)</li>
            <li>Async operations with effects (AsyncExample)</li>
            <li>Event tracing and debugging (TraceViewer - bottom panel)</li>
          </ul>
        </footer>
      </div>
      <TraceViewer />
    </StoreProvider>
  )
}

export default App

