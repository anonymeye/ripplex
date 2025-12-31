import { createSubscriptionHook } from '@rplx/react'
import { CounterState, Todo, TodoState, AsyncState } from '../store/types'

/**
 * Factory hooks for subscriptions
 * These are created once at module level and can be reused throughout the app
 */

// Counter subscription hooks
export const useCounterCount = createSubscriptionHook<number>('counter/count')
export const useCounterState = createSubscriptionHook<CounterState>('counter/state')

// Todo subscription hooks
export const useTodos = createSubscriptionHook<Todo[]>('todos/all')
export const useFilteredTodos = createSubscriptionHook<Todo[]>('todos/filtered')
export const useTodoFilter = createSubscriptionHook<'all' | 'active' | 'completed'>('todos/filter')
export const useActiveTodoCount = createSubscriptionHook<number>('todos/activeCount')
export const useCompletedTodoCount = createSubscriptionHook<number>('todos/completedCount')
export const useTotalTodoCount = createSubscriptionHook<number>('todos/totalCount')
export const useTodoById = createSubscriptionHook<Todo | undefined, [string]>('todos/byId')
export const useTodoState = createSubscriptionHook<TodoState>('todos/state')
export const useTodoStats = createSubscriptionHook<{
  total: number
  active: number
  completed: number
  completionRate: number
}>('todos/stats')

// Async subscription hooks
export const useAsyncData = createSubscriptionHook<string | null>('async/data')
export const useAsyncLoading = createSubscriptionHook<boolean>('async/loading')
export const useAsyncError = createSubscriptionHook<string | null>('async/error')
export const useAsyncState = createSubscriptionHook<AsyncState>('async/state')
export const useAsyncReady = createSubscriptionHook<boolean>('async/ready')
export const useAsyncHasData = createSubscriptionHook<boolean>('async/hasData')

