import { StyleSheet } from "react-native";

const BRAND = "#2A3B76";
const PAGE_BG = "#f1f5f9";
const CARD_BG = "#ffffff";
const BORDER = "#e2e8f0";
const MUTED = "#64748b";

export const createHomeWebStyles = (windowWidth: number) => {
  const isCompact = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;
  const contentMaxWidth = Math.min(windowWidth, 1200);
  const horizontalPad = isCompact ? 16 : isTablet ? 20 : 24;
  const numColumns = windowWidth >= 1280 ? 3 : windowWidth >= 768 ? 2 : 1;

  return {
    numColumns,
    styles: StyleSheet.create({
      safeArea: {
        flex: 1,
        backgroundColor: PAGE_BG,
      },
      page: {
        flex: 1,
        width: "100%",
        maxWidth: contentMaxWidth,
        alignSelf: "center",
        paddingHorizontal: horizontalPad,
        paddingTop: isCompact ? 16 : 24,
        paddingBottom: 40,
      },
      pageHeader: {
        marginBottom: isCompact ? 16 : 20,
      },
      pageTitle: {
        fontSize: isCompact ? 22 : 28,
        fontWeight: "800",
        color: "#1e293b",
        letterSpacing: -0.3,
      },
      pageSubtitle: {
        fontSize: isCompact ? 13 : 15,
        color: MUTED,
        marginTop: 8,
        lineHeight: isCompact ? 20 : 24,
        maxWidth: isDesktop ? 640 : undefined,
      },
      sectionTitle: {
        fontSize: isCompact ? 18 : 22,
        fontWeight: "700",
        color: BRAND,
        marginBottom: 4,
      },
      sectionHint: {
        fontSize: 13,
        color: MUTED,
        marginBottom: isCompact ? 16 : 20,
      },
      kpiGrid: {
        flexDirection: isDesktop ? "row" : "column",
        flexWrap: "wrap",
        gap: isCompact ? 12 : 16,
        marginBottom: isCompact ? 20 : 28,
      },
      kpiCard: {
        backgroundColor: CARD_BG,
        borderRadius: 14,
        padding: 16,
        flex: isDesktop ? 1 : undefined,
        width: isDesktop ? undefined : "100%",
        minWidth: isDesktop ? 200 : undefined,
        borderWidth: 1,
        borderColor: BORDER,
        borderTopWidth: 3,
      },
      kpiLabel: {
        fontSize: 12,
        color: MUTED,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.4,
        flex: 1,
        paddingRight: 8,
      },
      kpiValue: {
        fontSize: 28,
        fontWeight: "800",
        marginBottom: 8,
        lineHeight: 32,
      },
      kpiSub: {
        fontSize: 12,
        flex: 1,
      },
      kpiIconWrap: {
        width: 38,
        height: 38,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        flexShrink: 0,
      },
      kpiHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
      },
      kpiTrendRow: {
        flexDirection: "row",
        alignItems: "center",
      },
      eventsGrid: {
        paddingBottom: 50,
      },
      columnWrapper: {
        justifyContent: "flex-start",
        gap: 16,
        marginBottom: 16,
      },
      eventCard: {
        backgroundColor: CARD_BG,
        borderRadius: 14,
        overflow: "hidden",
        marginBottom: isCompact ? 16 : 0,
        flex: 1,
        minWidth: isCompact ? "100%" : 280,
        borderWidth: 1,
        borderColor: BORDER,
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
      },
      eventBadge: {
        position: "absolute",
        left: 12,
        top: 12,
        zIndex: 10,
        backgroundColor: BRAND,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
      },
      eventBadgeText: {
        color: "#fff",
        fontSize: 11,
        fontWeight: "600",
      },
      eventImage: {
        width: "100%",
        height: isCompact ? 180 : 190,
      },
      eventBody: {
        padding: 16,
      },
      eventServiceRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
      },
      eventServiceIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        marginRight: 8,
      },
      eventServiceName: {
        fontSize: 14,
        fontWeight: "600",
        color: BRAND,
        flex: 1,
      },
      eventTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#334155",
        marginBottom: 8,
        lineHeight: 22,
      },
      eventComment: {
        fontSize: 14,
        color: "#64748b",
        lineHeight: 20,
        marginBottom: 12,
      },
      eventFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: BORDER,
        paddingTop: 12,
        flexWrap: "wrap",
        gap: 8,
      },
      eventMeta: {
        fontSize: 13,
        color: MUTED,
      },
      eventActionBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: BRAND,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
      },
      eventActionText: {
        marginLeft: 4,
        color: "#fff",
        fontSize: 13,
        fontWeight: "600",
      },
      emptyWrap: {
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
      },
      emptyText: {
        fontSize: 13,
        color: MUTED,
        marginTop: 6,
        textAlign: "center",
        lineHeight: 19,
      },
      loadingWrap: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
      },
    }),
  };
};

export { BRAND, PAGE_BG, MUTED };
