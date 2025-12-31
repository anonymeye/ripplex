import { useState, useEffect, useContext } from 'react'
import { StoreContext } from './StoreContext'

/**
 * Hook to subscribe to store state changes and trigger re-renders
 * Returns the current state and re-renders when state changes
 */
export function useStoreState<State>(): State {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error('useStoreState must be used within a StoreProvider')
  }

  const { store, subscribe } = context
  const [state, setState] = useState<State>(() => store.getState())

  useEffect(() => {
    // Subscribe to state changes
    const unsubscribe = subscribe((newState: State) => {
      // Only update if state reference changed
      setState(prevState => {
        if (prevState !== newState) {
          return newState
        }
        return prevState
      })
    })

    // Initial sync
    const currentState = store.getState()
    setState(currentState)

    return unsubscribe
  }, [store, subscribe])

  return state
}

