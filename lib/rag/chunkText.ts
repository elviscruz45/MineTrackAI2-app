/** Build searchable text chunks for knowledge_embeddings */

export type DocType =
  | "activity_plan"
  | "event_post"
  | "maintenance_log"
  | "service_summary";

export function buildActivityChunk(activity: Record<string, unknown>, servicio?: Record<string, unknown>): string {
  const tag = activity.TagEquipo ?? activity.tag_equipo ?? servicio?.TagEquipo ?? servicio?.tag_equipo ?? "";
  const project = servicio?.projectName ?? servicio?.project_name ?? "";
  const finPlan = activity.FechaFin ?? activity.fecha_fin ?? "";
  const finReal = activity.RealFechaFin ?? activity.real_fecha_fin ?? "";
  const inicioPlan = activity.FechaInicio ?? activity.fecha_inicio ?? "";
  const atrasada =
    finPlan && !finReal && new Date(String(finPlan)) < new Date()
      ? "SÍ — actividad atrasada"
      : "No";

  return [
    `TIPO: Actividad planificada WBS5`,
    `Código WBS: ${activity.Codigo ?? activity.codigo ?? ""}`,
    `Nombre: ${activity.NombreServicio ?? activity.nombre_servicio ?? ""}`,
    `Tag equipo: ${tag}`,
    `Área: ${activity.AreaServicio ?? activity.area_servicio ?? ""}`,
    `Proyecto: ${project}`,
    `Servicio padre: ${servicio?.NombreServicio ?? servicio?.nombre_servicio ?? ""}`,
    `Fecha inicio plan: ${inicioPlan}`,
    `Fecha fin plan: ${finPlan}`,
    `Fecha inicio real: ${activity.RealFechaInicio ?? activity.real_fecha_inicio ?? "pendiente"}`,
    `Fecha fin real: ${finReal || "pendiente"}`,
    `Estado atraso: ${atrasada}`,
    `Ruta crítica: ${activity.esRutaCritica ?? activity.es_ruta_critica ?? false}`,
    `Horas totales: ${activity.HorasTotales ?? activity.horas_totales ?? 0}`,
  ].join("\n");
}

export function buildEventChunk(event: Record<string, unknown>): string {
  const isHse =
    String(event.tipoEvento ?? event.tipo_evento ?? "").toUpperCase().includes("HSE") ||
    Boolean(event.clasificacionHSE ?? event.clasificacion_hse);

  return [
    `TIPO: Evento de campo (post parada)`,
    `Título: ${event.titulo ?? ""}`,
    `Descripción: ${event.comentarios ?? ""}`,
    `Tag equipo: ${event.tag_equipo ?? event.TagEquipo ?? ""}`,
    `Actividad WBS: ${event.activity_codigo ?? event.activityCodigo ?? ""}`,
    `Servicio: ${event.AITNombreServicio ?? event.ait_nombre_servicio ?? ""}`,
    `Etapa: ${event.etapa ?? ""}`,
    `Avance: ${event.porcentajeAvance ?? event.porcentaje_avance ?? 0}%`,
    `Autor: ${event.nombrePerfil ?? event.nombre_perfil ?? ""}`,
    `Fecha: ${event.fechaPostFormato ?? event.created_at ?? ""}`,
    isHse ? `EVENTO HSE: ${event.clasificacionHSE ?? event.clasificacion_hse ?? ""}` : "",
    isHse ? `Causa: ${event.causa ?? ""}` : "",
    isHse ? `Horas perdidas: ${event.horasPerdidas ?? event.horas_perdidas ?? 0}` : "",
    isHse ? `Componente afectado: ${event.equipoAfectado ?? event.equipo_afectado ?? ""}` : "",
    `HH totales: ${event.totalHH ?? event.total_hh ?? 0}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildMaintenanceChunk(log: Record<string, unknown>): string {
  return [
    `TIPO: Mantenimiento diario operaciones`,
    `Tag equipo: ${log.tag_code ?? log.TagEquipo ?? ""}`,
    `Descripción: ${log.descripcion ?? ""}`,
    `Tipo mantenimiento: ${log.tipo_mantenimiento ?? log.tipoMantenimiento ?? ""}`,
    `Personal: ${log.personnel_type ?? log.personnelType ?? ""}`,
    `Estado equipo: ${log.estado_equipo ?? log.estadoEquipo ?? ""}`,
    `OT: ${log.numero_ot ?? log.numeroOT ?? ""}`,
    `Horas: ${log.horas ?? 0}`,
    `Supervisor planta: ${log.supervisor_planta ?? log.supervisorPlanta ?? ""}`,
    `Supervisor contratista: ${log.supervisor_contratista ?? log.supervisorContratista ?? ""}`,
    `Fecha: ${log.fecha ?? ""}`,
    log.clasificacion_hse || log.clasificacionHSE
      ? `HSE: ${log.clasificacion_hse ?? log.clasificacionHSE}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildServiceSummaryChunk(
  servicio: Record<string, unknown>,
  activities: Record<string, unknown>[] = []
): string {
  let text = [
    `TIPO: Resumen servicio AIT`,
    `Servicio: ${servicio.NombreServicio ?? servicio.nombre_servicio ?? ""}`,
    `Código: ${servicio.Codigo ?? servicio.codigo ?? ""}`,
    `Tag equipo: ${servicio.TagEquipo ?? servicio.tag_equipo ?? ""}`,
    `Proyecto: ${servicio.projectName ?? servicio.project_name ?? ""}`,
    `Área: ${servicio.AreaServicio ?? servicio.area_servicio ?? ""}`,
    `Empresa: ${servicio.EmpresaMinera ?? servicio.empresa_minera ?? ""}`,
    `Avance ejecución: ${servicio.AvanceEjecucion ?? servicio.avance_ejecucion ?? 0}%`,
    `\nACTIVIDADES (${activities.length}):`,
  ].join("\n");

  activities.forEach((a, i) => {
    text += `\n${i + 1}. ${buildActivityChunk(a, servicio)}`;
  });
  return text;
}
