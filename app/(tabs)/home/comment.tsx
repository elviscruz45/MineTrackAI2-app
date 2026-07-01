import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Linking,
  TextInput,
  Alert,
  ScrollView,
  Animated,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { Feather, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { connect } from "react-redux";
import { createCommentStyles } from "./_styles/comment.styles";
import {
  addEventComment,
  deleteEvent,
  getEventById,
  subscribeEventComments,
} from "@/lib/db/events";
import { getServicioAitById, updateServicioAit } from "@/lib/db/serviciosAit";
import { saveActualPostFirebase } from "../../../redux/actions/post";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Image as ImageExpo } from "expo-image";
import Toast from "react-native-toast-message";
import { useRouter, useLocalSearchParams } from "expo-router";

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

function CommentScreen(props: any) {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const { isWide, styles } = useMemo(
    () => createCommentStyles(windowWidth),
    [windowWidth]
  );

  const {
    AITidServicios,
    fechaPostFormato,
    pdfPrincipal,
    visibilidad,
    fotoPrincipal,
    AITNombreServicio,
    idDocFirestoreDB,
    titulo,
    comentarios,
    totalHH,
    supervisores,
    HSE,
    liderTecnico,
    soldador,
    tecnico,
    ayudante,
  }: any = useLocalSearchParams();

  const eventId = String(idDocFirestoreDB ?? "");

  const [postsComments, setPostsComments] = useState<CommentItem[] | null>(null);
  const [comment, setComment] = useState("");
  const [newImages, setNewImages] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const commentsListRef = useRef<FlatList<CommentItem>>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (!eventId) return;

    const unsubscribe = subscribeEventComments(
      eventId,
      (comments) => {
        setPostsComments(comments as CommentItem[]);
      },
      (error) => {
        console.error("Error loading comments:", error);
        Toast.show({
          type: "error",
          position: "bottom",
          text1: "No se pudieron cargar los comentarios",
        });
      }
    );

    return unsubscribe;
  }, [eventId]);

  useEffect(() => {
    if (!eventId) return;

    let cancelled = false;
    (async () => {
      try {
        const event = await getEventById(eventId);
        if (cancelled || !event) return;
        const images = (event as { newImages?: string[] }).newImages;
        if (Array.isArray(images)) {
          setNewImages(images);
        }
      } catch (error) {
        console.warn("Could not load event images:", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  useEffect(() => {
    const eventItem = props.totalEventServiceAITLIST?.find(
      (item: any) => item.idDocFirestoreDB === eventId
    );
    if (eventItem?.newImages?.length) {
      setNewImages(eventItem.newImages);
    }
  }, [props.totalEventServiceAITLIST, eventId]);

  useEffect(() => {
    if (!postsComments?.length) return;
    const timer = setTimeout(() => {
      commentsListRef.current?.scrollToEnd({ animated: true });
    }, 100);
    return () => clearTimeout(timer);
  }, [postsComments?.length]);

  const uploadFile = useCallback(async (uri: string) => {
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

  const handleSendComment = async () => {
    const text = comment.trim();
    if (!text || isSending || !eventId) return;

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
      await addEventComment(eventId, commentObj);
    } catch (error) {
      console.error("Error sending comment:", error);
      setPostsComments((prev) =>
        (prev ?? []).filter((c) => c.date !== commentObj.date)
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

  const docDelete = async (idDoc: string) => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "¿Estás seguro de que deseas eliminar el evento?"
      );
      if (confirmed) {
        router.back();
        await deleteEvent(idDoc);
      }
      return;
    }

    Alert.alert(
      "Eliminar Evento",
      "¿Estás seguro de que deseas eliminar el evento?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Aceptar",
          onPress: async () => {
            await deleteEvent(idDoc);
            const servicio = await getServicioAitById(AITidServicios);
            const eventList = (servicio?.events as any[]) ?? [];
            const filteredList = eventList.filter(
              (obj: any) => obj.idDocFirestoreDB !== eventId
            );
            await updateServicioAit(AITidServicios, { events: filteredList });
            Toast.show({
              type: "success",
              position: "bottom",
              text1: "Se ha eliminado correctamente",
            });
          },
        },
      ],
      { cancelable: false }
    );
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

  const postDetails = (
    <>
      <View style={styles.headerContainer}>
        <View style={styles.headerInfo}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="calendar-outline" size={17} color="#2563eb" />
            <Text style={styles.headerText}>{fechaPostFormato}</Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            {pdfPrincipal ? (
              <TouchableOpacity
                onPress={() =>
                  uploadFile(String(pdfPrincipal).replace(/abcdefg/g, "%2F"))
                }
              >
                <MaterialIcons name="attach-file" size={20} color="#2563eb" />
              </TouchableOpacity>
            ) : null}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <MaterialIcons name="visibility" size={17} color="#2563eb" />
              <Text style={styles.headerText}>{visibilidad}</Text>
            </View>
          </View>
        </View>
      </View>

      <ImageExpo
        source={{ uri: String(fotoPrincipal ?? "").replace(/abcdefg/g, "%2F") }}
        style={styles.postPhoto}
        cachePolicy="memory-disk"
        contentFit="cover"
        transition={300}
      />

      <Text style={styles.titleText}>{AITNombreServicio}</Text>
      {titulo ? <Text style={styles.detailText}>{titulo}</Text> : null}
      {comentarios ? <Text style={styles.detailText}>{comentarios}</Text> : null}

      {titulo === "Tareo" ? (
        <View style={styles.tareoCard}>
          <Text style={styles.tareoTitle}>Detalles de personal</Text>
          <View style={styles.tareoGrid}>
            {[
              ["Total personal", totalHH],
              ["Supervisores", supervisores],
              ["HSE", HSE],
              ["Líder técnico", liderTecnico],
              ["Soldador", soldador],
              ["Técnico", tecnico],
              ["Ayudante", ayudante],
            ].map(([label, value]) => (
              <View key={String(label)} style={styles.tareoItem}>
                <Text style={styles.avanceNombre}>
                  {label}: {value ?? "—"}
                </Text>
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

  if (!eventId) {
    return <LoadingSpinner />;
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

const mapStateToProps = (reducers: any) => ({
  servicesData: reducers.home.servicesData,
  firebase_user_name: reducers.profile.firebase_user_name,
  user_photo: reducers.profile.user_photo,
  email: reducers.profile.email,
  totalEventServiceAITLIST: reducers.home.totalEventServiceAITLIST,
  profile: reducers.profile.profile,
});

const ConnectedCommentScreen = connect(mapStateToProps, {
  saveActualPostFirebase,
})(CommentScreen);

export default ConnectedCommentScreen;
