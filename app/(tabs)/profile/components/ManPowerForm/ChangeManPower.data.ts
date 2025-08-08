import * as Yup from "yup";
import { Alert } from "react-native";

function initialValues() {
  return {
    TotalServicios: "",
    Servicios: "",
    TotalIngenieria: "",
    Ingenieria: "",
    photoURL: "",
    email: "",
    companyName: "",
    fechaPostFormato: "",
    createdAt: new Date(),
    uid: "",
  };
}

// export function validationSchema() {
//   return Yup.object({
//     TotalReparacion: Yup.string().required("Dato requerido"),
//     Reparacion: Yup.string().required("Dato requerido"),
//     TotalFabricacion: Yup.string().required("Dato requerido"),
//     Fabricacion: Yup.string().required("Dato requerido"),
//     TotalIngenieria: Yup.string().required("Dato requerido"),
//     Ingenieria: Yup.string().required("Dato requerido"),
//     TotalMaquinado: Yup.string().required("Dato requerido"),
//     Maquinado: Yup.string().required("Dato requerido"),
//   });
// }
// Function to handle validation and display an alert

function handleValidation(values: any) {
  const { TotalReparacion, Reparacion } = values;

  if (TotalReparacion !== "" && Reparacion !== "") {
    if (parseInt(TotalReparacion) <= parseInt(Reparacion)) {
      Alert.alert(
        "Validation Error",
        "TotalReparacion should be greater than Reparacion",
        [{ text: "OK", onPress: () => {} }]
      );
    }
  }
}
// Combine the functions into an object and export as default
const ChangeManPowerData = {
  initialValues,
  handleValidation,
};

export default ChangeManPowerData;
