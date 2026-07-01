-- Queue for async embedding generation (processed by Edge Function)

CREATE TABLE IF NOT EXISTS embedding_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  servicio_ait_id text NOT NULL,
  doc_type text NOT NULL,
  source_id text NOT NULL,
  content text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  tag_equipo text,
  activity_codigo text,
  status text NOT NULL DEFAULT 'pending',
  attempts int NOT NULL DEFAULT 0,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  CONSTRAINT embedding_jobs_status_check CHECK (
    status IN ('pending', 'processing', 'done', 'failed')
  )
);

CREATE INDEX IF NOT EXISTS idx_embedding_jobs_pending
  ON embedding_jobs(status, created_at)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_embedding_jobs_project
  ON embedding_jobs(project_id);

ALTER TABLE embedding_jobs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "anon_all_embedding_jobs" ON embedding_jobs
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
