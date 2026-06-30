// Lista maestra de tags de equipos (fallback local + helpers de UI).
// loadTagEquipoList() intenta cargar desde Supabase; si falla usa tagEquipoListFallback.

export type TagEquipoItem = {
  key: string;
  nombre: string;
  value: string;
  area: string;
  image?: number;
};

export const TAG_AREAS = [
  { name: "Chancado", color: "#1565c0" },
  { name: "Molienda", color: "#2e7d32" },
  { name: "Flotacion", color: "#7b1fa2" },
  { name: "Remolienda", color: "#ef6c00" },
  { name: "Filtrado", color: "#455a64" },
] as const;

export const TAG_AREA_ORDER = TAG_AREAS.map((a) => a.name);

export type TagEquipoArea = (typeof TAG_AREAS)[number]["name"] | string;

export const TAG_AREA_COLORS: Record<string, string> = Object.fromEntries(
  TAG_AREAS.map((a) => [a.name, a.color]),
);

const DEFAULT_TAG_IMAGE = require("../assets/equipmentplant/ImageIcons/poderosa.png");

const IMG = {
  reu: require("../assets/equipmentplant/ImageIcons/reu.jpeg"),
  cr001: require("../assets/equipmentplant/ImageIcons/c2cr001.jpeg"),
  cr021: require("../assets/equipmentplant/ImageIcons/c2cr021.jpeg"),
  cr3: require("../assets/equipmentplant/ImageIcons/c2cr3.jpeg"),
  ml: require("../assets/equipmentplant/ImageIcons/c2ml001.jpeg"),
  cv: require("../assets/equipmentplant/ImageIcons/c2cv001.jpeg"),
  sc: require("../assets/equipmentplant/ImageIcons/c2sc001.jpeg"),
  seguridad: require("../assets/equipmentplant/ImageIcons/seguridad.jpeg"),
  medioambiente: require("../assets/equipmentplant/ImageIcons/medioambiente.png"),
  remol: require("../assets/equipmentplant/ImageIcons/Remol.jpeg"),
  filter: require("../assets/equipmentplant/ImageIcons/filter.jpeg"),
  hidro: require("../assets/equipmentplant/ImageIcons/Hidro.jpeg"),
};

const tag = (
  key: string,
  nombre: string,
  area: string,
  image?: number,
): TagEquipoItem => ({
  key,
  nombre,
  area,
  image,
  value: `${nombre} — ${key}`,
});

export const tagEquipoListFallback: TagEquipoItem[] = [
  tag("C2-REU", "Reuniones", "Chancado", IMG.reu),

  tag("001-CH2", "Dump Pocket / Chancadora Primaria", "Chancado"),
  tag("001-CN002", "Cinta Transportadora N°002", "Chancado"),
  tag("001-RB002", "Rompedor de Bloques N°002", "Chancado"),
  tag("001-CR002", "Chancadora N°002", "Chancado"),

  tag("C2-CR001", "Chancadora Primaria (C2)", "Chancado", IMG.cr001),
  tag("C2-CR021", "Chancadora Secundaria (C2)", "Chancado", IMG.cr021),
  tag("C2-CR031", "Chancadora Terciaria (C2)", "Chancado", IMG.cr3),
  tag("C2-CV001", "Faja Transportadora (C2)", "Chancado", IMG.cv),
  tag("C2-CV002", "Faja Transportadora 2 (C2)", "Chancado", IMG.cv),
  tag("C2-CV003", "Faja Transportadora 3 (C2)", "Chancado", IMG.cv),
  tag("C2-SC001", "Zaranda Vibratoria (C2)", "Chancado", IMG.sc),
  tag("C2-SC002", "Zaranda Vibratoria Secundaria (C2)", "Chancado", IMG.sc),
  tag("C2-BN001", "Tolva de Gruesos (C2)", "Chancado"),
  tag("C2-BN002", "Tolva de Finos (C2)", "Chancado"),
  tag("C2-AP001", "Alimentador de Placas (C2)", "Chancado"),
  tag("C2-AV001", "Alimentador Vibratorio (C2)", "Chancado"),
  tag("C2-MA001", "Detector de Metales (C2)", "Chancado"),
  tag("C2-IM001", "Separador Magnético (C2)", "Chancado"),

  tag("C1-CR001", "Chancadora Primaria (C1)", "Chancado", IMG.cr001),
  tag("C1-CR021", "Chancadora Secundaria (C1)", "Chancado", IMG.cr021),
  tag("C1-CR031", "Chancadora Terciaria (C1)", "Chancado", IMG.cr3),
  tag("C1-CV001", "Faja Transportadora (C1)", "Chancado", IMG.cv),
  tag("C1-CV002", "Faja Transportadora 2 (C1)", "Chancado", IMG.cv),
  tag("C1-CV003", "Faja Transportadora 3 (C1)", "Chancado", IMG.cv),
  tag("C1-SC001", "Zaranda Vibratoria (C1)", "Chancado", IMG.sc),
  tag("C1-SC002", "Zaranda Vibratoria Secundaria (C1)", "Chancado", IMG.sc),
  tag("C1-BN001", "Tolva de Gruesos (C1)", "Chancado"),
  tag("C1-BN002", "Tolva de Finos (C1)", "Chancado"),
  tag("C1-AP001", "Alimentador de Placas (C1)", "Chancado"),
  tag("C1-AV001", "Alimentador Vibratorio (C1)", "Chancado"),

  tag("C2-ML001", "Molino de Bolas (C2)", "Molienda", IMG.ml),
  tag("C2-ML002", "Molino de Bolas N°2 (C2)", "Molienda", IMG.ml),
  tag("C2-SAG001", "Molino SAG (C2)", "Molienda"),
  tag("C2-HPGR001", "HPGR (C2)", "Molienda"),
  tag("C2-CY001", "Hidrociclones (C2)", "Molienda"),
  tag("C2-SP001", "Bomba de Pulpa N°1 (C2)", "Molienda"),
  tag("C2-SP002", "Bomba de Pulpa N°2 (C2)", "Molienda"),
  tag("C2-LB001", "Lubricación Molino (C2)", "Molienda"),

  tag("C1-ML001", "Molino de Bolas (C1)", "Molienda", IMG.ml),
  tag("C1-ML002", "Molino de Bolas N°2 (C1)", "Molienda", IMG.ml),
  tag("C1-SAG001", "Molino SAG (C1)", "Molienda"),
  tag("C1-HPGR001", "HPGR (C1)", "Molienda"),
  tag("C1-CY001", "Hidrociclones (C1)", "Molienda"),
  tag("C1-SP001", "Bomba de Pulpa N°1 (C1)", "Molienda"),
  tag("C1-SP002", "Bomba de Pulpa N°2 (C1)", "Molienda"),
  tag("C1-LB001", "Lubricación Molino (C1)", "Molienda"),

  tag("C1-FC001", "Celda de Flotación Rougher N°1 (C1)", "Flotacion"),
  tag("C1-FC002", "Celda de Flotación Rougher N°2 (C1)", "Flotacion"),
  tag("C1-FC101", "Celda de Flotación Cleaner N°1 (C1)", "Flotacion"),
  tag("C1-FC201", "Celda de Flotación Scavenger N°1 (C1)", "Flotacion"),
  tag("C1-SP101", "Bomba de Pulpa Flotación (C1)", "Flotacion"),
  tag("C1-TK001", "Tanque Acondicionador (C1)", "Flotacion"),
  tag("C1-BL001", "Soplador de Aire (C1)", "Flotacion"),

  tag("C2-FC001", "Celda de Flotación Rougher N°1 (C2)", "Flotacion"),
  tag("C2-FC002", "Celda de Flotación Rougher N°2 (C2)", "Flotacion"),
  tag("C2-FC101", "Celda de Flotación Cleaner N°1 (C2)", "Flotacion"),
  tag("C2-FC201", "Celda de Flotación Scavenger N°1 (C2)", "Flotacion"),
  tag("C2-SP101", "Bomba de Pulpa Flotación (C2)", "Flotacion"),
  tag("C2-TK001", "Tanque Acondicionador (C2)", "Flotacion"),
  tag("C2-BL001", "Soplador de Aire (C2)", "Flotacion"),

  tag("C1-RM001", "Molino de Remolienda (C1)", "Remolienda", IMG.remol),
  tag("C1-CY101", "Hidrociclones Remolienda (C1)", "Remolienda"),
  tag("C1-SP201", "Bomba de Pulpa Remolienda (C1)", "Remolienda"),
  tag("C1-LB101", "Lubricación Molino Remolienda (C1)", "Remolienda"),

  tag("C2-RM001", "Molino de Remolienda (C2)", "Remolienda", IMG.remol),
  tag("C2-CY101", "Hidrociclones Remolienda (C2)", "Remolienda"),
  tag("C2-SP201", "Bomba de Pulpa Remolienda (C2)", "Remolienda"),
  tag("C2-LB101", "Lubricación Molino Remolienda (C2)", "Remolienda"),

  tag("C1-FP001", "Filtro Prensa N°1 (C1)", "Filtrado", IMG.filter),
  tag("C1-FD001", "Filtro de Disco (C1)", "Filtrado", IMG.filter),
  tag("C1-VP001", "Bomba de Vacío (C1)", "Filtrado"),
  tag("C1-SP301", "Bomba de Alimentación Filtro (C1)", "Filtrado"),
  tag("C1-TK301", "Tanque de Filtrado (C1)", "Filtrado"),

  tag("C2-FP001", "Filtro Prensa N°1 (C2)", "Filtrado", IMG.filter),
  tag("C2-FD001", "Filtro de Disco (C2)", "Filtrado", IMG.filter),
  tag("C2-VP001", "Bomba de Vacío (C2)", "Filtrado"),
  tag("C2-SP301", "Bomba de Alimentación Filtro (C2)", "Filtrado"),
  tag("C2-TK301", "Tanque de Filtrado (C2)", "Filtrado"),

  tag("SEG-C2", "Seguridad (C2)", "Chancado", IMG.seguridad),
  tag("MA-C2", "Medio Ambiente (C2)", "Chancado", IMG.medioambiente),
  tag("SEG-C1", "Seguridad (C1)", "Chancado", IMG.seguridad),
  tag("MA-C1", "Medio Ambiente (C1)", "Chancado", IMG.medioambiente),
];

function inferTagImage(key: string): number {
  const normalized = String(key || "").trim().toUpperCase();
  if (normalized.includes("SEG")) return IMG.seguridad;
  if (normalized.startsWith("MA-")) return IMG.medioambiente;
  if (normalized.includes("-ML") || normalized.includes("SAG") || normalized.includes("HPGR")) {
    return IMG.ml;
  }
  if (normalized.includes("-RM") || normalized.includes("REMOL")) return IMG.remol;
  if (normalized.includes("-CV") || normalized.includes("CN00")) return IMG.cv;
  if (normalized.includes("-SC")) return IMG.sc;
  if (normalized.includes("-FP") || normalized.includes("-FD") || normalized.includes("-VP")) {
    return IMG.filter;
  }
  if (normalized.includes("-FC") || normalized.includes("-TK") || normalized.includes("-BL")) {
    return IMG.hidro;
  }
  if (normalized.includes("-CR031") || normalized.includes("-CR3")) return IMG.cr3;
  if (normalized.includes("-CR021") || normalized.includes("-CR02")) return IMG.cr021;
  if (normalized.includes("-CR") || normalized.includes("CH2") || normalized.includes("CR002")) {
    return IMG.cr001;
  }
  return DEFAULT_TAG_IMAGE;
}

export function getTagEquipoImage(key: string) {
  const item = findTagEquipoByKey(key);
  return item?.image ?? inferTagImage(key);
}

export function getTagEquipoNombre(item: TagEquipoItem): string {
  return item.nombre || item.key;
}

/** Contexto mínimo para registrar un evento suelto ligado solo al TagEquipo (sin servicio/proyecto). */
export function buildStandaloneEquipmentContext(item: TagEquipoItem) {
  const nombre = getTagEquipoNombre(item);
  return {
    isStandaloneEquipmentEvent: true,
    idServiciosAIT: null,
    TagEquipo: item.key,
    NombreServicio: nombre,
    AreaServicio: item.area,
    projectId: null,
    EmpresaMinera: "",
    NumeroAIT: "",
    companyName: "",
    TipoServicio: "",
    photoServiceURL: null,
  };
}

export function getTagAreaColor(area: string): string {
  return TAG_AREA_COLORS[area] ?? "#64748b";
}

export function findTagEquipoByKey(key: string): TagEquipoItem | undefined {
  const normalized = String(key || "").trim();
  return tagEquipoListFallback.find((item) => item.key === normalized);
}

export function getTagEquipoAreaSections(
  items: TagEquipoItem[] = tagEquipoListFallback,
): { area: string; items: TagEquipoItem[] }[] {
  const presentAreas = new Set(items.map((item) => item.area));
  const ordered = TAG_AREA_ORDER.filter((area) => presentAreas.has(area));
  const extras = [...presentAreas].filter(
    (area) => !(TAG_AREA_ORDER as readonly string[]).includes(area),
  );

  return [...ordered, ...extras]
    .map((area) => ({
      area,
      items: items.filter((item) => item.area === area),
    }))
    .filter((section) => section.items.length > 0);
}

/** @deprecated Use loadTagEquipoList() for DB-backed list */
export const tagEquipoList = tagEquipoListFallback;

let cachedList: { key: string; value: string }[] | null = null;

export async function loadTagEquipoList(): Promise<
  { key: string; value: string }[]
> {
  if (cachedList) return cachedList;
  try {
    const { getAllEquipmentTags } = await import("@/lib/db/equipmentTags");
    const rows = await getAllEquipmentTags();
    if (rows.length > 0) {
      cachedList = rows.map((r) => ({
        key: r.tag_code,
        value: `${r.nombre}  —  ${r.tag_code}`,
      }));
      return cachedList;
    }
  } catch {
    // fallback
  }
  cachedList = tagEquipoListFallback;
  return cachedList;
}

export const getTagEquipoLabel = (tag?: string): string => {
  const key = String(tag || "").trim();
  if (!key) return "";
  return findTagEquipoByKey(key)?.key || key;
};

export const isValidTagEquipo = (
  tagCode: string,
  list = tagEquipoListFallback,
): boolean => {
  const key = String(tagCode || "").trim();
  if (!key) return false;
  return list.some((item) => item.key === key);
};
