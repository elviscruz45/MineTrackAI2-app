const parseActivityDate = (fecha: any): Date | null => {
  if (!fecha) return null;

  if (fecha instanceof Date && !isNaN(fecha.getTime())) {
    return fecha;
  }

  if (typeof fecha.toDate === "function") {
    const parsed = fecha.toDate();
    return parsed instanceof Date && !isNaN(parsed.getTime()) ? parsed : null;
  }

  if (typeof fecha === "object" && fecha.seconds) {
    const parsed = new Date(fecha.seconds * 1000);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  if (typeof fecha === "string" || typeof fecha === "number") {
    const parsed = new Date(fecha);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
};

const toISOFromDisplay = (date: string, time: string): string | null => {
  if (!date || !time) return null;

  const [day, month, year] = date.split("/");
  if (!day || !month || !year) return null;

  const fullYear = year.length === 2 ? `20${year}` : year;
  return `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${time}`;
};

export const getProgrammedHoursFromDateRange = (
  start?: { date?: string; time?: string },
  end?: { date?: string; time?: string }
): number => {
  const startISO = toISOFromDisplay(start?.date || "", start?.time || "");
  const endISO = toISOFromDisplay(end?.date || "", end?.time || "");
  if (!startISO || !endISO) return 0;

  const startDate = new Date(startISO);
  const endDate = new Date(endISO);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 0;

  const hours = (endDate.getTime() - startDate.getTime()) / 3600000;
  return hours > 0 ? hours : 0;
};

const getActivityPlannedHours = (activity: any): number => {
  const horasField = parseFloat(activity.HorasTotales);
  if (!isNaN(horasField) && horasField > 0) return horasField;

  const inicio = parseActivityDate(activity.FechaInicio);
  const fin = parseActivityDate(activity.FechaFin);
  if (inicio && fin) {
    const hours = (fin.getTime() - inicio.getTime()) / 3600000;
    if (hours > 0) return hours;
  }

  return 0;
};

const isActivityCompleted = (activity: any): boolean => {
  if (parseActivityDate(activity.RealFechaFin)) return true;

  const avance = String(activity.avance || "").replace("%", "").trim();
  return avance === "100" || parseInt(avance, 10) === 100;
};

const formatAvancePercent = (
  horasCompletadas: number,
  totalHoras: number
): number => {
  if (totalHoras <= 0) return 0;

  const percent = (horasCompletadas / totalHoras) * 100;
  if (horasCompletadas > 0 && percent > 0 && percent < 1) return 1;

  return Math.min(100, Math.round(percent));
};

export const calculateAvanceFromActivities = (
  activitiesData: any[] | undefined,
  fallbackAvance?: string | number
): number => {
  if (!Array.isArray(activitiesData) || activitiesData.length === 0) {
    return Math.min(100, Math.max(0, parseInt(String(fallbackAvance)) || 0));
  }

  let totalHoras = 0;
  let horasCompletadas = 0;

  activitiesData.forEach((activity) => {
    const horas = getActivityPlannedHours(activity);
    if (horas <= 0) return;

    totalHoras += horas;
    if (isActivityCompleted(activity)) {
      horasCompletadas += horas;
    }
  });

  if (totalHoras === 0) {
    return Math.min(100, Math.max(0, parseInt(String(fallbackAvance)) || 0));
  }

  return formatAvancePercent(horasCompletadas, totalHoras);
};

export const calculateAvanceFromMappedTasks = (tasks: any[]): number => {
  if (!Array.isArray(tasks) || tasks.length === 0) return 0;

  let totalHoras = 0;
  let horasCompletadas = 0;

  tasks.forEach((task) => {
    const horas = getProgrammedHoursFromDateRange(
      task.startDateProg,
      task.endDateProg
    );
    if (horas <= 0) return;

    totalHoras += horas;
    if (task.status === "Completada" || task.avance === "100%") {
      horasCompletadas += horas;
    }
  });

  return formatAvancePercent(horasCompletadas, totalHoras);
};
