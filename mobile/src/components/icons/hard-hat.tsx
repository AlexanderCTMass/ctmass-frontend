import { Path } from "react-native-svg";

import { Brand } from "@/constants/theme";
import { IconBase, type IconProps } from "@/components/icons/icon-base";

export function HardHatIcon({
  size = 24,
  color = Brand.primaryLight,
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <IconBase size={size}>
      <Path
        d="M3 17.5h18"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M5.6 17.5v-3.2a6.4 6.4 0 0 1 12.8 0v3.2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <Path
        d="M9.8 8.7V6.1a2.2 2.2 0 0 1 4.4 0v2.6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </IconBase>
  );
}
