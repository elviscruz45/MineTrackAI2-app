import * as Yup from "yup";

function getFormattedDate() {
  const date = new Date();
  const monthNames = [
    "ene.",
    "feb.",
    "mar.",
    "abr.",
    "may.",
    "jun.",
    "jul.",
    "ago.",
    "sep.",
    "oct.",
    "nov.",
    "dic.",
  ];
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const formattedDate = `${day} ${month} ${year}  ${hour}:${minute} Hrs`;
  return formattedDate;
}

export function initialValues() {
  return {
    //id firebase
    idServiciosAIT: "",
    //data
    NombreServicio: "", //ya esta
    NumeroAIT: "", //ya esta
    EmpresaMinera: "Antapaccay",
    AreaServicio: "",
    TipoServicio: "Parada de Planta",
    ResponsableEmpresaUsuario: "",
    ResponsableEmpresaUsuario2: "",
    ResponsableEmpresaUsuario3: "",
    ResponsableEmpresaContratista: "",
    ResponsableEmpresaContratista2: "",
    ResponsableEmpresaContratista3: "",
    FechaInicio: new Date(), //ya esta
    FechaFin: new Date(), //ya esta
    NumeroCotizacion: "",
    Moneda: "Soles",
    Monto: "0",
    SupervisorSeguridad: "0",
    Supervisor: "0",
    Tecnicos: "0",
    Lider: "0",
    Soldador: "0",
    HorasHombre: "0",
    pdfFile: [],
    //aditional
    fechaPostFormato: getFormattedDate(),
    fechaPostISO: new Date().toISOString(),
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
    proyecto: "",
    activities: [],
    activitiesData: [],
  };
}

export function validationSchema() {
  return Yup.object({
    // EmpresaMinera: Yup.string().required("Campo obligatorio"),
    NombreServicio: Yup.string().required("Campo obligatorio"),

    // NumeroAIT: Yup.string().required("Campo obligatorio"),
    // AreaServicio: Yup.string().required("Campo obligatorio"),
    // TipoServicio: Yup.string().required("Campo obligatorio"),
    // ResponsableEmpresaUsuario: Yup.string().required("Campo obligatorio"),
    // ResponsableEmpresaContratista: Yup.string().required("Campo obligatorio"),
    // FechaInicio: Yup.date().required("Campo obligatorio"),
    // FechaFin: Yup.date().required("Campo obligatorio"),
    // NumeroCotizacion: Yup.string().required("Campo obligatorio"),
    // Moneda: Yup.string().required("Campo obligatorio"),
    // Monto: Yup.string().required("Campo obligatorio"),
    // HorasHombre: Yup.string().required("Campo obligatorio"),
  });
}
