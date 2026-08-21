import { Path, Rect } from "react-native-svg";

import { Colors } from "@/constants/theme";
import { IconBase, type IconProps } from "@/components/icons/icon-base";

export function LockIcon({
  size = 24,
  color = Colors.text,
  strokeWidth = 2,
}: IconProps) {
  return (
    <IconBase size={size}>
      <Rect
        x="4.75"
        y="10.5"
        width="14.5"
        height="9.25"
        rx="2.4"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Path
        d="M8 10.5V7.75a4 4 0 0 1 8 0V10.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M12 13.75v2.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </IconBase>
  );
}
