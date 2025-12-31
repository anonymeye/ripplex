import { EffectMap, path, debug, after, validate, Interceptor } from '@rplx/core'
import { AppState, AppCoeffects, Todo, CounterState, TodoState, AsyncState } from './types'

// Counter events
export const counterEvents = {
  increment: 'counter/increment',
  decrement: 'counter/decrement',
  reset: 'counter/reset',
  set: 'counter/set',
} as const

// Counter event definitions with interceptors attached
export const counterEventDefinitions = {
  [counterEvents.increment]: {
    interceptors: [path<AppState>(['counter']), debug<AppState>()],
    handler: (context: { db: CounterState } & AppCoeffects, _payload: any): CounterState => {
      return { ...context.db, count: context.db.count + 1 }
    },
  },

  [counterEvents.decrement]: {
    interceptors: [path<AppState>(['counter']), debug<AppState>()],
    handler: (context: { db: CounterState } & AppCoeffects, _payload: any): CounterState => {
      return { ...context.db, count: context.db.count - 1 }
    },
  },

  [counterEvents.reset]: {
    interceptors: [path<AppState>(['counter'])],
    handler: (context: { db: CounterState } & AppCoeffects, _payload: any): CounterState => {
      return { ...context.db, count: 0 }
    },
  },

  [counterEvents.set]: {
    interceptors: [path<AppState>(['counter']), debug<AppState>()],
    handler: (
      context: { db: CounterState } & AppCoeffects,
      payload: { value: number }
    ): CounterState => {
      return { ...context.db, count: payload.value }
    },
  },
}

// Todo events
export const todoEvents = {
  add: 'todo/add',
  toggle: 'todo/toggle',
  remove: 'todo/remove',
  setFilter: 'todo/setFilter',
  clearCompleted: 'todo/clearCompleted',
  loadFromStorage: 'todo/loadFromStorage',
  setTodos: 'todo/setTodos',
} as const

// Todo event definitions with interceptors attached
// For array operations (add, toggle, remove, clearCompleted), use path(['todos', 'todos']) to focus on just the array
// For setFilter, use path(['todos']) since it needs to update the filter property
export const todoEventDefinitions = {
  [todoEvents.add]: {
    type: 'fx' as const,
    interceptors: [
      validate<AppState>((state) => {
        const todos = state.todos.todos
        return Array.isArray(todos) ? true : 'Todos must be an array'
      }),
      path<AppState>(['todos', 'todos']),
      debug<AppState>(),
    ],
    handler: (context: { db: Todo[] } & AppCoeffects, payload: { text: string }): EffectMap => {
      const newTodo: Todo = {
        id: context.uuid,
        text: payload.text,
        completed: false,
        createdAt: context.now,
      }
      const newTodos = [...context.db, newTodo]
      return {
        db: newTodos,
        'local-storage': {
          key: 'ripple-todos',
          action: 'set',
          value: newTodos,
        },
      }
    },
  },

  [todoEvents.toggle]: {
    type: 'fx' as const,
    interceptors: [path<AppState>(['todos', 'todos']), debug<AppState>()],
    handler: (context: { db: Todo[] } & AppCoeffects, payload: { id: string }): EffectMap => {
      const newTodos = context.db.map((todo: Todo) =>
        todo.id === payload.id ? { ...todo, completed: !todo.completed } : todo
      )
      return {
        db: newTodos,
        'local-storage': {
          key: 'ripple-todos',
          action: 'set',
          value: newTodos,
        },
      }
    },
  },

  [todoEvents.remove]: {
    type: 'fx' as const,
    interceptors: [path<AppState>(['todos', 'todos'])],
    handler: (context: { db: Todo[] } & AppCoeffects, payload: { id: string }): EffectMap => {
      const newTodos = context.db.filter((todo: Todo) => todo.id !== payload.id)
      return {
        db: newTodos,
        'local-storage': {
          key: 'ripple-todos',
          action: 'set',
          value: newTodos,
        },
      }
    },
  },

  [todoEvents.setFilter]: {
    interceptors: [path<AppState>(['todos'])],
    handler: (
      context: { db: TodoState } & AppCoeffects,
      payload: { filter: 'all' | 'active' | 'completed' }
    ): TodoState => {
      return { ...context.db, filter: payload.filter }
    },
  },

  [todoEvents.clearCompleted]: {
    type: 'fx' as const,
    interceptors: [
      after<AppState>((db, _effects) => {
        console.log(`Cleared completed todos. Remaining: ${db.todos.todos.length}`)
      }),
      path<AppState>(['todos', 'todos']),
    ],
    handler: (context: { db: Todo[] } & AppCoeffects, _payload: any): EffectMap => {
      const newTodos = context.db.filter((todo: Todo) => !todo.completed)
      return {
        db: newTodos,
        'local-storage': {
          key: 'ripple-todos',
          action: 'set',
          value: newTodos,
        },
      }
    },
  },

  [todoEvents.loadFromStorage]: {
    type: 'fx' as const,
    handler: (_context: { db: AppState } & AppCoeffects, _payload: any): EffectMap => {
      return {
        'local-storage': {
          key: 'ripple-todos',
          action: 'get',
          onSuccess: todoEvents.setTodos,
        },
      }
    },
  },

  [todoEvents.setTodos]: {
    interceptors: [path<AppState>(['todos', 'todos'])],
    handler: (_context: { db: Todo[] } & AppCoeffects, payload: { data: string | null }): Todo[] => {
      if (!payload.data) {
        return []
      }
      try {
        const parsed = JSON.parse(payload.data) as Todo[]
        // Ensure dates are Date objects
        return parsed.map(todo => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
        }))
      } catch (error) {
        console.error('Failed to parse todos from localStorage:', error)
        return []
      }
    },
  },
}

// Async events
export const asyncEvents = {
  fetchStart: 'async/fetchStart',
  fetchSuccess: 'async/fetchSuccess',
  fetchError: 'async/fetchError',
  fetch: 'async/fetch', // This will trigger an effect
} as const

// Async event definitions with interceptors attached
export const asyncEventDefinitions = {
  [asyncEvents.fetchStart]: {
    interceptors: [path<AppState>(['async'])],
    handler: (context: { db: AsyncState } & AppCoeffects, _payload: any): AsyncState => {
      return {
        ...context.db,
        loading: true,
        error: null,
      }
    },
  },

  [asyncEvents.fetchSuccess]: {
    interceptors: [
      after<AppState>((db, _effects) => {
        console.log('Data fetch successful!', db.async.data?.substring(0, 50))
      }),
      path<AppState>(['async']),
      debug<AppState>(),
    ],
    handler: (
      _context: { db: AsyncState } & AppCoeffects,
      payload: { data: string }
    ): AsyncState => {
      return {
        data: payload.data,
        loading: false,
        error: null,
      }
    },
  },

  [asyncEvents.fetchError]: {
    interceptors: [
      after<AppState>((db, _effects) => {
        console.error('Data fetch failed:', db.async.error)
      }),
      path<AppState>(['async']),
    ],
    handler: (
      context: { db: AsyncState } & AppCoeffects,
      payload: { error: string }
    ): AsyncState => {
      return {
        ...context.db,
        loading: false,
        error: payload.error,
      }
    },
  },

  [asyncEvents.fetch]: {
    type: 'fx' as const,
    interceptors: [
      path<AppState>(['async']),
      debug<AppState>(),
      after<AppState>((_db, _effects) => {
        console.log('Fetch effect triggered')
      }),
    ],
    handler: (context: { db: AsyncState } & AppCoeffects, _payload: any): EffectMap => {
      // This event handler triggers an effect to actually fetch data
      // First, set loading state via :db effect
      const newState: AsyncState = {
        ...context.db,
        loading: true,
        error: null,
      }

      // Return effects map with state update and http request
      return {
        db: newState,
        'http-request': {
          url: 'https://jsonplaceholder.typicode.com/posts/1',
          method: 'GET',
          onSuccess: asyncEvents.fetchSuccess,
          onError: asyncEvents.fetchError,
        },
      }
    },
  },
}

// Error test events
export const errorTestEvents = {
  interceptorBeforeError: 'test/interceptor-before-error',
  interceptorAfterError: 'test/interceptor-after-error',
  handlerError: 'test/handler-error',
  effectError: 'test/effect-error',
  subscriptionError: 'test/subscription-error',
} as const

// Error test event definitions
export const errorTestEventDefinitions = {
  [errorTestEvents.interceptorBeforeError]: {
    interceptors: [
      {
        id: 'error-before',
        before: () => {
          throw new Error('Interceptor before phase error!')
        }
      } as Interceptor<AppState, AppCoeffects>,
    ],
    handler: (context: { db: AppState } & AppCoeffects): AppState => {
      return context.db
    }
  },

  [errorTestEvents.interceptorAfterError]: {
    interceptors: [
      {
        id: 'error-after',
        after: () => {
          throw new Error('Interceptor after phase error!')
        }
      } as Interceptor<AppState, AppCoeffects>,
    ],
    handler: (context: { db: AppState } & AppCoeffects): AppState => {
      return context.db
    }
  },

  [errorTestEvents.handlerError]: {
    handler: (): AppState => {
      throw new Error('Event handler error!')
    }
  },

  [errorTestEvents.effectError]: {
    type: 'fx' as const,
    handler: (context: { db: AppState } & AppCoeffects): EffectMap => {
      return {
        db: context.db,
        'error-effect': { shouldThrow: true }
      }
    }
  },

  [errorTestEvents.subscriptionError]: {
    handler: (context: { db: AppState } & AppCoeffects): AppState => {
      // This event doesn't need to do anything special
      // The subscription error test is done via direct query in the component
      return context.db
    }
  },
}

// Combine all event definitions
export const allEventDefinitions = {
  ...counterEventDefinitions,
  ...todoEventDefinitions,
  ...asyncEventDefinitions,
  ...errorTestEventDefinitions,
}
