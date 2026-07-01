let realtimeChannelSeq = 0;

/** Unique Supabase Realtime channel name — avoids reusing a subscribed channel. */
export function uniqueRealtimeChannel(base: string): string {
  realtimeChannelSeq += 1;
  return `${base}:${realtimeChannelSeq}-${Date.now()}`;
}
