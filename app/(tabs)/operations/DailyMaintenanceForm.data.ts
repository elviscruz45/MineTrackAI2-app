export default function initialValues() {
  return {
    TagEquipo: "",
    fecha: new Date(),
    descripcion: "",
    personnelType: "planta" as "planta" | "contratista",
    companyName: "",
    supervisorPlanta: "",
    supervisorContratista: "",
    horas: "",
    tipoMantenimiento: "rutinario",
    estadoEquipo: "operativo",
    numeroOT: "",
    paradaEquipoHoras: "",
    materiales: [] as { nombre: string; cantidad: string; unidad: string }[],
    aprobacionRequerida: false,
    aprobadorEmail: "",
    causa: "",
    tipoEventoHSE: "",
    clasificacionHSE: "",
    horasPerdidasHSE: "",
    fotoUri: "",
    pdfUri: "",
  };
}

export const TIPO_MANTENIMIENTO_OPTIONS = [
  "preventivo",
  "correctivo",
  "inspeccion",
  "rutinario",
] as const;

export const ESTADO_EQUIPO_OPTIONS = [
  "operativo",
  "limitado",
  "parado",
  "en_mantenimiento",
] as const;
