import { inject } from '@angular/core';
import { RippleStoreService } from './RippleStoreService';
import { RIPPLE_STORE_SERVICE } from './provideRippleStore';

/**
 * Injection function to get the dispatch function
 * 
 * @returns Dispatch function to send events to the store
 */
export function injectDispatch<State = any>(): <Payload = any>(
  eventKey: string,
  payload?: Payload
) => Promise<void> {
  const storeService = inject(RIPPLE_STORE_SERVICE) as RippleStoreService<State>;
  return (eventKey: string, payload?: any) => storeService.dispatch(eventKey, payload);
}

