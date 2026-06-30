import { StyleSheet } from "react-native";

export const createTitleFormsStyles = (windowWidth: number) => {
  const isCompact = windowWidth < 768;
  const isDesktop = windowWidth >= 1024;

  return StyleSheet.create({
    equipments: {
      flexDirection: isCompact ? "column" : "row",
      alignItems: isCompact ? "center" : "flex-start",
      gap: isCompact ? 16 : 20,
      marginHorizontal: 0,
      marginVertical: 0,
      alignSelf: "stretch",
    },
    formColumn: {
      flex: 1,
      width: isCompact ? "100%" : undefined,
      minWidth: 0,
    },
    postPhoto: {
      width: isDesktop ? 180 : isCompact ? "100%" : 160,
      height: isDesktop ? 180 : isCompact ? 220 : 160,
      maxWidth: isCompact ? 320 : undefined,
      alignSelf: isCompact ? "center" : "flex-start",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: "#e2e8f0",
      backgroundColor: "#f8fafc",
    },
    textArea: {
      padding: 0,
      margin: 0,
      minHeight: 44,
    },
    textArea2: {
      padding: 0,
      margin: 0,
      minHeight: isCompact ? 96 : 88,
    },
    content: {
      marginHorizontal: 0,
    },
    subtitleForm: {
      color: "#2A3B76",
      fontSize: 18,
      fontWeight: "500",
      marginLeft: 0,
    },
  });
};
