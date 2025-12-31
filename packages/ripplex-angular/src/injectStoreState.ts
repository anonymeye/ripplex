import { inject, Signal } from '@angular/core';
import { RippleStoreService } from './RippleStoreService';
import { RIPPLE_STORE_SERVICE } from './provideRippleStore';

/**
 * Injection function to get the store state as a Signal
 * 
 * @returns Signal containing the current store state
 */
export function injectStoreState<State>(): Signal<State> {
  const storeService = inject(RIPPLE_STORE_SERVICE) as RippleStoreService<State>;
  return storeService.state;
}

