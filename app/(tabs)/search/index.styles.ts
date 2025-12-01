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
    maxWidth: 250,
  },
  info: {
    color: "#828282",
    paddingRight: 100,
    marginTop: 3,
    maxWidth: "90%",
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
  // Nuevos estilos para el diseño responsive con tarjetas
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f5f5f5",
  },
  searchBarContainer: {
    backgroundColor: "transparent",
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 0,
  },
  searchBarInput: {
    backgroundColor: "#ffffff",
    borderRadius: 25,
    paddingHorizontal: 10,
  },
  searchBarText: {
    fontSize: 16,
    color: "#333",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 8,
  },
  columnWrapper: {
    justifyContent: "flex-start",
    gap: 16,
    marginBottom: 16,
  },
  cardContainer: {
    flex: 1,
    minWidth: windowWidth >= 768 ? 200 : "100%",
    maxWidth: windowWidth >= 768 ? 400 : "100%",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    padding: 12,
    alignItems: "center",
    minHeight: 100,
  },
  cardImageContainer: {
    width: 70,
    height: 70,
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginRight: 12,
    flexShrink: 0,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2A3B76",
    marginBottom: 6,
    lineHeight: 18,
  },
  cardInfo: {
    gap: 4,
  },
  infoText: {
    fontSize: 11,
    lineHeight: 16,
  },
  infoText: {
    fontSize: 11,
    lineHeight: 16,
  },
  infoLabel: {
    fontWeight: "600",
    color: "#666",
  },
  infoValue: {
    color: "#333",
    fontWeight: "400",
  },
});
export default styles;
