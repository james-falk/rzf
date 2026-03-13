import { db } from './client.js'

export type AnalyticsEventType =
  // User lifecycle
  | 'user.signup'
  | 'user.upgrade.prompted'
  | 'user.upgraded'
  // Agent events
  | 'agent.run.started'
  | 'agent.run.completed'
  | 'agent.run.failed'
  | 'agent.result.rated'
  | 'agent.followup.sent'
  // Feature usage
  | 'feature.used'

export type EventPayloads = {
  'user.signup': { email: string; tier: 'free' }
  'user.upgrade.prompted': { triggeredBy: 'credit_exhaustion' }
  'user.upgraded': { fromTier: string; toTier: string }
  'agent.run.started': { agentType: string; userTier: string; leagueId?: string }
  'agent.run.completed': { agentType: string; tokensUsed: number; durationMs: number; grade?: string }
  'agent.run.failed': { agentType: string; errorType: string; errorMessage: string }
  'agent.result.rated': { agentRunId: string; rating: 'up' | 'down' }
  'agent.followup.sent': { agentRunId: string; agentType: string }
  'feature.used': { featureName: string; context?: Record<string, unknown> }
}

/**
 * Track a typed analytics event.
 * Never throws — analytics failures are logged but do not affect the caller.
 */
export async function track<T extends AnalyticsEventType>(
  eventType: T,
  payload: EventPayloads[T],
  userId?: string,
): Promise<void> {
  try {
    await db.analyticsEvent.create({
      data: {
        eventType,
        // Prisma's Json type requires serializable values — cast via JSON roundtrip
        payload: JSON.parse(JSON.stringify(payload)),
        userId: userId ?? null,
      },
    })
  } catch (err) {
    // Analytics must never break the calling code
    console.error(`[track] Failed to record event "${eventType}":`, err)
  }
}
