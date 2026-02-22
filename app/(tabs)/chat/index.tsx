/**
 * Chat RAG Screen
 * Interfaz de chat para consultas en lenguaje natural sobre eventos de mantenimiento
 * Integra con MineTrackAI File Search API para búsquedas semánticas
 */

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { chatQuery, MetadataFilter } from "@/services/minetrackai-api";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import { connect } from "react-redux";

const { height } = Dimensions.get("window");

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: Array<{
    filename: string;
    content: string;
  }>;
}

interface QuickFilter {
  label: string;
  filter: MetadataFilter;
  icon: string;
}

const quickFilters: QuickFilter[] = [
  {
    label: "Completados",
    filter: { estado: "Completado" },
    icon: "checkmark-circle",
  },
  {
    label: "En Progreso",
    filter: { estado: "En Progreso" },
    icon: "time",
  },
  {
    label: "Pendientes",
    filter: { estado: "Pendiente" },
    icon: "alert-circle",
  },
  {
    label: "Todos",
    filter: {},
    icon: "list",
  },
];

const suggestedQuestions = [
  "¿Qué mantenimientos están completados?",
  "¿Cuáles son los servicios en progreso?",
  "¿Qué trabajos realizó el técnico Juan?",
  "¿Cuántos servicios hay por área?",
  "Muéstrame los reportes de esta semana",
];

function ChatScreenRaw(props: any) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<MetadataFilter>({});
  const flatListRef = useRef<FlatList>(null);

  // Mensaje de bienvenida inicial
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        type: "assistant",
        content:
          "👋 ¡Hola! Soy tu asistente de MineTrackAI. Puedo ayudarte a buscar información sobre servicios y mantenimientos. ¿Qué te gustaría saber?",
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Scroll automático al final cuando llegan nuevos mensajes
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      // Llamar a la API de chat
      const response = await chatQuery(userMessage.content, selectedFilter);

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        type: "assistant",
        content: response.answer,
        timestamp: new Date(),
        sources: response.sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Error en chat query:", error);

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: "assistant",
        content:
          "❌ Lo siento, hubo un error al procesar tu consulta. Por favor intenta nuevamente.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);

      Toast.show({
        type: "error",
        text1: "Error en Consulta",
        text2: error.message || "No se pudo completar la búsqueda",
        position: "top",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFilter = (filter: MetadataFilter, label: string) => {
    setSelectedFilter(filter);
    Toast.show({
      type: "info",
      text1: `Filtro aplicado: ${label}`,
      position: "top",
      visibilityTime: 2000,
    });
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputText(question);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.type === "user";

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.assistantMessage,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.assistantBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userText : styles.assistantText,
            ]}
          >
            {item.content}
          </Text>

          {/* Mostrar fuentes si las hay */}
          {item.sources && item.sources.length > 0 && (
            <View style={styles.sourcesContainer}>
              <Text style={styles.sourcesTitle}>
                📎 Fuentes ({item.sources.length}):
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {item.sources.map((source, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.sourceChip}
                    onPress={() => {
                      Toast.show({
                        type: "info",
                        text1: source.filename,
                        text2: source.content.substring(0, 100) + "...",
                        position: "bottom",
                        visibilityTime: 5000,
                      });
                    }}
                  >
                    <Ionicons name="document-text" size={14} color="#007AFF" />
                    <Text style={styles.sourceText} numberOfLines={1}>
                      {source.filename}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
        <Text style={styles.timestamp}>
          {item.timestamp.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Ionicons name="chatbubbles" size={24} color="#007AFF" />
            <Text style={styles.headerTitle}>Chat MineTrackAI</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            {Object.keys(selectedFilter).length > 0
              ? "🔍 Con filtros activos"
              : "💬 Sin filtros"}
          </Text>
        </View>

        {/* Filtros rápidos */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {quickFilters.map((filter, index) => {
            const isActive =
              JSON.stringify(selectedFilter) === JSON.stringify(filter.filter);
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.filterButton,
                  isActive && styles.filterButtonActive,
                ]}
                onPress={() => handleQuickFilter(filter.filter, filter.label)}
              >
                <Ionicons
                  name={filter.icon as any}
                  size={16}
                  color={isActive ? "#FFF" : "#007AFF"}
                />
                <Text
                  style={[
                    styles.filterText,
                    isActive && styles.filterTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Lista de mensajes */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.loadingText}>Buscando...</Text>
              </View>
            ) : null
          }
        />

        {/* Preguntas sugeridas (mostrar solo si no hay mensajes de usuario) */}
        {messages.length <= 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.suggestionsContainer}
            contentContainerStyle={styles.suggestionsContent}
          >
            <Text style={styles.suggestionsLabel}>💡 Prueba preguntar:</Text>
            {suggestedQuestions.map((question, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionButton}
                onPress={() => handleSuggestedQuestion(question)}
              >
                <Text style={styles.suggestionText} numberOfLines={1}>
                  {question}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Input de mensaje */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Escribe tu pregunta aquí..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
            editable={!isLoading}
            onSubmitEditing={handleSendMessage}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Ionicons name="send" size={20} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  filtersContainer: {
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    maxHeight: 60,
  },
  filtersContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  filterButtonActive: {
    backgroundColor: "#007AFF",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },
  filterTextActive: {
    color: "#FFF",
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageContainer: {
    marginVertical: 8,
    maxWidth: "80%",
  },
  userMessage: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  assistantMessage: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: "100%",
  },
  userBubble: {
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: "#FFF",
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: "#FFF",
  },
  assistantText: {
    color: "#000",
  },
  timestamp: {
    fontSize: 11,
    color: "#999",
    marginTop: 4,
  },
  sourcesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  sourcesTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  sourceChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#F0F8FF",
    borderWidth: 1,
    borderColor: "#007AFF",
    marginRight: 8,
    maxWidth: 180,
  },
  sourceText: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "500",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  suggestionsContainer: {
    maxHeight: 70,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  suggestionsContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  suggestionsLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    alignSelf: "center",
    marginRight: 8,
  },
  suggestionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#F8F8F8",
    borderWidth: 1,
    borderColor: "#DDD",
    maxWidth: 200,
  },
  suggestionText: {
    fontSize: 13,
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    padding: 12,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    fontSize: 16,
    color: "#000",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#CCC",
  },
});

// Conectar con Redux para acceder al estado global si es necesario
const mapStateToProps = (state: any) => ({
  email: state.auth.email,
  firebase_user_name: state.auth.firebase_user_name,
});

export default connect(mapStateToProps)(ChatScreenRaw);
