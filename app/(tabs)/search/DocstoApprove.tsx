import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  Linking,
  FlatList,
  Text,
  Alert,
  Platform,
} from "react-native";
import { Button } from "@rneui/themed";
import styles from "./DocstoApprove.styles";
import { connect } from "react-redux";
import { update_firebaseUserUid } from "../../../redux/actions/auth";
import { update_firebaseProfile } from "../../../redux/actions/profile";
import {
  arrayUnion,
  updateDoc,
  doc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { Image as ImageExpo } from "expo-image";
import { getStorage, ref, deleteObject } from "firebase/storage";

import { update_approvalList } from "../../../redux/actions/home";
import * as MailComposer from "expo-mail-composer";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { router } from "expo-router";

function DocstoApproveScreenBare(props: any) {
  const [approval, setApproval] = useState();
  const [isMailAvailable, setIsMailAvailable] = useState(false);
  const userType = props.profile.userType;

  useEffect(() => {
    async function checkAvailability() {
      const available = await MailComposer.isAvailableAsync();
      setIsMailAvailable(available);
    }
    checkAvailability();
  }, []);

  //Retrieve data Item that comes from the previous screen to render the Updated Status
  const { idServiciosAIT }: any = useLocalSearchParams();

  //create the algoritm to have the date format of the post
  const formatDate = (dateInput: any) => {
    const { seconds, nanoseconds } = dateInput || {
      seconds: 0,
      nanoseconds: 0,
    };
    const milliseconds = seconds * 1000 + nanoseconds / 1000000;
    const date = new Date(milliseconds);
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

  const emailUser = props.email;

  useEffect(() => {
    async function fetchData() {
      try {
        const queryRef1 = query(
          collection(db, "approvals"),
          where("IdAITService", "==", idServiciosAIT),
          orderBy("date", "desc")
        );
        const getDocs1 = await getDocs(queryRef1);
        const lista: any = [];
        // Process results from the first query
        if (getDocs1) {
          getDocs1.forEach((doc) => {
            if (
              doc.data()?.ApprovalRequestedBy === emailUser ||
              doc.data()?.ApprovalRequestSentTo.includes(emailUser)
            ) {
              lista.push(doc.data());
            }
          });
        }

        setApproval(lista);
      } catch (error) {
        console.error("Error fetching data:", error);
        Toast.show({
          type: "error",
          position: "bottom",
          text1: "Error al cargar los datos",
        });
        // Handle the error as needed
      }
      // let ApprovalList = props.approvalListNew;
      // const filteredArray = ApprovalList.filter(
      //   (element) => element.IdAITService === Item.idServiciosAIT
      // );
      // setApproval(filteredArray);
    }
    fetchData();
  }, [props.approvalListNew]);

  // create a function that uses MailComposer to send an email

  const sendEmail = (
    tipo = "",
    idTime = "",
    solicitudComentario = "",
    solicitud = "",
    fileName = "",
    ApprovalRequestedBy = "",
    ApprovalRequestSentTo = [],
    formatDate = "",
    emailUser = "",
    nombreServicio = "",
    tipoFile = "",
    companyName = "",
    NumeroServicio = ""
  ) => {
    MailComposer.composeAsync({
      recipients: ApprovalRequestSentTo,
      subject: `${companyName} - Num Serv:${NumeroServicio} ${nombreServicio} ${tipo} de solicitud ID: ${idTime}`,
      body: `Se confirma la ${tipo} de: \n 
      Servicio: ${nombreServicio} \n
      Solicitud: ${solicitud} \n
      Comentario: ${solicitudComentario} \n 
      Archivo: ${fileName} \n 
      Tipo de Archivo: ${tipoFile} \n
      Usuario que requiere aprobacion: ${ApprovalRequestedBy} \n
      Usuario Aprobador: ${emailUser} \n
      Fecha de la Solicitud: ${formatDate} \n
      Aprobaciones Requeridas: ${ApprovalRequestSentTo.join(", ")} \n 
      Empresa:${companyName}
      `,
    });
  };

  //Approval
  const docAprovals = async (
    emailUser = "",
    idApproval = "",
    idTime = "",
    solicitudComentario = "",
    solicitud = "",
    fileName = "",
    ApprovalRequestedBy = "",
    ApprovalRequestSentTo = [],
    formatDate = "",
    nombreServicio = "",
    tipoFile = "",
    companyName = "",
    NumeroServicio = ""
  ) => {
    const PostRef = doc(db, "approvals", idApproval);

    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Estas Seguro de Aprobar esta Solicitud?"
      );
      if (confirmed) {
        await updateDoc(PostRef, {
          ApprovalPerformed: arrayUnion(emailUser),
        });
        const tipo = "Aprobacion";

        sendEmail(
          tipo,
          idTime,
          solicitudComentario,
          solicitud,
          fileName,
          ApprovalRequestedBy,
          ApprovalRequestSentTo,
          formatDate,
          emailUser,
          nombreServicio,
          tipoFile,
          companyName,
          NumeroServicio
        );
      }
    } else {
      Alert.alert(
        "Aprobacion",
        "Estas Seguro de Aprobar esta Solicitud?",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Aprobar",
            onPress: async () => {
              await updateDoc(PostRef, {
                ApprovalPerformed: arrayUnion(emailUser),
              });
              const tipo = "Aprobacion";

              sendEmail(
                tipo,
                idTime,
                solicitudComentario,
                solicitud,
                fileName,
                ApprovalRequestedBy,
                ApprovalRequestSentTo,
                formatDate,
                emailUser,
                nombreServicio,
                tipoFile,
                companyName,
                NumeroServicio
              );
            },
          },
        ],
        { cancelable: false }
      );
    }
  };

  //Rejection
  const docRejection = async (
    emailUser = "",
    idApproval = "",
    idTime = "",
    solicitudComentario = "",
    solicitud = "",
    fileName = "",
    ApprovalRequestedBy = "",
    ApprovalRequestSentTo = [],
    formatDate = "",
    nombreServicio = "",
    tipoFile = "",
    companyName = "",
    NumeroServicio = ""
  ) => {
    const PostRef = doc(db, "approvals", idApproval);

    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Estas Seguro de Desaprobar esta Solicitud?"
      );
      if (confirmed) {
        await updateDoc(PostRef, {
          RejectionPerformed: arrayUnion(emailUser),
        });
        const tipo = "Desaprobacion";

        sendEmail(
          tipo,
          idTime,
          solicitudComentario,
          solicitud,
          fileName,
          ApprovalRequestedBy,
          ApprovalRequestSentTo,
          formatDate,
          emailUser,
          nombreServicio,
          tipoFile,
          companyName,
          NumeroServicio
        );
      }
    } else {
      Alert.alert(
        "Desaprobacion",
        "Estas Seguro de Desaprobar esta Solicitud?",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Aceptar",
            onPress: async () => {
              await updateDoc(PostRef, {
                RejectionPerformed: arrayUnion(emailUser),
              });
              const tipo = "Desaprobacion";

              sendEmail(
                tipo,
                idTime,
                solicitudComentario,
                solicitud,
                fileName,
                ApprovalRequestedBy,
                ApprovalRequestSentTo,
                formatDate,
                emailUser,
                nombreServicio,
                tipoFile,
                companyName,
                NumeroServicio
              );
            },
          },
        ],
        { cancelable: false }
      );
    }
  };

  //---This is used to get the attached file in the post that contain an attached file---
  const uploadFile = useCallback(async (uri: any) => {
    try {
      const supported = await Linking.canOpenURL(uri);
      if (supported) {
        await Linking.openURL(uri);
      } else {
        Toast.show({
          type: "error",
          position: "bottom",
          text1: "Este archivo no tiene Documento adjunto",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        position: "bottom",
        text1: "Este archivo no tiene Documento adjunto",
      });
    }
  }, []);

  const openGoogleDriveLink = useCallback(async (uri: any) => {
    try {
      const supported = await Linking.canOpenURL(uri);
      if (supported) {
        await Linking.openURL(uri);
      } else {
        Toast.show({
          type: "error",
          position: "bottom",
          text1: "Este archivo no tiene Documento adjunto",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        position: "bottom",
        text1: "Este archivo no tiene Documento adjunto",
      });
    }
  }, []);
  const deleteApproval = (item: any) => {
    Alert.alert(
      "Eliminar Documento",
      "Estas Seguro que desear Eliminar la solicitud de aprobacion?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Aceptar",
          onPress: async () => {
            //updating events in ServiciosAIT to filter the deleted event
            const Ref = doc(db, "approvals", item.idApproval);
            await deleteDoc(Ref);

            // // //delete doc from storage
            // const documentPath = `pdfPost/${item.fileName}-${item.fechaPostFormato}`;

            // try {
            //   const storage = getStorage();
            //   const storageRef = ref(storage, documentPath);
            //   await deleteObject(storageRef);
            // } catch (error) {
            //   console.error("Error deleting document:", error.message);
            //   // Handle errors as needed
            // }

            //send success message
            Toast.show({
              type: "success",
              position: "bottom",
              text1: "Se ha eliminado correctamente",
            });
            router.back();
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <FlatList
      data={approval}
      style={{ backgroundColor: "white" }} // Add backgroundColor here
      scrollEnabled={true}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const approvalRequestedLength = item.ApprovalRequestSentTo?.length;
        const approvalPerformedLength = item.ApprovalPerformed?.length;
        const emailUser = props.email;

        //reviewing the conditionals
        const isIncludedapprovalRequested =
          item.ApprovalRequestSentTo?.includes(emailUser);
        const isIncludedapprovalPerformed =
          item.ApprovalPerformed?.includes(emailUser);
        const isIncludedRectionPerformed =
          item.RejectionPerformed?.includes(emailUser);
        const idApproval = item.idApproval;

        //id format date
        const formatDateSol = formatDate(item.date);
        const { seconds, nanoseconds } = item.date || {
          seconds: 0,
          nanoseconds: 0,
        };
        let idTime =
          item.idTimeApproval ??
          ((seconds * 1000 + nanoseconds / 1000000) / 1000).toFixed(0);

        // confirmation if the requestment is a drive document:
        const inputString = item.solicitudComentario;
        const pattern = /drive\.google\.com/i;
        const isDriveDoc = pattern.test(inputString);

        return (
          <View
            style={{
              borderBottomWidth: 5,
              borderBottomColor: "#f0f8ff",
            }}
          >
            <View>
              <View style={styles.equipments2}>
                <View style={styles.image2}>
                  <TouchableOpacity
                    onPress={() => openGoogleDriveLink(item.pdfFile)}
                    onLongPress={
                      props.email === item.email
                        ? () => deleteApproval(item)
                        : () => {}
                    }
                  >
                    <ImageExpo
                      source={
                        item.pdfFile
                          ? require("../../../assets/pictures/docIcon.png")
                          : require("../../../assets/pictures/mailIcon.png")
                      }
                      style={styles.image3}
                      cachePolicy={"memory-disk"}
                    />
                  </TouchableOpacity>
                  <ImageExpo
                    source={
                      approvalRequestedLength === approvalPerformedLength
                        ? require("../../../assets/pictures/approvalGreen.png")
                        : approvalPerformedLength > 0
                        ? require("../../../assets/pictures/approvalYellow.png")
                        : require("../../../assets/pictures/rejectedRed.png")
                    }
                    style={styles.image4}
                    cachePolicy={"memory-disk"}
                  />
                </View>
                <View style={styles.article}>
                  <View style={[styles.row, styles.center]}>
                    <Text style={styles.info}>{"ID:            "}</Text>
                    <Text style={styles.info2} selectable={true}>
                      {idTime}
                    </Text>
                  </View>
                  <View style={[styles.row, styles.center]}>
                    <Text style={styles.info}>{"Solicitud:"}</Text>
                    {isDriveDoc ? (
                      <Text
                        style={styles.info2}
                        selectable={true}
                        onPress={() =>
                          openGoogleDriveLink(item.solicitudComentario)
                        }
                      >
                        {item.solicitudComentario}
                      </Text>
                    ) : (
                      <Text style={styles.info2} selectable={true}>
                        {item.solicitudComentario}
                      </Text>
                    )}
                  </View>
                  <View style={[styles.row, styles.center]}>
                    <Text style={styles.info}>{"Tipo:        "}</Text>
                    <Text style={styles.info2}>{item.solicitud}</Text>
                  </View>

                  <View style={[styles.row, styles.center]}>
                    <Text style={styles.info}>{"Archivo:  "}</Text>
                    <Text style={styles.info2}>{item.fileName}</Text>
                  </View>
                  <View style={[styles.row, styles.center]}>
                    <Text style={styles.info}>{"Doc:         "}</Text>
                    <Text style={styles.info2}>{item.tipoFile}</Text>
                  </View>
                  <View style={[styles.row, styles.center]}>
                    <Text style={styles.info}>{"Empresa:"}</Text>
                    <Text style={styles.info2}>{item.companyName}</Text>
                  </View>

                  <View style={[styles.row, styles.center]}>
                    <Text style={styles.info}>{"Autor:      "}</Text>
                    <Text style={styles.info2}>{item.ApprovalRequestedBy}</Text>
                  </View>

                  <View style={[styles.row, styles.center]}>
                    <Text style={styles.info}>{"Fecha:     "}</Text>
                    <Text style={styles.info2}>{formatDateSol}</Text>
                  </View>

                  <View style={[styles.row, styles.center]}>
                    <Text style={styles.info}>{"Req:         "}</Text>
                    <Text style={styles.info2}>
                      {item.ApprovalRequestSentTo?.join(", ")}
                    </Text>
                  </View>

                  {item.ApprovalPerformed?.length !== 0 && (
                    <View style={[styles.row, styles.center]}>
                      <Text style={styles.info}>{"Aprob:     "}</Text>
                      <Text style={styles.info2}>
                        {item.ApprovalPerformed?.join(", ")}
                      </Text>
                    </View>
                  )}

                  {item.RejectionPerformed?.length !== 0 && (
                    <View style={[styles.row, styles.center]}>
                      <Text style={styles.info5}>{"Desap:     "}</Text>
                      <Text style={styles.info6}>
                        {item.RejectionPerformed?.join(", ")}
                      </Text>
                    </View>
                  )}

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    {isIncludedapprovalRequested &&
                      isMailAvailable &&
                      !(
                        isIncludedapprovalPerformed ||
                        isIncludedRectionPerformed
                      ) && (
                        <>
                          <Button
                            title="Aprobar"
                            buttonStyle={styles.btnActualizarStyles}
                            onPress={() =>
                              docAprovals(
                                emailUser,
                                idApproval,
                                idTime,
                                item.solicitudComentario,
                                item.solicitud,
                                item.fileName,
                                item.ApprovalRequestedBy,
                                item.ApprovalRequestSentTo,
                                formatDateSol,
                                item.NombreServicio,
                                item.tipoFile,
                                item.companyName,
                                item.NumeroServicio
                              )
                            }
                          />

                          <Button
                            title="Desaprobar "
                            buttonStyle={styles.btncerrarStyles}
                            onPress={() =>
                              docRejection(
                                emailUser,
                                idApproval,
                                idTime,
                                item.solicitudComentario,
                                item.solicitud,
                                item.fileName,
                                item.ApprovalRequestedBy,
                                item.ApprovalRequestSentTo,
                                formatDateSol,
                                item.NombreServicio,
                                item.tipoFile,
                                item.companyName,
                                item.NumeroServicio
                              )
                            }
                          />
                        </>
                      )}
                  </View>
                  <Text></Text>
                </View>
              </View>
            </View>
          </View>
        );
      }}
      keyExtractor={(item, index) => `${index}-${item.date}`} // Provide a unique key for each item
    />
  );
}

const mapStateToProps = (reducers: any) => {
  return {
    profile: reducers.profile.profile,
    email: reducers.profile.email,
    ActualPostFirebase: reducers.post.ActualPostFirebase,
    approvalListNew: reducers.search.approvalListNew, //important
  };
};

const DocstoApprove = connect(mapStateToProps, {
  update_firebaseUserUid,
  update_firebaseProfile,
  update_approvalList,
})(DocstoApproveScreenBare);

export default DocstoApprove;
