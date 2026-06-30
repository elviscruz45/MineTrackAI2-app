import { StyleSheet } from "react-native";

export const createGeneralFormsStyles = (windowWidth: number) => {
  const isCompact = windowWidth < 640;

  return StyleSheet.create({
    container: {
      width: "100%",
      alignSelf: "stretch",
    },
    content: {
      marginHorizontal: 0,
    },
    textArea: {
      height: 100,
      width: "100%",
      padding: 0,
      margin: 0,
    },
    subtitleForm: {
      color: "#2A3B76",
      fontSize: 18,
      fontWeight: "700",
      marginLeft: 0,
    },
    iconMinMax: {
      paddingHorizontal: 15,
      fontWeight: "600",
      alignSelf: "flex-end",
      flexDirection: "row",
      zIndex: 100,
    },
    roundImageUploadmas: {
      width: 30,
      height: 30,
      margin: 5,
    },
    attachedFile: {
      marginLeft: 0,
    },
    pickImagesButton: {
      marginHorizontal: isCompact ? 0 : "15%",
      marginVertical: 10,
    },
    pickImagesBtn: {
      backgroundColor: "#f8fafc",
      borderWidth: 1,
      borderColor: "#e2e8f0",
      borderRadius: 10,
      paddingVertical: 12,
    },
    pickImagesBtnTitle: {
      color: "#334155",
      fontWeight: "600",
    },
    imageStrip: {
      backgroundColor: "transparent",
      paddingTop: 12,
      paddingBottom: 4,
    },
    thumb: {
      marginLeft: 12,
      width: 80,
      height: 80,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "#e2e8f0",
    },
    hseGroupLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: "#64748b",
      marginBottom: 4,
      marginTop: 4,
      paddingHorizontal: 10,
    },
  });
};
