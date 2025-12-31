import { InjectionToken, Provider } from '@angular/core';
import { StoreAPI } from '@rplx/core';
import { RippleStoreService } from './RippleStoreService';

/**
 * Injection token for RippleStoreService
 */
export const RIPPLE_STORE_SERVICE = new InjectionToken<RippleStoreService<any>>('RippleStoreService');

/**
 * Provider function to configure Ripple store for dependency injection
 * 
 * @param store The Ripple Store instance (created with createStore())
 * @returns Provider configuration
 */
export function provideRippleStore<State, Cofx = {}>(store: StoreAPI<State, Cofx>): Provider {
  return {
    provide: RIPPLE_STORE_SERVICE,
    useFactory: () => new RippleStoreService(store),
  };
}

