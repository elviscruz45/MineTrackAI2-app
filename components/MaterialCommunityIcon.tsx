import React from "react";
import { Platform } from "react-native";
import { Icon } from "@rneui/themed";

interface MaterialCommunityIconProps {
  name: string;
  size?: number;
  color?: string;
  iconStyle?: any;
  onPress?: () => void;
}

// Mapeo de nombres de MaterialCommunityIcons a react-icons
const iconMap: Record<string, any> = Platform.select({
  web: () => {
    const {
      MdAlternateEmail,
      MdVisibility,
      MdVisibilityOff,
    } = require("react-icons/md");
    return {
      at: MdAlternateEmail,
      "eye-outline": MdVisibility,
      "eye-off-outline": MdVisibilityOff,
    };
  },
  default: () => ({}),
})();

export function MaterialCommunityIcon({
  name,
  size = 24,
  color = "#000",
  iconStyle,
  onPress,
}: MaterialCommunityIconProps) {
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
          ...iconStyle,
        }}
      >
        <IconComponent size={size} color={color} />
      </div>
    );
  }

  // En nativo, usar Icon de @rneui/themed
  return (
    <Icon
      type="material-community"
      name={name}
      size={size}
      color={color}
      iconStyle={iconStyle}
      onPress={onPress}
    />
  );
}
