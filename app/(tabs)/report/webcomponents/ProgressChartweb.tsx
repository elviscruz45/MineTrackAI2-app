import React, { useEffect, useState } from "react";
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
  if (!dateStr) return null;

  // Si es un Timestamp de Firebase
  if (typeof dateStr === "object" && dateStr.seconds) {
    return new Date(dateStr.seconds * 1000);
  }

  // Si es un número (timestamp en ms)
  if (typeof dateStr === "number") {
    if (dateStr > 1000000000000) return new Date(dateStr);
    return null;
  }

  // Forzar a string y usar Date.parse como fallback
  const fallback = new Date(String(dateStr));
  return isNaN(fallback.getTime()) ? null : fallback;
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
    let maxHorasReal = 0;

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
          // Agregar referencia al objeto padre
          actividad.objetoPadre = objeto.idServiciosAIT || objeto.id;
          todasLasActividades.push(actividad);

          // Revisar fechas reales para extender el eje X
          if (actividad.RealFechaFin && fechaInicioGlobal) {
            const finReal = new Date(actividad.RealFechaFin);
            const horasDesdeInicio =
              (finReal.getTime() - fechaInicioGlobal.getTime()) / 3600000;
            if (horasDesdeInicio > maxHorasReal) {
              maxHorasReal = horasDesdeInicio;
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

    // Extender eje X si hay fechas reales mayores
    const maxHorasEjeX = Math.max(totalHorasPlanificadas, maxHorasReal);

    const steps = 15;

    // 3. GENERAR EJE X DINÁMICO
    const fechasEjeX = Array.from({ length: steps + 1 }, (_, index) => {
      const horas = Math.round((maxHorasEjeX * index) / steps);
      const fecha = new Date(
        (fechaInicioGlobal as Date).getTime() + horas * 3600000
      );
      return (
        fecha.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        }) + "\n08:00"
      );
    });

    const axe_x_values = Array.from({ length: steps + 1 }, (_, index) => {
      return Math.round((maxHorasEjeX * index) / steps);
    });

    // 4. CURVA S PLANIFICADA GLOBAL (alcanza 100% en totalHorasPlanificadas)
    const axe_y1_base = [
      0, 2, 4, 8, 15, 22, 30, 40, 55, 70, 80, 88, 93, 96, 98, 100,
    ];

    const axe_y1 = axe_x_values.map((hora) => {
      if (hora <= totalHorasPlanificadas) {
        const porcentajeTiempo = hora / totalHorasPlanificadas;
        const indiceBase = porcentajeTiempo * (axe_y1_base.length - 1);
        const indiceInferior = Math.floor(indiceBase);
        const indiceSuperior = Math.ceil(indiceBase);

        if (indiceInferior === indiceSuperior) {
          return axe_y1_base[indiceInferior];
        }

        const factor = indiceBase - indiceInferior;
        return Math.round(
          axe_y1_base[indiceInferior] +
            (axe_y1_base[indiceSuperior] - axe_y1_base[indiceInferior]) * factor
        );
      } else {
        return 100; // Mantener 100% después del plan
      }
    });

    // 5. CALCULAR PESO TOTAL DE TODAS LAS ACTIVIDADES
    const pesoTotalActividades = todasLasActividades.reduce(
      (acc: number, actividad: any) => {
        const inicio = parseCustomDate(actividad.FechaInicio);
        const fin = parseCustomDate(actividad.FechaFin);
        if (inicio && fin) {
          const horas = (fin.getTime() - inicio.getTime()) / 3600000;
          return acc + horas;
        }
        return acc;
      },
      0
    );

    // 6. CURVA REAL GLOBAL (ponderada por duración)
    const axe_y2 = axe_x_values.map((hour) => {
      if (pesoTotalActividades === 0) return null;

      let horasCompletadas = 0;
      let hayDatosReales = false;

      todasLasActividades.forEach((actividad: any) => {
        if (
          !actividad.RealFechaFin ||
          !actividad.FechaInicio ||
          !actividad.FechaFin
        ) {
          return;
        }

        const finReal = new Date(actividad.RealFechaFin);
        const horasDesdeInicio =
          (finReal.getTime() - (fechaInicioGlobal as Date).getTime()) / 3600000;

        if (horasDesdeInicio <= hour) {
          const inicio = parseCustomDate(actividad.FechaInicio);
          const fin = parseCustomDate(actividad.FechaFin);
          if (inicio && fin) {
            const horas = (fin.getTime() - inicio.getTime()) / 3600000;
            horasCompletadas += horas;
            hayDatosReales = true;
          }
        }
      });

      if (!hayDatosReales || horasCompletadas === 0) {
        return null;
      }

      return Math.min(
        100,
        Math.round((horasCompletadas / pesoTotalActividades) * 100)
      );
    });

    // 7. CURVA PROYECTADA GLOBAL
    let ultimoIndiceReal = -1;
    let ultimoValorReal = 0;
    for (let i = axe_y2.length - 1; i >= 0; i--) {
      if (axe_y2[i] !== null && axe_y2[i]! > 0) {
        ultimoIndiceReal = i;
        ultimoValorReal = axe_y2[i]!;
        break;
      }
    }

    const axe_y3 = axe_x_values.map((hora, index) => {
      if (index <= ultimoIndiceReal) {
        return null;
      }

      const horasRestantes =
        axe_x_values[axe_x_values.length - 1] -
        (ultimoIndiceReal >= 0 ? axe_x_values[ultimoIndiceReal] : 0);
      const porcentajeRestante = 100 - ultimoValorReal;

      if (horasRestantes <= 0) return 100;

      const horasDesdeUltimo =
        hora - (ultimoIndiceReal >= 0 ? axe_x_values[ultimoIndiceReal] : 0);
      const incremento =
        (porcentajeRestante * horasDesdeUltimo) / horasRestantes;

      return Math.min(100, Math.round(ultimoValorReal + incremento));
    });

    console.log("=== CURVA S GLOBAL ===");
    console.log("Total objetos procesados:", dataArray.length);
    console.log("Total actividades:", todasLasActividades.length);
    console.log("Total actividades:", todasLasActividades);

    console.log("Fecha inicio global:", fechaInicioGlobal);
    console.log("Fecha fin global:", fechaFinGlobal);
    console.log("Horas planificadas:", totalHorasPlanificadas);
    console.log("Peso total actividades:", pesoTotalActividades);

    return {
      type: "line",
      backgroundColor: "white",
      title: {
        text: "CURVA S GLOBAL - TODOS LOS PROYECTOS",
        fontSize: 18,
        fontColor: "#333",
        fontWeight: "bold",
        marginBottom: 20,
      },
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
        },
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
        },
        scaleLabel: {
          backgroundColor: "#666",
          borderRadius: "5px",
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
          visible: true,
          format: "%t: %v%",
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
        // {
        //   text: "PROYECTADO",
        //   values: axe_y3,
        //   lineColor: "#FF9800",
        //   lineWidth: 3,
        //   lineStyle: "dashed",
        //   marker: {
        //     backgroundColor: "#FF9800",
        //     borderColor: "#FF9800",
        //     borderWidth: 2,
        //     size: 6,
        //   },
        //   legendMarker: {
        //     backgroundColor: "#FF9800",
        //   },
        // },
      ],
      plotarea: {
        backgroundColor: "white",
        margin: "60px 60px 80px 80px",
      },
    };
  };

  // Generar configuración del gráfico global
  const globalChartConfig = generateGlobalCurvaSChartConfig(data || []);
  if (!isClient) {
    return (
      <div
        style={{
          width: "100%",
          height: "400px",
          marginTop: "15px",
          marginBottom: "15px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p>Loading chart...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "400px",
        marginTop: "15px",
        marginBottom: "15px",
      }}
    >
      <Text style={modernStyles.chartTitle}>CURVA S GLOBAL</Text>

      {ZingChartComponent && globalChartConfig ? (
        <ZingChartComponent data={globalChartConfig} />
      ) : (
        <div>Loading chart data...</div>
      )}
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
