/**
 * Privacy-friendly event tracking helper.
 * Strictly avoids tracking personal details or cookies, conforming
 * to GDPR and local privacy mandates.
 */
export function trackEvent(
  eventName: string,
  eventData?: Record<string, string | number | boolean | null | undefined>
) {
  try {
    const isProd = process.env.NODE_ENV === 'production'
    
    // In development mode, output clear telemetry logs for debugging
    if (!isProd) {
      console.log(`[Analytics Dev] Event: "${eventName}"`, eventData || '')
      return
    }

    // In production mode, push to standard beacon collectors or safe queues
    // Plausible or Vercel safe Web Analytics integration placeholder:
    if (typeof window !== 'undefined') {
      const windowWithPlausible = window as unknown as {
        plausible?: (event: string, options?: { props: typeof eventData }) => void
      }
      
      if (typeof windowWithPlausible.plausible === 'function') {
        windowWithPlausible.plausible(eventName, eventData ? { props: eventData } : undefined)
      } else {
        // Fallback telemetry beacon
        navigator.sendBeacon(
          '/api/telemetry',
          JSON.stringify({ event: eventName, data: eventData, ts: Date.now() })
        )
      }
    }
  } catch (err) {
    console.warn('Analytics dispatcher warning:', err)
  }
}
