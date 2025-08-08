import * as Yup from "yup";
export default function initialValues() {
  return {
    titulo: "",
    comentarios: "",
    id: "",
    visibilidad: "Todos",
    etapa: "Avance Ejecucion",
    porcentajeAvance: "0",
    aprobacion: "",
    pdfFile: "",
    FilenameTitle: "",
    MontoModificado: "",
    NuevaFechaEstimada: null,
    HHModificado: "",
    tipoFile: "",
    //adicional
    fechaPostFormato: "",
    AITidServicios: "",
    AITNombreServicio: "",
    AITEmpresaMinera: "",
    AITAreaServicio: "",
    AITphotoServiceURL: "",
    AITNumero: "",
    AITcompanyName: "",
    emailPerfil: "",
    nombrePerfil: "",
    fotoUsuarioPerfil: "",
    newImages: [""],
    pdfPrincipal: "",
    fotoPrincipal: "",
    createdAt: new Date(),
    likes: [],
    comentariosUsuarios: [],
    idDocFirestoreDB: "",
    imageUrl: "",
    //tareo
    supervisores: "",
    HSE: "",
    liderTecnico: "",
    soldador: "",
    tecnico: "",
    ayudante: "",
    totalHH: 0,
    unicoID: "",
    pushNotification: "",
    proyecto: "",
  };
}

export function validationSchema() {
  return Yup.object({
    titulo: Yup.string().required("Campo obligatorio"),
    comentarios: Yup.string().required("Campo obligatorio"),
    etapa: Yup.string().required("Campo obligatorio"),

    // porcentajeAvance: Yup.string().required("Campo obligatorio"),
    // aprobacion: Yup.string().required("Campo obligatorio"),
    // pdfFile: Yup.string().required("Campo obligatorio"),
    // MontoModificado: Yup.string().required("Campo obligatorio"),
    // NuevaFechaEstimada: Yup.string().required("Campo obligatorio"),
    // HHModificado: Yup.string().required("Campo obligatorio"),
    // visibilidad: Yup.string().required("Campo obligatorio"),
  });
}
