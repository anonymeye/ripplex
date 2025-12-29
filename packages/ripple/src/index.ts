/**
 * @ripple/core - Re-frame inspired state management for TypeScript
 * 
 * This is the main entry point for the ripple library.
 * All public APIs are re-exported from here - users should never import
 * directly from internal module paths.
 */

// ============================================================================
// PRIMARY API - Store Creation
// ============================================================================

/**
 * Factory function to create a store instance (recommended)
 * 
 * @example
 * ```typescript
 * import { createStore } from '@ripple/core'
 * const store = createStore({ initialState: {} })
 * ```
 */
export {
  createStore,
  type StoreAPI,
} from './modules/store'

// ============================================================================
// EFFECT UTILITIES
// ============================================================================

/**
 * Merge multiple effect maps into a single effect map
 * 
 * @example
 * ```typescript
 * import { mergeEffects } from '@ripple/core'
 * 
 * const effects = mergeEffects(
 *   { db: newState },
 *   { dispatch: { event: 'save', payload: {} } }
 * )
 * ```
 */
export {
  mergeEffects,
} from './modules/effects'

// ============================================================================
// TYPES - Core Type Definitions
// ============================================================================

/**
 * Core type definitions for store configuration, handlers, and effects
 */
export type {
  // Store configuration
  StoreConfig,
  
  // Event handlers
  EventHandlerDb,
  EventHandlerFx,
  Context,
  
  // Effect system
  EffectMap,
  EffectHandler,
  CoeffectProviders,
  
  // Error handling
  ErrorHandler,
  ErrorContext,
  ErrorHandlerConfig,
  
  // Tracing
  EventTrace,
  EffectExecutionTrace,
  TraceCallback,
  
  // Internal types (exposed for advanced use cases)
  QueuedEvent,
} from './modules/types'

// ============================================================================
// INTERCEPTORS - Built-in Interceptor Utilities
// ============================================================================

/**
 * Interceptor types and built-in interceptor utilities
 * 
 * @example
 * ```typescript
 * import { path, debug, after } from '@ripple/core'
 * 
 * store.registerEventDb('event/key', handler, [
 *   path(['users', 'current']),
 *   debug('before handler'),
 *   after(console.log)
 * ])
 * ```
 */
export {
  type Interceptor,
  type InterceptorContext,
  path,
  debug,
  after,
  injectCofx,
  validate,
} from './modules/interceptor'

// ============================================================================
// SUBSCRIPTIONS - Subscription System
// ============================================================================

/**
 * Subscription types and registry
 * 
 * @example
 * ```typescript
 * import { SubscriptionConfig } from '@ripple/core'
 * 
 * store.registerSubscription('users/current', {
 *   compute: (state) => state.users.current
 * })
 * ```
 */
export {
  Subscription,
  SubscriptionRegistry,
  type SubscriptionConfig,
  type SubscriptionFn,
  type SubscriptionErrorHandler,
} from './modules/subscription'

// ============================================================================
// ERROR HANDLING - Error Handler Utilities
// ============================================================================

/**
 * Error handler utilities
 * 
 * @example
 * ```typescript
 * import { defaultErrorHandler } from '@ripple/core'
 * 
 * store.registerErrorHandler(defaultErrorHandler)
 * ```
 */
export {
  defaultErrorHandler,
} from './modules/errorHandler'

