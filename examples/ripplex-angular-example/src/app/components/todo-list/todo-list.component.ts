import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { injectSubscription, injectDispatch } from '@rplx/angular';
import { Todo } from '../../../store/types';
import { todoEvents } from '../../../store/events';

/**
 * TodoList Component
 * Demonstrates complex state management with arrays and filtering
 */
@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="example-container">
      <h2>Todo List Example</h2>

      <form (ngSubmit)="handleAdd()" class="todo-form">
        <input
          type="text"
          [(ngModel)]="inputValue"
          name="todoInput"
          placeholder="Add a new todo..."
          class="todo-input"
        />
        <button type="submit">Add Todo</button>
      </form>

      <div class="filter-buttons">
        <button
          (click)="handleFilterChange('all')"
          [class.active]="filter() === 'all'"
        >
          All ({{ todos().length }})
        </button>
        <button
          (click)="handleFilterChange('active')"
          [class.active]="filter() === 'active'"
        >
          Active ({{ activeCount() }})
        </button>
        <button
          (click)="handleFilterChange('completed')"
          [class.active]="filter() === 'completed'"
        >
          Completed ({{ completedCount() }})
        </button>
        <button
          *ngIf="completedCount() > 0"
          (click)="handleClearCompleted()"
          class="clear-button"
        >
          Clear Completed
        </button>
      </div>

      <ul class="todo-list">
        <li *ngIf="filteredTodos().length === 0" class="empty-message">
          No todos to display
        </li>
        <li *ngFor="let todo of filteredTodos()" class="todo-item">
          <input
            type="checkbox"
            [checked]="todo.completed"
            (change)="handleToggle(todo.id)"
          />
          <span [class.completed]="todo.completed" class="todo-text">
            {{ todo.text }}
          </span>
          <button (click)="handleRemove(todo.id)" class="remove-button">
            Remove
          </button>
        </li>
      </ul>

      <p class="description">
        This demonstrates complex state management with arrays, filtering, and multiple event handlers.
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

    .todo-form {
      margin-bottom: 20px;
      display: flex;
      gap: 10px;
    }

    .todo-input {
      flex: 1;
      padding: 8px;
      margin-right: 10px;
    }

    .filter-buttons {
      margin-bottom: 20px;
      display: flex;
      gap: 5px;
      flex-wrap: wrap;
    }

    .filter-buttons button {
      margin-right: 5px;
    }

    .filter-buttons button.active {
      background-color: #007bff;
      color: white;
    }

    .clear-button {
      margin-left: 10px;
    }

    .todo-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .empty-message {
      padding: 10px;
      color: #666;
    }

    .todo-item {
      padding: 10px;
      margin-bottom: 5px;
      background-color: #f9f9f9;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .todo-text {
      flex: 1;
    }

    .todo-text.completed {
      text-decoration: line-through;
      color: #999;
    }

    .remove-button {
      font-size: 12px;
    }

    .description {
      font-size: 12px;
      color: #666;
      margin-top: 10px;
    }
  `]
})
export class TodoListComponent {
  private dispatch = injectDispatch();
  
  inputValue = signal('');

  // Use subscriptions instead of computed() - provides shared computation and better performance
  // Multiple components using the same subscriptions will share computation
  todos = injectSubscription<Todo[]>('todos/all');
  filter = injectSubscription<'all' | 'active' | 'completed'>('todos/filter');
  
  // Derived subscriptions - these depend on other subscriptions and are computed once, shared across components
  activeCount = injectSubscription<number>('todos/activeCount');
  completedCount = injectSubscription<number>('todos/completedCount');
  filteredTodos = injectSubscription<Todo[]>('todos/filtered');

  handleAdd() {
    const value = this.inputValue().trim();
    if (value) {
      this.dispatch(todoEvents.add, { text: value });
      this.inputValue.set('');
    }
  }

  handleToggle(id: string) {
    this.dispatch(todoEvents.toggle, { id });
  }

  handleRemove(id: string) {
    this.dispatch(todoEvents.remove, { id });
  }

  handleFilterChange(newFilter: 'all' | 'active' | 'completed') {
    this.dispatch(todoEvents.setFilter, { filter: newFilter });
  }

  handleClearCompleted() {
    this.dispatch(todoEvents.clearCompleted);
  }
}

