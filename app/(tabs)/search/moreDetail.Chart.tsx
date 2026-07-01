import React, { useMemo } from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { BarChart } from "react-native-gifted-charts";

const BRAND = "#2A3B76";
const MUTED = "#64748b";

const ROLE_LABELS = [
  { key: "Sup", full: "Supervisor", field: "supervisores" },
  { key: "HSE", full: "HSE", field: "HSE" },
  { key: "Lider", full: "Líder", field: "liderTecnico" },
  { key: "Sold", full: "Soldador", field: "soldador" },
  { key: "Tecn", full: "Técnico", field: "tecnico" },
  { key: "Ayud", full: "Ayudante", field: "ayudante" },
] as const;

const BAR_COLORS = [
  "#2A3B76",
  "#1565c0",
  "#00838f",
  "#2e7d32",
  "#f9a825",
  "#6a1b9a",
];

type TareoEntry = Record<string, string | number | undefined>;

function aggregateTareoHours(data: TareoEntry[]) {
  const totals: Record<string, number> = {
    Sup: 0,
    HSE: 0,
    Lider: 0,
    Sold: 0,
    Tecn: 0,
    Ayud: 0,
  };

  for (const entry of data) {
    if (entry.supervisores) totals.Sup += parseInt(String(entry.supervisores), 10) * 12;
    if (entry.HSE) totals.HSE += parseInt(String(entry.HSE), 10) * 12;
    if (entry.liderTecnico) totals.Lider += parseInt(String(entry.liderTecnico), 10) * 12;
    if (entry.soldador) totals.Sold += parseInt(String(entry.soldador), 10) * 12;
    if (entry.tecnico) totals.Tecn += parseInt(String(entry.tecnico), 10) * 12;
    if (entry.ayudante) totals.Ayud += parseInt(String(entry.ayudante), 10) * 12;
  }

  return totals;
}

interface BarChartTareoProps {
  data?: TareoEntry[];
}

const BarChartTareo = ({ data }: BarChartTareoProps) => {
  const { width: screenWidth } = useWindowDimensions();
  const isCompact = screenWidth < 640;

  const totals = useMemo(
    () => (Array.isArray(data) ? aggregateTareoHours(data) : null),
    [data]
  );

  const chartLayout = useMemo(() => {
    const horizontalPadding = isCompact ? 24 : 40;
    const chartWidth = Math.max(260, screenWidth - horizontalPadding);
    const barCount = ROLE_LABELS.length;
    const barWidth = isCompact ? 28 : Math.min(52, Math.floor((chartWidth - 48) / (barCount * 1.6)));
    const spacing = isCompact ? 12 : 20;

    return { chartWidth, barWidth, spacing };
  }, [screenWidth, isCompact]);

  const barData = useMemo(() => {
    if (!totals) return [];

    return ROLE_LABELS.map((role, index) => ({
      value: totals[role.key] ?? 0,
      label: role.key,
      frontColor: BAR_COLORS[index],
      topLabelComponent: () => (
        <Text style={styles.barTopLabel}>{totals[role.key] ?? 0}</Text>
      ),
    }));
  }, [totals]);

  const maxValue = useMemo(() => {
    const peak = Math.max(...barData.map((item) => item.value), 0);
    if (peak <= 0) return 10;
    return Math.ceil(peak * 1.15);
  }, [barData]);

  const hasData = barData.some((item) => item.value > 0);

  if (!data?.length) {
    return <Text style={styles.emptyText}>No hay datos para mostrar gráfica</Text>;
  }

  if (!hasData) {
    return <Text style={styles.emptyText}>Sin horas registradas en tareo</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Horas acumuladas por rol (tareo × 12 h)</Text>

      <View style={styles.chartWrap}>
        <BarChart
          data={barData}
          width={chartLayout.chartWidth}
          height={isCompact ? 200 : 240}
          barWidth={chartLayout.barWidth}
          spacing={chartLayout.spacing}
          initialSpacing={isCompact ? 8 : 16}
          endSpacing={isCompact ? 8 : 16}
          maxValue={maxValue}
          noOfSections={4}
          yAxisTextStyle={styles.axisText}
          xAxisLabelTextStyle={styles.axisText}
          rulesColor="#e2e8f0"
          yAxisColor="#e2e8f0"
          xAxisColor="#e2e8f0"
          isAnimated
          animationDuration={500}
          disableScroll={!isCompact}
          scrollToEnd
          showScrollIndicator={isCompact}
        />
      </View>

      <View style={styles.legendGrid}>
        {ROLE_LABELS.map((role, index) => (
          <View key={role.key} style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: BAR_COLORS[index] }]}
            />
            <Text style={styles.legendLabel} numberOfLines={1}>
              {role.full}:{" "}
              <Text style={styles.legendValue}>{totals?.[role.key] ?? 0} h</Text>
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  subtitle: {
    fontSize: 12,
    color: MUTED,
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 18,
  },
  chartWrap: {
    width: "100%",
    alignItems: "center",
    overflow: "hidden",
  },
  axisText: {
    color: MUTED,
    fontSize: 11,
  },
  barTopLabel: {
    fontSize: 10,
    color: BRAND,
    fontWeight: "700",
    marginBottom: 4,
  },
  legendGrid: {
    width: "100%",
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minWidth: "42%",
    maxWidth: "48%",
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 12,
    color: "#334155",
    flexShrink: 1,
  },
  legendValue: {
    fontWeight: "700",
    color: BRAND,
  },
  emptyText: {
    textAlign: "center",
    color: MUTED,
    fontStyle: "italic",
    paddingVertical: 24,
  },
});

export default BarChartTareo;
