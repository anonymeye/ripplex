// Application state types

export interface CounterState {
  count: number
}

export interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: Date
}

export interface TodoState {
  todos: Todo[]
  filter: 'all' | 'active' | 'completed'
}

export interface AsyncState {
  data: string | null
  loading: boolean
  error: string | null
}

export interface AppState {
  counter: CounterState
  todos: TodoState
  async: AsyncState
}

// Coeffects type - defines what values are available in event handler context
export interface AppCoeffects {
  uuid: string
  now: Date
  random: number
}

