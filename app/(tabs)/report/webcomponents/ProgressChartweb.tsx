import React, { useEffect, useState } from "react";
import {
  buildGlobalSCurveWithProjection,
  formatAvancePercent,
  getCompletedPlannedHours,
  getPlannedHoursAtTime,
  getTotalPlannedHours,
  isActivityCompleted,
  parseActivityDate,
} from "@/utils/calculateAvance";
import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Button,
  Platform,
  Alert,
  ScrollView,
  StyleSheet,
} from "react-native";

// Create a type for our ZingChart component
type ZingChartType = React.ComponentType<{ data: any }>;

interface ProgressChartProps {
  data?: any[];
}

// Función auxiliar para parsear fechas (Firebase Timestamps y otros formatos)
function parseCustomDate(dateStr: any) {
  return parseActivityDate(dateStr);
}

const ProgressChartWeb: React.FC<ProgressChartProps> = ({ data }) => {
  const [ZingChartComponent, setZingChartComponent] =
    useState<ZingChartType | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Only import ZingChart on the client side
    if (typeof window !== "undefined") {
      const importZingChart = async () => {
        try {
          const zingchartModule = await import("zingchart-react");
          await import("zingchart/es6");
          setZingChartComponent(() => zingchartModule.default);
        } catch (error) {
          console.error("Failed to load ZingChart:", error);
        }
      };

      importZingChart();
    }
  }, []);

  // Función para generar configuración de Curva S Global
  const generateGlobalCurvaSChartConfig = (dataArray: any[]) => {
    if (!dataArray || dataArray.length === 0) {
      return null;
    }

    // 1. COMBINAR TODAS LAS ACTIVIDADES DE TODOS LOS OBJETOS
    let todasLasActividades: any[] = [];
    let fechaInicioGlobal: Date | null = null;
    let fechaFinGlobal: Date | null = null;

    dataArray.forEach((objeto: any) => {
      // Procesar fechas del objeto principal
      const inicioObjeto = parseCustomDate(objeto.FechaInicio);
      const finObjeto = parseCustomDate(objeto.FechaFin);

      if (inicioObjeto) {
        if (!fechaInicioGlobal || inicioObjeto < fechaInicioGlobal) {
          fechaInicioGlobal = inicioObjeto;
        }
      }

      if (finObjeto) {
        if (!fechaFinGlobal || finObjeto > fechaFinGlobal) {
          fechaFinGlobal = finObjeto;
        }
      }

      // Procesar actividades del objeto
      if (objeto.activitiesData) {
        let actividades;

        // Si activitiesData ya es un array/objeto, usarlo directamente
        if (typeof objeto.activitiesData === "object") {
          actividades = Array.isArray(objeto.activitiesData)
            ? objeto.activitiesData
            : [];
        } else {
          // Si es un string, parsearlo como JSON
          try {
            actividades = JSON.parse(objeto.activitiesData || "[]");
          } catch (error) {
            console.error("Error parsing activitiesData:", error);
            actividades = [];
          }
        }

        actividades.forEach((actividad: any) => {
          actividad.objetoPadre = objeto.idServiciosAIT || objeto.id;
          todasLasActividades.push(actividad);

          const inicioAct = parseCustomDate(actividad.FechaInicio);
          const finAct = parseCustomDate(actividad.FechaFin);

          if (inicioAct) {
            if (!fechaInicioGlobal || inicioAct < fechaInicioGlobal) {
              fechaInicioGlobal = inicioAct;
            }
          }

          if (finAct) {
            if (!fechaFinGlobal || finAct > fechaFinGlobal) {
              fechaFinGlobal = finAct;
            }
          }
        });
      }
    });

    if (!fechaInicioGlobal || !fechaFinGlobal) {
      return null;
    }

    // 2. CALCULAR RANGO TEMPORAL GLOBAL
    const totalHorasPlanificadas =
      ((fechaFinGlobal as Date).getTime() -
        (fechaInicioGlobal as Date).getTime()) /
      3600000;

    const {
      planned: axe_y1,
      real: axe_y2,
      projected: axe_y3,
      fechasEjeX,
      horasProyeccionFin,
      realAtNow,
      fechaProyeccionFin,
    } = buildGlobalSCurveWithProjection(
      todasLasActividades,
      fechaInicioGlobal as Date,
      totalHorasPlanificadas
    );

    console.log("=== CURVA S GLOBAL ===");
    console.log("Total objetos procesados:", dataArray.length);
    console.log("Total actividades:", todasLasActividades.length);
    console.log("Fecha inicio global:", fechaInicioGlobal);
    console.log("Fecha fin global:", fechaFinGlobal);
    console.log("Horas planificadas:", totalHorasPlanificadas);
    console.log("Horas proyección fin:", horasProyeccionFin);
    console.log("Fecha proyección fin:", fechaProyeccionFin);
    console.log("Avance real actual:", realAtNow);
    console.log("Peso total actividades:", getTotalPlannedHours(todasLasActividades));

    return {
      type: "line",
      backgroundColor: "white",
      legend: {
        align: "center",
        verticalAlign: "bottom",
        backgroundColor: "transparent",
        borderWidth: 0,
        item: {
          fontColor: "#333",
          fontSize: 12,
          padding: "5px",
        },
        marker: {
          type: "circle",
          size: 8,
        },
      },
      scaleX: {
        label: {
          text: "Fechas",
          fontSize: 12,
          fontColor: "#333",
        },
        labels: fechasEjeX,
        lineColor: "#ccc",
        tick: {
          lineColor: "#ccc",
        },
        item: {
          fontColor: "#333",
          fontSize: 10,
          angle: -45,
          maxChars: 16,
        },
        maxItems: 10,
        itemsOverlap: true,
        guide: {
          visible: true,
          lineColor: "#f0f0f0",
          lineStyle: "solid",
        },
      },
      scaleY: {
        label: {
          text: "Porcentaje (%)",
          fontSize: 12,
          fontColor: "#333",
        },
        values: "0:100:10",
        lineColor: "#ccc",
        tick: {
          lineColor: "#ccc",
        },
        item: {
          fontColor: "#333",
          fontSize: 10,
        },
        guide: {
          lineStyle: "solid",
          lineColor: "#f0f0f0",
        },
      },
      crosshairX: {
        lineColor: "#555",
        plotLabel: {
          padding: "10px",
          backgroundColor: "white",
          borderRadius: "5px",
          fontWeight: "bold",
          fontSize: 12,
          shadow: false,
          borderColor: "#eee",
          borderWidth: "1px",
          headerText: "",
          headerFontColor: "#2A3B76",
          headerFontWeight: "bold",
          headerFontSize: 11,
        },
        scaleLabel: {
          text: "%l",
          backgroundColor: "#2A3B76",
          fontColor: "white",
          borderRadius: "5px",
          padding: "4px 8px",
          fontSize: 11,
        },
      },
      crosshairY: {
        lineColor: "#555",
        plotLabel: {
          padding: "10px",
          backgroundColor: "white",
          borderRadius: "5px",
          fontWeight: "bold",
          fontSize: 12,
          shadow: false,
          borderColor: "#eee",
          borderWidth: "1px",
        },
        scaleLabel: {
          backgroundColor: "#666",
          borderRadius: "5px",
        },
      },
      tooltip: {
        visible: true,
      },
      plot: {
        aspect: "spline",
        tooltip: {
          visible: false,
          text: "%l<br>%t: %v%",
          backgroundColor: "rgba(0,0,0,0.8)",
          fontColor: "white",
          fontSize: 12,
          padding: 8,
          borderRadius: 4,
        },
        marker: {
          visible: true,
          size: 4,
          alpha: 1,
        },
        hoverState: {
          visible: true,
        },
      },
      series: [
        {
          text: "PROGRAMADO",
          values: axe_y1,
          lineColor: "#2196F3",
          lineWidth: 3,
          marker: {
            backgroundColor: "#2196F3",
            borderColor: "#2196F3",
            borderWidth: 2,
            size: 6,
          },
          legendMarker: {
            backgroundColor: "#2196F3",
          },
        },
        {
          text: "REAL",
          values: axe_y2,
          aspect: "line",
          lineColor: "#F44336",
          lineWidth: 3,
          marker: {
            backgroundColor: "#F44336",
            borderColor: "#F44336",
            borderWidth: 2,
            size: 6,
          },
          legendMarker: {
            backgroundColor: "#F44336",
          },
        },
        {
          text: "PROYECTADO",
          values: axe_y3,
          lineColor: "#FF9800",
          lineWidth: 2,
          lineStyle: "dashed",
          marker: {
            visible: false,
          },
          legendMarker: {
            backgroundColor: "#FF9800",
          },
        },
      ],
      plotarea: {
        backgroundColor: "white",
        margin: "60px 60px 80px 80px",
      },
      fechaProyeccionFin,
    };
  };

  // Derive quick KPIs from data
  const allActs = (data || []).flatMap((s: any) =>
    Array.isArray(s.activitiesData) ? s.activitiesData : []
  );
  const total = allActs.length;
  const completed = allActs.filter((a: any) => isActivityCompleted(a)).length;
  const totalHoras = getTotalPlannedHours(allActs);
  const horasCompletadas = getCompletedPlannedHours(allActs);
  const realPct = formatAvancePercent(horasCompletadas, totalHoras);

  const projectStart = allActs.reduce<Date | null>((min, act) => {
    const inicio = parseCustomDate(act.FechaInicio);
    if (!inicio) return min;
    return !min || inicio < min ? inicio : min;
  }, null);

  const horasActuales = projectStart
    ? Math.max(0, (Date.now() - projectStart.getTime()) / 3600000)
    : 0;

  const progPct = projectStart
    ? formatAvancePercent(
        getPlannedHoursAtTime(allActs, projectStart, horasActuales),
        totalHoras
      )
    : 0;
  const totalServices = (data || []).length;

  // Generar configuración del gráfico global
  const globalChartConfig = generateGlobalCurvaSChartConfig(data || []);
  if (!isClient) {
    return (
      <div style={{ width: "100%", height: "400px", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <p style={{ color: "#999", fontSize: 14 }}>Cargando gráfico...</p>
      </div>
    );
  }

  const pKpis = [
    { label: "Servicios Activos", value: `${totalServices}`, icon: "📋", color: "#2A3B76", sub: "En seguimiento" },
    { label: "Actividades Gantt", value: `${total}`, icon: "📅", color: "#1976d2", sub: "Total registradas" },
    { label: "Avance Programado", value: `${progPct}%`, icon: "📈", color: "#00acc1", sub: "Según Gantt" },
    { label: "Avance Real", value: `${realPct}%`, icon: "✅", color: realPct >= progPct ? "#198754" : "#e53935", sub: realPct >= progPct ? "Adelantado ▲" : `Δ ${progPct - realPct}% rezago` },
    { label: "Con Fecha Real", value: `${completed}`, icon: "🔍", color: "#f9a825", sub: `De ${total} actividades` },
  ];

  return (
    <div style={{ background: "#f0f4f8", minHeight: "100%", paddingBottom: 24 }}>
      <style>{`
        .pc-kpi-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; padding: 16px 16px 0; margin-bottom: 16px; }
        @media (min-width: 700px) { .pc-kpi-grid { grid-template-columns: repeat(5, 1fr); } }
      `}</style>

      {/* ── PAGE HEADER ──────────────────────────────────────────────── */}
      <div style={{ background: "linear-gradient(135deg, #2A3B76 0%, #1565c0 100%)", padding: "20px 20px 24px" }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "white" }}>📈 &nbsp;Proyección — Curva S Global</h2>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
          Avance programado vs. real · Todos los proyectos activos · {new Date().toLocaleDateString("es-ES")}
        </p>
      </div>

      {/* ── KPI STRIP ───────────────────────────────────────────────── */}
      <div className="pc-kpi-grid">
        {pKpis.map((k, i) => (
          <div key={i} style={{ background: "white", borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
            <div style={{ background: k.color, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{k.icon}</div>
              <span style={{ color: "white", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, lineHeight: 1.2 }}>{k.label}</span>
            </div>
            <div style={{ padding: "8px 12px" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#1a1a2e" }}>{k.value}</div>
              <div style={{ fontSize: 10, color: "#999", marginTop: 2 }}>{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── CHART CARD ──────────────────────────────────────────────── */}
      <div style={{ padding: "0 16px" }}>
        <div style={{ background: "white", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{ borderBottom: "1px solid #e9ecef", padding: "14px 20px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 4, height: 26, borderRadius: 2, background: "linear-gradient(180deg, #1976d2, #2A3B76)", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e" }}>Curva S Global</div>
              <div style={{ fontSize: 11, color: "#6c757d", marginTop: 1 }}>
                Avance programado vs. real — proyección de fin estimado
                {globalChartConfig?.fechaProyeccionFin
                  ? ` · Fin proyectado: ${globalChartConfig.fechaProyeccionFin.toLocaleDateString("es-ES")}`
                  : ""}
              </div>
            </div>
          </div>
          <div style={{ width: "100%", height: "380px" }}>
          {ZingChartComponent && globalChartConfig ? (
          <ZingChartComponent data={globalChartConfig} />
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "#999",
              fontSize: 14,
            }}
          >
            Cargando gráfico...
          </div>
        )}
          </div>{/* /chart inner */}
        </div>{/* /chart card */}
      </div>{/* /padding */}
    </div>
  );
};

export default ProgressChartWeb;

// Modern styles for enhanced UI/UX
const modernStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 16,
  },
});
