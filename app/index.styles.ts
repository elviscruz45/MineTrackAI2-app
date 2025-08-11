import { StyleSheet, Dimensions, Platform } from "react-native";

const { width, height } = Dimensions.get("window");
const isTablet = width > 768;

// Modern color palette
const COLORS = {
  primary: "#2A3B76", // Pandora primary blue
  primaryLight: "#3e5fa0", // Lighter blue for hover states
  secondary: "#f8f9fa", // Light background
  accent: "#ff6b6b", // Accent color for highlights
  white: "#ffffff",
  lightGray: "#f0f2f5",
  mediumGray: "#e1e4e8",
  darkGray: "#6c757d",
  textDark: "#343a40",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  gradientBackground: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: height * 0.4,
  },
  headerContainer: {
    width: "100%",
    paddingTop: isTablet ? 120 : 80,
    paddingBottom: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  image: {
    resizeMode: "contain",
    width: "100%",
    alignItems: "center",
    paddingVertical: 20,
  },
  logoContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  mainLogo: {
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryLogo: {
    marginTop: 10,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: isTablet ? width * 0.02 : width * 0.05,
    marginTop: -30,
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  textRegister: {
    marginTop: 15,
    marginHorizontal: 10,
    textAlign: "center",
  },
  btnRegister: {
    color: COLORS.primary,
    fontWeight: "bold",
    fontSize: 14,
  },
  content: {
    alignItems: "center",
  },
  footerContainer: {
    paddingTop: 30,
    paddingBottom: 40,
    alignItems: "center",
  },
  footerLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
  },
  footerText: {
    color: COLORS.darkGray,
    fontSize: 14,
    marginBottom: 5,
    textAlign: "center",
  },
  versionText: {
    color: COLORS.darkGray,
    fontSize: 12,
    fontWeight: "500",
  },
});

export default styles;
