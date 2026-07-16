import React, { useMemo } from "react";
import {
  Text,
  View,
  ScrollView,
  StatusBar,
  Platform,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image as ImageExpo } from "expo-image";
import { Linking } from "react-native";
import { ConnectedLoginForm } from "@/components/LoginForm";
import { FeatherIcon } from "@/components/FeatherIcon";
import createAuthStyles, { COLORS } from "./index.styles";

const FEATURES = [
  {
    icon: "tool" as const,
    label: "Planificación y ejecución de mantenimiento",
  },
  {
    icon: "activity" as const,
    label: "Disponibilidad y confiabilidad de planta",
  },
  {
    icon: "file-text" as const,
    label: "Eventos de campo y reportes centralizados",
  },
];

export default function AuthScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const styles = useMemo(() => createAuthStyles(isWide), [isWide]);

  const goToRegister = () => {
    Linking.openURL("https://www.teseosoftwarecompany.com/");
  };

  const brandBlock = (
    <>
      <View style={styles.brandRow}>
        <View style={styles.brandMark}>
          <ImageExpo
            source={require("../assets/login/logoPandora_1024.jpg")}
            style={styles.brandMarkImage}
            cachePolicy="memory-disk"
            contentFit="cover"
            transition={200}
          />
        </View>
        <View style={styles.brandWordmark}>
          <View style={styles.brandTitleRow}>
            <Text style={styles.brandTitle}>Mine</Text>
            <Text style={styles.brandTitleAccent}>Track</Text>
          </View>
          <View style={styles.brandAiRow}>
            <View style={styles.brandAiLine} />
            <Text style={styles.brandAi}>AI</Text>
            <View style={styles.brandAiLine} />
          </View>
        </View>
      </View>

      <Text style={styles.headline}>
        Optimización de mantenimiento en plantas mineras
      </Text>

      <View style={styles.featureList}>
        {FEATURES.map((item) => (
          <View key={item.label} style={styles.featureItem}>
            <View style={styles.featureIconBox}>
              <FeatherIcon name={item.icon} size={20} color={COLORS.accent} />
            </View>
            <Text style={styles.featureText}>{item.label}</Text>
          </View>
        ))}
      </View>
    </>
  );

  const loginCard = (
    <View style={styles.loginCard}>
      <Text style={styles.loginTitle}>Iniciar sesión</Text>
      <Text style={styles.loginSubtitle}>
        Accede a tu panel de mantenimiento
      </Text>

      <View style={styles.formWrap}>
        <ConnectedLoginForm />
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.secureText}>Conexión segura · MineTrack AI</Text>
        <View style={styles.salesRow}>
          <Text style={styles.salesText}>¿Nuevo cliente? </Text>
          <Pressable onPress={goToRegister}>
            <Text style={styles.salesLink}>Contactar ventas</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primary}
        translucent={Platform.OS === "ios"}
      />

      {isWide ? (
        <View style={styles.split}>
          <LinearGradient
            colors={[COLORS.primaryMid, COLORS.primary, COLORS.primaryDeep]}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={styles.leftPanel}
          >
            {brandBlock}
          </LinearGradient>

          <View style={styles.rightPanel}>{loginCard}</View>
        </View>
      ) : (
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <LinearGradient
            colors={[COLORS.primaryMid, COLORS.primary, COLORS.primaryDeep]}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={styles.leftPanel}
          >
            {brandBlock}
          </LinearGradient>

          <View style={styles.rightPanel}>{loginCard}</View>
        </ScrollView>
      )}
    </View>
  );
}
