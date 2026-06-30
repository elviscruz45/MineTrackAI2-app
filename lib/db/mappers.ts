import type {
  ProfileRow,
  ServicioAitRow,
  ActivityRow,
  EventRow,
  EventCommentRow,
  ApprovalRow,
  ManpowerRow,
  ServicePdfRow,
  ProjectRow,
  FirebaseUserDoc,
  FirebaseServicioAitDoc,
  FirebaseEventDoc,
  FirebaseApprovalDoc,
  FirebaseProjectDoc,
} from "./types";

const toDate = (v: unknown): Date | null => {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof v === "object" && v !== null && "toDate" in v) {
    return (v as { toDate: () => Date }).toDate();
  }
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? null : d;
};

const toIso = (v: unknown): string | null => {
  const d = toDate(v);
  return d ? d.toISOString() : v ? String(v) : null;
};

// --- Profiles ---

export function profileToFirebase(row: ProfileRow): FirebaseUserDoc {
  return {
    displayNameform: row.display_name ?? "",
    cargo: row.cargo ?? "",
    descripcion: row.descripcion ?? "",
    photoURL: row.photo_url ?? "",
    email: row.email ?? "",
    companyName: row.company_name ?? "",
    userType: row.user_type ?? "",
    uid: row.firebase_uid,
    EquipmentFavorities: row.equipment_favorites ?? [],
    ExpoPushNotificationToken: row.expo_push_token ?? "",
    proyecto: row.proyecto ?? "todos",
  };
}

export function firebaseToProfile(
  doc: FirebaseUserDoc,
  firebaseUid: string
): Partial<ProfileRow> {
  return {
    firebase_uid: firebaseUid,
    display_name: doc.displayNameform ?? "",
    cargo: doc.cargo ?? "",
    descripcion: doc.descripcion ?? "",
    photo_url: doc.photoURL ?? "",
    email: doc.email ?? "",
    company_name: doc.companyName ?? "",
    user_type: doc.userType ?? "",
    equipment_favorites: doc.EquipmentFavorities ?? [],
    expo_push_token: doc.ExpoPushNotificationToken ?? "",
    proyecto: doc.proyecto ?? "todos",
  };
}

// --- Projects ---

export function projectToFirebase(row: ProjectRow): FirebaseProjectDoc {
  return {
    id: row.id,
    projectName: row.project_name,
    projectType: row.project_type ?? "",
    createdAt: row.created_at,
  };
}

export function firebaseToProject(doc: {
  projectName: string;
  projectType?: string;
}): Partial<ProjectRow> {
  return {
    project_name: doc.projectName,
    project_type: doc.projectType ?? "",
  };
}

// --- ServiciosAIT ---

export function servicioAitToFirebase(
  row: ServicioAitRow,
  activitiesData: ActivityRow[] = [],
  pdfFile: ServicePdfRow[] = [],
  events: FirebaseEventDoc[] = []
): FirebaseServicioAitDoc {
  return {
    idServiciosAIT: row.id,
    Codigo: row.codigo ?? "",
    NombreServicio: row.nombre_servicio ?? "",
    NumeroAIT: row.numero_ait ?? "",
    EmpresaMinera: row.empresa_minera ?? "",
    AreaServicio: row.area_servicio ?? "",
    TagEquipo: row.tag_equipo ?? "",
    TipoServicio: row.tipo_servicio ?? "",
    esRutaCritica: row.es_ruta_critica ?? "No",
    ResponsableEmpresaUsuario: row.responsable_usuario_1 ?? "",
    ResponsableEmpresaUsuario2: row.responsable_usuario_2 ?? "",
    ResponsableEmpresaUsuario3: row.responsable_usuario_3 ?? "",
    ResponsableEmpresaContratista: row.responsable_contratista_1 ?? "",
    ResponsableEmpresaContratista2: row.responsable_contratista_2 ?? "",
    ResponsableEmpresaContratista3: row.responsable_contratista_3 ?? "",
    SupervisorMina: row.supervisor_mina ?? "",
    SupervisorEECC: row.supervisor_eecc ?? "",
    FechaInicio: toDate(row.fecha_inicio),
    FechaFin: toDate(row.fecha_fin),
    NumeroCotizacion: row.numero_cotizacion ?? "",
    Moneda: row.moneda ?? "",
    Monto: row.monto ?? "",
    SupervisorSeguridad: row.supervisor_seguridad ?? "0",
    Supervisor: row.supervisor ?? "0",
    Tecnicos: row.tecnicos ?? "0",
    Lider: row.lider ?? "0",
    Soldador: row.soldador ?? "0",
    HorasTotales: row.horas_totales ?? 0,
    HorasHombre: row.horas_hombre ?? "",
    NuevaFechaEstimada: row.nueva_fecha_estimada ?? 0,
    fechaFinEjecucion: row.fecha_fin_ejecucion ?? 0,
    photoServiceURL: row.photo_service_url ?? "",
    emailPerfil: row.email_perfil ?? "",
    nombrePerfil: row.nombre_perfil ?? "",
    companyName: row.company_name ?? "",
    AvanceEjecucion: row.avance_ejecucion ?? 0,
    AvanceAdministrativo: row.avance_administrativo ?? 0,
    AvanceAdministrativoTexto: row.avance_administrativo_texto ?? "",
    HHModificado: row.hh_modificado ?? 0,
    MontoModificado: row.monto_modificado ?? 0,
    aprobacion: row.aprobacion ?? [],
    proyecto: row.proyecto ?? "",
    projectId: row.project_id ?? "",
    projectName: row.project_name ?? "",
    projectType: row.project_type ?? "",
    isGlobalProject: row.is_global_project ?? false,
    activities: row.activities ?? [],
    activitiesData: activitiesData.map(activityToFirebase),
    pdfFile: pdfFile.map(pdfToFirebase),
    events,
    createdAt: toDate(row.created_at),
    LastEventPosted: toDate(row.last_event_posted),
    fechaPostFormato: row.fecha_post_formato ?? "",
    fechaPostISO: row.fecha_post_iso ?? "",
  };
}

export function pickPartialRow<T extends Record<string, unknown>>(
  source: Record<string, unknown>,
  mapped: T,
  fieldKeys: string[]
): Partial<T> {
  const result: Partial<T> = {};
  for (const key of fieldKeys) {
    if (key in source && source[key] !== undefined) {
      result[key as keyof T] = mapped[key as keyof T];
    }
  }
  return result;
}

const SERVICIO_AIT_FIELD_KEYS = [
  "id", "project_id", "codigo", "nombre_servicio", "numero_ait", "empresa_minera",
  "area_servicio", "tag_equipo", "tipo_servicio", "es_ruta_critica",
  "responsable_usuario_1", "responsable_usuario_2", "responsable_usuario_3",
  "responsable_contratista_1", "responsable_contratista_2", "responsable_contratista_3",
  "supervisor_mina", "supervisor_eecc", "fecha_inicio", "fecha_fin",
  "numero_cotizacion", "moneda", "monto", "supervisor_seguridad", "supervisor",
  "tecnicos", "lider", "soldador", "horas_totales", "horas_hombre",
  "nueva_fecha_estimada", "fecha_fin_ejecucion", "photo_service_url",
  "email_perfil", "nombre_perfil", "company_name", "avance_ejecucion",
  "avance_administrativo", "avance_administrativo_texto", "hh_modificado",
  "monto_modificado", "aprobacion", "proyecto", "project_name", "project_type",
  "is_global_project", "activities", "last_event_posted", "fecha_post_formato",
  "fecha_post_iso", "created_at",
] as const;

const FIREBASE_SERVICIO_KEYS = [
  "idServiciosAIT", "projectId", "Codigo", "NombreServicio", "NumeroAIT",
  "EmpresaMinera", "AreaServicio", "TagEquipo", "TipoServicio", "esRutaCritica",
  "ResponsableEmpresaUsuario", "ResponsableEmpresaUsuario2", "ResponsableEmpresaUsuario3",
  "ResponsableEmpresaContratista", "ResponsableEmpresaContratista2",
  "ResponsableEmpresaContratista3", "SupervisorMina", "SupervisorEECC",
  "FechaInicio", "FechaFin", "NumeroCotizacion", "Moneda", "Monto",
  "SupervisorSeguridad", "Supervisor", "Tecnicos", "Lider", "Soldador",
  "HorasTotales", "HorasHombre", "NuevaFechaEstimada", "fechaFinEjecucion",
  "photoServiceURL", "emailPerfil", "nombrePerfil", "companyName",
  "AvanceEjecucion", "AvanceAdministrativo", "AvanceAdministrativoTexto",
  "HHModificado", "MontoModificado", "aprobacion", "proyecto", "projectName",
  "projectType", "isGlobalProject", "activities", "LastEventPosted",
  "fechaPostFormato", "fechaPostISO", "createdAt",
] as const;

export function partialFirebaseToServicioAit(
  doc: Partial<FirebaseServicioAitDoc>
): Partial<import("./types").ServicioAitRow> {
  const mapped = firebaseToServicioAit(doc as FirebaseServicioAitDoc);
  const source = doc as Record<string, unknown>;
  const result: Partial<import("./types").ServicioAitRow> = {};
  FIREBASE_SERVICIO_KEYS.forEach((fbKey, i) => {
    const sbKey = SERVICIO_AIT_FIELD_KEYS[i];
    if (fbKey in source && source[fbKey] !== undefined) {
      (result as Record<string, unknown>)[sbKey] = (mapped as Record<string, unknown>)[sbKey];
    }
  });
  return result;
}

export function firebaseToServicioAit(
  doc: FirebaseServicioAitDoc
): Partial<ServicioAitRow> {
  const d = doc as Record<string, unknown>;
  return {
    id: String(d.idServiciosAIT ?? ""),
    project_id: (d.projectId as string) || null,
    codigo: String(d.Codigo ?? ""),
    nombre_servicio: String(d.NombreServicio ?? ""),
    numero_ait: String(d.NumeroAIT ?? ""),
    empresa_minera: String(d.EmpresaMinera ?? ""),
    area_servicio: String(d.AreaServicio ?? ""),
    tag_equipo: String(d.TagEquipo ?? ""),
    tipo_servicio: String(d.TipoServicio ?? ""),
    es_ruta_critica: String(d.esRutaCritica ?? "No"),
    responsable_usuario_1: String(d.ResponsableEmpresaUsuario ?? ""),
    responsable_usuario_2: String(d.ResponsableEmpresaUsuario2 ?? ""),
    responsable_usuario_3: String(d.ResponsableEmpresaUsuario3 ?? ""),
    responsable_contratista_1: String(d.ResponsableEmpresaContratista ?? ""),
    responsable_contratista_2: String(d.ResponsableEmpresaContratista2 ?? ""),
    responsable_contratista_3: String(d.ResponsableEmpresaContratista3 ?? ""),
    supervisor_mina: String(d.SupervisorMina ?? d.ResponsableEmpresaUsuario3 ?? ""),
    supervisor_eecc: String(d.SupervisorEECC ?? d.ResponsableEmpresaContratista3 ?? ""),
    fecha_inicio: toIso(d.FechaInicio),
    fecha_fin: toIso(d.FechaFin),
    numero_cotizacion: String(d.NumeroCotizacion ?? ""),
    moneda: String(d.Moneda ?? ""),
    monto: String(d.Monto ?? ""),
    supervisor_seguridad: String(d.SupervisorSeguridad ?? "0"),
    supervisor: String(d.Supervisor ?? "0"),
    tecnicos: String(d.Tecnicos ?? "0"),
    lider: String(d.Lider ?? "0"),
    soldador: String(d.Soldador ?? "0"),
    horas_totales: Number(d.HorasTotales) || 0,
    horas_hombre: String(d.HorasHombre ?? ""),
    nueva_fecha_estimada: Number(d.NuevaFechaEstimada) || 0,
    fecha_fin_ejecucion: Number(d.fechaFinEjecucion) || 0,
    photo_service_url: String(d.photoServiceURL ?? ""),
    email_perfil: String(d.emailPerfil ?? ""),
    nombre_perfil: String(d.nombrePerfil ?? ""),
    company_name: String(d.companyName ?? ""),
    avance_ejecucion: Number(d.AvanceEjecucion) || 0,
    avance_administrativo: Number(d.AvanceAdministrativo) || 0,
    avance_administrativo_texto: String(d.AvanceAdministrativoTexto ?? ""),
    hh_modificado: Number(d.HHModificado) || 0,
    monto_modificado: Number(d.MontoModificado) || 0,
    aprobacion: d.aprobacion ?? [],
    proyecto: String(d.proyecto ?? ""),
    project_name: String(d.projectName ?? ""),
    project_type: String(d.projectType ?? ""),
    is_global_project: Boolean(d.isGlobalProject),
    activities: (d.activities as string[]) ?? [],
    last_event_posted: toIso(d.LastEventPosted),
    fecha_post_formato: String(d.fechaPostFormato ?? ""),
    fecha_post_iso: String(d.fechaPostISO ?? ""),
    created_at: toIso(d.createdAt),
  };
}

export function activityToFirebase(row: ActivityRow): Record<string, unknown> {
  return {
    id: row.id,
    Codigo: row.codigo ?? "",
    NombreServicio: row.nombre_servicio ?? "",
    FechaInicio: toDate(row.fecha_inicio),
    FechaFin: toDate(row.fecha_fin),
    HorasTotales: row.horas_totales ?? 0,
    TagEquipo: row.tag_equipo ?? "",
    AreaServicio: row.area_servicio ?? "",
    parentCode: row.parent_code ?? "",
    esRutaCritica: row.es_ruta_critica ?? false,
    RealFechaInicio: toDate(row.real_fecha_inicio),
    RealFechaFin: toDate(row.real_fecha_fin),
    EmpresaMinera: row.empresa_minera ?? "",
    TipoServicio: row.tipo_servicio ?? "",
  };
}

export function firebaseToActivity(
  doc: Record<string, unknown>,
  servicioAitId: string
): Partial<ActivityRow> {
  return {
    servicio_ait_id: servicioAitId,
    codigo: String(doc.Codigo ?? ""),
    nombre_servicio: String(doc.NombreServicio ?? ""),
    fecha_inicio: toIso(doc.FechaInicio),
    fecha_fin: toIso(doc.FechaFin),
    horas_totales: Number(doc.HorasTotales) || 0,
    tag_equipo: String(doc.TagEquipo ?? ""),
    area_servicio: String(doc.AreaServicio ?? ""),
    parent_code: String(doc.parentCode ?? ""),
    es_ruta_critica: Boolean(doc.esRutaCritica),
    real_fecha_inicio: toIso(doc.RealFechaInicio),
    real_fecha_fin: toIso(doc.RealFechaFin),
    empresa_minera: String(doc.EmpresaMinera ?? ""),
    tipo_servicio: String(doc.TipoServicio ?? ""),
  };
}

export function pdfToFirebase(row: ServicePdfRow): Record<string, unknown> {
  return {
    FilenameTitle: row.filename_title ?? "",
    pdfPrincipal: row.pdf_url ?? "",
    tipoFile: row.tipo_file ?? "",
    email: row.email ?? "",
    fecha: toDate(row.created_at),
    fechaPostFormato: row.fecha_post_formato ?? "",
    pdfFile: "",
    size: row.size ?? 0,
    comentario: row.comentario ?? "",
  };
}

export function firebaseToPdf(
  doc: Record<string, unknown>,
  servicioAitId: string
): Partial<ServicePdfRow> {
  return {
    servicio_ait_id: servicioAitId,
    filename_title: String(doc.FilenameTitle ?? ""),
    pdf_url: String(doc.pdfPrincipal ?? ""),
    tipo_file: String(doc.tipoFile ?? ""),
    email: String(doc.email ?? ""),
    comentario: String(doc.comentario ?? ""),
    size: Number(doc.size) || 0,
    fecha_post_formato: String(doc.fechaPostFormato ?? ""),
  };
}

// --- Events ---

export function eventToFirebase(
  row: EventRow,
  likes: string[] = [],
  comentariosUsuarios: Record<string, unknown>[] = []
): FirebaseEventDoc {
  return {
    idDocFirestoreDB: row.id,
    id: row.id,
    unicoID: row.unico_id ?? row.id,
    servicio_ait_id: row.servicio_ait_id,
    projectId: row.project_id ?? "",
    titulo: row.titulo ?? "",
    comentarios: row.comentarios ?? "",
    visibilidad: row.visibilidad ?? "Todos",
    etapa: row.etapa ?? "",
    porcentajeAvance: row.porcentaje_avance ?? "0",
    aprobacion: row.aprobacion ?? "",
    MontoModificado: row.monto_modificado ?? "",
    HHModificado: row.hh_modificado ?? "",
    NuevaFechaEstimada: toDate(row.nueva_fecha_estimada),
    pdfPrincipal: row.pdf_principal ?? "",
    fotoPrincipal: row.foto_principal ?? "",
    imageUrl: row.image_url ?? "",
    FilenameTitle: row.filename_title ?? "",
    tipoFile: row.tipo_file ?? "",
    AITidServicios: row.servicio_ait_id ?? "",
    AITNombreServicio: row.ait_nombre_servicio ?? "",
    AITEmpresaMinera: row.ait_empresa_minera ?? "",
    AITAreaServicio: row.ait_area_servicio ?? "",
    AITphotoServiceURL: row.ait_photo_service_url ?? "",
    AITNumero: row.ait_numero ?? "",
    AITcompanyName: row.ait_company_name ?? "",
    emailPerfil: row.email_perfil ?? "",
    nombrePerfil: row.nombre_perfil ?? "",
    fotoUsuarioPerfil: row.foto_usuario_perfil ?? "",
    supervisores: row.supervisores ?? "",
    HSE: row.hse ?? "",
    liderTecnico: row.lider_tecnico ?? "",
    soldador: row.soldador ?? "",
    tecnico: row.tecnico ?? "",
    ayudante: row.ayudante ?? "",
    totalHH: row.total_hh ?? 0,
    causa: row.causa ?? "",
    tipoEvento: row.tipo_evento ?? "",
    clasificacionHSE: row.clasificacion_hse ?? "",
    equipoAfectado: row.equipo_afectado ?? "",
    horasPerdidas: row.horas_perdidas ?? "",
    newImages: row.new_images ?? [],
    pushNotification: row.push_notification ?? "",
    proyecto: row.proyecto ?? "",
    tag_equipo: row.tag_equipo ?? "",
    event_origin: row.event_origin ?? "parada",
    activity_id: row.activity_id ?? "",
    activity_codigo: row.activity_codigo ?? "",
    activityCodigo: row.activity_codigo ?? "",
    createdAt: toDate(row.created_at),
    fechaPostFormato: row.fecha_post_formato ?? "",
    likes,
    comentariosUsuarios,
    pdfFile: "",
  };
}

export function firebaseToEvent(doc: FirebaseEventDoc): Partial<EventRow> {
  const d = doc as Record<string, unknown>;
  return {
    id: String(d.idDocFirestoreDB ?? d.id ?? d.unicoID ?? ""),
    servicio_ait_id: (() => {
      const id = d.AITidServicios ?? d.servicio_ait_id;
      return id ? String(id) : null;
    })(),
    project_id: (d.projectId as string) || null,
    titulo: String(d.titulo ?? ""),
    comentarios: String(d.comentarios ?? ""),
    visibilidad: String(d.visibilidad ?? "Todos"),
    etapa: String(d.etapa ?? ""),
    porcentaje_avance: String(d.porcentajeAvance ?? "0"),
    aprobacion: String(d.aprobacion ?? ""),
    monto_modificado: String(d.MontoModificado ?? ""),
    hh_modificado: String(d.HHModificado ?? ""),
    nueva_fecha_estimada: toIso(d.NuevaFechaEstimada),
    pdf_principal: String(d.pdfPrincipal ?? ""),
    foto_principal: String(d.fotoPrincipal ?? ""),
    image_url: String(d.imageUrl ?? ""),
    filename_title: String(d.FilenameTitle ?? ""),
    tipo_file: String(d.tipoFile ?? ""),
    ait_nombre_servicio: String(d.AITNombreServicio ?? ""),
    ait_empresa_minera: String(d.AITEmpresaMinera ?? ""),
    ait_area_servicio: String(d.AITAreaServicio ?? ""),
    ait_photo_service_url: String(d.AITphotoServiceURL ?? ""),
    ait_numero: String(d.AITNumero ?? ""),
    ait_company_name: String(d.AITcompanyName ?? ""),
    email_perfil: String(d.emailPerfil ?? ""),
    nombre_perfil: String(d.nombrePerfil ?? ""),
    foto_usuario_perfil: String(d.fotoUsuarioPerfil ?? ""),
    supervisores: String(d.supervisores ?? ""),
    hse: String(d.HSE ?? ""),
    lider_tecnico: String(d.liderTecnico ?? ""),
    soldador: String(d.soldador ?? ""),
    tecnico: String(d.tecnico ?? ""),
    ayudante: String(d.ayudante ?? ""),
    total_hh: Number(d.totalHH) || 0,
    causa: String(d.causa ?? ""),
    tipo_evento: String(d.tipoEvento ?? ""),
    clasificacion_hse: String(d.clasificacionHSE ?? ""),
    equipo_afectado: String(d.equipoAfectado ?? ""),
    horas_perdidas: String(d.horasPerdidas ?? ""),
    new_images: (d.newImages as string[]) ?? [],
    push_notification: String(d.pushNotification ?? ""),
    proyecto: String(d.proyecto ?? ""),
    tag_equipo: String(d.tag_equipo ?? d.TagEquipo ?? ""),
    event_origin: String(d.event_origin ?? "parada"),
    activity_id: (d.activity_id as string) || null,
    activity_codigo: String(d.activity_codigo ?? d.activityCodigo ?? ""),
    unico_id: String(d.unicoID ?? d.idDocFirestoreDB ?? ""),
    created_at: toIso(d.createdAt) ?? new Date().toISOString(),
    fecha_post_formato: String(d.fechaPostFormato ?? ""),
  };
}

export function commentToFirebase(row: EventCommentRow): Record<string, unknown> {
  return {
    comment: row.comment ?? "",
    commenterEmail: row.commenter_email ?? "",
    commenterName: row.commenter_name ?? "",
    commenterPhoto: row.commenter_photo ?? "",
    date: new Date(row.created_at).getTime(),
  };
}

export function firebaseToComment(
  doc: Record<string, unknown>,
  eventId: string
): Partial<EventCommentRow> {
  return {
    event_id: eventId,
    comment: String(doc.comment ?? ""),
    commenter_email: String(doc.commenterEmail ?? ""),
    commenter_name: String(doc.commenterName ?? ""),
    commenter_photo: String(doc.commenterPhoto ?? ""),
    created_at: doc.date
      ? new Date(Number(doc.date)).toISOString()
      : new Date().toISOString(),
  };
}

// --- Approvals ---

export function approvalToFirebase(row: ApprovalRow): FirebaseApprovalDoc {
  return {
    idApproval: row.id,
    IdAITService: row.servicio_ait_id ?? "",
    ApprovalRequestedBy: row.approval_requested_by ?? "",
    ApprovalRequestSentTo: row.approval_request_sent_to ?? [],
    ApprovalPerformed: row.approval_performed ?? [],
    RejectionPerformed: row.rejection_performed ?? [],
    solicitud: row.solicitud ?? "",
    solicitudComentario: row.solicitud_comentario ?? "",
    fileName: row.file_name ?? "",
    tipoFile: row.tipo_file ?? "",
    pdfFile: row.pdf_url ?? "",
    companyName: row.company_name ?? "",
    nombreServicio: row.nombre_servicio ?? "",
    NumeroServicio: row.numero_servicio ?? "",
    AreaServicio: row.area_servicio ?? "",
    idTimeApproval: row.id_time_approval ?? "",
    email: row.email ?? "",
    maintenance_log_id: row.maintenance_log_id ?? "",
    date: toDate(row.created_at),
  };
}

export function firebaseToApproval(doc: FirebaseApprovalDoc): Partial<ApprovalRow> {
  const d = doc as Record<string, unknown>;
  return {
    id: String(d.idApproval ?? ""),
    servicio_ait_id: String(d.IdAITService ?? ""),
    approval_requested_by: String(d.ApprovalRequestedBy ?? ""),
    approval_request_sent_to: (d.ApprovalRequestSentTo as string[]) ?? [],
    approval_performed: (d.ApprovalPerformed as string[]) ?? [],
    rejection_performed: (d.RejectionPerformed as string[]) ?? [],
    solicitud: String(d.solicitud ?? ""),
    solicitud_comentario: String(d.solicitudComentario ?? ""),
    file_name: String(d.fileName ?? ""),
    tipo_file: String(d.tipoFile ?? ""),
    pdf_url: String(d.pdfFile ?? ""),
    company_name: String(d.companyName ?? ""),
    nombre_servicio: String(d.nombreServicio ?? ""),
    numero_servicio: String(d.NumeroServicio ?? ""),
    area_servicio: String(d.AreaServicio ?? ""),
    id_time_approval: String(d.idTimeApproval ?? ""),
    email: String(d.email ?? ""),
    maintenance_log_id: String(d.maintenance_log_id ?? ""),
    created_at: toIso(d.date) ?? new Date().toISOString(),
  };
}

// --- Manpower ---

export function manpowerToFirebase(row: ManpowerRow): Record<string, unknown> {
  return {
    TotalServicios: row.total_servicios ?? "",
    Servicios: row.servicios ?? "",
    TotalIngenieria: row.total_ingenieria ?? "",
    Ingenieria: row.ingenieria ?? "",
    photoURL: row.photo_url ?? "",
    email: row.email ?? "",
    companyName: row.company_name ?? "",
    fechaPostFormato: row.fecha_post_formato ?? "",
    createdAt: toDate(row.created_at),
  };
}

export function firebaseToManpower(doc: Record<string, unknown>): Partial<ManpowerRow> {
  return {
    total_servicios: String(doc.TotalServicios ?? ""),
    servicios: String(doc.Servicios ?? ""),
    total_ingenieria: String(doc.TotalIngenieria ?? ""),
    ingenieria: String(doc.Ingenieria ?? ""),
    photo_url: String(doc.photoURL ?? ""),
    email: String(doc.email ?? ""),
    company_name: String(doc.companyName ?? ""),
    fecha_post_formato: String(doc.fechaPostFormato ?? ""),
    created_at: toIso(doc.createdAt) ?? new Date().toISOString(),
  };
}

// Event summary embedded in ServiciosAIT.events[]
export function eventToSummary(doc: FirebaseEventDoc): Record<string, unknown> {
  const d = doc as Record<string, unknown>;
  return {
    idDocFirestoreDB: d.idDocFirestoreDB ?? d.id ?? "",
    idDocAITFirestoreDB: d.AITidServicios ?? "",
    fotoPrincipal: d.fotoPrincipal ?? "",
    fotoUsuarioPerfil: d.fotoUsuarioPerfil ?? "",
    AITNombreServicio: d.AITNombreServicio ?? "",
    titulo: d.titulo ?? "",
    comentarios: d.comentarios ?? "",
    porcentajeAvance: d.porcentajeAvance ?? "0",
    AITNumero: d.AITNumero ?? "",
    etapa: d.etapa ?? "",
    pdfPrincipal: d.pdfPrincipal ?? "",
    fechaPostFormato: d.fechaPostFormato ?? "",
    createdAt: d.createdAt,
    emailPerfil: d.emailPerfil ?? "",
    imageUrl: d.imageUrl ?? "",
    nombrePerfil: d.nombrePerfil ?? "",
    visibilidad: d.visibilidad ?? "",
    newImages: d.newImages ?? [],
    supervisores: d.supervisores ?? "",
    HSE: d.HSE ?? "",
    liderTecnico: d.liderTecnico ?? "",
    soldador: d.soldador ?? "",
    tecnico: d.tecnico ?? "",
    ayudante: d.ayudante ?? "",
    totalHH: d.totalHH ?? 0,
    causa: d.causa ?? "",
    tipoEvento: d.tipoEvento ?? "",
    clasificacionHSE: d.clasificacionHSE ?? "",
    equipoAfectado: d.equipoAfectado ?? "",
    horasPerdidas: d.horasPerdidas ?? "",
  };
}

// --- Maintenance Logs ---

export function maintenanceLogToFirebase(
  row: import("./types").MaintenanceLogRow
): import("./types").FirebaseMaintenanceLogDoc {
  return {
    id: row.id,
    equipment_tag_id: row.equipment_tag_id,
    tag_code: row.tag_code,
    TagEquipo: row.tag_code,
    fecha: toDate(row.fecha),
    descripcion: row.descripcion,
    personnel_type: row.personnel_type,
    personnelType: row.personnel_type,
    company_name: row.company_name,
    companyName: row.company_name,
    supervisor_planta: row.supervisor_planta,
    supervisorPlanta: row.supervisor_planta,
    supervisor_contratista: row.supervisor_contratista,
    supervisorContratista: row.supervisor_contratista,
    horas: row.horas ?? 0,
    tipo_mantenimiento: row.tipo_mantenimiento,
    tipoMantenimiento: row.tipo_mantenimiento,
    estado_equipo: row.estado_equipo,
    estadoEquipo: row.estado_equipo,
    numero_ot: row.numero_ot,
    numeroOT: row.numero_ot,
    parada_equipo_horas: row.parada_equipo_horas ?? 0,
    paradaEquipoHoras: row.parada_equipo_horas ?? 0,
    foto_url: row.foto_url,
    fotoUrl: row.foto_url,
    pdf_url: row.pdf_url,
    materiales: row.materiales ?? [],
    aprobacion_requerida: row.aprobacion_requerida ?? false,
    aprobacionRequerida: row.aprobacion_requerida ?? false,
    aprobacion_estado: row.aprobacion_estado,
    aprobacionEstado: row.aprobacion_estado,
    aprobador_email: row.aprobador_email,
    aprobadorEmail: row.aprobador_email,
    causa: row.causa,
    tipo_evento_hse: row.tipo_evento_hse,
    tipoEventoHSE: row.tipo_evento_hse,
    clasificacion_hse: row.clasificacion_hse,
    clasificacionHSE: row.clasificacion_hse,
    horas_perdidas_hse: row.horas_perdidas_hse ?? 0,
    horasPerdidasHSE: row.horas_perdidas_hse ?? 0,
    email_perfil: row.email_perfil,
    emailPerfil: row.email_perfil,
    nombre_perfil: row.nombre_perfil,
    nombrePerfil: row.nombre_perfil,
    foto_usuario_perfil: row.foto_usuario_perfil,
    fotoUsuarioPerfil: row.foto_usuario_perfil,
    project_id: row.project_id,
    projectId: row.project_id,
    servicio_ait_id: row.servicio_ait_id,
    servicioAitId: row.servicio_ait_id,
    created_at: row.created_at,
    createdAt: toDate(row.created_at),
  };
}

export function firebaseToMaintenanceLog(
  doc: import("./types").FirebaseMaintenanceLogDoc
): Partial<import("./types").MaintenanceLogRow> {
  const d = doc as Record<string, unknown>;
  return {
    id: String(d.id ?? `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`),
    equipment_tag_id: (d.equipment_tag_id as string) || null,
    tag_code: String(d.tag_code ?? d.TagEquipo ?? ""),
    fecha: toIso(d.fecha) ?? new Date().toISOString(),
    descripcion: String(d.descripcion ?? ""),
    personnel_type: String(d.personnel_type ?? d.personnelType ?? "planta"),
    company_name: String(d.company_name ?? d.companyName ?? ""),
    supervisor_planta: String(d.supervisor_planta ?? d.supervisorPlanta ?? ""),
    supervisor_contratista: String(
      d.supervisor_contratista ?? d.supervisorContratista ?? ""
    ),
    horas: Number(d.horas) || 0,
    tipo_mantenimiento: String(
      d.tipo_mantenimiento ?? d.tipoMantenimiento ?? "rutinario"
    ),
    estado_equipo: String(d.estado_equipo ?? d.estadoEquipo ?? "operativo"),
    numero_ot: String(d.numero_ot ?? d.numeroOT ?? ""),
    parada_equipo_horas: Number(d.parada_equipo_horas ?? d.paradaEquipoHoras) || 0,
    foto_url: String(d.foto_url ?? d.fotoUrl ?? ""),
    pdf_url: String(d.pdf_url ?? ""),
    materiales: (d.materiales as unknown[]) ?? [],
    aprobacion_requerida: Boolean(d.aprobacion_requerida ?? d.aprobacionRequerida),
    aprobacion_estado: String(
      d.aprobacion_estado ?? d.aprobacionEstado ?? "pendiente"
    ),
    aprobador_email: String(d.aprobador_email ?? d.aprobadorEmail ?? ""),
    causa: String(d.causa ?? ""),
    tipo_evento_hse: String(d.tipo_evento_hse ?? d.tipoEventoHSE ?? ""),
    clasificacion_hse: String(d.clasificacion_hse ?? d.clasificacionHSE ?? ""),
    horas_perdidas_hse: Number(d.horas_perdidas_hse ?? d.horasPerdidasHSE) || 0,
    email_perfil: String(d.email_perfil ?? d.emailPerfil ?? ""),
    nombre_perfil: String(d.nombre_perfil ?? d.nombrePerfil ?? ""),
    foto_usuario_perfil: String(d.foto_usuario_perfil ?? d.fotoUsuarioPerfil ?? ""),
    project_id: (d.project_id ?? d.projectId) as string | null,
    servicio_ait_id: (d.servicio_ait_id ?? d.servicioAitId) as string | null,
    created_at: toIso(d.createdAt) ?? new Date().toISOString(),
  };
}
