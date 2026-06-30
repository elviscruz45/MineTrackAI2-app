import { getAllProfiles } from "@/lib/db/profiles";
import { uploadEventImage, uploadPdf as uploadPdfToStorage } from "@/lib/db/storage";
import { useEffect } from "react";
import Toast from "react-native-toast-message";

const useUserData = (email: any, saveTotalUsers: any, getTotalUsers: any) => {
  useEffect(() => {
    if (email) {
      async function fetchData() {
        try {
          const lista = await getAllProfiles();
          saveTotalUsers(lista);
        } catch (error) {
          Toast.show({
            type: "error",
            position: "bottom",
            text1: "Error al cargar los datos",
          });
        }
      }
      if (!getTotalUsers) {
        fetchData();
      }
    }
  }, [email]);
};

const dateFormat = () => {
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

const uploadImage = async (uri: any): Promise<string> => {
  const response = await fetch(uri);
  const blob = await response.blob();
  const path = `${Date.now()}.jpg`;
  return uploadEventImage(path, blob, blob.type || "image/jpeg");
};

const uploadPdf = async (
  uri: any,
  FilenameTitle: any,
  formattedDate: any
): Promise<string> => {
  try {
    const blob: Blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function () {
        reject(new Error("Error converting file URI to Blob"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });
    const fileSize = blob.size ?? 0;

    if (fileSize > 25 * 1024 * 1024) {
      throw new Error("El archivo excede los 25 MB");
    }

    const path = `${Date.now()}-${FilenameTitle}`;
    return uploadPdfToStorage(path, blob);
  } catch (error) {
    Toast.show({
      type: "error",
      position: "bottom",
      text1: "El archivo excede los 25 MB",
    });
    throw error;
  }
};

const calculos = {
  useUserData,
  dateFormat,
  uploadImage,
  uploadPdf,
};

export default calculos;
