import { inject, Signal, signal, DestroyRef, NgZone } from '@angular/core';
import { RippleStoreService } from './RippleStoreService';
import { RIPPLE_STORE_SERVICE } from './provideRippleStore';

/**
 * Injection function to subscribe to a Ripple subscription and get the value as a Signal
 * 
 * This leverages the core subscription system which provides:
 * - Shared computation across components (same subscription key+params share computation)
 * - Dependency graphs (subscriptions can depend on other subscriptions)
 * - Memoization and caching (only recomputes when dependencies change)
 * - Selective updates (components only update when their subscribed values change)
 * 
 * @param subscriptionKey The subscription key to subscribe to
 * @param params Optional parameters for the subscription
 * @returns Signal containing the subscription value
 * 
 * @example
 * ```typescript
 * // Simple subscription without params
 * const count = injectSubscription<number>('counter/count');
 * 
 * // Subscription with params
 * const todo = injectSubscription<Todo | undefined, [string]>('todos/byId', todoId);
 * 
 * // Use in template
 * <div>{{ count() }}</div>
 * ```
 */
export function injectSubscription<Result, Params extends any[] = []>(
  subscriptionKey: string,
  ...params: Params
): Signal<Result> {
  const storeService = inject(RIPPLE_STORE_SERVICE) as RippleStoreService<any>;
  const store = storeService.getStore();
  const destroyRef = inject(DestroyRef);
  const ngZone = inject(NgZone);
  
  // Create a signal to hold the subscription value
  // Initialize with current query result
  const subscriptionSignal = signal<Result>(
    store.query<Result, Params>(subscriptionKey, params)
  );
  
  // Subscribe to changes
  const unsubscribe = store.subscribe<Result, Params>(
    subscriptionKey,
    params,
    (result: Result) => {
      ngZone.run(() => {
        subscriptionSignal.set(result);
      });
    }
  );
  
  // Register cleanup function to unsubscribe when component is destroyed
  destroyRef.onDestroy(() => {
    unsubscribe();
  });
  
  return subscriptionSignal.asReadonly();
}

