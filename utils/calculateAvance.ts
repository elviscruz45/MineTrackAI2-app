export const parseActivityDate = (fecha: any): Date | null => {
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

  if (typeof fecha === "number") {
    if (fecha > 1000000000000) {
      const parsed = new Date(fecha);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  }

  if (typeof fecha === "string") {
    const str = fecha.trim();
    if (!str) return null;

    const regex =
      /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?\s?(AM|PM)?$/i;
    const match = str.match(regex);
    if (match) {
      let [, day, month, year, hour, minute, second = "0", ampm] = match;
      if (year?.length === 2) year = "20" + year;
      if (ampm) {
        hour = String(
          ampm.toUpperCase() === "PM" && hour !== "12"
            ? Number(hour) + 12
            : hour === "12" && ampm.toUpperCase() === "AM"
            ? 0
            : hour
        );
      }
      const parsed = new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
        Number(second)
      );
      return isNaN(parsed.getTime()) ? null : parsed;
    }

    const parsed = new Date(str);
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

export const getActivityPlannedHours = (activity: any): number => {
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

export const isActivityCompleted = (activity: any): boolean => {
  if (parseActivityDate(activity.RealFechaFin)) return true;

  const avance = String(activity.avance || "").replace("%", "").trim();
  return avance === "100" || parseInt(avance, 10) === 100;
};

export const formatAvancePercent = (
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

export const getTotalPlannedHours = (activities: any[]): number =>
  activities.reduce((acc, activity) => acc + getActivityPlannedHours(activity), 0);

export const getCompletedPlannedHours = (activities: any[]): number =>
  activities.reduce((acc, activity) => {
    if (!isActivityCompleted(activity)) return acc;
    return acc + getActivityPlannedHours(activity);
  }, 0);

export const getPlannedHoursAtTime = (
  activities: any[],
  projectStart: Date,
  hour: number
): number => {
  let horasAcumuladas = 0;

  activities.forEach((activity) => {
    const horas = getActivityPlannedHours(activity);
    if (horas <= 0) return;

    const finPlan = parseActivityDate(activity.FechaFin);
    if (!finPlan) return;

    const horasDesdeInicio =
      (finPlan.getTime() - projectStart.getTime()) / 3600000;

    if (horasDesdeInicio <= hour) {
      horasAcumuladas += horas;
    }
  });

  return horasAcumuladas;
};

export const getRealHoursAtTime = (
  activities: any[],
  projectStart: Date,
  hour: number
): number => {
  let horasAcumuladas = 0;

  activities.forEach((activity) => {
    if (!isActivityCompleted(activity)) return;

    const horas = getActivityPlannedHours(activity);
    if (horas <= 0) return;

    const finReal = parseActivityDate(activity.RealFechaFin);
    if (!finReal) return;

    const horasDesdeInicio =
      (finReal.getTime() - projectStart.getTime()) / 3600000;

    if (horasDesdeInicio <= hour) {
      horasAcumuladas += horas;
    }
  });

  return horasAcumuladas;
};

export const buildGlobalSCurveSeries = (
  activities: any[],
  projectStart: Date,
  hourSteps: number[]
): { planned: number[]; real: number[]; totalHoras: number } => {
  const totalHoras = getTotalPlannedHours(activities);

  if (totalHoras <= 0) {
    return {
      planned: hourSteps.map(() => 0),
      real: hourSteps.map(() => 0),
      totalHoras: 0,
    };
  }

  const planned = hourSteps.map((hour) =>
    formatAvancePercent(
      getPlannedHoursAtTime(activities, projectStart, hour),
      totalHoras
    )
  );

  const real = hourSteps.map((hour) =>
    formatAvancePercent(
      getRealHoursAtTime(activities, projectStart, hour),
      totalHoras
    )
  );

  return { planned, real, totalHoras };
};

const formatAxisDateLabel = (projectStart: Date, hours: number): string => {
  const fecha = new Date(projectStart.getTime() + hours * 3600000);
  return (
    fecha.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    }) +
    "\n" +
    fecha.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  );
};

const getAdaptiveChartSteps = (maxHorasEjeX: number): number => {
  const intervalHours =
    maxHorasEjeX <= 72
      ? 3
      : maxHorasEjeX <= 168
      ? 4
      : maxHorasEjeX <= 336
      ? 6
      : maxHorasEjeX <= 720
      ? 12
      : 24;

  return Math.min(50, Math.max(24, Math.ceil(maxHorasEjeX / intervalHours)));
};

const buildAxisLabels = (
  projectStart: Date,
  axe_x_values: number[]
): string[] =>
  axe_x_values.map((hour) => formatAxisDateLabel(projectStart, hour));

export const buildGlobalSCurveWithProjection = (
  activities: any[],
  projectStart: Date,
  plannedEndHours: number,
  options?: { currentDate?: Date; steps?: number }
) => {
  const now = options?.currentDate || new Date();
  const horasActuales = Math.max(
    0,
    (now.getTime() - projectStart.getTime()) / 3600000
  );
  const totalHoras = getTotalPlannedHours(activities);

  const realAtNow = formatAvancePercent(
    getRealHoursAtTime(activities, projectStart, horasActuales),
    totalHoras
  );

  let horasProyeccionFin = plannedEndHours;

  if (realAtNow > 0 && realAtNow < 100 && horasActuales > 0) {
    const rate = realAtNow / horasActuales;
    horasProyeccionFin = horasActuales + (100 - realAtNow) / rate;
  } else if (realAtNow >= 100) {
    horasProyeccionFin = horasActuales;
  }

  const maxHorasEjeX = Math.max(
    plannedEndHours,
    horasActuales,
    horasProyeccionFin
  );

  const steps = options?.steps ?? getAdaptiveChartSteps(maxHorasEjeX);

  const axe_x_values = Array.from({ length: steps + 1 }, (_, index) =>
    Math.round((maxHorasEjeX * index) / steps)
  );

  const fechasEjeX = buildAxisLabels(projectStart, axe_x_values);

  const { planned: plannedFull } = buildGlobalSCurveSeries(
    activities,
    projectStart,
    axe_x_values
  );

  let bridgeIndex = 0;
  for (let i = 0; i < axe_x_values.length; i++) {
    if (axe_x_values[i] <= horasActuales) {
      bridgeIndex = i;
    }
  }

  const real = axe_x_values.map((hour, i) => {
    if (i > bridgeIndex) return null;
    if (i === bridgeIndex) return realAtNow;
    return formatAvancePercent(
      getRealHoursAtTime(activities, projectStart, hour),
      totalHoras
    );
  });

  const projected = axe_x_values.map((hour, i) => {
    if (realAtNow >= 100) {
      return i >= bridgeIndex ? 100 : null;
    }

    if (realAtNow <= 0 || horasActuales <= 0) {
      return null;
    }

    if (i < bridgeIndex) return null;
    if (i === bridgeIndex) return realAtNow;

    if (hour >= horasProyeccionFin) {
      return 100;
    }

    const progress =
      (hour - horasActuales) / (horasProyeccionFin - horasActuales);

    return Math.min(
      100,
      Math.round(realAtNow + (100 - realAtNow) * Math.max(0, progress))
    );
  });

  const fechaProyeccionFin = new Date(
    projectStart.getTime() + horasProyeccionFin * 3600000
  );

  return {
    planned: plannedFull,
    real,
    projected,
    axe_x_values,
    fechasEjeX,
    horasActuales,
    horasProyeccionFin,
    realAtNow,
    fechaProyeccionFin,
    totalHoras,
  };
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
