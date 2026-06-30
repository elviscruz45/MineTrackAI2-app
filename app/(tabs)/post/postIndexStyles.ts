import { StyleSheet } from "react-native";

const BRAND = "#2A3B76";
const PAGE_BG = "#f1f5f9";
const CARD_BG = "#ffffff";
const BORDER = "#e2e8f0";
const MUTED = "#64748b";

export const createWebStyles = (windowWidth: number) => {
  const isCompact = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;
  const contentMaxWidth = Math.min(windowWidth, 1200);
  const horizontalPad = isCompact ? 16 : isTablet ? 20 : 24;

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: PAGE_BG,
    },
    page: {
      flex: 1,
      width: "100%",
      maxWidth: contentMaxWidth,
      alignSelf: "center",
    },
    list: {
      flex: 1,
      backgroundColor: PAGE_BG,
    },
    listContent: {
      paddingHorizontal: horizontalPad,
      paddingBottom: 32,
      paddingTop: isCompact ? 8 : 16,
    },
    columnWrapper: {
      justifyContent: "flex-start",
      gap: isCompact ? 12 : 16,
      marginBottom: isCompact ? 12 : 16,
    },

    pageHeader: {
      marginBottom: isCompact ? 16 : 20,
    },
    pageTitle: {
      fontSize: isCompact ? 20 : 24,
      fontWeight: "800",
      color: "#1e293b",
      letterSpacing: -0.3,
    },
    pageSubtitle: {
      fontSize: isCompact ? 13 : 14,
      color: MUTED,
      marginTop: 6,
      lineHeight: isCompact ? 18 : 22,
      maxWidth: isDesktop ? 560 : undefined,
    },

    heroCard: {
      backgroundColor: CARD_BG,
      borderRadius: isCompact ? 14 : 16,
      borderWidth: 1,
      borderColor: BORDER,
      padding: isCompact ? 16 : 20,
      marginBottom: isCompact ? 16 : 20,
      shadowColor: "#0f172a",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    heroRow: {
      flexDirection: isCompact ? "column" : "row",
      alignItems: isCompact ? "center" : "flex-start",
      gap: isCompact ? 14 : 18,
    },
    heroImageWrap: {
      position: "relative",
    },
    heroImage: {
      width: isCompact ? 80 : 88,
      height: isCompact ? 80 : 88,
      borderRadius: isCompact ? 40 : 14,
      borderWidth: 2,
      borderColor: BORDER,
      backgroundColor: "#f8fafc",
    },
    heroImageEmpty: {
      opacity: 0.85,
    },
    heroBody: {
      flex: 1,
      alignItems: isCompact ? "center" : "flex-start",
      minWidth: 0,
    },
    heroLabel: {
      fontSize: 11,
      fontWeight: "700",
      color: MUTED,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      marginBottom: 4,
    },
    heroTitle: {
      fontSize: isCompact ? 16 : 18,
      fontWeight: "700",
      color: BRAND,
      textAlign: isCompact ? "center" : "left",
      lineHeight: isCompact ? 22 : 24,
    },
    heroHint: {
      fontSize: 13,
      color: MUTED,
      marginTop: 6,
      textAlign: isCompact ? "center" : "left",
      lineHeight: 18,
    },
    heroBadge: {
      alignSelf: isCompact ? "center" : "flex-start",
      backgroundColor: `${BRAND}12`,
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 4,
      marginTop: 10,
    },
    heroBadgeText: {
      color: BRAND,
      fontSize: 11,
      fontWeight: "700",
    },

    actionsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginTop: isCompact ? 16 : 0,
      width: isCompact ? "100%" : undefined,
      flex: isCompact ? undefined : 1,
      justifyContent: isCompact ? "center" : "flex-end",
      alignItems: isCompact ? "stretch" : "center",
    },
    actionBtn: {
      flex: isCompact ? 1 : undefined,
      minWidth: isCompact ? 0 : 108,
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f8fafc",
      borderWidth: 1,
      borderColor: BORDER,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: isCompact ? 8 : 14,
      gap: 6,
    },
    actionBtnPrimary: {
      backgroundColor: BRAND,
      borderColor: BRAND,
    },
    actionIcon: {
      width: 28,
      height: 28,
    },
    actionLabel: {
      fontSize: 11,
      fontWeight: "600",
      color: "#475569",
      textAlign: "center",
    },
    actionLabelPrimary: {
      color: "#ffffff",
    },

    searchWrap: {
      marginBottom: 16,
    },
    searchBarContainer: {
      backgroundColor: "transparent",
      borderTopWidth: 0,
      borderBottomWidth: 0,
      paddingHorizontal: 0,
    },
    searchBarInput: {
      backgroundColor: CARD_BG,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: BORDER,
      paddingHorizontal: 12,
      height: 46,
    },
    searchBarText: {
      fontSize: 15,
      color: "#1e293b",
    },

    sectionHeader: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "space-between",
      marginBottom: 12,
      gap: 8,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: "#334155",
    },
    sectionCount: {
      fontSize: 13,
      color: MUTED,
      fontWeight: "500",
    },

    equipmentWrap: {
      marginBottom: 8,
    },

    cardContainer: {
      flex: 1,
      minWidth: isCompact ? "100%" : 220,
    },
    card: {
      flexDirection: "row",
      backgroundColor: CARD_BG,
      borderRadius: 14,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: BORDER,
      padding: 14,
      alignItems: "center",
      minHeight: 104,
    },
    cardPressed: {
      borderColor: `${BRAND}55`,
      backgroundColor: "#fafbff",
    },
    cardImageContainer: {
      width: 72,
      height: 72,
      backgroundColor: "#f8fafc",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 10,
      marginRight: 14,
      flexShrink: 0,
      borderWidth: 1,
      borderColor: BORDER,
    },
    cardImage: {
      width: "100%",
      height: "100%",
    },
    cardContent: {
      flex: 1,
      justifyContent: "center",
      overflow: "hidden",
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 6,
      flexWrap: "wrap",
    },
    codeBadge: {
      backgroundColor: BRAND,
      borderRadius: 5,
      paddingHorizontal: 7,
      paddingVertical: 2,
      flexShrink: 0,
    },
    codeBadgeText: {
      color: "#ffffff",
      fontSize: 10,
      fontWeight: "700",
    },
    tipoChip: {
      flex: 1,
      fontSize: 10,
      fontWeight: "600",
      color: MUTED,
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: BRAND,
      marginBottom: 6,
      lineHeight: 19,
    },
    cardInfo: {
      gap: 4,
    },
    tagBadge: {
      alignSelf: "flex-start",
      backgroundColor: "#e0f2fe",
      borderRadius: 6,
      paddingHorizontal: 7,
      paddingVertical: 3,
    },
    tagBadgeText: {
      color: "#0369a1",
      fontSize: 10,
      fontWeight: "700",
    },
    infoText: {
      fontSize: 11,
      lineHeight: 16,
    },
    infoLabel: {
      fontWeight: "600",
      color: MUTED,
    },
    infoValue: {
      color: "#334155",
      fontWeight: "400",
    },

    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 48,
      paddingHorizontal: 24,
      backgroundColor: CARD_BG,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: BORDER,
      borderStyle: "dashed",
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: "#334155",
      marginTop: 12,
      textAlign: "center",
    },
    emptyText: {
      fontSize: 13,
      color: MUTED,
      marginTop: 6,
      textAlign: "center",
      lineHeight: 19,
      maxWidth: 320,
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(15, 23, 42, 0.55)",
      justifyContent: isWide(windowWidth) ? "center" : "flex-end",
      alignItems: isWide(windowWidth) ? "center" : "stretch",
      padding: isWide(windowWidth) ? 24 : 0,
    },
    modalSheet: {
      backgroundColor: CARD_BG,
      borderTopLeftRadius: isWide(windowWidth) ? 20 : 24,
      borderTopRightRadius: isWide(windowWidth) ? 20 : 24,
      borderBottomLeftRadius: isWide(windowWidth) ? 20 : 0,
      borderBottomRightRadius: isWide(windowWidth) ? 20 : 0,
      paddingHorizontal: isCompact ? 20 : 28,
      paddingTop: 16,
      paddingBottom: isWide(windowWidth) ? 24 : 36,
      maxWidth: isWide(windowWidth) ? 440 : undefined,
      width: "100%",
      alignSelf: "center",
    },
    modalHandle: {
      width: 40,
      height: 4,
      backgroundColor: "#cbd5e1",
      borderRadius: 2,
      alignSelf: "center",
      marginBottom: 18,
    },
    modalHero: {
      alignItems: "center",
      marginBottom: 20,
    },
    modalImage: {
      width: 72,
      height: 72,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: BORDER,
      backgroundColor: "#f8fafc",
    },
    modalTitle: {
      fontWeight: "700",
      fontSize: 17,
      color: BRAND,
      marginTop: 12,
      maxWidth: 320,
      textAlign: "center",
      lineHeight: 22,
    },
    modalBadge: {
      backgroundColor: BRAND,
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 3,
      marginTop: 8,
    },
    modalBadgeText: {
      color: "#ffffff",
      fontSize: 11,
      fontWeight: "700",
    },
    modalMeta: {
      color: "#94a3b8",
      fontSize: 12,
      marginTop: 4,
    },
    modalPrompt: {
      textAlign: "center",
      color: MUTED,
      fontSize: 14,
      marginBottom: 16,
      lineHeight: 20,
    },
    modalOption: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#f8fafc",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: BORDER,
      padding: 14,
      marginBottom: 10,
    },
    modalOptionIconWrap: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    modalOptionIconGallery: {
      backgroundColor: "#dbeafe",
    },
    modalOptionIconCamera: {
      backgroundColor: "#dcfce7",
    },
    modalOptionBody: {
      marginLeft: 14,
      flex: 1,
    },
    modalOptionTitle: {
      fontWeight: "600",
      fontSize: 15,
      color: "#1e293b",
    },
    modalOptionDesc: {
      color: "#94a3b8",
      fontSize: 12,
      marginTop: 2,
    },
    modalChevron: {
      color: "#cbd5e1",
      fontSize: 22,
      fontWeight: "300",
    },
    modalCancel: {
      alignItems: "center",
      paddingVertical: 12,
      marginTop: 4,
    },
    modalCancelText: {
      color: MUTED,
      fontSize: 14,
      fontWeight: "500",
    },
  });
};

function isWide(windowWidth: number) {
  return windowWidth >= 640;
}

export { BRAND, PAGE_BG, MUTED };
