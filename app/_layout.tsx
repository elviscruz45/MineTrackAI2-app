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
import * as Network from "expo-network";
import { processSyncQueue } from "@/services/sync-queue";
// import Toast from "react-native-toast-message";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
const middleware = [thunk];
const composedEnhancers = compose(applyMiddleware(...middleware));
const store = createStore(rootReducers, {}, composedEnhancers);

export default function RootLayout() {
  const _colorScheme = useColorScheme();
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

  // Auto-sync: Procesar cola de MineTrackAI cuando hay conexión
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    const checkAndProcessQueue = async () => {
      try {
        // Verificar conectividad
        let isConnected = false;

        if (Platform.OS === "web") {
          isConnected = navigator.onLine;
        } else {
          const networkState = await Network.getNetworkStateAsync();
          isConnected = !!(
            networkState.isConnected && networkState.isInternetReachable
          );
        }

        if (isConnected) {
          // Procesar cola si hay conexión
          const result = await processSyncQueue();

          if (result.processed > 0) {
            Toast.show({
              type: "success",
              text1: "Sincronización Completa",
              text2: `${result.processed} eventos sincronizados con MineTrackAI`,
              position: "top",
              visibilityTime: 3000,
            });
          }
        }
      } catch (error) {
        console.error("Error processing MineTrackAI sync queue:", error);
      }
    };

    // Procesar inmediatamente al cargar
    if (appReady) {
      checkAndProcessQueue();

      // Verificar cada 2 minutos
      intervalId = setInterval(checkAndProcessQueue, 120000);
    }

    // Listener para web cuando se reconecta
    if (Platform.OS === "web") {
      const handleOnline = () => {
        console.log("🌐 Network reconnected - processing MineTrackAI queue...");
        checkAndProcessQueue();
      };

      window.addEventListener("online", handleOnline);

      return () => {
        window.removeEventListener("online", handleOnline);
        if (intervalId) clearInterval(intervalId);
      };
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [appReady]);

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
