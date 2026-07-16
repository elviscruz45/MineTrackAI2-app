import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
  FlatList,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { connect } from "react-redux";
import { Button } from "@rneui/themed";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useFormik } from "formik";
import Toast from "react-native-toast-message";
import { MaterialIcon as MaterialIcons } from "@/components/MaterialIcon";
import { Image as ImageExpo } from "expo-image";
import * as DocumentPicker from "expo-document-picker";

import { getEventById, updateEvent } from "@/lib/db/events";
import type { EventAttachedDocument } from "@/lib/db/types";
import initialValues, {
  validationSchema,
} from "../../../../post/Information.data";
import { createInformationStyles } from "../../../../post/Information.ui.styles";
import TitleForms from "../../../../post/components/TitleForms/TitleForms";
import GeneralForms from "../../../../post/components/GeneralForms/GeneralForms";
import { uploadImage, uploadPdf } from "../../../../post/Information.calc";
import {
  getTagEquipoLabel,
  getTagEquipoNombre,
  findTagEquipoByKey,
} from "@/utils/tagEquipoList";
import { collectEventDocuments } from "../../eventUtils";

function isLocalUri(uri: string) {
  return (
    uri.startsWith("file:") ||
    uri.startsWith("blob:") ||
    uri.startsWith("data:") ||
    uri.startsWith("content:")
  );
}

function eventToFormValues(event: Record<string, unknown>) {
  const base = initialValues();
  return {
    ...base,
    titulo: String(event.titulo ?? ""),
    comentarios: String(event.comentarios ?? ""),
    visibilidad: String(event.visibilidad ?? "Todos"),
    etapa: String(event.etapa ?? "Avance Ejecucion"),
    porcentajeAvance: String(event.porcentajeAvance ?? "0"),
    aprobacion: String(event.aprobacion ?? ""),
    FilenameTitle: String(event.FilenameTitle ?? ""),
    tipoFile: String(event.tipoFile ?? ""),
    causa: String(event.causa ?? ""),
    tipoEvento: String(event.tipoEvento ?? ""),
    clasificacionHSE: String(event.clasificacionHSE ?? ""),
    equipoAfectado: String(event.equipoAfectado ?? ""),
    horasPerdidas: String(event.horasPerdidas ?? ""),
    supervisores: String(event.supervisores ?? ""),
    HSE: String(event.HSE ?? ""),
    liderTecnico: String(event.liderTecnico ?? ""),
    soldador: String(event.soldador ?? ""),
    tecnico: String(event.tecnico ?? ""),
    ayudante: String(event.ayudante ?? ""),
    fotoPrincipal: String(event.fotoPrincipal ?? ""),
    pdfPrincipal: String(event.pdfPrincipal ?? ""),
    idDocFirestoreDB: String(event.idDocFirestoreDB ?? event.id ?? ""),
  };
}

function EquipmentEventEditRaw() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const { eventId, tagCode } = useLocalSearchParams<{
    eventId: string;
    tagCode: string;
  }>();
  const code = String(tagCode || "");
  const id = String(eventId || "");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [eventData, setEventData] = useState<Record<string, unknown> | null>(
    null,
  );
  const [formInitialValues, setFormInitialValues] = useState(initialValues());
  const [moreImages, setMoreImages] = useState<string[]>([]);
  const [documents, setDocuments] = useState<EventAttachedDocument[]>([]);
  const [mainPhotoUri, setMainPhotoUri] = useState("");

  const tagItem = findTagEquipoByKey(code);
  const nombre =
    String(eventData?.AITNombreServicio ?? "") ||
    (tagItem ? getTagEquipoNombre(tagItem) : "Equipo");

  const styles = useMemo(
    () => createInformationStyles(windowWidth),
    [windowWidth],
  );

  const formik = useFormik({
    initialValues: formInitialValues,
    validationSchema: validationSchema(),
    validateOnChange: false,
    enableReinitialize: true,
    onSubmit: async (formValue) => {
      if (!eventData || !id) return;
      setSubmitting(true);
      try {
        const gallery: string[] = [];
        for (const uri of moreImages) {
          if (isLocalUri(uri)) {
            gallery.push(await uploadImage(uri));
          } else if (uri) {
            gallery.push(uri);
          }
        }

        let updatedDocs = [...documents];
        if (formValue.pdfFile) {
          const pdfUrl = await uploadPdf(
            formValue.pdfFile,
            formValue.FilenameTitle,
            String(eventData.fechaPostFormato ?? new Date().toISOString()),
          );
          updatedDocs = [
            ...updatedDocs,
            {
              url: pdfUrl,
              filename: formValue.FilenameTitle || "Documento adjunto",
              tipoFile: formValue.tipoFile || "",
            },
          ];
        }

        const pdfPrincipal = updatedDocs[0]?.url ?? "";
        const attachedDocuments = updatedDocs.slice(1);

        await updateEvent(id, {
          ...(eventData as Record<string, unknown>),
          titulo: formValue.titulo,
          comentarios: formValue.comentarios,
          causa: formValue.causa,
          tipoEvento: formValue.tipoEvento,
          clasificacionHSE: formValue.clasificacionHSE,
          equipoAfectado: formValue.equipoAfectado,
          horasPerdidas: formValue.horasPerdidas,
          supervisores: formValue.supervisores,
          HSE: formValue.HSE,
          liderTecnico: formValue.liderTecnico,
          soldador: formValue.soldador,
          tecnico: formValue.tecnico,
          ayudante: formValue.ayudante,
          fotoPrincipal: mainPhotoUri || String(eventData.fotoPrincipal ?? ""),
          newImages: gallery,
          pdfPrincipal,
          FilenameTitle: updatedDocs[0]?.filename ?? "",
          tipoFile: updatedDocs[0]?.tipoFile ?? "",
          attachedDocuments,
          idDocFirestoreDB: id,
        } as Record<string, unknown>);

        Toast.show({
          type: "success",
          position: "bottom",
          text1: "Evento actualizado correctamente",
        });
        router.back();
      } catch (error) {
        console.error("Error updating event:", error);
        Toast.show({
          type: "error",
          position: "bottom",
          text1: "No se pudo guardar el evento",
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const loadEvent = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const event = await getEventById(id);
      if (!event) {
        Toast.show({
          type: "error",
          position: "bottom",
          text1: "No se encontró el evento",
        });
        router.back();
        return;
      }
      const mapped = event as Record<string, unknown>;
      setEventData(mapped);
      setFormInitialValues(eventToFormValues(mapped));

      const foto = String(mapped.fotoPrincipal ?? "");
      setMainPhotoUri(foto);

      const gallery = ((mapped.newImages as string[]) ?? []).filter(Boolean);
      setMoreImages(gallery);
      setDocuments(collectEventDocuments(mapped));
    } catch (error) {
      console.error("Error loading event:", error);
      Toast.show({
        type: "error",
        position: "bottom",
        text1: "Error al cargar el evento",
      });
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  const openDocument = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Toast.show({
          type: "error",
          position: "bottom",
          text1: "No se pudo abrir el documento",
        });
      }
    } catch {
      Toast.show({
        type: "error",
        position: "bottom",
        text1: "Error al abrir el documento",
      });
    }
  };

  const pickExtraDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: false,
      });
      if (result.assets?.[0]) {
        const asset = result.assets[0];
        formik.setFieldValue("pdfFile", asset.uri);
        formik.setFieldValue("FilenameTitle", asset.name);
      }
    } catch {
      Toast.show({
        type: "error",
        position: "bottom",
        text1: "Error al adjuntar el documento",
      });
    }
  };

  const removeDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#f1f5f9", justifyContent: "center" }}
      >
        <ActivityIndicator size="large" color="#2A3B76" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.scroll} edges={["left", "right", "bottom"]}>
      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={Platform.OS === "ios" ? 80 : 40}
      >
        <View style={styles.page}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 12 }}>
            <Text style={{ color: "#2A3B76", fontWeight: "600" }}>
              ← Volver al detalle
            </Text>
          </TouchableOpacity>

          <View style={styles.heroCard}>
            <Text style={styles.heroEyebrow}>Editar evento</Text>
            <Text style={styles.heroTitle}>{nombre}</Text>
            <View style={styles.heroMetaRow}>
              {code ? (
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>{code}</Text>
                </View>
              ) : null}
              {getTagEquipoLabel(code) && code !== getTagEquipoLabel(code) ? (
                <Text style={styles.heroMetaText}>
                  {getTagEquipoLabel(code)}
                </Text>
              ) : null}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Detalle del evento</Text>
              <Text style={styles.sectionHint}>Campos obligatorios *</Text>
            </View>
            <TitleForms formik={formik} photoUri={mainPhotoUri} />
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Información adicional</Text>
              <Text style={styles.sectionHint}>Opcional según tipo</Text>
            </View>
            <GeneralForms
              formik={formik}
              setMoreImages={setMoreImages}
              initialImages={moreImages}
              allowAddImages
            />
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Documentos adjuntos</Text>
              <Text style={styles.sectionHint}>
                {documents.length + (formik.values.pdfFile ? 1 : 0)} archivo(s)
              </Text>
            </View>

            {documents.length === 0 && !formik.values.pdfFile ? (
              <Text style={{ fontSize: 13, color: "#94a3b8", padding: 8 }}>
                Sin documentos adjuntos todavía.
              </Text>
            ) : (
              <View style={{ gap: 8, paddingHorizontal: 4 }}>
                {documents.map((doc, index) => (
                  <View
                    key={`${doc.url}-${index}`}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#f8fafc",
                      borderRadius: 10,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: "#e2e8f0",
                      gap: 10,
                    }}
                  >
                    <MaterialIcons name="attach-file" size={22} color="#2A3B76" />
                    <TouchableOpacity
                      style={{ flex: 1 }}
                      onPress={() => openDocument(doc.url)}
                    >
                      <Text
                        style={{ fontSize: 14, fontWeight: "600", color: "#1e293b" }}
                        numberOfLines={2}
                      >
                        {doc.filename}
                      </Text>
                      {doc.tipoFile ? (
                        <Text style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                          {doc.tipoFile}
                        </Text>
                      ) : null}
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => removeDocument(index)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <MaterialIcons name="close" size={20} color="#94a3b8" />
                    </TouchableOpacity>
                  </View>
                ))}
                {formik.values.pdfFile ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#eff6ff",
                      borderRadius: 10,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: "#bfdbfe",
                      gap: 10,
                    }}
                  >
                    <MaterialIcons name="upload-file" size={22} color="#2563eb" />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: "600", color: "#1e293b" }}>
                        {formik.values.FilenameTitle || "Nuevo documento"}
                      </Text>
                      <Text style={{ fontSize: 12, color: "#2563eb", marginTop: 2 }}>
                        Pendiente de guardar
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        formik.setFieldValue("pdfFile", "");
                        formik.setFieldValue("FilenameTitle", "");
                      }}
                    >
                      <MaterialIcons name="close" size={20} color="#94a3b8" />
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            )}

            <TouchableOpacity
              onPress={pickExtraDocument}
              style={{
                marginTop: 12,
                marginHorizontal: 4,
                paddingVertical: 14,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#e2e8f0",
                backgroundColor: "#fff",
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "600", color: "#334155" }}>
                + Agregar documento
              </Text>
            </TouchableOpacity>
          </View>

          {moreImages.length > 0 ? (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Galería de imágenes</Text>
                <Text style={styles.sectionHint}>{moreImages.length} imagen(es)</Text>
              </View>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={moreImages}
                keyExtractor={(item, index) => `${item}-${index}`}
                renderItem={({ item }) => (
                  <ImageExpo
                    source={{ uri: item }}
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: 10,
                      marginRight: 10,
                    }}
                    contentFit="cover"
                  />
                )}
              />
            </View>
          ) : null}

          <View style={styles.submitWrap}>
            <Button
              title="Guardar cambios"
              buttonStyle={styles.submitBtn}
              titleStyle={styles.submitBtnTitle}
              onPress={() => formik.handleSubmit()}
              loading={submitting}
              disabled={submitting}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const EquipmentEventEdit = connect(null)(EquipmentEventEditRaw);
export default EquipmentEventEdit;
