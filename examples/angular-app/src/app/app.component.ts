import { Component } from '@angular/core';
import { CounterComponent } from './components/counter/counter.component';
import { TodoListComponent } from './components/todo-list/todo-list.component';
import { AsyncExampleComponent } from './components/async-example/async-example.component';
import { ErrorTestComponent } from './components/error-test/error-test.component';
import { TraceViewerComponent } from './components/trace-viewer/trace-viewer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CounterComponent,
    TodoListComponent,
    AsyncExampleComponent,
    ErrorTestComponent,
    TraceViewerComponent
  ],
  template: `
    <div style="max-width: 1200px; margin: 0 auto; padding-bottom: 60px;">
      <header style="text-align: center; margin-bottom: 30px;">
        <h1>Ripple State Management - Angular Example</h1>
        <p style="color: #666;">Demonstrating Ripple with Angular Signals</p>
      </header>
      
      <main>
        <app-counter></app-counter>
        <app-todo-list></app-todo-list>
        <app-async-example></app-async-example>
        <app-error-test></app-error-test>
      </main>
    </div>
    <app-trace-viewer></app-trace-viewer>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AppComponent {
}

