import { useEffect, useState, useRef } from 'react'
import { EventTrace } from '@ripple/core'
import { store } from '../store/store'
import { AppState } from '../store/types'

/**
 * TraceViewer Component
 * DevTools-style bottom panel for viewing event traces
 */
export function TraceViewer() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [traces, setTraces] = useState<EventTrace<AppState>[]>([])
  const [filter, setFilter] = useState('')
  const [selectedTrace, setSelectedTrace] = useState<EventTrace<AppState> | null>(null)
  const tracesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Register trace callback
    store.registerTraceCallback('trace-viewer', (newTraces: EventTrace<AppState>[]) => {
      setTraces((prev) => [...prev, ...newTraces])
    })

    return () => {
      // Cleanup: remove trace callback
      store.removeTraceCallback('trace-viewer')
    }
  }, [])

  // Auto-scroll to bottom when new traces arrive
  useEffect(() => {
    if (isExpanded && tracesEndRef.current) {
      tracesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [traces, isExpanded])

  const filteredTraces = traces.filter((trace) =>
    trace.eventKey.toLowerCase().includes(filter.toLowerCase())
  )

  const clearTraces = () => {
    setTraces([])
    setSelectedTrace(null)
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    })
  }

  const formatDuration = (duration: number) => {
    if (duration < 1) {
      return `${(duration * 1000).toFixed(2)}μs`
    }
    return `${duration.toFixed(2)}ms`
  }

  const getStateDiff = (before: AppState, after: AppState) => {
    // Simple JSON comparison for demo
    const beforeStr = JSON.stringify(before, null, 2)
    const afterStr = JSON.stringify(after, null, 2)
    return { before: beforeStr, after: afterStr }
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: '#1e1e1e',
        color: '#d4d4d4',
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
        fontSize: '12px',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: isExpanded ? '50vh' : '40px',
        transition: 'max-height 0.3s ease',
        overflow: 'hidden',
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          backgroundColor: '#252526',
          borderBottom: '1px solid #3e3e42',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px' }}>{isExpanded ? '▼' : '▲'}</span>
          <span style={{ fontWeight: 'bold', color: '#4ec9b0' }}>Ripple Trace</span>
          <span
            style={{
              backgroundColor: '#007acc',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '10px',
              fontSize: '10px',
            }}
          >
            {traces.length}
          </span>
        </div>
        {isExpanded && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="text"
              placeholder="Filter events..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{
                padding: '4px 8px',
                backgroundColor: '#3c3c3c',
                border: '1px solid #3e3e42',
                borderRadius: '4px',
                color: '#d4d4d4',
                fontSize: '12px',
                width: '200px',
              }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation()
                clearTraces()
              }}
              style={{
                padding: '4px 12px',
                backgroundColor: '#0e639c',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      {isExpanded && (
        <div
          style={{
            display: 'flex',
            flex: 1,
            overflow: 'hidden',
          }}
        >
          {/* Traces List */}
          <div
            style={{
              width: '300px',
              borderRight: '1px solid #3e3e42',
              overflowY: 'auto',
              backgroundColor: '#1e1e1e',
            }}
          >
            {filteredTraces.length === 0 ? (
              <div
                style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: '#858585',
                }}
              >
                {traces.length === 0 ? 'No traces yet' : 'No traces match filter'}
              </div>
            ) : (
              filteredTraces.map((trace) => (
                <div
                  key={trace.id}
                  onClick={() => setSelectedTrace(trace)}
                  style={{
                    padding: '8px 12px',
                    borderBottom: '1px solid #2d2d30',
                    cursor: 'pointer',
                    backgroundColor:
                      selectedTrace?.id === trace.id ? '#094771' : 'transparent',
                    borderLeft:
                      selectedTrace?.id === trace.id
                        ? '3px solid #007acc'
                        : trace.error
                          ? '3px solid #f48771'
                          : '3px solid transparent',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px',
                    }}
                  >
                    <span
                      style={{
                        color: trace.error ? '#f48771' : '#4ec9b0',
                        fontWeight: 'bold',
                        fontSize: '11px',
                      }}
                    >
                      {trace.eventKey}
                    </span>
                    <span
                      style={{
                        color: '#858585',
                        fontSize: '10px',
                      }}
                    >
                      {formatDuration(trace.duration)}
                    </span>
                  </div>
                  <div
                    style={{
                      color: '#858585',
                      fontSize: '10px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatTimestamp(trace.timestamp)}
                  </div>
                  {trace.error && (
                    <div
                      style={{
                        color: '#f48771',
                        fontSize: '10px',
                        marginTop: '4px',
                      }}
                    >
                      ⚠ {trace.error.message}
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={tracesEndRef} />
          </div>

          {/* Trace Details */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
            }}
          >
            {selectedTrace ? (
              <div>
                <div
                  style={{
                    marginBottom: '16px',
                    paddingBottom: '12px',
                    borderBottom: '1px solid #3e3e42',
                  }}
                >
                  <h3
                    style={{
                      margin: '0 0 8px 0',
                      color: '#4ec9b0',
                      fontSize: '14px',
                    }}
                  >
                    Event Details
                  </h3>
                  <div style={{ marginBottom: '4px' }}>
                    <span style={{ color: '#858585' }}>Event:</span>{' '}
                    <span style={{ color: '#ce9178' }}>{selectedTrace.eventKey}</span>
                  </div>
                  <div style={{ marginBottom: '4px' }}>
                    <span style={{ color: '#858585' }}>ID:</span>{' '}
                    <span style={{ color: '#d4d4d4' }}>#{selectedTrace.id}</span>
                  </div>
                  <div style={{ marginBottom: '4px' }}>
                    <span style={{ color: '#858585' }}>Timestamp:</span>{' '}
                    <span style={{ color: '#d4d4d4' }}>
                      {formatTimestamp(selectedTrace.timestamp)}
                    </span>
                  </div>
                  <div style={{ marginBottom: '4px' }}>
                    <span style={{ color: '#858585' }}>Duration:</span>{' '}
                    <span style={{ color: '#d4d4d4' }}>
                      {formatDuration(selectedTrace.duration)}
                    </span>
                  </div>
                  {selectedTrace.payload && Object.keys(selectedTrace.payload).length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      <span style={{ color: '#858585' }}>Payload:</span>
                      <pre
                        style={{
                          margin: '4px 0 0 0',
                          padding: '8px',
                          backgroundColor: '#252526',
                          borderRadius: '4px',
                          overflow: 'auto',
                          fontSize: '11px',
                        }}
                      >
                        {JSON.stringify(selectedTrace.payload, null, 2)}
                      </pre>
                    </div>
                  )}
                  {selectedTrace.error && (
                    <div style={{ marginTop: '8px' }}>
                      <span style={{ color: '#f48771' }}>Error:</span>
                      <pre
                        style={{
                          margin: '4px 0 0 0',
                          padding: '8px',
                          backgroundColor: '#3c1e1e',
                          borderRadius: '4px',
                          overflow: 'auto',
                          fontSize: '11px',
                          color: '#f48771',
                        }}
                      >
                        {selectedTrace.error.message}
                        {selectedTrace.error.stack && (
                          <div style={{ marginTop: '4px', fontSize: '10px' }}>
                            {selectedTrace.error.stack}
                          </div>
                        )}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Interceptors */}
                {selectedTrace.interceptors.length > 0 && (
                  <div
                    style={{
                      marginBottom: '16px',
                      paddingBottom: '12px',
                      borderBottom: '1px solid #3e3e42',
                    }}
                  >
                    <h3
                      style={{
                        margin: '0 0 8px 0',
                        color: '#4ec9b0',
                        fontSize: '14px',
                      }}
                    >
                      Interceptors ({selectedTrace.interceptors.length})
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {selectedTrace.interceptors.map((interceptor, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#252526',
                            borderRadius: '4px',
                            fontSize: '11px',
                          }}
                        >
                          <span style={{ color: '#858585' }}>#{interceptor.order}</span>{' '}
                          <span style={{ color: '#d4d4d4' }}>
                            {interceptor.id || 'unnamed'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Effects */}
                {Object.keys(selectedTrace.effectMap).length > 0 && (
                  <div
                    style={{
                      marginBottom: '16px',
                      paddingBottom: '12px',
                      borderBottom: '1px solid #3e3e42',
                    }}
                  >
                    <h3
                      style={{
                        margin: '0 0 8px 0',
                        color: '#4ec9b0',
                        fontSize: '14px',
                      }}
                    >
                      Effects Map
                    </h3>
                    <pre
                      style={{
                        margin: '0',
                        padding: '8px',
                        backgroundColor: '#252526',
                        borderRadius: '4px',
                        overflow: 'auto',
                        fontSize: '11px',
                      }}
                    >
                      {JSON.stringify(selectedTrace.effectMap, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Effects Executed */}
                {selectedTrace.effectsExecuted.length > 0 && (
                  <div
                    style={{
                      marginBottom: '16px',
                      paddingBottom: '12px',
                      borderBottom: '1px solid #3e3e42',
                    }}
                  >
                    <h3
                      style={{
                        margin: '0 0 8px 0',
                        color: '#4ec9b0',
                        fontSize: '14px',
                      }}
                    >
                      Effects Executed ({selectedTrace.effectsExecuted.length})
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {selectedTrace.effectsExecuted.map((effect, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '6px 8px',
                            backgroundColor: '#252526',
                            borderRadius: '4px',
                            fontSize: '11px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderLeft: effect.error ? '3px solid #f48771' : '3px solid #4ec9b0',
                          }}
                        >
                          <div>
                            <span style={{ color: '#4ec9b0', fontWeight: 'bold' }}>
                              {effect.effectType}
                            </span>
                            {effect.error && (
                              <span style={{ color: '#f48771', marginLeft: '8px' }}>
                                ⚠ {effect.error.message}
                              </span>
                            )}
                          </div>
                          <span style={{ color: '#858585' }}>
                            {formatDuration(effect.duration)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* State Diff */}
                <div>
                  <h3
                    style={{
                      margin: '0 0 8px 0',
                      color: '#4ec9b0',
                      fontSize: '14px',
                    }}
                  >
                    State Change
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <div
                        style={{
                          color: '#858585',
                          fontSize: '11px',
                          marginBottom: '4px',
                        }}
                      >
                        Before
                      </div>
                      <pre
                        style={{
                          margin: '0',
                          padding: '8px',
                          backgroundColor: '#252526',
                          borderRadius: '4px',
                          overflow: 'auto',
                          fontSize: '11px',
                          maxHeight: '300px',
                        }}
                      >
                        {JSON.stringify(selectedTrace.stateBefore, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <div
                        style={{
                          color: '#858585',
                          fontSize: '11px',
                          marginBottom: '4px',
                        }}
                      >
                        After
                      </div>
                      <pre
                        style={{
                          margin: '0',
                          padding: '8px',
                          backgroundColor: '#252526',
                          borderRadius: '4px',
                          overflow: 'auto',
                          fontSize: '11px',
                          maxHeight: '300px',
                        }}
                      >
                        {JSON.stringify(selectedTrace.stateAfter, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: '#858585',
                }}
              >
                Select a trace to view details
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

