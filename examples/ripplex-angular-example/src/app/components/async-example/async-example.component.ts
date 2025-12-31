import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { injectSubscription, injectDispatch } from '@rplx/angular';
import { asyncEvents } from '../../../store/events';

/**
 * AsyncExample Component
 * Demonstrates async operations with effects
 */
@Component({
  selector: 'app-async-example',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="example-container">
      <h2>Async Data Fetching Example</h2>
      
      <div class="button-group">
        <button 
          (click)="handleFetch()" 
          [disabled]="loading()"
        >
          {{ loading() ? 'Loading...' : 'Fetch Data' }}
        </button>
        <button 
          *ngIf="data()" 
          (click)="handleClear()"
        >
          Clear Data
        </button>
      </div>

      <div *ngIf="loading()" class="loading">
        Loading data...
      </div>

      <div *ngIf="error()" class="error">
        Error: {{ error() }}
      </div>

      <div *ngIf="data() && !loading()" class="data-display">
        <h3>Fetched Data:</h3>
        <pre>{{ data() }}</pre>
      </div>

      <p class="description">
        This demonstrates async operations using effects. Clicking "Fetch Data" triggers an HTTP request effect.
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

    .button-group {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .loading {
      padding: 10px;
      background-color: #e3f2fd;
      border-radius: 4px;
      margin: 10px 0;
    }

    .error {
      padding: 10px;
      background-color: #ffebee;
      border-radius: 4px;
      color: #c62828;
      margin: 10px 0;
    }

    .data-display {
      margin-top: 20px;
      padding: 15px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }

    .data-display h3 {
      margin-top: 0;
    }

    .data-display pre {
      background-color: white;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .description {
      font-size: 12px;
      color: #666;
      margin-top: 10px;
    }
  `]
})
export class AsyncExampleComponent {
  private dispatch = injectDispatch();

  // Use subscriptions instead of computed() - provides shared computation and better performance
  // Multiple components using the same subscriptions will share computation
  loading = injectSubscription<boolean>('async/loading');
  error = injectSubscription<string | null>('async/error');
  data = injectSubscription<string | null>('async/data');

  handleFetch() {
    this.dispatch(asyncEvents.fetch);
  }

  handleClear() {
    // We could add a clear event, but for simplicity, just fetch again to reset
    // Or we could dispatch a reset event if we had one
    this.dispatch(asyncEvents.fetchStart);
    this.dispatch(asyncEvents.fetchSuccess, { data: null });
  }
}

