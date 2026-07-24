import { Circle, Path } from "react-native-svg";

import { Brand } from "@/constants/theme";
import { IconBase, type IconProps } from "@/components/icons/icon-base";

export function TagIcon({
  size = 24,
  color = Brand.primaryLight,
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <IconBase size={size}>
      <Path
        d="M3.8 12.6V5.4a1.6 1.6 0 0 1 1.6-1.6h7.2c.42 0 .83.17 1.13.47l6.4 6.4a1.6 1.6 0 0 1 0 2.26l-7.2 7.2a1.6 1.6 0 0 1-2.26 0l-6.4-6.4a1.6 1.6 0 0 1-.47-1.13Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <Circle cx="8.6" cy="8.6" r="1.6" fill={color} />
    </IconBase>
  );
}
