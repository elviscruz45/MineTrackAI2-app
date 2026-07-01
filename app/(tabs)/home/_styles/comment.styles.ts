import { StyleSheet, Platform } from "react-native";

const COLORS = {
  primary: "#2563eb",
  primaryDark: "#1d4ed8",
  secondary: "#1e293b",
  accent: "#f59e0b",
  background: "#ffffff",
  pageBg: "#f1f5f9",
  card: "#f8fafc",
  text: "#334155",
  textLight: "#64748b",
  border: "#e2e8f0",
  success: "#22c55e",
  error: "#ef4444",
};

export function createCommentStyles(windowWidth: number) {
  const isWide = windowWidth >= 900;
  const contentWidth = isWide ? Math.min(windowWidth - 48, 1100) : windowWidth;

  return {
    isWide,
    colors: COLORS,
    styles: StyleSheet.create({
      page: {
        flex: 1,
        backgroundColor: isWide ? COLORS.pageBg : COLORS.background,
      },
      contentShell: {
        width: contentWidth,
        maxWidth: 1100,
        alignSelf: "center",
        flex: 1,
      },
      layoutRow: {
        flexDirection: "row",
        gap: 24,
        padding: isWide ? 24 : 0,
        flex: 1,
      },
      postColumn: {
        flex: isWide ? 1.1 : undefined,
        backgroundColor: COLORS.background,
        borderRadius: isWide ? 16 : 0,
        overflow: "hidden",
        ...(isWide
          ? {
              borderWidth: 1,
              borderColor: COLORS.border,
              shadowColor: "#0f172a",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.06,
              shadowRadius: 12,
            }
          : {}),
      },
      chatColumn: {
        flex: isWide ? 0.9 : undefined,
        backgroundColor: COLORS.background,
        borderRadius: isWide ? 16 : 0,
        borderTopWidth: isWide ? 0 : 1,
        borderTopColor: COLORS.border,
        ...(isWide
          ? {
              borderWidth: 1,
              borderColor: COLORS.border,
              maxHeight: Platform.OS === "web" ? ("calc(100vh - 48px)" as any) : undefined,
              shadowColor: "#0f172a",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.06,
              shadowRadius: 12,
            }
          : {}),
      },
      chatPanel: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
      },
      chatHeader: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: COLORS.card,
      },
      chatHeaderTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: COLORS.secondary,
      },
      chatHeaderSubtitle: {
        fontSize: 13,
        color: COLORS.textLight,
        marginTop: 2,
      },
      commentsList: {
        flex: 1,
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 8,
      },
      commentInputBar: {
        flexDirection: "row",
        alignItems: "flex-end",
        padding: 12,
        gap: 10,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        backgroundColor: COLORS.background,
        ...(Platform.OS === "web" && !isWide
          ? { position: "sticky" as any, bottom: 0 }
          : {}),
      },
      headerContainer: {
        backgroundColor: COLORS.background,
        paddingTop: 12,
        paddingBottom: 8,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
      },
      headerInfo: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 8,
      },
      headerText: {
        fontSize: 14,
        color: COLORS.textLight,
      },
      postPhoto: {
        height: isWide ? 280 : windowWidth * 0.62,
        width: isWide ? "100%" : windowWidth * 0.94,
        marginTop: 10,
        marginBottom: 16,
        borderRadius: 12,
        alignSelf: "center",
      },
      postPhoto2: {
        height: isWide ? 120 : windowWidth * 0.42,
        width: isWide ? 120 : windowWidth * 0.42,
        margin: 8,
        borderRadius: 10,
      },
      titleText: {
        fontSize: isWide ? 20 : 18,
        fontWeight: "700",
        color: COLORS.secondary,
        marginVertical: 12,
        paddingHorizontal: 16,
        textAlign: isWide ? "left" : "center",
      },
      detailText: {
        fontSize: 15,
        color: COLORS.text,
        lineHeight: 23,
        marginHorizontal: 16,
        marginBottom: 12,
      },
      tareoCard: {
        backgroundColor: COLORS.card,
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
      },
      tareoTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: COLORS.secondary,
        marginBottom: 10,
      },
      tareoGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
      },
      tareoItem: {
        width: isWide ? "48%" : "100%",
      },
      avanceNombre: {
        fontWeight: "500",
        color: COLORS.textLight,
        fontSize: 14,
      },
      galleryContainer: {
        marginVertical: 8,
        paddingBottom: 8,
      },
      sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: COLORS.secondary,
        marginLeft: 16,
        marginBottom: 8,
      },
      roundImage: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.border,
      },
      input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 120,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: Platform.OS === "web" ? 10 : 8,
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
        color: COLORS.text,
        fontSize: 15,
      },
      sendButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 20,
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
      },
      sendButtonDisabled: {
        backgroundColor: "#93c5fd",
      },
      commentCard: {
        backgroundColor: COLORS.card,
        borderRadius: 12,
        marginVertical: 6,
        padding: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
      },
      commentHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
        gap: 8,
      },
      commentHeaderLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: 10,
      },
      commentText: {
        color: COLORS.text,
        fontSize: 15,
        lineHeight: 22,
      },
      dateText: {
        color: COLORS.textLight,
        fontSize: 11,
        flexShrink: 0,
      },
      userName: {
        fontWeight: "600",
        color: COLORS.secondary,
        fontSize: 14,
        flexShrink: 1,
      },
      emptyComments: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
        paddingHorizontal: 24,
      },
      emptyCommentsText: {
        color: COLORS.textLight,
        marginTop: 10,
        fontSize: 15,
        textAlign: "center",
      },
      loadingWrap: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
      },
    }),
  };
}

// Legacy export for any other imports
export const styles = createCommentStyles(390).styles;
