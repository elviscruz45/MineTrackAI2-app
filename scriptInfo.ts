// import { db } from "./firebaseConfig";
// import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import {
//   collection,
//   doc,
//   addDoc,
//   updateDoc,
//   arrayUnion,
//   FieldValue,
//   setDoc,
// } from "firebase/firestore";
// import { faker } from "@faker-js/faker";
// import fs from "fs";

// // Load Firebase Admin SDK with Service Account Key
// const serviceAccount = JSON.parse(fs.readFileSync("serviceAccountKey.json"));

// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//   });
// }

// const db = admin.firestore();
// const eventsRef = db.collection("events");

// async function uploadFakeData() {
//   const batchSize = 20;
//   const fakeDataArray = Array.from({ length: 100 }, () => ({
//     titulo: faker.lorem.words(5),
//     comentarios: faker.lorem.sentence(),
//     emailPerfil: faker.internet.email(),
//     nombrePerfil: faker.person.fullName(),
//     fotoUsuarioPerfil: "https://via.placeholder.com/150", // Placeholder image
//     createdAt: new Date(),
//     porcentajeAvance: faker.helpers.arrayElement(["0", "50", "100"]),
//     etapa: faker.helpers.arrayElement([
//       "Envio Solicitud Servicio",
//       "Envio Cotizacion",
//       "Aprobacion Cotizacion",
//       "Inicio Servicio",
//       "Fin servicio",
//     ]),
//   }));

//   for (let i = 0; i < fakeDataArray.length; i += batchSize) {
//     const batch = fakeDataArray.slice(i, i + batchSize);
//     await Promise.all(batch.map((data) => eventsRef.add(data)));
//   }

// }

// // Run the function
// uploadFakeData().catch(console.error);
