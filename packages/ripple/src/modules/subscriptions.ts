/**
 * Subscriptions Manager Module
 * Wraps SubscriptionRegistry and integrates with state manager
 * 
 * Provides state-aware subscription methods that automatically
 * get state from the state manager.
 */

import { SubscriptionRegistry, SubscriptionConfig, Subscription, SubscriptionErrorHandler } from './subscription'
import { StateManager } from './state'
import { ErrorHandlerManager } from './errorHandler'

/**
 * Dependencies for subscription manager
 */
export interface SubscriptionManagerDependencies<State> {
    stateManager: StateManager<State>
    errorHandler: ErrorHandlerManager
}

/**
 * Subscription manager interface
 */
export interface SubscriptionManager<State> {
    /**
     * Register a subscription
     */
    registerSubscription<Result, Params extends any[] = [], Deps extends any[] = any[]>(
        key: string,
        config: SubscriptionConfig<State, Result, Params, Deps>
    ): void

    /**
     * Subscribe to state changes via subscription
     * Automatically uses current state from state manager
     */
    subscribe<Result, Params extends any[]>(
        key: string,
        params: Params,
        callback: (result: Result) => void
    ): () => void

    /**
     * Query a subscription once
     * Automatically uses current state from state manager
     */
    query<Result, Params extends any[]>(
        key: string,
        params: Params
    ): Result

    /**
     * Get or create a shared Subscription object for the given key+params
     * Returns the same object for the same key+params (useful for React memoization)
     */
    getSubscription<Result, Params extends any[]>(
        key: string,
        params: Params
    ): Subscription<State, Result, Params>

    /**
     * Notify listeners when state changes
     * Called by state manager when state updates
     */
    notifyListeners(newState: State): void
}

/**
 * Create a subscription manager instance
 */
export function createSubscriptionManager<State>(
    deps: SubscriptionManagerDependencies<State>
): SubscriptionManager<State> {
    const { stateManager, errorHandler } = deps

    // Create the underlying subscription registry
    const registry = new SubscriptionRegistry<State>()

    /**
     * Create error handler for subscriptions
     */
    function createSubscriptionErrorHandler(): SubscriptionErrorHandler {
        return (error: Error, subKey: string, subParams: any[]) => {
            // Handle subscription errors - don't throw, just log
            errorHandler.handle(error, {
                eventKey: `subscription:${subKey}`,
                payload: subParams,
                phase: 'subscription'
            }).catch(() => {
                // Ignore errors in error handler for subscriptions
            })
        }
    }

    /**
     * Register a subscription
     */
    function registerSubscription<Result, Params extends any[] = [], Deps extends any[] = any[]>(
        key: string,
        config: SubscriptionConfig<State, Result, Params, Deps>
    ): void {
        registry.register(key, config)
    }

    /**
     * Subscribe to state changes via subscription
     * Automatically uses current state from state manager
     */
    function subscribe<Result, Params extends any[]>(
        key: string,
        params: Params,
        callback: (result: Result) => void
    ): () => void {
        const onError = createSubscriptionErrorHandler()
        return registry.subscribe(
            stateManager.getState(),
            key,
            params,
            callback,
            onError
        )
    }

    /**
     * Query a subscription once
     * Automatically uses current state from state manager
     */
    function query<Result, Params extends any[]>(
        key: string,
        params: Params
    ): Result {
        const onError = createSubscriptionErrorHandler()
        return registry.query(
            stateManager.getState(),
            key,
            params,
            onError
        )
    }

    /**
     * Get or create a shared Subscription object for the given key+params
     * Returns the same object for the same key+params (useful for React memoization)
     */
    function getSubscription<Result, Params extends any[]>(
        key: string,
        params: Params
    ): Subscription<State, Result, Params> {
        return registry.getSubscription<Result, Params>(key, params)
    }

    /**
     * Notify listeners when state changes
     * Called by state manager when state updates
     */
    function notifyListeners(newState: State): void {
        registry.notifyListeners(newState)
    }

    return {
        registerSubscription,
        subscribe,
        query,
        getSubscription,
        notifyListeners
    }
}

