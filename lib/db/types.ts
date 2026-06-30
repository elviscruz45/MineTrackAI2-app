// Database row types (Supabase snake_case)

export interface ProjectRow {
  id: string;
  project_name: string;
  project_type: string | null;
  created_at: string;
}

export interface ProfileRow {
  id: string;
  firebase_uid: string;
  display_name: string | null;
  cargo: string | null;
  descripcion: string | null;
  photo_url: string | null;
  email: string | null;
  company_name: string | null;
  user_type: string | null;
  equipment_favorites: unknown[];
  expo_push_token: string | null;
  proyecto: string;
  created_at: string;
  updated_at: string;
}

export interface ServicioAitRow {
  id: string;
  project_id: string | null;
  codigo: string | null;
  nombre_servicio: string | null;
  numero_ait: string | null;
  empresa_minera: string | null;
  area_servicio: string | null;
  tag_equipo: string | null;
  tipo_servicio: string | null;
  es_ruta_critica: string | null;
  responsable_usuario_1: string | null;
  responsable_usuario_2: string | null;
  responsable_usuario_3: string | null;
  responsable_contratista_1: string | null;
  responsable_contratista_2: string | null;
  responsable_contratista_3: string | null;
  supervisor_mina: string | null;
  supervisor_eecc: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  numero_cotizacion: string | null;
  moneda: string | null;
  monto: string | null;
  supervisor_seguridad: string | null;
  supervisor: string | null;
  tecnicos: string | null;
  lider: string | null;
  soldador: string | null;
  horas_totales: number | null;
  horas_hombre: string | null;
  nueva_fecha_estimada: number | null;
  fecha_fin_ejecucion: number | null;
  photo_service_url: string | null;
  email_perfil: string | null;
  nombre_perfil: string | null;
  company_name: string | null;
  avance_ejecucion: number | null;
  avance_administrativo: number | null;
  avance_administrativo_texto: string | null;
  hh_modificado: number | null;
  monto_modificado: number | null;
  aprobacion: unknown;
  proyecto: string | null;
  project_name: string | null;
  project_type: string | null;
  is_global_project: boolean | null;
  activities: string[] | null;
  created_at: string | null;
  last_event_posted: string | null;
  fecha_post_formato: string | null;
  fecha_post_iso: string | null;
}

export interface ActivityRow {
  id: string;
  servicio_ait_id: string;
  codigo: string | null;
  nombre_servicio: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  horas_totales: number | null;
  tag_equipo: string | null;
  area_servicio: string | null;
  parent_code: string | null;
  es_ruta_critica: boolean | null;
  real_fecha_inicio: string | null;
  real_fecha_fin: string | null;
  empresa_minera: string | null;
  tipo_servicio: string | null;
}

export interface EventRow {
  id: string;
  servicio_ait_id: string | null;
  project_id: string | null;
  titulo: string | null;
  comentarios: string | null;
  visibilidad: string | null;
  etapa: string | null;
  porcentaje_avance: string | null;
  aprobacion: string | null;
  monto_modificado: string | null;
  hh_modificado: string | null;
  nueva_fecha_estimada: string | null;
  pdf_principal: string | null;
  foto_principal: string | null;
  image_url: string | null;
  filename_title: string | null;
  tipo_file: string | null;
  ait_nombre_servicio: string | null;
  ait_empresa_minera: string | null;
  ait_area_servicio: string | null;
  ait_photo_service_url: string | null;
  ait_numero: string | null;
  ait_company_name: string | null;
  email_perfil: string | null;
  nombre_perfil: string | null;
  foto_usuario_perfil: string | null;
  supervisores: string | null;
  hse: string | null;
  lider_tecnico: string | null;
  soldador: string | null;
  tecnico: string | null;
  ayudante: string | null;
  total_hh: number | null;
  causa: string | null;
  tipo_evento: string | null;
  clasificacion_hse: string | null;
  equipo_afectado: string | null;
  horas_perdidas: string | null;
  new_images: string[] | null;
  push_notification: string | null;
  proyecto: string | null;
  unico_id: string | null;
  created_at: string | null;
  fecha_post_formato: string | null;
  tag_equipo: string | null;
  event_origin: string | null;
  activity_id: string | null;
  activity_codigo: string | null;
}

export interface EventCommentRow {
  id: string;
  event_id: string;
  comment: string | null;
  commenter_email: string | null;
  commenter_name: string | null;
  commenter_photo: string | null;
  created_at: string;
}

export interface EventLikeRow {
  event_id: string;
  user_email: string;
}

export interface ServicePdfRow {
  id: string;
  servicio_ait_id: string;
  filename_title: string | null;
  pdf_url: string | null;
  tipo_file: string | null;
  email: string | null;
  comentario: string | null;
  size: number | null;
  created_at: string;
  fecha_post_formato: string | null;
}

export interface ApprovalRow {
  id: string;
  servicio_ait_id: string | null;
  approval_requested_by: string | null;
  approval_request_sent_to: string[] | null;
  approval_performed: string[] | null;
  rejection_performed: string[] | null;
  solicitud: string | null;
  solicitud_comentario: string | null;
  file_name: string | null;
  tipo_file: string | null;
  pdf_url: string | null;
  company_name: string | null;
  nombre_servicio: string | null;
  numero_servicio: string | null;
  area_servicio: string | null;
  id_time_approval: string | null;
  email: string | null;
  maintenance_log_id: string | null;
  created_at: string;
}

export interface ManpowerRow {
  id: string;
  total_servicios: string | null;
  servicios: string | null;
  total_ingenieria: string | null;
  ingenieria: string | null;
  photo_url: string | null;
  email: string | null;
  company_name: string | null;
  fecha_post_formato: string | null;
  created_at: string;
}

// Firebase-compatible document shapes (camelCase, used by existing UI)
export interface FirebaseUserDoc {
  displayNameform?: string;
  cargo?: string;
  descripcion?: string;
  photoURL?: string;
  email?: string;
  companyName?: string;
  userType?: string;
  uid?: string;
  EquipmentFavorities?: unknown[];
  ExpoPushNotificationToken?: string;
  proyecto?: string;
}

export interface FirebaseEventDoc {
  [key: string]: unknown;
}

export interface FirebaseServicioAitDoc {
  [key: string]: unknown;
}

export interface FirebaseApprovalDoc {
  [key: string]: unknown;
}

export interface FirebaseProjectDoc {
  id: string;
  projectName: string;
  projectType: string;
  createdAt: string;
}

export interface OfflineSupabaseOperation {
  id: string;
  type: "insert" | "update" | "upsert";
  table: string;
  data: Record<string, unknown>;
  match?: Record<string, unknown>;
  timestamp: number;
}

export interface EquipmentTagRow {
  id: string;
  tag_code: string;
  nombre: string;
  area: string | null;
  activo: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface MaintenanceLogRow {
  id: string;
  equipment_tag_id: string | null;
  tag_code: string;
  fecha: string;
  descripcion: string;
  personnel_type: string;
  company_name: string | null;
  supervisor_planta: string | null;
  supervisor_contratista: string | null;
  horas: number | null;
  tipo_mantenimiento: string | null;
  estado_equipo: string | null;
  numero_ot: string | null;
  parada_equipo_horas: number | null;
  foto_url: string | null;
  pdf_url: string | null;
  materiales: unknown[];
  aprobacion_requerida: boolean | null;
  aprobacion_estado: string | null;
  aprobador_email: string | null;
  causa: string | null;
  tipo_evento_hse: string | null;
  clasificacion_hse: string | null;
  horas_perdidas_hse: number | null;
  email_perfil: string | null;
  nombre_perfil: string | null;
  foto_usuario_perfil: string | null;
  project_id: string | null;
  servicio_ait_id: string | null;
  created_at: string;
}

export interface FirebaseMaintenanceLogDoc {
  [key: string]: unknown;
}

export interface EquipmentTimelineEntry {
  tag_code: string;
  fecha: string;
  source: "parada" | "mantenimiento";
  record_id: string;
  titulo: string | null;
  descripcion: string | null;
  personnel_type: string | null;
  autor: string | null;
  autor_email: string | null;
  detalle_extra: string | null;
  foto_url: string | null;
  tipo_mantenimiento: string | null;
  estado_equipo: string | null;
  horas: number | null;
  project_id: string | null;
  servicio_ait_id: string | null;
}

export interface TimelineFilters {
  source?: "parada" | "mantenimiento";
  personnelType?: "planta" | "contratista";
  startDate?: string;
  endDate?: string;
}

export interface KnowledgeEmbeddingRow {
  id: string;
  doc_type: string;
  source_id: string;
  servicio_ait_id: string | null;
  project_id: string | null;
  tag_equipo: string | null;
  activity_codigo: string | null;
  fecha: string | null;
  is_hse: boolean;
  clasificacion_hse: string | null;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}
