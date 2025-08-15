import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Linking,
  Alert,
  TextInput,
  ScrollView,
} from "react-native";
import { Image as ImageExpo } from "expo-image";
import { styles } from "./RagScreen.styles";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { connect } from "react-redux";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Toast from "react-native-toast-message";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { Icon } from "@rneui/themed";
import { Feather } from "@expo/vector-icons";
import axios from "axios";
import OpenAI from "openai";
import { LoadingSpinner } from "@/components/LoadingSpinner";

function RagScreenBare() {
  const [sourceId, setSourceId] = useState("src_SlffbbdYgjBVAXDXjdNF0");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [content, setContent] = useState("");
  const [pregunta, setPregunta] = useState("");

  // const {
  //   route: {
  //     params: { url, titulo },
  //   },
  // } = props;

  // const openai = new OpenAI({
  //   apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || "", // Use environment variable
  // });

  useEffect(() => {
    const addPdfUrl = async () => {
      try {
        const response = await axios.post(
          "https://api.chatpdf.com/v1/sources/add-url",
          //--------------------------------------------------------------
          //--------------------------------------------------------------
          //--------------------------------------------------------------
          //--------------------------------------------------------------
          {
            //url: "https://drive.google.com/file/d/19UCohJgpxyJKeELxY9457QGzXYJsLc4J/view?usp=sharing", //modificar

            url: "https://firebasestorage.googleapis.com/v0/b/antapaccay-app.firebasestorage.app/o/Gantt_primrio.pdf?alt=media&token=b0ff7fd7-712a-41c5-a833-feef0da0d098", //modificar
          },
          //--------------------------------------------------------------
          //--------------------------------------------------------------
          //--------------------------------------------------------------
          //--------------------------------------------------------------
          {
            headers: {
              "x-api-key":
                process.env.EXPO_PUBLIC_CHATPDF_API_KEY ||
                "sec_dBMhcmZhRXPUT8NUmLeqAMEtcqVlNiqr", // Use environment variable
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Sourceeeeee ID:", response.data.sourceId);

        setSourceId(response.data.sourceId);
      } catch (error) {
        console.error("Error adding PDF:", error);
      }
    };

    addPdfUrl();
  }, []);

  // const chatWithGPT = async (pregunta: any) => {
  //   try {
  //     const completion = await openai.chat.completions.create({
  //       model: "gpt-4o-mini",
  //       messages: [
  //         {
  //           role: "system",
  //           content:
  //             "Eres un experto Ingenieero Mecanico Electrico , tu nombre es CONIMERA-2024",
  //         },
  //         {
  //           role: "user",
  //           content: pregunta,
  //         },
  //       ],
  //     });
  //     setContent(completion.choices[0].message.content);
  //   } catch (error) {
  //     console.error("Error chatting with GPT:", error);
  //   }
  // };
  const chatPDF = async (pregunta: string) => {
    setIsLoading(true);

    try {
      const response = await axios.post(
        "https://api.chatpdf.com/v1/chats/message",
        {
          sourceId: sourceId,
          messages: [
            {
              role: "user",
              content:
                "Si te pregunto quien eres tu respondes que eres el agente de IA para Antapaccay. Este proyecto es una lista de actividades de mantenimiento de una parada de planta concentradora y Eres un ingeniero de planificacion de mantenimiento, responde esta pregunta:" +
                pregunta,
            },
          ],
        },
        {
          headers: {
            "x-api-key":
              process.env.EXPO_PUBLIC_CHATPDF_API_KEY ||
              "sec_dBMhcmZhRXPUT8NUmLeqAMEtcqVlNiqr", // Use environment variable
            "Content-Type": "application/json",
          },
        }
      );

      setContent(response.data.content);
      setIsLoading(false);

      // return response.data.content;
    } catch (error) {
      // console.error("Error sending chat message:", error);
      setIsLoading(false);
      setContent("error");
    }
  };

  return (
    <>
      {/* <KeyboardAwareScrollView
        style={{ backgroundColor: "white" }} // Add backgroundColor here
        showsVerticalScrollIndicator={false}
      > */}
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
          Titulo:
        </Text> */}
      <Text
        style={{
          // color: "black",
          // fontWeight: "700",
          alignSelf: "center",
          // fontSize: 20,
          paddingHorizontal: 5,
        }}
      >
        {/* {titulo} */}
      </Text>

      <View>
        <ImageExpo
          source={require("../../../../../assets/screens/robot.jpg")}
          style={styles.roundImage1000}
          cachePolicy={"memory-disk"}
        />
      </View>
      <View style={styles.commentContainer}>
        {/* <ImageExpo
          source={{ uri: props.user_photo }}
          style={styles.roundImage}
          cachePolicy={"memory-disk"}
        /> */}
        <TextInput
          style={styles.input}
          placeholder="Ingresa tu pregunta"
          value={pregunta}
          onChangeText={(text) => setPregunta(text)}
        />
        <TouchableOpacity
          onPress={() => chatPDF(pregunta)}
          style={styles.sendButton}
        >
          <Feather name="send" size={16} color="white" />
        </TouchableOpacity>
      </View>
      <Text></Text>

      <Text
        style={{
          // color: "black",
          fontWeight: "700",
          alignSelf: "center",
          // fontSize: 20,
          paddingHorizontal: 5,
        }}
      >
        Respuesta:
      </Text>
      <Text></Text>

      {isLoading && <LoadingSpinner />}
      <Text
        style={{
          marginHorizontal: "5%",
        }}
      >
        {content}
      </Text>

      <Text></Text>

      <Text></Text>
      {/* </KeyboardAwareScrollView> */}
    </>
  );
}

const mapStateToProps = (reducers: any) => {
  return {
    email: reducers.profile.email,
    profile: reducers.profile.profile,
    // servicesData: reducers.home.servicesData,
    // totalEventServiceAITLIST: reducers.home.totalEventServiceAITLIST,
  };
};

export const RagScreen = connect(mapStateToProps, {})(RagScreenBare);
