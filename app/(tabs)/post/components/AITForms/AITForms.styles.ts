import { StyleSheet, Platform } from "react-native";

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    maxWidth: 720,
    alignSelf: "center",
    width: "100%",
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8ECF4",
    padding: 16,
    marginBottom: 16,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 2px 12px rgba(42, 59, 118, 0.06)" as any }
      : {
          shadowColor: "#2A3B76",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
        }),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 8,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#EEF1FA",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    color: "#2A3B76",
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
  sectionHint: {
    color: "#8A94A6",
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 18,
  },
  row2: {
    flexDirection: Platform.OS === "web" ? "row" : "column",
    gap: 8,
  },
  row2Item: {
    flex: Platform.OS === "web" ? 1 : undefined,
  },
  rutaCriticaRow: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 10,
    marginBottom: 8,
  },
  rutaBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#D7DDE9",
    alignItems: "center",
    backgroundColor: "#FAFBFD",
  },
  rutaBtnActive: {
    borderColor: "#2A3B76",
    backgroundColor: "#EEF1FA",
  },
  rutaBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#5A6478",
  },
  rutaBtnTextActive: {
    color: "#2A3B76",
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#5A6478",
    marginHorizontal: 10,
    marginBottom: 6,
  },
  fieldError: {
    color: "#D32F2F",
    fontSize: 12,
    marginHorizontal: 10,
    marginTop: 4,
    marginBottom: 8,
  },
  dateWebWrap: {
    marginHorizontal: 10,
    marginBottom: 12,
  },
  dateWebInput: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D7DDE9",
    fontSize: 15,
    backgroundColor: "#FAFBFD",
    color: "#1A1F36",
  } as any,
  datePreview: {
    fontSize: 13,
    color: "#2A3B76",
    marginTop: 6,
    fontWeight: "500",
  },
});

export default styles;
