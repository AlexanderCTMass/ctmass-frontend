import { Circle, Path } from "react-native-svg";

import { Brand } from "@/constants/theme";
import { IconBase, type IconProps } from "@/components/icons/icon-base";

export function UserIcon({
  size = 24,
  color = Brand.primaryLight,
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <IconBase size={size}>
      <Circle cx="12" cy="8" r="3.7" stroke={color} strokeWidth={strokeWidth} />
      <Path
        d="M4.75 19.5a7.25 7.25 0 0 1 14.5 0"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </IconBase>
  );
}
