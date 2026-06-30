-- Database webhook helper: configure in Supabase Dashboard
-- Database → Webhooks → New webhook on `events` INSERT → Edge Function `on-event-created`
--
-- Or use pg_net to call the edge function directly (optional, requires pg_net extension):

-- CREATE EXTENSION IF NOT EXISTS pg_net;
