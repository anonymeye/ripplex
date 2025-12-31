import { createStore, EventHandlerDb, EventHandlerFx, EffectHandler } from '@rplx/core'
import { AppState, AppCoeffects } from './types'
import { allEventDefinitions, todoEvents } from './events'
import { allEffectHandlers } from './effects'
import { allSubscriptions } from './subscriptions'

// Initial application state
const initialState: AppState = {
  counter: {
    count: 0,
  },
  todos: {
    todos: [],
    filter: 'all',
  },
  async: {
    data: null,
    loading: false,
    error: null,
  },
}

// Create store instance using factory function
export const store = createStore<AppState, AppCoeffects>({
  initialState,
  // Coeffect providers - functions that compute coeffect values
  coeffects: {
    uuid: () => crypto.randomUUID(),
    now: () => new Date(),
    random: () => Math.random(),
  },
  // Enable tracing for debugging
  tracing: {
    enabled: true,
    debounceTime: 50,
  },
})

// Register all event handlers with their interceptors
Object.entries(allEventDefinitions).forEach(([eventKey, definition]) => {
  const interceptors = 'interceptors' in definition ? definition.interceptors : undefined
  const handler = definition.handler
  
  // Check if this is an fx handler (returns EffectMap) or db handler (returns State)
  if ('type' in definition && definition.type === 'fx') {
    // Register as fx handler (returns EffectMap)
    if (interceptors && interceptors.length > 0) {
      store.registerEvent(
        eventKey, 
        handler as EventHandlerFx<AppState, AppCoeffects>, 
        interceptors as any // Type assertion needed due to generic variance
      )
    } else {
      store.registerEvent(eventKey, handler as EventHandlerFx<AppState, AppCoeffects>)
    }
  } else {
    // Register as db handler (returns State, auto-wrapped to {:db: state})
    if (interceptors && interceptors.length > 0) {
      store.registerEventDb(
        eventKey, 
        handler as EventHandlerDb<AppState, AppCoeffects>, 
        interceptors as any // Type assertion needed due to generic variance
      )
    } else {
      store.registerEventDb(eventKey, handler as EventHandlerDb<AppState, AppCoeffects>)
    }
  }
})

// Register all effect handlers
Object.entries(allEffectHandlers).forEach(([effectType, handler]) => {
  store.registerEffect(effectType, handler as EffectHandler<any>)
})

// Register all subscriptions
Object.entries(allSubscriptions).forEach(([subscriptionKey, config]) => {
  store.registerSubscription(subscriptionKey, config)
})

// Register error handler
store.registerErrorHandler(
  (error, context, config) => {
    console.group('🚨 Ripple Error Handler')
    console.error('Error:', error.message)
    console.log('Context:', {
      eventKey: context.eventKey,
      phase: context.phase,
      interceptor: context.interceptor,
      payload: context.payload
    })
    console.log('Config:', config)
    console.groupEnd()
    
    // You could send to error reporting service here
    // Example: Sentry.captureException(error, { extra: context })
  },
  { rethrow: false }  // Don't crash the app
)

// Load todos from localStorage on initialization
store.dispatch(todoEvents.loadFromStorage, {})

// Export store instance
export default store

