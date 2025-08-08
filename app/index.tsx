import React from "react";
import { Text, View, ScrollView } from "react-native";
import styles from "./index.styles";
import { Image as ImageExpo } from "expo-image";
import { Linking } from "react-native";
import { ConnectedLoginForm } from "@/components/LoginForm";

export default function AuthScreen() {
  const goToRegister = () => {
    Linking.openURL("https://www.teseosoftwarecompany.com/"); // to register a new user , it show to get in touch with a personel from Teseo
  };
  //df
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={styles.image}>
        <ImageExpo
          source={require("../assets/login/Pandora.png")}
          style={{ width: 350, height: 60 }}
          cachePolicy={"memory-disk"}
        />
        <Text> </Text>
        <ImageExpo
          source={require("../assets/login/logofhingenieros.png")}
          style={{ width: 180, height: 30 }}
          cachePolicy={"memory-disk"}
        />
        <Text> </Text>
        <Text> </Text>
      </View>
      <View>
        <ConnectedLoginForm />
      </View>
      <View style={styles.image}>
        <ImageExpo
          testID="image"
          source={require("../assets/login/logoPandora_1024.jpg")}
          style={{ width: 50, height: 50, borderRadius: 25 }}
          cachePolicy={"memory-disk"}
        />

        <Text></Text>
        <Text style={styles.btnRegister}>
          Powered by Pandora Software Company
        </Text>
        <Text style={styles.btnRegister}>Version 2.0.1</Text>

        <Text></Text>
        <Text></Text>
      </View>
    </ScrollView>
  );
}
