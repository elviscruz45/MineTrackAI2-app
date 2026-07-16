import React from "react";
import { Platform } from "react-native";
import { Icon } from "@rneui/themed";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  featherWebMap,
  ioniconWebMap,
  materialWebMap,
  materialCommunityWebMap,
  renderWebIcon,
  resolveStyleColor,
} from "./webMaps";

export type AppIconType =
  | "feather"
  | "ionicon"
  | "material"
  | "material-community";

type AppIconProps = {
  type?: AppIconType;
  name: string;
  size?: number;
  color?: string;
  style?: any;
  iconStyle?: any;
  onPress?: () => void;
};

const WEB_MAPS = {
  feather: featherWebMap,
  ionicon: ioniconWebMap,
  material: materialWebMap,
  "material-community": materialCommunityWebMap,
} as const;

const RNEUI_TYPE = {
  feather: "feather",
  ionicon: "ionicon",
  material: "material",
  "material-community": "material-community",
} as const;

/**
 * Cross-platform icon: SVG via react-icons on web, vector fonts on native.
 */
export function AppIcon({
  type = "feather",
  name,
  size = 24,
  color = "#000",
  style,
  iconStyle,
  onPress,
}: AppIconProps) {
  const mergedStyle = iconStyle ?? style;
  const resolvedColor = resolveStyleColor(mergedStyle, color);

  if (Platform.OS === "web") {
    const web = renderWebIcon(
      WEB_MAPS[type],
      name,
      size,
      resolvedColor,
      mergedStyle,
      onPress
    );
    if (web) return web;
  }

  if (type === "ionicon") {
    return (
      <Ionicons
        name={name as any}
        size={size}
        color={resolvedColor}
        style={mergedStyle}
        onPress={onPress}
      />
    );
  }

  return (
    <Icon
      type={RNEUI_TYPE[type]}
      name={name}
      size={size}
      color={resolvedColor}
      iconStyle={mergedStyle}
      onPress={onPress}
    />
  );
}

/** Drop-in replacements for @expo/vector-icons families */
export function FeatherIcon(props: Omit<AppIconProps, "type">) {
  return <AppIcon type="feather" {...props} />;
}

export function Ionicon(props: Omit<AppIconProps, "type">) {
  return <AppIcon type="ionicon" {...props} />;
}

export function MaterialIcon(props: Omit<AppIconProps, "type">) {
  return <AppIcon type="material" {...props} />;
}

export function MaterialCommunityIcon(props: Omit<AppIconProps, "type">) {
  return <AppIcon type="material-community" {...props} />;
}
