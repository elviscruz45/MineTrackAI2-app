import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  content: {
    alignItems: "center",
    paddingVertical: 10,
    width: "100%",
  },
  btnContainer: {
    width: "95%",
    marginTop: 10,
  },
  btn: {
    backgroundColor: "#2A3B76",
  },
  manualLabel: {
    alignSelf: "flex-start",
    marginLeft: "2.5%",
    fontSize: 12,
    color: "#2A3B76",
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
  },
  manualInput: {
    width: "95%",
    borderWidth: 1,
    borderColor: "#c8d0df",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#1e293b",
    backgroundColor: "#f8fafc",
  },
});

export default styles;
