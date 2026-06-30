-- RAG knowledge base: event-activity links, embeddings, SQL views, vector search

-- 1. Event → Activity WBS5 link
ALTER TABLE events ADD COLUMN IF NOT EXISTS activity_id uuid REFERENCES activities(id) ON DELETE SET NULL;
ALTER TABLE events ADD COLUMN IF NOT EXISTS activity_codigo text;

CREATE INDEX IF NOT EXISTS idx_events_activity ON events(activity_id);
CREATE INDEX IF NOT EXISTS idx_events_hse_date ON events(created_at)
  WHERE clasificacion_hse IS NOT NULL AND clasificacion_hse != '';
CREATE INDEX IF NOT EXISTS idx_activities_tag_delay ON activities(tag_equipo, fecha_fin);

-- 2. knowledge_embeddings (typed chunks for RAG)
CREATE TABLE IF NOT EXISTS knowledge_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_type text NOT NULL,
  source_id text NOT NULL,
  servicio_ait_id text,
  project_id uuid,
  tag_equipo text,
  activity_codigo text,
  fecha timestamptz,
  is_hse boolean NOT NULL DEFAULT false,
  clasificacion_hse text,
  content text NOT NULL,
  embedding vector(768),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (doc_type, source_id)
);

CREATE INDEX IF NOT EXISTS idx_knowledge_tag ON knowledge_embeddings(tag_equipo);
CREATE INDEX IF NOT EXISTS idx_knowledge_project ON knowledge_embeddings(project_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_doc_type ON knowledge_embeddings(doc_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_fecha ON knowledge_embeddings(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_hse ON knowledge_embeddings(is_hse) WHERE is_hse = true;
CREATE INDEX IF NOT EXISTS idx_knowledge_servicio ON knowledge_embeddings(servicio_ait_id);

DO $$ BEGIN
  CREATE INDEX idx_knowledge_embedding_hnsw ON knowledge_embeddings
    USING hnsw (embedding vector_cosine_ops);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'HNSW index skipped: %', SQLERRM;
END $$;

-- Migrate legacy service-level embeddings
INSERT INTO knowledge_embeddings (
  doc_type, source_id, servicio_ait_id, content, embedding, metadata, created_at
)
SELECT
  'service_summary',
  COALESCE(ae.service_id, ae.id::text),
  ae.service_id,
  ae.content,
  ae.embedding,
  COALESCE(ae.metadata, '{}'::jsonb),
  ae.created_at
FROM activity_embeddings ae
WHERE ae.content IS NOT NULL
ON CONFLICT (doc_type, source_id) DO NOTHING;

-- 3. Structured views for chatbot SQL queries

CREATE OR REPLACE VIEW v_delayed_activities AS
SELECT
  a.id,
  a.servicio_ait_id,
  a.codigo AS activity_codigo,
  a.nombre_servicio,
  a.tag_equipo,
  a.area_servicio,
  a.fecha_inicio,
  a.fecha_fin,
  a.real_fecha_inicio,
  a.real_fecha_fin,
  sa.project_id,
  p.project_name,
  sa.nombre_servicio AS servicio_nombre,
  GREATEST(0, EXTRACT(DAY FROM (now() - a.fecha_fin))::int) AS dias_atraso,
  COALESCE(a.es_ruta_critica, false) AS es_ruta_critica
FROM activities a
JOIN servicios_ait sa ON sa.id = a.servicio_ait_id
LEFT JOIN projects p ON p.id = sa.project_id
WHERE a.fecha_fin IS NOT NULL
  AND a.fecha_fin < now()
  AND a.real_fecha_fin IS NULL;

CREATE OR REPLACE VIEW v_hse_events_daily AS
SELECT
  e.id AS record_id,
  'event'::text AS source,
  e.created_at AS fecha,
  e.titulo,
  e.comentarios AS descripcion,
  e.tipo_evento,
  e.clasificacion_hse,
  e.causa,
  e.horas_perdidas,
  e.equipo_afectado,
  e.tag_equipo,
  e.servicio_ait_id,
  e.project_id,
  e.activity_codigo,
  e.nombre_perfil AS autor,
  sa.nombre_servicio AS servicio_nombre,
  p.project_name
FROM events e
LEFT JOIN servicios_ait sa ON sa.id = e.servicio_ait_id
LEFT JOIN projects p ON p.id = e.project_id
WHERE (
  e.tipo_evento ILIKE '%HSE%'
  OR (e.clasificacion_hse IS NOT NULL AND e.clasificacion_hse != '')
)

UNION ALL

SELECT
  ml.id,
  'maintenance'::text,
  ml.fecha,
  ml.descripcion,
  ml.descripcion,
  ml.tipo_evento_hse,
  ml.clasificacion_hse,
  ml.causa,
  ml.horas_perdidas_hse::text,
  ml.tag_code,
  ml.tag_code,
  ml.servicio_ait_id,
  ml.project_id,
  NULL::text,
  ml.nombre_perfil,
  sa.nombre_servicio,
  p.project_name
FROM maintenance_logs ml
LEFT JOIN servicios_ait sa ON sa.id = ml.servicio_ait_id
LEFT JOIN projects p ON p.id = ml.project_id
WHERE (
  ml.tipo_evento_hse ILIKE '%HSE%'
  OR (ml.clasificacion_hse IS NOT NULL AND ml.clasificacion_hse != '')
);

CREATE OR REPLACE VIEW v_equipment_history AS
SELECT
  e.tag_equipo AS tag_code,
  COALESCE(e.created_at, now()) AS fecha,
  'parada'::text AS source,
  e.id AS record_id,
  e.titulo,
  e.comentarios AS descripcion,
  NULL::text AS personnel_type,
  e.nombre_perfil AS autor,
  e.etapa AS tipo_mantenimiento,
  NULL::text AS estado_equipo,
  e.total_hh AS horas,
  e.project_id,
  e.servicio_ait_id,
  e.activity_codigo,
  p.project_name,
  et.nombre AS equipo_nombre,
  et.area,
  e.clasificacion_hse,
  e.tipo_evento,
  sa.nombre_servicio AS servicio_nombre
FROM events e
LEFT JOIN projects p ON p.id = e.project_id
LEFT JOIN equipment_tags et ON et.tag_code = e.tag_equipo
LEFT JOIN servicios_ait sa ON sa.id = e.servicio_ait_id
WHERE e.tag_equipo IS NOT NULL AND e.tag_equipo != ''

UNION ALL

SELECT
  ml.tag_code,
  ml.fecha,
  'mantenimiento'::text,
  ml.id,
  ml.descripcion,
  ml.descripcion,
  ml.personnel_type,
  ml.nombre_perfil,
  ml.tipo_mantenimiento,
  ml.estado_equipo,
  ml.horas,
  ml.project_id,
  ml.servicio_ait_id,
  NULL::text,
  p.project_name,
  et.nombre,
  et.area,
  ml.clasificacion_hse,
  ml.tipo_evento_hse,
  sa.nombre_servicio
FROM maintenance_logs ml
LEFT JOIN projects p ON p.id = ml.project_id
LEFT JOIN equipment_tags et ON et.tag_code = ml.tag_code
LEFT JOIN servicios_ait sa ON sa.id = ml.servicio_ait_id;

-- 4. Vector similarity search RPC
CREATE OR REPLACE FUNCTION match_knowledge(
  query_embedding vector(768),
  match_count int DEFAULT 10,
  filter_tag text DEFAULT NULL,
  filter_project_id uuid DEFAULT NULL,
  filter_doc_type text DEFAULT NULL,
  filter_is_hse boolean DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  doc_type text,
  source_id text,
  content text,
  metadata jsonb,
  tag_equipo text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    ke.id,
    ke.doc_type,
    ke.source_id,
    ke.content,
    ke.metadata,
    ke.tag_equipo,
    1 - (ke.embedding <=> query_embedding) AS similarity
  FROM knowledge_embeddings ke
  WHERE ke.embedding IS NOT NULL
    AND (filter_tag IS NULL OR ke.tag_equipo = filter_tag)
    AND (filter_project_id IS NULL OR ke.project_id = filter_project_id)
    AND (filter_doc_type IS NULL OR ke.doc_type = filter_doc_type)
    AND (filter_is_hse IS NULL OR ke.is_hse = filter_is_hse)
  ORDER BY ke.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- 5. RLS
ALTER TABLE knowledge_embeddings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "anon_all_knowledge_embeddings" ON knowledge_embeddings
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
