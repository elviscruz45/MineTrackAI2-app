import { StyleSheet, Platform, ViewStyle, TextStyle, ImageStyle } from "react-native";

export const COLORS = {
  primary: "#1D2D5B",
  primaryDeep: "#152447",
  primaryMid: "#243A6E",
  accent: "#2CC9D9",
  white: "#ffffff",
  panelBg: "#F3F4F6",
  textDark: "#111827",
  textMuted: "#6B7280",
  textSoft: "#9CA3AF",
  border: "#E5E7EB",
  iconBox: "rgba(255,255,255,0.12)",
};

type AuthStyles = {
  container: ViewStyle;
  split: ViewStyle;
  leftPanel: ViewStyle;
  brandRow: ViewStyle;
  brandMark: ViewStyle;
  brandMarkImage: ImageStyle;
  brandWordmark: ViewStyle;
  brandTitleRow: ViewStyle;
  brandTitle: TextStyle;
  brandTitleAccent: TextStyle;
  brandAiRow: ViewStyle;
  brandAiLine: ViewStyle;
  brandAi: TextStyle;
  headline: TextStyle;
  featureList: ViewStyle;
  featureItem: ViewStyle;
  featureIconBox: ViewStyle;
  featureText: TextStyle;
  rightPanel: ViewStyle;
  loginCard: ViewStyle;
  loginTitle: TextStyle;
  loginSubtitle: TextStyle;
  formWrap: ViewStyle;
  cardFooter: ViewStyle;
  secureText: TextStyle;
  salesRow: ViewStyle;
  salesText: TextStyle;
  salesLink: TextStyle;
};

export function createAuthStyles(isWide: boolean): AuthStyles {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.panelBg,
    },
    split: {
      flex: 1,
      flexDirection: isWide ? "row" : "column",
    },
    leftPanel: {
      flex: isWide ? 1 : undefined,
      width: isWide ? ("50%" as const) : ("100%" as const),
      paddingHorizontal: isWide ? 56 : 28,
      paddingVertical: isWide ? 48 : 36,
      justifyContent: "center",
    },
    brandRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: isWide ? 40 : 24,
    },
    brandMark: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: "rgba(44,201,217,0.15)",
      borderWidth: 1.5,
      borderColor: COLORS.accent,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 14,
      overflow: "hidden",
    },
    brandMarkImage: {
      width: 52,
      height: 52,
    },
    brandWordmark: {
      justifyContent: "center",
    },
    brandTitleRow: {
      flexDirection: "row",
      alignItems: "baseline",
    },
    brandTitle: {
      color: COLORS.white,
      fontSize: 26,
      fontWeight: "700",
      letterSpacing: -0.3,
    },
    brandTitleAccent: {
      color: COLORS.accent,
      fontSize: 26,
      fontWeight: "700",
      letterSpacing: -0.3,
    },
    brandAiRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 2,
    },
    brandAiLine: {
      width: 18,
      height: 1,
      backgroundColor: "rgba(255,255,255,0.45)",
      marginHorizontal: 8,
    },
    brandAi: {
      color: "rgba(255,255,255,0.85)",
      fontSize: 11,
      fontWeight: "600",
      letterSpacing: 2,
    },
    headline: {
      color: COLORS.white,
      fontSize: isWide ? 36 : 26,
      fontWeight: "700",
      lineHeight: isWide ? 44 : 34,
      marginBottom: isWide ? 36 : 24,
      maxWidth: 420,
    },
    featureList: {
      marginTop: 0,
    },
    featureItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    featureIconBox: {
      width: 42,
      height: 42,
      borderRadius: 12,
      backgroundColor: "rgba(44,201,217,0.12)",
      borderWidth: 1,
      borderColor: "rgba(44,201,217,0.28)",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 14,
    },
    featureText: {
      color: COLORS.white,
      fontSize: 15,
      fontWeight: "500",
      flexShrink: 1,
    },
    rightPanel: {
      flex: isWide ? 1 : undefined,
      width: isWide ? ("50%" as const) : ("100%" as const),
      backgroundColor: COLORS.panelBg,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: isWide ? 48 : 20,
      paddingVertical: isWide ? 48 : 28,
    },
    loginCard: {
      width: "100%",
      maxWidth: 420,
      backgroundColor: COLORS.white,
      borderRadius: 20,
      paddingHorizontal: isWide ? 36 : 24,
      paddingVertical: isWide ? 40 : 28,
      shadowColor: "#0f172a",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.1,
      shadowRadius: 24,
      elevation: 8,
      ...Platform.select({
        web: {
          boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)",
        } as object,
      }),
    },
    loginTitle: {
      color: COLORS.textDark,
      fontSize: 28,
      fontWeight: "700",
      marginBottom: 8,
    },
    loginSubtitle: {
      color: COLORS.textMuted,
      fontSize: 15,
      marginBottom: 8,
    },
    formWrap: {
      width: "100%",
    },
    cardFooter: {
      marginTop: 28,
      alignItems: "center",
    },
    secureText: {
      color: COLORS.textSoft,
      fontSize: 12,
      marginBottom: 12,
      textAlign: "center",
    },
    salesRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
    },
    salesText: {
      color: COLORS.textMuted,
      fontSize: 14,
    },
    salesLink: {
      color: COLORS.textDark,
      fontSize: 14,
      fontWeight: "700",
    },
  });
}

export default createAuthStyles;
