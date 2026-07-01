import { v4 as uuidv4 } from "uuid";
// import uuid from "react-native-uuid";
// import "react-native-get-random-values";

import { supabase } from "@/lib/supabase";
import { getAllProfiles } from "@/lib/db/profiles";
import { uploadEventImage, uploadPdf as uploadPdfToStorage } from "@/lib/db/storage";
import { useEffect } from "react";
import Toast from "react-native-toast-message";

const useUserData = (email: any, saveTotalUsers: any, getTotalUsers: any) => {
  useEffect(() => {
    // Function to fetch data from Firestore
    if (email) {
      const companyName = email?.match(/@(.+?)\./i)?.[1] || "Anonimo";

      async function fetchData() {
        try {
          const lista = await getAllProfiles();
          saveTotalUsers(lista);
        } catch (error) {
          // console.error("Error fetching data:", error);
          Toast.show({
            type: "error",
            position: "bottom",
            text1: "Error al cargar los datos",
          });
          // Handle the error as needed
        }
      }
      // Call the fetchData function when the component mounts
      if (!getTotalUsers) {
        fetchData();
      }
    }
  }, [email]);
};

export const dateFormat = () => {
  const date = new Date();

  const monthNames = [
    "ene.",
    "feb.",
    "mar.",
    "abr.",
    "may.",
    "jun.",
    "jul.",
    "ago.",
    "sep.",
    "oct.",
    "nov.",
    "dic.",
  ];
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const formattedDate = `${day} ${month} ${year}  ${hour}:${minute} Hrs`;
  return formattedDate;
};

export const uploadImage = async (uri: any): Promise<string> => {
  const response = await fetch(uri);
  const blob = await response.blob();
  const path = `${Date.now()}.jpg`;
  return uploadEventImage(path, blob, blob.type || "image/jpeg");
};

export type PdfUploadSource = string | Blob;

async function resolvePdfBlob(source: PdfUploadSource): Promise<Blob> {
  if (source instanceof Blob) {
    return source;
  }

  const response = await fetch(source);
  if (!response.ok) {
    throw new Error(`No se pudo leer el archivo PDF (${response.status})`);
  }
  return response.blob();
}

export const uploadPdf = async (
  source: PdfUploadSource,
  FilenameTitle: string,
  _formattedDate?: string
): Promise<string> => {
  try {
    const blob = await resolvePdfBlob(source);
    const fileSize = blob.size ?? 0;

    if (fileSize === 0) {
      throw new Error("El archivo PDF está vacío o no se pudo leer");
    }

    if (fileSize > 25 * 1024 * 1024) {
      throw new Error("El archivo excede los 25 MB");
    }

    const safeName = String(FilenameTitle || "documento.pdf").replace(
      /[/\\?%*:|"<>]/g,
      "_"
    );
    const path = `${Date.now()}-${safeName}`;
    return uploadPdfToStorage(path, blob, blob.type || "application/pdf");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al subir el PDF";
    Toast.show({
      type: "error",
      position: "bottom",
      text1: message.includes("25 MB")
        ? "El archivo excede los 25 MB"
        : "No se pudo subir el PDF",
      text2: message.includes("25 MB") ? undefined : message,
    });
    throw error;
  }
};

export default useUserData;
