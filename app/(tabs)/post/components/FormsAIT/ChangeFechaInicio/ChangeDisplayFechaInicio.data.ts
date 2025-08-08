import * as Yup from "yup";

function initialValues() {
  return {
    equipoTrabajo: "",
  };
}

function validationSchema() {
  return Yup.object({
    equipoTrabajo: Yup.string().required("Seleccione al menos uno"),
  });
}

export default {
  initialValues,
  validationSchema,
};
