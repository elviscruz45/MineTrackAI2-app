import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Platform,
  useWindowDimensions,
} from "react-native";
// Importar estilos CSS para gradientes y efectos web
import "./mobile-styles.css";
import { connect } from "react-redux";
import { useRouter } from "expo-router";
import { saveTotalEventServiceAITList } from "../../../redux/actions/home";
import { resetPostPerPageHome } from "../../../redux/actions/home";
import { saveApprovalListnew } from "../../../redux/actions/search";
import { updateAITServicesDATA } from "../../../redux/actions/home";
import { subscribeEventsByProject } from "@/lib/db/events";
import { subscribeApprovalsByEmail } from "@/lib/db/approvals";
import { createServicioAit } from "@/lib/db/serviciosAit";
import {
  enqueueEmbeddingJobs,
  triggerProcessEmbeddings,
} from "@/lib/db/embeddingJobs";
import { processEmbeddingQueueClient } from "@/lib/rag/embeddingQueue";
import type { ProjectServicePayload } from "@/lib/rag/indexProjectEmbeddings";
import { runWithConcurrency } from "@/lib/utils/runWithConcurrency";
import { mineraCorreosList } from "@/utils/MineraList";
import { areaLists } from "@/utils/areaList";
import Toast from "react-native-toast-message";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import HeaderScreen from "./components/HeaderScreen/HeaderScreen";
import styles from "./_styles/index.styles";
import { Image as ImageExpo } from "expo-image";
import { Icon } from "@rneui/themed";
import { MaterialIcon } from "@/components/MaterialIcon";
import { FeatherIcon } from "@/components/FeatherIcon";
import { SafeAreaView } from "react-native-safe-area-context";
import ProjectFilterModal from "./components/ProjectFilterModal";
import ProjectUploadModal from "./components/ProjectUploadModal";
import UploadZIPWhatsapp from "./components/UploadZIPWhatsapp";
import * as FileSystem from "expo-file-system";
import Papa from "papaparse";
import { useFormik } from "formik";
import { initialValues, validationSchema } from "./index.data";
import { GoogleGenAI } from "@google/genai"; // Uncomment after installing: npm install @google/genai
import * as XLSX from "xlsx";
import { supabase } from "@/lib/supabase";
import { tagEquipoList } from "@/utils/tagEquipoList";
import { isRutaCritica } from "@/utils/isRutaCritica";
import HomeWebToolbar from "./components/HomeWebToolbar";
import HomeWelcomeView from "./components/HomeWelcomeView";
import { createHomeWebStyles } from "./homeWebStyles";

interface CSVRow {
  Codigo: string;
  NombreServicio: string;
  FechaInicio: string;
  FechaFin?: string;
  OrdenCompra?: string;
  SupervisorMina?: string;
  SupervisorEECC?: string;
  parentCode?: string;
  EmpresaMinera?: string;
  TipoServicio?: string;
  NumeroCotizacion?: string;
  Moneda?: string;
  Monto?: string;
  NumeroSupervisorSeguridad?: string;
  NumeroSupervisor?: string;
  NumeroTecnicos?: string;
  NumeroLider?: string;
  NumeroSoldador?: string;
  HorasTotales?: any;
  TagEquipo?: string;
  AreaServicio?: string;
  esRutaCritica?: string;
}

const LEVEL4_REQUIRED_FIELDS = [
  "Codigo",
  "NombreServicio",
  "FechaInicio",
  "FechaFin",
  "HorasTotales",
  "SupervisorMina",
  "SupervisorEECC",
  "OrdenCompra",
  "EmpresaMinera",
  "TipoServicio",
  "AreaServicio",
  "esRutaCritica",
  "TagEquipo",
  "NumeroCotizacion",
  "Moneda",
  "Monto",
  "NumeroSupervisorSeguridad",
  "NumeroSupervisor",
  "NumeroTecnicos",
  "NumeroLider",
  "NumeroSoldador",
] as const;

const isLevel4Codigo = (codigo: unknown): boolean =>
  String(codigo || "")
    .trim()
    .split(".")
    .filter(Boolean).length === 4;

const isUploadFieldEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (value instanceof Date) return isNaN(value.getTime());
  if (typeof value === "number") return isNaN(value);
  if (typeof value === "string") return value.trim() === "";
  return false;
};

// Mock data for projects
const AVAILABLE_PROJECTS = [
  "CHANCADO PRIMARIO",
  "CHANCADO SECUNDARIO",
  "MOLIENDA",
  "FLOTACIÓN",
  "ESPESADORES",
  "FILTRADO",
  "CHANCADO TERCIARIO",
  "SISTEMA DE FAJAS",
  "ALMACENAMIENTO DE CONCENTRADO",
  "PLANTA DE CAL",
  "SISTEMA DE BOMBEO",
];

function HomeScreenRaw(props: any) {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const { styles: uiStyles, numColumns } = useMemo(
    () => createHomeWebStyles(windowWidth),
    [windowWidth],
  );
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [selectedProject, setSelectedProject] = useState<any>(null);
  // const [selectedCompany, setSelectedCompany] = useState("Antapaccay");
  const [selectedCompany, setSelectedCompany] = useState("");

  const [selectedType, setSelectedType] = useState("Parada de Planta");
  const [selectedDate, setSelectedDate] = useState("14/07/2025");
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [idproyecto, setIdProyecto] = useState("");

  // upload zip whatsapp
  const [showZIPwhatsappModal, setShowZIPwhatsappModal] = useState(false);
  const [tagValidationError, setTagValidationError] = useState<{
    rows: { rowNum: number; codigo: string; tagFound: string }[];
  } | null>(null);

  // const navigation = useNavigation();
  //Data about the company belong this event
  function capitalizeFirstLetter(str: string) {
    return str?.charAt(0).toUpperCase() + str?.slice(1);
  }
  const regex = /@(.+?)\./i;
  // this useEffect is used to retrive all data from firebase
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (props.email && idproyecto) {
      const companyName =
        capitalizeFirstLetter(props.email?.match(regex)?.[1]) || "Anonimo";

      unsubscribe = subscribeEventsByProject(
        idproyecto,
        (lista) => {
          setPosts(lista as never[]);
          setCompanyName(companyName);
          props.saveTotalEventServiceAITList(lista);
          setIsLoading(false);
        },
        undefined,
        20
      );
    }

    return () => {
      unsubscribe?.();
    };
  }, [props.email, idproyecto]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    if (props.email) {
      unsubscribe = subscribeApprovalsByEmail(props.email, (lista) => {
        props.saveApprovalListnew(lista);
      });
    }
    return () => {
      unsubscribe?.();
    };
  }, [props.email]);

  const formik = useFormik({
    initialValues: initialValues(),
    validationSchema: validationSchema(),
    validateOnChange: false,
    onSubmit: async (formValue) => {},
  });

  const handleProjectFileUpload = async (
    projectName: string,
    projectType: string,
    fileAsset: any,
    newProjectDocID: any,
    onProgress?: (message: string, current?: number, total?: number) => void
  ) => {
    try {
      setIsLoading(true);
      setTagValidationError(null);
      onProgress?.("Validando archivo…");

      let data: CSVRow[] = [];
      const webFile = fileAsset.file;
      const fileName = webFile?.name || fileAsset.name || "";
      const isExcel = fileName.endsWith(".xlsx") || fileName.endsWith(".xls");

      if (Platform.OS === "web") {
        const arrayBuffer = await new Promise<ArrayBuffer>(
          (resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) =>
              resolve(event.target?.result as ArrayBuffer);
            reader.onerror = (e) => reject(e);
            reader.readAsArrayBuffer(webFile);
          }
        );

        if (isExcel) {
          // 📊 Parse Excel con XLSX
          const workbook = XLSX.read(arrayBuffer, {
            type: "array",
            cellDates: true, // 🔥 Convierte seriales de fecha a objetos Date
            cellText: false,
            raw: false,
            dateNF: "dd/mm/yyyy", // Formato de fecha
          });

          // Obtener la primera hoja
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // Convertir a JSON con encoding UTF-8
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
            blankrows: false,
          });

          // Convertir array de arrays a array de objetos con headers
          const headers = jsonData[0] as string[];
          data = (jsonData.slice(1) as any[]).map((row: any[]) => {
            const obj: any = {};
            headers.forEach((header, index) => {
              // 🔥 FIX 1: Limpiar espacios iniciales y finales de strings
              const value = row[index];
              obj[header] =
                typeof value === "string" ? value.trim() : value || "";
            });
            return obj;
          });
        } else {
          // 📄 Parse CSV con PapaParse y UTF-8
          const decoder = new TextDecoder("utf-8");
          const fileContent = decoder.decode(arrayBuffer);

          const result = Papa.parse<CSVRow>(fileContent, {
            header: true,
            skipEmptyLines: true,
            transform: (value) => {
              // 🔥 FIX 1: Limpiar espacios iniciales y finales de strings
              return typeof value === "string" ? value.trim() : value;
            },
          });

          data = result.data;
        }
      } else {
        // Native: use FileSystem
        const fileUri = fileAsset.uri;
        const fileContent = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        const result = Papa.parse<CSVRow>(fileContent, {
          header: true,
          skipEmptyLines: true,
        });

        data = result.data;
      }

      // ✅ VALIDACIÓN nivel 4 (ej. 1.1.1.1): todos los campos obligatorios del paquete WBS
      const level4InvalidRows: {
        row: number;
        codigo: string;
        missing: string[];
      }[] = [];

      data.forEach((row, index) => {
        const rowData = row as any;
        const codigo = String(rowData.Codigo || "").trim();
        if (!isLevel4Codigo(codigo)) return;

        const missingFields = LEVEL4_REQUIRED_FIELDS.filter((field) =>
          isUploadFieldEmpty(rowData[field])
        );

        if (missingFields.length > 0) {
          level4InvalidRows.push({
            row: index + 2,
            codigo,
            missing: [...missingFields],
          });
        }
      });

      if (level4InvalidRows.length > 0) {
        setIsLoading(false);
        const first = level4InvalidRows[0];
        const firstRowMissing = first.missing.join(", ");

        console.error("❌ Validación fallida - Paquetes nivel 4 incompletos:");
        level4InvalidRows.forEach((item) => {
          console.error(
            `  Fila ${item.row} (Cód. ${item.codigo}): Faltan [${item.missing.join(", ")}]`
          );
        });

        Toast.show({
          type: "error",
          text1: "❌ Paquete WBS nivel 4 incompleto",
          text2: `Fila ${first.row} (Cód. ${first.codigo}): faltan "${firstRowMissing}". ${level4InvalidRows.length} paquete(s) nivel 4 con campos vacíos.`,
          visibilityTime: 9000,
        });

        throw new Error(
          `Validación fallida: Fila ${first.row} (Cód. ${first.codigo}) - Faltan campos nivel 4: ${firstRowMissing}. Total: ${level4InvalidRows.length} paquete(s)`
        );
      }

      // ✅ VALIDACIÓN TagEquipo: verificar que los tags sean de la lista conocida
      const validTagSet = new Set(tagEquipoList.map((t) => t.key));
      const csvTagErrors: { rowNum: number; codigo: string; tagFound: string }[] = [];
      data.forEach((row, index) => {
        const tag = ((row as any).TagEquipo || "").trim();
        if (tag && !validTagSet.has(tag)) {
          csvTagErrors.push({
            rowNum: index + 2,
            codigo: (row as any).Codigo || "",
            tagFound: tag,
          });
        }
      });
      if (csvTagErrors.length > 0) {
        setIsLoading(false);
        setTagValidationError({ rows: csvTagErrors });
        const uniqueTags = [...new Set(csvTagErrors.map((e) => e.tagFound))];
        const first = csvTagErrors[0];
        const tagsPreview = uniqueTags.slice(0, 4).join(", ");
        const tagsSuffix =
          uniqueTags.length > 4 ? ` (+${uniqueTags.length - 4} más)` : "";

        console.error("❌ Validación fallida - Tags no reconocidos:");
        csvTagErrors.forEach((item) => {
          console.error(
            `  Fila ${item.rowNum} (Cód. ${item.codigo}): TagEquipo "${item.tagFound}"`
          );
        });

        Toast.show({
          type: "error",
          text1: "❌ TagEquipo no válido",
          text2: `Fila ${first.rowNum} (Cód. ${first.codigo || "—"}): "${first.tagFound}" no está en la lista. ${csvTagErrors.length} fila(s) con error. Tags: ${tagsPreview}${tagsSuffix}`,
          visibilityTime: 9000,
        });

        throw new Error(
          `Validación fallida: ${csvTagErrors.length} fila(s) con TagEquipo inválido (${uniqueTags.join(", ")})`
        );
      }

      // 2️⃣ Filter activities
      const list4 = data?.filter((row) => row.Codigo?.split(".")?.length === 4);
      const list5 = data
        ?.filter((row) => row.Codigo?.split(".")?.length === 5)
        .map((row) => ({
          ...row,
          parentCode: row.Codigo?.split(".")?.slice(0, 4).join("."),
        }));

      // 3️⃣ Upload only new activities, referencing the new project

      // Parse Excel duration format "D/01/00 H:MM" → numeric hours
      // e.g. "0/01/00 11:00" → 11, "2/01/00 12:30" → 60.5
      const parseHorasTotales = (val: any): number => {
        if (!val) return 0;
        const str = String(val).trim();
        const parts = str.split(" ");
        if (parts.length < 2) return 0;
        const days = parseInt(parts[0].split("/")[0]) || 0;
        const timeParts = parts[1].split(":");
        const hours = parseInt(timeParts[0]) || 0;
        const mins  = parseInt(timeParts[1]) || 0;
        return days * 24 + hours + mins / 60;
      };

      //----------------------------------------------------------------------------------------------------------------------------
      const servicePayloads: {
        newData: Record<string, unknown>;
        embeddingPayload: ProjectServicePayload;
      }[] = [];

      for (const item of list4) {
        const {
          Codigo,
          NombreServicio,
          FechaInicio,
          FechaFin,
          SupervisorMina,
          SupervisorEECC,
          OrdenCompra,
          EmpresaMinera,
          TipoServicio,
          NumeroCotizacion,
          Moneda,
          Monto,
          NumeroSupervisorSeguridad,
          NumeroSupervisor,
          NumeroTecnicos,
          NumeroLider,
          NumeroSoldador,
          HorasTotales,
          TagEquipo,
          AreaServicio,
          esRutaCritica,
        } = item;
        // Parsear fechas como Date (Supabase)
        const fechaInicioDate = parseAnyDate(FechaInicio);
        const fechaFinDate = parseAnyDate(FechaFin);

        const filteredData =
          list5
            ?.filter((item: any) => item.parentCode === Codigo)
            .map((item: any) => {
              const fechaInicioDate = parseAnyDate(item.FechaInicio);
              const fechaFinDate = parseAnyDate(item.FechaFin);

              console.log(
                "fechaInicioDatefechaInicioDatefechaInicioDate",
                fechaInicioDate ?? new Date()
              );
              console.log(
                "fechaFinDatefechaFinDatefechaFinDatefechaFinDate",
                fechaFinDate ?? new Date()
              );
              return {
                ...item,
                FechaInicio: fechaInicioDate ?? null,
                FechaFin: fechaFinDate ?? null,
                HorasTotales: parseHorasTotales(item.HorasTotales),
                esRutaCritica: isRutaCritica(item.esRutaCritica),
                // Inherit from parent service if activity has no value
                TagEquipo: (item.TagEquipo || "").trim() || (TagEquipo || "").trim(),
                AreaServicio: (item.AreaServicio || "").trim() || (AreaServicio || "").trim(),
              };
            }) ?? [];

        const filterNamesActivities = filteredData.map(
          (item: any) => item.NombreServicio
        );

        // Create a new data object with all required fields
        const newData = {
          ...formik.values, // Include current form values
          Codigo: Codigo || `0.0.0.0`,
          NombreServicio: NombreServicio || projectName,
          NumeroAIT: OrdenCompra || `PROJ-${Date.now().toString().slice(-6)}`,
          EmpresaMinera: EmpresaMinera,
          Moneda: Moneda || "Soles",
          Monto: Monto || "0",
          SupervisorSeguridad: NumeroSupervisorSeguridad || "0",
          Supervisor: NumeroSupervisor || "0",
          Tecnicos: NumeroTecnicos || "0",
          Lider: NumeroLider || "0",
          Soldador: NumeroSoldador || "0",
          TipoServicio: TipoServicio || projectType,
          NumeroCotizacion: NumeroCotizacion,
          FechaInicio: fechaInicioDate ?? null,
          FechaFin: fechaFinDate ?? null,
          ResponsableEmpresaUsuario3: SupervisorMina,
          ResponsableEmpresaContratista3: SupervisorEECC,
          // Global project properties
          isGlobalProject: true,
          projectName: projectName,
          projectType: projectType,
          projectId: newProjectDocID, // Reference to the global project
          // Include all required fields from your formik onSubmit function
          emailPerfil: props.email || "Anonimo",
          nombrePerfil: props.firebase_user_name || "Anonimo",
          idServiciosAIT: `${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`,
          HorasTotales: parseHorasTotales(HorasTotales),
          TagEquipo: (TagEquipo || "").trim(),
          AreaServicio: AreaServicio || "",
          esRutaCritica: isRutaCritica(esRutaCritica),
          activities: filterNamesActivities,
          activitiesData: filteredData,
          createdAt: new Date(),
        };

        servicePayloads.push({
          newData,
          embeddingPayload: {
            serviceId: newData.idServiciosAIT,
            serviceData: {
              NombreServicio,
              Codigo,
              EmpresaMinera,
              TipoServicio,
              TagEquipo: (TagEquipo || "").trim(),
              AreaServicio: AreaServicio || "",
            },
            activitiesData: filteredData,
            projectId: newProjectDocID,
            projectName,
            projectType,
          },
        });
      }

      const totalServices = servicePayloads.length;
      onProgress?.("Guardando servicios…", 0, totalServices);
      let savedCount = 0;

      await runWithConcurrency(servicePayloads, 5, async ({ newData }) => {
        await createServicioAit(newData as any);
        savedCount += 1;
        onProgress?.(
          `Guardando ${savedCount}/${totalServices} servicios…`,
          savedCount,
          totalServices
        );
      });

      onProgress?.("Encolando indexación IA…");
      const embeddingServices = servicePayloads.map((p) => p.embeddingPayload);

      setIsLoading(false);

      Toast.show({
        type: "success",
        text1: "Proyecto cargado exitosamente",
        text2: "Indexando para IA en segundo plano…",
        visibilityTime: 4000,
      });

      void (async () => {
        try {
          await enqueueEmbeddingJobs(embeddingServices);
          const triggered = await triggerProcessEmbeddings(newProjectDocID, 50);
          if (triggered) {
            Toast.show({
              type: "info",
              text1: "Indexación IA en servidor",
              text2: "Los embeddings se procesarán en segundo plano.",
              visibilityTime: 4000,
            });
            return;
          }
        } catch (enqueueErr) {
          console.warn(
            "embedding_jobs queue unavailable; using client fallback",
            enqueueErr
          );
        }

        const result = await processEmbeddingQueueClient(
          embeddingServices,
          (message, current, total) => onProgress?.(message, current, total),
          { forceHash: true }
        );

        Toast.show({
          type: result.failed === 0 ? "success" : "info",
          text1:
            result.failed === 0
              ? "Indexación IA completada"
              : "Indexación parcial",
          text2: `${result.succeeded}/${result.total} chunks indexados`,
          visibilityTime: 5000,
        });
      })();
    } catch (error) {
      console.error("Error al procesar el archivo:", error);

      // Si es un error de validación, ya se mostró el Toast, solo relanzar
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";

      if (!errorMessage.includes("Validación fallida")) {
        Toast.show({
          type: "error",
          text1: "Error al procesar el archivo",
          text2: errorMessage,
        });
      }

      setIsLoading(false);

      // ⚠️ IMPORTANTE: Relanzar el error para que handleSubmit lo capture
      throw error;
    }
  };

  const handleProjectChange = (project: string) => {
    setSelectedProject(project);
  };

  const handleBackToEquipmentMode = useCallback(() => {
    setIdProyecto("");
    setSelectedProject(null);
    setPosts([]);
    setIsLoading(false);
    props.saveTotalEventServiceAITList([]);
    props.updateAITServicesDATA([]);
  }, [props]);

  const msProject = () => {
    // Open the project upload modal instead of directly handling file upload
    setShowNewProjectModal(true);
  };

  //--To goes to comment screen using callBack-----
  const commentPost = useCallback((data: any) => {
    router.push({
      pathname: "/home/comment",
      params: {
        idDocFirestoreDB: data.idDocFirestoreDB,
        AITidServicios: data.AITidServicios,
        fechaPostFormato: data.fechaPostFormato,
        pdfPrincipal: data.pdfPrincipal.replace(/%2F/g, "abcdefg"),
        visibilidad: data.visibilidad,
        fotoPrincipal: data.fotoPrincipal.replace(/%2F/g, "abcdefg"),
        AITNombreServicio: data.AITNombreServicio,
        emailPerfil: data.emailPerfil,
        titulo: data.titulo,
        comentarios: data.comentarios,
        totalHH: data.totalHH,
        supervisores: data.supervisores,
        HSE: data.HSE,
        liderTecnico: data.liderTecnico,
        soldador: data.soldador,
        tecnico: data.tecnico,
        ayudante: data.ayudante,
      },
    });
  }, []);

  // goToServiceInfo
  const goToServiceInfo = (data: any) => {
    router.push({
      pathname: "/search",
      params: {
        Item: data.AITidServicios,
      },
    });

    setTimeout(() => {
      router.push({
        pathname: "/search/Item",
        params: {
          Item: data.AITidServicios,
        },
      });
    }, 100); // Adjust the delay as needed
  };

  if (!props.email || !props.user_photo || !idproyecto) {
    return (
      <View style={uiStyles.safeArea}>
        <HomeWebToolbar
          windowWidth={windowWidth}
          mode="equipment"
          onCreateProject={msProject}
          onOpenWhatsApp={() => setShowZIPwhatsappModal(true)}
          onChangeProject={() => setShowProjectModal(true)}
        />

        {showProjectModal ? (
          <ProjectFilterModal
            isOpen={showProjectModal}
            setIdProyecto={setIdProyecto}
            onClose={() => setShowProjectModal(false)}
            onSelectProject={(project, company, type, date) => {
              handleProjectChange(project);
              if (company) setSelectedCompany(company);
              if (type) setSelectedType(type);
              if (date) setSelectedDate(date);
            }}
            availableProjects={AVAILABLE_PROJECTS}
            currentProject={selectedProject}
          />
        ) : null}

        <UploadZIPWhatsapp
          isVisible={showZIPwhatsappModal}
          onClose={() => setShowZIPwhatsappModal(false)}
        />

        {/* ── MODAL: Tags inválidos en CSV ─────────────────────────────── */}
        {tagValidationError && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: 16,
            }}
            onClick={() => setTagValidationError(null)}
          >
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 16,
                width: "100%",
                maxWidth: 640,
                maxHeight: "85vh",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                style={{
                  background: "#c62828",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  flexShrink: 0,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 22 }}>⛔</span>
                  <div>
                    <div style={{ color: "white", fontWeight: 700, fontSize: 15 }}>
                      Tags de equipo inválidos
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 }}>
                      {tagValidationError.rows.length} fila(s) con TagEquipo desconocido
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setTagValidationError(null)}
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    border: "none",
                    borderRadius: 8,
                    color: "white",
                    fontSize: 18,
                    cursor: "pointer",
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Scrollable body */}
              <div style={{ overflowY: "auto", padding: "16px 20px", flex: 1 }}>
                {/* Filas con error */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b", marginBottom: 8 }}>
                    Filas con error en el CSV:
                  </div>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: 12,
                    }}
                  >
                    <thead>
                      <tr style={{ backgroundColor: "#fef2f2" }}>
                        {["Fila", "Código", "TagEquipo encontrado"].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: "7px 10px",
                              textAlign: "left",
                              borderBottom: "1px solid #fecaca",
                              color: "#7f1d1d",
                              fontWeight: 700,
                              fontSize: 11,
                              textTransform: "uppercase",
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tagValidationError.rows.map((r, i) => (
                        <tr
                          key={i}
                          style={{ borderBottom: "1px solid #fee2e2" }}
                        >
                          <td style={{ padding: "6px 10px", color: "#dc2626", fontWeight: 600 }}>
                            {r.rowNum}
                          </td>
                          <td style={{ padding: "6px 10px", color: "#374151", fontFamily: "monospace" }}>
                            {r.codigo}
                          </td>
                          <td
                            style={{
                              padding: "6px 10px",
                              color: "#dc2626",
                              fontFamily: "monospace",
                              fontWeight: 600,
                            }}
                          >
                            {r.tagFound || <em style={{ color: "#94a3b8" }}>(vacío)</em>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Lista de tags válidos */}
                <div
                  style={{
                    backgroundColor: "#f0f9ff",
                    border: "1px solid #bae6fd",
                    borderRadius: 10,
                    padding: 14,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 12,
                      color: "#0369a1",
                      marginBottom: 10,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    ✅ Tags válidos disponibles ({tagEquipoList.length})
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                      gap: 6,
                    }}
                  >
                    {tagEquipoList.map((t) => (
                      <div
                        key={t.key}
                        style={{
                          backgroundColor: "white",
                          border: "1px solid #e0f2fe",
                          borderRadius: 6,
                          padding: "5px 8px",
                          fontSize: 11,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontWeight: 700,
                            color: "#0369a1",
                            fontSize: 11,
                          }}
                        >
                          {t.key}
                        </span>
                        <div style={{ color: "#64748b", fontSize: 10, marginTop: 1 }}>
                          {t.value.split("  —  ")[0]}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 10 }}>
                    Corrige el CSV usando uno de los tags de arriba y vuelve a cargar.
                    Si el equipo no está en la lista, agrégalo en{" "}
                    <code style={{ fontSize: 11, color: "#0369a1" }}>utils/tagEquipoList.ts</code>.
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div
                style={{
                  padding: "12px 20px",
                  borderTop: "1px solid #f1f5f9",
                  display: "flex",
                  justifyContent: "flex-end",
                  flexShrink: 0,
                }}
              >
                <button
                  onClick={() => setTagValidationError(null)}
                  style={{
                    backgroundColor: "#2A3B76",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    padding: "9px 20px",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}
        <ProjectUploadModal
          isVisible={showNewProjectModal}
          onClose={() => setShowNewProjectModal(false)}
          onUploadFile={handleProjectFileUpload}
        />
        <ScrollView
          className="mobile-scroll-container"
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {props.email && props.user_photo ? (
            <View style={uiStyles.page}>
              <HomeWelcomeView
                windowWidth={windowWidth}
                userName={
                  companyName ||
                  capitalizeFirstLetter(props.email?.match(regex)?.[1]) ||
                  ""
                }
                userPhoto={props.user_photo}
                onSelectProject={() => setShowProjectModal(true)}
                onCreateProject={msProject}
              />
            </View>
          ) : (
            <View style={uiStyles.loadingWrap}>
              <LoadingSpinner />
            </View>
          )}
        </ScrollView>
      </View>
    );
  } else {
    return (
      <SafeAreaView style={uiStyles.safeArea}>
        <HomeWebToolbar
          windowWidth={windowWidth}
          mode="project"
          projectName={selectedProject?.projectName}
          onCreateProject={msProject}
          onChangeProject={() => setShowProjectModal(true)}
          onBackToEquipment={handleBackToEquipmentMode}
        />

        {showProjectModal ? (
          <ProjectFilterModal
            isOpen={showProjectModal}
            setIdProyecto={setIdProyecto}
            onClose={() => setShowProjectModal(false)}
            onSelectProject={(project, company, type, date) => {
              handleProjectChange(project);
              if (company) setSelectedCompany(company);
              if (type) setSelectedType(type);
              if (date) setSelectedDate(date);
            }}
            availableProjects={AVAILABLE_PROJECTS}
            currentProject={selectedProject}
          />
        ) : null}

        <View style={{ marginTop: 0, marginBottom: 0 }}>
          <HeaderScreen idproyecto={idproyecto} />
        </View>
        <ProjectUploadModal
          isVisible={showNewProjectModal}
          onClose={() => setShowNewProjectModal(false)}
          onUploadFile={handleProjectFileUpload}
        />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={uiStyles.page}>
            <View style={uiStyles.pageHeader}>
              <Text style={uiStyles.sectionTitle}>Actividad reciente</Text>
              <Text style={uiStyles.sectionHint}>
                Eventos registrados en este proyecto
              </Text>
            </View>

            {/* ── KPI STRIP: 4 indicadores reales del proyecto ───────────── */}
            {(() => {
              // ── Cálculo en vivo a partir de posts (events collection) ──
              const hhPerdidas = (posts as any[]).reduce(
                (sum, p) => sum + Number(p.horasPerdidas || 0),
                0
              );
              const eventosHSE = (posts as any[]).filter(
                (p) => p.clasificacionHSE && String(p.clasificacionHSE).trim() !== ""
              ).length;

              // Días desde el último LTI o FAT
              const lastSevere = (posts as any[])
                .filter((p) =>
                  ["LTI", "FAT"].includes((p.clasificacionHSE || "").toUpperCase())
                )
                .sort(
                  (a, b) =>
                    (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
                )[0];
              const diasSinLTI = lastSevere
                ? Math.floor(
                    (Date.now() - (lastSevere.createdAt?.seconds || 0) * 1000) /
                      (1000 * 60 * 60 * 24)
                  )
                : null;

              const kpis = [
                {
                  title: "Total Eventos",
                  value: (posts as any[]).length,
                  icon: "calendar",
                  color: "#2A3B76",
                  sub:
                    (posts as any[]).length === 0
                      ? "Sin eventos registrados"
                      : `${(posts as any[]).length} en este proyecto`,
                  positive: true,
                },
                {
                  title: "HH Perdidas (HSE)",
                  value: `${hhPerdidas.toFixed(0)}h`,
                  icon: "clock",
                  color: hhPerdidas > 0 ? "#dc3545" : "#198754",
                  sub:
                    hhPerdidas === 0
                      ? "Sin horas perdidas"
                      : `${hhPerdidas.toFixed(0)}h de impacto acumulado`,
                  positive: hhPerdidas === 0,
                },
                {
                  title: "Eventos HSE",
                  value: eventosHSE,
                  icon: "shield",
                  color: eventosHSE === 0 ? "#198754" : "#FF9800",
                  sub:
                    eventosHSE === 0
                      ? "Sin incidentes clasificados"
                      : `${eventosHSE} con clasificación HSE`,
                  positive: eventosHSE === 0,
                },
                {
                  title: "Días sin LTI",
                  value: diasSinLTI !== null ? diasSinLTI : "—",
                  icon: diasSinLTI === 0 ? "alert-triangle" : "trending-up",
                  color:
                    diasSinLTI === null
                      ? "#198754"
                      : diasSinLTI === 0
                      ? "#dc3545"
                      : "#198754",
                  sub:
                    diasSinLTI === null
                      ? "Sin LTI/FAT registrados"
                      : diasSinLTI === 0
                      ? "¡LTI registrado hoy!"
                      : "Días consecutivos sin LTI",
                  positive: diasSinLTI !== 0,
                },
              ];

              return (
                <View style={uiStyles.kpiGrid}>
                  {kpis.map((stat, index) => (
                    <View
                      key={index}
                      style={[
                        uiStyles.kpiCard,
                        { borderTopColor: stat.color },
                      ]}
                    >
                      <View style={uiStyles.kpiHeaderRow}>
                        <Text style={uiStyles.kpiLabel}>{stat.title}</Text>
                        <View
                          style={[
                            uiStyles.kpiIconWrap,
                            { backgroundColor: `${stat.color}18` },
                          ]}
                        >
                          <FeatherIcon
                            name={stat.icon}
                            size={18}
                            color={stat.color}
                          />
                        </View>
                      </View>

                      <Text
                        style={[uiStyles.kpiValue, { color: stat.color }]}
                      >
                        {stat.value}
                      </Text>

                      <View style={uiStyles.kpiTrendRow}>
                        <FeatherIcon
                          name={stat.positive ? "trending-up" : "trending-down"}
                          size={14}
                          color={stat.positive ? "#198754" : "#dc3545"}
                          style={{ marginRight: 4 }}
                        />
                        <Text
                          style={[
                            uiStyles.kpiSub,
                            { color: stat.positive ? "#198754" : "#dc3545" },
                          ]}
                          numberOfLines={1}
                        >
                          {stat.sub}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              );
            })()}

            <FlatList
              data={posts}
              numColumns={numColumns}
              scrollEnabled={true}
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
              contentContainerStyle={uiStyles.eventsGrid}
              columnWrapperStyle={
                numColumns > 1 ? uiStyles.columnWrapper : undefined
              }
              ListEmptyComponent={
                <View style={uiStyles.emptyWrap}>
                  <Text style={{ fontSize: 32 }}>📋</Text>
                  <Text style={uiStyles.emptyTitle}>Sin eventos aún</Text>
                  <Text style={uiStyles.emptyText}>
                    Los eventos que registres en este proyecto aparecerán aquí.
                  </Text>
                </View>
              }
              renderItem={({ item }: { item: any }) => {
                //the algoritm to retrieve the image source to render the icon
                const area = item?.AITAreaServicio;
                const indexareaList = areaLists.findIndex(
                  (item) => item.value === area
                );
                const imageSource =
                  areaLists[indexareaList]?.image ??
                  require("../../../assets/equipmentplant/logoMetso4.png");
                return (
                  <View style={uiStyles.eventCard}>
                    <View style={uiStyles.eventBadge}>
                      <Text style={uiStyles.eventBadgeText}>
                        {item.AITEmpresaMinera?.substring(0, 8)}
                      </Text>
                    </View>

                    <TouchableOpacity onPress={() => commentPost(item)}>
                      <ImageExpo
                        source={{ uri: item.fotoPrincipal }}
                        style={uiStyles.eventImage}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                      />
                    </TouchableOpacity>

                    <View style={uiStyles.eventBody}>
                      <TouchableOpacity
                        style={uiStyles.eventServiceRow}
                        onPress={() => goToServiceInfo(item)}
                      >
                        <ImageExpo
                          source={
                            item.AITphotoServiceURL
                              ? { uri: item.AITphotoServiceURL }
                              : imageSource
                          }
                          style={uiStyles.eventServiceIcon}
                          cachePolicy="memory-disk"
                        />
                        <Text
                          style={uiStyles.eventServiceName}
                          numberOfLines={1}
                        >
                          {item.AITNombreServicio}
                        </Text>
                      </TouchableOpacity>

                      <Text style={uiStyles.eventTitle} numberOfLines={2}>
                        {item.titulo}
                      </Text>

                      <Text
                        style={uiStyles.eventComment}
                        selectable
                        numberOfLines={2}
                      >
                        {item.comentarios}
                      </Text>

                      <View style={uiStyles.eventFooter}>
                        <Text style={uiStyles.eventMeta}>
                          {item.fechaPostFormato}
                        </Text>
                        <ImageExpo
                          source={require("../../../assets/assetpics/userIcon.png")}
                          style={styles.roundImage}
                          cachePolicy="memory-disk"
                        />
                        <Text style={uiStyles.eventMeta}>
                          {item.nombrePerfil}
                        </Text>
                        <TouchableOpacity
                          style={uiStyles.eventActionBtn}
                          onPress={() => commentPost(item)}
                        >
                          <MaterialIcon
                            name="arrow-forward"
                            size={14}
                            color="#fff"
                          />
                          <Text style={uiStyles.eventActionText}>
                            Ver detalles
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              }}
              keyExtractor={(item, index) =>
                `${index}-${item.fechaPostFormato}`
              }
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = (reducers: any) => {
  return {
    email: reducers.profile.email,
    user_photo: reducers.profile.user_photo,
    // postPerPage: reducers.home.postPerPage,
  };
};

const HomeScreen = connect(mapStateToProps, {
  saveTotalEventServiceAITList,
  resetPostPerPageHome,
  saveApprovalListnew,
  updateAITServicesDATA,
})(HomeScreenRaw);

// Intenta parsear fechas en múltiples formatos y seriales de Excel
function parseAnyDate(value: any) {
  // 🔥 FIX 2: Log para debug
  console.log("parseAnyDate - Input:", value, "Type:", typeof value);

  if (!value) {
    console.log("parseAnyDate - Empty value, returning null");
    return null;
  }

  // 1. Si es un objeto Date de JavaScript (común en Excel parseado)
  if (value instanceof Date) {
    console.log("parseAnyDate - Already a Date object:", value);
    return value;
  }

  // 2. Si es número (serial Excel)
  if (typeof value === "number") {
    try {
      const date = XLSX.SSF.parse_date_code(value);
      if (date) {
        const parsedDate = new Date(
          date.y,
          date.m - 1,
          date.d,
          date.H || 0,
          date.M || 0,
          date.S || 0
        );
        console.log("parseAnyDate - Parsed from Excel serial:", parsedDate);
        return parsedDate;
      }
    } catch (error) {
      console.error("parseAnyDate - Error parsing Excel serial:", error);
    }
  }

  // 3. Si es string, prueba varios formatos
  if (typeof value === "string") {
    // Normaliza separador y limpia espacios múltiples
    let str = value.trim().replace(/,/g, "").replace(/\s+/g, " ");

    if (!str) {
      console.log("parseAnyDate - Empty string after trim");
      return null;
    }

    // 🔥 Regex mejorado para soportar múltiples formatos:
    // 19/10/2025 10:00:00 PM
    // 19/10/25 22:00:00
    // 19/10/2025 10:00 PM
    // 19/10/2025
    const regex =
      /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?)?$/i;
    const match = str.match(regex);

    if (match) {
      let [, day, month, year, hour = "0", minute = "0", second = "0", ampm] =
        match;

      // Normalizar año de 2 dígitos a 4
      if (year?.length === 2) {
        year = "20" + year;
      }

      // Convertir hora en formato 12h a 24h si hay AM/PM
      if (ampm) {
        const hourNum = Number(hour);
        if (ampm.toUpperCase() === "PM" && hourNum !== 12) {
          hour = String(hourNum + 12);
        } else if (ampm.toUpperCase() === "AM" && hourNum === 12) {
          hour = "0";
        }
      }

      const parsedDate = new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
        Number(second)
      );

      // Validar que la fecha sea válida
      if (!isNaN(parsedDate.getTime())) {
        console.log(
          "parseAnyDate - Parsed from DD/MM/YYYY format:",
          parsedDate
        );
        return parsedDate;
      } else {
        console.log("parseAnyDate - Invalid date after parsing");
      }
    }

    // Si no funcionó el regex, intenta con Date.parse (ISO, etc)
    let d = new Date(str);
    if (!isNaN(d.getTime())) {
      console.log("parseAnyDate - Parsed with Date.parse:", d);
      return d;
    }
  }

  // Si nada funcionó, retorna null
  console.log("parseAnyDate - Could not parse, returning null");
  return null;
}

export default HomeScreen;
