// Optimized Firebase imports - Solo lo esencial para arranque rápido
import { initializeApp, FirebaseApp } from "firebase/app";
import { initializeAuth, Auth } from "firebase/auth";

// Analytics se carga lazy solo cuando se necesita (ahorra ~50KB al inicio)
// import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

//--------------FH-Servicios--------------pandorasoftwarecompany@gmail.com-----FH-Servicios

const firebaseConfig = {
  apiKey: "AIzaSyBRgCyrgP1zjYT6zC5Nxopfm1W6JOBO8D4",
  authDomain: "fh-servicios.firebaseapp.com",
  projectId: "fh-servicios",
  storageBucket: "fh-servicios.firebasestorage.app",
  messagingSenderId: "895411759954",
  appId: "1:895411759954:web:daefd0c2a731beeec3688b",
};

// Initialize Firebase - Solo lo esencial para arranque rápido
export const app: FirebaseApp = initializeApp(firebaseConfig);

// Auth sin persistencia en el inicio (se puede agregar después si es necesario)
export const auth: Auth = initializeAuth(app, {
  // persistence se agrega después para no ralentizar el inicio
});

// Analytics se inicializa lazy solo cuando se necesita
// export const initAnalytics = () => getAnalytics(app);
