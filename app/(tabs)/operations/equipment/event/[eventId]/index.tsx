import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Linking,
  TextInput,
  ScrollView,
  Animated,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { Feather, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { connect } from "react-redux";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Image as ImageExpo } from "expo-image";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";

import { createCommentStyles } from "../../../../home/_styles/comment.styles";
import {
  addEventComment,
  getEventById,
  subscribeEventById,
  subscribeEventComments,
  updateEvent,
} from "@/lib/db/events";
import { deleteFile } from "@/lib/db/storage";
import type { EventAttachedDocument } from "@/lib/db/types";
import {
  findTagEquipoByKey,
  getTagEquipoNombre,
} from "@/utils/tagEquipoList";
import {
  buildEventAfterDocumentRemoval,
  collectEventDocuments,
  extractPdfStoragePath,
} from "../../eventUtils";

type CommentItem = {
  comment: string;
  commenterEmail?: string;
  commenterName?: string;
  commenterPhoto?: string;
  date: number;
};

function formatCommentDate(dateMs: number) {
  const commentDate = new Date(dateMs);
  const formattedDate = commentDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const formattedTime = commentDate.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${formattedDate} • ${formattedTime}`;
}

function EquipmentEventDetailRaw(props: {
  email?: string;
  firebase_user_name?: string;
  user_photo?: string;
}) {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const { isWide, styles } = useMemo(
    () => createCommentStyles(windowWidth),
    [windowWidth],
  );

  const { eventId, tagCode } = useLocalSearchParams<{
    eventId: string;
    tagCode: string;
  }>();
  const id = String(eventId ?? "");
  const code = String(tagCode ?? "");

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<Record<string, unknown> | null>(null);
  const [documents, setDocuments] = useState<EventAttachedDocument[]>([]);
  const [newImages, setNewImages] = useState<string[]>([]);
  const [postsComments, setPostsComments] = useState<CommentItem[] | null>(
    null,
  );
  const [comment, setComment] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [deletingDocUrl, setDeletingDocUrl] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const commentsListRef = useRef<FlatList<CommentItem>>(null);

  const tagItem = findTagEquipoByKey(code);
  const serviceName =
    String(event?.AITNombreServicio ?? "") ||
    (tagItem ? getTagEquipoNombre(tagItem) : "Evento por equipo");

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const applyEventData = useCallback((mapped: Record<string, unknown>) => {
    setEvent(mapped);
    setNewImages(((mapped.newImages as string[]) ?? []).filter(Boolean));
    setDocuments(collectEventDocuments(mapped));
  }, []);

  const loadEvent = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!id) return;
      if (!options?.silent) setLoading(true);
      try {
        const data = await getEventById(id);
        if (!data) {
          Toast.show({
            type: "error",
            position: "bottom",
            text1: "No se encontró el evento",
          });
          router.back();
          return;
        }
        applyEventData(data as Record<string, unknown>);
      } catch (error) {
        console.error("Error loading event:", error);
        Toast.show({
          type: "error",
          position: "bottom",
          text1: "Error al cargar el evento",
        });
      } finally {
        if (!options?.silent) setLoading(false);
      }
    },
    [id, router, applyEventData],
  );

  useFocusEffect(
    useCallback(() => {
      loadEvent();

      if (!id) return;

      const unsubscribeComments = subscribeEventComments(
        id,
        (comments) => setPostsComments(comments as CommentItem[]),
        (error) => {
          console.error("Error loading comments:", error);
          Toast.show({
            type: "error",
            position: "bottom",
            text1: "No se pudieron cargar los comentarios",
          });
        },
      );

      const unsubscribeEvent = subscribeEventById(
        id,
        (data) => {
          applyEventData(data as Record<string, unknown>);
          setLoading(false);
        },
        (error) => {
          console.error("Error syncing event:", error);
        },
      );

      return () => {
        unsubscribeComments();
        unsubscribeEvent();
      };
    }, [id, loadEvent, applyEventData]),
  );

  useEffect(() => {
    if (!postsComments?.length) return;
    const timer = setTimeout(() => {
      commentsListRef.current?.scrollToEnd({ animated: true });
    }, 100);
    return () => clearTimeout(timer);
  }, [postsComments?.length]);

  const openFile = useCallback(async (uri: string) => {
    try {
      const supported = await Linking.canOpenURL(uri);
      if (supported) {
        await Linking.openURL(uri);
      } else {
        Toast.show({
          type: "error",
          position: "bottom",
          text1: "No se pudo abrir el documento",
        });
      }
    } catch {
      Toast.show({
        type: "error",
        position: "bottom",
        text1: "Error al abrir el documento",
      });
    }
  }, []);

  const deleteDocument = useCallback(
    async (doc: EventAttachedDocument) => {
      if (!id || !event || deletingDocUrl) return;

      const performDelete = async () => {
        setDeletingDocUrl(doc.url);
        try {
          const updates = buildEventAfterDocumentRemoval(event, doc.url);
          await updateEvent(id, updates);

          const storagePath = extractPdfStoragePath(doc.url);
          if (storagePath) {
            try {
              await deleteFile("pdfs", storagePath);
            } catch (storageError) {
              console.error("Error deleting PDF from storage:", storageError);
            }
          }

          const nextEvent = {
            ...event,
            pdfPrincipal: updates.pdfPrincipal,
            FilenameTitle: updates.FilenameTitle,
            tipoFile: updates.tipoFile,
            attachedDocuments: updates.attachedDocuments,
          };
          applyEventData(nextEvent);

          Toast.show({
            type: "success",
            position: "bottom",
            text1: "Documento eliminado",
          });
        } catch (error) {
          console.error("Error deleting document:", error);
          Toast.show({
            type: "error",
            position: "bottom",
            text1: "No se pudo eliminar el documento",
          });
        } finally {
          setDeletingDocUrl(null);
        }
      };

      const message = `¿Está seguro que desea eliminar "${doc.filename}"? Esta acción no se puede deshacer.`;

      if (Platform.OS === "web") {
        if (window.confirm(message)) {
          await performDelete();
        }
        return;
      }

      Alert.alert("Eliminar documento", message, [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            void performDelete();
          },
        },
      ]);
    },
    [id, event, deletingDocUrl, applyEventData],
  );

  const handleSendComment = async () => {
    const text = comment.trim();
    if (!text || isSending || !id) return;

    const commentObj: CommentItem = {
      comment: text,
      commenterEmail: props.email,
      commenterName: props.firebase_user_name,
      commenterPhoto: props.user_photo,
      date: Date.now(),
    };

    setIsSending(true);
    setComment("");
    setPostsComments((prev) => [...(prev ?? []), commentObj]);

    try {
      await addEventComment(id, commentObj);
    } catch (error) {
      console.error("Error sending comment:", error);
      setPostsComments((prev) =>
        (prev ?? []).filter((c) => c.date !== commentObj.date),
      );
      setComment(text);
      Toast.show({
        type: "error",
        position: "bottom",
        text1: "No se pudo enviar el comentario",
      });
    } finally {
      setIsSending(false);
    }
  };

  const goToEdit = () => {
    router.push({
      pathname: "/operations/equipment/event/[eventId]/edit",
      params: { eventId: id, tagCode: code },
    });
  };

  const renderCommentItem = ({ item }: { item: CommentItem }) => (
    <View style={styles.commentCard}>
      <View style={styles.commentHeader}>
        <View style={styles.commentHeaderLeft}>
          <ImageExpo
            source={{ uri: item.commenterPhoto }}
            style={styles.roundImage}
            cachePolicy="memory-disk"
            contentFit="cover"
          />
          <Text style={styles.userName} numberOfLines={1}>
            {item.commenterName || "Usuario"}
          </Text>
        </View>
        <Text style={styles.dateText}>{formatCommentDate(item.date)}</Text>
      </View>
      <Text style={styles.commentText}>{item.comment}</Text>
    </View>
  );

  const commentInputBar = (
    <View style={styles.commentInputBar}>
      <ImageExpo
        source={{ uri: props.user_photo }}
        style={styles.roundImage}
        cachePolicy="memory-disk"
        contentFit="cover"
      />
      <TextInput
        style={styles.input}
        placeholder="Escribe un comentario…"
        value={comment}
        onChangeText={setComment}
        placeholderTextColor="#94a3b8"
        multiline
        maxLength={2000}
        onSubmitEditing={handleSendComment}
        blurOnSubmit={false}
        editable={!isSending}
      />
      <TouchableOpacity
        onPress={handleSendComment}
        style={[
          styles.sendButton,
          (isSending || !comment.trim()) && styles.sendButtonDisabled,
        ]}
        activeOpacity={0.7}
        disabled={isSending || !comment.trim()}
      >
        {isSending ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Feather name="send" size={17} color="white" />
        )}
      </TouchableOpacity>
    </View>
  );

  const commentsListBody =
    postsComments === null ? (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    ) : postsComments.length > 0 ? (
      isWide ? (
        <FlatList
          ref={commentsListRef}
          data={postsComments}
          style={styles.commentsList}
          keyExtractor={(item, index) => `${item.date}-${index}`}
          renderItem={renderCommentItem}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            commentsListRef.current?.scrollToEnd({ animated: true })
          }
        />
      ) : (
        <View style={{ paddingHorizontal: 12, paddingBottom: 8 }}>
          {postsComments.map((item, index) => (
            <View key={`${item.date}-${index}`}>
              {renderCommentItem({ item })}
            </View>
          ))}
        </View>
      )
    ) : (
      <View style={styles.emptyComments}>
        <Feather name="message-circle" size={40} color="#cbd5e1" />
        <Text style={styles.emptyCommentsText}>
          No hay comentarios todavía. ¡Sé el primero en escribir!
        </Text>
      </View>
    );

  const commentsPanel = (
    <View style={[styles.chatColumn, !isWide && { borderTopWidth: 1 }]}>
      <View style={styles.chatHeader}>
        <Text style={styles.chatHeaderTitle}>
          Comentarios{postsComments ? ` (${postsComments.length})` : ""}
        </Text>
        <Text style={styles.chatHeaderSubtitle}>
          Los mensajes se actualizan en tiempo real
        </Text>
      </View>

      {isWide ? (
        <View style={styles.chatPanel}>{commentsListBody}</View>
      ) : (
        commentsListBody
      )}

      {commentInputBar}
    </View>
  );

  const fotoPrincipal = String(event?.fotoPrincipal ?? "");
  const titulo = String(event?.titulo ?? "");
  const comentarios = String(event?.comentarios ?? "");
  const fechaPostFormato = String(event?.fechaPostFormato ?? "");
  const visibilidad = String(event?.visibilidad ?? "Todos");
  const tipoEvento = String(event?.tipoEvento ?? "");
  const causa = String(event?.causa ?? "");
  const clasificacionHSE = String(event?.clasificacionHSE ?? "");

  const postDetails = (
    <>
      <TouchableOpacity
        onPress={() => router.back()}
        style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 }}
      >
        <Text style={{ color: "#2A3B76", fontWeight: "600" }}>
          ← Volver al historial
        </Text>
      </TouchableOpacity>

      <View style={styles.headerContainer}>
        <View style={styles.headerInfo}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="calendar-outline" size={17} color="#2563eb" />
            <Text style={styles.headerText}>{fechaPostFormato || "—"}</Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            {code ? (
              <View
                style={{
                  backgroundColor: "#2A3B7612",
                  borderRadius: 6,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                }}
              >
                <Text style={{ color: "#2A3B76", fontSize: 11, fontWeight: "700" }}>
                  {code}
                </Text>
              </View>
            ) : null}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <MaterialIcons name="visibility" size={17} color="#2563eb" />
              <Text style={styles.headerText}>{visibilidad}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={goToEdit}
          style={{
            marginTop: 12,
            alignSelf: "flex-start",
            backgroundColor: "#2A3B76",
            borderRadius: 8,
            paddingHorizontal: 14,
            paddingVertical: 8,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>
            Editar evento
          </Text>
        </TouchableOpacity>
      </View>

      {fotoPrincipal ? (
        <ImageExpo
          source={{ uri: fotoPrincipal }}
          style={styles.postPhoto}
          cachePolicy="memory-disk"
          contentFit="cover"
          transition={300}
        />
      ) : null}

      <Text style={styles.titleText}>{serviceName}</Text>
      {titulo ? <Text style={styles.detailText}>{titulo}</Text> : null}
      {comentarios ? <Text style={styles.detailText}>{comentarios}</Text> : null}

      {(tipoEvento || causa || clasificacionHSE) && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 8, gap: 4 }}>
          {tipoEvento ? (
            <Text style={{ fontSize: 13, color: "#64748b" }}>
              Tipo: {tipoEvento}
            </Text>
          ) : null}
          {causa ? (
            <Text style={{ fontSize: 13, color: "#64748b" }}>
              Causa: {causa}
            </Text>
          ) : null}
          {clasificacionHSE ? (
            <Text style={{ fontSize: 13, color: "#b91c1c", fontWeight: "600" }}>
              HSE: {clasificacionHSE}
            </Text>
          ) : null}
        </View>
      )}

      {documents.length > 0 ? (
        <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
          <Text style={styles.sectionTitle}>Documentos adjuntos</Text>
          <View style={{ gap: 8, marginTop: 8 }}>
            {documents.map((doc, index) => (
              <View
                key={`${doc.url}-${index}`}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  backgroundColor: "#f8fafc",
                  borderRadius: 10,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: "#e2e8f0",
                }}
              >
                <MaterialIcons name="attach-file" size={22} color="#2A3B76" />
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => openFile(doc.url)}
                  disabled={deletingDocUrl === doc.url}
                >
                  <Text
                    style={{ fontSize: 14, fontWeight: "600", color: "#1e293b" }}
                    numberOfLines={2}
                  >
                    {doc.filename}
                  </Text>
                  {doc.tipoFile ? (
                    <Text style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                      {doc.tipoFile}
                    </Text>
                  ) : null}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deleteDocument(doc)}
                  disabled={deletingDocUrl === doc.url}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel={`Eliminar ${doc.filename}`}
                >
                  {deletingDocUrl === doc.url ? (
                    <ActivityIndicator size="small" color="#dc2626" />
                  ) : (
                    <MaterialIcons name="delete-outline" size={22} color="#dc2626" />
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {newImages.length > 0 ? (
        <View style={styles.galleryContainer}>
          <Text style={styles.sectionTitle}>Galería</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={newImages}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={({ item }) => (
              <ImageExpo
                source={{ uri: item }}
                style={styles.postPhoto2}
                cachePolicy="memory-disk"
                contentFit="cover"
                transition={300}
              />
            )}
          />
        </View>
      ) : null}
    </>
  );

  if (!id) {
    return (
      <View style={styles.page}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.page, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#2A3B76" />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.page}>
      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        <View style={styles.contentShell}>
          {isWide ? (
            <View style={styles.layoutRow}>
              <View style={styles.postColumn}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 24 }}
                >
                  {postDetails}
                </ScrollView>
              </View>
              {commentsPanel}
            </View>
          ) : (
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
            >
              <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 8 }}
              >
                {postDetails}
                {commentsPanel}
              </ScrollView>
            </KeyboardAvoidingView>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const mapStateToProps = (reducers: {
  profile: {
    firebase_user_name?: string;
    user_photo?: string;
    email?: string;
  };
}) => ({
  firebase_user_name: reducers.profile.firebase_user_name,
  user_photo: reducers.profile.user_photo,
  email: reducers.profile.email,
});

const EquipmentEventDetail = connect(mapStateToProps)(EquipmentEventDetailRaw);
export default EquipmentEventDetail;
