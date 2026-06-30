import { StyleSheet } from "react-native";

const BRAND = "#2A3B76";
const PAGE_BG = "#f1f5f9";
const CARD_BG = "#ffffff";
const BORDER = "#e2e8f0";
const MUTED = "#64748b";

export const createInformationStyles = (windowWidth: number) => {
  const isCompact = windowWidth < 640;
  const isDesktop = windowWidth >= 1024;
  const contentMaxWidth = Math.min(windowWidth, 960);
  const horizontalPad = isCompact ? 16 : isDesktop ? 24 : 20;

  return StyleSheet.create({
    scroll: {
      flex: 1,
      backgroundColor: PAGE_BG,
    },
    scrollContent: {
      paddingBottom: isCompact ? 32 : 48,
    },
    page: {
      width: "100%",
      maxWidth: contentMaxWidth,
      alignSelf: "center",
      paddingHorizontal: horizontalPad,
      paddingTop: isCompact ? 12 : 20,
    },

    offlineWrap: {
      paddingHorizontal: horizontalPad,
      paddingTop: 8,
      maxWidth: contentMaxWidth,
      alignSelf: "center",
      width: "100%",
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
    heroEyebrow: {
      fontSize: 11,
      fontWeight: "700",
      color: MUTED,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      marginBottom: 6,
    },
    heroTitle: {
      fontSize: isCompact ? 18 : 22,
      fontWeight: "800",
      color: "#1e293b",
      lineHeight: isCompact ? 24 : 28,
    },
    heroMetaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 12,
    },
    heroBadge: {
      backgroundColor: `${BRAND}12`,
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    heroBadgeText: {
      color: BRAND,
      fontSize: 12,
      fontWeight: "700",
    },
    heroMetaText: {
      fontSize: 13,
      color: MUTED,
      lineHeight: 18,
    },

    sectionCard: {
      backgroundColor: CARD_BG,
      borderRadius: isCompact ? 14 : 16,
      borderWidth: 1,
      borderColor: BORDER,
      padding: isCompact ? 12 : 16,
      marginBottom: isCompact ? 16 : 20,
      overflow: "hidden",
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: isCompact ? 4 : 8,
      paddingBottom: isCompact ? 10 : 12,
      marginBottom: isCompact ? 4 : 8,
      borderBottomWidth: 1,
      borderBottomColor: BORDER,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: "#334155",
    },
    sectionHint: {
      fontSize: 12,
      color: MUTED,
    },

    submitWrap: {
      paddingTop: 4,
      paddingBottom: isCompact ? 8 : 12,
    },
    submitBtn: {
      backgroundColor: BRAND,
      borderRadius: 12,
      paddingVertical: isCompact ? 14 : 16,
      marginHorizontal: 0,
    },
    submitBtnTitle: {
      fontSize: 16,
      fontWeight: "700",
      letterSpacing: 0.2,
    },
    submitHint: {
      textAlign: "center",
      fontSize: 12,
      color: MUTED,
      marginTop: 10,
      lineHeight: 17,
    },

    iosSpacer: {
      height: 80,
    },
  });
};

export { BRAND, PAGE_BG, MUTED };
