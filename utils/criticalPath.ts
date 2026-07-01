import { getActivityPlannedHours, parseActivityDate } from "@/utils/calculateAvance";
import { isRutaCritica } from "@/utils/isRutaCritica";

const MS_PER_HOUR = 3600000;
const FLOAT_EPSILON = 0.01;

export type CpmTaskStatus = "pendiente" | "progreso" | "completada";

export interface CpmTask {
  id: string;
  codigo: string;
  nombre: string;
  planStart: Date;
  planEnd: Date;
  realStart: Date | null;
  realEnd: Date | null;
  projectedEnd: Date | null;
  plannedDurationHours: number;
  effectiveDurationHours: number;
  es: number;
  ef: number;
  ls: number;
  lf: number;
  float: number;
  isCriticalPlanned: boolean;
  isCriticalDynamic: boolean;
  delayHours: number;
  status: CpmTaskStatus;
  avance: string;
}

export interface CriticalPathResult {
  projectStart: Date;
  plannedEnd: Date;
  projectedEnd: Date;
  extensionHours: number;
  drivingActivity: { codigo: string; nombre: string; delayHours: number } | null;
  plannedCriticalIds: string[];
  dynamicCriticalIds: string[];
  newlyCritical: string[];
  tasks: CpmTask[];
  ganttTasks: CpmTask[];
  useApproximateNetwork: boolean;
}

interface RawActivity {
  act: any;
  sectionCritical: boolean;
  parentCode: string;
}

function getActivityStatus(act: any): CpmTaskStatus {
  if (act.avance === "100%" || act.RealFechaFin) return "completada";
  if (act.RealFechaInicio) return "progreso";
  return "pendiente";
}

function getPlannedDurationHours(act: any): number {
  const inicio = parseActivityDate(act.FechaInicio);
  const fin = parseActivityDate(act.FechaFin);
  if (inicio && fin) {
    const hours = (fin.getTime() - inicio.getTime()) / MS_PER_HOUR;
    if (hours > 0) return hours;
  }
  return getActivityPlannedHours(act);
}

function getEffectiveDurationHours(act: any, now: Date): number {
  const planStart = parseActivityDate(act.FechaInicio);
  const planEnd = parseActivityDate(act.FechaFin);
  const realStart = parseActivityDate(act.RealFechaInicio);
  const realEnd = parseActivityDate(act.RealFechaFin);
  const planned = getPlannedDurationHours(act);

  if (realStart && realEnd) {
    const hours = (realEnd.getTime() - realStart.getTime()) / MS_PER_HOUR;
    return hours > 0 ? hours : planned;
  }

  if (realStart && !realEnd) {
    const elapsed = (now.getTime() - realStart.getTime()) / MS_PER_HOUR;
    const remaining =
      planEnd && planEnd > now
        ? (planEnd.getTime() - now.getTime()) / MS_PER_HOUR
        : 0;
    return Math.max(planned, elapsed + Math.max(0, remaining));
  }

  return planned;
}

function getProjectedEndDate(act: any, planStart: Date, effectiveHours: number): Date {
  const realEnd = parseActivityDate(act.RealFechaFin);
  if (realEnd) return realEnd;

  const realStart = parseActivityDate(act.RealFechaInicio);
  const planEnd = parseActivityDate(act.FechaFin);
  const base = realStart || planStart;

  if (planEnd && planEnd.getTime() > base.getTime()) {
    const planDuration = (planEnd.getTime() - base.getTime()) / MS_PER_HOUR;
    if (effectiveHours > planDuration) {
      return new Date(base.getTime() + effectiveHours * MS_PER_HOUR);
    }
    return planEnd;
  }

  return new Date(base.getTime() + effectiveHours * MS_PER_HOUR);
}

function getDelayHours(act: any, status: CpmTaskStatus, now: Date): number {
  const planEnd = parseActivityDate(act.FechaFin);
  if (!planEnd) return 0;

  if (status === "completada") {
    const realEnd = parseActivityDate(act.RealFechaFin);
    if (!realEnd) return 0;
    return Math.round(((realEnd.getTime() - planEnd.getTime()) / MS_PER_HOUR) * 10) / 10;
  }

  if (now > planEnd) {
    return Math.round(((now.getTime() - planEnd.getTime()) / MS_PER_HOUR) * 10) / 10;
  }

  return 0;
}

function collectRawActivities(data: any[]): RawActivity[] {
  const items: RawActivity[] = [];

  data
    .filter((section) => section.isGlobalProject === true)
    .forEach((section) => {
      const sectionCritical = isRutaCritica(section.esRutaCritica);
      const activities = Array.isArray(section.activitiesData)
        ? section.activitiesData
        : [];

      activities.forEach((act: any) => {
        const taskCritical = sectionCritical || isRutaCritica(act.esRutaCritica);
        if (!taskCritical) return;

        items.push({
          act,
          sectionCritical,
          parentCode: act.parentCode || section.Codigo || "",
        });
      });
    });

  return items;
}

function parsePredecessors(value: unknown): string[] {
  if (!value) return [];
  return String(value)
    .split(/[,;]+/)
    .map((part) => part.trim().split(/\s+/)[0])
    .filter(Boolean);
}

function buildPredecessorMap(rawItems: RawActivity[]): {
  predecessors: Map<string, string[]>;
  useApproximateNetwork: boolean;
} {
  const byCode = new Map<string, RawActivity>();
  rawItems.forEach((item) => {
    const code = String(item.act.Codigo || "").trim();
    if (code) byCode.set(code, item);
  });

  const predecessors = new Map<string, string[]>();
  let hasExplicit = false;

  rawItems.forEach((item) => {
    const code = String(item.act.Codigo || "").trim();
    if (!code) return;

    const explicit = parsePredecessors(
      item.act.Predecesor ?? item.act.predecesor ?? item.act.Predecessor
    ).filter((pred) => byCode.has(pred));

    if (explicit.length > 0) {
      hasExplicit = true;
      predecessors.set(code, explicit);
    }
  });

  if (!hasExplicit) {
    const groups = new Map<string, RawActivity[]>();
    rawItems.forEach((item) => {
      const key = item.parentCode || "root";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(item);
    });

    groups.forEach((group) => {
      const sorted = [...group].sort((a, b) =>
        String(a.act.Codigo || "").localeCompare(String(b.act.Codigo || ""), undefined, {
          numeric: true,
        })
      );

      sorted.forEach((item, index) => {
        const code = String(item.act.Codigo || "").trim();
        if (!code || index === 0) {
          predecessors.set(code, []);
          return;
        }
        const prevCode = String(sorted[index - 1].act.Codigo || "").trim();
        predecessors.set(code, prevCode ? [prevCode] : []);
      });
    });
  }

  return { predecessors, useApproximateNetwork: !hasExplicit };
}

interface CpmNode {
  id: string;
  duration: number;
  predecessors: string[];
}

function runCpm(nodes: CpmNode[]): Map<string, { es: number; ef: number; ls: number; lf: number; float: number }> {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const result = new Map<string, { es: number; ef: number; ls: number; lf: number; float: number }>();

  if (nodes.length === 0) return result;

  const esMap = new Map<string, number>();
  const efMap = new Map<string, number>();

  const visitForward = (id: string, stack: Set<string>) => {
    if (esMap.has(id)) return;
    if (stack.has(id)) return;
    stack.add(id);

    const node = byId.get(id);
    if (!node) return;

    let es = 0;
    node.predecessors.forEach((predId) => {
      if (!byId.has(predId)) return;
      visitForward(predId, stack);
      es = Math.max(es, efMap.get(predId) ?? 0);
    });

    const ef = es + node.duration;
    esMap.set(id, es);
    efMap.set(id, ef);
    stack.delete(id);
  };

  nodes.forEach((node) => visitForward(node.id, new Set()));

  const projectDuration = Math.max(...nodes.map((node) => efMap.get(node.id) ?? 0), 0);

  const lsMap = new Map<string, number>();
  const lfMap = new Map<string, number>();

  const successors = new Map<string, string[]>();
  nodes.forEach((node) => {
    node.predecessors.forEach((predId) => {
      if (!successors.has(predId)) successors.set(predId, []);
      successors.get(predId)!.push(node.id);
    });
  });

  const visitBackward = (id: string, stack: Set<string>) => {
    if (lsMap.has(id)) return;
    if (stack.has(id)) return;
    stack.add(id);

    const node = byId.get(id);
    if (!node) return;

    const succs = successors.get(id) || [];
    let lf = projectDuration;
    if (succs.length > 0) {
      lf = Math.min(
        ...succs.map((succId) => {
          visitBackward(succId, stack);
          return lsMap.get(succId) ?? projectDuration;
        })
      );
    }

    const ls = lf - node.duration;
    lsMap.set(id, ls);
    lfMap.set(id, lf);
    stack.delete(id);
  };

  nodes.forEach((node) => visitBackward(node.id, new Set()));

  nodes.forEach((node) => {
    const es = esMap.get(node.id) ?? 0;
    const ef = efMap.get(node.id) ?? es + node.duration;
    const ls = lsMap.get(node.id) ?? es;
    const lf = lfMap.get(node.id) ?? ef;
    result.set(node.id, {
      es,
      ef,
      ls,
      lf,
      float: Math.round((ls - es) * 10) / 10,
    });
  });

  return result;
}

function buildTaskList(
  rawItems: RawActivity[],
  durationMode: "planned" | "effective",
  now: Date
): { tasks: CpmTask[]; projectStart: Date; projectEnd: Date } {
  const dated = rawItems
    .map((item) => {
      const planStart = parseActivityDate(item.act.FechaInicio);
      return { item, planStart };
    })
    .filter((entry) => entry.planStart);

  if (dated.length === 0) {
    const fallback = new Date();
    return { tasks: [], projectStart: fallback, projectEnd: fallback };
  }

  const projectStart = dated.reduce(
    (min, entry) => (entry.planStart! < min ? entry.planStart! : min),
    dated[0].planStart!
  );

  const tasks: CpmTask[] = dated.map(({ item }) => {
    const act = item.act;
    const planStart = parseActivityDate(act.FechaInicio)!;
    const planEnd = parseActivityDate(act.FechaFin) || planStart;
    const status = getActivityStatus(act);
    const plannedDurationHours = getPlannedDurationHours(act);
    const effectiveDurationHours = getEffectiveDurationHours(act, now);
    const duration =
      durationMode === "planned" ? plannedDurationHours : effectiveDurationHours;
    const projectedEnd = getProjectedEndDate(act, planStart, effectiveDurationHours);

    return {
      id: String(act.Codigo || act.id || ""),
      codigo: String(act.Codigo || ""),
      nombre: String(act.NombreServicio || ""),
      planStart,
      planEnd,
      realStart: parseActivityDate(act.RealFechaInicio),
      realEnd: parseActivityDate(act.RealFechaFin),
      projectedEnd,
      plannedDurationHours,
      effectiveDurationHours,
      es: 0,
      ef: duration,
      ls: 0,
      lf: duration,
      float: 0,
      isCriticalPlanned: isRutaCritica(act.esRutaCritica) || item.sectionCritical,
      isCriticalDynamic: false,
      delayHours: getDelayHours(act, status, now),
      status,
      avance:
        act.avance ||
        (act.RealFechaFin ? "100%" : act.RealFechaInicio ? "50%" : "0%"),
    };
  });

  const { predecessors } = buildPredecessorMap(rawItems);
  const nodes: CpmNode[] = tasks
    .filter((task) => task.id)
    .map((task) => ({
      id: task.id,
      duration:
        durationMode === "planned"
          ? task.plannedDurationHours
          : task.effectiveDurationHours,
      predecessors: predecessors.get(task.id) || [],
    }));

  const cpm = runCpm(nodes);

  tasks.forEach((task) => {
    const metrics = cpm.get(task.id);
    if (!metrics) return;
    task.es = metrics.es;
    task.ef = metrics.ef;
    task.ls = metrics.ls;
    task.lf = metrics.lf;
    task.float = metrics.float;
    task.isCriticalDynamic = metrics.float <= FLOAT_EPSILON;
  });

  const projectEndMs = Math.max(
    ...tasks.map((task) => {
      const end =
        durationMode === "planned"
          ? task.planEnd.getTime()
          : (task.projectedEnd || task.planEnd).getTime();
      return projectStart.getTime() + task.ef * MS_PER_HOUR;
    }),
    projectStart.getTime()
  );

  return { tasks, projectStart, projectEnd: new Date(projectEndMs) };
}

export function calculateCriticalPath(data: any[]): CriticalPathResult | null {
  const rawItems = collectRawActivities(data);
  if (rawItems.length === 0) return null;

  const now = new Date();
  const { useApproximateNetwork } = buildPredecessorMap(rawItems);
  const planned = buildTaskList(rawItems, "planned", now);
  const effective = buildTaskList(rawItems, "effective", now);

  if (planned.tasks.length === 0) return null;

  const plannedCriticalIds = planned.tasks
    .filter((task) => task.isCriticalPlanned)
    .map((task) => task.id);
  const dynamicCriticalIds = effective.tasks
    .filter((task) => task.isCriticalDynamic)
    .map((task) => task.id);
  const newlyCritical = effective.tasks
    .filter((task) => task.isCriticalDynamic && !task.isCriticalPlanned)
    .map((task) => task.id);

  const extensionHours = Math.max(
    0,
    Math.round(
      ((effective.projectEnd.getTime() - planned.projectEnd.getTime()) / MS_PER_HOUR) * 10
    ) / 10
  );

  const drivingCandidates = [...effective.tasks]
    .filter((task) => task.isCriticalDynamic)
    .sort((a, b) => b.ef - a.ef || b.delayHours - a.delayHours);

  const drivingActivity = drivingCandidates[0]
    ? {
        codigo: drivingCandidates[0].codigo,
        nombre: drivingCandidates[0].nombre,
        delayHours: drivingCandidates[0].delayHours,
      }
    : null;

  const effectiveById = new Map(effective.tasks.map((task) => [task.id, task]));

  const ganttTasks = planned.tasks
    .map((task) => {
      const live = effectiveById.get(task.id);
      if (!live) return task;
      return {
        ...task,
        effectiveDurationHours: live.effectiveDurationHours,
        projectedEnd: live.projectedEnd,
        es: live.es,
        ef: live.ef,
        ls: live.ls,
        lf: live.lf,
        float: live.float,
        isCriticalDynamic: live.isCriticalDynamic,
        delayHours: live.delayHours,
        status: live.status,
        realStart: live.realStart,
        realEnd: live.realEnd,
      };
    })
    .sort((a, b) => a.es - b.es || a.planStart.getTime() - b.planStart.getTime());

  return {
    projectStart: planned.projectStart,
    plannedEnd: planned.projectEnd,
    projectedEnd: effective.projectEnd,
    extensionHours,
    drivingActivity,
    plannedCriticalIds,
    dynamicCriticalIds,
    newlyCritical,
    tasks: effective.tasks,
    ganttTasks,
    useApproximateNetwork,
  };
}
