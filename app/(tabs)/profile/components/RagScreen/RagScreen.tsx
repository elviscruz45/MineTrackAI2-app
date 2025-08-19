import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  ColorValue,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from "react-native";
import { Image as ImageExpo } from "expo-image";
import { styles } from "./RagScreen.styles";
import { connect } from "react-redux";
import { Feather } from "@expo/vector-icons";
import axios from "axios";
import { LoadingSpinner } from "@/components/LoadingSpinner";

// Define message type
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface RagScreenProps {
  isModal?: boolean;
}

function RagScreenBare({ isModal = true }: RagScreenProps) {
  const [sourceId, setSourceId] = useState("src_SlffbbdYgjBVAXDXjdNF0");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [pregunta, setPregunta] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const addPdfUrl = async () => {
      try {
        setIsLoading(true);
        const response = await axios.post(
          "https://api.chatpdf.com/v1/sources/add-url",
          {
            url: "https://firebasestorage.googleapis.com/v0/b/fh-servicios.firebasestorage.app/o/pdfPost%2FPARADA%20DE%20PLANTA.pdf?alt=media&token=c427c68e-825d-4cec-9c33-424e4efcbf22",
          },
          {
            headers: {
              "x-api-key":
                process.env.EXPO_PUBLIC_CHATPDF_API_KEY ||
                "sec_dBMhcmZhRXPUT8NUmLeqAMEtcqVlNiqr",
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Source ID:", response.data.sourceId);
        setSourceId(response.data.sourceId);
        setIsLoading(false);
      } catch (error) {
        console.error("Error adding PDF:", error);
        setIsLoading(false);
      }
    };

    addPdfUrl();
  }, []);

  const chatPDF = async (pregunta: string) => {
    if (!pregunta.trim()) return;

    setIsLoading(true);

    // Add user question to chat history
    const newMessage: ChatMessage = {
      role: "user",
      content: pregunta,
    };

    setChatHistory((prevHistory) => [...prevHistory, newMessage]);
    setPregunta(""); // Clear input field

    try {
      const response = await axios.post(
        "https://api.chatpdf.com/v1/chats/message",
        {
          sourceId: sourceId,
          messages: [
            {
              role: "user",
              content:
                "Si te pregunto quien eres tu respondes que eres el agente de mantenimiento MineTrack AI y eres un ingeniero de planificacion de mantenimiento y responde esta pregunta:" +
                pregunta,
            },
          ],
        },
        {
          headers: {
            "x-api-key":
              process.env.EXPO_PUBLIC_CHATPDF_API_KEY ||
              "sec_dBMhcmZhRXPUT8NUmLeqAMEtcqVlNiqr",
            "Content-Type": "application/json",
          },
        }
      );

      // Add AI response to chat history
      const aiResponse: ChatMessage = {
        role: "assistant",
        content: response.data.content,
      };

      setChatHistory((prevHistory) => [...prevHistory, aiResponse]);
      setIsLoading(false);
    } catch (error) {
      console.error("Error sending chat message:", error);
      setIsLoading(false);

      // Add error message to chat history
      const errorMessage: ChatMessage = {
        role: "assistant",
        content:
          "Lo siento, ocurrió un error al procesar tu pregunta. Por favor, intenta nuevamente.",
      };

      setChatHistory((prevHistory) => [...prevHistory, errorMessage]);
    }
  };

  // Handle Enter key press in web
  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>
  ) => {
    if (Platform.OS === "web" && e.nativeEvent.key === "Enter") {
      e.preventDefault?.();
      chatPDF(pregunta);
    }
  };

  const getMessageTextColor = (role: "user" | "assistant"): string => {
    return role === "user" ? "#ffffff" : "#111827";
  };

  return (
    <View style={[styles.container, webStyles.container]}>
      <View style={webStyles.header}>
        <Text style={webStyles.title}>
          Asistente de Planificación de Mantenimiento
        </Text>
        <Text style={webStyles.subtitle}>
          Consulta información sobre la parada de planta concentradora
        </Text>
      </View>

      <View style={webStyles.chatContainer}>
        <View
          style={[
            webStyles.sidebar,
            { display: Platform.OS === "web" ? "flex" : "none" },
          ]}
        >
          <View style={webStyles.profileSection}>
            <ImageExpo
              source={require("../../../../../assets/screens/robot.jpg")}
              style={webStyles.avatar}
              cachePolicy={"memory-disk"}
            />
            <Text style={webStyles.botName}>MineTrack AI</Text>
            <Text style={webStyles.botDescription}>
              Especialista en planificación de mantenimiento
            </Text>
          </View>

          {/* <View style={webStyles.documentInfo}>
            <Text style={webStyles.documentTitle}>Documento Cargado:</Text>
            <View style={webStyles.documentCard}>
              <Feather name="file-text" size={24} color="#2A3B76" />
              <Text style={webStyles.documentName}>PARADA DE PLANTA.pdf</Text>
            </View>
          </View> */}
        </View>

        <View style={webStyles.chatSection}>
          <ScrollView
            style={webStyles.messagesContainer}
            contentContainerStyle={webStyles.messagesContent}
          >
            {chatHistory.length === 0 ? (
              <View style={webStyles.emptyChat}>
                <Feather name="message-circle" size={48} color="#d1d5db" />
                <Text style={webStyles.emptyChatText}>
                  Haz una pregunta para comenzar la conversación
                </Text>
                <View style={webStyles.suggestionContainer}>
                  <TouchableOpacity
                    style={webStyles.suggestionButton}
                    onPress={() =>
                      chatPDF(
                        "¿Cuáles son las actividades programadas para el alimentador Pebbles 3M?"
                      )
                    }
                  >
                    <Text style={webStyles.suggestionText}>
                      ¿Cuáles son las actividades para el alimentador Pebbles
                      3M?
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={webStyles.suggestionButton}
                    onPress={() =>
                      chatPDF("¿Cuánto tiempo dura la parada de planta?")
                    }
                  >
                    <Text style={webStyles.suggestionText}>
                      ¿Cuánto tiempo dura la parada de planta?
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              chatHistory.map((message, index) => (
                <View
                  key={index}
                  style={[
                    webStyles.messageItem,
                    message.role === "user"
                      ? webStyles.userMessage
                      : webStyles.aiMessage,
                  ]}
                >
                  <View style={webStyles.messageBubble}>
                    {message.role === "user" ? (
                      <View style={webStyles.userBubble}>
                        <Text
                          style={[
                            webStyles.messageText,
                            { color: getMessageTextColor(message.role) },
                          ]}
                        >
                          {message.content}
                        </Text>
                      </View>
                    ) : (
                      <View style={webStyles.aiBubble}>
                        <Text
                          style={[
                            webStyles.messageText,
                            { color: getMessageTextColor(message.role) },
                          ]}
                        >
                          {message.content}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ))
            )}
            {isLoading && (
              <View style={webStyles.loadingContainer}>
                <LoadingSpinner />
              </View>
            )}
          </ScrollView>

          <View style={webStyles.inputContainer}>
            <TextInput
              style={webStyles.input}
              placeholder="Ingresa tu pregunta sobre la parada de planta..."
              value={pregunta}
              onChangeText={(text) => setPregunta(text)}
              multiline={Platform.OS === "web"}
              onKeyPress={handleKeyPress}
            />
            <TouchableOpacity
              onPress={() => chatPDF(pregunta)}
              style={webStyles.sendButton}
              disabled={isLoading || !pregunta.trim()}
            >
              <Feather name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const mapStateToProps = (reducers: any) => {
  return {
    email: reducers.profile.email,
    profile: reducers.profile.profile,
  };
};

// Modern web styles for the RAG screen
const webStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    padding: 24,
    backgroundColor: "#2A3B76",
    alignItems: "center" as const,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "white",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center" as const,
  },
  chatContainer: {
    flexDirection: "row" as const,
    flex: 1,
  },
  sidebar: {
    width: 300,
    backgroundColor: "#ffffff",
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
    padding: 24,
  },
  profileSection: {
    alignItems: "center" as const,
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  botName: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#111827",
    marginBottom: 4,
  },
  botDescription: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center" as const,
  },
  documentInfo: {
    marginTop: 8,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#111827",
    marginBottom: 12,
  },
  documentCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 10,
  },
  documentName: {
    fontSize: 14,
    color: "#4b5563",
    flexShrink: 1,
  },
  chatSection: {
    flex: 1,
    flexDirection: "column" as const,
  },
  messagesContainer: {
    flex: 1,
    padding: 20,
  },
  messagesContent: {
    paddingBottom: 20,
  },
  emptyChat: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    minHeight: 400,
  },
  emptyChatText: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 16,
    marginBottom: 24,
  },
  suggestionContainer: {
    flexDirection: "column" as const,
    gap: 12,
    width: "100%",
    maxWidth: 500,
  },
  suggestionButton: {
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  suggestionText: {
    fontSize: 14,
    color: "#4b5563",
  },
  messageItem: {
    marginBottom: 16,
    width: "80%",
  },
  userMessage: {
    alignSelf: "flex-end" as const,
  },
  aiMessage: {
    alignSelf: "flex-start" as const,
  },
  messageBubble: {
    borderRadius: 18,
    padding: 2,
  },
  userBubble: {
    backgroundColor: "#2A3B76",
    borderRadius: 18,
    padding: 12,
  },
  aiBubble: {
    backgroundColor: "#f3f4f6",
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  loadingContainer: {
    alignItems: "center" as const,
    margin: 20,
  },
  inputContainer: {
    flexDirection: "row" as const,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  input: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    minHeight: 48,
    maxHeight: Platform.OS === "web" ? 120 : 48,
  },
  sendButton: {
    backgroundColor: "#2A3B76",
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginLeft: 12,
  },
});

export const RagScreen = connect(mapStateToProps, {})(RagScreenBare);
