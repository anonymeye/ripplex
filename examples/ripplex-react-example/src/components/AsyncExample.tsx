import { useDispatch } from '@rplx/react'
import { useAsyncData, useAsyncLoading, useAsyncError } from '../hooks'
import { asyncEvents } from '../store/events'

/**
 * AsyncExample Component
 * Demonstrates async operations with effects and loading states using factory subscription hooks
 */
export function AsyncExample() {
  const dispatch = useDispatch()
  const data = useAsyncData()
  const loading = useAsyncLoading()
  const error = useAsyncError()

  const handleFetch = () => {
    dispatch(asyncEvents.fetch)
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', margin: '10px' }}>
      <h2>Async Data Fetching Example</h2>

      <button onClick={handleFetch} disabled={loading} style={{ marginBottom: '20px' }}>
        {loading ? 'Loading...' : 'Fetch Data'}
      </button>

      {loading && (
        <div style={{ padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
          Loading data...
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '10px',
            backgroundColor: '#ffebee',
            color: '#c62828',
            borderRadius: '4px',
            marginTop: '10px',
          }}
        >
          Error: {error}
        </div>
      )}

      {data && !loading && (
        <div
          style={{
            padding: '10px',
            backgroundColor: '#e8f5e9',
            borderRadius: '4px',
            marginTop: '10px',
          }}
        >
          <strong>Data received:</strong>
          <pre
            style={{
              marginTop: '10px',
              padding: '10px',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '12px',
            }}
          >
            {data}
          </pre>
        </div>
      )}

      <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
        This demonstrates async operations using effects. The fetch event triggers an HTTP request
        effect, which then dispatches success or error events based on the result.
      </p>
    </div>
  )
}

