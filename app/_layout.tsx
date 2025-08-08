import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  legacy_createStore as createStore,
  applyMiddleware,
  compose,
} from "redux";
import { thunk } from "redux-thunk";
import { rootReducers } from "../redux/reducers";
import { Provider } from "react-redux";
import Toast from "react-native-toast-message";
import { StyleSheet, View, Platform, Text } from "react-native";
import { usePushNotifications } from "@/usePushNotifications";
import React, { useState, Suspense, lazy } from "react";
import { update_firebaseUserUid } from "../redux/actions/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Tabs, Redirect } from "expo-router";
import "@/firebaseConfig";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
const middleware = [thunk];
const composedEnhancers = compose(applyMiddleware(...middleware));
const store = createStore(rootReducers, {}, composedEnhancers);
//DarkTheme

export default function RootLayout() {
  // const { expoPushToken, notification } = usePushNotifications();
  // const data = JSON.stringify(notification, undefined, 2);

  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <>
      {/* <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}> */}
      <Provider store={store}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </Provider>
      {Platform.OS != "web" && <Toast />}
      <StatusBar style="auto" />
      {/* </ThemeProvider> */}
    </>
  );
}
