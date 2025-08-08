import { StyleSheet, Dimensions } from "react-native";
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
  btnActualizarStyles: {
    // marginTop: 30,
    // paddingVertical: 10,
    // marginLeft: 100,
    borderRadius: 20,
    backgroundColor: "black",
    marginHorizontal: windowWidth / 5,

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
    marginTop: 0,
    marginHorizontal: 10,
    borderWidth: 0.3,
  },
  equipments2: {
    flexDirection: "row",
    marginHorizontal: 5,
    marginTop: 10,
    alignContent: "center",
    alignItems: "center",
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
  icon: {
    marginRight: 10, // Example margin to add space to the right of the icon
    // Add other styling properties as needed
  },
});
export default styles;