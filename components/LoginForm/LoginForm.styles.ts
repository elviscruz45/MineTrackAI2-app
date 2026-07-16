import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  content: {
    width: "100%",
    alignItems: "stretch",
  },
  input: {
    width: "100%",
    marginTop: 16,
    paddingHorizontal: 0,
  },
  inputInner: {
    borderWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    minHeight: 48,
    backgroundColor: "#FFFFFF",
  },
  icon: {
    color: "#9CA3AF",
  },
  btnContainer: {
    marginTop: 24,
    width: "100%",
  },
  btn: {
    backgroundColor: "#1D2D5B",
    borderRadius: 10,
    paddingVertical: 14,
  },
});

export default styles;
