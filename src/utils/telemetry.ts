/**
 * Non-invasive Telemetry & Analytics Engine
 * Safely tracks visitor engagement, speedrun completions, and recruiter actions
 * with local console telemetry and ready-to-wire external hooks.
 */

export type TelemetryEvent =
  | 'speedrun_started'
  | 'speedrun_completed'
  | 'resume_downloaded'
  | 'ai_terminal_prompted'
  | 'guestbook_signed'
  | 'photo_mode_captured'
  | 'station_opened'
  | 'jukebox_played';

class TelemetryEngine {
  private isDev = import.meta.env.DEV;

  public track(event: TelemetryEvent, metadata?: Record<string, unknown>) {
    const payload = {
      event,
      timestamp: new Date().toISOString(),
      metadata: metadata || {}
    };

    if (this.isDev) {
      console.log(`[Telemetry] ${event}:`, payload);
    }

    // Example: Dispatch custom browser event for third-party scripts (GA4, PostHog, Plausible)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('portfolio_telemetry', { detail: payload }));
      
      // If gtag is present
      if (typeof (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag === 'function') {
        (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', event, metadata);
      }
    }
  }
}

export const telemetry = new TelemetryEngine();
