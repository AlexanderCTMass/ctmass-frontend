import { Path } from "react-native-svg";

import { IconBase, type IconProps } from "@/components/icons/icon-base";
import { Colors } from "@/constants/theme";

export function DoubleCheckIcon({
  size = 24,
  color = Colors.text,
  strokeWidth = 2,
}: IconProps) {
  return (
    <IconBase size={size}>
      <Path
        d="M2 12.5 6 16.5 14 7.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11 15.5 12 16.5 20 7.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}
