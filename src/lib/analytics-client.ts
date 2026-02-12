/**
 * Client-side event tracking via POST to /api/events.
 * Fire-and-forget — never throws.
 */
export async function trackClientEvent(
  eventName: string,
  properties: Record<string, unknown> = {}
): Promise<void> {
  try {
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_name: eventName, properties }),
    })
  } catch {
    // silently ignore client tracking failures
  }
}
