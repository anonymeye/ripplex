import { useDispatch } from '@ripple/react'
import { useCounterCount } from '../hooks'
import { counterEvents } from '../store/events'

/**
 * Counter Component
 * Demonstrates simple synchronous state updates using factory subscription hooks
 */
export function Counter() {
  const dispatch = useDispatch()
  const count = useCounterCount()

  const handleIncrement = () => {
    dispatch(counterEvents.increment)
  }

  const handleDecrement = () => {
    dispatch(counterEvents.decrement)
  }

  const handleReset = () => {
    dispatch(counterEvents.reset)
  }

  const handleSet = () => {
    const value = prompt('Enter a number:')
    if (value !== null) {
      const numValue = parseInt(value, 10)
      if (!isNaN(numValue)) {
        dispatch(counterEvents.set, { value: numValue })
      }
    }
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', margin: '10px' }}>
      <h2>Counter Example</h2>
      <p style={{ fontSize: '24px', fontWeight: 'bold' }}>Count: {count}</p>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={handleIncrement}>Increment</button>
        <button onClick={handleDecrement}>Decrement</button>
        <button onClick={handleReset}>Reset</button>
        <button onClick={handleSet}>Set Value</button>
      </div>
      <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
        This demonstrates simple synchronous state updates using the Ripple Store.
      </p>
    </div>
  )
}

