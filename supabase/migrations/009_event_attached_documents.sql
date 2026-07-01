-- Additional PDF attachments on events (beyond legacy pdf_principal)
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS attached_documents jsonb NOT NULL DEFAULT '[]'::jsonb;
