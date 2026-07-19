import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// We use the service role key to insert telemetry events bypassing RLS since telemetry might be sent by unauthenticated users
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * Telemetry receiver endpoint.
 * Accepts client-side error and event beacons.
 * Logs to stdout for Vercel log capture. Stores nothing in DB.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      level?: string
      message?: string
      event?: string
      context?: Record<string, unknown>
      data?: Record<string, unknown>
      ts?: number
    }

    const level = body.level || 'info'
    const message = body.message || body.event || 'telemetry'
    const timestamp = body.ts ? new Date(body.ts).toISOString() : new Date().toISOString()

    // Extract user_id from metadata if present
    const contextObj = (body.context || body.data || {}) as Record<string, unknown>
    const userId = (contextObj.userId as string) || null
    
    // Log structured line for Vercel to capture
    console.log(
      JSON.stringify({
        source: 'client-telemetry',
        level,
        message,
        context: contextObj,
        timestamp,
      })
    )

    // Fire-and-forget insert into Supabase
    supabase.from('telemetry_events').insert({
      event_name: message,
      user_id: userId,
      metadata: contextObj,
      created_at: timestamp
    }).then(({ error }) => {
      if (error) console.error('Telemetry DB Insert Error:', error.message)
    })
  } catch {
    // Invalid payload — still return 200 so beacon doesn't retry
  }

  return new NextResponse(null, { status: 200 })
}

// Respond to preflight OPTIONS (browsers may check before sendBeacon)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
