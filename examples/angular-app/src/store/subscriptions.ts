import { SubscriptionConfig } from '@ripple/core'
import { AppState, CounterState, TodoState, Todo, AsyncState } from './types'

/**
 * Subscription definitions for the app
 * These define how to compute derived state from the store
 * 
 * Subscriptions provide several advantages over computed() signals:
 * - Shared computation: Multiple components subscribing to the same subscription share computation
 * - Dependency graphs: Subscriptions can depend on other subscriptions
 * - Memoization: Results are cached and only recomputed when dependencies change
 * - Selective updates: Components only update when their subscribed values change
 */

// Counter subscriptions
export const counterSubscriptions: Record<string, SubscriptionConfig<AppState, any, any, any>> = {
  'counter/count': {
    compute: (state: AppState) => state.counter.count,
  },
  'counter/state': {
    compute: (state: AppState): CounterState => state.counter,
  },
}

// Todo subscriptions
export const todoSubscriptions: Record<string, SubscriptionConfig<AppState, any, any, any>> = {
  // Base subscription - extracts todos array from state
  'todos/all': {
    compute: (state: AppState): Todo[] => state.todos.todos,
  },
  // Base subscription - extracts filter from state
  'todos/filter': {
    compute: (state: AppState): 'all' | 'active' | 'completed' => state.todos.filter,
  },
  // Base subscription - extracts entire todo state
  'todos/state': {
    compute: (state: AppState): TodoState => state.todos,
  },
  
  // Derived subscription using deps - filters todos based on filter
  'todos/filtered': {
    deps: ['todos/all', 'todos/filter'],
    combine: (deps: [Todo[], 'all' | 'active' | 'completed']): Todo[] => {
      const [todos, filter] = deps
      if (filter === 'active') return todos.filter(t => !t.completed)
      if (filter === 'completed') return todos.filter(t => t.completed)
      return todos
    },
  } as SubscriptionConfig<AppState, Todo[], [], [Todo[], 'all' | 'active' | 'completed']>,
  
  // Derived subscription using deps - counts active todos
  'todos/activeCount': {
    deps: ['todos/all'],
    combine: (deps: [Todo[]]): number => {
      const [todos] = deps
      return todos.filter(t => !t.completed).length
    },
  } as SubscriptionConfig<AppState, number, [], [Todo[]]>,
  
  // Derived subscription using deps - counts completed todos
  'todos/completedCount': {
    deps: ['todos/all'],
    combine: (deps: [Todo[]]): number => {
      const [todos] = deps
      return todos.filter(t => t.completed).length
    },
  } as SubscriptionConfig<AppState, number, [], [Todo[]]>,
  
  // Derived subscription using deps - total count
  'todos/totalCount': {
    deps: ['todos/all'],
    combine: (deps: [Todo[]]): number => {
      const [todos] = deps
      return todos.length
    },
  } as SubscriptionConfig<AppState, number, [], [Todo[]]>,
  
  // Derived subscription using deps with params - find todo by id
  'todos/byId': {
    deps: ['todos/all'],
    combine: (deps: [Todo[]], id: string): Todo | undefined => {
      const [todos] = deps
      return todos.find(todo => todo.id === id)
    },
  } as SubscriptionConfig<AppState, Todo | undefined, [string], [Todo[]]>,
  
  // Multi-level dependency example - stats that depend on other derived subscriptions
  'todos/stats': {
    deps: ['todos/totalCount', 'todos/activeCount', 'todos/completedCount'],
    combine: (deps: [number, number, number]) => {
      const [total, active, completed] = deps
      return {
        total,
        active,
        completed,
        completionRate: total > 0 ? (completed / total) * 100 : 0,
      }
    },
  } as SubscriptionConfig<AppState, { total: number; active: number; completed: number; completionRate: number }, [], [number, number, number]>,
}

// Async subscriptions
export const asyncSubscriptions: Record<string, SubscriptionConfig<AppState, any, any, any>> = {
  // Base subscriptions - extract individual fields
  'async/data': {
    compute: (state: AppState): string | null => state.async.data,
  },
  'async/loading': {
    compute: (state: AppState): boolean => state.async.loading,
  },
  'async/error': {
    compute: (state: AppState): string | null => state.async.error,
  },
  'async/state': {
    compute: (state: AppState): AsyncState => state.async,
  },
  
  // Derived subscription using deps - check if async operation is ready
  'async/ready': {
    deps: ['async/loading', 'async/error'],
    combine: (deps: [boolean, string | null]): boolean => {
      const [loading, error] = deps
      return !loading && !error
    },
  } as SubscriptionConfig<AppState, boolean, [], [boolean, string | null]>,
  
  // Derived subscription using deps - check if async operation has data
  'async/hasData': {
    deps: ['async/data'],
    combine: (deps: [string | null]): boolean => {
      const [data] = deps
      return data !== null
    },
  } as SubscriptionConfig<AppState, boolean, [], [string | null]>,
}

// Error test subscriptions
export const errorTestSubscriptions: Record<string, SubscriptionConfig<AppState, any, any, any>> = {
  'error/count': {
    compute: (state: AppState) => {
      // This will never error, just for testing subscription access
      return (state as any).errorCount ?? 0
    }
  },
  
  'error/throws': {
    compute: () => {
      throw new Error('Subscription computation error!')
    }
  },
  
  'error/dep-throws': {
    deps: ['error/throws'],  // This dependency will throw
    combine: (deps: any[]) => {
      return deps[0]
    }
  }
}

// Combine all subscriptions
export const allSubscriptions = {
  ...counterSubscriptions,
  ...todoSubscriptions,
  ...asyncSubscriptions,
  ...errorTestSubscriptions,
}

