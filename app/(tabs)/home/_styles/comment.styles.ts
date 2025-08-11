import { StyleSheet, Dimensions, Platform } from "react-native";
const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

// Define a consistent color palette
const COLORS = {
  primary: "#3498db",
  primaryLight: "#a1c4fd",
  secondary: "#2c3e50",
  accent: "#f1c40f",
  background: "#ffffff",
  card: "#f8f9fa",
  text: "#2d3436",
  textLight: "#636e72",
  border: "#dfe6e9",
  success: "#2ecc71",
  error: "#e74c3c",
};

export const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  containerFlatListView1: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primaryLight,
    marginVertical: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  editIcon: {
    width: 24,
    height: 24,
    alignSelf: "flex-end",
    position: "absolute",
  },
  row5: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  center: {
    justifyContent: "space-between",
    alignItems: "center",
  },
  row2: {
    flexDirection: "row",
    alignItems: "center",
  },
  center2: {
    justifyContent: "space-between",
    marginLeft: 10,
    color: COLORS.textLight,
    fontSize: 14,
  },
  row3: {
    flexDirection: "row",
    alignItems: "center",
  },
  center3: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  center4: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
  },
  rowlikes: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
    marginHorizontal: 16,
  },
  roundImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.border,
  },
  roundImage10: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  roundImage5: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginLeft: 20,
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
  },
  textImage: { alignItems: "center" },
  Texticons: { alignItems: "center", marginLeft: 20 },

  postPhoto: {
    ...(Platform.OS === "web"
      ? {
          height: windowWidth * 0.4,
          width: windowWidth * 0.6,
        }
      : {
          height: windowWidth * 0.7,
          width: windowWidth * 0.95,
        }),
    marginTop: 10,
    marginBottom: 16,
    borderRadius: 12,
    alignSelf: "center",
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    ...(Platform.OS === "web" ? {} : { elevation: 4 }),
  },
  postPhoto2: {
    ...(Platform.OS === "web"
      ? {
          height: windowWidth * 0.25,
          width: windowWidth * 0.25,
        }
      : {
          height: windowWidth * 0.5,
          width: windowWidth * 0.5,
        }),
    margin: 8,
    borderRadius: 12,
    alignSelf: "center",
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    ...(Platform.OS === "web" ? {} : { elevation: 2 }),
  },
  container2: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image2: {
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 5,
  },
  equipments: {
    flexDirection: "row",
    margin: 5,
  },
  textAreaComment: {
    marginLeft: 10,
    color: COLORS.text,
  },
  textAreaCommentplus: {
    marginLeft: 5,
  },
  textAreaTitle: {
    marginLeft: 10,
    fontWeight: "600",
    fontSize: 16,
    color: COLORS.secondary,
  },
  textAreaTitleplus: {
    marginLeft: 5,
    fontWeight: "600",
  },
  commentContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: COLORS.card,
    borderRadius: 24,
    marginHorizontal: 12,
    marginVertical: 16,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    ...(Platform.OS === "web" ? {} : { elevation: 2 }),
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    backgroundColor: COLORS.background,
    marginHorizontal: 12,
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
  avanceNombre: {
    fontWeight: "600",
    color: COLORS.textLight,
    fontSize: 14,
    marginHorizontal: 16,
    marginVertical: 4,
  },
  // New styles
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
  },
  headerText: {
    fontSize: 15,
    color: COLORS.textLight,
  },
  titleText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.secondary,
    marginVertical: 12,
    textAlign: "center",
  },
  detailText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  commentCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 8,
    padding: 12,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    ...(Platform.OS === "web" ? {} : { elevation: 1 }),
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  commentText: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: 4,
  },
  dateText: {
    color: COLORS.textLight,
    fontSize: 12,
  },
  userName: {
    fontWeight: "600",
    color: COLORS.secondary,
    fontSize: 15,
  },
  galleryContainer: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.secondary,
    marginLeft: 16,
    marginBottom: 8,
  },
});
