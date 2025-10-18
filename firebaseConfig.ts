// Optimized Firebase imports - Solo lo esencial para arranque rápido
import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
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

// //--------------Antapaccay-App--------------pandorasoftwarecompany@gmail.com-----
// const firebaseConfig = {
//   apiKey: "AIzaSyCcbvIUzos8SEnGBxvqGcsT4T07PqMhLp4",
//   authDomain: "antapaccay-app.firebaseapp.com",
//   projectId: "antapaccay-app",
//   storageBucket: "antapaccay-app.firebasestorage.app",
//   messagingSenderId: "322476079991",
//   appId: "1:322476079991:web:e569a379222800dbe4ff72",
// };

// //--------------Teso-fmi-prodise--------------

// const firebaseConfig = {
//   apiKey: "AIzaSyCV-_gjkUhNKX0x0J0qZRQmhTUsziN7k4I",
//   authDomain: "teseo-fmi-prodise.firebaseapp.com",
//   projectId: "teseo-fmi-prodise",
//   storageBucket: "teseo-fmi-prodise.appspot.com",
//   messagingSenderId: "629895390761",
//   appId: "1:629895390761:web:6304c7338934889fac5e38",
// };

// //--------------Teseo-MVG--------------elviscruz45@gmail.com-----
// const firebaseConfig = {
//   apiKey: "AIzaSyAoCOORUHRj93QcflPF2XoGJbA4zljiHTA",
//   authDomain: "teseo-mvg.firebaseapp.com",
//   projectId: "teseo-mvg",
//   storageBucket: "teseo-mvg.appspot.com",
//   messagingSenderId: "603797920691",
//   appId: "1:603797920691:web:d2ffa670c4f4f5b65f09c6",
// };

// ---------Prueba------

// const firebaseConfig = {
//   apiKey: "AIzaSyD12JVsdmR1IMXdbtW3EXtWxYzgAsD07MI",
//   authDomain: "teseo-app-81d77.firebaseapp.com",
//   projectId: "teseo-app-81d77",
//   storageBucket: "teseo-app-81d77.appspot.com",
//   messagingSenderId: "794583488224",
//   appId: "1:794583488224:web:f3a6076c904aa1c6352285",
//   measurementId: "G-M2CMHVRCN9",
// };
//---------Cerro Verde------

// const firebaseConfig = {
//   apiKey: "AIzaSyAnI4AkUZQvTbE6012n9Uw02rqQ41otjAw",
//   authDomain: "teseo-contract-mining.firebaseapp.com",
//   projectId: "teseo-contract-mining",
//   storageBucket: "teseo-contract-mining.appspot.com",
//   messagingSenderId: "188698485308",
//   appId: "1:188698485308:web:a962b1b2e770f87a8cd939",
// };

// //---------AngloAmerican------

// const firebaseConfig = {
//   apiKey: "AIzaSyDeoh3W7GI42JynAgyI4Dek-BIswwKjMAk",
//   authDomain: "teseo-angloamerican.firebaseapp.com",
//   projectId: "teseo-angloamerican",
//   storageBucket: "teseo-angloamerican.appspot.com",
//   messagingSenderId: "566966681851",
//   appId: "1:566966681851:web:10dec08127796c48de305e",
// };

//---------Prodise------

// const firebaseConfig = {
//   apiKey: "AIzaSyCXDbxa1Qs90RlUFOxMob9jY3SBLoj_tRA",
//   authDomain: "teseo-prodise.firebaseapp.com",
//   projectId: "teseo-prodise",
//   storageBucket: "teseo-prodise.appspot.com",
//   messagingSenderId: "997153190348",
//   appId: "1:997153190348:web:e1b2494f61e601fce6ad69",
// };

// Initialize Firebase - Solo lo esencial para arranque rápido
export const app: FirebaseApp = initializeApp(firebaseConfig);

// Auth sin persistencia en el inicio (se puede agregar después si es necesario)
export const auth: Auth = initializeAuth(app, {
  // persistence se agrega después para no ralentizar el inicio
});

// Firestore
export const db: Firestore = getFirestore(app);

// Analytics se inicializa lazy solo cuando se necesita
// export const initAnalytics = () => getAnalytics(app);
