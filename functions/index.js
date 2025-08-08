import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import * as logger from "firebase-functions/logger";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin
initializeApp();

// Get Firestore instance
const firestore = getFirestore();

// Function to update user tokens document
const updateUserTokens = async () => {
  const userTokens = [];
  const snapshot = await firestore.collection("users").get();
  snapshot.forEach((doc) => {
    const userData = doc.data();
    if (userData.ExpoPushNotificationToken) {
      userTokens.push(userData.ExpoPushNotificationToken);
    }
  });

  await firestore.collection("metadata").doc("userTokens").set({
    tokens: userTokens,
  });

  logger.info("User tokens updated");
};

// Cloud Function to update user tokens when users collection changes
export const onUserWrite = onDocumentWritten(
  "users/{userId}",
  async (event) => {
    await updateUserTokens();
  }
);

// Function to fetch user tokens from cached document
const fetchUserTokens = async () => {
  const doc = await firestore.collection("metadata").doc("userTokens").get();
  if (doc.exists) {
    return doc.data().tokens;
  }
  return [];
};

export const modifyuser = onDocumentWritten(
  "events/{eventsId}",
  async (event) => {
    // Get an object with the current document values.
    // If the document does not exist, it was deleted
    const document = event.data.after.data();
    const mensaje = document.AITNombreServicio + " - " + document.titulo;
    logger.info(`mensaje`, mensaje);
    const usuario = document.nombrePerfil;
    logger.info(`usuario`, usuario);
    const token = document.pushNotification;
    logger.info(`token`, token);

    // Send a push notification using Expo
    const pushToken = (await fetchUserTokens()) || token || [];
    logger.info(`pushTokenList`, pushToken);

    const message = {
      to: pushToken,
      title: usuario,
      body: mensaje,
      sound: "default", // Ensure sound is enabled
    };

    try {
      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      const data = await response.json();
    } catch (error) {
      console.error("Error sending push notification:", error);
    }
  }
);
