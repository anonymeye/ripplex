import { useDispatch, useStore } from '@rplx/react'

export function ErrorTest() {
  const dispatch = useDispatch()
  const store = useStore()
  
  // Test subscription error by querying a subscription that throws
  const handleSubscriptionError = () => {
    try {
      const result = store.query('error/throws', [])
      console.log('Subscription result:', result)
    } catch (error) {
      console.error('Caught subscription error (should be handled by error handler):', error)
    }
  }

  return (
    <div style={{ padding: '20px', border: '2px solid red', borderRadius: '8px', margin: '10px' }}>
      <h2>🧪 Error Handling Tests</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button onClick={() => dispatch('test/interceptor-before-error')}>
          Test: Interceptor Before Error
        </button>
        <button onClick={() => dispatch('test/interceptor-after-error')}>
          Test: Interceptor After Error
        </button>
        <button onClick={() => dispatch('test/handler-error')}>
          Test: Event Handler Error
        </button>
        <button onClick={() => dispatch('test/effect-error')}>
          Test: Effect Error
        </button>
        <button onClick={handleSubscriptionError}>
          Test: Subscription Error (via query)
        </button>
        <button onClick={() => {
          // Test subscription with dependency that throws
          try {
            const result = store.query('error/dep-throws', [])
            console.log('Subscription with error dep result:', result)
          } catch (error) {
            console.error('Caught subscription dep error:', error)
          }
        }}>
          Test: Subscription with Error Dependency
        </button>
      </div>
      
      <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
        Check console for error logs. App should NOT crash.
        <br />
        All errors should be logged with detailed context.
      </p>
    </div>
  )
}

