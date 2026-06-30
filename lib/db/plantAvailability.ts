import { supabase } from "@/lib/supabase";
import { getAllEquipmentTags } from "./equipmentTags";
import { getMaintenanceLogsByDateRange } from "./maintenanceLogs";
import { TAG_AREA_COLORS } from "@/utils/tagEquipoList";
import type { FirebaseMaintenanceLogDoc } from "./types";

export interface TagAvailability {
  tagCode: string;
  nombre: string;
  area: string;
  horasCalendario: number;
  horasParada: number;
  disponibilidad: number;
  confiabilidad: number;
  mtbf: number;
  mttr: number;
  paradas: number;
  preventivo: number;
  correctivo: number;
  ultimoEstado: string;
}

export interface AreaAvailability {
  area: string;
  color: string;
  equipos: number;
  disponibilidad: number;
  confiabilidad: number;
  horasParada: number;
  horasCalendario: number;
  objetivo: number;
  gap: number;
}

export interface MonthlyAvailability {
  mes: string;
  mesIdx: number;
  disponibilidad: number;
  horasParada: number;
}

export interface PlantAvailabilityData {
  year: number;
  periodStart: Date;
  periodEnd: Date;
  hasRealData: boolean;
  planta: {
    disponibilidad: number;
    confiabilidad: number;
    mtbf: number;
    mttr: number;
    horasParadaTotal: number;
    horasCalendarioTotal: number;
    equiposTotal: number;
    equiposOperativos: number;
    equiposParados: number;
    equiposEnMantenimiento: number;
    objetivoDisponibilidad: number;
    preventivo: number;
    correctivo: number;
  };
  porArea: AreaAvailability[];
  porEquipo: TagAvailability[];
  mensual: MonthlyAvailability[];
  alertas: { nivel: "red" | "yellow" | "green"; texto: string }[];
}

const AREA_TARGETS: Record<string, number> = {
  Chancado: 92,
  Molienda: 90,
  Flotacion: 88,
  Remolienda: 89,
  Filtrado: 87,
};

const PLANT_TARGET = 90;

const ESTADO_AVAILABILITY: Record<string, number> = {
  operativo: 96,
  limitado: 78,
  parado: 42,
  en_mantenimiento: 65,
  sin_dato: 91,
};

const MONTH_LABELS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

function startOfYear(year: number): Date {
  return new Date(year, 0, 1, 0, 0, 0, 0);
}

function hoursBetween(start: Date, end: Date): number {
  return Math.max(0, (end.getTime() - start.getTime()) / 3600000);
}

function clampPct(n: number): number {
  return Math.max(0, Math.min(100, n));
}

function computeTagMetrics(
  horasCalendario: number,
  horasParada: number,
  paradas: number,
  preventivo: number,
  correctivo: number,
): Pick<TagAvailability, "disponibilidad" | "confiabilidad" | "mtbf" | "mttr" | "paradas" | "preventivo" | "correctivo"> {
  const disponibilidad = clampPct(
    horasCalendario > 0
      ? ((horasCalendario - horasParada) / horasCalendario) * 100
      : 0,
  );
  const failures = Math.max(1, paradas + correctivo);
  const mttr = horasParada / failures;
  const operatingHours = Math.max(0, horasCalendario - horasParada);
  const mtbf = operatingHours / failures;
  const confiabilidad = clampPct(
    mtbf + mttr > 0 ? (mtbf / (mtbf + mttr)) * 100 : disponibilidad,
  );
  return { disponibilidad, confiabilidad, mtbf, mttr, paradas, preventivo, correctivo };
}

async function getEventDowntimeByTag(
  start: Date,
  end: Date,
): Promise<Record<string, { horas: number; count: number }>> {
  const { data, error } = await supabase
    .from("events")
    .select("tag_equipo, total_hh, horas_perdidas, created_at")
    .gte("created_at", start.toISOString())
    .lte("created_at", end.toISOString())
    .not("tag_equipo", "is", null);

  if (error) return {};

  const byTag: Record<string, { horas: number; count: number }> = {};
  (data ?? []).forEach((e) => {
    const tag = String(e.tag_equipo || "").trim();
    if (!tag) return;
    const horasPerdidas = Number(e.horas_perdidas) || 0;
    const totalHh = Number(e.total_hh) || 0;
    const horas = horasPerdidas > 0 ? horasPerdidas : totalHh > 0 ? totalHh : 2;
    if (!byTag[tag]) byTag[tag] = { horas: 0, count: 0 };
    byTag[tag].horas += horas;
    byTag[tag].count += 1;
  });
  return byTag;
}

function aggregateArea(
  tags: TagAvailability[],
): AreaAvailability[] {
  const byArea: Record<string, TagAvailability[]> = {};
  tags.forEach((t) => {
    const area = t.area || "Sin área";
    if (!byArea[area]) byArea[area] = [];
    byArea[area].push(t);
  });

  return Object.entries(byArea)
    .map(([area, areaTags]) => {
      const horasCalendario = areaTags.reduce((s, t) => s + t.horasCalendario, 0);
      const horasParada = areaTags.reduce((s, t) => s + t.horasParada, 0);
      const disponibilidad = clampPct(
        horasCalendario > 0
          ? ((horasCalendario - horasParada) / horasCalendario) * 100
          : 0,
      );
      const avgConfiabilidad =
        areaTags.reduce((s, t) => s + t.confiabilidad, 0) /
        Math.max(1, areaTags.length);
      const objetivo = AREA_TARGETS[area] ?? PLANT_TARGET;
      return {
        area,
        color: TAG_AREA_COLORS[area] ?? "#64748b",
        equipos: areaTags.length,
        disponibilidad,
        confiabilidad: clampPct(avgConfiabilidad),
        horasParada,
        horasCalendario,
        objetivo,
        gap: disponibilidad - objetivo,
      };
    })
    .sort((a, b) => b.disponibilidad - a.disponibilidad);
}

function buildMonthly(
  year: number,
  now: Date,
  logs: FirebaseMaintenanceLogDoc[],
  eventDowntime: Record<string, { horas: number; count: number }>,
  tagCount: number,
): MonthlyAvailability[] {
  const currentMonth = now.getMonth();
  const months: MonthlyAvailability[] = [];

  for (let m = 0; m <= currentMonth; m++) {
    const mStart = new Date(year, m, 1);
    const mEnd =
      m === currentMonth ? now : new Date(year, m + 1, 0, 23, 59, 59, 999);
    const horasCalendario = hoursBetween(mStart, mEnd) * tagCount;

    let horasParada = 0;
    logs.forEach((l) => {
      const f = new Date(String(l.fecha ?? ""));
      if (f >= mStart && f <= mEnd) {
        horasParada += Number(l.paradaEquipoHoras ?? l.parada_equipo_horas) || 0;
      }
    });

    const eventShare =
      Object.values(eventDowntime).reduce((s, v) => s + v.horas, 0) /
      Math.max(1, currentMonth + 1);
    horasParada += eventShare;

    const disponibilidad = clampPct(
      horasCalendario > 0
        ? ((horasCalendario - horasParada) / horasCalendario) * 100
        : PLANT_TARGET,
    );

    months.push({
      mes: MONTH_LABELS[m],
      mesIdx: m,
      disponibilidad,
      horasParada,
    });
  }
  return months;
}

function buildAlertas(
  planta: PlantAvailabilityData["planta"],
  porArea: AreaAvailability[],
  porEquipo: TagAvailability[],
): PlantAvailabilityData["alertas"] {
  const alertas: PlantAvailabilityData["alertas"] = [];

  if (planta.disponibilidad < planta.objetivoDisponibilidad - 2) {
    alertas.push({
      nivel: "red",
      texto: `Disponibilidad de planta ${planta.disponibilidad.toFixed(1)}% — por debajo del objetivo ${planta.objetivoDisponibilidad}%`,
    });
  }

  const areasCriticas = porArea.filter((a) => a.gap < -3);
  areasCriticas.forEach((a) => {
    alertas.push({
      nivel: "yellow",
      texto: `${a.area}: ${a.disponibilidad.toFixed(1)}% (objetivo ${a.objetivo}%, Δ ${a.gap.toFixed(1)}%)`,
    });
  });

  const peores = [...porEquipo]
    .sort((a, b) => a.disponibilidad - b.disponibilidad)
    .slice(0, 3)
    .filter((t) => t.disponibilidad < 85);
  peores.forEach((t) => {
    alertas.push({
      nivel: "yellow",
      texto: `${t.tagCode} (${t.nombre}): disponibilidad ${t.disponibilidad.toFixed(1)}% — ${t.paradas} parada(s) YTD`,
    });
  });

  const ratioCorrectivo =
    planta.preventivo + planta.correctivo > 0
      ? planta.correctivo / (planta.preventivo + planta.correctivo)
      : 0;
  if (ratioCorrectivo > 0.45) {
    alertas.push({
      nivel: "yellow",
      texto: `Alto índice de mantenimiento correctivo (${(ratioCorrectivo * 100).toFixed(0)}%) — reforzar preventivo`,
    });
  }

  if (planta.equiposParados > 0) {
    alertas.push({
      nivel: "red",
      texto: `${planta.equiposParados} equipo(s) en estado parado requieren atención inmediata`,
    });
  }

  if (alertas.length === 0) {
    alertas.push({
      nivel: "green",
      texto: "Planta dentro de parámetros de disponibilidad y confiabilidad YTD",
    });
  }

  return alertas;
}

export async function getPlantAvailabilityData(
  referenceDate = new Date(),
): Promise<PlantAvailabilityData> {
  const year = referenceDate.getFullYear();
  const periodStart = startOfYear(year);
  const periodEnd = referenceDate;
  const horasYtd = hoursBetween(periodStart, periodEnd);

  const [tags, logs, eventDowntime] = await Promise.all([
    getAllEquipmentTags(),
    getMaintenanceLogsByDateRange(periodStart, periodEnd),
    getEventDowntimeByTag(periodStart, periodEnd),
  ]);

  const logsByTag: Record<string, FirebaseMaintenanceLogDoc[]> = {};
  logs.forEach((l) => {
    const code = String(l.tag_code ?? l.TagEquipo ?? "").trim();
    if (!code) return;
    if (!logsByTag[code]) logsByTag[code] = [];
    logsByTag[code].push(l);
  });

  const hasRealData = logs.length > 0 || Object.keys(eventDowntime).length > 0;

  const porEquipo: TagAvailability[] = tags.map((tag) => {
    const tagLogs = logsByTag[tag.tag_code] ?? [];
    const events = eventDowntime[tag.tag_code];

    let horasParada = tagLogs.reduce(
      (s, l) => s + (Number(l.paradaEquipoHoras ?? l.parada_equipo_horas) || 0),
      0,
    );
    horasParada += events?.horas ?? 0;

    let preventivo = 0;
    let correctivo = 0;
    let paradas = events?.count ?? 0;
    let ultimoEstado = "sin_dato";

    tagLogs.forEach((l) => {
      const tipo = String(l.tipoMantenimiento ?? l.tipo_mantenimiento ?? "");
      if (tipo === "preventivo") preventivo++;
      if (tipo === "correctivo") correctivo++;
      if (l.estado_equipo ?? l.estadoEquipo) {
        ultimoEstado = String(l.estado_equipo ?? l.estadoEquipo);
      }
    });
    paradas += tagLogs.filter(
      (l) =>
        Number(l.paradaEquipoHoras ?? l.parada_equipo_horas) > 0 ||
        l.estado_equipo === "parado" ||
        l.estadoEquipo === "parado",
    ).length;

    const horasCalendario = horasYtd;

    if (!hasRealData && horasParada === 0) {
      const baseAvail = ESTADO_AVAILABILITY[ultimoEstado] ?? ESTADO_AVAILABILITY.sin_dato;
      horasParada = horasCalendario * (1 - baseAvail / 100);
    }

    const metrics = computeTagMetrics(
      horasCalendario,
      horasParada,
      paradas,
      preventivo,
      correctivo,
    );

    return {
      tagCode: tag.tag_code,
      nombre: tag.nombre,
      area: tag.area ?? "Sin área",
      horasCalendario,
      horasParada,
      ...metrics,
      preventivo,
      correctivo,
      ultimoEstado,
    };
  });

  const porArea = aggregateArea(porEquipo);

  const horasCalendarioTotal = porEquipo.reduce((s, t) => s + t.horasCalendario, 0);
  const horasParadaTotal = porEquipo.reduce((s, t) => s + t.horasParada, 0);
  const disponibilidadPlanta = clampPct(
    horasCalendarioTotal > 0
      ? ((horasCalendarioTotal - horasParadaTotal) / horasCalendarioTotal) * 100
      : PLANT_TARGET,
  );

  const totalFailures = porEquipo.reduce(
    (s, t) => s + t.paradas + t.correctivo,
    0,
  );
  const mttr = horasParadaTotal / Math.max(1, totalFailures);
  const mtbf =
    Math.max(0, horasCalendarioTotal - horasParadaTotal) /
    Math.max(1, totalFailures);
  const confiabilidadPlanta = clampPct(
    mtbf + mttr > 0 ? (mtbf / (mtbf + mttr)) * 100 : disponibilidadPlanta,
  );

  const equiposOperativos = porEquipo.filter(
    (t) => t.ultimoEstado === "operativo",
  ).length;
  const equiposParados = porEquipo.filter(
    (t) => t.ultimoEstado === "parado",
  ).length;
  const equiposEnMantenimiento = porEquipo.filter(
    (t) => t.ultimoEstado === "en_mantenimiento",
  ).length;

  const preventivo = porEquipo.reduce((s, t) => s + t.preventivo, 0);
  const correctivo = porEquipo.reduce((s, t) => s + t.correctivo, 0);

  const planta = {
    disponibilidad: disponibilidadPlanta,
    confiabilidad: confiabilidadPlanta,
    mtbf,
    mttr,
    horasParadaTotal,
    horasCalendarioTotal,
    equiposTotal: porEquipo.length,
    equiposOperativos,
    equiposParados,
    equiposEnMantenimiento,
    objetivoDisponibilidad: PLANT_TARGET,
    preventivo,
    correctivo,
  };

  const mensual = buildMonthly(
    year,
    periodEnd,
    logs,
    eventDowntime,
    porEquipo.length,
  );

  const alertas = buildAlertas(planta, porArea, porEquipo);

  return {
    year,
    periodStart,
    periodEnd,
    hasRealData,
    planta,
    porArea,
    porEquipo,
    mensual,
    alertas,
  };
}
