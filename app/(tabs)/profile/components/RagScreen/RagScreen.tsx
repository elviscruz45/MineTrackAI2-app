import React, { useState } from "react";
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
} from "react-native";
import { Image as ImageExpo } from "expo-image";
import { styles } from "./RagScreen.styles";
import { connect } from "react-redux";
import { FeatherIcon as Feather } from "@/components/FeatherIcon";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { queryRag } from "@/lib/rag/queryRag";
import { supabase } from "@/lib/supabase";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  mode?: string;
}

interface RagScreenProps {
  isModal?: boolean;
  embedded?: boolean;
}

function RagScreenBare({ isModal = true, embedded = false }: RagScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [pregunta, setPregunta] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const askQuestion = async (question: string) => {
    if (!question.trim()) return;

    setIsLoading(true);
    const userMessage: ChatMessage = { role: "user", content: question };
    setChatHistory((prev) => [...prev, userMessage]);
    setPregunta("");

    try {
      let answer: string;
      let mode = "hybrid";

      try {
        const { data, error } = await supabase.functions.invoke("rag-query", {
          body: { question },
        });
        if (!error && data?.answer) {
          answer = data.answer;
          mode = data.mode ?? "edge";
        } else {
          throw new Error(error?.message ?? "Edge function unavailable");
        }
      } catch {
        const result = await queryRag(question);
        answer = result.answer;
        mode = result.mode;
      }

      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: answer, mode },
      ]);
    } catch (error) {
      console.error("RAG error:", error);
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "No pude consultar la base de datos. Verifica la conexión y que las migraciones RAG estén aplicadas (006_rag_knowledge.sql).",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>
  ) => {
    if (Platform.OS === "web" && e.nativeEvent.key === "Enter") {
      e.preventDefault?.();
      askQuestion(pregunta);
    }
  };

  const getMessageTextColor = (role: "user" | "assistant"): string =>
    role === "user" ? "#ffffff" : "#111827";

  const suggestions = [
    "¿Qué trabajos se hicieron en la chancadora 001-CR002?",
    "¿Cuáles son las actividades más atrasadas?",
    "¿Cuáles son los eventos de seguridad de hoy?",
  ];

  return (
    <View
      style={[
        styles.container,
        webStyles.container,
        embedded && webStyles.embeddedContainer,
      ]}
    >
      <View style={[webStyles.header, embedded && webStyles.embeddedHeader]}>
        <Text style={[webStyles.title, embedded && webStyles.embeddedTitle]}>
          Asistente de Planificación de Mantenimiento
        </Text>
        <Text style={[webStyles.subtitle, embedded && webStyles.embeddedSubtitle]}>
          Consulta planificación, eventos de campo, HSE y historial por equipo
          (TagEquipo)
        </Text>
      </View>

      <View style={[webStyles.chatContainer, embedded && webStyles.embeddedChat]}>
        <View
          style={[
            webStyles.sidebar,
            {
              display:
                Platform.OS === "web" && !embedded ? "flex" : "none",
            },
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
              RAG sobre Supabase: actividades, eventos, mantenimiento diario y
              equipos
            </Text>
          </View>
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
                  Pregunta sobre equipos, atrasos o seguridad
                </Text>
                <View style={webStyles.suggestionContainer}>
                  {suggestions.map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={webStyles.suggestionButton}
                      onPress={() => askQuestion(s)}
                    >
                      <Text style={webStyles.suggestionText}>{s}</Text>
                    </TouchableOpacity>
                  ))}
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
                    <View
                      style={
                        message.role === "user"
                          ? webStyles.userBubble
                          : webStyles.aiBubble
                      }
                    >
                      <Text
                        style={[
                          webStyles.messageText,
                          { color: getMessageTextColor(message.role) },
                        ]}
                      >
                        {message.content}
                      </Text>
                    </View>
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
              placeholder="Ej: trabajos en 001-CR002, actividades atrasadas, HSE hoy..."
              value={pregunta}
              onChangeText={setPregunta}
              multiline={Platform.OS === "web"}
              onKeyPress={handleKeyPress}
            />
            <TouchableOpacity
              onPress={() => askQuestion(pregunta)}
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

const mapStateToProps = (reducers: any) => ({
  email: reducers.profile.email,
  profile: reducers.profile.profile,
});

const webStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  embeddedContainer: {
    flex: undefined,
    height: "100%",
    backgroundColor: "#ffffff",
  },
  header: {
    padding: 24,
    backgroundColor: "#2A3B76",
    alignItems: "center" as const,
  },
  embeddedHeader: {
    padding: 16,
    alignItems: "flex-start" as const,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "white",
    marginBottom: 8,
  },
  embeddedTitle: {
    fontSize: 17,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center" as const,
  },
  embeddedSubtitle: {
    fontSize: 13,
    textAlign: "left" as const,
    lineHeight: 18,
  },
  chatContainer: { flexDirection: "row" as const, flex: 1 },
  embeddedChat: { flex: 1, minHeight: 420 },
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
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 16 },
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
  chatSection: { flex: 1, flexDirection: "column" as const },
  messagesContainer: { flex: 1, padding: 20 },
  messagesContent: { paddingBottom: 20 },
  emptyChat: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    minHeight: 280,
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
  suggestionText: { fontSize: 14, color: "#4b5563" },
  messageItem: { marginBottom: 16, width: "90%" },
  userMessage: { alignSelf: "flex-end" as const },
  aiMessage: { alignSelf: "flex-start" as const },
  messageBubble: { borderRadius: 18, padding: 2 },
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
  messageText: { fontSize: 15, lineHeight: 22 },
  loadingContainer: { alignItems: "center" as const, margin: 20 },
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
