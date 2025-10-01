import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import Toast from "react-native-toast-message";

interface UploadZIPWhatsappProps {
  isVisible: boolean;
  onClose: () => void;
  onUploadFile?: (
    projectName: string,
    projectType: string,
    file: any,
    projectId: string
  ) => Promise<void>;
}

// Componente de progreso personalizado
const ProgressIndicator = ({
  progress,
  currentStage,
  estimatedTimeLeft,
}: {
  progress: number;
  currentStage: string;
  estimatedTimeLeft: string;
}) => (
  <View style={styles.progressContainer}>
    <View style={styles.progressHeader}>
      <Text style={styles.progressTitle}>Generando Reporte Automático</Text>
      <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
    </View>

    {/* Barra de progreso */}
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { width: `${progress}%` }]} />
    </View>

    {/* Información del proceso */}
    <View style={styles.progressInfo}>
      <Text style={styles.currentStage}>{currentStage}</Text>
      <Text style={styles.timeEstimate}>
        Tiempo estimado restante: {estimatedTimeLeft}
      </Text>
    </View>

    {/* Indicador visual animado */}
    <View style={styles.processingIndicator}>
      <View style={styles.dot} />
      <View style={[styles.dot, styles.dotDelay1]} />
      <View style={[styles.dot, styles.dotDelay2]} />
    </View>

    {/* Mensaje motivacional */}
    <Text style={styles.motivationalText}>
      📊 Analizando datos y generando insights...
    </Text>
  </View>
);

interface UploadZIPWhatsappProps {
  isVisible: boolean;
  onClose: () => void;
  onUploadFile?: (
    projectName: string,
    projectType: string,
    file: any,
    projectId: string
  ) => Promise<void>;
}

const UploadZIPWhatsapp = ({
  isVisible,
  onClose,
  onUploadFile,
}: UploadZIPWhatsappProps) => {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState("");
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState("");

  const resetForm = () => {
    setSelectedFile(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/zip",
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];

        // Verificar tamaño del archivo (400MB = 419430400 bytes)
        if (file.size && file.size > 419430400) {
          Toast.show({
            type: "error",
            text1: "Archivo muy grande",
            text2: "El archivo no puede exceder 400MB",
          });
          return;
        }

        setSelectedFile(file);
        Toast.show({
          type: "success",
          text1: "Archivo seleccionado",
          text2: `${file.name} (${(file.size! / 1024 / 1024).toFixed(2)} MB)`,
        });
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
    if (!selectedFile) {
      Toast.show({
        type: "error",
        text1: "Por favor seleccione un archivo ZIP",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("=== INICIANDO UPLOAD ===");
      console.log("Archivo seleccionado:", {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        uri: selectedFile.uri,
      });

      const formData = new FormData();

      if (Platform.OS === "web") {
        // Para web, usar el archivo directamente
        console.log("Plataforma WEB - usando selectedFile.file");
        console.log("Archivo web:", selectedFile.file);

        // Verificar que el archivo sea válido
        if (!selectedFile.file) {
          throw new Error("No se pudo obtener el archivo para web");
        }

        formData.append("file", selectedFile.file, selectedFile.name);
      } else {
        // Para móvil, usar la URI
        console.log("Plataforma MÓVIL - usando URI");
        formData.append("file", {
          uri: selectedFile.uri,
          type: "application/zip",
          name: selectedFile.name || "archivo.zip",
        } as any);
      }

      // Debug: Log del archivo que se está enviando
      console.log("FormData creado, enviando archivo:", {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type || "application/zip",
      });

      // Crear AbortController para timeout personalizado
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log("TIMEOUT: Abortando petición después de 10 minutos");
        controller.abort();
      }, 10 * 60 * 1000); // 10 minutos timeout

      console.log("Enviando petición a API...");
      const startTime = Date.now();

      const response = await fetch(
        "https://api.minetrack.site/crear-informe-final",
        {
          method: "POST",
          body: formData,
          signal: controller.signal,
          // NO establecer Content-Type header - let browser set it automatically with boundary
        }
      );

      // Limpiar timeout si la petición completó
      clearTimeout(timeoutId);
      const endTime = Date.now();
      console.log(
        `Petición completada en ${(endTime - startTime) / 1000} segundos`
      );

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (response.ok) {
        // Completar progreso al 100%
        setProgress(100);
        setCurrentStage("✅ Descargando reporte...");
        setEstimatedTimeLeft("Finalizando...");

        // Obtener el PDF como blob
        const pdfBlob = await response.blob();

        if (Platform.OS === "web") {
          // Para web, crear URL para descargar el PDF
          const url = window.URL.createObjectURL(pdfBlob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `informe-final-${Date.now()}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }

        Toast.show({
          type: "success",
          text1: "Reporte generado exitosamente",
          text2: "El PDF se ha descargado automáticamente",
        });

        // Esperar un poco para mostrar el progreso completo
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        // Obtener más información del error
        const errorText = await response.text();
        console.error("Error response body:", errorText);
        throw new Error(
          `Error del servidor: ${response.status} - ${errorText}`
        );
      }
    } catch (error) {
      console.error("Error al generar reporte:", error);

      let errorMessage = "Error desconocido";
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          errorMessage = "La operación excedió el tiempo límite (10 minutos)";
        } else {
          errorMessage = error.message;
        }
      }

      Toast.show({
        type: "error",
        text1: "Error al generar reporte",
        text2: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Simulador de progreso
  useEffect(() => {
    if (isLoading) {
      const stages = [
        { name: "📤 Subiendo archivo...", duration: 15 },
        { name: "🔍 Analizando contenido...", duration: 45 },
        { name: "📊 Procesando datos...", duration: 60 },
        { name: "📈 Generando gráficos...", duration: 40 },
        { name: "📝 Creando reporte...", duration: 20 },
      ];

      let totalTime = 0;
      let currentTime = 0;

      stages.forEach((stage) => (totalTime += stage.duration));

      const updateProgress = () => {
        let accumulatedTime = 0;

        for (let i = 0; i < stages.length; i++) {
          const stage = stages[i];

          if (
            currentTime >= accumulatedTime &&
            currentTime < accumulatedTime + stage.duration
          ) {
            setCurrentStage(stage.name);
            const stageProgress =
              ((currentTime - accumulatedTime) / stage.duration) * 100;
            const totalProgress =
              ((accumulatedTime + (currentTime - accumulatedTime)) /
                totalTime) *
              100;
            setProgress(Math.min(totalProgress, 95)); // Never reach 100% until actually done

            const remaining = totalTime - currentTime;
            const minutes = Math.floor(remaining / 60);
            const seconds = Math.floor(remaining % 60);
            setEstimatedTimeLeft(
              `${minutes}:${seconds.toString().padStart(2, "0")}`
            );

            break;
          }
          accumulatedTime += stage.duration;
        }

        currentTime += 1;
      };

      const interval = setInterval(updateProgress, 1000);

      return () => clearInterval(interval);
    } else {
      setProgress(0);
      setCurrentStage("");
      setEstimatedTimeLeft("");
    }
  }, [isLoading]);

  // Check if we're on web platform to use appropriate styling
  const isWeb = Platform.OS === "web";

  if (isLoading) {
    return (
      <Modal
        visible={isVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {}} // Disable closing during loading
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContainer, isWeb && styles.webModalContainer]}
          >
            <ProgressIndicator
              progress={progress}
              currentStage={currentStage}
              estimatedTimeLeft={estimatedTimeLeft}
            />
          </View>
        </View>
      </Modal>
    );
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
              <Text style={styles.modalTitle}>Generar Reporte Automático</Text>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.description}>
                Seleccione un archivo ZIP (máximo 400MB) para generar el reporte
                automático en PDF.
              </Text>

              <Text style={styles.inputLabel}>Archivo ZIP</Text>
              <View style={styles.fileUploadContainer}>
                <TouchableOpacity
                  style={[
                    styles.filePickerButton,
                    selectedFile && styles.filePickerButtonSelected,
                  ]}
                  onPress={pickDocument}
                >
                  <View style={styles.filePickerIconContainer}>
                    <Text style={styles.filePickerIcon}>📁</Text>
                  </View>
                  <View style={styles.filePickerTextContainer}>
                    <Text
                      style={[
                        styles.filePickerText,
                        selectedFile && styles.filePickerTextSelected,
                      ]}
                    >
                      {selectedFile
                        ? "Archivo seleccionado"
                        : "Seleccionar archivo ZIP"}
                    </Text>
                    {selectedFile && (
                      <Text style={styles.fileName}>{selectedFile.name}</Text>
                    )}
                    {selectedFile && selectedFile.size && (
                      <Text style={styles.fileSize}>
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </Text>
                    )}
                    {!selectedFile && (
                      <Text style={styles.fileHint}>
                        Archivos ZIP de hasta 400MB
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>📋 Proceso Automático</Text>
                <Text style={styles.infoText}>
                  • El archivo ZIP será procesado automáticamente
                </Text>
                <Text style={styles.infoText}>
                  • Se generará un reporte en formato PDF
                </Text>
                <Text style={styles.infoText}>
                  • La descarga comenzará automáticamente al completarse
                </Text>
                <Text style={styles.infoText}>
                  • El proceso puede tomar varios minutos dependiendo del tamaño
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.modalFooter,
                Platform.OS !== "web" && styles.modalFooterMobile, // Aplica estilo móvil
              ]}
            >
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
                disabled={isLoading}
              >
                <Text
                  style={[
                    styles.cancelButtonText,
                    Platform.OS !== "web" && styles.modalFooterMobile,
                  ]}
                >
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!selectedFile || isLoading) && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!selectedFile || isLoading}
              >
                <Text
                  style={[
                    styles.submitButtonText,
                    (!selectedFile || isLoading) &&
                      styles.submitButtonTextDisabled,
                  ]}
                >
                  {isLoading ? "Generando..." : "Generar Reporte"}
                </Text>
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
    borderRadius: 12,
    width: "90%",
    maxHeight: "90%",
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  webModalContainer: {
    width: "90%",
    maxWidth: 500,
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
    borderBottomColor: "#f0f0f0",
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2A3B76",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    color: "#666",
  },
  modalBody: {
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
    lineHeight: 22,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 12,
    color: "#333",
    fontWeight: "600",
  },
  fileUploadContainer: {
    marginBottom: 20,
  },
  filePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 24,
    backgroundColor: "#fafafa",
  },
  filePickerButtonSelected: {
    borderColor: "#25D366",
    backgroundColor: "#f8fff8",
  },
  filePickerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#25D366",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  filePickerIcon: {
    fontSize: 20,
    color: "white",
  },
  filePickerTextContainer: {
    flex: 1,
  },
  filePickerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  filePickerTextSelected: {
    color: "#25D366",
  },
  fileName: {
    fontSize: 14,
    color: "#333",
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: "#888",
  },
  fileHint: {
    fontSize: 12,
    color: "#888",
  },
  infoContainer: {
    backgroundColor: "#f8fff8",
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#25D366",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#25D366",
  },
  infoText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
    lineHeight: 18,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "600",
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: "#25D366",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 2,
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "600",
    textAlign: "center",
  },
  submitButtonTextDisabled: {
    color: "#999",
  },
  // Estilos para el componente de progreso
  progressContainer: {
    padding: 32,
    alignItems: "center",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 24,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2A3B76",
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: "700",
    color: "#25D366",
  },
  progressBarContainer: {
    width: "100%",
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    marginBottom: 24,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#25D366",
    borderRadius: 4,
  },
  progressInfo: {
    alignItems: "center",
    marginBottom: 24,
  },
  currentStage: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  timeEstimate: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  processingIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#25D366",
    marginHorizontal: 4,
    opacity: 0.3,
  },
  dotDelay1: {
    opacity: 0.6,
  },
  dotDelay2: {
    opacity: 1,
  },
  motivationalText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    lineHeight: 22,
    fontStyle: "italic",
  },
  modalFooterMobile: {
    flexDirection: "column",
    gap: 8,
    justifyContent: "center",
    alignItems: "stretch",
    marginTop: 8,
  },
});

export default UploadZIPWhatsapp;
