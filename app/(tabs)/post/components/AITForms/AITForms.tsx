import { View, Text, Linking, Button, Platform } from "react-native";
import React, { useState } from "react";
import styles from "./AITForms.styles";
import { Input } from "@rneui/themed";
import { Modal } from "@/components/Modal/Modal";
import ChangeDisplayEmpresaMinera from "../FormsAIT/ChangeEmpresaMinera/ChangeDisplayEmpresaMinera";
import ChangeDisplayArea from "../FormsAIT/ChangeArea/ChangeDisplayArea";
import ChangeDisplayTipoServicio from "../FormsAIT/ChangeTipoServicio/ChangeDisplayTipoServicio";
import ChangeDisplayAdminContracts from "../FormsAIT/ChangeContratos/ChangeDisplayContratos";
import ChangeDisplayAdminContracts2 from "../FormsAIT/ChangeContratos2/ChangeDisplayContratos2";
import ChangeDisplayAdminContracts3 from "../FormsAIT/ChangeContratos3/ChangeDisplayContratos3";
import ChangeDisplayAdminContratista from "../FormsAIT/ChangeContratista/ChangeDisplayContratista";
import ChangeDisplayAdminContratista2 from "../FormsAIT/ChangeContratista2/ChangeDisplayContratista2";
import ChangeDisplayAdminContratista3 from "../FormsAIT/ChangeContratista3/ChangeDisplayContratista3";
import ChangeDisplaynumeroCot from "../FormsAIT/ChangeNumeroCot/ChangeDisplayNumeroCot";
import ChangeDisplayMonto from "../FormsAIT/ChangeNumeroMonto/ChangeDisplayMonto";
import ChangeSupervisorSeguridad from "../FormsAIT/ChangeSupervisorSeguridad/ChangeSupervisorSeguridad";
import ChangeSupervisor from "../FormsAIT/ChangeSupervisor/ChangeSupervisor";
import ChangeTecnicos from "../FormsAIT/ChangeTecnicos/ChangeTecnicos";
import ChangeDisplayHH from "../FormsAIT/ChangeNumeroHH/ChangeDisplayHH";
import ChangeDisplayMoneda from "../FormsAIT/ChangeMoneda/ChangeDisplayTipoServicio";
import ChangeDisplayFechaFin from "../FormsAIT/ChangeFechaFin/ChangeDisplayFechaFin";
import ChangeDisplayFechaInicio from "../FormsAIT/ChangeFechaInicio/ChangeDisplayFechaInicio";

function AITForms(props: any) {
  const { formik, setTituloserv, setAit, setTiposerv, setArea } = props;
  const [renderComponent, setRenderComponent] = useState<any>("");

  //state to render the header

  //state of displays
  // const [numeroAIT, setnumeroAIT] = useState(null);
  const [minera, setMinera] = useState<any>("");

  const [areaservicio, setAreaservicio] = useState<any>("");
  const [tiposervicio, setTiposervicio] = useState<any>("");
  const [responsableempresausuario, setResponsableempresausuario] =
    useState<any>("");
  const [responsableempresausuario2, setResponsableempresausuario2] =
    useState<any>("");
  const [responsableempresausuario3, setResponsableempresausuario3] =
    useState<any>("");

  const [responsableempresacontratista, setResponsableempresacontratista] =
    useState<any>("");

  const [responsableempresacontratista2, setResponsableempresacontratista2] =
    useState<any>("");

  const [responsableempresacontratista3, setResponsableempresacontratista3] =
    useState<any>("");
  const [fechafin, setFechafin] = useState<any>("");
  const [fechaInicio, setFechaInicio] = useState<any>("");
  const [numerocotizacion, setNumerocotizacion] = useState<any>("");
  const [moneda, setMoneda] = useState<any>("");
  const [monto, setMonto] = useState<any>("");
  const [supervisorSeguridad, setSupervisorSeguridad] = useState<any>("");
  const [supervisor, setSupervisor] = useState<any>("");
  const [tecnicos, setTecnicos] = useState<any>("");
  const [horashombre, setHorashombre] = useState<any>("");
  // const [showTimePicker, setShowTimePicker] = useState(false);
  //open or close modal
  const [showModal, setShowModal] = useState<any>(false);
  const onCloseOpenModal = () => setShowModal((prevState: any) => !prevState);

  ///function to date format
  const formatdate = (item: any) => {
    const date = new Date(item);
    const monthNames = [
      "de enero del",
      "de febrero del",
      "de marzo del",
      "de abril del",
      "de mayo del",
      "de junio del",
      "de julio del",
      "de agosto del",
      "de septiembre del",
      "de octubre del",
      "de noviembre del",
      "de diciembre del",
    ];
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const formattedDate = `${day} ${month} ${year} `;
    const fechaPostFormato = formattedDate;
    if (!item) {
      return;
    } else {
      return fechaPostFormato;
    }
  };

  //function to format money
  const formatNumber = (item: any) => {
    const amount = item;

    const formattedAmount = new Intl.NumberFormat("en-US").format(amount);
    if (!item) {
      return;
    } else {
      return formattedAmount;
    }
  };

  const selectComponent = (key: any) => {
    if (key === "EmpresaMinera") {
      setRenderComponent(
        <ChangeDisplayEmpresaMinera
          onClose={onCloseOpenModal}
          formik={formik}
          setMinera={setMinera}
        />
      );
    }
    if (key === "AreaServicio") {
      setRenderComponent(
        <ChangeDisplayArea
          onClose={onCloseOpenModal}
          formik={formik}
          setAreaservicio={setAreaservicio}
          setArea={setArea}
        />
      );
    }
    if (key === "TipoServicio") {
      setRenderComponent(
        <ChangeDisplayTipoServicio
          onClose={onCloseOpenModal}
          formik={formik}
          setTiposervicio={setTiposervicio}
          setTiposerv={setTiposerv}
        />
      );
    }
    if (key === "ResponsableEmpresaUsuario") {
      setRenderComponent(
        <ChangeDisplayAdminContracts
          onClose={onCloseOpenModal}
          formik={formik}
          setResponsableempresausuario={setResponsableempresausuario}
        />
      );
    }
    if (key === "ResponsableEmpresaUsuario2") {
      setRenderComponent(
        <ChangeDisplayAdminContracts2
          onClose={onCloseOpenModal}
          formik={formik}
          setResponsableempresausuario2={setResponsableempresausuario2}
        />
      );
    }
    if (key === "ResponsableEmpresaUsuario3") {
      setRenderComponent(
        <ChangeDisplayAdminContracts3
          onClose={onCloseOpenModal}
          formik={formik}
          setResponsableempresausuario3={setResponsableempresausuario3}
        />
      );
    }

    if (key === "ResponsableEmpresaContratista") {
      setRenderComponent(
        <ChangeDisplayAdminContratista
          onClose={onCloseOpenModal}
          formik={formik}
          setResponsableempresacontratista={setResponsableempresacontratista}
        />
      );
    }

    if (key === "ResponsableEmpresaContratista2") {
      setRenderComponent(
        <ChangeDisplayAdminContratista2
          onClose={onCloseOpenModal}
          formik={formik}
          setResponsableempresacontratista2={setResponsableempresacontratista2}
        />
      );
    }

    if (key === "ResponsableEmpresaContratista3") {
      setRenderComponent(
        <ChangeDisplayAdminContratista3
          onClose={onCloseOpenModal}
          formik={formik}
          setResponsableempresacontratista3={setResponsableempresacontratista3}
        />
      );
    }

    if (key === "FechaInicio") {
      setRenderComponent(
        <ChangeDisplayFechaInicio
          onClose={onCloseOpenModal}
          formik={formik}
          setFechaInicio={setFechaInicio}
        />
      );
    }
    if (key === "FechaFin") {
      setRenderComponent(
        <ChangeDisplayFechaFin
          onClose={onCloseOpenModal}
          formik={formik}
          setFechafin={setFechafin}
        />
      );
    }
    if (key === "NumeroCotizacion") {
      setRenderComponent(
        <ChangeDisplaynumeroCot
          onClose={onCloseOpenModal}
          formik={formik}
          setNumerocotizacion={setNumerocotizacion}
        />
      );
    }
    if (key === "Moneda") {
      setRenderComponent(
        <ChangeDisplayMoneda
          onClose={onCloseOpenModal}
          formik={formik}
          setMoneda={setMoneda}
        />
      );
    }
    if (key === "Monto") {
      setRenderComponent(
        <ChangeDisplayMonto
          onClose={onCloseOpenModal}
          formik={formik}
          setMonto={setMonto}
        />
      );
    }
    if (key === "SupervisorSeguridad") {
      setRenderComponent(
        <ChangeSupervisorSeguridad
          onClose={onCloseOpenModal}
          formik={formik}
          setSupervisorSeguridad={setSupervisorSeguridad}
        />
      );
    }
    if (key === "Supervisor") {
      setRenderComponent(
        <ChangeSupervisor
          onClose={onCloseOpenModal}
          formik={formik}
          setSupervisor={setSupervisor}
        />
      );
    }
    if (key === "Tecnicos") {
      setRenderComponent(
        <ChangeTecnicos
          onClose={onCloseOpenModal}
          formik={formik}
          setTecnicos={setTecnicos}
        />
      );
    }
    if (key === "HorasHombre") {
      setRenderComponent(
        <ChangeDisplayHH
          onClose={onCloseOpenModal}
          formik={formik}
          setHorashombre={setHorashombre}
        />
      );
    }
    onCloseOpenModal();
  };

  return (
    <View>
      <View style={styles.content}>
        <Input
          value={formik.values.EmpresaMinera}
          label="Empresa Minera"
          // multiline={true}
          editable={true}
          errorMessage={formik.errors.EmpresaMinera}
          onChangeText={(text) => {
            formik.setFieldValue("EmpresaMinera", text);
            setMinera(text);
          }}
          rightIcon={{
            type: "material-community",
            testID: "right-icon",
            name: "arrow-right-circle-outline",
            onPress: () => {
              selectComponent("EmpresaMinera");
            },
          }}
        />

        <Input
          value={formik.values.NombreServicio}
          label="Nombre de la Actividad"
          onChangeText={(text) => {
            formik.setFieldValue("NombreServicio", text);
            setTituloserv(text);
          }}
          errorMessage={formik.errors.NombreServicio}
        />
        <Input
          value={formik.values.NumeroAIT}
          label="Numero de Referencia"
          onChangeText={(text) => {
            formik.setFieldValue("NumeroAIT", text);
            setAit(text);
          }}

          // errorMessage={formik.errors.NumeroAIT}
        />
        {/* <Input
          value={formik.values.AreaServicio}
          label="Area del Servicio a Realizar"
          editable={false}
          errorMessage={formik.errors.AreaServicio}
          rightIcon={{
            type: "material-community",
            name: "arrow-right-circle-outline",
            onPress: () => selectComponent("AreaServicio"),
          }}
        /> */}
        <Text style={styles.subtitleForm}>Detalles del Servicio</Text>
        <Text> </Text>

        <Input
          value={formik.values.TipoServicio}
          label="Tipo de Servicio"
          editable={false}
          errorMessage={formik.errors.TipoServicio}
          rightIcon={{
            type: "material-community",
            name: "arrow-right-circle-outline",
            onPress: () => selectComponent("TipoServicio"),
          }}
        />
        <Input
          value={formik.values.ResponsableEmpresaUsuario}
          label="Administrador de Contrato"
          multiline={true}
          editable={false}
          // errorMessage={formik.errors.ResponsableEmpresaUsuario}
          rightIcon={{
            type: "material-community",
            name: "arrow-right-circle-outline",
            onPress: () => selectComponent("ResponsableEmpresaUsuario"),
          }}
        />
        <Input
          value={formik.values.ResponsableEmpresaUsuario2}
          label="Planner"
          multiline={true}
          editable={false}
          // errorMessage={formik.errors.ResponsableEmpresaUsuario}
          rightIcon={{
            type: "material-community",
            name: "arrow-right-circle-outline",
            onPress: () => selectComponent("ResponsableEmpresaUsuario2"),
          }}
        />
        <Input
          value={formik.values.ResponsableEmpresaUsuario3}
          label="Supervisor"
          multiline={true}
          editable={false}
          // errorMessage={formik.errors.ResponsableEmpresaUsuario}
          rightIcon={{
            type: "material-community",
            name: "arrow-right-circle-outline",
            onPress: () => selectComponent("ResponsableEmpresaUsuario3"),
          }}
        />

        <Input
          value={formik.values.ResponsableEmpresaContratista}
          label="Admin EECC"
          multiline={true}
          editable={false}
          // errorMessage={formik.errors.ResponsableEmpresaContratista}
          rightIcon={{
            type: "material-community",
            name: "arrow-right-circle-outline",
            onPress: () => selectComponent("ResponsableEmpresaContratista"),
          }}
        />

        <Input
          value={formik.values.ResponsableEmpresaContratista2}
          label="Planificador EECC"
          multiline={true}
          editable={false}
          // errorMessage={formik.errors.ResponsableEmpresaContratista}
          rightIcon={{
            type: "material-community",
            name: "arrow-right-circle-outline",
            onPress: () => selectComponent("ResponsableEmpresaContratista2"),
          }}
        />

        <Input
          value={formik.values.ResponsableEmpresaContratista3}
          label="Supervisor EECC"
          multiline={true}
          editable={false}
          // errorMessage={formik.errors.ResponsableEmpresaContratista}
          rightIcon={{
            type: "material-community",
            name: "arrow-right-circle-outline",
            onPress: () => selectComponent("ResponsableEmpresaContratista3"),
          }}
        />

        {Platform.OS === "web" ? (
          <View style={{ marginHorizontal: 10 }}>
            <Text> </Text>

            <Text style={{ fontSize: 18, fontWeight: "bold", color: "gray" }}>
              Fecha de Inicio
            </Text>
            <Text> </Text>

            <input
              type="datetime-local"
              id="date"
              name="date"
              onChange={(event: any) => {
                const selectedDateTimeString = event.target.value; // "YYYY-MM-DDThh:mm" format
                const [dateStr, timeStr] = selectedDateTimeString.split("T");
                const [year, month, day] = dateStr.split("-");
                const [hours, minutes] = timeStr
                  ? timeStr.split(":")
                  : ["00", "00"];

                const selectedDate = new Date(
                  Number(year),
                  Number(month) - 1,
                  Number(day),
                  Number(hours),
                  Number(minutes)
                ); // adding hours and minutes parameters

                formik.setFieldValue("FechaInicio", selectedDate);
              }}
            />

            {formik.errors.FechaInicio && (
              <Text style={{ color: "red" }}>{formik.errors.FechaInicio}</Text>
            )}
          </View>
        ) : (
          <Input
            value={formik.values.FechaInicio?.toLocaleString()}
            label="Fecha de Inicio"
            multiline={true}
            editable={false}
            errorMessage={formik.errors.FechaInicio}
            rightIcon={{
              type: "material-community",
              name: "arrow-right-circle-outline",
              onPress: () => {
                selectComponent("FechaInicio");
              },
            }}
          />
        )}
        <Text> </Text>
        {Platform.OS === "web" ? (
          <View style={{ marginHorizontal: 10 }}>
            <Text> </Text>

            <Text style={{ fontSize: 18, fontWeight: "bold", color: "gray" }}>
              Fecha de Fin
            </Text>
            <Text> </Text>
            <input
              type="datetime-local"
              id="date"
              name="date"
              onChange={(event: any) => {
                const selectedDateTimeString = event.target.value; // "YYYY-MM-DDThh:mm" format
                const [dateStr, timeStr] = selectedDateTimeString.split("T");
                const [year, month, day] = dateStr.split("-");
                const [hours, minutes] = timeStr
                  ? timeStr.split(":")
                  : ["00", "00"];

                const selectedDate = new Date(
                  Number(year),
                  Number(month) - 1,
                  Number(day),
                  Number(hours),
                  Number(minutes)
                ); // adding hours and minutes parameters

                formik.setFieldValue("FechaFin", selectedDate);
              }}
            />
            {formik.errors.FechaFin && (
              <Text style={{ color: "red" }}>{formik.errors.FechaFin}</Text>
            )}
          </View>
        ) : (
          <Input
            value={formik.values.FechaFin?.toLocaleString()}
            label="Fecha de Fin"
            multiline={true}
            editable={false}
            errorMessage={formik.errors.FechaFin}
            rightIcon={{
              testID: "right-icon-AreaServicio",
              type: "material-community",
              name: "arrow-right-circle-outline",
              onPress: () => selectComponent("FechaFin"),
            }}
          />
        )}
        <Text> </Text>

        <Text style={styles.subtitleForm}>Información del Servicio</Text>
        <Text> </Text>
        <Input
          value={formik.values.NumeroCotizacion}
          label="Numero de Cotizacion"
          // errorMessage={formik.errors.NumeroCotizacion}
          onChangeText={(text) => {
            formik.setFieldValue("NumeroCotizacion", text);
          }}
        />
        <Input
          value={formik.values.Moneda}
          label="Moneda"
          editable={false}
          rightIcon={{
            type: "material-community",
            name: "arrow-right-circle-outline",
            onPress: () => selectComponent("Moneda"),
          }}
        />
        <Input
          value={formik.values.Monto}
          label="Monto Total"
          keyboardType="numeric"
          onChangeText={(text) => {
            const numericText = text.replace(/[^0-9.]/g, "");
            formik.setFieldValue("Monto", numericText);
          }}
        />
        <Input
          value={formik.values.SupervisorSeguridad}
          label="# Supervisor de Seguridad"
          keyboardType="numeric"
          // errorMessage={formik.errors.HorasHombre}
          onChangeText={(text) => {
            const numericText = text.replace(/[^0-9]/g, "");
            formik.setFieldValue("SupervisorSeguridad", numericText);
          }}
        />
        <Input
          value={formik.values.Supervisor}
          label="# Supervisor"
          keyboardType="numeric"
          // errorMessage={formik.errors.HorasHombre}
          onChangeText={(text) => {
            const numericText = text.replace(/[^0-9]/g, "");
            formik.setFieldValue("Supervisor", numericText);
          }}
        />
        <Input
          value={formik.values.Tecnicos}
          label="# Tecnicos"
          keyboardType="numeric"
          // errorMessage={formik.errors.HorasHombre}
          onChangeText={(text) => {
            const numericText = text.replace(/[^0-9]/g, "");
            formik.setFieldValue("Tecnicos", numericText);
          }}
        />
        <Input
          value={formik.values.Tecnicos}
          label="# Lider Tecnico"
          keyboardType="numeric"
          // errorMessage={formik.errors.HorasHombre}
          onChangeText={(text) => {
            const numericText = text.replace(/[^0-9]/g, "");
            formik.setFieldValue("Lider", numericText);
          }}
        />
        <Input
          value={formik.values.Tecnicos}
          label="# Soldador"
          keyboardType="numeric"
          // errorMessage={formik.errors.HorasHombre}
          onChangeText={(text) => {
            const numericText = text.replace(/[^0-9]/g, "");
            formik.setFieldValue("Soldador", numericText);
          }}
        />
        <Input
          value={formik.values.HorasHombre}
          label="# Horas Hombre reales"
          keyboardType="numeric"
          onChangeText={(text) => {
            const numericText = text.replace(/[^0-9]/g, "");
            formik.setFieldValue("HorasHombre", numericText);
          }}
        />
      </View>

      <Modal show={showModal} close={onCloseOpenModal}>
        {renderComponent}
      </Modal>
    </View>
  );
}

export default AITForms;
