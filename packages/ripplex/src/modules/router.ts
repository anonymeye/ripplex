/**
 * Router Module
 * Handles event queue and dispatching
 * Inspired by re-frame's router.cljc
 * 
 * Manages the event queue and processes events sequentially.
 * Event handler execution is delegated to the events module.
 */

import { QueuedEvent } from './types'
import { EventManager } from './events'

/**
 * Dependencies for router
 */
export interface RouterDependencies<State, Cofx> {
    eventManager: EventManager<State, Cofx>
}

/**
 * Router interface
 */
export interface Router<State, Cofx> {
    /**
     * Dispatch an event - adds to queue
     * Returns a promise that resolves when the event is processed
     */
    dispatch<Payload = any>(eventKey: string, payload: Payload): Promise<void>

    /**
     * Flush the event queue immediately (for testing)
     */
    flush(): Promise<void>
}

/**
 * Create a router instance
 */
export function createRouter<State, Cofx>(
    deps: RouterDependencies<State, Cofx>
): Router<State, Cofx> {
    const { eventManager } = deps

    // Event queue
    const eventQueue: QueuedEvent[] = []
    let isProcessing = false

    /**
     * Process a single event
     * Delegates to event manager for handler execution
     */
    async function processEvent<Payload = any>(
        eventKey: string,
        payload: Payload
    ): Promise<void> {
        await eventManager.handleEvent(eventKey, payload)
    }

    /**
     * Process events from queue sequentially
     */
    async function processQueue(): Promise<void> {
        if (isProcessing) return

        isProcessing = true

        try {
            while (eventQueue.length > 0) {
                const event = eventQueue.shift()!
                await processEvent(event.eventKey, event.payload)
            }
        } finally {
            isProcessing = false
        }
    }

    /**
     * Dispatch an event - adds to queue
     * Returns a promise that resolves when the event is processed
     */
    function dispatch<Payload = any>(
        eventKey: string,
        payload: Payload
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            // Add event to queue
            eventQueue.push({ eventKey, payload })

            // Start processing if not already processing
            if (!isProcessing) {
                processQueue().then(resolve).catch(reject)
            } else {
                resolve()
            }
        })
    }

    /**
     * Flush the event queue immediately (for testing)
     */
    async function flush(): Promise<void> {
        await processQueue()
    }

    return {
        dispatch,
        flush
    }
}

