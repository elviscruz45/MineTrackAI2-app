import { View, Text, Platform } from "react-native";
import { Button } from "@rneui/themed";
import React, { useEffect, useMemo } from "react";
import { connect } from "react-redux";
import styles from "./AIT.styles";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import initialValues, {
  validationSchema,
  AIT_FIELD_LABELS,
  AIT_REQUIRED_FIELDS,
} from "./AIT.data";
import { saveActualPostFirebase } from "../../../redux/actions/post";
import { useFormik } from "formik";
import { createServicioAit } from "@/lib/db/serviciosAit";
import { getAllProfiles } from "@/lib/db/profiles";
import AITForms from "./components/AITForms/AITForms";
import { areaLists } from "../../../utils/areaList";
import { saveTotalUsers } from "../../../redux/actions/post";
import Toast from "react-native-toast-message";
import { Image as ImageExpo } from "expo-image";
import { useRouter } from "expo-router";
import { isRutaCritica } from "@/utils/isRutaCritica";

const REQUIRED_KEYS = [...AIT_REQUIRED_FIELDS];

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function parseHorasTotales(value: string | number): number {
  const n = parseFloat(String(value ?? "").replace(",", "."));
  return isNaN(n) ? 0 : n;
}

function buildFirebasePayload(formValue: any, props: any, projectId: string) {
  const fechaInicio = formValue.FechaInicio
    ? new Date(formValue.FechaInicio)
    : null;
  const fechaFin = formValue.FechaFin ? new Date(formValue.FechaFin) : null;
  let horasTotales = parseHorasTotales(formValue.HorasTotales);
  if (horasTotales <= 0 && fechaInicio && fechaFin) {
    horasTotales = Math.max(
      0,
      Math.round((fechaFin.getTime() - fechaInicio.getTime()) / 3600000)
    );
  }

  const date = new Date();
  const monthNames = [
    "ene.", "feb.", "mar.", "abr.", "may.", "jun.",
    "jul.", "ago.", "sep.", "oct.", "nov.", "dic.",
  ];
  const formattedDate = `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}  ${date.getHours()}:${date.getMinutes()} Hrs`;

  const regex = /@(.+?)\./i;
  const uniqueID = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const codigo = String(formValue.Codigo || "").trim();
  const nombre = formValue.NombreServicio;
  const numeroAIT =
    String(formValue.NumeroAIT || "").trim() ||
    `ADT-${Date.now().toString().slice(-8)}`;
  const fechaInicioTs = fechaInicio ?? null;
  const fechaFinTs = fechaFin ?? null;
  const esRutaCritica = isRutaCritica(formValue.esRutaCritica);

  const activityEntry = {
    Codigo: codigo,
    NombreServicio: nombre,
    FechaInicio: fechaInicioTs,
    FechaFin: fechaFinTs,
    HorasTotales: horasTotales,
    TagEquipo: String(formValue.TagEquipo || "").trim(),
    AreaServicio: formValue.AreaServicio,
    EmpresaMinera: formValue.EmpresaMinera || "Antapaccay",
    esRutaCritica,
    TipoServicio: formValue.TipoServicio || "Parada de Planta",
  };

  return {
    Codigo: codigo,
    NombreServicio: nombre,
    NumeroAIT: numeroAIT,
    EmpresaMinera: formValue.EmpresaMinera,
    AreaServicio: formValue.AreaServicio,
    TagEquipo: String(formValue.TagEquipo || "").trim(),
    TipoServicio: formValue.TipoServicio,
    esRutaCritica,
    ResponsableEmpresaUsuario: formValue.ResponsableEmpresaUsuario || "",
    ResponsableEmpresaUsuario2: formValue.ResponsableEmpresaUsuario2 || "",
    ResponsableEmpresaUsuario3: formValue.ResponsableEmpresaUsuario3 || "",
    ResponsableEmpresaContratista: formValue.ResponsableEmpresaContratista || "",
    ResponsableEmpresaContratista2: formValue.ResponsableEmpresaContratista2 || "",
    ResponsableEmpresaContratista3: formValue.ResponsableEmpresaContratista3 || "",
    SupervisorMina: formValue.ResponsableEmpresaUsuario3 || "",
    SupervisorEECC: formValue.ResponsableEmpresaContratista3 || "",
    FechaInicio: fechaInicioTs,
    FechaFin: fechaFinTs,
    NumeroCotizacion: formValue.NumeroCotizacion,
    Moneda: formValue.Moneda,
    Monto: String(formValue.Monto ?? "0"),
    SupervisorSeguridad: String(formValue.SupervisorSeguridad ?? "0"),
    Supervisor: String(formValue.Supervisor ?? "0"),
    Tecnicos: String(formValue.Tecnicos ?? "0"),
    Lider: String(formValue.Lider ?? "0"),
    Soldador: String(formValue.Soldador ?? "0"),
    HorasTotales: horasTotales,
    HorasHombre: formValue.HorasHombre || String(horasTotales),
    pdfFile: [],
    fechaPostFormato: formattedDate,
    fechaPostISO: new Date().toISOString(),
    createdAt: new Date(),
    LastEventPosted: new Date(),
    NuevaFechaEstimada: 0,
    fechaFinEjecucion: 0,
    photoServiceURL: "",
    emailPerfil: props.email || "Anonimo",
    nombrePerfil: props.firebase_user_name || "Anonimo",
    events: [],
    companyName:
      capitalizeFirstLetter(props.email?.match(regex)?.[1]) || "Anonimo",
    AvanceEjecucion: 0,
    AvanceAdministrativo: 0,
    AvanceAdministrativoTexto: "",
    HHModificado: 0,
    MontoModificado: 0,
    idServiciosAIT: uniqueID,
    projectId,
    isGlobalProject: false,
    activities: [nombre],
    activitiesData: [activityEntry],
    proyecto: "",
  };
}

function isFieldFilled(key: string, values: Record<string, any>): boolean {
  const val = values[key];
  if (key === "FechaInicio" || key === "FechaFin") return val != null;
  if (key === "esRutaCritica") return String(val ?? "No").trim() !== "";
  return String(val ?? "").trim() !== "";
}

function AITNoReduxScreen(props: any) {
  const router = useRouter();
  const emptyimage = require("../../../assets/equipmentplant/ImageIcons/poderosa.png");
  const projectId = props.servicesData?.[0]?.projectId || "";

  useEffect(() => {
    if (props.email) {
      async function fetchData() {
        try {
          const lista = await getAllProfiles();
          props.saveTotalUsers(lista);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
      if (!props.getTotalUsers) fetchData();
    }
  }, [props.email]);

  const formik = useFormik({
    initialValues: initialValues(),
    validationSchema: validationSchema(),
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (formValue) => {
      try {
        const payload = buildFirebasePayload(formValue, props, projectId);
        await createServicioAit(payload);

        Toast.show({
          type: "success",
          position: "bottom",
          text1: "Trabajo adicional registrado",
          text2: `${payload.Codigo} · ${payload.NombreServicio}`,
        });
        router.back();
      } catch (error) {
        console.error(error);
        Toast.show({
          type: "error",
          position: "bottom",
          text1: "Error al registrar el servicio",
          text2: "Revise su conexión e intente nuevamente.",
        });
      }
    },
  });

  const v = formik.values;
  const IndexObjectImageArea = areaLists.findIndex(
    (obj) => obj.value === v.AreaServicio
  );
  const imageSource =
    areaLists[IndexObjectImageArea]?.image || emptyimage;

  const progress = useMemo(() => {
    const filled = REQUIRED_KEYS.filter((k) => isFieldFilled(k, v)).length;
    return {
      filled,
      total: REQUIRED_KEYS.length,
      pct: Math.round((filled / REQUIRED_KEYS.length) * 100),
    };
  }, [v]);

  const handleSubmitPress = async () => {
    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      formik.setTouched(
        Object.keys(errors).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {} as Record<string, boolean>
        )
      );
      const labels = Object.keys(errors)
        .slice(0, 4)
        .map((k) => AIT_FIELD_LABELS[k] || k)
        .join(", ");
      Toast.show({
        type: "error",
        position: "bottom",
        text1: "Complete los campos obligatorios",
        text2: labels + (Object.keys(errors).length > 4 ? "…" : ""),
      });
      return;
    }
    formik.handleSubmit();
  };

  return (
    <KeyboardAwareScrollView
      style={styles.scroll}
      contentContainerStyle={styles.pageWrap}
      enableOnAndroid
      extraScrollHeight={Platform.OS === "ios" ? 80 : 40}
    >
      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <ImageExpo
            source={imageSource}
            style={styles.roundImage}
            cachePolicy="memory-disk"
          />
          <View style={styles.heroContent}>
            <View style={styles.badgeRow}>
              <View style={styles.badgePrimary}>
                <Text style={styles.badgeText}>NIVEL 4 · NO PLANIFICADO</Text>
              </View>
              <View style={styles.badgeWarning}>
                <Text style={[styles.badgeText, styles.badgeWarningText]}>
                  TRABAJO ADICIONAL AIT
                </Text>
              </View>
            </View>
            <Text style={styles.heroTitle} numberOfLines={2}>
              {v.NombreServicio || "Nueva actividad adicional"}
            </Text>
            {v.Codigo ? (
              <Text style={styles.heroMeta}>
                <Text style={styles.heroMetaStrong}>WBS: </Text>
                {v.Codigo}
              </Text>
            ) : null}
            {v.NumeroAIT ? (
              <Text style={styles.heroMeta}>
                <Text style={styles.heroMetaStrong}>Ref / OC: </Text>
                {v.NumeroAIT}
              </Text>
            ) : null}
            {v.TipoServicio ? (
              <Text style={styles.heroMeta}>
                <Text style={styles.heroMetaStrong}>Tipo: </Text>
                {v.TipoServicio}
              </Text>
            ) : null}
            {v.AreaServicio ? (
              <Text style={styles.heroMeta}>
                <Text style={styles.heroMetaStrong}>Área: </Text>
                {v.AreaServicio}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.progressWrap}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>
              Campos obligatorios para reportes
            </Text>
            <Text style={styles.progressPct}>
              {progress.filled}/{progress.total} · {progress.pct}%
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[styles.progressBarFill, { width: `${progress.pct}%` }]}
            />
          </View>
        </View>
      </View>

      <AITForms formik={formik} />

      <View style={styles.footer}>
        <Button
          title={
            formik.isSubmitting
              ? "Registrando…"
              : "Registrar trabajo adicional"
          }
          titleStyle={styles.addInformationTitle}
          buttonStyle={[
            styles.addInformation,
            progress.pct < 100 && styles.addInformationDisabled,
          ]}
          onPress={handleSubmitPress}
          loading={formik.isSubmitting}
          disabled={formik.isSubmitting}
        />
      </View>
    </KeyboardAwareScrollView>
  );
}

const mapStateToProps = (reducers: any) => ({
  firebase_user_name: reducers.profile.firebase_user_name,
  email: reducers.profile.email,
  getTotalUsers: reducers.post.saveTotalUsers,
  servicesData: reducers.home.servicesData,
});

const AITScreen = connect(mapStateToProps, {
  saveActualPostFirebase,
  saveTotalUsers,
})(AITNoReduxScreen);

export default AITScreen;
