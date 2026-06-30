-- Equipment master + daily maintenance logs + unified timeline

-- 1. equipment_tags
CREATE TABLE IF NOT EXISTS equipment_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_code text UNIQUE NOT NULL,
  nombre text NOT NULL,
  area text,
  activo boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_equipment_tags_code ON equipment_tags(tag_code);
CREATE INDEX IF NOT EXISTS idx_equipment_tags_area ON equipment_tags(area);

-- 2. maintenance_logs
CREATE TABLE IF NOT EXISTS maintenance_logs (
  id text PRIMARY KEY,
  equipment_tag_id uuid REFERENCES equipment_tags(id) ON DELETE SET NULL,
  tag_code text NOT NULL,
  fecha timestamptz NOT NULL DEFAULT now(),
  descripcion text NOT NULL,
  personnel_type text NOT NULL DEFAULT 'planta',
  company_name text,
  supervisor_planta text,
  supervisor_contratista text,
  horas numeric DEFAULT 0,
  tipo_mantenimiento text DEFAULT 'rutinario',
  estado_equipo text DEFAULT 'operativo',
  numero_ot text,
  parada_equipo_horas numeric DEFAULT 0,
  foto_url text,
  pdf_url text,
  materiales jsonb NOT NULL DEFAULT '[]'::jsonb,
  aprobacion_requerida boolean DEFAULT false,
  aprobacion_estado text DEFAULT 'pendiente',
  aprobador_email text,
  causa text,
  tipo_evento_hse text,
  clasificacion_hse text,
  horas_perdidas_hse numeric DEFAULT 0,
  email_perfil text,
  nombre_perfil text,
  foto_usuario_perfil text,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  servicio_ait_id text REFERENCES servicios_ait(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_logs_tag_fecha ON maintenance_logs(tag_code, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_personnel ON maintenance_logs(personnel_type);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_tipo ON maintenance_logs(tipo_mantenimiento);

-- 3. Alter events for unified timeline
ALTER TABLE events ADD COLUMN IF NOT EXISTS tag_equipo text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_origin text DEFAULT 'parada';
CREATE INDEX IF NOT EXISTS idx_events_tag_equipo ON events(tag_equipo, created_at DESC);

-- Backfill tag_equipo from servicios_ait
UPDATE events e
SET tag_equipo = sa.tag_equipo
FROM servicios_ait sa
WHERE e.servicio_ait_id = sa.id
  AND e.tag_equipo IS NULL
  AND sa.tag_equipo IS NOT NULL;

-- 4. approvals link to maintenance_logs
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS maintenance_log_id text REFERENCES maintenance_logs(id) ON DELETE CASCADE;

-- 5. Seed equipment_tags from known list
INSERT INTO equipment_tags (tag_code, nombre, area) VALUES
  ('C2-REU', 'Reuniones', 'C2'),
  ('001-CH2', 'Dump Pocket / Chancadora Primaria', 'C2'),
  ('001-CN002', 'Cinta Transportadora N°002', 'C2'),
  ('001-RB002', 'Rompedor de Bloques N°002', 'C2'),
  ('001-CR002', 'Chancadora N°002', 'C2'),
  ('C2-CR001', 'Chancadora Primaria (C2)', 'C2'),
  ('C2-ML001', 'Molino de Bolas (C2)', 'C2'),
  ('C2-CR021', 'Chancadora Secundaria (C2)', 'C2'),
  ('C2-CV001', 'Faja Transportadora (C2)', 'C2'),
  ('C2-SC001', 'Zaranda Vibratoria (C2)', 'C2'),
  ('SEG-C2', 'Seguridad (C2)', 'C2'),
  ('MA-C2', 'Medio Ambiente (C2)', 'C2'),
  ('C1-CR001', 'Chancadora Primaria (C1)', 'C1'),
  ('C1-ML001', 'Molino de Bolas (C1)', 'C1'),
  ('C1-CR021', 'Chancadora Secundaria (C1)', 'C1'),
  ('C1-CV001', 'Faja Transportadora (C1)', 'C1'),
  ('C1-SC001', 'Zaranda Vibratoria (C1)', 'C1'),
  ('SEG-C1', 'Seguridad (C1)', 'C1'),
  ('MA-C1', 'Medio Ambiente (C1)', 'C1')
ON CONFLICT (tag_code) DO NOTHING;

-- 6. Permanent operations project
INSERT INTO projects (project_name, project_type)
SELECT 'Operaciones Continuas', 'Mantenimiento Programado'
WHERE NOT EXISTS (
  SELECT 1 FROM projects WHERE project_name = 'Operaciones Continuas'
);

-- 7. Unified timeline view
CREATE OR REPLACE VIEW equipment_timeline AS
SELECT
  e.tag_equipo AS tag_code,
  COALESCE(e.created_at, now()) AS fecha,
  'parada'::text AS source,
  e.id AS record_id,
  e.titulo AS titulo,
  e.comentarios AS descripcion,
  NULL::text AS personnel_type,
  e.nombre_perfil AS autor,
  e.email_perfil AS autor_email,
  e.porcentaje_avance AS detalle_extra,
  e.foto_principal AS foto_url,
  e.etapa AS tipo_mantenimiento,
  NULL::text AS estado_equipo,
  e.total_hh AS horas,
  e.project_id,
  e.servicio_ait_id
FROM events e
WHERE e.tag_equipo IS NOT NULL AND e.tag_equipo != ''

UNION ALL

SELECT
  ml.tag_code,
  ml.fecha,
  'mantenimiento'::text AS source,
  ml.id AS record_id,
  ml.descripcion AS titulo,
  ml.descripcion,
  ml.personnel_type,
  ml.nombre_perfil AS autor,
  ml.email_perfil AS autor_email,
  ml.numero_ot AS detalle_extra,
  ml.foto_url,
  ml.tipo_mantenimiento,
  ml.estado_equipo,
  ml.horas,
  ml.project_id,
  ml.servicio_ait_id
FROM maintenance_logs ml;

-- 8. RLS
ALTER TABLE equipment_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_all_equipment_tags" ON equipment_tags
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "anon_all_maintenance_logs" ON maintenance_logs
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 9. Realtime
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE maintenance_logs;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 10. Storage bucket for maintenance attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('maintenance-attachments', 'maintenance-attachments', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "anon_maintenance_attachments_all" ON storage.objects
  FOR ALL TO anon, authenticated
  USING (bucket_id = 'maintenance-attachments')
  WITH CHECK (bucket_id = 'maintenance-attachments');
