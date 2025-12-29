/**
 * Subscription system
 */
export type SubscriptionFn<State, Result, Params extends any[] = []> = (
    state: State,
    ...params: Params
  ) => Result
  
  export type SubscriptionConfig<State, Result, Params extends any[] = [], Deps extends any[] = any[]> = {
    compute?: SubscriptionFn<State, Result, Params>
    deps?: string[]
    combine?: (deps: Deps, ...params: Params) => Result
  }

  /**
   * Shared subscription object - same instance for same key+params
   * This enables React memoization and matches re-frame behavior
   */
  export class Subscription<State = any, Result = any, Params extends any[] = []> {
    constructor(
      public readonly key: string,
      public readonly params: Params
    ) {}
  }

  /**
   * Cache entry for computed subscription results
   */
  interface CacheEntry<State, Result> {
    state: State
    result: Result
  }
  
  export type SubscriptionErrorHandler = (
    error: Error,
    key: string,
    params: any[]
  ) => void

  export class SubscriptionRegistry<State> {
    private subscriptions = new Map<string, SubscriptionConfig<State, any, any, any>>()
    
    // Map of cache keys to shared Subscription objects
    private subscriptionCache = new Map<string, Subscription<State, any, any>>()
    
    // WeakMap for computed results - automatically GC'd when Subscription is no longer referenced
    private resultCache = new WeakMap<Subscription<State, any, any>, CacheEntry<State, any>>()
    
    // Reference counting: track how many active subscriptions exist for each Subscription object
    private refCounts = new WeakMap<Subscription<State, any, any>, number>()
    
    // Listeners for each subscription
    private listeners = new WeakMap<Subscription<State, any, any>, Set<(result: any) => void>>()
    
    register<Result, Params extends any[] = [], Deps extends any[] = any[]>(
      key: string,
      config: SubscriptionConfig<State, Result, Params, Deps>
    ): void {
      this.subscriptions.set(key, config)
    }
    
    /**
     * Get or create a shared Subscription object for the given key+params
     * Returns the same object for the same key+params (like re-frame)
     */
    getSubscription<Result, Params extends any[]>(
      key: string,
      params: Params
    ): Subscription<State, Result, Params> {
      const cacheKey = this.getCacheKey(key, params)
      
      let subscription = this.subscriptionCache.get(cacheKey)
      if (!subscription) {
        subscription = new Subscription<State, Result, Params>(key, params)
        this.subscriptionCache.set(cacheKey, subscription)
        this.refCounts.set(subscription, 0)
        this.listeners.set(subscription, new Set())
      }
      
      return subscription as Subscription<State, Result, Params>
    }
    
    subscribe<Result, Params extends any[]>(
      state: State,
      key: string,
      params: Params,
      callback: (result: Result) => void,
      onError?: SubscriptionErrorHandler
    ): () => void {
      const subscription = this.getSubscription<Result, Params>(key, params)
      
      // Increment reference count
      const currentCount = this.refCounts.get(subscription) || 0
      this.refCounts.set(subscription, currentCount + 1)
      
      // Get or compute result
      const result = this.query<Result, Params>(state, key, params, onError)
      callback(result)
      
      // Add listener
      const listeners = this.listeners.get(subscription)!
      listeners.add(callback)
      
      return () => {
        // Remove listener
        listeners.delete(callback)
        
        // Decrement reference count
        const count = this.refCounts.get(subscription) || 0
        const newCount = Math.max(0, count - 1)
        this.refCounts.set(subscription, newCount)
        
        // If no more references and no listeners, remove from subscription cache
        // The WeakMap entries (resultCache, refCounts, listeners) will be automatically 
        // GC'd when the Subscription object is no longer referenced
        if (newCount <= 0 && listeners.size === 0) {
          const cacheKey = this.getCacheKey(key, params)
          this.subscriptionCache.delete(cacheKey)
          // Note: WeakMap entries will be automatically cleaned up when Subscription is GC'd
        }
      }
    }
    
    query<Result, Params extends any[]>(
      state: State,
      key: string,
      params: Params,
      onError?: SubscriptionErrorHandler
    ): Result {
      const config = this.subscriptions.get(key)
      if (!config) {
        const error = new Error(`Subscription "${key}" not registered`)
        if (onError) {
          onError(error, key, params)
          return undefined as Result
        }
        console.error(error.message)
        return undefined as Result
      }
      
      const subscription = this.getSubscription<Result, Params>(key, params)
      const cached = this.resultCache.get(subscription)
      
      // Check if cached result is still valid (same state reference)
      if (cached && cached.state === state) {
        return cached.result
      }
      
      // Compute new result
      let result: Result
      
      try {
        if (config.compute) {
          result = config.compute(state, ...params)
        } else if (config.deps && config.combine) {
          const depResults = config.deps.map(depKey => this.query(state, depKey, [], onError))
          result = config.combine(depResults, ...params)
        } else {
          const error = new Error(`Invalid subscription config for "${key}"`)
          if (onError) {
            onError(error, key, params)
            return undefined as Result
          }
          console.error(error.message)
          return undefined as Result
        }
      } catch (error) {
        // Catch errors during computation - don't throw
        if (onError) {
          onError(error as Error, key, params)
        } else {
          console.error(`Error computing subscription "${key}":`, error)
        }
        // Return cached result if available, otherwise undefined
        return cached?.result ?? (undefined as Result)
      }
      
      // Cache the result in WeakMap (keyed by subscription object)
      this.resultCache.set(subscription, { state, result })
      return result
    }
    
    notifyListeners(newState: State): void {
      // Iterate over all active subscriptions
      for (const subscription of this.subscriptionCache.values()) {
        const listeners = this.listeners.get(subscription)
        if (!listeners || listeners.size === 0) {
          continue
        }
        
        // Get the old cached result BEFORE querying (which will update the cache)
        const oldCached = this.resultCache.get(subscription)
        const oldResult = oldCached?.result
        
        // Query the new result (this updates the cache with newState and newResult)
        // Pass undefined for onError - errors will be logged to console
        const newResult = this.query(newState, subscription.key, subscription.params, undefined)
        
        // Notify if result changed (or if there was no previous cache entry)
        if (!oldCached || !this.deepEqual(oldResult, newResult)) {
          listeners.forEach(callback => callback(newResult))
        }
      }
    }
    
    private getCacheKey(key: string, params: any[]): string {
      return `${key}:${JSON.stringify(params)}`
    }
    
    private deepEqual(a: any, b: any): boolean {
      return JSON.stringify(a) === JSON.stringify(b)
    }
  }

