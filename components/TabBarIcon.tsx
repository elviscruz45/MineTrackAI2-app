// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/

import Ionicons from "@expo/vector-icons/Ionicons";
import { type IconProps } from "@expo/vector-icons/build/createIconSet";
import { type ComponentProps } from "react";
import { Platform } from "react-native";

// Mapeo de nombres de Ionicons a react-icons
const iconMap: Record<string, any> = Platform.select({
  web: () => {
    const {
      IoHome,
      IoHomeOutline,
      IoBarChart,
      IoBarChartOutline,
      IoLogoInstagram,
      IoSearch,
      IoSearchOutline,
      IoPerson,
      IoPersonOutline,
    } = require("react-icons/io5");
    return {
      home: IoHome,
      "home-outline": IoHomeOutline,
      "bar-chart": IoBarChart,
      "bar-chart-outline": IoBarChartOutline,
      "logo-instagram": IoLogoInstagram,
      search: IoSearch,
      "search-outline": IoSearchOutline,
      person: IoPerson,
      "person-outline": IoPersonOutline,
    };
  },
  default: () => ({}),
})();

export function TabBarIcon({
  style,
  name,
  color,
  size = 28,
  ...rest
}: IconProps<ComponentProps<typeof Ionicons>["name"]>) {
  // En web, usar react-icons (SVG)
  if (Platform.OS === "web" && iconMap[name]) {
    const Icon = iconMap[name];
    return <Icon size={size} color={color} style={style} />;
  }

  // En nativo, usar Ionicons (fuente)
  return (
    <Ionicons
      name={name}
      size={size}
      color={color}
      style={[{ marginBottom: -3 }, style]}
      {...rest}
    />
  );
}
