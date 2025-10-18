import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
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
import { Platform } from "react-native";
import React from "react";
import "@/firebaseConfig";
import { LoadingScreen } from "@/components/LoadingScreen/LoadingScreen";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
const middleware = [thunk];
const composedEnhancers = compose(applyMiddleware(...middleware));
const store = createStore(rootReducers, {}, composedEnhancers);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    if (loaded) {
      // Pequeño delay para asegurar que todo está listo
      setTimeout(() => {
        setAppReady(true);
        SplashScreen.hideAsync();
      }, 100);
    }
  }, [loaded]);

  // Mostrar loading screen optimizado mientras carga
  if (!loaded || !appReady) {
    return <LoadingScreen message="Cargando Pandora..." />;
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
      {/* {Platform.OS != "web" && <Toast />} */}
      <Toast />

      <StatusBar style="auto" />
      {/* </ThemeProvider> */}
    </>
  );
}
