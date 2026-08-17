import { Circle, Path } from "react-native-svg";

import { Brand } from "@/constants/theme";
import { IconBase, type IconProps } from "@/components/icons/icon-base";

export function UsersIcon({
  size = 24,
  color = Brand.primaryLight,
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <IconBase size={size}>
      <Circle cx="9" cy="8" r="3.3" stroke={color} strokeWidth={strokeWidth} />
      <Path
        d="M3.5 19a5.5 5.5 0 0 1 11 0"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M15.5 5.1a3.3 3.3 0 0 1 0 5.8"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M17 13.2a5.5 5.5 0 0 1 3.5 5.1"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </IconBase>
  );
}
