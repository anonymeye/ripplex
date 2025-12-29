import { signal, Signal, WritableSignal } from '@angular/core';
import { StoreAPI } from '@ripple/core';

/**
 * Service that wraps a Ripple Store and exposes state as an Angular Signal
 * Note: This class is not decorated with @Injectable() because it's provided
 * via an InjectionToken using a factory function, which avoids JIT compilation.
 */
export class RippleStoreService<State, Cofx = {}> {
  private _state!: WritableSignal<State>;
  private unsubscribe?: () => void;

  constructor(private store: StoreAPI<State, Cofx>) {
    // Initialize signal with current state
    this._state = signal<State>(this.store.getState() as State);
    
    // Register a subscription that tracks the entire state
    // This subscription will notify us whenever state changes
    const subscriptionKey = '__ripple_angular_state_tracker__';
    
    // Register the subscription if it doesn't exist
    try {
      this.store.registerSubscription(subscriptionKey, {
        compute: (state: State) => state
      });
    } catch (error) {
      // Subscription might already exist, which is fine
    }
    
    // Subscribe to state changes
    this.unsubscribe = this.store.subscribe(
      subscriptionKey,
      [],
      (newState: State) => {
        // Update the signal with new state
        this._state.set(newState);
      }
    );
  }

  /**
   * Get the current state as a Signal
   */
  get state(): Signal<State> {
    return this._state.asReadonly();
  }

  /**
   * Dispatch an event to the store
   */
  dispatch<Payload = any>(eventKey: string, payload?: Payload): Promise<void> {
    return this.store.dispatch(eventKey, payload);
  }

  /**
   * Get the underlying store instance
   */
  getStore(): StoreAPI<State, Cofx> {
    return this.store;
  }

  /**
   * Cleanup: unsubscribe from state changes
   */
  ngOnDestroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}

