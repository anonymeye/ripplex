import { Component, OnInit, OnDestroy, signal, computed, effect, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { EventTrace } from '@rplx/core';
import { injectStore } from '@rplx/angular';
import { AppState } from '../../../store/types';

/**
 * TraceViewer Component
 * DevTools-style bottom panel for viewing event traces
 */
@Component({
  selector: 'app-trace-viewer',
  standalone: true,
  template: `
    <div class="trace-viewer" [style.max-height]="isExpanded() ? '50vh' : '40px'">
      <!-- Header Bar -->
      <div class="trace-header" (click)="toggleExpanded()">
        <div class="header-left">
          <span class="expand-icon">{{ isExpanded() ? '▼' : '▲' }}</span>
          <span class="trace-title">Ripple Trace</span>
          <span class="trace-count">{{ traces().length }}</span>
        </div>
        @if (isExpanded()) {
          <div class="header-right">
            <input
              type="text"
              placeholder="Filter events..."
              [value]="filter()"
              (input)="filter.set($any($event.target).value)"
              (click)="$event.stopPropagation()"
              class="filter-input"
            />
            <button
              (click)="clearTraces(); $event.stopPropagation()"
              class="clear-button"
            >
              Clear
            </button>
          </div>
        }
      </div>

      <!-- Content Area -->
      @if (isExpanded()) {
        <div class="trace-content">
          <!-- Traces List -->
          <div class="traces-list">
            @if (filteredTraces().length === 0) {
              <div class="empty-state">
                {{ traces().length === 0 ? 'No traces yet' : 'No traces match filter' }}
              </div>
            } @else {
              @for (trace of filteredTraces(); track trace.id) {
                <div
                  class="trace-item"
                  [class.selected]="selectedTrace()?.id === trace.id"
                  [class.error]="!!trace.error"
                  (click)="selectedTrace.set(trace)"
                >
                  <div class="trace-item-header">
                    <span class="trace-event-key" [class.error-text]="!!trace.error">
                      {{ trace.eventKey }}
                    </span>
                    <span class="trace-duration">{{ formatDuration(trace.duration) }}</span>
                  </div>
                  <div class="trace-timestamp">{{ formatTimestamp(trace.timestamp) }}</div>
                  @if (trace.error) {
                    <div class="trace-error">⚠ {{ trace.error.message }}</div>
                  }
                </div>
              }
            }
            <div #tracesEnd></div>
          </div>

          <!-- Trace Details -->
          <div class="trace-details">
            @if (selectedTrace(); as trace) {
              <div>
                <!-- Event Details -->
                <div class="detail-section">
                  <h3>Event Details</h3>
                  <div class="detail-item">
                    <span class="detail-label">Event:</span>
                    <span class="detail-value-string">{{ trace.eventKey }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">ID:</span>
                    <span class="detail-value">#{{ trace.id }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Timestamp:</span>
                    <span class="detail-value">{{ formatTimestamp(trace.timestamp) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Duration:</span>
                    <span class="detail-value">{{ formatDuration(trace.duration) }}</span>
                  </div>
                  @if (hasPayload(trace.payload)) {
                    <div class="detail-item">
                      <span class="detail-label">Payload:</span>
                      <pre class="code-block">{{ formatJSON(trace.payload) }}</pre>
                    </div>
                  }
                  @if (trace.error) {
                    <div class="detail-item">
                      <span class="detail-label error-text">Error:</span>
                      <pre class="code-block error-block">{{ trace.error.message }}{{ trace.error.stack ? '\n' + trace.error.stack : '' }}</pre>
                    </div>
                  }
                </div>

                <!-- Interceptors -->
                @if (trace.interceptors.length > 0) {
                  <div class="detail-section">
                    <h3>Interceptors ({{ trace.interceptors.length }})</h3>
                    <div class="interceptor-list">
                      @for (interceptor of trace.interceptors; track $index) {
                        <div class="interceptor-item">
                          <span class="detail-label">#{{ interceptor.order }}</span>
                          <span class="detail-value">{{ interceptor.id || 'unnamed' }}</span>
                        </div>
                      }
                    </div>
                  </div>
                }

                <!-- Effects Map -->
                @if (hasEffectMap(trace.effectMap)) {
                  <div class="detail-section">
                    <h3>Effects Map</h3>
                    <pre class="code-block">{{ formatJSON(trace.effectMap) }}</pre>
                  </div>
                }

                <!-- Effects Executed -->
                @if (trace.effectsExecuted.length > 0) {
                  <div class="detail-section">
                    <h3>Effects Executed ({{ trace.effectsExecuted.length }})</h3>
                    <div class="effect-list">
                      @for (effect of trace.effectsExecuted; track $index) {
                        <div class="effect-item" [class.error]="!!effect.error">
                          <div>
                            <span class="effect-type">{{ effect.effectType }}</span>
                            @if (effect.error) {
                              <span class="error-text">⚠ {{ effect.error.message }}</span>
                            }
                          </div>
                          <span class="effect-duration">{{ formatDuration(effect.duration) }}</span>
                        </div>
                      }
                    </div>
                  </div>
                }

                <!-- State Change -->
                <div class="detail-section">
                  <h3>State Change</h3>
                  <div class="state-diff">
                    <div>
                      <div class="state-label">Before</div>
                      <pre class="code-block state-block">{{ formatJSON(trace.stateBefore) }}</pre>
                    </div>
                    <div>
                      <div class="state-label">After</div>
                      <pre class="code-block state-block">{{ formatJSON(trace.stateAfter) }}</pre>
                    </div>
                  </div>
                </div>
              </div>
            } @else {
              <div class="empty-details">Select a trace to view details</div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .trace-viewer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      background-color: #1e1e1e;
      color: #d4d4d4;
      font-family: Monaco, Menlo, "Ubuntu Mono", monospace;
      font-size: 12px;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);
      display: flex;
      flex-direction: column;
      transition: max-height 0.3s ease;
      overflow: hidden;
    }

    .trace-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background-color: #252526;
      border-bottom: 1px solid #3e3e42;
      cursor: pointer;
      user-select: none;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .expand-icon {
      font-size: 14px;
    }

    .trace-title {
      font-weight: bold;
      color: #4ec9b0;
    }

    .trace-count {
      background-color: #007acc;
      color: white;
      padding: 2px 6px;
      border-radius: 10px;
      font-size: 10px;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .filter-input {
      padding: 4px 8px;
      background-color: #3c3c3c;
      border: 1px solid #3e3e42;
      border-radius: 4px;
      color: #d4d4d4;
      font-size: 12px;
      width: 200px;
    }

    .clear-button {
      padding: 4px 12px;
      background-color: #0e639c;
      border: none;
      border-radius: 4px;
      color: white;
      cursor: pointer;
      font-size: 12px;
    }

    .trace-content {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .traces-list {
      width: 300px;
      border-right: 1px solid #3e3e42;
      overflow-y: auto;
      background-color: #1e1e1e;
    }

    .empty-state {
      padding: 20px;
      text-align: center;
      color: #858585;
    }

    .trace-item {
      padding: 8px 12px;
      border-bottom: 1px solid #2d2d30;
      cursor: pointer;
      background-color: transparent;
      border-left: 3px solid transparent;
    }

    .trace-item.selected {
      background-color: #094771;
      border-left-color: #007acc;
    }

    .trace-item.error {
      border-left-color: #f48771;
    }

    .trace-item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }

    .trace-event-key {
      color: #4ec9b0;
      font-weight: bold;
      font-size: 11px;
    }

    .trace-event-key.error-text {
      color: #f48771;
    }

    .trace-duration {
      color: #858585;
      font-size: 10px;
    }

    .trace-timestamp {
      color: #858585;
      font-size: 10px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .trace-error {
      color: #f48771;
      font-size: 10px;
      margin-top: 4px;
    }

    .trace-details {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
    }

    .empty-details {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #858585;
    }

    .detail-section {
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #3e3e42;
    }

    .detail-section h3 {
      margin: 0 0 8px 0;
      color: #4ec9b0;
      font-size: 14px;
    }

    .detail-item {
      margin-bottom: 4px;
    }

    .detail-label {
      color: #858585;
    }

    .detail-value {
      color: #d4d4d4;
    }

    .detail-value-string {
      color: #ce9178;
    }

    .error-text {
      color: #f48771;
    }

    .code-block {
      margin: 4px 0 0 0;
      padding: 8px;
      background-color: #252526;
      border-radius: 4px;
      overflow: auto;
      font-size: 11px;
    }

    .error-block {
      background-color: #3c1e1e;
      color: #f48771;
    }

    .interceptor-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .interceptor-item {
      padding: 4px 8px;
      background-color: #252526;
      border-radius: 4px;
      font-size: 11px;
    }

    .effect-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .effect-item {
      padding: 6px 8px;
      background-color: #252526;
      border-radius: 4px;
      font-size: 11px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-left: 3px solid #4ec9b0;
    }

    .effect-item.error {
      border-left-color: #f48771;
    }

    .effect-type {
      color: #4ec9b0;
      font-weight: bold;
    }

    .effect-duration {
      color: #858585;
    }

    .state-diff {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .state-label {
      color: #858585;
      font-size: 11px;
      margin-bottom: 4px;
    }

    .state-block {
      margin: 0;
      padding: 8px;
      background-color: #252526;
      border-radius: 4px;
      overflow: auto;
      font-size: 11px;
      max-height: 300px;
    }
  `]
})
export class TraceViewerComponent implements OnInit, OnDestroy, AfterViewChecked {
  private store = injectStore<AppState>();
  @ViewChild('tracesEnd') tracesEndRef?: ElementRef<HTMLDivElement>;

  isExpanded = signal(false);
  traces = signal<EventTrace<AppState>[]>([]);
  filter = signal('');
  selectedTrace = signal<EventTrace<AppState> | null>(null);

  filteredTraces = computed(() => {
    const filterValue = this.filter().toLowerCase();
    return this.traces().filter(trace =>
      trace.eventKey.toLowerCase().includes(filterValue)
    );
  });

  constructor() {
    // Auto-scroll to bottom when new traces arrive
    effect(() => {
      if (this.isExpanded() && this.traces().length > 0) {
        // Use setTimeout to ensure DOM is updated
        setTimeout(() => {
          this.scrollToBottom();
        }, 0);
      }
    });
  }

  ngOnInit() {
    // Register trace callback
    this.store.registerTraceCallback('trace-viewer', (newTraces: EventTrace<AppState>[]) => {
      this.traces.update(prev => [...prev, ...newTraces]);
    });
  }

  ngOnDestroy() {
    // Cleanup: remove trace callback
    this.store.removeTraceCallback('trace-viewer');
  }

  ngAfterViewChecked() {
    // Scroll handling is done in effect
  }

  toggleExpanded() {
    this.isExpanded.update(v => !v);
  }

  clearTraces() {
    this.traces.set([]);
    this.selectedTrace.set(null);
  }

  formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });
  }

  formatDuration(duration: number): string {
    if (duration < 1) {
      return `${(duration * 1000).toFixed(2)}μs`;
    }
    return `${duration.toFixed(2)}ms`;
  }

  formatJSON(obj: any): string {
    return JSON.stringify(obj, null, 2);
  }

  hasPayload(payload: any): boolean {
    return payload && Object.keys(payload).length > 0;
  }

  hasEffectMap(effectMap: any): boolean {
    return effectMap && Object.keys(effectMap).length > 0;
  }

  private scrollToBottom() {
    if (this.tracesEndRef?.nativeElement) {
      this.tracesEndRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

