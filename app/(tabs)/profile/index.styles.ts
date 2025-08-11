import { StyleSheet, Dimensions } from "react-native";
import { Platform, StatusBar } from "react-native";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const styles = StyleSheet.create({
  btncerrarStyles: {
    // marginTop: 5,
    // marginBottom: 10,
    // paddingVertical: 10,
    // marginHorizontal: 150,
    borderRadius: 20,
    backgroundColor: "red",
    // borderTopWidth: 1,
    // borderTopColor: "#e3e3e3",
    // borderBottomWidth: 1,
    // borderBottomColor: "#e3e3e3",
    // marginHorizontal: 20,
    marginBottom: 10,
    marginTop: 10,
  },
  roundImageUpload: {
    width: 50,
    height: 50,
    zIndex: 122,
    // borderRadius: 50, // half of width and height
  },
  btnContainer4: {
    zIndex: 100,
    // width: 1,
    // height: 1,
    position: "absolute",
    marginTop: 10,
    // right: 10,
    // paddingHorizontal: 90,
    marginLeft: windowWidth - 100,
    paddingHorizontal: 20,
  },
  btnActualizarStyles: {
    // marginTop: 30,
    // paddingVertical: 10,
    // marginLeft: 100,
    borderRadius: 20,
    backgroundColor: "#2A3B76",
    // marginHorizontal: windowWidth / 5,

    // borderTopWidth: 1,
    // borderTopColor: "#e3e3e3",
    // borderBottomWidth: 1,
    // borderBottomColor: "#e3e3e3",
  },
  btnTextStyle: {
    color: "#ffff",
    fontWeight: "bold",
  },
  detalles: {
    // flexDirection: "row", // Set direction to row for horizontal layout
    // justifyContent: "space-between", // Optional: adjust spacing between items
    // alignItems: "center", // Optional: adjust vertical alignment of items
    // alignContent: "center",
    // justifyContent: "left",
    // marginLeft: 15,
    // paddingRight: 40,
  },
  btnContainer2: {
    position: "absolute",
    bottom: windowHeight * 0.01,
    right: 10,
    zIndex: 9999, // Set a higher value
  },
  image2: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
  },
  equipments2: {
    flexDirection: "row",
    marginHorizontal: 5,
    marginVertical: 5,
  },
  name2: {
    fontWeight: "bold",
  },
  info2: {
    color: "#828282",
    paddingRight: 100,
    marginTop: 3,
  },
  attachedElement: {
    position: "absolute", // Add position: "absolute" to position the component
    right: 20, //
  },
  bellNomber: {
    backgroundColor: "white",

    fontSize: 15,
    marginLeft: 382,
    marginTop: 10,

    borderRadius: 11,
    position: "absolute",
    zIndex: 22220,
    padding: 0,
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: "red",
  },
  AndroidSafeArea: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  roundImage1000: {
    width: 150,
    height: 150,
    borderRadius: 75,

    // margin: 5,
    alignSelf: "center",
  },
  commentContainer: {
    // zIndex: 100,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 5,

    // marginBottom: 10,

    borderColor: "#f0f8ff",
    borderWidth: 10,
  },
  input: {
    flex: 1,
    // height: 40,
    borderRadius: 20,
    // paddingHorizontal: 10,
    backgroundColor: "white",
    // marginRight: 10,
    // marginBottom: "14%",
  },
  sendButton: {
    backgroundColor: "#8CBBF1",
    borderRadius: 20,
    padding: 10,
    marginLeft: 10,
    // zIndex: 1000,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  statCard: {
    width: windowWidth / 2 - 25,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    flexDirection: "row",
    alignItems: "center",
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2A3B76",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  activitySummary: {
    backgroundColor: "white",
    marginHorizontal: 15,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2A3B76",
    marginBottom: 15,
  },
  barChartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 180,
    paddingTop: 30,
  },
  barChartColumn: {
    alignItems: "center",
    flex: 1,
  },
  barLabelContainer: {
    position: "absolute",
    top: -25,
    alignItems: "center",
  },
  barValue: {
    fontSize: 11,
    color: "#666",
  },
  bar: {
    width: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 12,
    color: "#666",
  },
  recentActivityContainer: {
    backgroundColor: "white",
    marginHorizontal: 15,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  activityDate: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
});

export default styles;
