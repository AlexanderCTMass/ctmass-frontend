import { Path, Rect } from "react-native-svg";

import { useTheme } from "@/constants/theme";
import { IconBase, type IconProps } from "@/components/icons/icon-base";

export function QrCodeIcon({
  size = 24,
  color: colorProp,
  strokeWidth = 1.8,
}: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.accent;
  return (
    <IconBase size={size}>
      <Rect
        x="3.5"
        y="3.5"
        width="6"
        height="6"
        rx="1.2"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Rect
        x="3.5"
        y="14.5"
        width="6"
        height="6"
        rx="1.2"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Rect
        x="14.5"
        y="3.5"
        width="6"
        height="6"
        rx="1.2"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Path
        d="M14.5 14.5h3v3M20.5 20.5v-3M17.5 20.5h3"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}
