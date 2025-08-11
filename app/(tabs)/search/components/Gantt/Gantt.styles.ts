import { StyleSheet, Dimensions, Platform } from "react-native";
const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

// Antamina color palette based on screenshots
const COLORS = {
  primary: "#2e4d8c",       // Antamina dark blue
  primaryLight: "#3e5fa0",  // Lighter blue for hover states
  secondary: "#f8f9fa",     // Light background
  accent: "#093e87",        // Accent blue
  success: "#28a745",
  info: "#17a2b8",
  warning: "#ffc107",
  danger: "#dc3545",
  light: "#f8f9fa",
  dark: "#495057",
  white: "#ffffff",
  black: "#212529",
  gray: "#6c757d",
  grayLight: "#f0f2f5",     // Background gray
  grayDark: "#495057",
  transparent: "transparent",
  borderLight: "#dee2e6",
  headerBg: "#2e4d8c",      // Header background blue
  badgeBg: "#2e4d8c",       // Badge background blue
};

const styles = StyleSheet.create({
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  dateText: {
    color: COLORS.grayLight,
    fontSize: 14,
    marginRight: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    color: COLORS.light,
    fontSize: 14,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  antaminaLogo: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  antaminaText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  antaminaBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: COLORS.badgeBg,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  opStyle: {
    borderColor: COLORS.white,
    borderLeftWidth: 2,
    borderRightWidth: 0,
    marginLeft: 20,
    paddingLeft: 20,
  },
  timeWrapper: {
    alignItems: "center",
    marginRight: 10,
  },
  timeContainerStyle: {
    minWidth: 60,
    marginTop: 0,
    marginRight: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  timeStyle: {
    textAlign: "center",
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    overflow: "hidden",
    fontSize: 14,
    fontWeight: "600",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    ...(Platform.OS !== "web" ? { elevation: 2 } : {}),
  },
  list: {
    flex: 1,
    marginTop: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  descriptionContainer: {
    flexDirection: "row",
    paddingRight: 50,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.grayLight,
  },
  textDescription: {
    marginLeft: 10,
    color: COLORS.gray,
    fontSize: 14,
    lineHeight: 20,
  },
  //comes from other place

  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  listview: {
    flex: 1,
  },
  sectionHeader: {
    marginBottom: 15,
    backgroundColor: COLORS.primary,
    height: 40,
    justifyContent: "center",
    borderRadius: 8,
    marginHorizontal: 10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    ...(Platform.OS !== "web" ? { elevation: 2 } : {}),
  },
  sectionHeaderText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    alignSelf: "center",
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: 10,
  },
  timeContainer: {
    minWidth: 60,
    alignItems: "center",
  },
  time: {
    textAlign: "center",
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    marginLeft: 40,
    marginTop: 16,
    zIndex: 10,
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    ...(Platform.OS !== "web" ? { elevation: 3 } : {}),
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 6,
  },

  details: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
  },

  titledetails: {
    width: "100%",
    marginLeft: 5,
    marginRight: 5,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
  },
  description: {
    marginTop: 10,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginTop: 15,
    marginBottom: 15,
    width: "100%",
  },
  avanceNombre: {
    fontWeight: "600",
    color: COLORS.gray,
    fontSize: 14,
  },
  rowavanceNombre: {
    flexDirection: "row",
    marginTop: 6,
    marginLeft: 5,
    alignItems: "center",
  },
  detail: {
    marginLeft: 5,
    marginRight: 5,
    color: COLORS.dark,
    fontWeight: "500",
  },
  textdetail: {
    width: "100%",
    marginLeft: 12,
    marginRight: 5,
    textAlign: "left",
    fontSize: 15,
    color: COLORS.dark,
    lineHeight: 22,
  },
  cardContainer: {
    borderColor: COLORS.borderLight,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    marginTop: 8,
    backgroundColor: COLORS.white,
    overflow: "hidden",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    ...(Platform.OS !== "web" ? { elevation: 2 } : {}),
    transform: [{ translateY: 0 }], // For animation purposes
    // Multi-column responsive styles will be applied in-line
  },
  timelineContainer: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: COLORS.headerBg,
    position: "relative", // For the proper positioning of the timeline elements
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginLeft: 5,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  infoContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  staffContainer: {
    backgroundColor: COLORS.grayLight,
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    marginBottom: 5,
  },
  staffHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 10,
  },
  staffRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  staffItem: {
    width: "50%",
    paddingVertical: 4,
  },
  searchContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 0,
    paddingHorizontal: 10,
    marginBottom: 10,
    paddingTop: 10,
    borderTopWidth: 0,
  },
  searchInputContainer: {
    backgroundColor: COLORS.grayLight,
    borderRadius: 10,
    height: 40,
    borderBottomWidth: 0,
  },
  flatListColumns: {
    padding: 0,
    margin: 0,
  },
  attachment: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary + "15", // Adding transparency
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.primary + "30",
  },
  attachmentIcon: {
    marginRight: 8,
  },
  attachmentText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  // New styles for enhanced UI
  progressBarContainer: {
    marginTop: 8,
    marginBottom: 4,
    height: 6,
    width: "100%",
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginTop: 50,
  },
  emptyStateText: {
    color: COLORS.gray,
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
  },
  emptyStateIcon: {
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginRight: 6,
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
});
export default styles;
