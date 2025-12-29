import React, { useState } from 'react'
import { useDispatch } from '@ripple/react'
import {
  useTodos,
  useFilteredTodos,
  useTodoFilter,
  useActiveTodoCount,
  useCompletedTodoCount,
} from '../hooks'
import { todoEvents } from '../store/events'

/**
 * TodoList Component
 * Demonstrates complex state management with arrays and filtering using factory subscription hooks
 */
export function TodoList() {
  const dispatch = useDispatch()
  const [inputValue, setInputValue] = useState('')

  const todos = useTodos()
  const filteredTodos = useFilteredTodos()
  const filter = useTodoFilter()
  const activeCount = useActiveTodoCount()
  const completedCount = useCompletedTodoCount()

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      dispatch(todoEvents.add, { text: inputValue.trim() })
      setInputValue('')
    }
  }

  const handleToggle = (id: string) => {
    dispatch(todoEvents.toggle, { id })
  }

  const handleRemove = (id: string) => {
    dispatch(todoEvents.remove, { id })
  }

  const handleFilterChange = (newFilter: 'all' | 'active' | 'completed') => {
    dispatch(todoEvents.setFilter, { filter: newFilter })
  }

  const handleClearCompleted = () => {
    dispatch(todoEvents.clearCompleted)
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', margin: '10px' }}>
      <h2>Todo List Example</h2>

      <form onSubmit={handleAdd} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="Add a new todo..."
          style={{ padding: '8px', marginRight: '10px', width: '300px' }}
        />
        <button type="submit">Add Todo</button>
      </form>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => handleFilterChange('all')}
          style={{
            marginRight: '5px',
            backgroundColor: filter === 'all' ? '#007bff' : '#f0f0f0',
            color: filter === 'all' ? 'white' : 'black',
          }}
        >
          All ({todos.length})
        </button>
        <button
          onClick={() => handleFilterChange('active')}
          style={{
            marginRight: '5px',
            backgroundColor: filter === 'active' ? '#007bff' : '#f0f0f0',
            color: filter === 'active' ? 'white' : 'black',
          }}
        >
          Active ({activeCount})
        </button>
        <button
          onClick={() => handleFilterChange('completed')}
          style={{
            marginRight: '5px',
            backgroundColor: filter === 'completed' ? '#007bff' : '#f0f0f0',
            color: filter === 'completed' ? 'white' : 'black',
          }}
        >
          Completed ({completedCount})
        </button>
        {completedCount > 0 && (
          <button onClick={handleClearCompleted} style={{ marginLeft: '10px' }}>
            Clear Completed
          </button>
        )}
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {filteredTodos.length === 0 ? (
          <li style={{ padding: '10px', color: '#666' }}>No todos to display</li>
        ) : (
          filteredTodos.map(todo => (
            <li
              key={todo.id}
              style={{
                padding: '10px',
                marginBottom: '5px',
                backgroundColor: '#f9f9f9',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggle(todo.id)}
              />
              <span
                style={{
                  flex: 1,
                  textDecoration: todo.completed ? 'line-through' : 'none',
                  color: todo.completed ? '#999' : 'black',
                }}
              >
                {todo.text}
              </span>
              <button onClick={() => handleRemove(todo.id)} style={{ fontSize: '12px' }}>
                Remove
              </button>
            </li>
          ))
        )}
      </ul>

      <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
        This demonstrates complex state management with arrays, filtering, and multiple event
        handlers.
      </p>
    </div>
  )
}

