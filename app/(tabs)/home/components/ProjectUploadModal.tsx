import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import Toast from "react-native-toast-message";
import { db } from "@/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

interface ProjectUploadModalProps {
  isVisible: boolean;
  onClose: () => void;
  onUploadFile: (
    projectName: string,
    projectType: string,
    file: any,
    projectId: string
  ) => Promise<void>;
}

const ProjectUploadModal = ({
  isVisible,
  onClose,
  onUploadFile,
}: ProjectUploadModalProps) => {
  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState("Parada de Planta");
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const projectTypes = [
    "Parada de Planta",
    "Mantenimiento Programado",
    "Mantenimiento Correctivo",
    "Optimización",
    "Otro",
  ];

  const resetForm = () => {
    setProjectName("");
    setProjectType("Parada de Planta");
    setSelectedFile(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "text/comma-separated-values",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/xml",
        ],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Toast.show({
        type: "error",
        text1: "Error al seleccionar el archivo",
      });
    }
  };

  const handleSubmit = async () => {
    if (!projectName.trim()) {
      Toast.show({
        type: "error",
        text1: "Por favor ingrese un nombre de proyecto",
      });
      return;
    }
    if (!selectedFile) {
      Toast.show({
        type: "error",
        text1: "Por favor seleccione un archivo",
      });
      return;
    }
    console.log("3333 este el primer paso");

    setIsLoading(true);

    // Variable para almacenar el ID del proyecto (solo se crea si pasa validación)
    let newProjectDocId: string | null = null;

    try {
      //-------------------------------------------------------------------

      // 1. PRIMERO: Crear proyecto en Firebase
      const proyectosRef = collection(db, "proyectos");
      const newProjectDoc = await addDoc(proyectosRef, {
        projectName,
        projectType,
        createdAt: new Date().toISOString(),
      });

      // Guardar el ID para posible limpieza
      newProjectDocId = newProjectDoc.id;

      // Add the document ID to the document fields
      await updateDoc(newProjectDoc, {
        id: newProjectDoc.id,
      });

      // 2. DESPUÉS: Validar y procesar el archivo (esto lanzará error si hay problemas)
      await onUploadFile(
        projectName,
        projectType,
        selectedFile,
        newProjectDoc.id
      );

      // ✅ Solo cerrar modal y mostrar éxito si no hubo errores
      handleClose();
      Toast.show({
        type: "success",
        text1: "Proyecto creado correctamente",
      });
    } catch (error) {
      console.error("Error uploading file:", error);

      // 🧹 LIMPIEZA: Si se creó el proyecto pero falló la validación, eliminarlo
      if (newProjectDocId) {
        try {
          await deleteDoc(doc(db, "proyectos", newProjectDocId));
          console.log(
            `🗑️ Proyecto ${newProjectDocId} eliminado debido a error de validación`
          );
        } catch (deleteError) {
          console.error("Error al eliminar proyecto fallido:", deleteError);
        }
      }

      // El Toast ya fue mostrado en handleProjectFileUpload si fue error de validación
      // Solo mostrar Toast genérico si es otro tipo de error
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";

      if (!errorMessage.includes("Validación fallida")) {
        Toast.show({
          type: "error",
          text1: "Error al cargar el archivo",
          text2: errorMessage,
        });
      }

      // No cerrar el modal para que el usuario pueda corregir el archivo
    } finally {
      setIsLoading(false);
    }
  };

  // Check if we're on web platform to use appropriate styling
  const isWeb = Platform.OS === "web";

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[styles.modalContainer, isWeb && styles.webModalContainer]}
        >
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Crear Proyecto Global</Text>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Nombre del Proyecto</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Antapaccay - Parada de Planta - Chancado Primario - 12/07/2025"
                placeholderTextColor={"#888"}
                value={projectName}
                onChangeText={setProjectName}
              />

              <Text style={styles.inputLabel}>Tipo de Proyecto</Text>
              <View style={styles.projectTypeContainer}>
                {projectTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.projectTypeButton,
                      projectType === type && styles.projectTypeButtonSelected,
                    ]}
                    onPress={() => setProjectType(type)}
                  >
                    <Text
                      style={[
                        styles.projectTypeText,
                        projectType === type && styles.projectTypeTextSelected,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Archivo del Proyecto</Text>
              <View style={styles.fileUploadContainer}>
                <TouchableOpacity
                  style={styles.filePickerButton}
                  onPress={pickDocument}
                >
                  <Image
                    source={require("../../../../assets/pictures/projectlogo.png")}
                    style={styles.filePickerIcon}
                  />
                  <Text style={styles.filePickerText}>
                    {selectedFile
                      ? selectedFile.name
                      : "Seleccionar archivo (CSV, Excel, MS Project)"}
                  </Text>
                </TouchableOpacity>
                {selectedFile && (
                  <Text style={styles.fileInfo}>
                    {`Archivo: ${selectedFile.name} (${
                      (selectedFile.size / 1024).toFixed(2) + " KB"
                    })`}
                  </Text>
                )}
              </View>

              <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>Información Importante</Text>
                <Text style={styles.infoText}>
                  • Los archivos CSV deben tener encabezados específicos
                  (Codigo, NombreServicio, FechaInicio, etc.)
                </Text>
                <Text style={styles.infoText}>
                  • Para archivos de MS Project, asegúrese de exportarlos en
                  formato CSV con la estructura adecuada
                </Text>
                <Text style={styles.infoText}>
                  • Las actividades de nivel 4 y 5 serán importadas
                  automáticamente
                </Text>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>Crear Proyecto</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    width: "90%",
    maxHeight: "90%",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  webModalContainer: {
    width: "90%",
    maxWidth: 600,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#28A745",
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: "#666",
  },
  modalBody: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 5,
    color: "#555",
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 14,
  },
  projectTypeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  projectTypeButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  projectTypeButtonSelected: {
    backgroundColor: "#28A745",
    borderColor: "#28A745",
  },
  projectTypeText: {
    fontSize: 13,
    color: "#555",
  },
  projectTypeTextSelected: {
    color: "white",
  },
  fileUploadContainer: {
    marginBottom: 15,
  },
  filePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#2A3B76",
    borderRadius: 5,
    padding: 15,
    backgroundColor: "#f5f8ff",
  },
  filePickerIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  filePickerText: {
    color: "#2A3B76",
  },
  fileInfo: {
    marginTop: 5,
    fontSize: 12,
    color: "#666",
  },
  infoContainer: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#555",
  },
  infoText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    marginRight: 10,
  },
  cancelButtonText: {
    color: "#666",
  },
  submitButton: {
    backgroundColor: "#28A745",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default ProjectUploadModal;
