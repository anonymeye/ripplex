// Export the injection token and provider function
export { provideRippleStore, RIPPLE_STORE_SERVICE } from './provideRippleStore'
export { injectStoreState } from './injectStoreState'
export { injectDispatch } from './injectDispatch'
export { injectSubscription } from './injectSubscription'
export { injectStore } from './injectStore'

// Export the service class type for advanced use cases
// Note: Do not inject this directly - use RIPPLE_STORE_SERVICE token instead
export type { RippleStoreService } from './RippleStoreService'

