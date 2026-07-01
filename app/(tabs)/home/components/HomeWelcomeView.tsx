import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Image as ImageExpo } from "expo-image";
import { useRouter } from "expo-router";
import { BRAND } from "../homeWebStyles";

type HomeWelcomeViewProps = {
  windowWidth: number;
  userName: string;
  userPhoto?: string;
  onSelectProject: () => void;
  onCreateProject: () => void;
};

const OBJECTIVES = [
  {
    icon: "📈",
    title: "Disponibilidad de planta",
    description:
      "Monitorea y eleva el uptime acumulado por área, equipo y período operativo.",
    color: "#198754",
    bg: "#ecfdf5",
  },
  {
    icon: "⚙️",
    title: "Confiabilidad de equipos",
    description:
      "Historial unificado de paradas, mantenimiento preventivo y correctivo por tag.",
    color: "#1565c0",
    bg: "#eff6ff",
  },
  {
    icon: "🛡️",
    title: "Seguridad y cumplimiento",
    description:
      "Registra eventos HSE, aprobaciones y trazabilidad de intervenciones en campo.",
    color: "#b45309",
    bg: "#fffbeb",
  },
  {
    icon: "📋",
    title: "Paradas de planta",
    description:
      "Planifica, ejecuta y reporta paradas con avance real vs programado y ruta crítica.",
    color: BRAND,
    bg: "#eef2ff",
  },
];

const CAPABILITIES = [
  {
    step: "01",
    title: "Catálogo de equipos",
    text: "Explora chancado, molienda, flotación y más. Cada tag concentra su historial operativo.",
    action: "Explorar equipos",
    route: "/search" as const,
  },
  {
    step: "02",
    title: "Proyecto activo",
    text: "Selecciona una parada o proyecto para ver eventos, AITs, avance y reportes en tiempo real.",
    action: "Seleccionar proyecto",
    cta: "select" as const,
  },
  {
    step: "03",
    title: "Carga de planificación",
    text: "Importa el CSV del Gantt para habilitar proyección, actividades y dashboards gerenciales.",
    action: "Crear proyecto",
    cta: "create" as const,
  },
];

export default function HomeWelcomeView({
  windowWidth,
  userName,
  userPhoto,
  onSelectProject,
  onCreateProject,
}: HomeWelcomeViewProps) {
  const router = useRouter();
  const isWide = windowWidth >= 900;
  const isCompact = windowWidth < 640;

  const greeting = userName ? `Hola, ${userName}` : "Bienvenido";

  const handleCapability = (cap: (typeof CAPABILITIES)[number]) => {
    if (cap.route) {
      router.push(cap.route);
      return;
    }
    if (cap.cta === "select") onSelectProject();
    if (cap.cta === "create") onCreateProject();
  };

  return (
    <View style={{ width: "100%", maxWidth: 1100, alignSelf: "center" }}>
      {/* Hero */}
      <div
        style={{
          background: `linear-gradient(135deg, ${BRAND} 0%, #1565c0 55%, #0d47a1 100%)`,
          borderRadius: isCompact ? 16 : 20,
          padding: isCompact ? "28px 22px" : isWide ? "40px 44px" : "32px 28px",
          marginBottom: isCompact ? 20 : 28,
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 12px 40px rgba(42, 59, 118, 0.22)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -40,
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -30,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: isWide ? "row" : "column",
            alignItems: isWide ? "center" : "flex-start",
            gap: isWide ? 32 : 20,
            position: "relative",
            zIndex: 1,
          }}
        >
          {userPhoto ? (
            <ImageExpo
              source={{ uri: userPhoto }}
              style={{
                width: isCompact ? 64 : 80,
                height: isCompact ? 64 : 80,
                borderRadius: isCompact ? 32 : 40,
                borderWidth: 3,
                borderColor: "rgba(255,255,255,0.35)",
              }}
            />
          ) : (
            <div
              style={{
                width: isCompact ? 64 : 80,
                height: isCompact ? 64 : 80,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                flexShrink: 0,
              }}
            >
              ⛏️
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.7)",
                marginBottom: 8,
              }}
            >
              MineTrack AI
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: isCompact ? 26 : isWide ? 36 : 30,
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: -0.5,
                lineHeight: 1.15,
              }}
            >
              {greeting}
            </h1>
            <p
              style={{
                margin: "12px 0 0",
                fontSize: isCompact ? 14 : 16,
                lineHeight: 1.6,
                color: "rgba(255,255,255,0.88)",
                maxWidth: 620,
              }}
            >
              Plataforma integral para supervisión de mantenimiento, eventos de
              campo y gestión de paradas en planta concentradora. Conecta
              equipos, equipos de trabajo y decisiones gerenciales en un solo
              lugar.
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: isCompact ? "column" : "row",
                gap: 10,
                marginTop: 24,
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={onSelectProject}
                style={{
                  border: "none",
                  borderRadius: 10,
                  padding: "12px 20px",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  background: "#ffffff",
                  color: BRAND,
                  boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
                }}
              >
                Seleccionar proyecto
              </button>
              <button
                type="button"
                onClick={onCreateProject}
                style={{
                  border: "1px solid rgba(255,255,255,0.45)",
                  borderRadius: 10,
                  padding: "12px 20px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  background: "rgba(255,255,255,0.12)",
                  color: "#ffffff",
                }}
              >
                Crear proyecto
              </button>
              <button
                type="button"
                onClick={() => router.push("/search")}
                style={{
                  border: "1px solid rgba(255,255,255,0.25)",
                  borderRadius: 10,
                  padding: "12px 20px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  background: "transparent",
                  color: "rgba(255,255,255,0.92)",
                }}
              >
                Ver equipos →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Objetivos */}
      <View style={{ marginBottom: isCompact ? 20 : 28 }}>
        <Text
          style={{
            fontSize: isCompact ? 18 : 22,
            fontWeight: "800",
            color: "#1e293b",
            marginBottom: 6,
          }}
        >
          Objetivos de la plataforma
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#64748b",
            lineHeight: 21,
            marginBottom: 16,
            maxWidth: 680,
          }}
        >
          Diseñada para gerentes de mantenimiento, supervisores de planta y
          planificadores que buscan aumentar la disponibilidad, reducir paradas
          no planificadas y tomar decisiones con datos en tiempo real.
        </Text>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isWide
              ? "repeat(2, 1fr)"
              : "1fr",
            gap: 14,
          }}
        >
          {OBJECTIVES.map((obj) => (
            <div
              key={obj.title}
              style={{
                background: "#ffffff",
                borderRadius: 14,
                padding: "18px 20px",
                border: "1px solid #e2e8f0",
                display: "flex",
                gap: 14,
                alignItems: "flex-start",
                transition: "box-shadow 0.2s ease, transform 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 8px 24px rgba(42,59,118,0.08)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "none";
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: obj.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                {obj.icon}
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: obj.color,
                    marginBottom: 4,
                  }}
                >
                  {obj.title}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "#64748b",
                    lineHeight: 1.5,
                  }}
                >
                  {obj.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </View>

      {/* Cómo empezar */}
      <View style={{ marginBottom: 8 }}>
        <Text
          style={{
            fontSize: isCompact ? 18 : 22,
            fontWeight: "800",
            color: "#1e293b",
            marginBottom: 16,
          }}
        >
          Cómo empezar
        </Text>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isWide ? "repeat(3, 1fr)" : "1fr",
            gap: 14,
          }}
        >
          {CAPABILITIES.map((cap) => (
            <div
              key={cap.step}
              style={{
                background: "#ffffff",
                borderRadius: 14,
                padding: "22px 20px",
                border: "1px solid #e2e8f0",
                display: "flex",
                flexDirection: "column",
                minHeight: 200,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: BRAND,
                  letterSpacing: 1,
                  marginBottom: 10,
                }}
              >
                PASO {cap.step}
              </div>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#1e293b",
                  marginBottom: 8,
                }}
              >
                {cap.title}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "#64748b",
                  lineHeight: 1.55,
                  flex: 1,
                  marginBottom: 16,
                }}
              >
                {cap.text}
              </div>
              <button
                type="button"
                onClick={() => handleCapability(cap)}
                style={{
                  alignSelf: "flex-start",
                  border: "none",
                  borderRadius: 8,
                  padding: "9px 14px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  background: "#f1f5f9",
                  color: BRAND,
                }}
              >
                {cap.action} →
              </button>
            </div>
          ))}
        </div>
      </View>

      {/* Footer informativo */}
      <div
        style={{
          marginTop: 20,
          padding: "16px 20px",
          borderRadius: 12,
          background: "#f8fafc",
          border: "1px dashed #cbd5e1",
          display: "flex",
          flexDirection: isCompact ? "column" : "row",
          alignItems: isCompact ? "flex-start" : "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>
          <strong style={{ color: BRAND }}>Tip:</strong> Sin proyecto activo
          puedes explorar equipos en <strong>Buscar</strong>, revisar
          disponibilidad en <strong>Reportes</strong> y registrar mantenimiento
          en <strong>Operaciones</strong>.
        </div>
        <TouchableOpacity onPress={onSelectProject} activeOpacity={0.8}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: BRAND,
            }}
          >
            Ir a selección de proyecto →
          </Text>
        </TouchableOpacity>
      </div>
    </View>
  );
}
