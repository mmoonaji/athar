/**
 * Lightweight structured logger for Athar.
 *
 * In development: colorized, readable console output.
 * In production: structured JSON-compatible lines for Vercel log capture.
 * Client-side errors: reported via navigator.sendBeacon to /api/telemetry.
 */

type LogLevel = 'error' | 'warn' | 'info'
type LogContext = Record<string, unknown>

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const ts = new Date().toISOString()
  if (context && Object.keys(context).length > 0) {
    return `[${ts}] [${level.toUpperCase()}] ${message} ${JSON.stringify(context)}`
  }
  return `[${ts}] [${level.toUpperCase()}] ${message}`
}

function log(level: LogLevel, message: string, context?: LogContext) {
  const formatted = formatMessage(level, message, context)

  if (typeof window === 'undefined') {
    // Server-side: write to stdout/stderr (Vercel captures these)
    if (level === 'error') {
      console.error(formatted)
    } else if (level === 'warn') {
      console.warn(formatted)
    } else {
      console.log(formatted)
    }
    return
  }

  // Client-side: console output
  if (level === 'error') {
    console.error(formatted)

    // Report client errors to telemetry endpoint (fire-and-forget)
    try {
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        navigator.sendBeacon(
          '/api/telemetry',
          JSON.stringify({ level, message, context, ts: Date.now() })
        )
      }
    } catch {
      // Intentionally swallowed — telemetry must never break the app
    }
  } else if (level === 'warn') {
    console.warn(formatted)
  } else {
    console.log(formatted)
  }
}

export const logger = {
  error: (message: string, context?: LogContext) => log('error', message, context),
  warn:  (message: string, context?: LogContext) => log('warn',  message, context),
  info:  (message: string, context?: LogContext) => log('info',  message, context),
}
