import * as Yup from "yup";
function initialValues() {
  return {
    pdfFile: "",
    FilenameTitle: "",
    tipoFile: "",
    size: 0,
    fechaPostFormato: "",
    fecha: new Date(),
    email: "",
    pdfPrincipal: "",
  };
}

function validationSchema() {
  return Yup.object({
    pdfFile: Yup.string().required("Campo obligatorio"),
    tipoFile: Yup.string().required("Campo obligatorio"),
    // etapa: Yup.string().required("Campo obligatorio"),
    // porcentajeAvance: Yup.string().required("Campo obligatorio"),
    // aprobacion: Yup.string().required("Campo obligatorio"),
    // pdfFile: Yup.string().required("Campo obligatorio"),
    // MontoModificado: Yup.string().required("Campo obligatorio"),
    // NuevaFechaEstimada: Yup.string().required("Campo obligatorio"),
    // HHModificado: Yup.string().required("Campo obligatorio"),
  });
}

const AddFormsData = {
  initialValues,
  validationSchema,
};

export default AddFormsData;
