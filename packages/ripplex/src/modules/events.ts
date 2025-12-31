/**
 * Events Module
 * Handles event registration and handler execution
 * Inspired by re-frame's events.cljc
 * 
 * Manages event handler registration and interceptor chain execution.
 */

import { 
    EventHandlerDb, 
    EventHandlerFx, 
    EffectMap, 
    Context, 
    EffectExecutionTrace,
    CoeffectProviders
} from './types'
import { Interceptor, InterceptorContext } from './interceptor'
import { Registrar } from './registrar'
import { StateManager } from './state'
import { EffectExecutor } from './effects'
import { ErrorHandlerManager } from './errorHandler'
import { Tracer } from './tracing'

/**
 * Dependencies for event manager
 */
export interface EventManagerDependencies<State, Cofx> {
    registrar: Registrar
    stateManager: StateManager<State>
    effectExecutor: EffectExecutor<State>
    errorHandler: ErrorHandlerManager
    tracer: Tracer<State>
    coeffectProviders: CoeffectProviders<Cofx>
}

/**
 * Event manager interface
 */
export interface EventManager<State, Cofx> {
    /**
     * Register an event handler that returns state only (like reg-event-db)
     * The return value is automatically wrapped into {:db: state} effect
     */
    registerEventDb<Payload = any>(
        eventKey: string,
        handler: EventHandlerDb<State, Cofx, Payload>,
        interceptors?: Interceptor<State, Cofx>[]
    ): void

    /**
     * Register an event handler that returns effects map (like reg-event-fx)
     * Handler must return an EffectMap (may include :db effect for state updates)
     */
    registerEvent<Payload = any>(
        eventKey: string,
        handler: EventHandlerFx<State, Cofx, Payload>,
        interceptors?: Interceptor<State, Cofx>[]
    ): void

    /**
     * Deregister an event handler
     */
    deregisterEvent(eventKey: string): void

    /**
     * Handle an event by executing its interceptor chain
     * This is the core event processing logic
     */
    handleEvent<Payload = any>(
        eventKey: string,
        payload: Payload
    ): Promise<void>
}

/**
 * Create an event manager instance
 */
export function createEventManager<State, Cofx>(
    deps: EventManagerDependencies<State, Cofx>
): EventManager<State, Cofx> {
    const { registrar, stateManager, effectExecutor, errorHandler, tracer, coeffectProviders } = deps

    /**
     * Convert a db handler to an interceptor (like reg-event-db)
     * Handler returns state, which is wrapped into {:db: state} effect
     */
    function dbHandlerToInterceptor<Payload = any>(
        handler: EventHandlerDb<State, Cofx, Payload>
    ): Interceptor<State, Cofx> {
        return {
            id: 'db-handler',
            before: (context: InterceptorContext<State, Cofx>) => {
                // Extract event from coeffects
                const event = context.coeffects.event as Payload
                
                // Call the handler with coeffects and event
                const newState = handler(context.coeffects, event)
                
                // Wrap return value into {:db: state} effect
                return {
                    ...context,
                    effects: {
                        ...context.effects,
                        db: newState
                    }
                }
            }
        }
    }

    /**
     * Convert an fx handler to an interceptor (like reg-event-fx)
     * Handler returns effects map directly
     */
    function fxHandlerToInterceptor<Payload = any>(
        handler: EventHandlerFx<State, Cofx, Payload>
    ): Interceptor<State, Cofx> {
        return {
            id: 'fx-handler',
            before: (context: InterceptorContext<State, Cofx>) => {
                // Extract event from coeffects
                const event = context.coeffects.event as Payload
                
                // Call the handler with coeffects and event
                const effects = handler(context.coeffects, event)
                
                // Use return value directly as effects
                return {
                    ...context,
                    effects: {
                        ...context.effects,
                        ...effects
                    }
                }
            }
        }
    }

    /**
     * Register an event handler that returns state only (like reg-event-db)
     */
    function registerEventDb<Payload = any>(
        eventKey: string,
        handler: EventHandlerDb<State, Cofx, Payload>,
        interceptors?: Interceptor<State, Cofx>[]
    ): void {
        if (registrar.has('event', eventKey)) {
            console.warn(`Event handler for "${eventKey}" is being overwritten`)
        }
        // Handler wrapper is added at the end (rightmost, runs last in :before phase)
        const handlerInterceptor = dbHandlerToInterceptor(handler)
        const chain = interceptors ? [...interceptors, handlerInterceptor] : [handlerInterceptor]
        registrar.register('event', eventKey, chain)
    }

    /**
     * Register an event handler that returns effects map (like reg-event-fx)
     */
    function registerEvent<Payload = any>(
        eventKey: string,
        handler: EventHandlerFx<State, Cofx, Payload>,
        interceptors?: Interceptor<State, Cofx>[]
    ): void {
        if (registrar.has('event', eventKey)) {
            console.warn(`Event handler for "${eventKey}" is being overwritten`)
        }
        // Handler wrapper is added at the end (rightmost, runs last in :before phase)
        const handlerInterceptor = fxHandlerToInterceptor(handler)
        const chain = interceptors ? [...interceptors, handlerInterceptor] : [handlerInterceptor]
        registrar.register('event', eventKey, chain)
    }

    /**
     * Deregister an event handler
     */
    function deregisterEvent(eventKey: string): void {
        registrar.clear('event', eventKey)
    }

    /**
     * Handle an event by executing its interceptor chain
     * This is the core event processing logic (moved from router)
     */
    async function handleEvent<Payload = any>(
        eventKey: string,
        payload: Payload
    ): Promise<void> {
        const startTime = Date.now()
        const stateBefore = stateManager.getState()  // Capture before state

        const interceptors = registrar.get<Interceptor<State, Cofx>[]>('event', eventKey)

        if (!interceptors || interceptors.length === 0) {
            console.warn(`No handler registered for event "${eventKey}"`)
            return
        }

        // Compute coeffects by calling all providers
        const computedCoeffects: Partial<Cofx> = {}
        for (const key in coeffectProviders) {
            const provider = coeffectProviders[key]
            computedCoeffects[key] = provider()
        }

        // Build initial context with current state, event, and computed coeffects
        const initialContext: Context<State, Cofx> = {
            db: stateManager.getState(),
            event: payload as any,
            ...computedCoeffects
        } as Context<State, Cofx>

        // Build interceptor context with queue and empty stack
        let context: InterceptorContext<State, Cofx> = {
            coeffects: initialContext,
            effects: {},
            queue: [...interceptors],  // Copy to avoid mutation
            stack: []
        }

        // Track which effects execute
        const effectsExecuted: EffectExecutionTrace[] = []
        let eventError: Error | undefined
        let effectMap: EffectMap = {}

        try {
            // BEFORE phase: Process interceptors from queue, building stack
            while (context.queue.length > 0) {
                const interceptor = context.queue.shift()!
                context.stack.push(interceptor)

                if (interceptor.before) {
                    try {
                        context = interceptor.before(context)
                    } catch (error) {
                        eventError = error as Error
                        await errorHandler.handle(error as Error, {
                            eventKey,
                            payload,
                            phase: 'interceptor',
                            interceptor: {
                                id: interceptor.id,
                                direction: 'before'
                            }
                        })
                        // Skip remaining interceptors and return current state unchanged
                        break
                    }
                }
            }

            // AFTER phase: Process interceptors from stack in REVERSE order
            if (!eventError) {
                while (context.stack.length > 0) {
                    const interceptor = context.stack.pop()!

                    if (interceptor.after) {
                        try {
                            context = interceptor.after(context)
                        } catch (error) {
                            eventError = error as Error
                            await errorHandler.handle(error as Error, {
                                eventKey,
                                payload,
                                phase: 'interceptor',
                                interceptor: {
                                    id: interceptor.id,
                                    direction: 'after'
                                }
                            })
                            // Skip remaining interceptors and return current state unchanged
                            break
                        }
                    }
                }
            }

            // Capture effect map after interceptors run
            effectMap = context.effects

            // Execute effects from final context
            // State updates only happen via :db effect (executed by effect executor)
            if (!eventError) {
                await effectExecutor.execute(context.effects, eventKey, payload, effectsExecuted)
            }
        } catch (error) {
            // This catch is for any unexpected errors not caught above
            eventError = error as Error
            await errorHandler.handle(error as Error, {
                eventKey,
                payload,
                phase: 'interceptor'
            })
        }

        // Capture after state
        const stateAfter = stateManager.getState()
        const duration = Date.now() - startTime

        // Extract interceptor info from stack (reverse order since we popped them)
        const interceptorInfo = interceptors.map((interceptor, index) => ({
            id: interceptor.id,
            order: index
        }))

        // Emit complete trace (tracer will generate the ID)
        tracer.emitEventTrace({
            eventKey,
            payload,
            timestamp: startTime,
            stateBefore,
            stateAfter,
            interceptors: interceptorInfo,
            effectMap: eventError ? {} : effectMap,
            effectsExecuted,
            duration,
            error: eventError
        })
    }

    return {
        registerEventDb,
        registerEvent,
        deregisterEvent,
        handleEvent
    }
}

