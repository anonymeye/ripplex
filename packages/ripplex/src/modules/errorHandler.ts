/**
 * Error Handler Module
 * Handles error registration and execution
 */

import { ErrorHandler, ErrorContext, ErrorHandlerConfig } from './types'

/**
 * Error handler manager interface
 */
export interface ErrorHandlerManager {
    /**
     * Register an error handler
     */
    register(handler: ErrorHandler, config?: ErrorHandlerConfig): void

    /**
     * Handle an error using the registered error handler
     */
    handle(error: Error, context: ErrorContext): Promise<void>
}

/**
 * Create an error handler manager
 */
export function createErrorHandler(
    initialHandler?: ErrorHandler,
    initialConfig?: ErrorHandlerConfig
): ErrorHandlerManager {
    let errorHandler: ErrorHandler = initialHandler || defaultErrorHandler
    let errorHandlerConfig: ErrorHandlerConfig = { 
        rethrow: false,
        ...initialConfig 
    }

    return {
        register(handler: ErrorHandler, config?: ErrorHandlerConfig): void {
            errorHandler = handler
            if (config) {
                errorHandlerConfig = { ...errorHandlerConfig, ...config }
            }
        },

        async handle(error: Error, context: ErrorContext): Promise<void> {
            try {
                await errorHandler(error, context, errorHandlerConfig)
                
                // Re-throw if configured to do so
                if (errorHandlerConfig.rethrow) {
                    throw error
                }
            } catch (handlerError) {
                // If error handler itself throws, log it and optionally re-throw original
                console.error('Error in error handler:', handlerError)
                if (errorHandlerConfig.rethrow) {
                    throw error
                }
            }
        }
    }
}

/**
 * Default error handler
 * Logs error details to console
 */
export function defaultErrorHandler(
    error: Error,
    context: ErrorContext,
    config: ErrorHandlerConfig
): void {
    const { eventKey, phase, interceptor } = context
    
    if (phase === 'interceptor' && interceptor) {
        console.error(
            `Error in ${interceptor.direction} phase of interceptor "${interceptor.id || 'unnamed'}" while handling event "${eventKey}":`,
            error
        )
    } else if (phase === 'effect' && interceptor) {
        console.error(
            `Error executing effect "${interceptor.id}" for event "${eventKey}":`,
            error
        )
    } else if (phase === 'subscription') {
        console.error(
            `Error in subscription "${eventKey}":`,
            error
        )
    } else {
        console.error(
            `Error handling event "${eventKey}":`,
            error
        )
    }
}

