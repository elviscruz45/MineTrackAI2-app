import { StyleSheet, Platform, Dimensions } from "react-native";

const windowHeight = Dimensions.get("window").height;

const styles = StyleSheet.create({
  overlay: {
    height: "auto",
    width: Platform.OS === "web" ? "90%" : "90%",
    zIndex: 1000,
    minHeight: 150,
    padding: 0,
    maxHeight: Platform.OS === "web" ? windowHeight * 0.9 : "90%",
    borderRadius: 12,
    overflow: "hidden",
  },
});
export default styles;
