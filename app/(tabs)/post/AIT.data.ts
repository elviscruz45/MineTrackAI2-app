import * as Yup from "yup";
import { tagEquipoList } from "@/utils/tagEquipoList";

const validTagKeys = tagEquipoList.map((t) => t.key);

export const isLevel4Codigo = (codigo: string): boolean =>
  String(codigo || "")
    .trim()
    .split(".")
    .filter(Boolean).length === 4;

/** Campos mínimos para reportes (Curva S, ruta crítica, dashboard, publicar eventos) */
export const AIT_REQUIRED_FIELDS = [
  "Codigo",
  "NombreServicio",
  "AreaServicio",
  "TagEquipo",
  "FechaInicio",
  "FechaFin",
  "esRutaCritica",
] as const;

export const AIT_FIELD_LABELS: Record<string, string> = {
  Codigo: "Código WBS",
  NombreServicio: "Nombre actividad",
  AreaServicio: "Área",
  TagEquipo: "Tag equipo",
  FechaInicio: "Fecha inicio",
  FechaFin: "Fecha fin",
  esRutaCritica: "Ruta crítica",
};

export default function initialValues() {
  return {
    Codigo: "",
    NombreServicio: "",
    NumeroAIT: "",
    EmpresaMinera: "Antapaccay",
    AreaServicio: "",
    TagEquipo: "",
    TipoServicio: "Parada de Planta",
    esRutaCritica: "No",
    ResponsableEmpresaUsuario: "",
    ResponsableEmpresaUsuario2: "",
    ResponsableEmpresaUsuario3: "",
    ResponsableEmpresaContratista: "",
    ResponsableEmpresaContratista2: "",
    ResponsableEmpresaContratista3: "",
    FechaInicio: null as Date | null,
    FechaFin: null as Date | null,
    NumeroCotizacion: "",
    Moneda: "Soles",
    Monto: "",
    SupervisorSeguridad: "0",
    Supervisor: "0",
    Tecnicos: "0",
    Lider: "0",
    Soldador: "0",
    HorasTotales: "",
    HorasHombre: "",
    pdfFile: [],
    fechaPostFormato: "",
    fechaPostISO: "",
    createdAt: new Date(),
    LastEventPosted: new Date(),
    NuevaFechaEstimada: 0,
    fechaFinEjecucion: 0,
    photoServiceURL: "",
    emailPerfil: "",
    nombrePerfil: "",
    events: [],
    companyName: "",
    AvanceEjecucion: 0,
    AvanceAdministrativo: 0,
    AvanceAdministrativoTexto: "",
    HHModificado: 0,
    MontoModificado: 0,
    idServiciosAIT: "",
    proyecto: "",
    activities: [],
    activitiesData: [],
    projectId: "",
    isGlobalProject: false,
  };
}

export function validationSchema() {
  const req = (label: string) =>
    Yup.string().trim().required(`${label} es obligatorio`);

  return Yup.object({
    Codigo: req("Código WBS").test(
      "level4",
      "El código debe ser nivel 4 (ej. 1.1.1.1 o 2.1.1.1)",
      (v) => isLevel4Codigo(v || "")
    ),
    NombreServicio: req("Nombre de la actividad"),
    AreaServicio: req("Área de servicio"),
    TagEquipo: req("Tag del equipo").test(
      "valid-tag",
      "Tag no está en la lista permitida",
      (v) => validTagKeys.includes(String(v || "").trim())
    ),
    esRutaCritica: Yup.string()
      .oneOf(["Si", "No", "si", "no"], "Seleccione Si o No")
      .required("Ruta crítica es obligatorio"),
    FechaInicio: Yup.date()
      .nullable()
      .required("Fecha de inicio es obligatoria")
      .typeError("Fecha de inicio inválida"),
    FechaFin: Yup.date()
      .nullable()
      .required("Fecha de fin es obligatoria")
      .typeError("Fecha de fin inválida")
      .min(Yup.ref("FechaInicio"), "La fecha fin debe ser posterior al inicio"),
    // Opcionales — se completan con defaults al guardar
    NumeroAIT: Yup.string(),
    EmpresaMinera: Yup.string(),
    TipoServicio: Yup.string(),
    ResponsableEmpresaUsuario3: Yup.string(),
    ResponsableEmpresaContratista3: Yup.string(),
    NumeroCotizacion: Yup.string(),
    Moneda: Yup.string(),
    Monto: Yup.string(),
    SupervisorSeguridad: Yup.string(),
    Supervisor: Yup.string(),
    Tecnicos: Yup.string(),
    Lider: Yup.string(),
    Soldador: Yup.string(),
    HorasTotales: Yup.string(),
  });
}
