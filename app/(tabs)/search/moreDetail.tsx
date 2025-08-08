import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Button,
  Platform,
  Alert,
} from "react-native";
import { Image as ImageExpo } from "expo-image";
import styles from "./moreDetail.styles";
import { screen } from "../../../utils";
import { connect } from "react-redux";
// import { saveActualEquipment } from "../../redux/actions/post";
import { EquipmentListUpper } from "../../../redux/actions/home";
import { areaLists } from "../../../utils/areaList";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { userTypeList } from "../../../utils/userTypeList";
import { useRouter, useLocalSearchParams } from "expo-router";
import BarChartTareo from "./moreDetail.Chart";
import CurvaS from "./moreDetail.CurvaS";
import ChangeDisplayFechaReal from "./components/FechaReal/ChangeDisplayFechaReal";
import { Modal } from "@/components/Modal/Modal";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import Toast from "react-native-toast-message";
// import {
//   LineChart,
//   BarChart,
//   PieChart,
//   ProgressChart,
//   ContributionGraph,
//   StackedBarChart,
// } from "react-native-chart-kit";
import * as Progress from "react-native-progress";

const windowWidth = Dimensions.get("window").width;
function MoreDetailScreenNoRedux(props: any) {
  const [data, setData] = useState();
  const [showModal, setShowModal] = useState<any>(false);
  const [renderComponent, setRenderComponent] = useState<any>("");

  const onCloseOpenModal = () => setShowModal((prevState: any) => !prevState);

  const router = useRouter();
  //global state management for the user_uid
  const {
    idServiciosAIT,
    area,
    Monto,
    HorasHombre,
    HHModificado,
    MontoModificado,
    NuevaFechaEstimada,
    FechaFin,
    FechaInicio,
    FechaFinISO,
    FechaInicioISO,
    createdAt,
    ResponsableEmpresaUsuario,
    ResponsableEmpresaUsuario2,
    ResponsableEmpresaUsuario3,
    ResponsableEmpresaContratista,
    ResponsableEmpresaContratista2,
    ResponsableEmpresaContratista3,
    AvanceEjecucion,
    photoServiceURL,
    emailPerfil,
    Moneda,
    NombreServicio,
    EmpresaMinera,
    NumeroAIT,
    NumeroCotizacion,
    TipoServicio,
    AreaServicio,
    companyName,
    events,
    events1,
    activities,
    activitiesData,
    tareo,
    Supervisor,
    SupervisorSeguridad,
    Lider,
    Tecnicos,
    Soldador,
    HorasTotales,
    AvanceEventos,
  }: any = useLocalSearchParams();

  //retrieving serviceAIT list data from firebase
  useEffect(() => {
    setData(JSON.parse(activitiesData || "[]"));
  }, []);

  const userType = props.profile?.userType;
  ///the algoritm to retrieve the image source to render the icon
  const indexareaList = areaLists.findIndex((item) => item.value === area);
  const imageSource =
    areaLists[indexareaList]?.image ||
    require("../../../assets/equipmentplant/ImageIcons/fhIcon1.jpeg");

  const photoServiceURLDecoded = photoServiceURL.replace(/abcdefg/g, "%2F");

  /// the algorithm to retrieve the amount with format
  // const formattedAmount = new Intl.NumberFormat("en-US", {
  //   style: "decimal",
  //   useGrouping: true,
  //   minimumFractionDigits: 2,
  //   maximumFractionDigits: 2,
  // }).format(Monto);

  ///function to change the format of FechaFin from ServiciosAIT firebase collection
  // const formatDate = (item: any) => {
  //   if (!item) return;
  //   const date = new Date(item);
  //   const monthNames = [
  //     "ene.",
  //     "feb.",
  //     "mar.",
  //     "abr.",
  //     "may.",
  //     "jun.",
  //     "jul.",
  //     "ago.",
  //     "sep.",
  //     "oct.",
  //     "nov.",
  //     "dic.",
  //   ];
  //   const day = date.getDate();
  //   const month = monthNames[date.getMonth()];
  //   const year = date.getFullYear();
  //   const formattedDate = `${day} ${month} ${year}`;
  //   return formattedDate;
  // };

  // const NuevaFechaEstimadatoRender =
  //   NuevaFechaEstimada > FechaFin
  //     ? formatDate(NuevaFechaEstimada?.seconds * 1000)
  //     : formatDate(FechaFin?.seconds * 1000);

  //Algoritm to calculate  "Avance Ejecucion Proyectado"

  const durationInMilliseconds = FechaFinISO - FechaInicioISO;

  // let AvanceProyected;
  // if (!FechaInicio) {
  //   AvanceProyected =
  //     ((new Date().getTime() - new Date(createdAt?.seconds * 1000).getTime()) *
  //       100) /
  //     DaysProyectedToCompleteTask;
  // } else {
  //   AvanceProyected =
  //     ((new Date().getTime() -
  //       new Date(FechaInicio?.seconds * 1000).getTime()) *
  //       100) /
  //     DaysProyectedToCompleteTask;
  // }

  // if (AvanceProyected > 100) {
  //   AvanceProyected = 100;
  // }
  // const AvanceProyected =
  //   ((new Date().getTime() - FechaInicioISO) *
  //     100) /
  //   durationInMilliseconds;

  //Algorithm to   convert string to a list to render a list of names

  const UsuarioAdministrador = ResponsableEmpresaUsuario?.split(",");
  const UsuarioPlaneamiento = ResponsableEmpresaUsuario2?.split(",");
  const UsuarioMantenimiento = ResponsableEmpresaUsuario3?.split(",");

  const ContratistaGerente = ResponsableEmpresaContratista?.split(",");
  const ContratistaPlanificador = ResponsableEmpresaContratista2?.split(",");
  const ContratistaSupervisor = ResponsableEmpresaContratista3?.split(",");

  const ResposableList = (array: any) => {
    return (
      <View>
        <FlatList
          data={array}
          renderItem={({ item }) => {
            return (
              <View>
                <Text style={styles.info3}>{item}</Text>
              </View>
            );
          }}
          keyExtractor={(item, index) => index.toString()}
          scrollEnabled={false}
        />
      </View>
    );
  };

  const updateRealDataInicioFin = (codigo: string) => {
    const currentDateTime = new Date().toISOString(); // Get current timestamp
    setData((prevData: any) =>
      prevData.map((item: any) =>
        item.Codigo === codigo
          ? {
              ...item,
              RealFechaInicio: currentDateTime,
              RealFechaFin: currentDateTime,
            }
          : item
      )
    );
  };

  const activitiesList = (array: any) => {
    // const filterNamesActivities = array?.map(
    //   (item: any) => item.NombreServicio
    // );
    return (
      <View>
        <FlatList
          data={array}
          renderItem={({ index, item }) => {
            const FechaInicio = item.FechaInicio;

            const FechaFin = item.FechaFin;

            const InicioReal = item?.RealFechaInicio
              ? new Date(item?.RealFechaInicio)?.toLocaleString("en-GB", {
                  hour12: false,
                })
              : "";
            const FinReal = item?.RealFechaFin
              ? new Date(item?.RealFechaFin)?.toLocaleString("en-GB", {
                  hour12: false,
                })
              : "";
            // const InicioReal = item?.RealFechaInicio;
            // const FinReal = item?.RealFechaFin;

            return (
              <View>
                <Text style={styles.infosubtitle}>
                  {item.Codigo}.- {item.NombreServicio}
                </Text>
                <Text> </Text>
                <View style={[styles.row2, styles.center]}>
                  <Text style={styles.info3}>{"Inicio Prog:  "}</Text>
                  <Text style={styles.info3}>{FechaInicio}</Text>
                </View>
                <View style={[styles.row2, styles.center]}>
                  <Text
                    style={styles.info5}
                    // onPress={() => updateRealDataInicioFin(item.Codigo)}

                    onPress={() => {
                      setRenderComponent(
                        <ChangeDisplayFechaReal
                          onClose={onCloseOpenModal}
                          setData={setData}
                          data={data}
                          codigo={item.Codigo}
                          tipo={"Inicio"}
                        />
                      );
                      onCloseOpenModal();
                    }}
                  >
                    {"Inicio Real:"}
                  </Text>
                  {InicioReal && <Text style={styles.info4}>{InicioReal}</Text>}
                </View>
                {/* <ChangeDisplayFechaFin /> */}
                <Text> </Text>
                <View style={[styles.row2, styles.center]}>
                  <Text style={styles.info3}>{"Fin Prog:  "}</Text>
                  <Text style={styles.info3}>{FechaFin}</Text>
                </View>
                <View style={[styles.row2, styles.center]}>
                  <Text
                    style={styles.info5}
                    onPress={() => {
                      setRenderComponent(
                        <ChangeDisplayFechaReal
                          onClose={onCloseOpenModal}
                          setData={setData}
                          data={data}
                          codigo={item.Codigo}
                          tipo={"Fin"}
                        />
                      );
                      onCloseOpenModal();
                    }}
                  >
                    {"Fin Real:"}
                  </Text>
                  {FinReal && <Text style={styles.info4}>{FinReal}</Text>}
                </View>
                <Text> </Text>
                <Text> </Text>
              </View>
            );
          }}
          keyExtractor={(item, index) => index.toString()}
          scrollEnabled={true}
        />
      </View>
    );
  };
  // //Algorithm to render the bar status
  // const BarProgress = (percentage: any) => {
  //   const TotalSizeCompleted = windowWidth - 20;
  //   const percentajeNormalized = (percentage * TotalSizeCompleted) / 100;

  //   return (
  //     <View style={{ flexDirection: "row", height: 10, margin: 10 }}>
  //       <View
  //         style={{
  //           backgroundColor:
  //             AvanceEjecucion >= AvanceProyected ? "blue" : "red",
  //           width: percentajeNormalized ? percentajeNormalized : 0,
  //           borderRadius: 5,
  //         }}
  //       />
  //     </View>
  //   );
  // };

  // go to edit screen
  const goToEditAITScreen = () => {
    router.push({
      pathname: "/search/EditAIT",
      params: {
        idServiciosAIT: idServiciosAIT,
        AreaServicio: AreaServicio,
        Monto: Monto,
        HorasHombre: HorasHombre,
        HHModificado: HHModificado,
        MontoModificado: MontoModificado,
        NuevaFechaEstimada: NuevaFechaEstimada,
        FechaFin: FechaFin,
        FechaInicio: FechaInicio,
        createdAt: createdAt,
        ResponsableEmpresaUsuario: ResponsableEmpresaUsuario,
        ResponsableEmpresaUsuario2: ResponsableEmpresaUsuario2,
        ResponsableEmpresaUsuario3: ResponsableEmpresaUsuario3,
        ResponsableEmpresaContratista: ResponsableEmpresaContratista,
        ResponsableEmpresaContratista2: ResponsableEmpresaContratista2,
        ResponsableEmpresaContratista3: ResponsableEmpresaContratista3,
        AvanceEjecucion: AvanceEjecucion,
        emailPerfil: emailPerfil,
        photoServiceURL: photoServiceURL,
        NombreServicio: NombreServicio,
        EmpresaMinera: EmpresaMinera,
        NumeroAIT: NumeroAIT,
        NumeroCotizacion: NumeroCotizacion,
        TipoServicio: TipoServicio,
        companyName: companyName,
        Moneda: Moneda,
      },
    });
  };

  const graphScreen = () => {
    router.push({
      pathname: "/search/Graph",
      // params: { item: item },
    });
  };

  const updateDates = async () => {
    if (windowWidth > 1000) {
      //delete the doc from events collections
      router.back();
      // await deleteDoc(doc(db, "events", idDoc));
    } else {
      //updating events in ServiciosAIT to filter the deleted event
      const Ref = doc(db, "ServiciosAIT", idServiciosAIT);
      const docSnapshot: any = await getDoc(Ref);
      const activitiesData = docSnapshot.data().activitiesData;

      // const filteredList = eventList.filter(
      //   (obj: any) => obj.idDocFirestoreDB !== idDocFirestoreDB
      // );

      const updatedData = {
        activitiesData: data,
      };

      await updateDoc(Ref, updatedData);
      router.back();

      Toast.show({
        type: "success",
        position: "bottom",
        text1: "Se ha guardado correctamente",
      });
    }
  };

  const finalizeService = async () => {
    Alert.alert(
      "Finalizar Servicio",
      "Estas Seguro que desear Finalizar la actividad?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Aceptar",
          onPress: async () => {
            Toast.show({
              type: "success",
              position: "bottom",
              text1: "Se ha Finalizado correctamente",
            });
          },
        },
      ],
      { cancelable: false }
    );
  };
  return (
    <KeyboardAwareScrollView style={{ backgroundColor: "white" }}>
      {(props.email === emailPerfil ||
        props.profile?.userType === "SuperUsuario") && (
        <TouchableOpacity onPress={() => goToEditAITScreen()}>
          <View style={{ marginRight: "2%" }}>
            <ImageExpo
              source={require("../../../assets/pictures/editIcon2.png")}
              style={styles.editIcon}
            />
          </View>
        </TouchableOpacity>
      )}
      {photoServiceURLDecoded ? (
        <View style={styles.center}>
          <ImageExpo
            source={{ uri: photoServiceURLDecoded }}
            style={styles.roundImage}
            cachePolicy={"memory-disk"}
          />
        </View>
      ) : null}
      <Text> </Text>
      <Text style={styles.name}>{NombreServicio}</Text>
      <Text> </Text>
      <View>
        <View style={[styles.row, styles.center]}>
          <Text style={styles.info}>{"Empresa Minera:  "}</Text>
          <Text style={styles.info2}>{EmpresaMinera}</Text>
        </View>
        <View style={[styles.row, styles.center]}>
          <Text style={styles.info}>{"Orden de servicio:  "}</Text>
          <Text style={styles.info2}>{NumeroAIT}</Text>
        </View>

        {/* <View style={[styles.row, styles.center]}>
          <Text style={styles.info}>{"Numero de Cotizacion:  "}</Text>
          <Text style={styles.info2}>{NumeroCotizacion}</Text>
        </View> */}
        <View style={[styles.row, styles.center]}>
          <Text style={styles.info}>{"Tipo de Servicio:  "}</Text>
          <Text style={styles.info2}>{TipoServicio}</Text>
        </View>

        {/* <View style={[styles.row, styles.center]}>
          <Text style={styles.info}>{"Area del Servicio:  "}</Text>
          <Text style={styles.info2}>{AreaServicio}</Text>
        </View> */}
        {/* <View style={[styles.row, styles.center]}>
          <Text style={styles.info}>{"Nombre de la Empresa:  "}</Text>
          <Text style={styles.info2}>{companyName}</Text>
        </View> */}
        {/* <View style={[styles.row, styles.center]}>
          <Text style={styles.info}>{"Creado por:  "}</Text>
          <Text style={styles.info2}>{emailPerfil}</Text>
        </View> */}

        {/* <View style={[styles.row, styles.center]}>
          <Text style={styles.info}>{"Monto de Cotizacion:  "}</Text>
          <Text style={styles.info2}>
            {formattedAmount} {Moneda}
          </Text>
        </View> */}

        <View style={[styles.row, styles.center]}>
          <Text style={styles.info}>{"Fecha de Inicio Planeado:  "}</Text>
          <Text style={styles.info2}>
            {/* {new Date(Number(FechaInicioISO)).toLocaleString()} */}

            {/* {FechaInicioISO && typeof FechaInicioISO === "string"
              ? new Date(Number(FechaInicioISO)).toLocaleString()
              : new Date(FechaInicio.seconds * 1000).toLocaleString()} */}

            {/* {FechaInicio?.seconds
              ? new Date(FechaInicio.seconds * 1000).toLocaleString()
              : FechaInicio} */}

            {
              typeof FechaInicio === "string"
                ? FechaInicio
                : new Date(FechaInicio.seconds * 1000).toISOString()
              // new Date(FechaInicio.seconds * 1000).toLocaleString()
            }
          </Text>
        </View>
        <View style={[styles.row, styles.center]}>
          <Text style={styles.info}>{"Fecha de Fin Planeado:  "}</Text>
          <Text style={styles.info2}>
            {typeof FechaFin === "string"
              ? FechaFin
              : new Date(FechaFin?.seconds * 1000).toLocaleString()}

            {/* {FechaFin.seconds
              ? new Date(FechaFin.seconds * 1000).toLocaleString()
              : FechaFin} */}
          </Text>
        </View>
        {/* 
        <View style={[styles.row, styles.center]}>
          <Text style={styles.info}>{"Horas Hombre Cotizadas:  "}</Text>
          <Text style={styles.info2}>
            {HorasHombre}
            {" HH"}
          </Text>
        </View> */}

        <View style={[styles.row, styles.center]}>
          <Text style={styles.info}>{"Avance Ejecucion Real:  "}</Text>
          <Text style={styles.info2}>
            {AvanceEjecucion}
            {" %"}
          </Text>
        </View>
        <Text> </Text>

        {/* {BarProgress(AvanceEjecucion)} */}
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          <Progress.Bar progress={AvanceEjecucion / 100} width={250} />
        </View>
        <Text> </Text>

        <View style={[styles.row, styles.center]}>
          <Text style={styles.info}>{"Personal Cotizado:  "}</Text>
          {/* <Text style={styles.info2}>
            {AvanceEjecucion}
            {" %"}
          </Text> */}
        </View>
        <View style={[styles.row, styles.center]}>
          <Text style={styles.subinfo}>
            {"Supervisor Mecánico:  "} {Supervisor}
          </Text>
        </View>
        <View style={[styles.row, styles.center]}>
          <Text style={styles.subinfo}>
            {"Supervisor de Seguridad:  "} {SupervisorSeguridad}
          </Text>
        </View>
        <View style={[styles.row, styles.center]}>
          <Text style={styles.subinfo}>
            {"Lider Mecánico:  "} {Lider}
          </Text>
        </View>
        <View style={[styles.row, styles.center]}>
          <Text style={styles.subinfo}>
            {"Mecánico:  "} {Tecnicos}
          </Text>
        </View>
        <View style={[styles.row, styles.center]}>
          <Text style={styles.subinfo}>
            {"Soldador:  "} {Soldador}
          </Text>
        </View>
        <Text> </Text>
        <View style={[styles.row, styles.center]}>
          <Text style={styles.info}>{"Horas Hombre Cotizado:  "}</Text>
          {/* <Text style={styles.info2}>
            {AvanceEjecucion}
            {" %"}
          </Text> */}
        </View>
        <View style={[styles.row, styles.center]}>
          <Text style={styles.subinfo}>
            {"Supervisor Mecánico:  "} {Supervisor * Number(HorasTotales)}
          </Text>
        </View>
        <View style={[styles.row, styles.center]}>
          <Text style={styles.subinfo}>
            {"Supervisor de Seguridad:  "}{" "}
            {SupervisorSeguridad * Number(HorasTotales)}
          </Text>
        </View>
        <View style={[styles.row, styles.center]}>
          <Text style={styles.subinfo}>
            {"Lider Mecánico:  "} {Lider * Number(HorasTotales)}
          </Text>
        </View>
        <View style={[styles.row, styles.center]}>
          <Text style={styles.subinfo}>
            {"Mecánico:  "} {Tecnicos * Number(HorasTotales)}
          </Text>
        </View>
        <View style={[styles.row, styles.center]}>
          <Text style={styles.subinfo}>
            {"Soldador:  "} {Soldador * Number(HorasTotales)}
          </Text>
        </View>
        {/* <View style={[styles.row, styles.center]}>
          <Text style={styles.subinfo}>
            {"Ayudante:  "} {"df"}
          </Text>
        </View> */}
        <Text> </Text>
        {/* <Text style={styles.info}>{"Tareo:  "}</Text> */}

        {/* <View style={[styles.row, styles.center]}>
          <Text style={styles.info}>{"Avance Ejecucion Proyectado:  "}</Text>
          {AvanceProyected > 0 ? (
            <>
              {" "}
              <Text style={styles.info2}>
                {AvanceProyected.toFixed(2)}
                {" %"}
              </Text>{" "}
            </>
          ) : (
            <Text style={styles.info2}>0{" %"}</Text>
          )}
        </View> */}
        <Text> </Text>

        {/* {BarProgress(AvanceProyected)} */}
        {/* <View style={{ flexDirection: "row", justifyContent: "center" }}>
          <Progress.Bar progress={AvanceProyected / 100} width={250} />
        </View> */}

        <Text> </Text>
        {/* 
        <Text style={styles.info}>
          {"Administrador de Contratos Minera:  "}
        </Text> */}
        {/* {ResposableList(UsuarioAdministrador)} */}
        {/* <Text style={styles.info}>{"Planeamiento Minera:  "}</Text>
        {ResposableList(UsuarioPlaneamiento)} */}
        <Text> </Text>
        <Text> </Text>

        {/* <Text> </Text>
        <Text> </Text> */}
        {/* <Progress.Pie progress={0.4} size={50} />
        <Progress.Circle size={30} indeterminate={true} />
        <Progress.CircleSnail color={["red", "green", "blue"]} /> */}
        {TipoServicio === "Molino de Bolas" && (
          <>
            <Text style={styles.name2}>DIAGRAMA</Text>
            <Text> </Text>

            {/* <ImageExpo
              source={require("../../../assets/screens/tapaSAG.jpg")}
              style={{ width: 350, height: 300 }}
              cachePolicy={"memory-disk"}
            /> */}
            <TouchableOpacity onPress={() => graphScreen()}>
              <ImageExpo
                source={require("../../../assets/screens/mol2.jpg")}
                style={{ width: 350, height: 350 }}
                cachePolicy={"memory-disk"}
              />
            </TouchableOpacity>
          </>
        )}
        {TipoServicio === "Molino SAG" && (
          <>
            <Text style={styles.name2}>DIAGRAMA</Text>
            <Text> </Text>
            <ImageExpo
              source={require("../../../assets/screens/sag.png")}
              style={{ width: 350, height: 300 }}
              cachePolicy={"memory-disk"}
            />
          </>
        )}
        {TipoServicio === "Chancadora Primaria" && (
          <>
            <Text style={styles.name2}>DIAGRAMA</Text>
            <Text> </Text>
            <ImageExpo
              source={require("../../../assets/screens/dumpPocket.png")}
              style={{ width: 350, height: 300 }}
              cachePolicy={"memory-disk"}
            />
          </>
        )}
        <Text> </Text>
        <Text> </Text>

        <Text style={styles.name2}>CURVA S</Text>

        <Text> </Text>
        <CurvaS
          HorasTotales={HorasTotales}
          AvanceEventos={JSON.parse(AvanceEventos)}
        />
        <Text> </Text>
        <Text> </Text>

        {TipoServicio === "Parada de Planta" && (
          <>
            <Text style={styles.name2}>REPORTE DE ACTIVIDADES</Text>
            <Text> </Text>
            {activitiesList(data)}
            <Text> </Text>

            {windowWidth < 1000 && (
              <View style={{ width: "50%", alignSelf: "center" }}>
                <Button
                  title="Guardar las fechas reales"
                  // style={styles.info}
                  // buttonStyle={styles.btn}
                  // buttonStyle={{}} // Corrected prop name

                  // buttonStyle={styles.btn} // Corrected prop name
                  onPress={() => updateDates()}
                />
              </View>
            )}
            <Text> </Text>
            <Text> </Text>
            <Text> </Text>

            {windowWidth > 1000 && (
              <View style={{ width: "20%", alignSelf: "center" }}>
                <Button
                  title="Finalizar Servicio"
                  // onPress={() => finalizeService()}
                  onPress={async () => {
                    const confirmed = window.confirm(
                      "¿Estás seguro de que deseas finalizar el servicio?"
                    );
                    if (confirmed) {
                      await finalizeService();
                    }
                  }}
                />
              </View>
            )}
          </>
        )}

        <Text> </Text>

        <Text style={styles.name2}>RECURSOS HUMANOS</Text>
        <Text> </Text>

        {events && <BarChartTareo data={JSON.parse(tareo)} />}

        <Text> </Text>

        <Text> </Text>
        <Text> </Text>

        <Text style={styles.name2}>RESPONSABLES</Text>
        <Text> </Text>
        <Text style={styles.info}>{"Mantenimiento Minera:  "}</Text>
        {ResposableList(UsuarioMantenimiento)}

        {/* <Text style={styles.info}>{"Gerente Contratista:  "}</Text>
        {ResposableList(ContratistaGerente)}
        <Text style={styles.info}>{"Planificador Contratista:  "}</Text>
        {ResposableList(ContratistaPlanificador)} */}
        <Text style={styles.info}>{"Supervisores Contratista:  "}</Text>
        {ResposableList(ContratistaSupervisor)}
        <Text> </Text>
      </View>
      <Modal show={showModal} close={onCloseOpenModal}>
        {renderComponent}
      </Modal>
    </KeyboardAwareScrollView>
  );
}

const mapStateToProps = (reducers: any) => {
  return {
    email: reducers.profile.email,
    profile: reducers.profile.profile,
  };
};

const MoreDetail = connect(mapStateToProps, {
  // saveActualEquipment,
  EquipmentListUpper,
})(MoreDetailScreenNoRedux);

export default MoreDetail;
