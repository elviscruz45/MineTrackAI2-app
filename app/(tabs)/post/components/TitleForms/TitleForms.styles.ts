import { StyleSheet, Dimensions } from "react-native";
const windowWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  content: {
    marginHorizontal: 10,
  },
  textArea: {
    // width: windowWidth * 0.55,
    // height: windowWidth * 0.3,
    padding: 0,
    margin: 0,
  },
  textArea2: {
    // width: windowWidth * 0.55,
    height: windowWidth * 0.15,
    padding: 0,
    margin: 0,
  },
  subtitleForm: {
    color: "blue",
    fontSize: 18,
    fontWeight: "500",
    marginLeft: 9,
  },
  equipments: {
    flexDirection: "row",
    margin: 10,
    // width: "60%",
    // marginRight: 140,

    marginHorizontal: "20%",

    alignItems: "center",
    // justifyContent: "space-between",
    alignSelf: "center",
  },
  postPhoto: {
    // height: 700,
    // width: windowWidth,
    height: windowWidth > 1000 ? windowWidth * 0.2 : windowWidth * 0.45,
    width: windowWidth > 1000 ? windowWidth * 0.15 : windowWidth * 0.35,
    marginTop: 0,
    borderRadius: 20,
    borderWidth: 1,
  },
});
export default styles;
