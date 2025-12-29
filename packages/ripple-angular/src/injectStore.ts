import { inject } from '@angular/core';
import { RippleStoreService } from './RippleStoreService';
import { RIPPLE_STORE_SERVICE } from './provideRippleStore';
import { StoreAPI } from '@ripple/core';

/**
 * Injection function to get the store instance directly
 * Use this when you need direct access to the store API (e.g., for query, registerTraceCallback, etc.)
 * 
 * @returns The underlying store instance
 */
export function injectStore<State = any, Cofx = {}>(): StoreAPI<State, Cofx> {
  const storeService = inject(RIPPLE_STORE_SERVICE) as RippleStoreService<any>;
  return storeService.getStore() as unknown as StoreAPI<State, Cofx>;
}

