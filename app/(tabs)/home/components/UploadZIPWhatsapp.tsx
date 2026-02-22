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
    projectId: string,
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
}

const UploadZIPWhatsapp = ({ isVisible, onClose }: UploadZIPWhatsappProps) => {
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

        // Verificar tamaño del archivo (500MB = 524288000 bytes)
        if (file.size && file.size > 524288000) {
          Toast.show({
            type: "error",
            text1: "Archivo muy grande",
            text2: "El archivo no puede exceder 500MB",
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
      console.log("=== 🚀 INICIANDO UPLOAD (4 PASOS) ===");
      console.log("📁 Archivo seleccionado:", {
        name: selectedFile.name,
        size: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`,
        type: selectedFile.type,
        hasFile: !!selectedFile.file,
        hasUri: !!selectedFile.uri,
      });

      const API_BASE_URL =
        "https://whatsapp-analyzer-api-mamncpt54a-uc.a.run.app";

      console.log("🌐 API Base URL:", API_BASE_URL);
      console.log("⏰ Timestamp:", new Date().toISOString());

      // Paso 1 y 2: Timeout de 5 minutos
      const controller = new AbortController();
      let timeoutId = setTimeout(
        () => {
          console.log(
            "TIMEOUT: Abortando petición después de 5 minutos (Pasos 1-2)",
          );
          controller.abort();
        },
        5 * 60 * 1000,
      );

      // ====== PASO 1: Obtener URL firmada ======
      console.log("\n=== 📝 PASO 1/4: Obteniendo URL firmada ===");
      setProgress(10);
      setCurrentStage("🔐 Obteniendo URL de subida...");
      setEstimatedTimeLeft("~3 minutos");

      const step1Payload = {
        filename: selectedFile.name,
        content_type: "application/zip",
      };
      console.log("Payload Paso 1:", step1Payload);

      const step1Response = await fetch(`${API_BASE_URL}/get-upload-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(step1Payload),
        signal: controller.signal,
      });

      console.log("✓ Respuesta Paso 1:", {
        status: step1Response.status,
        ok: step1Response.ok,
      });

      if (!step1Response.ok) {
        const errorText = await step1Response.text();
        console.error("❌ Error en Paso 1:", errorText);
        throw new Error(
          `Error obteniendo URL firmada: ${step1Response.status} - ${errorText}`,
        );
      }

      const { upload_url, file_id, expires_in_minutes } =
        await step1Response.json();
      console.log("URL firmada obtenida:", { file_id, expires_in_minutes });

      // Validar que recibimos los datos necesarios
      if (!upload_url || !file_id) {
        throw new Error(
          `Respuesta incompleta del servidor. upload_url: ${!!upload_url}, file_id: ${!!file_id}`,
        );
      }

      console.log("upload_url válida:", upload_url.substring(0, 50) + "...");
      console.log("file_id:", file_id);

      // ====== PASO 2: Subir archivo a Cloud Storage ======
      console.log("\n=== 📤 PASO 2/4: Subiendo a Cloud Storage ===");
      setProgress(20);
      setCurrentStage(
        `📤 Subiendo ${(selectedFile.size / 1024 / 1024).toFixed(1)} MB...`,
      );
      setEstimatedTimeLeft("~2 minutos");

      // Obtener el archivo como blob
      let fileBlob: Blob;
      if (Platform.OS === "web") {
        if (!selectedFile.file) {
          throw new Error("No se pudo obtener el archivo para web");
        }
        fileBlob = selectedFile.file;
        console.log("📱 Plataforma: WEB");
      } else {
        // Para móvil, convertir URI a blob
        const response = await fetch(selectedFile.uri);
        fileBlob = await response.blob();
        console.log("📱 Plataforma: MOBILE");
      }

      console.log("Blob creado:", {
        size: `${(fileBlob.size / 1024 / 1024).toFixed(2)} MB`,
        type: fileBlob.type,
      });
      console.log("Subiendo a URL firmada...");

      const uploadStartTime = Date.now();
      const step2Response = await fetch(upload_url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/zip",
        },
        body: fileBlob,
        signal: controller.signal,
      });
      const uploadEndTime = Date.now();

      console.log(
        `⏱️ Upload completado en ${((uploadEndTime - uploadStartTime) / 1000).toFixed(1)}s`,
      );
      console.log("✓ Respuesta Paso 2:", {
        status: step2Response.status,
        ok: step2Response.ok,
      });

      if (!step2Response.ok) {
        const errorText = await step2Response.text();
        console.error("❌ Error en Paso 2:", errorText);
        throw new Error(
          `Error subiendo archivo: ${step2Response.status} - ${errorText}`,
        );
      }

      console.log("✅ Archivo subido exitosamente a Cloud Storage");
      console.log("🔑 file_id para proceso:", file_id);
      setProgress(50);
      setCurrentStage("✅ Archivo subido, procesando...");
      setEstimatedTimeLeft("~1 minuto");

      // Pequeña pausa para asegurar que Cloud Storage procesó el archivo
      console.log("⏸️ Esperando 2 segundos antes de procesar...");
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // ====== PASO 3: Procesar archivo y obtener PDF ======
      console.log("\n=== 🔄 PASO 3/4: Procesando y generando PDF ===");
      console.log(
        "⚠️ Este paso puede tomar hasta 5 minutos, por favor espere...",
      );

      // Cancelar timeout anterior y crear uno nuevo más largo para el procesamiento
      clearTimeout(timeoutId);
      console.log("✓ Timeout anterior cancelado");

      const step3Controller = new AbortController();
      const step3TimeoutId = setTimeout(
        () => {
          console.log("TIMEOUT: Abortando procesamiento después de 15 minutos");
          step3Controller.abort();
        },
        15 * 60 * 1000, // 15 minutos para el procesamiento del PDF
      );
      console.log("✓ Nuevo timeout configurado: 15 minutos");

      setProgress(60);
      setCurrentStage("🔄 Generando informe PDF...");
      setEstimatedTimeLeft("2-5 minutos (procesando imágenes)");

      const step3Payload = {
        file_id: file_id,
        filename: selectedFile.name,
      };

      console.log("📦 Payload:", JSON.stringify(step3Payload, null, 2));
      console.log("🌐 Endpoint:", `${API_BASE_URL}/process-uploaded-file`);
      console.log("🔌 Iniciando petición de procesamiento...");
      console.log("🔌 Iniciando petición de procesamiento... ver2");

      const fetchStartTime = Date.now();

      const step3Response = await fetch(
        `${API_BASE_URL}/process-uploaded-file`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(step3Payload),
          signal: step3Controller.signal,
        },
      );

      const fetchEndTime = Date.now();
      const durationSeconds = (fetchEndTime - fetchStartTime) / 1000;
      console.log(
        `⏱️ Procesamiento completado en ${durationSeconds.toFixed(1)}s (${(durationSeconds / 60).toFixed(1)} min)`,
      );

      // Limpiar timeout del paso 3
      clearTimeout(step3TimeoutId);

      console.log(
        "🔍 Verificando Content-Type:",
        step3Response.headers.get("content-type"),
      );
      console.log("🔍 Status:", step3Response.status);

      if (step3Response.ok) {
        // Recibir JSON con download_url (NO blob directo)
        console.log("📦 Parseando respuesta como JSON...");
        const result = await step3Response.json();
        console.log("✅ JSON parseado:", result);
        console.log("✅ Respuesta del servidor:", {
          filename: result.filename,
          file_size_mb: result.file_size_mb,
          expires_in_minutes: result.expires_in_minutes,
          has_download_url: !!result.download_url,
          download_url_preview: result.download_url
            ? result.download_url.substring(0, 80) + "..."
            : "N/A",
        });

        if (!result.download_url) {
          throw new Error("El servidor no devolvió la URL de descarga del PDF");
        }

        // ====== PASO 4: Descargar PDF desde Cloud Storage ======
        console.log("\n=== 📥 PASO 4/4: Descargando PDF ===");
        setProgress(90);
        setCurrentStage("📥 Descargando PDF...");
        setEstimatedTimeLeft("~10 segundos");

        console.log(`📊 Tamaño del PDF: ${result.file_size_mb} MB`);
        console.log("🔗 Descargando desde URL firmada...");
        console.log("🌐 URL completa:", result.download_url);

        const pdfDownloadStart = Date.now();
        const pdfResponse = await fetch(result.download_url);
        const pdfDownloadEnd = Date.now();

        console.log(
          `⏱️ Descarga completada en ${((pdfDownloadEnd - pdfDownloadStart) / 1000).toFixed(1)}s`,
        );
        console.log("📋 Headers de descarga:", {
          "content-type": pdfResponse.headers.get("content-type"),
          "content-length": pdfResponse.headers.get("content-length"),
          status: pdfResponse.status,
        });

        if (!pdfResponse.ok) {
          throw new Error(
            `Error descargando PDF: ${pdfResponse.status} ${pdfResponse.statusText}`,
          );
        }

        console.log("🔄 Convirtiendo a blob...");
        const pdfBlob = await pdfResponse.blob();
        console.log("✅ PDF descargado:", {
          size: `${(pdfBlob.size / 1024 / 1024).toFixed(2)} MB`,
          sizeBytes: pdfBlob.size,
          type: pdfBlob.type,
        });

        // Validar que el blob tenga contenido
        if (pdfBlob.size === 0) {
          throw new Error("El PDF descargado está vacío");
        }

        if (Platform.OS === "web") {
          // Descargar el PDF automáticamente
          const url = window.URL.createObjectURL(pdfBlob);
          const link = document.createElement("a");
          link.href = url;
          link.download =
            result.filename || `informe-whatsapp-${Date.now()}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          console.log("💾 PDF descargado automáticamente");
        } else {
          // TODO: Implementar descarga para móvil usando FileSystem
          console.log("📱 Descarga móvil pendiente de implementar");
        }

        setProgress(100);
        setCurrentStage("✅ Reporte descargado");
        setEstimatedTimeLeft("Completado");

        console.log("🎉 Proceso completado exitosamente\n");

        Toast.show({
          type: "success",
          text1: "Reporte generado exitosamente",
          text2: `PDF de ${result.file_size_mb} MB descargado`,
        });

        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        // Error del servidor
        const contentType = step3Response.headers.get("content-type");
        let errorMessage = step3Response.statusText;

        try {
          if (contentType?.includes("application/json")) {
            const errorData = await step3Response.json();
            errorMessage = errorData.detail || errorMessage;
          } else {
            errorMessage = await step3Response.text();
          }
        } catch {
          // Si no se puede leer el error, usar statusText
        }

        throw new Error(
          `Error del servidor (${step3Response.status}): ${errorMessage}`,
        );
      }
    } catch (error) {
      console.error("\n❌ === ERROR EN PROCESO DE UPLOAD ===");
      console.error("Error completo:", error);
      console.error(
        "Tipo de error:",
        error instanceof Error ? error.constructor.name : typeof error,
      );

      let errorMessage = "Error desconocido";
      let errorTitle = "Error al generar reporte";

      if (error instanceof Error) {
        console.error("Error.name:", error.name);
        console.error("Error.message:", error.message);

        if (error.name === "AbortError") {
          errorMessage =
            "La operación excedió el tiempo límite (15 minutos máximo para procesamiento)";
          errorTitle = "Tiempo agotado";
        } else if (error.message.includes("No se pudo conectar")) {
          errorMessage = "El servidor no está disponible. Intente más tarde.";
          errorTitle = "Error de conexión";
        } else if (error.message.includes("Error del servidor")) {
          // Extraer el detalle del error si existe
          const match = error.message.match(/Error del servidor \(\d+\): (.+)/);
          errorMessage = match ? match[1] : error.message;
          errorTitle = "Error del servidor";
        } else {
          errorMessage = error.message;
        }
      }

      console.error(`🔴 ${errorTitle}: ${errorMessage}\n`);

      Toast.show({
        type: "error",
        text1: errorTitle,
        text2: errorMessage,
        visibilityTime: 8000,
        position: "top",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Limpiar estados cuando no está cargando
  useEffect(() => {
    if (!isLoading) {
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
                Seleccione un archivo ZIP (máximo 500MB) para generar el reporte
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
                        Archivos ZIP de hasta 500MB
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
