/**
 * Icon component para Web usando react-icons
 * Reemplaza @expo/vector-icons en la web para mejor compatibilidad
 */
import React from "react";
import {
  IoHome,
  IoHomeOutline,
  IoBarChart,
  IoBarChartOutline,
  IoSearch,
  IoSearchOutline,
  IoPerson,
  IoPersonOutline,
  IoLogoInstagram,
  IoChevronBack,
  IoChevronForward,
  IoClose,
  IoAdd,
  IoRemove,
  IoCamera,
  IoCheckmark,
  IoArrowBack,
  IoArrowForward,
} from "react-icons/io5";

import {
  MdInfo,
  MdPeople,
  MdBusiness,
  MdSchedule,
  MdAttachFile,
  MdDescription,
  MdDelete,
  MdEdit,
  MdSave,
  MdCancel,
  MdCheck,
  MdClose,
  MdAdd,
  MdRemove,
  MdSearch,
  MdFilterList,
  MdSort,
  MdMoreVert,
  MdArrowBack,
  MdArrowForward,
  MdEmail,
  MdVisibility,
  MdVisibilityOff,
} from "react-icons/md";

import {
  FiFeather,
  FiEdit,
  FiTrash2,
  FiDownload,
  FiUpload,
  FiFile,
  FiFolder,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
  FiPlus,
  FiMinus,
  FiX,
} from "react-icons/fi";

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
  onPress?: () => void;
  type?: string;
  iconStyle?: any;
}

// Mapeo de nombres de iconos
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  // Ionicons
  home: IoHome,
  "home-outline": IoHomeOutline,
  "bar-chart": IoBarChart,
  "bar-chart-outline": IoBarChartOutline,
  search: IoSearch,
  "search-outline": IoSearchOutline,
  person: IoPerson,
  "person-outline": IoPersonOutline,
  "logo-instagram": IoLogoInstagram,
  "chevron-back": IoChevronBack,
  "chevron-forward": IoChevronForward,
  close: IoClose,
  add: IoAdd,
  remove: IoRemove,
  camera: IoCamera,
  checkmark: IoCheckmark,
  "arrow-back": IoArrowBack,
  "arrow-forward": IoArrowForward,

  // MaterialIcons
  info: MdInfo,
  people: MdPeople,
  business: MdBusiness,
  schedule: MdSchedule,
  "attach-file": MdAttachFile,
  description: MdDescription,
  delete: MdDelete,
  edit: MdEdit,
  save: MdSave,
  cancel: MdCancel,
  check: MdCheck,
  "close-material": MdClose,
  "add-material": MdAdd,
  "remove-material": MdRemove,
  "search-material": MdSearch,
  "filter-list": MdFilterList,
  sort: MdSort,
  "more-vert": MdMoreVert,
  "arrow-back-material": MdArrowBack,
  "arrow-forward-material": MdArrowForward,

  // MaterialCommunityIcons (para @rneui/themed)
  at: MdEmail,
  "eye-outline": MdVisibility,
  "eye-off-outline": MdVisibilityOff,

  // Feather
  feather: FiFeather,
  "edit-feather": FiEdit,
  "trash-2": FiTrash2,
  download: FiDownload,
  upload: FiUpload,
  file: FiFile,
  folder: FiFolder,
  "chevron-left": FiChevronLeft,
  "chevron-right": FiChevronRight,
  "chevron-down": FiChevronDown,
  "chevron-up": FiChevronUp,
  plus: FiPlus,
  minus: FiMinus,
  x: FiX,
};

export const Ionicons: React.FC<IconProps> = ({
  name,
  size = 24,
  color = "#000",
  style,
  onPress,
}) => {
  const IconComponent = ICON_MAP[name] || IoHome;

  return (
    <span
      onClick={onPress}
      style={{
        display: "inline-flex",
        cursor: onPress ? "pointer" : "default",
        ...style,
      }}
    >
      <IconComponent size={size} color={color} />
    </span>
  );
};

export const MaterialIcons: React.FC<IconProps> = ({
  name,
  size = 24,
  color = "#000",
  style,
  onPress,
}) => {
  const IconComponent = ICON_MAP[name] || MdInfo;

  return (
    <span
      onClick={onPress}
      style={{
        display: "inline-flex",
        cursor: onPress ? "pointer" : "default",
        ...style,
      }}
    >
      <IconComponent size={size} color={color} />
    </span>
  );
};

export const Feather: React.FC<IconProps> = ({
  name,
  size = 24,
  color = "#000",
  style,
  onPress,
}) => {
  const IconComponent = ICON_MAP[name] || FiFeather;

  return (
    <span
      onClick={onPress}
      style={{
        display: "inline-flex",
        cursor: onPress ? "pointer" : "default",
        ...style,
      }}
    >
      <IconComponent size={size} color={color} />
    </span>
  );
};

// Icon component compatible con @rneui/themed
export const Icon: React.FC<IconProps> = ({
  type,
  name,
  size = 24,
  color = "#000",
  iconStyle,
  style,
  onPress,
}) => {
  let IconComponent = ICON_MAP[name];

  // Si no se encuentra, intentar buscar por tipo
  if (!IconComponent) {
    if (type === "material-community" || type === "material") {
      IconComponent = MdInfo; // Default material
    } else if (type === "ionicon") {
      IconComponent = IoHome; // Default ionicon
    } else if (type === "feather") {
      IconComponent = FiFeather; // Default feather
    } else {
      IconComponent = IoHome; // Default general
    }
  }

  return (
    <span
      onClick={onPress}
      style={{
        display: "inline-flex",
        cursor: onPress ? "pointer" : "default",
        ...iconStyle,
        ...style,
      }}
    >
      <IconComponent size={size} color={color} />
    </span>
  );
};

export default { Ionicons, MaterialIcons, Feather, Icon };
