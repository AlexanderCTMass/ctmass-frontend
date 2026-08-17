import { Path } from "react-native-svg";

import { Brand } from "@/constants/theme";
import { IconBase, type IconProps } from "@/components/icons/icon-base";

export function BellIcon({
  size = 24,
  color = Brand.primaryLight,
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <IconBase size={size}>
      <Path
        d="M6 9.5a6 6 0 0 1 12 0c0 4.2 1.6 5.5 2.2 6H3.8c.6-.5 2.2-1.8 2.2-6Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <Path
        d="M9.8 19a2.2 2.2 0 0 0 4.4 0"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </IconBase>
  );
}
