import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import { Image as ImageExpo } from "expo-image";

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Cargando aplicación...",
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ImageExpo
        source={require("../../assets/login/Pandora.png")}
        style={styles.logo}
        cachePolicy={"memory-disk"}
        contentFit="contain"
        priority="high"
      />

      <ActivityIndicator size="large" color="#2A3B76" style={styles.spinner} />

      <Text style={styles.message}>{message}</Text>

      {Platform.OS === "web" && (
        <Text style={styles.hint}>
          Primera carga puede tardar unos segundos...
        </Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  logo: {
    width: 250,
    height: 60,
    marginBottom: 40,
  },
  spinner: {
    marginVertical: 20,
  },
  message: {
    fontSize: 16,
    color: "#666",
    marginTop: 20,
    textAlign: "center",
  },
  hint: {
    fontSize: 12,
    color: "#999",
    marginTop: 10,
    textAlign: "center",
    fontStyle: "italic",
  },
});
