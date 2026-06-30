-- MineTrackAI2 initial schema (Firebase → Supabase migration)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- vector extension (enable in Dashboard → Database → Extensions if this fails)
DO $$ BEGIN
  CREATE EXTENSION IF NOT EXISTS vector;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'vector extension not available — activity_embeddings.embedding will need manual setup';
END $$;

-- 1. projects
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name text NOT NULL,
  project_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. profiles (Firebase users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid text UNIQUE NOT NULL,
  display_name text,
  cargo text,
  descripcion text,
  photo_url text,
  email text,
  company_name text,
  user_type text,
  equipment_favorites jsonb NOT NULL DEFAULT '[]'::jsonb,
  expo_push_token text,
  proyecto text NOT NULL DEFAULT 'todos',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. servicios_ait
CREATE TABLE IF NOT EXISTS servicios_ait (
  id text PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  codigo text,
  nombre_servicio text,
  numero_ait text,
  empresa_minera text,
  area_servicio text,
  tag_equipo text,
  tipo_servicio text,
  es_ruta_critica text,
  responsable_usuario_1 text,
  responsable_usuario_2 text,
  responsable_usuario_3 text,
  responsable_contratista_1 text,
  responsable_contratista_2 text,
  responsable_contratista_3 text,
  supervisor_mina text,
  supervisor_eecc text,
  fecha_inicio timestamptz,
  fecha_fin timestamptz,
  numero_cotizacion text,
  moneda text,
  monto text,
  supervisor_seguridad text,
  supervisor text,
  tecnicos text,
  lider text,
  soldador text,
  horas_totales numeric,
  horas_hombre text,
  nueva_fecha_estimada numeric,
  fecha_fin_ejecucion numeric,
  photo_service_url text,
  email_perfil text,
  nombre_perfil text,
  company_name text,
  avance_ejecucion numeric DEFAULT 0,
  avance_administrativo numeric DEFAULT 0,
  avance_administrativo_texto text,
  hh_modificado numeric DEFAULT 0,
  monto_modificado numeric DEFAULT 0,
  aprobacion jsonb DEFAULT '[]'::jsonb,
  proyecto text,
  project_name text,
  project_type text,
  is_global_project boolean DEFAULT false,
  activities text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  last_event_posted timestamptz,
  fecha_post_formato text,
  fecha_post_iso text
);

-- 4. activities
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  servicio_ait_id text NOT NULL REFERENCES servicios_ait(id) ON DELETE CASCADE,
  codigo text,
  nombre_servicio text,
  fecha_inicio timestamptz,
  fecha_fin timestamptz,
  horas_totales numeric,
  tag_equipo text,
  area_servicio text,
  parent_code text,
  es_ruta_critica boolean DEFAULT false,
  real_fecha_inicio timestamptz,
  real_fecha_fin timestamptz,
  empresa_minera text,
  tipo_servicio text
);

-- 5. events
CREATE TABLE IF NOT EXISTS events (
  id text PRIMARY KEY,
  servicio_ait_id text REFERENCES servicios_ait(id) ON DELETE SET NULL,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  titulo text,
  comentarios text,
  visibilidad text,
  etapa text,
  porcentaje_avance text,
  aprobacion text,
  monto_modificado text,
  hh_modificado text,
  nueva_fecha_estimada timestamptz,
  pdf_principal text,
  foto_principal text,
  image_url text,
  filename_title text,
  tipo_file text,
  ait_nombre_servicio text,
  ait_empresa_minera text,
  ait_area_servicio text,
  ait_photo_service_url text,
  ait_numero text,
  ait_company_name text,
  email_perfil text,
  nombre_perfil text,
  foto_usuario_perfil text,
  supervisores text,
  hse text,
  lider_tecnico text,
  soldador text,
  tecnico text,
  ayudante text,
  total_hh numeric DEFAULT 0,
  causa text,
  tipo_evento text,
  clasificacion_hse text,
  equipo_afectado text,
  horas_perdidas text,
  new_images text[] DEFAULT '{}',
  push_notification text,
  proyecto text,
  unico_id text,
  created_at timestamptz DEFAULT now(),
  fecha_post_formato text
);

-- 6. event_comments
CREATE TABLE IF NOT EXISTS event_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  comment text,
  commenter_email text,
  commenter_name text,
  commenter_photo text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 7. event_likes
CREATE TABLE IF NOT EXISTS event_likes (
  event_id text NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_email text NOT NULL,
  PRIMARY KEY (event_id, user_email)
);

-- 8. service_pdfs
CREATE TABLE IF NOT EXISTS service_pdfs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  servicio_ait_id text NOT NULL REFERENCES servicios_ait(id) ON DELETE CASCADE,
  filename_title text,
  pdf_url text,
  tipo_file text,
  email text,
  comentario text,
  size integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  fecha_post_formato text
);

-- 9. approvals
CREATE TABLE IF NOT EXISTS approvals (
  id text PRIMARY KEY,
  servicio_ait_id text REFERENCES servicios_ait(id) ON DELETE CASCADE,
  approval_requested_by text,
  approval_request_sent_to text[] DEFAULT '{}',
  approval_performed text[] DEFAULT '{}',
  rejection_performed text[] DEFAULT '{}',
  solicitud text,
  solicitud_comentario text,
  file_name text,
  tipo_file text,
  pdf_url text,
  company_name text,
  nombre_servicio text,
  numero_servicio text,
  area_servicio text,
  id_time_approval text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 10. manpower
CREATE TABLE IF NOT EXISTS manpower (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_servicios text,
  servicios text,
  total_ingenieria text,
  ingenieria text,
  photo_url text,
  email text,
  company_name text,
  fecha_post_formato text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 11. activity_embeddings (RAG)
CREATE TABLE IF NOT EXISTS activity_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id text,
  content text,
  embedding vector(768),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_project_created ON events(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_servicio ON events(servicio_ait_id);
CREATE INDEX IF NOT EXISTS idx_servicios_ait_project ON servicios_ait(project_id);
CREATE INDEX IF NOT EXISTS idx_activities_servicio ON activities(servicio_ait_id);
CREATE INDEX IF NOT EXISTS idx_approvals_servicio ON approvals(servicio_ait_id);
CREATE INDEX IF NOT EXISTS idx_approvals_sent_to ON approvals USING GIN (approval_request_sent_to);
CREATE INDEX IF NOT EXISTS idx_profiles_firebase_uid ON profiles(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Push tokens helper (replaces metadata/userTokens)
CREATE OR REPLACE FUNCTION get_push_tokens()
RETURNS text[] AS $$
  SELECT COALESCE(array_agg(expo_push_token), '{}')
  FROM profiles
  WHERE expo_push_token IS NOT NULL AND expo_push_token != '';
$$ LANGUAGE sql STABLE;

-- updated_at trigger for profiles
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios_ait ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_pdfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE manpower ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_embeddings ENABLE ROW LEVEL SECURITY;

-- Permissive policies (Firebase Auth bridge pending)
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'projects', 'profiles', 'servicios_ait', 'activities', 'events',
    'event_comments', 'event_likes', 'service_pdfs', 'approvals',
    'manpower', 'activity_embeddings'
  ]
  LOOP
    EXECUTE format('CREATE POLICY "anon_all_%s" ON %I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)', t, t);
  END LOOP;
END $$;

-- Enable realtime (ignore if already added)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE events;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE servicios_ait;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE approvals;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE manpower;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
