import { Path } from "react-native-svg";

import { Brand } from "@/constants/theme";
import { IconBase, type IconProps } from "@/components/icons/icon-base";

export function CodeBadgeIcon({
  size = 24,
  color = Brand.coin,
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <IconBase size={size}>
      <Path
        d="M9 8.5 5.5 12 9 15.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15 8.5 18.5 12 15 15.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.2 5.5 10.8 18.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </IconBase>
  );
}
