import { useSyncExternalStore, useMemo, useCallback } from 'react'
import { useStore } from './StoreContext'

/**
 * Hook that leverages shared Subscription objects for optimal React memoization.
 * 
 * The key insight: Subscription objects are shared (same instance for same key+params),
 * so we can use the Subscription object itself as a stable reference in dependency arrays.
 * This eliminates the need to memoize params arrays or use JSON.stringify.
 * 
 * @example
 * ```tsx
 * function TodoItem({ id }: { id: string }) {
 *   const todo = useSubscription('todoById', id)
 *   return <div>{todo.title}</div>
 * }
 * 
 * function TodoList() {
 *   const todos = useSubscription('todos')
 *   return <div>{todos.map(...)}</div>
 * }
 * ```
 */
export function useSubscription<Result, Params extends any[] = []>(
  subscriptionKey: string,
  ...params: Params
): Result {
  const store = useStore<any>()
  
  // Get the shared Subscription object - this is stable (same instance for same key+params)
  // We can use this object directly in dependency arrays without worrying about params equality
  const subscription = useMemo(
    () => store.getSubscription<Result, Params>(subscriptionKey, params),
    [store, subscriptionKey, ...params] // Spread params - React will handle equality
  )

  // Get snapshot function - depends on the Subscription object (stable reference)
  // We use subscription.params instead of params to avoid dependency on the params array
  const getSnapshot = useCallback(
    () => store.query<Result, Params>(subscription.key, subscription.params),
    [store, subscription] // Subscription object is stable, so this is stable too
  )

  // Subscribe function - depends on the Subscription object (stable reference)
  // We use subscription.params instead of params to avoid dependency on the params array
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      return store.subscribe<Result, Params>(
        subscription.key,
        subscription.params,
        () => {
          // Notify React that the subscription value changed
          // useSyncExternalStore will call getSnapshot to get the new value
          onStoreChange()
        }
      )
    },
    [store, subscription] // Subscription object is stable, so this is stable too
  )

  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot // Server snapshot (same as client for now)
  )
}

/**
 * Factory function that creates a reusable hook for a specific subscription key.
 * 
 * This is useful when you want to create a typed hook for a specific subscription,
 * making it easier to use in components without passing the key each time.
 * The store is automatically obtained from context, so no store parameter is needed.
 * 
 * @example
 * ```tsx
 * // Create the hook once (outside component) - no store needed!
 * const useTodos = createSubscriptionHook('todos')
 * const useTodoById = createSubscriptionHook('todoById')
 * 
 * // Use in components
 * function TodoList() {
 *   const todos = useTodos() // No params needed
 *   return <div>{todos.map(...)}</div>
 * }
 * 
 * function TodoItem({ id }: { id: string }) {
 *   const todo = useTodoById(id) // Just params
 *   return <div>{todo.title}</div>
 * }
 * ```
 */
export function createSubscriptionHook<Result, Params extends any[] = []>(
  subscriptionKey: string
) {
  return function useSubscriptionHook(...params: Params): Result {
    // Get store from context instead of requiring it as a parameter
    const store = useStore<any>()
    
    // Get the shared Subscription object - stable reference
    const subscription = useMemo(
      () => store.getSubscription<Result, Params>(subscriptionKey, params),
      [store, subscriptionKey, ...params]
    )

    const getSnapshot = useCallback(
      () => store.query<Result, Params>(subscription.key, subscription.params),
      [store, subscription]
    )

    const subscribe = useCallback(
      (onStoreChange: () => void) => {
        return store.subscribe<Result, Params>(
          subscription.key,
          subscription.params,
          () => {
            onStoreChange()
          }
        )
      },
      [store, subscription]
    )

    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  }
}

