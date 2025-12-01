import { StyleSheet, Dimensions } from "react-native";
import { Platform, StatusBar } from "react-native";

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  space: {
    alignItems: "center",
    justifyContent: "space-between",
  },
  containerPost: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    margin: 0,
  },
  center: {
    alignItems: "center",
    justifyContent: "space-between",
    margin: 0,
  },
  row: {
    flexDirection: "row",
  },
  button: {
    marginTop: 20,
    paddingVertical: 10,
    alignItems: "center",
    borderColor: "#d3d3d3",
    borderWidth: 1,
    borderRadius: 5,
    width: 200,
  },
  facebookButton: {
    backgroundColor: "#3b5998",
    marginTop: 20,
    paddingVertical: 10,
    alignItems: "center",
    borderColor: "#3b5998",
    borderWidth: 1,
    borderRadius: 5,
    width: 200,
  },
  border: {
    width: "85%",
    margin: 10,
    padding: 15,
    fontSize: 16,
    borderColor: "#d3d3d3",
    borderBottomWidth: 1,
    textAlign: "center",
  },
  postPhoto: {
    height: 250,
    width: width,
    marginTop: 0,
  },

  cameraButton: {
    borderRadius: 50,
    alignSelf: "flex-end",
    marginLeft: 80,
  },
  roundImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    margin: 5,
    alignSelf: "center",
  },

  // roundImageUpload: {
  //   width: 40,
  //   height: 40,
  //   // borderRadius: 20,
  //   margin: 10,
  //   alignItems: "center",
  // },

  buttonSmall: {
    margin: 10,
    marginBottom: 0,
    padding: 5,
    alignItems: "center",
    borderColor: "#d3d3d3",
    borderWidth: 1,
    borderRadius: 5,
    width: 125,
  },
  bordercomment: {
    width: "85%",
    margin: 10,
    padding: 10,
    fontSize: 16,
    borderColor: "#d3d3d3",
    borderBottomWidth: 1,
    textAlign: "center",
  },
  postcomment: {
    width: "0%",
    margin: 0,
    padding: 0,
    fontSize: 16,
    borderColor: "#d3d3d3",
    borderBottomWidth: 0,
    textAlign: "left",
  },
  left: {
    alignItems: "flex-start",
  },
  right: {
    alignItems: "flex-end",
  },
  bold: {
    fontWeight: "bold",
  },
  white: {
    color: "#fff",
  },
  gray: {
    color: "#adadad",
  },
  small: {
    fontSize: 10,
  },
  input: {
    width: width * 0.9,
    margin: 15,
    padding: 15,
    alignSelf: "center",
    borderColor: "#d3d3d3",
    borderWidth: 1,
    borderRadius: 50,
    fontSize: 16,
  },
  btnContainer1: {
    // position: "absolute",
    top: 30,
    right: width * 0.2,
  },
  btnContainer2: {
    // position: "absolute",
    // bottom: 10,
    // right: 10,
    // marginHorizontal: 100,
    paddingHorizontal: 60,
  },
  btnContainer3: {
    // position: "absolute",
    // bottom: 80,
    // right: 10,
    // paddingHorizontal: 0,
  },
  btnContainer4: {
    // position: "absolute",
    // bottom: 150,
    // right: 10,
    paddingHorizontal: 60,
  },
  roundImageUpload: {
    width: 50,
    height: 50,
    // borderRadius: 50, // half of width and height
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 0.5,
    marginRight: 10,
  },
  avatar: {
    marginRight: 20,
    backgroundColor: "#D7DDE9",
    zIndex: 10,
  },
  equipments: {
    flexDirection: "row",
    // margin: 10,
    padding: 10,
    width: "100%",
    alignItems: "center", // Align contents vertically
    backgroundColor: "white", // Add backgroundColor here
  },
  equipments2: {
    flexDirection: "row",
    margin: 10,
    // padding: 10,
    // paddingHorizontal: 30,
    // width: "75%",

    alignSelf: "center",
    // alignItems: "center", // Align contents vertically
    // backgroundColor: "red", // Add backgroundColor here
  },
  name: {
    fontWeight: "bold",
    marginRight: 65,
    maxWidth: 250,
  },
  name2: {
    fontWeight: "bold",
    maxWidth: 250,
    alignSelf: "center",
    alignContent: "center",
  },
  info: {
    color: "#828282",
    paddingRight: 100,
    marginTop: 3,
    maxWidth: "90%",
  },
  AndroidSafeArea: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  // Nuevos estilos para diseño responsive con tarjetas
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
    minWidth: width >= 768 ? 200 : "100%",
    maxWidth: width >= 768 ? 400 : "100%",
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
