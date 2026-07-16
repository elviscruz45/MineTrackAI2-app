import { type ComponentProps } from "react";
import { Platform } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { type IconProps } from "@expo/vector-icons/build/createIconSet";
import { ioniconWebMap, renderWebIcon } from "@/components/icons/webMaps";

export function TabBarIcon({
  style,
  name,
  color,
  size = 28,
  ...rest
}: IconProps<ComponentProps<typeof Ionicons>["name"]>) {
  if (Platform.OS === "web") {
    const web = renderWebIcon(
      ioniconWebMap,
      String(name),
      size,
      (color as string) || "#000",
      [{ marginBottom: -3 }, style]
    );
    if (web) return web;
  }

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
