import * as Yup from "yup";
function initialValues() {
  return {
    visibilidad: "Todos",
    porcentajeAvance: "",
  };
}

function validationSchema() {
  return Yup.object({
    // titulo: Yup.string().required("Campo obligatorio"),
    // comentarios: Yup.string().required("Campo obligatorio"),
    // etapa: Yup.string().required("Campo obligatorio"),
    // porcentajeAvance: Yup.string().required("Campo obligatorio"),
    // aprobacion: Yup.string().required("Campo obligatorio"),
    // pdfFile: Yup.string().required("Campo obligatorio"),
    // MontoModificado: Yup.string().required("Campo obligatorio"),
    // NuevaFechaEstimada: Yup.string().required("Campo obligatorio"),
    // HHModificado: Yup.string().required("Campo obligatorio"),
    // visibilidad: Yup.string().required("Campo obligatorio"),
  });
}

const EditEventData = {
  initialValues,
  validationSchema,
};

export default EditEventData;
