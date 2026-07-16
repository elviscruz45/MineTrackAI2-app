/**
 * Web SVG icon maps (react-icons) for families used across MineTrack.
 * Font-based @expo/vector-icons often render as "bars" on web when fonts fail to load.
 */
import React from "react";
import { Platform } from "react-native";

type IconComponent = React.ComponentType<{ size?: number; color?: string; style?: any }>;

function buildFeatherMap(): Record<string, IconComponent> {
  const {
    FiActivity,
    FiAlertTriangle,
    FiBriefcase,
    FiCalendar,
    FiCheckCircle,
    FiChevronRight,
    FiClipboard,
    FiClock,
    FiEdit2,
    FiFileText,
    FiMessageCircle,
    FiPaperclip,
    FiSearch,
    FiSend,
    FiSettings,
    FiShield,
    FiTool,
    FiTrendingDown,
    FiTrendingUp,
    FiUser,
    FiUsers,
    FiX,
  } = require("react-icons/fi");

  return {
    activity: FiActivity,
    "alert-triangle": FiAlertTriangle,
    briefcase: FiBriefcase,
    calendar: FiCalendar,
    "check-circle": FiCheckCircle,
    "chevron-right": FiChevronRight,
    clipboard: FiClipboard,
    clock: FiClock,
    "edit-2": FiEdit2,
    "file-text": FiFileText,
    "message-circle": FiMessageCircle,
    paperclip: FiPaperclip,
    search: FiSearch,
    send: FiSend,
    settings: FiSettings,
    shield: FiShield,
    tool: FiTool,
    "trending-down": FiTrendingDown,
    "trending-up": FiTrendingUp,
    user: FiUser,
    users: FiUsers,
    x: FiX,
  };
}

function buildIoniconMap(): Record<string, IconComponent> {
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
    IoPeople,
    IoPeopleOutline,
    IoShield,
    IoFlash,
    IoConstruct,
    IoBriefcase,
    IoHandLeft,
    IoCreateOutline,
    IoCalendarOutline,
    IoCameraReverseSharp,
    IoPencil,
    IoChevronForward,
    IoStar,
    IoFlame,
    IoBulb,
    IoFlower,
    IoSparkles,
    IoBarcodeOutline,
    IoCashOutline,
  } = require("react-icons/io5");
  const { MdBuild } = require("react-icons/md");

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
    people: IoPeople,
    "people-outline": IoPeopleOutline,
    shield: IoShield,
    flash: IoFlash,
    construct: IoConstruct,
    build: MdBuild,
    briefcase: IoBriefcase,
    "hand-left": IoHandLeft,
    "create-outline": IoCreateOutline,
    "calendar-outline": IoCalendarOutline,
    "camera-reverse-sharp": IoCameraReverseSharp,
    pencil: IoPencil,
    "chevron-forward": IoChevronForward,
    star: IoStar,
    flame: IoFlame,
    bulb: IoBulb,
    flower: IoFlower,
    sparkles: IoSparkles,
    "barcode-outline": IoBarcodeOutline,
    "cash-outline": IoCashOutline,
  };
}

function buildMaterialMap(): Record<string, IconComponent> {
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
    MdAttachFile,
    MdVisibility,
    MdClose,
    MdUploadFile,
    MdDeleteOutline,
    MdCategory,
    MdPayments,
    MdEngineering,
    MdSave,
    MdUnarchive,
    MdCloudDone,
    MdCloudOff,
    MdCloudUpload,
    MdSync,
    MdEdit,
    MdModeEdit,
  } = require("react-icons/md");

  return {
    "filter-list": MdFilterList,
    calendar: MdCalendarToday,
    tool: MdBuild,
    clock: MdSchedule,
    "trending-up": MdTrendingUp,
    "trending-down": MdTrendingUp,
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
    "attach-file": MdAttachFile,
    visibility: MdVisibility,
    close: MdClose,
    "upload-file": MdUploadFile,
    "delete-outline": MdDeleteOutline,
    category: MdCategory,
    payments: MdPayments,
    engineering: MdEngineering,
    save: MdSave,
    unarchive: MdUnarchive,
    "cloud-done": MdCloudDone,
    "cloud-done-outline": MdCloudDone,
    "cloud-off": MdCloudOff,
    "cloud-off-outline": MdCloudOff,
    "cloud-upload": MdCloudUpload,
    "cloud-upload-outline": MdCloudUpload,
    sync: MdSync,
    edit: MdEdit,
    "mode-edit": MdModeEdit,
  };
}

function buildMaterialCommunityMap(): Record<string, IconComponent> {
  const {
    MdAlternateEmail,
    MdVisibility,
    MdVisibilityOff,
    MdAttachFile,
    MdAccountCircle,
    MdArrowCircleRight,
  } = require("react-icons/md");

  return {
    at: MdAlternateEmail,
    "eye-outline": MdVisibility,
    "eye-off-outline": MdVisibilityOff,
    paperclip: MdAttachFile,
    "account-circle-outline": MdAccountCircle,
    "arrow-right-circle-outline": MdArrowCircleRight,
  };
}

export const featherWebMap: Record<string, IconComponent> =
  Platform.OS === "web" ? buildFeatherMap() : {};

export const ioniconWebMap: Record<string, IconComponent> =
  Platform.OS === "web" ? buildIoniconMap() : {};

export const materialWebMap: Record<string, IconComponent> =
  Platform.OS === "web" ? buildMaterialMap() : {};

export const materialCommunityWebMap: Record<string, IconComponent> =
  Platform.OS === "web" ? buildMaterialCommunityMap() : {};

export function flattenWebStyle(style: any): Record<string, any> {
  if (!style) return {};
  if (Array.isArray(style)) {
    return style.reduce((acc: Record<string, any>, item) => {
      return { ...acc, ...flattenWebStyle(item) };
    }, {});
  }
  if (typeof style === "object") {
    const { color: _color, ...rest } = style;
    return rest;
  }
  return {};
}

export function resolveStyleColor(style: any, fallback: string): string {
  if (!style) return fallback;
  if (Array.isArray(style)) {
    for (let i = style.length - 1; i >= 0; i -= 1) {
      const found = resolveStyleColor(style[i], "");
      if (found) return found;
    }
    return fallback;
  }
  if (typeof style === "object" && style.color) return String(style.color);
  return fallback;
}

export function renderWebIcon(
  map: Record<string, IconComponent>,
  name: string,
  size: number,
  color: string,
  style?: any,
  onPress?: () => void
) {
  const IconComponent = map[name];
  if (!IconComponent) return null;

  const flatStyle = flattenWebStyle(style);

  return (
    <div
      onClick={onPress}
      style={{
        cursor: onPress ? "pointer" : "default",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 0,
        ...flatStyle,
      }}
    >
      <IconComponent size={size} color={color} />
    </div>
  );
}
