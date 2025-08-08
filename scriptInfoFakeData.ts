// import { db } from "@/firebaseConfig";
// import { collection, addDoc } from "firebase/firestore";
// import { faker } from "@faker-js/faker";

// async function uploadFakeData() {
//   const eventsRef = collection(db, "events");
//   const fakeDataArray = Array.from({ length: 100 }, () => ({
//     titulo: faker.lorem.words(5),
//     comentarios: faker.lorem.sentence(),
//     emailPerfil: faker.internet.email(),
//     nombrePerfil: faker.name.fullName(),
//     fotoUsuarioPerfil: faker.image.avatar(),
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

//   for (const data of fakeDataArray) {
//     await addDoc(eventsRef, data);
//   }

// }

// uploadFakeData().catch(console.error);
