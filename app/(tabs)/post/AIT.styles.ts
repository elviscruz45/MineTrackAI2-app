import { StyleSheet, Dimensions, Platform } from "react-native";
const windowWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: "#F4F6FA",
    flex: 1,
  },
  pageWrap: {
    maxWidth: 720,
    alignSelf: "center",
    width: "100%",
  },
  heroCard: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8ECF4",
    padding: 16,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 4px 20px rgba(42, 59, 118, 0.08)" as any }
      : {
          shadowColor: "#2A3B76",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 3,
        }),
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  roundImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: "#E8ECF4",
  },
  heroContent: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  badgePrimary: {
    backgroundColor: "#EEF1FA",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeWarning: {
    backgroundColor: "#FFF4EC",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2A3B76",
    letterSpacing: 0.3,
  },
  badgeWarningText: {
    color: "#C45C26",
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1F36",
    marginBottom: 6,
    lineHeight: 24,
  },
  heroMeta: {
    fontSize: 13,
    color: "#5A6478",
    marginBottom: 2,
    lineHeight: 20,
  },
  heroMetaStrong: {
    fontWeight: "600",
    color: "#2A3B76",
  },
  progressWrap: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#EEF1FA",
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: "#5A6478",
    fontWeight: "500",
  },
  progressPct: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2A3B76",
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "#E8ECF4",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 6,
    backgroundColor: "#2A3B76",
    borderRadius: 3,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: Platform.OS === "web" ? 24 : 32,
    backgroundColor: "#F4F6FA",
    borderTopWidth: 1,
    borderTopColor: "#E8ECF4",
  },
  addInformation: {
    backgroundColor: "#2A3B76",
    borderRadius: 12,
    paddingVertical: 14,
  },
  addInformationTitle: {
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.2,
  },
  addInformationDisabled: {
    backgroundColor: "#9AA5B8",
  },
  // legacy
  btnContainer1: {
    position: "absolute",
    bottom: 80,
    right: 10,
  },
  btnEditDelete: {
    flexDirection: "row",
    alignItems: "center",
  },
  restaurant: {
    flexDirection: "row",
    margin: 10,
  },
  image: {
    width: 80,
    height: 80,
    marginRight: 15,
  },
  radioCard: {
    margin: 3,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: 5,
    paddingLeft: 8,
    paddingRight: 8,
    gap: 2,
    width: windowWidth - 8,
    backgroundColor: "#FFFFFF",
    shadowColor: "#384967",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.05,
    borderRadius: 16,
    flex: 0,
    alignSelf: "stretch",
    flexGrow: 0,
  },
  backgroundImage: { flex: 1 },
  postPhoto: {
    height: windowWidth * 0.45,
    width: windowWidth * 0.35,
    marginTop: 0,
  },
  avatar: {
    marginRight: 20,
    backgroundColor: "#D7DDE9",
    zIndex: 10,
  },
  sectionForms: {
    flexDirection: "row",
    margin: 10,
  },
  name: {
    fontWeight: "bold",
    textAlign: "center",
    marginRight: 100,
    maxWidth: 200,
    marginLeft: 10,
  },
  info: {
    color: "#828282",
    paddingRight: 100,
    marginTop: 3,
  },
  content: {
    marginHorizontal: 10,
  },
  textArea: {
    width: windowWidth * 0.58,
    height: windowWidth * 0.3,
    padding: 0,
    margin: 0,
  },
  btnContainer2: {
    position: "absolute",
    bottom: 10,
    right: 10,
  },
});

export default styles;
