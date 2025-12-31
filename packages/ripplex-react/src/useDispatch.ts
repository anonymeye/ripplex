import { useCallback } from 'react'
import { useStore } from './StoreContext'

/**
 * Hook to get a dispatch function for the store
 * Returns a memoized dispatch function
 */
export function useDispatch<Payload = any>() {
  const store = useStore()

  const dispatch = useCallback(
    <P = Payload>(eventKey: string, payload?: P) => {
      return store.dispatch(eventKey, payload)
    },
    [store]
  )

  return dispatch
}

