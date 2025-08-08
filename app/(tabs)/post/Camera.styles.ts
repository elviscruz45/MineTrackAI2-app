import { StyleSheet, Dimensions, Platform } from "react-native";

const { width, height } = Dimensions.get("window");

const styles2 = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    // alignContent: "center",
    // justifyContent: "space-between",
    // alignItems: "center",
    // alignSelf: "center",
    // textAlign: "center",
    marginLeft: 0,

    ...(Platform.OS === "android"
      ? { marginBottom: height * 0.05 }
      : { marginBottom: height * 0.15 }),

    // backgroundColor: "transparent",
    // margin: height * 0.15,
    // marginTop: height * 0.8,
  },
  button: {
    alignSelf: "flex-end",
    alignItems: "center",
  },
  cameraButton: {
    // borderRadius: 50,
    alignSelf: "flex-end",
    flex: 1,
    alignItems: "center",

    // marginLeft: 80,
  },
});

export default styles2;
