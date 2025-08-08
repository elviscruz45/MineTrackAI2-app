import { StyleSheet, Dimensions } from "react-native";
import { Platform, StatusBar } from "react-native";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const styles = StyleSheet.create({
  radioCard: {
    margin: 3,
    // fontFamily: "DM Sans",
    // display: "flex",
    // flexDirection: "column",
    // alignItems: "flex-start",
    padding: 5,
    paddingLeft: 8,
    paddingRight: 8,
    // gap: 2,
    width: windowWidth,
    backgroundColor: "#FFFFFF",
    shadowColor: "#384967",
    // shadowOffset: {
    //   width: 4,
    //   height: 4,
    // },
    // shadowOpacity: 0.05,
    borderRadius: 16,
    // flex: 0,
    // order: 2,
    // alignSelf: "stretch",
    // flexGrow: 0,
  },
  containerTypes1: {
    flexDirection: "row", // Set direction to row for horizontal layout
    // justifyContent: "space-between", // Optional: adjust spacing between items
    alignItems: "center", // Optional: adjust vertical alignment of items
    // justifyContent: 'center',
  },
  containerTypes: {
    flexDirection: "row", // Set direction to row for horizontal layout
    justifyContent: "space-between", // Optional: adjust spacing between items
    paddingRight: 10,
    margin: 5,
    // alignItems: "center", // Optional: adjust vertical alignment of items
  },
  containerText: {
    marginRight: 10,
  },
  detalles: {
    // flexDirection: "row", // Set direction to row for horizontal layout
    // justifyContent: "space-between", // Optional: adjust spacing between items
    // alignItems: "center", // Optional: adjust vertical alignment of items
    // alignContent: "center",
    // justifyContent: "left",
    marginLeft: 15,
  },
  btnContainer1: {
    position: "absolute",
    bottom: 80,
    right: 10,
  },
  btnContainer2: {
    // position: "absolute",
    // bottom: 10,
    // right: 10,
    // size: 12,
    alignContent: "space-between",
  },
  btnEditDelete: {
    flexDirection: "row",
    alignItems: "center",
    // justifyContent: "flex-end",
  },
  restaurant: {
    flexDirection: "row",
    margin: 10,
  },

  name: {
    fontWeight: "bold",
    // marginRight: 100,
  },
  info: {
    color: "#828282",
    paddingRight: 100,
    marginTop: 3,
  },
  titleText: {
    fontSize: 24,
    // fontFamily: "Arial",
    color: "#FA4A0C",
    fontWeight: "bold",
  },
  tagText: {
    // fontFamily: "Arial",
    fontSize: 12,
  },
  dataText: {
    fontSize: 17,
    // fontFamily: "Arial",
    color: "#FA4A0C",
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
    // justifyContent: "center",
    alignItems: "center",
    // opacity: 0.4,
  },
  container: {
    flex: 1, // Use flex: 1 to make the container fill the entire screen
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  equipments: {
    flexDirection: "row",
    margin: 10,
    width: "100%",
    alignItems: "center", // Align contents vertically
  },
  buttonFollow: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    elevation: 1,
    backgroundColor: "red",
    position: "absolute", // Add position: "absolute" to position the component
    right: 20, // Set left: 0 to align it to the left side of the screen
  },
  buttonUnfollow: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 4,
    // elevation: 1,
    backgroundColor: "black",
    marginLeft: 20,
    position: "absolute", // Add position: "absolute" to position the component
    right: 20, // Set left: 0 to align it to the left side of the screen
  },
  textFollow: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "white",
  },
  AndroidSafeArea: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  // Add the following styles
  // container: {
  //   flex: 1,
  //   backgroundColor: '#f7f7f7',
  // },
  // AndroidSafeArea: {
  //   paddingTop: Platform.OS === 'android' ? 25 : 0,
  // },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 12,
  },
  cardText: {
    flex: 1,
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.3)",
  },
  footerText: {
    color: "#FFFFFF",
    fontSize: 12,
    opacity: 0.8,
  },
});
export default styles;
