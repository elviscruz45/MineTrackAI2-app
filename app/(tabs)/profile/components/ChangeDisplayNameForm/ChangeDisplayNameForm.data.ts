import * as Yup from "yup";

function initialValues() {
  return {
    displayNameform: "",
    cargo: "",
    descripcion: "",
    photoURL: "",
    email: "",
    companyName: "",
    userType: "",
    uid: "",
    EquipmentFavorities: [],
    ExpoPushNotificationToken: "",
    proyecto: "todos",
  };
}

function validationSchema() {
  return Yup.object({
    displayNameform: Yup.string().required(
      "El nombre y apellidos son requeridos"
    ),
    cargo: Yup.string().required("el cargo es requerido"),
    // descripcion: Yup.string().required("la descripcion es requerida"),
  });
}

// export default { initialValues, validationSchema };

const ChangeDisplayRulers = {
  initialValues,
  validationSchema,
};

export default ChangeDisplayRulers;
