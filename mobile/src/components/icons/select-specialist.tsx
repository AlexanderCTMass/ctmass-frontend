import { Circle, Path } from "react-native-svg";

import { Brand } from "@/constants/theme";
import { IconBase, type IconProps } from "@/components/icons/icon-base";

export function SelectSpecialistIcon({
  size = 24,
  color = Brand.primaryLight,
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <IconBase size={size}>
      <Circle
        cx="10"
        cy="7.5"
        r="3.5"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Path
        d="M3.5 20.5c0-3.6 2.9-6.5 6.5-6.5h1.2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M14 17.6l2.2 2.2 4.3-4.4"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}
