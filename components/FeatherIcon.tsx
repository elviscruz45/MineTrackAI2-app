import React from "react";
import { Platform } from "react-native";
import { Icon } from "@rneui/themed";

interface FeatherIconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
  onPress?: () => void;
}

// Mapeo de nombres de Feather Icons a react-icons
const iconMap: Record<string, any> = Platform.select({
  web: () => {
    const {
      FiCalendar,
      FiTool,
      FiClock,
      FiTrendingUp,
      FiTrendingDown,
      FiBarChart2,
      FiFileText,
      FiBriefcase,
      FiCheckCircle,
      FiCpu,
      FiX,
    } = require("react-icons/fi");
    return {
      calendar: FiCalendar,
      tool: FiTool,
      clock: FiClock,
      "trending-up": FiTrendingUp,
      "trending-down": FiTrendingDown,
      "bar-chart": FiBarChart2,
      "file-text": FiFileText,
      briefcase: FiBriefcase,
      "check-circle": FiCheckCircle,
      cpu: FiCpu,
      x: FiX,
    };
  },
  default: () => ({}),
})();

export function FeatherIcon({
  name,
  size = 24,
  color = "#000",
  style,
  onPress,
}: FeatherIconProps) {
  // En web, usar react-icons (SVG)
  if (Platform.OS === "web" && iconMap[name]) {
    const IconComponent = iconMap[name];
    return (
      <div
        onClick={onPress}
        style={{
          cursor: onPress ? "pointer" : "default",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          ...style,
        }}
      >
        <IconComponent size={size} color={color} />
      </div>
    );
  }

  // En nativo, usar Icon de @rneui/themed
  return (
    <Icon
      type="feather"
      name={name}
      size={size}
      color={color}
      iconStyle={style}
      onPress={onPress}
    />
  );
}
