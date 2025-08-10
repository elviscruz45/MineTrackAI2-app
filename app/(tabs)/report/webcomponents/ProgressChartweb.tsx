import React, { useEffect, useState } from "react";

// Create a type for our ZingChart component
type ZingChartType = React.ComponentType<{ data: any }>;

interface ProgressChartProps {
  data?: any;
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
  // Mock data based on the image
  const chartConfig = {
    type: "line",
    backgroundColor: "#fff",
    title: {
      text: "Avance: Programado / Real / Proyectado",
      fontSize: 16,
      fontFamily: "Arial",
      fontColor: "#444",
      fontWeight: "normal",
      padding: "10px",
    },
    legend: {
      align: "center",
      verticalAlign: "bottom",
      backgroundColor: "none",
      borderWidth: 0,
      item: {
        fontColor: "#444",
        cursor: "pointer",
      },
      marker: {
        type: "circle",
        cursor: "pointer",
        borderWidth: 0,
        size: 5,
      },
    },
    plotarea: {
      margin: "20% 20px 20% 50px",
      backgroundColor: "transparent",
    },
    scaleX: {
      labels: [
        "07-08-2025\n19:00",
        "08-08-2025\n07:00",
        "08-08-2025\n19:00",
        "09-08-2025\n07:00",
      ],
      item: {
        fontColor: "#555",
        fontSize: 10,
      },
      lineColor: "#ccc",
      tickColor: "#ccc",
      guide: {
        visible: true,
        lineStyle: "dashed",
        lineColor: "#ccc",
      },
    },
    scaleY: {
      values: "0:100:10",
      item: {
        fontColor: "#555",
        fontSize: 10,
      },
      lineColor: "#ccc",
      tickColor: "#ccc",
      guide: {
        visible: true,
        lineStyle: "dashed",
        lineColor: "#ccc",
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
    tooltip: {
      visible: true,
    },
    plot: {
      aspect: "spline",
      tooltip: {
        visible: true,
        text: "%t: %v%",
        backgroundColor: "white",
        borderColor: "#ccc",
        borderRadius: "5px",
        fontColor: "#333",
        fontSize: 12,
        shadow: false,
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
        values: [0, 2, 4, 8, 15, 22, 30, 40, 55, 70, 80, 88, 93, 96, 98, 100],
        lineColor: "#3498db",
        lineWidth: 2,
        marker: {
          backgroundColor: "#3498db",
          borderColor: "#3498db",
          size: 5,
        },
      },
      {
        text: "REAL",
        values: [
          0,
          1,
          3,
          6,
          12,
          13,
          14,
          14,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
        ],
        lineColor: "#e74c3c",
        lineWidth: 2,
        marker: {
          backgroundColor: "#e74c3c",
          borderColor: "#e74c3c",
          size: 5,
        },
      },
      {
        text: "PROYECTADO",
        values: [
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          14,
          35,
          60,
          75,
          85,
          90,
          95,
          98,
          100,
        ],
        lineColor: "#f39c12",
        lineWidth: 2,
        lineStyle: "dashed",
        marker: {
          backgroundColor: "#f39c12",
          borderColor: "#f39c12",
          size: 5,
        },
      },
    ],
  };

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
      {ZingChartComponent ? (
        <ZingChartComponent data={chartConfig} />
      ) : (
        <div>Loading chart data...</div>
      )}
    </div>
  );
};

export default ProgressChartWeb;
//
