// TabBarIcon para Web usando react-icons
import React from "react";
import { Ionicons } from "./Icon.web";

interface TabBarIconProps {
  name: string;
  color: string;
  size?: number;
  style?: any;
}

export function TabBarIcon({ name, color, size = 28, style }: TabBarIconProps) {
  return (
    <Ionicons
      name={name}
      size={size}
      color={color}
      style={{ marginBottom: -3, ...style }}
    />
  );
}
