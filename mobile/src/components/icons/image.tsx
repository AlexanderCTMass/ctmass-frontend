import { Circle, Path, Rect } from "react-native-svg";

import { IconBase, type IconProps } from "@/components/icons/icon-base";
import { Colors } from "@/constants/theme";

export function ImageIcon({
  size = 24,
  color = Colors.text,
  strokeWidth = 1.9,
}: IconProps) {
  return (
    <IconBase size={size}>
      <Rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="3"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Circle
        cx="8.5"
        cy="9"
        r="1.6"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Path
        d="M4 16.5 9 12l4 3.5 3-2.5 4 3.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}
