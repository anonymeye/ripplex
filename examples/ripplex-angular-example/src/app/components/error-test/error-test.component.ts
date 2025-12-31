import { Component } from '@angular/core';
import { injectDispatch, injectStore } from '@rplx/angular';
import { errorTestEvents } from '../../../store/events';

/**
 * ErrorTest Component
 * Tests error handling in various scenarios
 */
@Component({
  selector: 'app-error-test',
  standalone: true,
  template: `
    <div class="error-test-container">
      <h2>🧪 Error Handling Tests</h2>
      
      <div class="button-group">
        <button (click)="handleInterceptorBeforeError()">
          Test: Interceptor Before Error
        </button>
        <button (click)="handleInterceptorAfterError()">
          Test: Interceptor After Error
        </button>
        <button (click)="handleHandlerError()">
          Test: Event Handler Error
        </button>
        <button (click)="handleEffectError()">
          Test: Effect Error
        </button>
        <button (click)="handleSubscriptionError()">
          Test: Subscription Error (via query)
        </button>
        <button (click)="handleSubscriptionDepError()">
          Test: Subscription with Error Dependency
        </button>
      </div>
      
      <p class="description">
        Check console for error logs. App should NOT crash.
        <br />
        All errors should be logged with detailed context.
      </p>
    </div>
  `,
  styles: [`
    .error-test-container {
      padding: 20px;
      border: 2px solid red;
      border-radius: 8px;
      margin: 10px;
      background: white;
    }

    h2 {
      margin-top: 0;
    }

    .button-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 10px;
    }

    button {
      padding: 8px 16px;
      cursor: pointer;
      border: 1px solid #ccc;
      border-radius: 4px;
      background: #f5f5f5;
    }

    button:hover {
      background: #e0e0e0;
    }

    .description {
      font-size: 12px;
      color: #666;
      margin-top: 10px;
    }
  `]
})
export class ErrorTestComponent {
  private dispatch = injectDispatch();
  private store = injectStore();

  handleInterceptorBeforeError() {
    this.dispatch(errorTestEvents.interceptorBeforeError);
  }

  handleInterceptorAfterError() {
    this.dispatch(errorTestEvents.interceptorAfterError);
  }

  handleHandlerError() {
    this.dispatch(errorTestEvents.handlerError);
  }

  handleEffectError() {
    this.dispatch(errorTestEvents.effectError);
  }

  handleSubscriptionError() {
    try {
      const result = this.store.query('error/throws', []);
      console.log('Subscription result:', result);
    } catch (error) {
      console.error('Caught subscription error (should be handled by error handler):', error);
    }
  }

  handleSubscriptionDepError() {
    try {
      const result = this.store.query('error/dep-throws', []);
      console.log('Subscription with error dep result:', result);
    } catch (error) {
      console.error('Caught subscription dep error:', error);
    }
  }
}

