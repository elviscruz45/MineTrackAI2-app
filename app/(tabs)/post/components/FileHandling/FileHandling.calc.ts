import * as Yup from "yup";
export default function initialValues() {
  return {
    NombreServicio: "", //ya esta
    NumeroAIT: "", //ya esta
    EmpresaMinera: "Antapaccay",
    AreaServicio: "Parada",
    TipoServicio: "Parada",
    ResponsableEmpresaUsuario: "",
    ResponsableEmpresaUsuario2: "",
    ResponsableEmpresaUsuario3: "",
    ResponsableEmpresaContratista: "",
    ResponsableEmpresaContratista2: "",
    ResponsableEmpresaContratista3: "",
    FechaInicio: null, //ya esta
    FechaFin: null, //ya esta
    NumeroCotizacion: "",
    Moneda: "Soles",
    Monto: "0",
    SupervisorSeguridad: "0",
    Supervisor: "0",
    Tecnicos: "0",
    HorasHombre: "0",
    pdfFile: [],
    //aditional
    fechaPostFormato: "",
    fechaPostISO: "",
    createdAt: new Date(),
    LastEventPosted: new Date(),
    NuevaFechaEstimada: 0,
    fechaFinEjecucion: 0,
    photoServiceURL: "",
    emailPerfil: "", //ya esta
    nombrePerfil: "",
    events: [],
    companyName: "",
    AvanceEjecucion: 1,
    AvanceAdministrativo: 0,
    AvanceAdministrativoTexto: "",
    HHModificado: 0,
    MontoModificado: 0,
    idServiciosAIT: "",
    proyecto: "",
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
