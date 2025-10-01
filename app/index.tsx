import React from "react";
import {
  Text,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import styles from "./index.styles";
import { Image as ImageExpo } from "expo-image";
import { Linking } from "react-native";
import { ConnectedLoginForm } from "@/components/LoginForm";
// import { LinearGradient } from "expo-linear-gradient";

export default function AuthScreen() {
  const goToRegister = () => {
    Linking.openURL("https://www.teseosoftwarecompany.com/"); // to register a new user, it shows how to get in touch with a personnel from Teseo
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Platform.OS === "ios" ? "transparent" : "#2A3B76"}
        translucent={Platform.OS === "ios"}
      />

      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* Header with logos */}
        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            <ImageExpo
              source={require("../assets/login/Pandora.png")}
              style={[styles.mainLogo, { width: 350, height: 60 }]}
              cachePolicy={"memory-disk"}
              contentFit="contain"
              transition={300}
            />

            {/* <ImageExpo
              source={require("../assets/login/logofhingenieros.png")}
              style={[styles.secondaryLogo, { width: 180, height: 30 }]}
              cachePolicy={"memory-disk"}
              contentFit="contain"
              transition={300}
            /> */}
          </View>
        </View>

        {/* Login form in a card */}
        <View style={styles.formContainer}>
          <ConnectedLoginForm />
        </View>

        {/* Footer with company info */}
        <View style={styles.footerContainer}>
          <ImageExpo
            testID="image"
            source={require("../assets/login/logoPandora_1024.jpg")}
            style={styles.footerLogo}
            cachePolicy={"memory-disk"}
            contentFit="cover"
            transition={300}
          />

          <Text style={styles.footerText}>
            Powered by Pandora Software Company
          </Text>
          <Text style={styles.versionText}>Version 2.0.1</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
