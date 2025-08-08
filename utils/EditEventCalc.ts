import { v4 as uuidv4 } from "uuid";
// import uuid from "react-native-uuid";
// import "react-native-get-random-values";

import {
  getStorage,
  ref,
  uploadBytes,
  uploadBytesResumable,
} from "firebase/storage";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/firebaseConfig";

import { useEffect } from "react";
import Toast from "react-native-toast-message";

export const useUserData = (
  email: any,
  saveTotalUsers: any,
  getTotalUsers: any
) => {
  useEffect(() => {
    // Function to fetch data from Firestore
    if (email) {
      const companyName = email?.match(/@(.+?)\./i)?.[1] || "Anonimo";

      async function fetchData() {
        try {
          const queryRef1 = query(
            collection(db, "users"),
            // where("companyName", "!=", companyName),
            orderBy("email", "desc")
          );

          // const queryRef2 = query(
          //   collection(db, "users"),
          //   // where("companyName", "==", companyName),
          //   orderBy("email", "desc")
          // );

          const getDocs1 = await getDocs(queryRef1);
          // const getDocs2 = await getDocs(queryRef2);

          const lista: any[] = [];

          // Process results from the first queryd
          if (getDocs1) {
            getDocs1.forEach((doc) => {
              lista.push(doc.data());
            });
          }

          // // Process results from the second query
          // if (getDocs2) {
          //   getDocs2.forEach((doc) => {
          //     lista.push(doc.data());
          //   });
          // }
          // Save the merged results to the state or do any other necessary operations
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

export const uploadImage = async (uri: any) => {
  // const uuid = "asdfdscvcxdre";

  // const uuid = uuidv4();

  const response = await fetch(uri);

  const blob = await response.blob();

  const storage = getStorage();

  const storageRef = ref(
    storage,
    `mainImageEvents/${JSON.stringify(new Date())}`
  );
  return uploadBytesResumable(storageRef, blob);
};

export const uploadPdf = async (
  uri: any,
  FilenameTitle: any,
  formattedDate: any
) => {
  try {
    // const uuid = uuidv4();
    // const response = await fetch(uri);
    // const blob = await response.blob();
    // const fileSize = blob.size;
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

    const storage = getStorage();

    const storageRef = ref(
      storage,
      `pdfPost/${FilenameTitle}-${JSON.stringify(new Date())}`
    );
    return uploadBytesResumable(storageRef, blob as Blob);
  } catch (error) {
    Toast.show({
      type: "error",
      position: "bottom",
      text1: "El archivo excede los 25 MB",
    });
  }
};
