import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
  Text,
  SafeAreaView,
  TextInput,
} from "react-native";
import { Button } from "@rneui/themed";
import { getAuth, signOut } from "firebase/auth";
import ConnectedInfoUser from "../../../components/InfoUser/InfoUser";
import styles from "./index.styles";
import { connect } from "react-redux";
import { update_firebaseUserUid } from "../../../redux/actions/auth";
import ConnectedChangeDisplayNameForm from "./components/ChangeDisplayNameForm/ChangeDisplayNameForm";
import { Modal } from "@/components/Modal/Modal";
import { update_firebaseProfile } from "../../../redux/actions/profile";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { Image as ImageExpo } from "expo-image";
import { screen } from "../../../utils";
import ProfileDateScreen from "./components/ProfileDateScreen/ProfileDateScreen";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Tabs, Redirect } from "expo-router";
import { Feather } from "@expo/vector-icons";
// import OpenAI from "openai";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { RagScreen } from "./components/RagScreen/RagScreen";
import { titulo_proyecto } from "../../../redux/actions/auth";
function capitalizeFirstLetter(str: any) {
  return str?.charAt(0).toUpperCase() + str?.slice(1);
}
function ProfileRaw(props: any) {
  // const openai = new OpenAI({
  //   apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '', // Use environment variable
  // });
  const [showModal, setShowModal] = useState(false);
  const [showRagModal, setShowRagModal] = useState(false);
  const [renderComponent, setRenderComponent] = useState<any>(null);
  const [post, setPost] = useState(null);
  //states of filters
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [removeFilter, setRemoveFilter] = useState(true);
  const [pregunta, setPregunta] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState("");

  const regex = /@(.+?)\./i;
  const companyName =
    capitalizeFirstLetter(props.email?.match(regex)?.[1]) || "Anonimo";

  const onCloseOpenModal = () => setShowModal((prevState) => !prevState);

  const update_Data = () => {
    setRenderComponent(
      <ConnectedChangeDisplayNameForm onClose={onCloseOpenModal} />
    );
    setShowModal(true);
  };

  //Changing the value to activate again the filter to rende the posts
  const filter = (start: any, end: any) => {
    setStartDate(start);
    setEndDate(end);
  };
  const quitfilter = () => {
    setRemoveFilter((prev) => !prev);
    setStartDate(null);
    setEndDate(null);
  };

  useEffect(() => {
    let q;
    if (startDate && endDate) {
      async function fetchData() {
        q = query(collection(db, "events"), orderBy("createdAt", "desc"));

        try {
          const querySnapshot = await getDocs(q);
          const lista: any = [];
          querySnapshot.forEach((doc) => {
            lista.push(doc.data());
          });

          setPost(lista);
        } catch (error) {
          console.error("Error fetching data: ", error);
        }
      }

      // fetchData();
    }
  }, [startDate, endDate]);

  const comentPost = (item: any) => {
    // navigation.navigate(screen.home.tab, {
    //   screen: screen.home.comment,
    //   params: { Item: item },
    // });
  };
  const logout = async () => {
    const auth = getAuth();
    await signOut(auth);
    props.update_firebaseUserUid("");

    props.titulo_proyecto("");
    return <Redirect href="/" />;
  };
  return (
    <SafeAreaView
      style={[{ flex: 1, backgroundColor: "white" }, styles.AndroidSafeArea]}
    >
      <KeyboardAwareScrollView
        style={{ backgroundColor: "white" }} // Add backgroundColor here
        showsVerticalScrollIndicator={false}
      >
        <Text> </Text>
        <ConnectedInfoUser />
        <Text> </Text>
        <Text> </Text>

        <Text> </Text>

        <Text> </Text>

        <Text> </Text>

        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            alignSelf: "center",
          }}
        >
          <Button
            title="Editar"
            buttonStyle={styles.btnActualizarStyles}
            titleStyle={styles.btnTextStyle}
            onPress={() => update_Data()}
          />
          <Text> </Text>
          <Text> </Text>
          <Text> </Text>
          <Text> </Text>
          <Text> </Text>

          <Button
            title="Cerrar "
            buttonStyle={styles.btncerrarStyles}
            titleStyle={styles.btnTextStyle}
            onPress={() => logout()}
          />
        </View>

        <View style={styles.aiAssistantSection}>
          <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>
            Asistente de Mantenimiento IA
          </Text>
          <Text style={styles.aiAssistantDescription}>
            Consulta información sobre paradas de planta y mantenimiento
            utilizando nuestro asistente de IA.
          </Text>
          <Button
            icon={
              <Feather
                name="cpu"
                size={16}
                color="white"
                style={{ marginRight: 8 }}
              />
            }
            title="Abrir Asistente IA"
            buttonStyle={styles.aiAssistantButton}
            titleStyle={styles.aiAssistantButtonText}
            onPress={() => setShowRagModal(true)}
          />
        </View>

        {/* <ProfileDateScreen
          filterButton={filter}
          quitFilterButton={quitfilter}
        /> */}
        {/* <View>
          <ImageExpo
            source={require("../../../assets/screens/robot.jpg")}
            style={styles.roundImage1000}
            cachePolicy={"memory-disk"}
          />
        </View> */}

        {/* <View style={styles.commentContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu pregunta"
            value={pregunta}
            onChangeText={(text) => setPregunta(text)}
          />
          <TouchableOpacity
            onPress={() => chatWithGPT(pregunta)}
            style={styles.sendButton}
          >
            <Feather name="send" size={16} color="white" />
          </TouchableOpacity>
        </View> */}
        <Text></Text>

        {/* <Text
          style={{
            // color: "black",
            fontWeight: "700",
            alignSelf: "center",
            // fontSize: 20,
            paddingHorizontal: 5,
          }}
        >
          Respuesta:
        </Text> */}
        <Text></Text>

        {/* {isLoading && <LoadingSpinner />} */}
        {/* <Text
          style={{
            marginHorizontal: "3%",
          }}
        >
          {content}
        </Text> */}

        <Text></Text>

        <Text></Text>
        <Text> </Text>
        <Text
          style={{
            borderRadius: 5,
            fontWeight: "700",
            alignSelf: "center",
            fontSize: 18,
            color: "#2A3B76",
            marginBottom: 15,
          }}
        >
          Estadísticas de uso
        </Text>

        <View style={styles.statsContainer}>
          {/* Reports Stats */}
          <View style={styles.statCard}>
            <View
              style={[styles.statIconContainer, { backgroundColor: "#E6F7FF" }]}
            >
              <Feather name="file-text" size={24} color="#1890FF" />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.statValue}>124</Text>
              <Text style={styles.statLabel}>Informes generados</Text>
            </View>
          </View>

          {/* Events Stats */}
          <View style={styles.statCard}>
            <View
              style={[styles.statIconContainer, { backgroundColor: "#F6FFED" }]}
            >
              <Feather name="calendar" size={24} color="#52C41A" />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.statValue}>57</Text>
              <Text style={styles.statLabel}>Eventos registrados</Text>
            </View>
          </View>

          {/* Active Projects */}
          <View style={styles.statCard}>
            <View
              style={[styles.statIconContainer, { backgroundColor: "#FFF7E6" }]}
            >
              <Feather name="briefcase" size={24} color="#FA8C16" />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.statValue}>8</Text>
              <Text style={styles.statLabel}>Proyectos activos</Text>
            </View>
          </View>

          {/* Completed Maintenance */}
          <View style={styles.statCard}>
            <View
              style={[styles.statIconContainer, { backgroundColor: "#F9F0FF" }]}
            >
              <Feather name="check-circle" size={24} color="#722ED1" />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.statValue}>36</Text>
              <Text style={styles.statLabel}>Mantenimientos completados</Text>
            </View>
          </View>
        </View>

        {/* Activity Summary */}
        <View style={styles.activitySummary}>
          <Text style={styles.sectionTitle}>Resumen de actividad</Text>

          {/* Activity Bar Chart */}
          <View style={styles.barChartContainer}>
            {[65, 40, 85, 30, 60, 45, 75].map((value, index) => (
              <View key={index} style={styles.barChartColumn}>
                <View style={styles.barLabelContainer}>
                  <Text style={styles.barValue}>{value}</Text>
                </View>
                <View
                  style={[
                    styles.bar,
                    {
                      height: value * 1.5,
                      backgroundColor: index === 2 ? "#1890FF" : "#E6F7FF",
                    },
                  ]}
                />
                <Text style={styles.barLabel}>
                  {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][index]}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.recentActivityContainer}>
          <Text style={styles.sectionTitle}>Actividad reciente</Text>

          {/* Recent Activity Items */}
          {[
            {
              type: "report",
              title: "Informe de mantenimiento preventivo",
              date: "12 Jul",
            },
            {
              type: "event",
              title: "Reparación bomba hidráulica",
              date: "10 Jul",
            },
            {
              type: "project",
              title: "Ampliación planta procesadora",
              date: "8 Jul",
            },
          ].map((item, index) => (
            <View key={index} style={styles.activityItem}>
              <View
                style={[
                  styles.activityIcon,
                  {
                    backgroundColor:
                      item.type === "report"
                        ? "#E6F7FF"
                        : item.type === "event"
                        ? "#F6FFED"
                        : "#FFF7E6",
                  },
                ]}
              >
                <Feather
                  name={
                    item.type === "report"
                      ? "file-text"
                      : item.type === "event"
                      ? "calendar"
                      : "briefcase"
                  }
                  size={16}
                  color={
                    item.type === "report"
                      ? "#1890FF"
                      : item.type === "event"
                      ? "#52C41A"
                      : "#FA8C16"
                  }
                />
              </View>
              <View style={styles.activityDetails}>
                <Text style={styles.activityTitle}>{item.title}</Text>
                <Text style={styles.activityDate}>{item.date}</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#CCC" />
            </View>
          ))}
        </View>

        <Text> </Text>
        {/* <FlatList
            data={post}
            scrollEnabled={false}
            renderItem={({ item, index }) => {
              return (
                <TouchableOpacity onPress={() => comentPost(item)}>
                  <View>
                    <View style={styles.equipments2}>
                      <ImageExpo
                        source={{ uri: item.fotoPrincipal }}
                        style={styles.image2}
                        cachePolicy={"memory-disk"}
                      />
                      <View style={{ marginLeft: 5 }}>
                        <Text style={styles.name2}>
                          {item.AITNombreServicio}
                        </Text>
                        <Text style={styles.name2}>
                          {"Evento: "}
                          {item.titulo}
                        </Text>
                        <Text style={styles.info2}>{item.comentarios}</Text>
                        <Text style={styles.info2}>
                          {item.fechaPostFormato}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
            keyExtractor={(item, index) => `${index}-${item.fechaPostFormato}`}
          /> */}
      </KeyboardAwareScrollView>
      <Modal show={showModal} close={onCloseOpenModal}>
        {renderComponent}
      </Modal>

      {/* RAG AI Assistant Modal */}
      <Modal show={showRagModal} close={() => setShowRagModal(false)}>
        <View style={styles.ragModalContainer}>
          <TouchableOpacity
            style={styles.ragModalCloseButton}
            onPress={() => setShowRagModal(false)}
            accessibilityLabel="Cerrar asistente IA"
          >
            <Feather name="x" size={20} color="#333" />
          </TouchableOpacity>
          <RagScreen />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const mapStateToProps = (reducers: any) => {
  return {
    profile: reducers.profile.firebase_user_name,
    email: reducers.profile.email,
    approvalQuantity: reducers.profile.approvalQuantity,
    approvalList: reducers.home.approvalList,
    totalEventServiceAITLIST: reducers.home.totalEventServiceAITLIST,
  };
};

const Profile = connect(mapStateToProps, {
  update_firebaseUserUid,
  update_firebaseProfile,
  titulo_proyecto,
})(ProfileRaw);

export default Profile;
