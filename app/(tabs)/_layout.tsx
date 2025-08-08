import { Tabs, Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform, TouchableOpacity, Image, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { TabBarIcon } from "@/components/TabBarIcon";
// import { HapticTab } from "@/componentsoriginal/HapticTab";
// import { IconSymbol } from "@/componentsoriginal/ui/IconSymbol";
// import TabBarBackground from "@/componentsoriginal/ui/TabBarBackground";
import { Colors } from "@/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { connect } from "react-redux";
import { getAuth } from "firebase/auth";
import { update_firebasePhoto } from "@/redux/actions/profile";
import { update_firebaseUserName } from "@/redux/actions/profile";
import { update_firebaseEmail } from "@/redux/actions/profile";
import { update_firebaseUid } from "@/redux/actions/profile";
import { titulo_proyecto } from "@/redux/actions/auth";
import { saveActualAITServicesFirebaseGlobalState } from "@/redux/actions/post";
import TituloProyecto from "@/components/tituloProyecto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "@/firebaseConfig";

function TabLayoutRaw(props: any) {
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);

  const router = useRouter();
  const user = getAuth().currentUser;
  useEffect(() => {
    // Check if Firebase is available and handle errors
    try {
      const auth = getAuth();
      setIsFirebaseReady(true);
    } catch (error) {
      console.error("Firebase not initialized:", error);
      // Force navigation to root to retry Firebase initialization
      if (Platform.OS === "web") {
        window.location.replace("/");
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      const { uid, photoURL, displayName, email } = user;
      props.update_firebasePhoto(photoURL);
      props.update_firebaseUserName(displayName);
      props.update_firebaseEmail(email);
      props.update_firebaseUid(uid);
    }
  }, [user]);

  const home_screen = () => {
    router.push({
      pathname: "./home",
      // params: { item: item },
    });
  };

  if (!props.firebase_user_uid) {
    return <Redirect href="/" />;
  }

  // Check authentication after Firebase is confirmed ready
  if (isFirebaseReady && !props.firebase_user_uid) {
    return <Redirect href="/" />;
  }

  // Show loading while checking Firebase
  if (!isFirebaseReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        // tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        // tabBarButton: HapticTab,
        // tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerTitle: () => (
            <TouchableOpacity onPress={() => home_screen()}>
              <Image
                source={require("../../assets/screens/Pandora.png")}
                style={{ width: 200, height: 30 }}
              />
            </TouchableOpacity>
          ),

          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "home" : "home-outline"}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="report"
        options={{
          title: "Reporte",
          headerTitle: () => (
            <TouchableOpacity onPress={() => home_screen()}>
              <Image
                source={require("../../assets/screens/Pandora.png")}
                style={{ width: 200, height: 30 }}
              />
            </TouchableOpacity>
          ),
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "bar-chart" : "bar-chart-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: "Publicar",
          headerTitle: () => (
            <TouchableOpacity onPress={() => home_screen()}>
              <Image
                source={require("../../assets/screens/Pandora.png")}
                style={{ width: 200, height: 30 }}
              />
            </TouchableOpacity>
          ),
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "logo-instagram" : "logo-instagram"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Buscar",
          headerTitle: () => (
            <TouchableOpacity onPress={() => home_screen()}>
              <Image
                source={require("../../assets/screens/Pandora.png")}
                style={{ width: 200, height: 30 }}
              />
            </TouchableOpacity>
          ),
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "search" : "search-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          headerTitle: () => (
            <TouchableOpacity onPress={() => home_screen()}>
              <Image
                source={require("../../assets/screens/Pandora.png")}
                style={{ width: 200, height: 30 }}
              />
            </TouchableOpacity>
          ),
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "person" : "person-outline"}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const mapStateToProps = (reducers: any) => {
  return {
    firebase_user_uid: reducers.auth.firebase_user_uid,
    tituloProyecto: reducers.auth.tituloProyecto,
    // user_photo: reducers.profile.user_photo,
    // profile: reducers.profile.profile,
  };
};

const TabLayout = connect(mapStateToProps, {
  update_firebasePhoto,
  update_firebaseUserName,
  update_firebaseEmail,
  update_firebaseUid,
  saveActualAITServicesFirebaseGlobalState,
  titulo_proyecto,
})(TabLayoutRaw);

export default TabLayout;
