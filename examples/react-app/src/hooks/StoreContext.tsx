import React, { createContext, useContext, ReactNode, useRef, useEffect } from 'react'
import { StoreAPI } from '@rplx/core'

interface StoreContextValue<State> {
  store: StoreAPI<State>
  subscribe: (callback: (state: State) => void) => () => void
}

export const StoreContext = createContext<StoreContextValue<any> | null>(null)

interface StoreProviderProps<State> {
  store: StoreAPI<State>
  children: ReactNode
}

export function StoreProvider<State>({ store, children }: StoreProviderProps<State>) {
  const subscribersRef = useRef<Set<(state: State) => void>>(new Set())
  const storeRef = useRef(store)

  useEffect(() => {
    storeRef.current = store

    // Get the original onStateChange if it exists
    const storeInternal = store as any
    const originalCallback = storeInternal.onStateChange

    // Create a wrapper that notifies all subscribers
    const wrappedCallback = (newState: State) => {
      // Notify all subscribers
      subscribersRef.current.forEach(callback => {
        try {
          callback(newState)
        } catch (error) {
          console.error('Error in store subscriber:', error)
        }
      })

      // Call original callback if it exists
      if (originalCallback) {
        originalCallback(newState)
      }
    }

    // Replace the store's onStateChange with our wrapper
    storeInternal.onStateChange = wrappedCallback

    // Cleanup: restore original callback
    return () => {
      storeInternal.onStateChange = originalCallback
    }
  }, [store])

  const subscribe = React.useCallback((callback: (state: State) => void) => {
    subscribersRef.current.add(callback)
    
    // Return unsubscribe function
    return () => {
      subscribersRef.current.delete(callback)
    }
  }, [])

  return (
    <StoreContext.Provider value={{ store, subscribe }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore<State>(): StoreAPI<State> {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return context.store
}

