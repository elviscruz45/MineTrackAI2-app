import React from "react";
import { Platform } from "react-native";
import { Icon } from "@rneui/themed";

interface MaterialIconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
  onPress?: () => void;
}

// Mapeo de nombres de Material Icons a react-icons
const iconMap: Record<string, any> = Platform.select({
  web: () => {
    const {
      MdFilterList,
      MdCalendarToday,
      MdBuild,
      MdSchedule,
      MdTrendingUp,
      MdArrowForward,
      MdSettings,
      MdSmartphone,
      MdDescription,
      MdConfirmationNumber,
      MdPlayArrow,
      MdStop,
      MdInfo,
      MdFolder,
      MdHistory,
      MdBusiness,
      MdPeople,
      MdAccessTime,
      MdAssignment,
      MdBarChart,
      MdSupervisorAccount,
    } = require("react-icons/md");
    return {
      "filter-list": MdFilterList,
      calendar: MdCalendarToday,
      tool: MdBuild,
      clock: MdSchedule,
      "trending-up": MdTrendingUp,
      "trending-down": MdTrendingUp, // Puedes agregar un icono diferente si existe
      "arrow-forward": MdArrowForward,
      settings: MdSettings,
      smartphone: MdSmartphone,
      "file-text": MdDescription,
      "confirmation-number": MdConfirmationNumber,
      "play-arrow": MdPlayArrow,
      stop: MdStop,
      info: MdInfo,
      folder: MdFolder,
      description: MdDescription,
      history: MdHistory,
      business: MdBusiness,
      schedule: MdSchedule,
      people: MdPeople,
      "access-time": MdAccessTime,
      assignment: MdAssignment,
      "bar-chart": MdBarChart,
      "supervisor-account": MdSupervisorAccount,
    };
  },
  default: () => ({}),
})();

export function MaterialIcon({
  name,
  size = 24,
  color = "#000",
  style,
  onPress,
}: MaterialIconProps) {
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
      type="material"
      name={name}
      size={size}
      color={color}
      iconStyle={style}
      onPress={onPress}
    />
  );
}
