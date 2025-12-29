import React, { createContext, useContext, ReactNode, useRef, useEffect } from 'react'
import { StoreAPI } from '@ripple/core'

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

    // Register a subscription that tracks the entire state
    // This subscription will notify us whenever state changes
    const subscriptionKey = '__ripple_react_state_tracker__'
    
    // Register the subscription if it doesn't exist
    try {
      store.registerSubscription(subscriptionKey, {
        compute: (state: State) => state
      })
    } catch (error) {
      // Subscription might already exist, which is fine
    }

    // Subscribe to state changes
    const unsubscribe = store.subscribe(
      subscriptionKey,
      [],
      (newState: State) => {
        // Notify all subscribers
        subscribersRef.current.forEach(callback => {
          try {
            callback(newState)
          } catch (error) {
            console.error('Error in store subscriber:', error)
          }
        })
      }
    )

    // Cleanup: unsubscribe
    return () => {
      unsubscribe()
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

