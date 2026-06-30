import React, { useEffect, useState, useCallback } from "react";
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Linking,
  ScrollView,
  Platform,
  Dimensions,
  TextInput,
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
import { upsertKnowledgeChunk } from "@/lib/db/knowledgeEmbeddings";
import {
  buildServiceSummaryChunk,
  buildActivityChunk,
} from "@/lib/rag/chunkText";
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

const windowWidth = Dimensions.get("window").width;
const numColumns = windowWidth > 1000 ? 3 : 1; // 2 columns for Mac/large screens, 1 for mobile
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
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [selectedProject, setSelectedProject] = useState<any>(
    AVAILABLE_PROJECTS[0]
  );
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

  // Function to create comprehensive text for RAG embedding
  const createRAGText = (
    serviceData: any,
    activitiesData: any[],
    projectName: string,
    projectType: string
  ): string => {
    const {
      NombreServicio,
      Codigo,
      EmpresaMinera,
      TipoServicio,
      SupervisorMina,
      SupervisorEECC,
      FechaInicio,
      FechaFin,
      HorasTotales,
    } = serviceData;

    // Build comprehensive context text for RAG
    let ragText = `SERVICIO PRINCIPAL: ${NombreServicio || projectName}
CÓDIGO: ${Codigo}
TIPO DE PROYECTO: ${projectType}
TIPO DE SERVICIO: ${TipoServicio}
EMPRESA MINERA: ${EmpresaMinera}
FECHAS: Desde ${FechaInicio} hasta ${FechaFin}
SUPERVISOR MINA: ${SupervisorMina || "No asignado"}
SUPERVISOR EECC: ${SupervisorEECC || "No asignado"}
HORAS TOTALES: ${HorasTotales || "No especificado"}

ACTIVIDADES INCLUIDAS:`;

    // Add detailed activities informationF
    activitiesData.forEach((activity, index) => {
      const tag = activity.TagEquipo || activity.tag_equipo || "";
      ragText += `
${index + 1}. ${activity.NombreServicio || "Actividad sin nombre"}
   - Código: ${activity.Codigo || "N/A"}
   - Tag equipo: ${tag || "N/A"}
   - Fechas: ${
     activity.FechaInicio
       ? new Date(activity.FechaInicio.seconds * 1000).toLocaleDateString()
       : "N/A"
   } hasta ${
        activity.FechaFin
          ? new Date(activity.FechaFin.seconds * 1000).toLocaleDateString()
          : "N/A"
      }
   - Empresa: ${EmpresaMinera || "N/A"}`;
    });

    // Add summary context
    ragText += `

RESUMEN DEL CONTEXTO:
Este servicio forma parte del proyecto "${projectName}" de tipo "${projectType}" para la empresa minera "${EmpresaMinera}". 
Incluye ${
      activitiesData.length
    } actividades principales relacionadas con ${TipoServicio}. 
Las actividades van desde ${FechaInicio} hasta ${FechaFin} con un total de ${
      HorasTotales || "N/A"
    } horas programadas.
Supervisión a cargo de: Mina - ${SupervisorMina || "No asignado"}, EECC - ${
      SupervisorEECC || "No asignado"
    }.`;

    return ragText;
  };

  const saveKnowledgeEmbeddings = async (
    serviceId: string,
    serviceData: Record<string, unknown>,
    activitiesData: Record<string, unknown>[],
    projectId: string,
    projectName: string,
    projectType: string
  ) => {
    try {
      const summaryText = buildServiceSummaryChunk(
        { ...serviceData, projectName, projectType },
        activitiesData
      );
      await upsertKnowledgeChunk({
        docType: "service_summary",
        sourceId: serviceId,
        content: summaryText,
        servicioAitId: serviceId,
        projectId,
        tagEquipo: String(serviceData.TagEquipo ?? ""),
        metadata: {
          codigo: serviceData.Codigo,
          nombreServicio: serviceData.NombreServicio,
          projectName,
          projectType,
        },
      });

      for (const activity of activitiesData) {
        const actCode = String(activity.Codigo ?? activity.codigo ?? "");
        const actKey = actCode || String(activity.NombreServicio ?? "");
        if (!actKey) continue;
        await upsertKnowledgeChunk({
          docType: "activity_plan",
          sourceId: `${serviceId}-${actKey}`,
          content: buildActivityChunk(activity, serviceData),
          servicioAitId: serviceId,
          projectId,
          tagEquipo: String(
            activity.TagEquipo ?? activity.tag_equipo ?? serviceData.TagEquipo ?? ""
          ),
          activityCodigo: actCode,
          metadata: { nombre: activity.NombreServicio },
        });
      }
      return true;
    } catch (error) {
      console.error("Error saving knowledge embeddings:", error);
      return false;
    }
  };

  const handleProjectFileUpload = async (
    projectName: string,
    projectType: string,
    fileAsset: any,
    newProjectDocID: any
  ) => {
    try {
      setIsLoading(true);
      setTagValidationError(null);

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
                esRutaCritica: (item.esRutaCritica || "").trim().toLowerCase() === "si",
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
          esRutaCritica: (esRutaCritica || "").trim().toLowerCase() === "si",
          activities: filterNamesActivities,
          activitiesData: filteredData,
          createdAt: new Date(),
        };

        // -----------------------🚀 NEW: Generate single comprehensive RAG embedding
        await saveKnowledgeEmbeddings(
          newData.idServiciosAIT,
          {
            NombreServicio,
            Codigo,
            EmpresaMinera,
            TipoServicio,
            TagEquipo: (TagEquipo || "").trim(),
            AreaServicio: AreaServicio || "",
          },
          filteredData,
          newProjectDocID,
          projectName,
          projectType
        );

        // Submit to Supabase
        await createServicioAit(newData);

        // Optional: Add a small delay
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      Toast.show({
        type: "success",
        text1: "Proyecto global creado exitosamente",
        text2: "Vectores de embeddings guardados en Supabase",
        visibilityTime: 3000,
      });

      setIsLoading(false);
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

  if (!props.email || !props.user_photo || !companyName) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#f8f9fa",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: windowWidth > 768 ? "12px 24px" : "8px 12px",
            borderBottom: "1px solid #eaeaeaff",
            display: "flex",
            flexDirection: windowWidth > 768 ? "row" : "column",
            justifyContent: "space-between",
            alignItems: windowWidth > 768 ? "center" : "stretch",
            gap: windowWidth > 768 ? "12px" : "8px",
          }}
        >
          {/* Contenedor de botones responsive */}
          <div
            style={{
              display: "flex",
              flexDirection: windowWidth > 768 ? "row" : "column",
              gap: windowWidth > 768 ? "8px" : "6px",
              alignItems: "flex-end",
              width: windowWidth > 768 ? "auto" : "100%",
            }}
          >
            <button
              onClick={() => msProject()}
              className="button-hover"
              style={{
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: 8,
                padding: windowWidth > 768 ? "10px 16px" : "12px 16px",
                fontSize: windowWidth > 768 ? 14 : 13,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: "0 3px 6px rgba(40, 167, 69, 0.2)",
                transition: "all 0.2s ease",
                fontWeight: "600",
                minHeight: 40,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#218838";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#28a745";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
                <path
                  d="M12 8V16M8 12H16"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Crear Proyecto
            </button>

            <button
              onClick={() => setShowZIPwhatsappModal(true)}
              className="button-hover"
              style={{
                backgroundColor: "#25D366",
                color: "white",
                border: "none",
                borderRadius: 8,
                padding: windowWidth > 768 ? "10px 16px" : "12px 16px",
                fontSize: windowWidth > 768 ? 14 : 13,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: "0 3px 6px rgba(37, 211, 102, 0.2)",
                transition: "all 0.2s ease",
                fontWeight: "600",
                minHeight: 40,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#20b358";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#25D366";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="10" fill="white" />
                <path
                  d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.198.297-.767.967-.94 1.166-.173.198-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.67-1.617-.917-2.217-.242-.582-.487-.502-.67-.511-.173-.007-.372-.009-.571-.009-.198 0-.52.075-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.877 1.214 3.075.149.198 2.099 3.205 5.077 4.367.71.244 1.263.389 1.695.497.712.18 1.36.155 1.872.094.571-.067 1.758-.719 2.007-1.413.248-.694.248-1.288.173-1.413-.075-.124-.272-.198-.57-.347z"
                  fill="#25D366"
                />
              </svg>
              Reporte Automático
            </button>

            <button
              onClick={() => setShowProjectModal(true)}
              className="button-hover"
              style={{
                backgroundColor: "#2A3B76",
                color: "white",
                border: "none",
                borderRadius: 8,
                padding: windowWidth > 768 ? "10px 16px" : "12px 16px",
                fontSize: windowWidth > 768 ? 14 : 13,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: "0 3px 6px rgba(42, 59, 118, 0.2)",
                transition: "all 0.2s ease",
                fontWeight: "600",
                minHeight: 40,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#1e2d5a";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#2A3B76";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Cambiar Proyecto
            </button>
          </div>

          {/* Project Filter Modal */}
          {showProjectModal && (
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
          )}
        </div>
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
          <View
            style={{
              flex: 1,
              backgroundColor: "transparent",
            }}
          >
            {/* Hero Section con gradiente */}
            <View
              className="gradient-hero"
              style={{
                backgroundColor: "#667eea", // Fallback color
                backgroundImage:
                  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                paddingVertical: windowWidth > 768 ? 60 : 40,
                paddingHorizontal: windowWidth > 768 ? 40 : 20,
                alignItems: "center",
              }}
            >
              {/* Logo con efecto de sombra */}
              <View
                style={
                  {
                    // shadowColor: "#000",
                    // shadowOffset: { width: 0, height: 10 },
                    // shadowOpacity: 0.3,
                    // shadowRadius: 20,
                    // elevation: 15,
                    // marginBottom: 30,
                  }
                }
              >
                {/* <ImageExpo
                  source={require("../../../assets/logoPandora.jpg")}
                  style={{
                    width: windowWidth > 768 ? 180 : 140,
                    height: windowWidth > 768 ? 180 : 140,
                    borderRadius: windowWidth > 768 ? 90 : 70,
                    borderWidth: 4,
                    borderColor: "white",
                  }}
                  cachePolicy={"memory-disk"}
                /> */}
                <ImageExpo
                  source={require("../../../assets/login/poderosa.png")}
                  style={{
                    width: windowWidth > 768 ? 180 : 140,
                    height: windowWidth > 768 ? 180 : 140,
                    borderRadius: windowWidth > 768 ? 90 : 70,
                    borderWidth: 4,
                    borderColor: "white",
                  }}
                  cachePolicy={"memory-disk"}
                />
              </View>

              {/* Título principal */}
              <Text
                style={{
                  fontSize: windowWidth > 768 ? 48 : 32,
                  fontWeight: "800",
                  color: "white",
                  marginBottom: 16,
                  textAlign: "center",
                  textShadowColor: "rgba(0, 0, 0, 0.3)",
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 4,
                  letterSpacing: -0.5,
                }}
              >
                Bienvenido a MineTrackAI
              </Text>

              {/* Subtítulo */}
              <Text
                style={{
                  fontSize: windowWidth > 768 ? 20 : 16,
                  color: "rgba(255, 255, 255, 0.9)",
                  marginBottom: 40,
                  textAlign: "center",
                  maxWidth: windowWidth > 768 ? 700 : 300,
                  lineHeight: windowWidth > 768 ? 28 : 24,
                  fontWeight: "300",
                }}
              >
                La plataforma integral para monitoreo y mantenimiento de plantas
                mineras. Conectando equipos, optimizando recursos y mejorando la
                eficiencia.
              </Text>
            </View>

            {/* Sección de características con fondo blanco */}
            <View
              style={{
                backgroundColor: "white",
                borderTopLeftRadius: 30,
                borderTopRightRadius: 30,
                marginTop: -20,
                paddingTop: 40,
                paddingBottom: 60,
                paddingHorizontal: windowWidth > 768 ? 40 : 20,
                flex: 1,
              }}
            >
              {/* Título de sección */}
              <Text
                style={{
                  fontSize: windowWidth > 768 ? 32 : 24,
                  fontWeight: "700",
                  color: "#2A3B76",
                  textAlign: "center",
                  marginBottom: 16,
                }}
              >
                🚀 Funcionalidades Principales
              </Text>
              <View
                style={{
                  // fontSize: 16,
                  // color: "#666",
                  // textAlign: "center",
                  marginBottom: 40,
                  maxWidth: 600,
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: "auto",
                  marginRight: "auto",
                  // lineHeight: 24,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: "#666",
                    textAlign: "center",
                    marginBottom: 40,
                    maxWidth: 600,
                    lineHeight: 24,
                  }}
                >
                  Descubre todo lo que MineTrackAI puede hacer por tu operación
                  minera
                </Text>
              </View>
              {/* Grid de características mejorado */}

              <View
                style={{
                  flexDirection: windowWidth > 768 ? "row" : "column",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  alignItems: "center",
                  // justifyContent: "center",
                  marginLeft: "auto",
                  marginRight: "auto",
                  // alignItems: "stretch",
                  // width: "100%",
                  maxWidth: 1200,
                  gap: windowWidth > 768 ? 20 : 16,
                  paddingHorizontal: windowWidth > 768 ? 0 : 4,
                }}
              >
                {[
                  {
                    icon: "📊",
                    iconName: "bar-chart",
                    title: "Análisis en Tiempo Real",
                    description:
                      "Monitoreo continuo de datos operativos con dashboards interactivos",
                    color: "#4CAF50",
                  },
                  {
                    icon: "🔧",
                    iconName: "settings",
                    title: "Mantenimiento Preventivo",
                    description:
                      "Anticipe problemas antes de que ocurran con IA predictiva",
                    color: "#2196F3",
                  },
                  {
                    icon: "📱",
                    iconName: "smartphone",
                    title: "Acceso Móvil y Web",
                    description:
                      "Controle sus operaciones desde cualquier lugar del mundo",
                    color: "#FF9800",
                  },
                  {
                    icon: "📄",
                    iconName: "file-text",
                    title: "Reportes Automáticos",
                    description:
                      "Genere reportes profesionales en PDF automáticamente",
                    color: "#9C27B0",
                  },
                ].map((feature, index) => (
                  <View
                    key={index}
                    className="feature-card elevated-card"
                    style={{
                      backgroundColor: "white",
                      borderRadius: 16,
                      padding: 24,
                      width: windowWidth > 768 ? "48%" : "100%",
                      maxWidth: windowWidth > 768 ? 320 : undefined,
                      alignItems: "center",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.12,
                      shadowRadius: 24,
                      elevation: 8,
                      borderWidth: 1,
                      borderColor: "#f0f0f0",
                    }}
                  >
                    {/* Icono con fondo de color */}
                    <View
                      style={{
                        width: 70,
                        height: 70,
                        borderRadius: 35,
                        backgroundColor: `${feature.color}15`,
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: 20,
                        borderWidth: 2,
                        borderColor: `${feature.color}30`,
                      }}
                    >
                      <Text style={{ fontSize: 32 }}>{feature.icon}</Text>
                    </View>

                    {/* Título */}
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "700",
                        color: "#2A3B76",
                        marginBottom: 12,
                        textAlign: "center",
                        lineHeight: 24,
                      }}
                    >
                      {feature.title}
                    </Text>

                    {/* Descripción */}
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#666",
                        textAlign: "center",
                        lineHeight: 20,
                      }}
                    >
                      {feature.description}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Call to Action mejorado */}
              <View
                style={{
                  marginTop: 50,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: windowWidth > 768 ? 24 : 20,
                    fontWeight: "600",
                    color: "#2A3B76",
                    textAlign: "center",
                    marginBottom: 16,
                  }}
                >
                  ¿Listo para optimizar tus operaciones?
                </Text>

                <Text
                  style={{
                    fontSize: 16,
                    color: "#666",
                    textAlign: "center",
                    marginBottom: 30,
                  }}
                >
                  Selecciona un proyecto arriba para comenzar
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  } else {
    return (
      <SafeAreaView
        style={[
          {
            flex: 1,
            backgroundColor: "white",
            height: "100%",
          },
        ]}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: windowWidth > 768 ? "12px 24px" : "8px 12px",
            borderBottom: "1px solid #eaeaeaff",
            display: "flex",
            flexDirection: windowWidth > 768 ? "row" : "column",
            justifyContent: windowWidth > 768 ? "space-between" : "flex-start",
            alignItems: windowWidth > 768 ? "center" : "stretch",
            gap: windowWidth > 768 ? "12px" : "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: windowWidth > 768 ? "flex-start" : "center",
              padding: windowWidth > 768 ? "8px 20px" : "4px 0",
              marginBottom: windowWidth > 768 ? 0 : 8,
            }}
          >
            <span
              style={{
                fontSize: windowWidth > 768 ? 18 : 15,
                fontWeight: 600,
                color: "#2A3B76",
                fontFamily: "'Inter', 'Segoe UI', 'Arial', sans-serif",
                textAlign: windowWidth > 768 ? "left" : "center",
                letterSpacing: 0.2,
                wordBreak: "break-word",
              }}
            >
              {selectedProject?.projectName
                ? selectedProject.projectName
                : "Selecciona un Proyecto"}
            </span>
          </div>
          
          <div
            style={{
              display: "flex",
              flexDirection: windowWidth > 768 ? "row" : "column",
              gap: windowWidth > 768 ? "8px" : "8px",
              alignItems: "stretch",
            }}
          >
            <button
              onClick={() => msProject()}
              style={{
                backgroundColor: "green",
                color: "white",
                border: "none",
                borderRadius: 8,
                padding: windowWidth > 768 ? "8px 16px" : "10px 12px",
                fontSize: windowWidth > 768 ? 14 : 13,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                boxShadow: "0 2px 4px rgba(42, 59, 118, 0.2)",
                whiteSpace: "nowrap",
                fontWeight: "600",
              }}
            >
              <svg
                width={windowWidth > 768 ? "18" : "16"}
                height={windowWidth > 768 ? "18" : "16"}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
                <path
                  d="M12 8V16M8 12H16"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Crear Proyecto
            </button>
            
            <button
              onClick={() => setShowProjectModal(true)}
              style={{
                backgroundColor: "#2A3B76",
                color: "white",
                border: "none",
                borderRadius: 8,
                padding: windowWidth > 768 ? "8px 16px" : "10px 12px",
                fontSize: windowWidth > 768 ? 14 : 13,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                boxShadow: "0 2px 4px rgba(42, 59, 118, 0.2)",
                whiteSpace: "nowrap",
                fontWeight: "600",
              }}
            >
              <svg
                width={windowWidth > 768 ? "16" : "14"}
                height={windowWidth > 768 ? "16" : "14"}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Cambiar Proyecto
            </button>
          </div>

          {/* Project Filter Modal */}
          {showProjectModal && (
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
          )}
        </div>
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
          <View
            style={{
              paddingHorizontal:
                windowWidth > 1200 ? "10%" : windowWidth > 800 ? "5%" : "2%",
              paddingTop: 20,
              backgroundColor: "#f8f9fa",
              flex: 1,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
                paddingBottom: 15,
                borderBottomWidth: 1,
                borderBottomColor: "#e0e0e0",
              }}
            >
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "700",
                  color: "#2A3B76",
                }}
              >
                Actividad Recientes
              </Text>
              {/* <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MaterialIcon
                  name="filter-list"
                  color="#2A3B76"
                  size={24}
                  style={{ marginRight: 8 }}
                />
                <Text style={{ color: "#2A3B76", fontWeight: "600" }}>
                  Filtrar
                </Text>
              </View> */}
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
                <View
                  style={{
                    flexDirection: windowWidth > 800 ? "row" : "column",
                    justifyContent: "space-between",
                    marginBottom: 24,
                  }}
                >
                  {kpis.map((stat, index) => (
                    <View
                      key={index}
                      style={{
                        backgroundColor: "#fff",
                        borderRadius: 12,
                        padding: 16,
                        width: windowWidth > 800 ? "24%" : "100%",
                        marginBottom: windowWidth > 800 ? 0 : 12,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 3,
                        elevation: 2,
                        borderWidth: 1,
                        borderColor: "#f0f0f0",
                        borderTopWidth: 3,
                        borderTopColor: stat.color,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: 12,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            color: "#64748b",
                            fontWeight: "600",
                            textTransform: "uppercase",
                            letterSpacing: 0.4,
                            flex: 1,
                            paddingRight: 8,
                          }}
                        >
                          {stat.title}
                        </Text>
                        <View
                          style={{
                            backgroundColor: `${stat.color}18`,
                            width: 38,
                            height: 38,
                            borderRadius: 8,
                            justifyContent: "center",
                            alignItems: "center",
                            flexShrink: 0,
                          }}
                        >
                          <FeatherIcon
                            name={stat.icon}
                            size={18}
                            color={stat.color}
                          />
                        </View>
                      </View>

                      <Text
                        style={{
                          fontSize: 28,
                          fontWeight: "800",
                          color: stat.color,
                          marginBottom: 8,
                          lineHeight: 32,
                        }}
                      >
                        {stat.value}
                      </Text>

                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <FeatherIcon
                          name={stat.positive ? "trending-up" : "trending-down"}
                          size={14}
                          color={stat.positive ? "#198754" : "#dc3545"}
                          style={{ marginRight: 4 }}
                        />
                        <Text
                          style={{
                            fontSize: 12,
                            color: stat.positive ? "#198754" : "#dc3545",
                            flex: 1,
                          }}
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
              contentContainerStyle={{
                paddingBottom: 50,
              }}
              columnWrapperStyle={
                windowWidth > 1000
                  ? {
                      justifyContent: "space-between",
                      marginBottom: 15,
                    }
                  : undefined
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
                  <View
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: 12,
                      overflow: "hidden",
                      marginBottom: 20,
                      width:
                        windowWidth > 1000
                          ? (windowWidth * 0.8) / 3 - 20
                          : "100%",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.08,
                      shadowRadius: 4,
                      elevation: 1,
                      borderWidth: 1,
                      borderColor: "#f0f0f0",
                    }}
                  >
                    {/* Company Badge */}
                    <View
                      style={{
                        position: "absolute",
                        left: 12,
                        top: 12,
                        zIndex: 10,
                        backgroundColor: "#2A3B76",
                        borderRadius: 20,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        flexDirection: "row",
                        alignItems: "center",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.2,
                        shadowRadius: 2,
                      }}
                    >
                      {/* <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: "#fff",
                          justifyContent: "center",
                          alignItems: "center",
                          marginRight: 6,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "bold",
                            color: "#2A3B76",
                          }}
                        >
                          FH
                        </Text>
                      </View> */}
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 12,
                          fontWeight: "600",
                        }}
                      >
                        {item.AITEmpresaMinera?.substring(0, 8)}
                      </Text>
                    </View>

                    {/* Card Image */}
                    <TouchableOpacity onPress={() => commentPost(item)}>
                      <ImageExpo
                        source={{ uri: item.fotoPrincipal }}
                        style={{
                          width: "100%",
                          height: 190,
                          resizeMode: "cover",
                        }}
                        cachePolicy={"memory-disk"}
                      />
                    </TouchableOpacity>

                    {/* Card Content */}
                    <View style={{ padding: 16 }}>
                      <TouchableOpacity
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 12,
                        }}
                        onPress={() => goToServiceInfo(item)}
                      >
                        <ImageExpo
                          source={
                            item.AITphotoServiceURL
                              ? { uri: item.AITphotoServiceURL }
                              : imageSource
                          }
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 14,
                            marginRight: 8,
                          }}
                          cachePolicy={"memory-disk"}
                        />
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: "#2A3B76",
                          }}
                          numberOfLines={1}
                        >
                          {item.AITNombreServicio}
                        </Text>
                      </TouchableOpacity>

                      <Text
                        style={{
                          fontSize: 17,
                          fontWeight: "700",
                          color: "#333",
                          marginBottom: 8,
                          lineHeight: 22,
                        }}
                        numberOfLines={2}
                      >
                        {item.titulo}
                      </Text>

                      <Text
                        style={{
                          fontSize: 14,
                          color: "#555",
                          lineHeight: 20,
                          marginBottom: 12,
                        }}
                        selectable={true}
                        numberOfLines={2}
                      >
                        {item.comentarios}
                      </Text>

                      {/* Card Footer */}
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: 8,
                          borderTopWidth: 1,
                          borderTopColor: "#f0f0f0",
                          paddingTop: 12,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            color: "#888",
                          }}
                        >
                          {item.fechaPostFormato}
                        </Text>
                        <ImageExpo
                          source={require("../../../assets/assetpics/userIcon.png")}
                          // source={{ uri: item.fotoUsuarioPerfil }}
                          style={styles.roundImage}
                          cachePolicy={"memory-disk"}
                        />
                        <Text
                          style={{
                            fontSize: 13,
                            color: "#888",
                          }}
                        >
                          {item.nombrePerfil}
                        </Text>
                        <TouchableOpacity
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: "#2A3B76",
                            paddingVertical: 6,
                            paddingHorizontal: 10,
                            borderRadius: 6,
                          }}
                          onPress={() => commentPost(item)}
                        >
                          <MaterialIcon
                            name="arrow-forward"
                            size={14}
                            color="#fff"
                          />
                          <Text
                            style={{
                              marginLeft: 4,
                              color: "#fff",
                              fontSize: 13,
                              fontWeight: "500",
                            }}
                          >
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
