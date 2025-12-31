import { Component } from '@angular/core';
import { injectSubscription, injectDispatch } from '@rplx/angular';
import { counterEvents } from '../../../store/events';

/**
 * Counter Component
 * Demonstrates simple synchronous state updates
 */
@Component({
  selector: 'app-counter',
  standalone: true,
  template: `
    <div class="example-container">
      <h2>Counter Example</h2>
      <p class="count-display">Count: {{ count() }}</p>
      <div class="button-group">
        <button (click)="handleIncrement()">Increment</button>
        <button (click)="handleDecrement()">Decrement</button>
        <button (click)="handleReset()">Reset</button>
        <button (click)="handleSet()">Set Value</button>
      </div>
      <p class="description">
        This demonstrates simple synchronous state updates using the Ripple Store.
      </p>
    </div>
  `,
  styles: [`
    .example-container {
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 8px;
      margin: 10px;
      background: white;
    }

    h2 {
      margin-top: 0;
    }

    .count-display {
      font-size: 24px;
      font-weight: bold;
      margin: 20px 0;
    }

    .button-group {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 10px;
    }

    .description {
      font-size: 12px;
      color: #666;
      margin-top: 10px;
    }
  `]
})
export class CounterComponent {
  private dispatch = injectDispatch();

  // Use subscription instead of computed() - provides shared computation and better performance
  count = injectSubscription<number>('counter/count');

  handleIncrement() {
    this.dispatch(counterEvents.increment);
  }

  handleDecrement() {
    this.dispatch(counterEvents.decrement);
  }

  handleReset() {
    this.dispatch(counterEvents.reset);
  }

  handleSet() {
    const value = prompt('Enter a number:');
    if (value !== null) {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue)) {
        this.dispatch(counterEvents.set, { value: numValue });
      }
    }
  }
}

