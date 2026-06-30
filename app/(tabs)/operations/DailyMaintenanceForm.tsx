import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from "react-native";
import { Button, Input } from "@rneui/themed";
import { useFormik } from "formik";
import * as Yup from "yup";
import * as ImagePicker from "expo-image-picker";
import { connect } from "react-redux";
import { useRouter, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import initialValues, {
  TIPO_MANTENIMIENTO_OPTIONS,
  ESTADO_EQUIPO_OPTIONS,
} from "./DailyMaintenanceForm.data";
import {
  getTagEquipoAreaSections,
  getTagAreaColor,
  findTagEquipoByKey,
  getTagEquipoNombre,
} from "@/utils/tagEquipoList";
import { createMaintenanceLog } from "@/lib/db/maintenanceLogs";
import { uploadMaintenanceAttachment } from "@/lib/db/storage";
import { getAllProfiles } from "@/lib/db/profiles";
import { createApproval } from "@/lib/db/approvals";

function DailyMaintenanceFormRaw(props: any) {
  const router = useRouter();
  const { tagCode: presetTagCode } = useLocalSearchParams<{ tagCode?: string }>();
  const [approvers, setApprovers] = useState<any[]>([]);
  const [materialNombre, setMaterialNombre] = useState("");
  const [materialCantidad, setMaterialCantidad] = useState("");
  const [materialUnidad, setMaterialUnidad] = useState("");

  useEffect(() => {
    getAllProfiles().then(setApprovers).catch(console.error);
  }, []);

  const formik = useFormik({
    initialValues: {
      ...initialValues(),
      TagEquipo: presetTagCode ? String(presetTagCode) : "",
    },
    validationSchema: Yup.object({
      TagEquipo: Yup.string().required("Seleccione un equipo"),
      descripcion: Yup.string().required("Descripción obligatoria"),
      horas: Yup.string(),
    }),
    validateOnChange: false,
    onSubmit: async (values) => {
      try {
        const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        let fotoUrl = "";
        let pdfUrl = "";

        if (values.fotoUri) {
          const response = await fetch(values.fotoUri);
          const blob = await response.blob();
          fotoUrl = await uploadMaintenanceAttachment(
            `${id}-foto.jpg`,
            blob,
            blob.type || "image/jpeg"
          );
        }

        const tag = findTagEquipoByKey(values.TagEquipo);

        const payload = {
          id,
          TagEquipo: values.TagEquipo,
          tag_code: values.TagEquipo,
          equipment_tag_id: null,
          fecha: values.fecha,
          descripcion: values.descripcion,
          personnelType: values.personnelType,
          companyName:
            values.companyName ||
            (props.email?.match(/@(.+?)\./i)?.[1] ?? ""),
          supervisorPlanta: values.supervisorPlanta,
          supervisorContratista: values.supervisorContratista,
          horas: Number(values.horas) || 0,
          tipoMantenimiento: values.tipoMantenimiento,
          estadoEquipo: values.estadoEquipo,
          numeroOT: values.numeroOT,
          paradaEquipoHoras: Number(values.paradaEquipoHoras) || 0,
          materiales: values.materiales,
          aprobacionRequerida: values.aprobacionRequerida,
          aprobacionEstado: values.aprobacionRequerida ? "pendiente" : "aprobado",
          aprobadorEmail: values.aprobadorEmail,
          causa: values.causa,
          tipoEventoHSE: values.tipoEventoHSE,
          clasificacionHSE: values.clasificacionHSE,
          horasPerdidasHSE: Number(values.horasPerdidasHSE) || 0,
          emailPerfil: props.email,
          nombrePerfil: props.firebase_user_name || "Anonimo",
          fotoUsuarioPerfil: props.user_photo || "",
          fotoUrl,
          pdfUrl,
        };

        await createMaintenanceLog(payload);

        if (values.aprobacionRequerida && values.aprobadorEmail) {
          await createApproval({
            idApproval: `appr-${id}`,
            IdAITService: "",
            maintenance_log_id: id,
            ApprovalRequestedBy: props.email,
            ApprovalRequestSentTo: [values.aprobadorEmail],
            ApprovalPerformed: [],
            RejectionPerformed: [],
            solicitud: "Mantenimiento diario",
            solicitudComentario: values.descripcion,
            fileName: values.numeroOT,
            nombreServicio: tag ? getTagEquipoNombre(tag) : values.TagEquipo,
            companyName: payload.companyName,
            AreaServicio: tag?.area ?? "",
          });
        }

        Toast.show({
          type: "success",
          text1: "Mantenimiento registrado",
          text2: `${values.TagEquipo} — ${values.descripcion.slice(0, 40)}`,
        });

        router.push({
          pathname: "/operations/equipment/[tagCode]",
          params: { tagCode: values.TagEquipo },
        });
      } catch (error) {
        console.error(error);
        Toast.show({
          type: "error",
          text1: "Error al registrar mantenimiento",
        });
      }
    },
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      formik.setFieldValue("fotoUri", result.assets[0].uri);
    }
  };

  const addMaterial = () => {
    if (!materialNombre.trim()) return;
    formik.setFieldValue("materiales", [
      ...formik.values.materiales,
      {
        nombre: materialNombre,
        cantidad: materialCantidad,
        unidad: materialUnidad,
      },
    ]);
    setMaterialNombre("");
    setMaterialCantidad("");
    setMaterialUnidad("");
  };

  const inputStyle = {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    backgroundColor: "#fff",
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 16 }}>
          Registro de Mantenimiento Diario
        </Text>

        <Text style={{ fontWeight: "600", marginBottom: 6 }}>Tag Equipo *</Text>
        {presetTagCode ? (
          <View
            style={{
              backgroundColor: "#2A3B76",
              borderRadius: 8,
              padding: 12,
              marginBottom: 12,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>{presetTagCode}</Text>
            {findTagEquipoByKey(String(presetTagCode)) ? (
              <Text style={{ color: "#cbd5e1", fontSize: 12, marginTop: 4 }}>
                {getTagEquipoNombre(findTagEquipoByKey(String(presetTagCode))!)}
              </Text>
            ) : null}
          </View>
        ) : (
          getTagEquipoAreaSections().map(({ area, items: areaTags }) => (
            <View key={area} style={{ marginBottom: 12 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: getTagAreaColor(area),
                  marginBottom: 6,
                  textTransform: "uppercase",
                }}
              >
                {area}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 4 }}
              >
                {areaTags.map((t) => (
                  <TouchableOpacity
                    key={t.key}
                    onPress={() => formik.setFieldValue("TagEquipo", t.key)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      marginRight: 8,
                      borderRadius: 8,
                      backgroundColor:
                        formik.values.TagEquipo === t.key ? "#2A3B76" : "#e2e8f0",
                    }}
                  >
                    <Text
                      style={{
                        color:
                          formik.values.TagEquipo === t.key ? "#fff" : "#334155",
                        fontWeight: "600",
                        fontSize: 12,
                      }}
                    >
                      {t.key}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ))
        )}
        {formik.errors.TagEquipo && (
          <Text style={{ color: "red", marginBottom: 8 }}>{formik.errors.TagEquipo}</Text>
        )}

        <Text style={{ fontWeight: "600", marginBottom: 6 }}>Personal</Text>
        <View style={{ flexDirection: "row", marginBottom: 12, gap: 8 }}>
          {(["planta", "contratista"] as const).map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => formik.setFieldValue("personnelType", p)}
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 8,
                backgroundColor:
                  formik.values.personnelType === p ? "#2A3B76" : "#e2e8f0",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: formik.values.personnelType === p ? "#fff" : "#334155",
                  fontWeight: "600",
                  textTransform: "capitalize",
                }}
              >
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={inputStyle}
          placeholder="Empresa"
          value={formik.values.companyName}
          onChangeText={(t) => formik.setFieldValue("companyName", t)}
        />
        <TextInput
          style={inputStyle}
          placeholder="Supervisor Planta"
          value={formik.values.supervisorPlanta}
          onChangeText={(t) => formik.setFieldValue("supervisorPlanta", t)}
        />
        <TextInput
          style={inputStyle}
          placeholder="Supervisor Contratista"
          value={formik.values.supervisorContratista}
          onChangeText={(t) => formik.setFieldValue("supervisorContratista", t)}
        />

        <Text style={{ fontWeight: "600", marginBottom: 6 }}>Tipo mantenimiento</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
          {TIPO_MANTENIMIENTO_OPTIONS.map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => formik.setFieldValue("tipoMantenimiento", t)}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 6,
                backgroundColor:
                  formik.values.tipoMantenimiento === t ? "#1565c0" : "#e2e8f0",
              }}
            >
              <Text
                style={{
                  color: formik.values.tipoMantenimiento === t ? "#fff" : "#334155",
                  fontSize: 12,
                  textTransform: "capitalize",
                }}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={[inputStyle, { minHeight: 80, textAlignVertical: "top" }]}
          placeholder="Descripción del trabajo *"
          multiline
          value={formik.values.descripcion}
          onChangeText={(t) => formik.setFieldValue("descripcion", t)}
        />

        <View style={{ flexDirection: "row", gap: 8 }}>
          <TextInput
            style={[inputStyle, { flex: 1 }]}
            placeholder="Horas trabajadas"
            keyboardType="numeric"
            value={formik.values.horas}
            onChangeText={(t) => formik.setFieldValue("horas", t)}
          />
          <TextInput
            style={[inputStyle, { flex: 1 }]}
            placeholder="Horas parada equipo"
            keyboardType="numeric"
            value={formik.values.paradaEquipoHoras}
            onChangeText={(t) => formik.setFieldValue("paradaEquipoHoras", t)}
          />
        </View>

        <TextInput
          style={inputStyle}
          placeholder="Número OT"
          value={formik.values.numeroOT}
          onChangeText={(t) => formik.setFieldValue("numeroOT", t)}
        />

        <Text style={{ fontWeight: "600", marginBottom: 6 }}>Estado del equipo</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
          {ESTADO_EQUIPO_OPTIONS.map((e) => (
            <TouchableOpacity
              key={e}
              onPress={() => formik.setFieldValue("estadoEquipo", e)}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 6,
                backgroundColor:
                  formik.values.estadoEquipo === e ? "#2e7d32" : "#e2e8f0",
              }}
            >
              <Text
                style={{
                  color: formik.values.estadoEquipo === e ? "#fff" : "#334155",
                  fontSize: 11,
                  textTransform: "capitalize",
                }}
              >
                {e.replace("_", " ")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ fontWeight: "600", marginBottom: 6 }}>Materiales</Text>
        {formik.values.materiales.map((m, i) => (
          <Text key={i} style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
            • {m.nombre} — {m.cantidad} {m.unidad}
          </Text>
        ))}
        <View style={{ flexDirection: "row", gap: 4, marginBottom: 8 }}>
          <TextInput
            style={[inputStyle, { flex: 2, marginBottom: 0 }]}
            placeholder="Material"
            value={materialNombre}
            onChangeText={setMaterialNombre}
          />
          <TextInput
            style={[inputStyle, { flex: 1, marginBottom: 0 }]}
            placeholder="Cant."
            value={materialCantidad}
            onChangeText={setMaterialCantidad}
          />
          <TextInput
            style={[inputStyle, { flex: 1, marginBottom: 0 }]}
            placeholder="Unid."
            value={materialUnidad}
            onChangeText={setMaterialUnidad}
          />
        </View>
        <Button title="Agregar material" type="outline" onPress={addMaterial} containerStyle={{ marginBottom: 12 }} />

        <Text style={{ fontWeight: "600", marginTop: 8, marginBottom: 6 }}>HSE</Text>
        <TextInput style={inputStyle} placeholder="Causa" value={formik.values.causa} onChangeText={(t) => formik.setFieldValue("causa", t)} />
        <TextInput style={inputStyle} placeholder="Tipo evento HSE" value={formik.values.tipoEventoHSE} onChangeText={(t) => formik.setFieldValue("tipoEventoHSE", t)} />
        <TextInput style={inputStyle} placeholder="Clasificación HSE" value={formik.values.clasificacionHSE} onChangeText={(t) => formik.setFieldValue("clasificacionHSE", t)} />
        <TextInput style={inputStyle} placeholder="Horas perdidas HSE" keyboardType="numeric" value={formik.values.horasPerdidasHSE} onChangeText={(t) => formik.setFieldValue("horasPerdidasHSE", t)} />

        <TouchableOpacity
          onPress={() => formik.setFieldValue("aprobacionRequerida", !formik.values.aprobacionRequerida)}
          style={{ flexDirection: "row", alignItems: "center", marginVertical: 12 }}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 4,
              borderWidth: 2,
              borderColor: "#2A3B76",
              backgroundColor: formik.values.aprobacionRequerida ? "#2A3B76" : "#fff",
              marginRight: 8,
            }}
          />
          <Text>Requiere aprobación</Text>
        </TouchableOpacity>

        {formik.values.aprobacionRequerida && (
          <ScrollView horizontal style={{ marginBottom: 12 }}>
            {approvers.map((a) => (
              <TouchableOpacity
                key={a.email}
                onPress={() => formik.setFieldValue("aprobadorEmail", a.email)}
                style={{
                  padding: 8,
                  marginRight: 6,
                  borderRadius: 6,
                  backgroundColor:
                    formik.values.aprobadorEmail === a.email ? "#2A3B76" : "#e2e8f0",
                }}
              >
                <Text style={{ fontSize: 11, color: formik.values.aprobadorEmail === a.email ? "#fff" : "#334155" }}>
                  {a.displayNameform || a.email}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <Button title="Adjuntar foto" type="outline" onPress={pickImage} containerStyle={{ marginBottom: 8 }} />
        {formik.values.fotoUri ? (
          <Text style={{ fontSize: 12, color: "#22c55e", marginBottom: 12 }}>Foto seleccionada</Text>
        ) : null}

        <Button
          title="Registrar mantenimiento"
          onPress={() => formik.handleSubmit()}
          loading={formik.isSubmitting}
          buttonStyle={{ backgroundColor: "#2A3B76", borderRadius: 8 }}
        />
      </View>
    </ScrollView>
  );
}

const mapStateToProps = (reducers: any) => ({
  email: reducers.profile.email,
  firebase_user_name: reducers.profile.firebase_user_name,
  user_photo: reducers.profile.user_photo,
});

export default connect(mapStateToProps)(DailyMaintenanceFormRaw);
