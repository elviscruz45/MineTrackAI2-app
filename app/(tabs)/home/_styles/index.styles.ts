import { StyleSheet, Dimensions } from "react-native";
import { Platform, StatusBar } from "react-native";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  containerFlatListView1: {
    borderBottomWidth: 2,
    borderBottomColor: "#8CBBF1",
    margin: 2,
  },
  row: {
    flexDirection: "row",
  },
  company: {
    paddingHorizontal: 15,
    fontWeight: "900",
    textAlign: "center",
  },
  rowlikes: {
    flexDirection: "row",
    margin: 10,
  },
  center: {
    alignItems: "center",
    // justifyContent: "space-between",
    margin: 0,
  },
  roundImage: {
    width: 30,
    height: 30,
    borderRadius: 20,
    // borderWidth: 0.5,
    margin: 5,
    // borderColor: "black",
  },
  roundImage5: { width: 60, height: 60, borderRadius: 30, marginLeft: 20 },
  textImage: { alignItems: "center" },
  Texticons: { alignItems: "center", marginLeft: 20 },

  postPhoto: {
    // height: windowWidth > 1000 ? windowWidth * 0.15 : windowWidth * 0.45,
    // width: windowWidth > 1000 ? windowWidth * 0.15 : windowWidth * 0.45,
    height: 250,
    width: 200,
    marginTop: 0,
    // borderRadius: 5,
    borderWidth: 0.0,
    borderRightWidth: 1, // Only right border
    borderRightColor: "#2A3B76", // Your desired color
  },
  textAreaTitle: {
    // width: windowWidth * 0.45,
    // maxWidth: windowWidth * 0.35,
    maxWidth: 200,

    marginLeft: 10,
    fontWeight: "bold",
    fontSize: 18,
  },
  textAreaComment: {
    // width: windowWidth * 0.45,
    width: 200,
    maxWidth: 190,
    marginLeft: 10,
    fontSize: 14,
  },
  NombreServicio: {
    // maxWidth: windowWidth * 0.48,
    // width: windowWidth * 0.4,
    maxWidth: 150,
    // color: true ? "black" : "red",
  },
  NombrePerfilCorto: {
    // width: windowWidth * 0.13,
    maxWidth: 150,
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

  textAreaCommentplus: {
    width: windowWidth * 0.6,
    marginLeft: 10,
    fontWeight: "300",
  },

  textAreaTitleplus: {
    width: windowWidth * 0.6,
    marginLeft: 10,
    color: "black",
    fontWeight: "600",
  },
  avatar: {
    marginRight: 20,
    backgroundColor: "green",
  },
  likeComment: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: windowWidth * 0.1,
  },
  // AndroidSafeArea: {
  //   flex: 1,
  //   backgroundColor: "white",
  //   paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  // },
});

export default styles;
